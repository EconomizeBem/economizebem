"""
Serviço de busca de produtos via SerpAPI (Google Shopping)
Com sistema de cache agressivo e paginação otimizada para minimizar consumo da API
"""

import os
import httpx
import asyncio
import hashlib
import logging
from datetime import datetime, timezone, timedelta
from typing import Optional, List, Dict, Any, Tuple
from motor.motor_asyncio import AsyncIOMotorClient
from pathlib import Path
from dotenv import load_dotenv
from collections import defaultdict
import time

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

logger = logging.getLogger(__name__)

# Configurações
SERPAPI_KEY = os.environ.get('SERPAPI_KEY', '')
SERPAPI_BASE_URL = "https://serpapi.com/search"
CACHE_DURATION_HOURS = int(os.environ.get('CACHE_DURATION_HOURS', 24))
MAX_PAGE = 3  # Máximo de páginas permitidas
DEFAULT_PAGE_SIZE = 20
MAX_PAGE_SIZE = 20

# Conexão MongoDB (será injetada)
db = None

# Rate limiting em memória
_rate_limit_cache: Dict[str, List[float]] = defaultdict(list)
_debounce_cache: Dict[str, float] = {}

# Métricas de busca
_search_metrics = {
    "api_calls": 0,
    "cache_hits": 0,
    "cache_misses": 0,
    "rate_limited": 0
}


def set_database(database):
    """Injeta a conexão do banco de dados"""
    global db
    db = database


def generate_cache_key(query: str, category: Optional[str], page: int, page_size: int) -> str:
    """Gera chave única de cache baseada nos parâmetros"""
    key_string = f"{query.lower().strip()}_{category or 'all'}_{page}_{page_size}"
    return hashlib.md5(key_string.encode()).hexdigest()


def check_rate_limit(ip: str, max_requests: int = 10, window_seconds: int = 60) -> bool:
    """
    Verifica rate limit por IP
    Retorna True se permitido, False se bloqueado
    """
    now = time.time()
    window_start = now - window_seconds
    
    # Limpar requests antigos
    _rate_limit_cache[ip] = [t for t in _rate_limit_cache[ip] if t > window_start]
    
    if len(_rate_limit_cache[ip]) >= max_requests:
        _search_metrics["rate_limited"] += 1
        return False
    
    _rate_limit_cache[ip].append(now)
    return True


def check_debounce(query: str, page: int = 1, debounce_seconds: int = 2) -> bool:
    """
    Verifica debounce para queries idênticas
    Retorna True se permitido, False se deve aguardar
    """
    now = time.time()
    cache_key = f"{query.lower().strip()}_{page}"
    
    if cache_key in _debounce_cache:
        last_time = _debounce_cache[cache_key]
        if now - last_time < debounce_seconds:
            return False
    
    _debounce_cache[cache_key] = now
    return True


async def get_cached_search(cache_key: str) -> Optional[Dict]:
    """Busca resultado em cache por chave"""
    if db is None:
        return None
    
    cache_entry = await db.search_cache.find_one(
        {"cache_key": cache_key},
        {"_id": 0}
    )
    
    if cache_entry:
        cached_at = datetime.fromisoformat(cache_entry["cached_at"])
        expires_at = cached_at + timedelta(hours=CACHE_DURATION_HOURS)
        
        if datetime.now(timezone.utc) < expires_at:
            _search_metrics["cache_hits"] += 1
            return cache_entry
        else:
            # Cache expirado, remover
            await db.search_cache.delete_one({"cache_key": cache_key})
    
    _search_metrics["cache_misses"] += 1
    return None


async def save_to_cache(
    cache_key: str,
    query: str, 
    category: Optional[str],
    page: int,
    page_size: int,
    results: List[Dict],
    has_more: bool
):
    """Salva resultado no cache com metadados de paginação"""
    if db is None:
        return
    
    await db.search_cache.update_one(
        {"cache_key": cache_key},
        {
            "$set": {
                "cache_key": cache_key,
                "query": query,
                "category": category,
                "page": page,
                "page_size": page_size,
                "results": results,
                "has_more": has_more,
                "result_count": len(results),
                "cached_at": datetime.now(timezone.utc).isoformat(),
            }
        },
        upsert=True
    )
    logger.info(f"Cached {len(results)} results for key: {cache_key[:8]}... (page {page})")


