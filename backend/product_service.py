"""
Serviço de busca de produtos via SerpAPI (Google Shopping)
Com sistema de cache para otimização de custos
"""

import os
import httpx
import asyncio
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

# Configurações
SERPAPI_KEY = os.environ.get('SERPAPI_KEY', '')
SERPAPI_BASE_URL = "https://serpapi.com/search"
CACHE_DURATION_HOURS = int(os.environ.get('CACHE_DURATION_HOURS', 24))

# Conexão MongoDB (será injetada)
db = None

def set_database(database):
    """Injeta a conexão do banco de dados"""
    global db
    db = database


async def get_cached_search(query: str, category: Optional[str] = None) -> Optional[Dict]:
    """Busca resultado em cache"""
    if db is None:
        return None
    
    cache_key = f"{query}_{category or 'all'}".lower().strip()
    cache_entry = await db.search_cache.find_one(
        {"cache_key": cache_key},
        {"_id": 0}
    )
    
    if cache_entry:
        cached_at = datetime.fromisoformat(cache_entry["cached_at"])
        expires_at = cached_at + timedelta(hours=CACHE_DURATION_HOURS)
        
        if datetime.now(timezone.utc) < expires_at:
            logger.info(f"Cache hit for: {cache_key}")
            return cache_entry["results"]
        else:
            # Cache expirado, remover
            await db.search_cache.delete_one({"cache_key": cache_key})
    
    return None


async def save_to_cache(query: str, category: Optional[str], results: List[Dict]):
    """Salva resultado no cache"""
    if db is None:
        return
    
    cache_key = f"{query}_{category or 'all'}".lower().strip()
    
    await db.search_cache.update_one(
        {"cache_key": cache_key},
        {
            "$set": {
                "cache_key": cache_key,
                "query": query,
                "category": category,
                "results": results,
                "cached_at": datetime.now(timezone.utc).isoformat(),
                "result_count": len(results)
            }
        },
        upsert=True
    )
    logger.info(f"Cached {len(results)} results for: {cache_key}")


