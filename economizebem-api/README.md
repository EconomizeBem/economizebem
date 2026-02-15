# EconomizeBem API

API para servir ofertas Amazon do EconomizeBem usando a PA-API 5.0 (Product Advertising API).

## Endpoints

| Endpoint | Descrição |
|----------|-----------|
| `GET /health` | Health check |
| `GET /offers` | Retorna todas as ofertas (com filtros) |
| `GET /deals` | Retorna ofertas do dia (top 20) |
| `GET /categories` | Lista de categorias disponíveis |

### Query Parameters para /offers

- `category`: Filtrar por categoria (video_games, tv, geladeira, cafeteira, lava_roupas, lava_e_seca, outros)
- `sort_by`: Ordenar por `discount` (padrão), `priority` ou `price`

## Variáveis de Ambiente (Render)

**OBRIGATÓRIAS para dados reais da Amazon:**

| Variável | Descrição |
|----------|-----------|
| `AMAZON_ACCESS_KEY` | Chave de acesso da PA-API (obtida em Associates Central) |
| `AMAZON_SECRET_KEY` | Chave secreta da PA-API |
| `AMAZON_ASSOCIATE_TAG` | Tag de associado (padrão: economizebe0b-20) |
| `AMAZON_COUNTRY` | País (padrão: BR) |

**Opcionais:**

| Variável | Descrição |
|----------|-----------|
| `ALLOWED_ORIGINS` | Origens permitidas para CORS (padrão: *) |

## Como obter credenciais da PA-API

1. Acesse [Associates Central](https://affiliate-program.amazon.com.br)
2. Vá em **Ferramentas** → **API de Divulgação de Produtos** (ou PA-API)
3. Crie uma nova aplicação (se necessário)
4. Copie o **Access Key** e **Secret Key**

**Requisito:** É necessário ter pelo menos 3 vendas qualificadas nos últimos 30 dias para manter acesso à API.

## Deploy no Render

### Web Service

1. Criar novo **Web Service**
2. Conectar ao repositório
3. Configurações:
   - **Name**: economizebem-api
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app:app --host 0.0.0.0 --port $PORT`
4. Adicionar variáveis de ambiente (AMAZON_ACCESS_KEY, AMAZON_SECRET_KEY, etc.)

### Cron Job (Atualização automática)

1. Criar novo **Cron Job**
2. Conectar ao mesmo repositório
3. Configurações:
   - **Name**: economizebem-update-offers
   - **Command**: `python update_offers.py`
   - **Schedule**: 
     - A cada hora: `0 * * * *`
     - Ou 2x ao dia: `0 8,20 * * *` (08:00 e 20:00 UTC)

## Arquivos

| Arquivo | Descrição |
|---------|-----------|
| `app.py` | API FastAPI |
| `update_offers.py` | Script de atualização de ofertas (usa PA-API) |
| `extract_asins.py` | Utilitário para extrair ASINs de URLs |
| `asins.csv` | Lista de ASINs com categoria e prioridade |
| `urls.txt` | URLs da Amazon para extrair ASINs |
| `offers.json` | Arquivo gerado com todas as ofertas |
| `deals_of_day.json` | Arquivo gerado com ofertas do dia |

## Gerenciando ASINs

### Estrutura do asins.csv

```csv
asin,category,priority
B08N5WRWNW,video_games,8
B09V3KXJPB,tv,9
```

**Categorias válidas:**
- `video_games`
- `tv`
- `geladeira`
- `cafeteira`
- `lava_roupas`
- `lava_e_seca`
- `outros`

**Prioridade:** 1 a 10 (maior = mais importante)

### Extrair ASINs de URLs

1. Adicione URLs da Amazon em `urls.txt` (uma por linha)
2. Execute:

```bash
# Criar novo arquivo
python extract_asins.py --input urls.txt --output asins.csv --category outros --priority 5

# Adicionar ao arquivo existente
python extract_asins.py --input urls.txt --output asins.csv --append

# Especificar categoria
python extract_asins.py --input urls.txt --output asins.csv --category tv --priority 8
```

## Tracking ID Amazon

**Tag:** `economizebe0b-20`

**URL de Afiliado:**
```
https://www.amazon.com.br/dp/{ASIN}/?tag=economizebe0b-20
```

## Estrutura do JSON de Ofertas

```json
{
  "updated_at": "2025-02-15T12:00:00+00:00",
  "updated_at_local": "09:00",
  "updated_at_full": "15/02/2025 às 09:00",
  "disclaimer": "Os preços e a disponibilidade dos produtos estão corretos na data/horário indicados e poderão sofrer alterações.",
  "tracking_tag": "economizebe0b-20",
  "total_items": 30,
  "categories": ["video_games", "tv", ...],
  "items": [
    {
      "asin": "B08N5WRWNW",
      "category": "video_games",
      "priority": 8,
      "title": "PlayStation 5 Console",
      "image_url": "https://...",
      "price": 3999.00,
      "list_price": 4499.00,
      "discount_pct": 11,
      "affiliate_url": "https://www.amazon.com.br/dp/B08N5WRWNW/?tag=economizebe0b-20",
      "availability": "Em estoque"
    }
  ]
}
```

## Notas Importantes

1. **Fallback:** Se a PA-API não estiver configurada ou falhar, o sistema gera dados placeholder.
2. **Rate Limit:** O script respeita o limite de 1 requisição por segundo da PA-API.
3. **Cache:** Os arquivos JSON são servidos diretamente, garantindo resposta rápida.
4. **Migração:** A PA-API 5.0 será descontinuada em Abril/2026. Migre para a Creators API antes dessa data.