async def log_search(
    query: str,
    category: Optional[str],
    page: int,
    cache_hit: bool,
    result_count: int,
    ip: Optional[str] = None
):
    """Registra log de busca para monitoramento"""
    if db is None:
        return
    
    log_entry = {
        "query": query,
        "category": category,
        "page": page,
        "cache_hit": cache_hit,
        "result_count": result_count,
        "ip": ip,
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    
    await db.search_logs.insert_one(log_entry)
    logger.info(f"Search: query='{query}' page={page} cache_hit={cache_hit} results={result_count}")


async def search_google_shopping_paginated(
    query: str,
    category: Optional[str] = None,
    page: int = 1,
    page_size: int = DEFAULT_PAGE_SIZE,
    ip: Optional[str] = None,
    use_cache: bool = True
) -> Dict[str, Any]:
    """
    Busca produtos no Google Shopping via SerpAPI com suporte a paginação
    
    Args:
        query: Termo de busca (mínimo 3 caracteres)
        category: Categoria opcional para filtrar
        page: Página atual (1-3)
        page_size: Itens por página (máx 20)
        ip: IP do cliente para rate limiting
        use_cache: Se deve usar cache (default: True)
    
    Returns:
        Dict com produtos, has_more, page, total_pages e mensagem
    """
    
    # Validações
    if not query or len(query.strip()) < 3:
        return {
            "products": [],
            "page": 1,
            "page_size": page_size,
            "has_more": False,
            "total_pages": 0,
            "message": "Busca deve ter pelo menos 3 caracteres"
        }
    
    # Limitar parâmetros
    page = max(1, min(page, MAX_PAGE))
    page_size = max(1, min(page_size, MAX_PAGE_SIZE))
    
    # Rate limiting por IP
    if ip and not check_rate_limit(ip):
        return {
            "products": [],
            "page": page,
            "page_size": page_size,
            "has_more": False,
            "total_pages": 0,
            "message": "Muitas requisições. Aguarde um momento."
        }
    
    # Verificar debounce
    if not check_debounce(query, page):
        # Se for busca repetida muito rápida, retornar do cache se existir
        cache_key = generate_cache_key(query, category, page, page_size)
        cached = await get_cached_search(cache_key)
        if cached:
            await log_search(query, category, page, True, len(cached.get("results", [])), ip)
            return {
                "products": cached.get("results", []),
                "page": cached.get("page", page),
                "page_size": cached.get("page_size", page_size),
                "has_more": cached.get("has_more", False),
                "total_pages": MAX_PAGE if cached.get("has_more", False) else page,
                "message": None
            }
    
    # Gerar cache key
    cache_key = generate_cache_key(query, category, page, page_size)
    
    # Verificar cache primeiro
    if use_cache:
        cached = await get_cached_search(cache_key)
        if cached:
            await log_search(query, category, page, True, len(cached.get("results", [])), ip)
            return {
                "products": cached.get("results", []),
                "page": cached.get("page", page),
                "page_size": cached.get("page_size", page_size),
                "has_more": cached.get("has_more", False),
                "total_pages": MAX_PAGE if cached.get("has_more", False) else page,
                "message": None
            }
    
    # Se página > MAX_PAGE, retornar vazio com mensagem
    if page > MAX_PAGE:
        return {
            "products": [],
            "page": page,
            "page_size": page_size,
            "has_more": False,
            "total_pages": MAX_PAGE,
            "message": "Refine sua busca para ver mais resultados."
        }
    
    if not SERPAPI_KEY:
        logger.error("SERPAPI_KEY not configured")
        return {
            "products": [],
            "page": page,
            "page_size": page_size,
            "has_more": False,
            "total_pages": 0,
            "message": "Serviço temporariamente indisponível"
        }
    
    # Preparar query com categoria se fornecida
    search_query = query
    if category:
        category_map = {
            "smartphones": "celular smartphone",
            "tvs": "smart tv televisão",
            "notebooks": "notebook laptop",
            "games": "video game console",
            "eletrodomesticos": "eletrodoméstico",
            "acessorios": "fone bluetooth acessório"
        }
        if category in category_map:
            search_query = f"{query} {category_map[category]}"
    
    # Calcular offset para paginação SerpAPI
    start = (page - 1) * page_size
    
    # Parâmetros da requisição - pedir 1 a mais para saber se há mais
    params = {
        "engine": "google_shopping",
        "q": search_query,
        "location": "Brazil",
        "hl": "pt",
        "gl": "br",
        "num": page_size + 1,  # +1 para detectar has_more
        "start": start,
        "api_key": SERPAPI_KEY
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(SERPAPI_BASE_URL, params=params)
            response.raise_for_status()
            data = response.json()
        
        _search_metrics["api_calls"] += 1
        
        # Processar resultados
        products = []
        shopping_results = data.get("shopping_results", [])
        
        # Verificar se há mais resultados
        has_more = len(shopping_results) > page_size and page < MAX_PAGE
        
        # Limitar aos resultados da página atual
        for item in shopping_results[:page_size]:
            offer_link = item.get("link") or item.get("product_link") or ""
            
            product = {
                "id": item.get("product_id", str(hash(item.get("title", "")))),
                "name": item.get("title", ""),
                "price": extract_price(item.get("extracted_price") or item.get("price")),
                "original_price": extract_price(item.get("extracted_old_price")),
                "image": item.get("thumbnail", ""),
                "store": item.get("source", ""),
                "link": offer_link,
                "product_link": item.get("product_link", ""),
                "rating": item.get("rating"),
                "reviews": item.get("reviews"),
                "delivery": item.get("delivery", ""),
                "badge": item.get("badge", ""),
                "affiliate_link": None,
                "affiliate_tag": None
            }
            
            if product["price"] and product["price"] > 0:
                products.append(product)
        
        # Salvar no cache
        if use_cache and products:
            await save_to_cache(cache_key, query, category, page, page_size, products, has_more)
        
        # Registrar log
        await log_search(query, category, page, False, len(products), ip)
        
        logger.info(f"SerpAPI returned {len(products)} products for: {search_query} (page {page})")
        
        return {
            "products": products,
            "page": page,
            "page_size": page_size,
            "has_more": has_more,
            "total_pages": MAX_PAGE if has_more else page,
            "message": None
        }
        
    except httpx.HTTPStatusError as e:
        logger.error(f"SerpAPI HTTP error: {e.response.status_code} - {e.response.text}")
        return {
            "products": [],
            "page": page,
            "page_size": page_size,
            "has_more": False,
            "total_pages": 0,
            "message": "Erro ao buscar produtos"
        }
    except Exception as e:
        logger.error(f"SerpAPI error: {e}")
        return {
            "products": [],
            "page": page,
            "page_size": page_size,
            "has_more": False,
            "total_pages": 0,
            "message": "Erro ao buscar produtos"
        }


# Manter função legada para compatibilidade
async def search_google_shopping(
    query: str,
    category: Optional[str] = None,
    num_results: int = 20,
    use_cache: bool = True
) -> List[Dict]:
    """
    Função legada - mantida para compatibilidade
    Usa a nova função paginada internamente
    """
    result = await search_google_shopping_paginated(
        query=query,
        category=category,
        page=1,
        page_size=min(num_results, MAX_PAGE_SIZE),
        use_cache=use_cache
    )
    return result.get("products", [])


def extract_price(price_value) -> Optional[float]:
    """Extrai valor numérico do preço"""
    if price_value is None:
        return None
    
    if isinstance(price_value, (int, float)):
        return float(price_value)
    
    if isinstance(price_value, str):
        import re
        cleaned = re.sub(r'[R$\s]', '', price_value)
        cleaned = cleaned.replace('.', '').replace(',', '.')
        try:
            return float(cleaned)
        except ValueError:
            return None
    
    return None


async def get_product_details(product_id: str) -> Optional[Dict]:
    """Busca detalhes de um produto específico no cache"""
    if db is None:
        return None
    
    cache_entries = await db.search_cache.find({}).to_list(100)
    
    for entry in cache_entries:
        for product in entry.get("results", []):
            if product.get("id") == product_id:
                return product
    
    return None


async def get_popular_products(limit: int = 12) -> List[Dict]:
    """Retorna produtos populares (busca por termos populares)"""
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
    """Retorna estatísticas do cache e métricas de busca"""
    if db is None:
        return {"error": "Database not connected"}
    
    total_entries = await db.search_cache.count_documents({})
    
    entries = await db.search_cache.find({}, {"_id": 0, "cached_at": 1, "result_count": 1}).to_list(1000)
    
    total_products = sum(e.get("result_count", 0) for e in entries)
    
    now = datetime.now(timezone.utc)
    valid_entries = 0
    for entry in entries:
        cached_at = datetime.fromisoformat(entry["cached_at"])
        if now < cached_at + timedelta(hours=CACHE_DURATION_HOURS):
            valid_entries += 1
    
    # Contar logs das últimas 24h
    yesterday = (now - timedelta(hours=24)).isoformat()
    recent_searches = await db.search_logs.count_documents({"timestamp": {"$gte": yesterday}})
    cache_hits_24h = await db.search_logs.count_documents({"timestamp": {"$gte": yesterday}, "cache_hit": True})
    
    return {
        "total_cache_entries": total_entries,
        "valid_entries": valid_entries,
        "expired_entries": total_entries - valid_entries,
        "total_cached_products": total_products,
        "cache_duration_hours": CACHE_DURATION_HOURS,
        "max_pages_allowed": MAX_PAGE,
        "searches_last_24h": recent_searches,
        "cache_hits_last_24h": cache_hits_24h,
        "cache_hit_rate_24h": f"{(cache_hits_24h / recent_searches * 100):.1f}%" if recent_searches > 0 else "N/A",
        "metrics": _search_metrics
    }


async def get_search_logs(limit: int = 100) -> List[Dict]:
    """Retorna logs de busca recentes"""
    if db is None:
        return []
    
    logs = await db.search_logs.find(
        {}, 
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit).to_list(limit)
    
    return logs


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
