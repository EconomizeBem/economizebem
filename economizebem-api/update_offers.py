#!/usr/bin/env python3
"""
Script para atualizar ofertas Amazon usando a API oficial (Creators API / PA-API).
Lê ASINs de asins.csv e gera offers.json.

Requer variáveis de ambiente:
- AMAZON_ACCESS_KEY: Chave de acesso da API
- AMAZON_SECRET_KEY: Chave secreta da API
- AMAZON_ASSOCIATE_TAG: Tag de associado (padrão: economizebe0b-20)
- AMAZON_COUNTRY: País (padrão: BR)

Executar via Cron Job no Render: 2x ao dia (08:00 e 20:00 BRT)
"""

import os
import csv
import json
import time
import logging
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional
from zoneinfo import ZoneInfo

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Configurações
TRACKING_ID = os.environ.get("AMAZON_ASSOCIATE_TAG", "economizebe0b-20")
ACCESS_KEY = os.environ.get("AMAZON_ACCESS_KEY", "")
SECRET_KEY = os.environ.get("AMAZON_SECRET_KEY", "")
COUNTRY = os.environ.get("AMAZON_COUNTRY", "BR")

ASINS_FILE = "asins.csv"
OFFERS_FILE = "offers.json"

# Timezone Brasil
BRT = ZoneInfo("America/Sao_Paulo")

# Categorias válidas
VALID_CATEGORIES = [
    "smartphones", "tv", "linha_branca", "eletrodomesticos", 
    "acessorios", "outros"
]