async def search_google_shopping(
    query: str,
    category: Optional[str] = None,
    num_results: int = 20,
    use_cache: bool = True
) -> List[Dict]:
    """
    Busca produtos no Google Shopping via SerpAPI
    
    Args:
        query: Termo de busca
        category: Categoria opcional para filtrar
        num_results: Número de resultados desejados
        use_cache: Se deve usar cache (default: True)
    
    Returns:
        Lista de produtos com preço, loja e link
    """
    
    # Verificar cache primeiro
    if use_cache:
        cached = await get_cached_search(query, category)
        if cached:
            return cached
    
    if not SERPAPI_KEY:
        logger.error("SERPAPI_KEY not configured")
        return []
    
    # Preparar query com categoria se fornecida
    search_query = query
    if category:
        category_map = {
            "smartphones": "celular smartphone",
            "tvs": "smart tv televisão",
            "notebooks": "notebook laptop",
            "games": "video game console",
            "eletrodomesticos": "eletrodoméstico",
            "acessorios": "acessório eletrônico"
        }
        if category in category_map:
            search_query = f"{query} {category_map[category]}"
    
    # Parâmetros da requisição
    params = {
        "engine": "google_shopping",
        "q": search_query,
        "location": "Brazil",
        "hl": "pt",
        "gl": "br",
        "num": num_results,
        "api_key": SERPAPI_KEY
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(SERPAPI_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
        
        # Processar resultados
        products = []
        shopping_results = data.get("shopping_results", [])
        
        for item in shopping_results[:num_results]:
            # Obter URL da oferta - prioriza link, depois product_link
            offer_link = item.get("link") or item.get("product_link") or ""
            
            product = {
                "id": item.get("product_id", str(hash(item.get("title", "")))),
                "name": item.get("title", ""),
                "price": extract_price(item.get("extracted_price") or item.get("price")),
                "original_price": extract_price(item.get("extracted_old_price")),
                "image": item.get("thumbnail", ""),
                "store": item.get("source", ""),
                "link": offer_link,
                "rating": item.get("rating"),
                "reviews": item.get("reviews"),
                "delivery": item.get("delivery", ""),
                "badge": item.get("badge", ""),  # Ex: "Frete Grátis"
                # Campo preparado para afiliados futuramente
                "affiliate_link": None,
                "affiliate_tag": None
            }
            
            # Só adicionar se tiver preço válido
            if product["price"] and product["price"] > 0:
                products.append(product)
        
        # Salvar no cache
        if use_cache and products:
            await save_to_cache(query, category, products)
        
        logger.info(f"SerpAPI returned {len(products)} products for: {search_query}")
        return products
        
    except httpx.HTTPStatusError as e:
        logger.error(f"SerpAPI HTTP error: {e.response.status_code} - {e.response.text}")
        return []
    except Exception as e:
        logger.error(f"SerpAPI error: {e}")
        return []


def extract_price(price_value) -> Optional[float]:
    """Extrai valor numérico do preço"""
    if price_value is None:
        return None
    
    if isinstance(price_value, (int, float)):
        return float(price_value)
    
    if isinstance(price_value, str):
        # Remover símbolos e converter
        import re
        # Remove R$, espaços, pontos de milhar e converte vírgula para ponto
        cleaned = re.sub(r'[R$\s]', '', price_value)
        cleaned = cleaned.replace('.', '').replace(',', '.')
        try:
            return float(cleaned)
        except ValueError:
            return None
    
    return None


async def get_product_details(product_id: str) -> Optional[Dict]:
    """
    Busca detalhes de um produto específico
    Primeiro tenta no cache, depois faz nova busca se necessário
    """
    if db is None:
        return None
    
    # Buscar em todos os caches
    cache_entries = await db.search_cache.find({}).to_list(100)
    
    for entry in cache_entries:
        for product in entry.get("results", []):
            if product.get("id") == product_id:
                return product
    
    return None


async def get_popular_products(limit: int = 12) -> List[Dict]:
    """
    Retorna produtos populares (busca por termos populares)
    Usa cache sempre que possível
    """
    popular_queries = [
        "iPhone",
        "Samsung Galaxy",
        "Smart TV 55",
        "PlayStation 5",
        "Airfryer",
        "Notebook"
    ]
    
    all_products = []
    
    for query in popular_queries:
        products = await search_google_shopping(query, num_results=4)
        all_products.extend(products)
        
        if len(all_products) >= limit:
            break
    
    return all_products[:limit]


async def get_cache_stats() -> Dict:
    """Retorna estatísticas do cache"""
    if db is None:
        return {"error": "Database not connected"}
    
    total_entries = await db.search_cache.count_documents({})
    
    # Buscar todas as entradas para calcular estatísticas
    entries = await db.search_cache.find({}, {"_id": 0, "cached_at": 1, "result_count": 1}).to_list(1000)
    
    total_products = sum(e.get("result_count", 0) for e in entries)
    
    # Calcular entradas válidas vs expiradas
    now = datetime.now(timezone.utc)
    valid_entries = 0
    for entry in entries:
        cached_at = datetime.fromisoformat(entry["cached_at"])
        if now < cached_at + timedelta(hours=CACHE_DURATION_HOURS):
            valid_entries += 1
    
    return {
        "total_cache_entries": total_entries,
        "valid_entries": valid_entries,
        "expired_entries": total_entries - valid_entries,
        "total_cached_products": total_products,
        "cache_duration_hours": CACHE_DURATION_HOURS
    }


async def clear_expired_cache():
    """Remove entradas de cache expiradas"""
    if db is None:
        return 0
    
    cutoff = datetime.now(timezone.utc) - timedelta(hours=CACHE_DURATION_HOURS)
    result = await db.search_cache.delete_many({
        "cached_at": {"$lt": cutoff.isoformat()}
    })
    
    logger.info(f"Cleared {result.deleted_count} expired cache entries")
    return result.deleted_count
