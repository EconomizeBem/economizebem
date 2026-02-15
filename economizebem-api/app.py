"""
API FastAPI para servir ofertas Amazon do EconomizeBem.

Endpoints:
- GET /health - Health check
- GET /offers - Retorna todas as ofertas
- GET /deals - Retorna ofertas do dia (top 20)

Variáveis de ambiente para CORS:
- ALLOWED_ORIGINS: Lista de origens separadas por vírgula (padrão: *)
"""

import json
from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os

app = FastAPI(
    title="EconomizeBem API",
    description="API para ofertas Amazon do EconomizeBem",
    version="2.0.0"
)

# Configurar CORS
allowed_origins = os.environ.get("ALLOWED_ORIGINS", "*").split(",")
if allowed_origins == ["*"]:
    allowed_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OFFERS_FILE = "offers.json"
DEALS_FILE = "deals_of_day.json"

# Categorias válidas
VALID_CATEGORIES = [
    "video_games", "tv", "geladeira", "cafeteira", 
    "lava_roupas", "lava_e_seca", "outros"
]


def load_json_file(filepath: str) -> dict:
    """Carrega arquivo JSON ou retorna estrutura vazia."""
    path = Path(filepath)
    
    if not path.exists():
        return {
            "updated_at": None,
            "updated_at_local": None,
            "disclaimer": "Os preços e a disponibilidade dos produtos estão corretos na data/horário indicados e poderão sofrer alterações.",
            "items": []
        }
    
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Erro ao processar arquivo de ofertas")


@app.get("/health")
async def health_check():
    """Endpoint de health check."""
    return {"status": "ok", "version": "2.0.0"}


@app.get("/")
async def root():
    """Endpoint raiz."""
    return {
        "message": "EconomizeBem API",
        "version": "2.0.0",
        "endpoints": {
            "health": "/health",
            "offers": "/offers",
            "deals": "/deals"
        },
        "categories": VALID_CATEGORIES
    }


@app.get("/offers")
async def get_offers(
    category: Optional[str] = Query(None, description="Filtrar por categoria"),
    sort_by: Optional[str] = Query("discount", description="Ordenar por: discount, priority, price")
):
    """
    Retorna todas as ofertas.
    
    Query params:
    - category: Filtrar por categoria (video_games, tv, geladeira, etc.)
    - sort_by: Ordenar por discount (padrão), priority ou price
    """
    data = load_json_file(OFFERS_FILE)
    items = data.get("items", [])
    
    # Filtrar por categoria
    if category and category in VALID_CATEGORIES:
        items = [item for item in items if item.get("category") == category]
    
    # Ordenar
    if sort_by == "price":
        items = sorted(items, key=lambda x: x.get("price") or float('inf'))
    elif sort_by == "priority":
        items = sorted(items, key=lambda x: -x.get("priority", 5))
    else:  # discount (padrão)
        items = sorted(items, key=lambda x: -(x.get("discount_pct") or 0))
    
    return {
        "updated_at": data.get("updated_at"),
        "updated_at_local": data.get("updated_at_local"),
        "updated_at_full": data.get("updated_at_full"),
        "disclaimer": data.get("disclaimer", "Os preços e a disponibilidade dos produtos estão corretos na data/horário indicados e poderão sofrer alterações."),
        "tracking_tag": data.get("tracking_tag", "economizebe0b-20"),
        "total_items": len(items),
        "categories": VALID_CATEGORIES,
        "items": items
    }


@app.get("/deals")
async def get_deals():
    """
    Retorna as ofertas do dia (top 20 por desconto).
    """
    data = load_json_file(DEALS_FILE)
    
    return {
        "updated_at": data.get("updated_at"),
        "updated_at_local": data.get("updated_at_local"),
        "updated_at_full": data.get("updated_at_full"),
        "disclaimer": data.get("disclaimer", "Os preços e a disponibilidade dos produtos estão corretos na data/horário indicados e poderão sofrer alterações."),
        "tracking_tag": data.get("tracking_tag", "economizebe0b-20"),
        "total_items": len(data.get("items", [])),
        "items": data.get("items", [])
    }


@app.get("/categories")
async def get_categories():
    """Retorna lista de categorias disponíveis."""
    return {
        "categories": VALID_CATEGORIES,
        "labels": {
            "video_games": "Video Games",
            "tv": "TVs",
            "geladeira": "Geladeiras",
            "cafeteira": "Cafeteiras",
            "lava_roupas": "Lava Roupas",
            "lava_e_seca": "Lava e Seca",
            "outros": "Outros"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