def read_asins_csv(filepath: str) -> list[dict]:
    """Lê ASINs do arquivo CSV com categoria e prioridade."""
    asins = []
    path = Path(filepath)
    
    if not path.exists():
        logger.error(f"Arquivo {filepath} não encontrado!")
        return asins
    
    with open(path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            asin = row.get('asin', '').strip()
            category = row.get('category', 'outros').strip()
            priority = int(row.get('priority', 5))
            
            if asin:
                if category not in VALID_CATEGORIES:
                    category = 'outros'
                asins.append({
                    'asin': asin,
                    'category': category,
                    'priority': max(1, min(10, priority))
                })
    
    return asins


def generate_affiliate_url(asin: str) -> str:
    """Gera URL de afiliado para o ASIN."""
    return f"https://www.amazon.com.br/dp/{asin}/?tag={TRACKING_ID}"


def calculate_discount(price: Optional[float], list_price: Optional[float]) -> Optional[int]:
    """Calcula percentual de desconto."""
    if price and list_price and list_price > price:
        discount = ((list_price - price) / list_price) * 100
        return int(round(discount))
    return None


def fetch_products_from_api(asins_data: list[dict]) -> list[dict]:
    """
    Busca dados dos produtos na Amazon PA-API / Creators API.
    Retorna lista de produtos com informações completas.
    """
    items = []
    
    # Verificar se temos credenciais
    if not ACCESS_KEY or not SECRET_KEY:
        logger.warning("Credenciais da API Amazon não configuradas.")
        logger.warning("Configure AMAZON_ACCESS_KEY e AMAZON_SECRET_KEY no Render.")
        logger.warning("Usando dados placeholder. Os dados reais aparecerão após configurar as credenciais.")
        return create_fallback_items(asins_data)
    
    try:
        from amazon_paapi import AmazonApi
        
        # Inicializar API
        amazon = AmazonApi(
            ACCESS_KEY,
            SECRET_KEY,
            TRACKING_ID,
            COUNTRY,
            throttling=1  # 1 request por segundo para evitar rate limit
        )
        
        # Processar em lotes de 10 (limite da API)
        asin_list = [item['asin'] for item in asins_data]
        asin_map = {item['asin']: item for item in asins_data}
        
        for i in range(0, len(asin_list), 10):
            batch = asin_list[i:i+10]
            logger.info(f"Buscando lote {i//10 + 1}: {len(batch)} produtos")
            
            try:
                products = amazon.get_items(
                    batch,
                    item_count=10,
                    resources=[
                        'ItemInfo.Title',
                        'Images.Primary.Large',
                        'Offers.Listings.Price',
                        'Offers.Listings.SavingBasis',
                        'Offers.Listings.Availability.Type',
                        'Offers.Listings.Availability.Message'
                    ]
                )
                
                for product in products:
                    asin = product.asin
                    meta = asin_map.get(asin, {'category': 'outros', 'priority': 5})
                    
                    # Extrair dados
                    title = None
                    image_url = None
                    price = None
                    list_price = None
                    availability = "Disponível"
                    
                    if product.item_info and product.item_info.title:
                        title = product.item_info.title.display_value
                    
                    if product.images and product.images.primary and product.images.primary.large:
                        image_url = product.images.primary.large.url
                    
                    if product.offers and product.offers.listings:
                        listing = product.offers.listings[0]
                        if listing.price:
                            price = listing.price.amount
                        if listing.saving_basis:
                            list_price = listing.saving_basis.amount
                        if listing.availability:
                            availability = listing.availability.message or "Disponível"
                    
                    discount_pct = calculate_discount(price, list_price)
                    
                    items.append({
                        'asin': asin,
                        'category': meta['category'],
                        'priority': meta['priority'],
                        'title': title or f"Produto Amazon ({asin})",
                        'image_url': image_url,
                        'price': price,
                        'list_price': list_price,
                        'discount_pct': discount_pct,
                        'affiliate_url': generate_affiliate_url(asin),
                        'availability': availability
                    })
                
                # Aguardar para respeitar rate limit
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Erro ao buscar lote: {e}")
                # Adicionar itens de fallback para este lote
                for asin in batch:
                    meta = asin_map.get(asin, {'category': 'outros', 'priority': 5})
                    items.append(create_fallback_item(asin, meta))
                continue
        
    except ImportError:
        logger.warning("Biblioteca amazon_paapi não instalada.")
        logger.warning("Execute: pip install python-amazon-paapi")
        return create_fallback_items(asins_data)
    except Exception as e:
        logger.error(f"Erro na API Amazon: {e}")
        return create_fallback_items(asins_data)
    
    return items


def create_fallback_item(asin: str, meta: dict) -> dict:
    """Cria item placeholder quando a API não está disponível."""
    return {
        'asin': asin,
        'category': meta.get('category', 'outros'),
        'priority': meta.get('priority', 5),
        'title': f"Produto Amazon ({asin})",
        'image_url': f"https://via.placeholder.com/300x300?text={asin}",
        'price': None,
        'list_price': None,
        'discount_pct': None,
        'affiliate_url': generate_affiliate_url(asin),
        'availability': "Verificar na Amazon"
    }


def create_fallback_items(asins_data: list[dict]) -> list[dict]:
    """Cria lista de itens placeholder."""
    return [create_fallback_item(item['asin'], item) for item in asins_data]


def sort_items(items: list[dict]) -> list[dict]:
    """
    Ordena itens conforme especificado:
    1) discount_pct desc (itens sem desconto vão pro final)
    2) priority desc
    3) price desc
    """
    def sort_key(item):
        # Itens COM desconto vêm primeiro (maior desconto = menor valor negativo)
        # Itens SEM desconto vão pro final (discount = 0 ou None)
        discount = item.get('discount_pct')
        has_discount = 1 if discount and discount > 0 else 0
        discount_val = discount if discount else 0
        
        priority = item.get('priority', 5)
        price = item.get('price') or 0
        
        # Ordenação: -has_discount (com desconto primeiro), -discount, -priority, -price
        return (-has_discount, -discount_val, -priority, -price)
    
    return sorted(items, key=sort_key)


def update_offers():
    """Função principal que atualiza o arquivo de ofertas."""
    now_utc = datetime.now(timezone.utc)
    now_brt = now_utc.astimezone(BRT)
    
    logger.info(f"Iniciando atualização de ofertas...")
    logger.info(f"Horário UTC: {now_utc.isoformat()}")
    logger.info(f"Horário BRT: {now_brt.strftime('%d/%m/%Y %H:%M')}")
    
    # Ler ASINs
    asins_data = read_asins_csv(ASINS_FILE)
    logger.info(f"Total de ASINs encontrados: {len(asins_data)}")
    
    if not asins_data:
        logger.error("Nenhum ASIN encontrado. Abortando.")
        return
    
    # Buscar produtos da API
    items = fetch_products_from_api(asins_data)
    logger.info(f"Produtos obtidos: {len(items)}")
    
    # Ordenar itens
    items = sort_items(items)
    
    # Metadados
    offers_data = {
        "updated_at": now_utc.isoformat(),
        "updated_at_local": now_brt.strftime("%H:%M"),
        "disclaimer": "Os preços e a disponibilidade dos produtos estão corretos na data/horário indicados e poderão sofrer alterações.",
        "tracking_tag": TRACKING_ID,
        "total_items": len(items),
        "categories": VALID_CATEGORIES,
        "items": items
    }
    
    # Salvar offers.json
    with open(OFFERS_FILE, 'w', encoding='utf-8') as f:
        json.dump(offers_data, f, ensure_ascii=False, indent=2)
    
    logger.info(f"Arquivo {OFFERS_FILE} atualizado com {len(items)} ofertas.")
    logger.info("Atualização concluída!")


if __name__ == "__main__":
    update_offers()
