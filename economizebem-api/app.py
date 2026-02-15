"""
API FastAPI para servir ofertas Amazon.
Endpoints:
- GET /health - Health check
- GET /offers - Retorna ofertas do arquivo offers.json
"""

import json
from pathlib import Path
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="EconomizeBem API",
    description="API para ofertas Amazon do EconomizeBem",
    version="1.0.0"
)

# Habilita CORS para todas as origens
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
        # Retorna estrutura vazia se arquivo não existir
        return {
            "updated_at": None,
            "items": []
        }
    
    try:
        with open(offers_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        return data
    except json.JSONDecodeError:
        raise HTTPException(status_code=500, detail="Erro ao processar arquivo de ofertas")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
