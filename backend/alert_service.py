"""
Serviço de alertas de preço com verificação diária
Implementação idempotente com controle de cooldown
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

# Configurações de cooldown
ALERT_COOLDOWN_HOURS = 24  # Não enviar o mesmo alerta mais de 1x por dia
MIN_CHECK_INTERVAL_MINUTES = 60  # Intervalo mínimo entre verificações do mesmo alerta


def set_database(database):
    """Injeta a conexão do banco de dados"""
    global db
    db = database


def set_email_function(email_func):
    """Injeta a função de envio de email"""
    global send_email_func
    send_email_func = email_func


def _is_within_cooldown(alert: Dict, cooldown_hours: int = ALERT_COOLDOWN_HOURS) -> bool:
    """Verifica se o alerta ainda está em período de cooldown"""
    last_sent = alert.get("last_sent_at")
    if not last_sent:
        return False
    
    try:
        if isinstance(last_sent, str):
            last_sent_dt = datetime.fromisoformat(last_sent.replace('Z', '+00:00'))
        else:
            last_sent_dt = last_sent
        
        cooldown_end = last_sent_dt + timedelta(hours=cooldown_hours)
        return datetime.now(timezone.utc) < cooldown_end
    except Exception as e:
        logger.error(f"Error parsing last_sent_at: {e}")
        return False


def _should_check_alert(alert: Dict) -> bool:
    """Verifica se o alerta deve ser verificado (baseado no intervalo mínimo)"""
    last_checked = alert.get("last_checked")
    if not last_checked:
        return True
    
    try:
        if isinstance(last_checked, str):
            last_checked_dt = datetime.fromisoformat(last_checked.replace('Z', '+00:00'))
        else:
            last_checked_dt = last_checked
        
        min_interval = timedelta(minutes=MIN_CHECK_INTERVAL_MINUTES)
        return datetime.now(timezone.utc) >= last_checked_dt + min_interval
    except Exception as e:
        logger.error(f"Error parsing last_checked: {e}")
        return True


async def check_price_alerts(force: bool = False):
    """
    Verifica todos os alertas de preço ativos
    Envia email quando preço atinge o valor desejado
    
    Args:
        force: Se True, ignora cooldown e intervalo mínimo
    
    Returns:
        Dict com resultados da verificação
    """
    if db is None:
        logger.error("Database not connected")
        return {"error": "Database not connected"}
    
    # Gerar ID único para esta execução (para idempotência)
    execution_id = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    
    # Buscar alertas ativos
    alerts = await db.price_alerts.find(
        {"is_active": True},
        {"_id": 0}
    ).to_list(1000)
    
    logger.info(f"[{execution_id}] Checking {len(alerts)} active price alerts")
    
    results = {
        "execution_id": execution_id,
        "started_at": datetime.now(timezone.utc).isoformat(),
        "total_alerts": len(alerts),
        "alerts_checked": 0,
        "alerts_skipped_cooldown": 0,
        "alerts_skipped_interval": 0,
        "alerts_triggered": 0,
        "emails_sent": 0,
        "alerts_updated": 0,
        "errors": 0
    }
    
    for alert in alerts:
        try:
            alert_id = alert.get("id")
            
            # Verificar cooldown (não enviar duplicados)
            if not force and _is_within_cooldown(alert):
                logger.debug(f"[{execution_id}] Alert {alert_id} in cooldown, skipping")
                results["alerts_skipped_cooldown"] += 1
                continue
            
            # Verificar intervalo mínimo entre checagens
            if not force and not _should_check_alert(alert):
                logger.debug(f"[{execution_id}] Alert {alert_id} checked recently, skipping")
                results["alerts_skipped_interval"] += 1
                continue
            
            results["alerts_checked"] += 1
            
            # Buscar preço atual do produto
            products = await search_google_shopping(
                alert["product_name"],
                num_results=5,
                use_cache=False  # Não usar cache para alertas
            )
            
            if not products:
                logger.warning(f"[{execution_id}] No products found for alert: {alert['product_name']}")
                continue
            
            # Encontrar o menor preço
            prices = [p["price"] for p in products if p.get("price")]
            if not prices:
                continue
                
            best_price = min(prices)
            best_product = next(p for p in products if p.get("price") == best_price)
            
            # Atualizar preço atual no alerta
            update_data = {
                "current_price": best_price,
                "last_checked": datetime.now(timezone.utc).isoformat(),
                "best_store": best_product.get("store", ""),
                "product_link": best_product.get("link", ""),
                "check_count": alert.get("check_count", 0) + 1
            }
            
            await db.price_alerts.update_one(
                {"id": alert_id},
                {"$set": update_data}
            )
            results["alerts_updated"] += 1
            
            # Verificar se atingiu o preço alvo
            if best_price <= alert["target_price"]:
                logger.info(f"[{execution_id}] Alert triggered! {alert['product_name']} at R${best_price} (target: R${alert['target_price']})")
                results["alerts_triggered"] += 1
                
                # Buscar dados do usuário
                user = await db.users.find_one(
                    {"id": alert["user_id"]},
                    {"_id": 0, "name": 1, "email": 1, "email_preferences": 1}
                )
                
                if not user:
                    logger.warning(f"[{execution_id}] User not found for alert {alert_id}")
                    continue
                
                # Verificar preferências de email
                if not user.get("email_preferences", {}).get("price_alerts", True):
                    logger.info(f"[{execution_id}] User {user['email']} has price alerts disabled")
                    continue
                
                # Enviar email de alerta
                if send_email_func:
                    try:
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
                        
                        # Marcar como enviado (para cooldown)
                        await db.price_alerts.update_one(
                            {"id": alert_id},
                            {
                                "$set": {
                                    "last_sent_at": datetime.now(timezone.utc).isoformat(),
                                    "triggered_at": datetime.now(timezone.utc).isoformat(),
                                    "triggered_price": best_price
                                },
                                "$inc": {"sent_count": 1}
                            }
                        )
                        
                        results["emails_sent"] += 1
                        logger.info(f"[{execution_id}] Alert email sent to {user['email']}")
                        
                    except Exception as email_error:
                        logger.error(f"[{execution_id}] Failed to send email: {email_error}")
                        results["errors"] += 1
                else:
                    logger.warning(f"[{execution_id}] Email function not configured")
                
        except Exception as e:
            logger.error(f"[{execution_id}] Error checking alert {alert.get('id')}: {e}")
            results["errors"] += 1
    
    results["completed_at"] = datetime.now(timezone.utc).isoformat()
    
    # Registrar execução no histórico
    await db.alert_check_logs.insert_one({
        **results,
        "_id": execution_id
    })
    
    logger.info(f"[{execution_id}] Price check complete: checked={results['alerts_checked']}, triggered={results['alerts_triggered']}, sent={results['emails_sent']}")
    return results


async def check_favorite_prices():
    """
    Verifica preços de produtos favoritados
    Envia email quando há queda significativa de preço (>10%)
    """
    if db is None:
        return {"error": "Database not connected"}
    
    execution_id = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    
    # Buscar usuários com favoritos
    users = await db.users.find(
        {"favorites.products": {"$exists": True, "$ne": []}},
        {"_id": 0, "id": 1, "name": 1, "email": 1, "favorites": 1, "email_preferences": 1}
    ).to_list(1000)
    
    results = {
        "execution_id": execution_id,
        "users_checked": len(users),
        "favorites_checked": 0,
        "alerts_sent": 0,
        "errors": 0
    }
    
    for user in users:
        if not user.get("email_preferences", {}).get("favorite_alerts", True):
            continue
        
        for favorite in user.get("favorites", {}).get("products", []):
            try:
                results["favorites_checked"] += 1
                
                # Buscar preço atual
                products = await search_google_shopping(
                    favorite.get("name", ""),
                    num_results=3
                )
                
                if not products:
                    continue
                
                prices = [p["price"] for p in products if p.get("price")]
                if not prices:
                    continue
                    
                best_price = min(prices)
                old_price = favorite.get("best_price", best_price)
                
                # Verificar se houve queda significativa (>10%)
                if old_price and best_price < old_price * 0.9:
                    best_product = next(p for p in products if p.get("price") == best_price)
                    
                    # Verificar cooldown para este favorito
                    last_notified = favorite.get("last_price_notification")
                    if last_notified:
                        try:
                            last_dt = datetime.fromisoformat(last_notified.replace('Z', '+00:00'))
                            if datetime.now(timezone.utc) < last_dt + timedelta(hours=ALERT_COOLDOWN_HOURS):
                                continue  # Em cooldown
                        except:
                            pass
                    
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
                    
                    # Atualizar preço e timestamp no favorito
                    await db.users.update_one(
                        {"id": user["id"], "favorites.products.item_id": favorite.get("item_id")},
                        {"$set": {
                            "favorites.products.$.best_price": best_price,
                            "favorites.products.$.last_price_notification": datetime.now(timezone.utc).isoformat()
                        }}
                    )
                    
            except Exception as e:
                logger.error(f"[{execution_id}] Error checking favorite: {e}")
                results["errors"] += 1
    
    return results


async def get_alert_check_history(limit: int = 10) -> List[Dict]:
    """Retorna histórico de verificações de alertas"""
    if db is None:
        return []
    
    logs = await db.alert_check_logs.find(
        {},
        {"_id": 0}
    ).sort("started_at", -1).limit(limit).to_list(limit)
    
    return logs
