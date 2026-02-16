"""
API FastAPI para servir ofertas Amazon do EconomizeBem.

Endpoints:
- GET /health - Health check
- GET /offers - Retorna offers.json
"""

import json
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EconomizeBem API",
    description="API para ofertas Amazon do EconomizeBem",
    version="1.0.0"
)

# Habilitar CORS para permitir o site consumir
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OFFERS_FILE = "offers.json"


@app.get("/health")
async def health_check():
    """Endpoint de health check."""
    return {"status": "ok"}


@app.get("/")
async def root():
    """Endpoint raiz."""
    return {
        "message": "EconomizeBem API",
        "endpoints": {
            "health": "/health",
            "offers": "/offers"
        }
    }


@app.get("/offers")
async def get_offers():
    """Retorna as ofertas do arquivo offers.json."""
    offers_path = Path(OFFERS_FILE)
    
    if not offers_path.exists():
        return {
            "updated_at": None,
            "items": []
        }
    
    try:
        with open(offers_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except json.JSONDecodeError:
        return {
            "updated_at": None,
            "items": []
        }
    except Exception:
        return {
            "updated_at": None,
            "items": []
        }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
