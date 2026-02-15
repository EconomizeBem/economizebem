# EconomizeBem API

API para servir ofertas Amazon do EconomizeBem.

## Endpoints

- `GET /health` - Health check
- `GET /offers` - Retorna lista de ofertas

## Deploy no Render

### Web Service

1. Criar novo Web Service
2. Conectar ao repositório
3. Configurações:
   - **Name**: economizebem-api
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`

### Cron Job

1. Criar novo Cron Job
2. Conectar ao mesmo repositório
3. Configurações:
   - **Name**: economizebem-update-offers
   - **Command**: `python update_offers.py`
   - **Schedule**: `0 8,20 * * *` (08:00 e 20:00 UTC)

## Arquivos

- `app.py` - API FastAPI
- `update_offers.py` - Script de atualização de ofertas
- `asins.txt` - Lista de ASINs dos produtos
- `offers.json` - Arquivo gerado com as ofertas (criado pelo script)
- `requirements.txt` - Dependências Python

## Tracking ID Amazon

`economizebe0b-20`

## URL de Afiliado

```
https://www.amazon.com.br/dp/{ASIN}/?tag=economizebe0b-20
```
