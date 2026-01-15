"""
Serviço de alertas de preço com verificação diária
"""

import os
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Dict, Optional
from motor.motor_asyncio import AsyncIOMotorClient

from product_service import search_google_shopping, extract_price
from email_templates import price_alert_email

logger = logging.getLogger(__name__)

# Conexão MongoDB (será injetada)
db = None
send_email_func = None

def set_database(database):
    """Injeta a conexão do banco de dados"""
    global db
    db = database

def set_email_function(email_func):
    """Injeta a função de envio de email"""
    global send_email_func
    send_email_func = email_func


async def check_price_alerts():
    """
    Verifica todos os alertas de preço ativos
    Envia email quando preço atinge o valor desejado
    """
    if db is None:
        logger.error("Database not connected")
        return {"error": "Database not connected"}
    
    # Buscar alertas ativos
    alerts = await db.price_alerts.find(
        {"is_active": True},
        {"_id": 0}
    ).to_list(1000)
    
    logger.info(f"Checking {len(alerts)} active price alerts")
    
    results = {
        "total_checked": len(alerts),
        "alerts_triggered": 0,
        "alerts_updated": 0,
        "errors": 0
    }
    
    for alert in alerts:
        try:
            # Buscar preço atual do produto
            products = await search_google_shopping(
                alert["product_name"],
                num_results=5,
                use_cache=False  # Não usar cache para alertas
            )
            
            if not products:
                logger.warning(f"No products found for alert: {alert['product_name']}")
                continue
            
            # Encontrar o menor preço
            best_price = min(p["price"] for p in products if p.get("price"))
            best_product = next(p for p in products if p.get("price") == best_price)
            
            # Atualizar preço atual no alerta
            await db.price_alerts.update_one(
                {"id": alert["id"]},
                {
                    "$set": {
                        "current_price": best_price,
                        "last_checked": datetime.now(timezone.utc).isoformat(),
                        "best_store": best_product.get("store", ""),
                        "product_link": best_product.get("link", "")
                    }
                }
            )
            results["alerts_updated"] += 1
            
            # Verificar se atingiu o preço alvo
            if best_price <= alert["target_price"]:
                logger.info(f"Alert triggered! {alert['product_name']} at R${best_price}")
                
                # Buscar dados do usuário
                user = await db.users.find_one(
                    {"id": alert["user_id"]},
                    {"_id": 0, "name": 1, "email": 1, "email_preferences": 1}
                )
                
                if user and user.get("email_preferences", {}).get("price_alerts", True):
                    # Enviar email de alerta
                    if send_email_func:
                        email_data = price_alert_email(
                            user_name=user["name"],
                            product_name=alert["product_name"],
                            product_image=alert.get("product_image", best_product.get("image", "")),
                            old_price=alert.get("current_price", alert["target_price"] * 1.2),
                            new_price=best_price,
                            store=best_product.get("store", ""),
                            product_url=best_product.get("link", "")
                        )
                        await send_email_func(
                            user["email"],
                            email_data["subject"],
                            email_data["html"]
                        )
                        logger.info(f"Alert email sent to {user['email']}")
                
                # Marcar alerta como disparado (opcional: desativar)
                await db.price_alerts.update_one(
                    {"id": alert["id"]},
                    {
                        "$set": {
                            "triggered_at": datetime.now(timezone.utc).isoformat(),
                            "triggered_price": best_price
                        }
                    }
                )
                results["alerts_triggered"] += 1
                
        except Exception as e:
            logger.error(f"Error checking alert {alert.get('id')}: {e}")
            results["errors"] += 1
    
    # Registrar execução
    await db.alert_check_logs.insert_one({
        "checked_at": datetime.now(timezone.utc).isoformat(),
        "results": results
    })
    
    logger.info(f"Price check complete: {results}")
    return results


async def check_favorite_prices():
    """
    Verifica preços de produtos favoritados
    Envia email quando há queda significativa de preço (>10%)
    """
    if db is None:
        return {"error": "Database not connected"}
    
    # Buscar usuários com favoritos
    users = await db.users.find(
        {"favorites.products": {"$exists": True, "$ne": []}},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "favorites": 1, "email_preferences": 1}
    ).to_list(1000)
    
    results = {
        "users_checked": len(users),
        "alerts_sent": 0
    }
    
    for user in users:
        if not user.get("email_preferences", {}).get("favorite_alerts", True):
            continue
        
        for favorite in user.get("favorites", {}).get("products", []):
            try:
                # Buscar preço atual
                products = await search_google_shopping(
                    favorite.get("name", ""),
                    num_results=3
                )
                
                if not products:
                    continue
                
                best_price = min(p["price"] for p in products if p.get("price"))
                old_price = favorite.get("best_price", best_price)
                
                # Verificar se houve queda significativa (>10%)
                if old_price and best_price < old_price * 0.9:
                    best_product = next(p for p in products if p.get("price") == best_price)
                    
                    # Importar template
                    from email_templates import favorite_price_drop_email
                    
                    if send_email_func:
                        email_data = favorite_price_drop_email(
                            user_name=user["name"],
                            product_name=favorite.get("name", ""),
                            product_image=favorite.get("image", best_product.get("image", "")),
                            old_price=old_price,
                            new_price=best_price,
                            store=best_product.get("store", ""),
                            product_url=best_product.get("link", "")
                        )
                        await send_email_func(
                            user["email"],
                            email_data["subject"],
                            email_data["html"]
                        )
                        results["alerts_sent"] += 1
                    
                    # Atualizar preço no favorito
                    await db.users.update_one(
                        {"id": user["id"], "favorites.products.item_id": favorite.get("item_id")},
                        {"$set": {"favorites.products.$.best_price": best_price}}
                    )
                    
            except Exception as e:
                logger.error(f"Error checking favorite: {e}")
    
    return results


async def get_alert_check_history(limit: int = 10) -> List[Dict]:
    """Retorna histórico de verificações de alertas"""
    if db is None:
        return []
    
    logs = await db.alert_check_logs.find(
        {},
        {"_id": 0}
    ).sort("checked_at", -1).limit(limit).to_list(limit)
    
    return logs
