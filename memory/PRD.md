# EconomizeBem - Product Requirements Document

## Visão Geral
Plataforma web brasileira de comparação de preços, planos e ferramentas financeiras focada em economia para o usuário final.

**Domínio**: economizebem.com.br
**Preview URL**: https://economizebem-4.preview.emergentagent.com

## Problem Statement Original
Criar uma plataforma web moderna, rápida e responsiva, focada em utilidade pública e economia para o usuário final. O site deve ser simples de usar, visualmente limpo e pensado para pessoas leigas.

## Identidade Visual
- **Nome**: EconomizeBem
- **Cor Principal**: Sky Blue (#0ea5e9)
- **Cor Secundária**: Violet (#8b5cf6)
- **Fontes**: Outfit (headings), Inter (body)
- **Suporte**: Dark/Light mode

## User Personas
1. **Consumidor Consciente**: Busca melhores preços antes de comprar
2. **Planejador Financeiro**: Quer controlar gastos e comparar planos
3. **Usuário Casual**: Precisa de ferramentas simples para decisões rápidas

## Core Requirements

### Implementados ✅
- ✅ Sistema de autenticação JWT (cadastro, login, logout, recuperação de senha)
- ✅ **Comparador de preços de produtos COM DADOS REAIS via SerpAPI (Google Shopping)**
- ✅ **Cache agressivo de 24h por query+page (~70% hit rate)**
- ✅ **Paginação com botão "Carregar mais" (máx 3 páginas = 60 produtos)**
- ✅ **Rate limit (10 req/min por IP) e Debounce (400ms frontend, 2s backend)**
- ✅ **Deduplicação de produtos e logs de busca para monitoramento**
- ✅ **Busca da Home funcionando (navega para /products?search=)**
- ✅ **Todas as categorias carregando produtos automaticamente (defaultSearch otimizado)**
- ✅ Sistema de verificação de alertas de preço (com cron-job configurado pelo usuário)
- ✅ Sistema de favoritos (produtos e planos)
- ✅ Sistema de e-mail via SMTP Zoho (boas-vindas, recuperação de senha, alertas)
- ✅ Dark/Light mode toggle (paleta refinada)
- ✅ Design responsivo (desktop e mobile)
- ✅ Calculadora financeira (gastos, simulador "vale a pena")
- ✅ **Google AdSense (Auto Ads) integrado**
- ✅ **Páginas legais: Termos de Uso e Política de Privacidade**
- ✅ **MongoDB Atlas configurado para produção**
- ✅ **6 Categorias de produtos: Eletrônicos, Eletrodomésticos, Casa & Cozinha, Vestuário, Beleza & Saúde, Pets**
- ✅ **URLs amigáveis para SEO: /categoria/xxx**
- ✅ **Meta tags SEO dinâmicos via react-helmet**
- ✅ **Menu de categorias expandido no navbar**
- ✅ **Homepage com seção "Explore por Categoria"**
- ✅ **Filtros rápidos (subcategorias) em cada página de categoria**
- ✅ **Página de Ofertas Amazon com 17 produtos curados e links de afiliado (`/ofertas-amazon`)**
- ✅ **Banner de destaque "Ofertas Amazon do Dia" na HomePage (logo após o Hero)**
- ✅ **Proxy de imagem no backend para carregar imagens da Amazon contornando CORS**
- ✅ **Sistema de fallback de imagens: Amazon → Unsplash → Placeholder**

### Em breve (Mockado removido) 🔜
- 🔜 Comparador de planos (Internet, Celular, Streaming) - **Página mostra "Em breve"**

### Em Progresso 🔄
- Nenhum

### Pendentes 📋
- [ ] Integrar dados reais para "Comparador de Planos" (atualmente mockado)
- [ ] Implementar backend completo para "Calculadora Financeira"
- [ ] Integrar APIs de afiliados (Amazon, Magazine Luiza, Mercado Livre)
- [ ] Configurar SEO avançado (meta tags dinâmicas, robots.txt, sitemap.xml)

## Tech Stack
- **Backend**: FastAPI + Python
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Database**: MongoDB Atlas (Free Tier - M0) ☁️
- **Email**: SMTP Zoho Mail
- **Auth**: JWT
- **Product Data**: SerpAPI (Google Shopping)

## What's Been Implemented

### Backend
- API REST completa com 20+ endpoints
- Autenticação JWT com bcrypt
- CRUD de favoritos, alertas, despesas
- **Integração SerpAPI para busca de produtos reais**
- **Sistema de cache de 24 horas para resultados da API**
- **Endpoints para verificação de alertas de preço (idempotentes)**
- **Script `run_price_alerts.py` para cron-job**
- Dados mockados para planos (internet, mobile, streaming)

### Frontend
- 11 páginas principais (Home, Produtos, Vestuário, Geladeiras, Cozinha, Planos, Calculadora, Auth, Dashboard, Termos, Privacidade)
- Sistema de temas (dark/light) com paleta refinada
- Componentes reutilizáveis com Shadcn UI
- **Páginas de categoria segmentadas com filtros rápidos**
- **Menu de categorias com dropdown no navbar e seção no mobile**
- Gráficos com Recharts (pizza para gastos)
- Navegação responsiva com menu mobile
- **Google AdSense (Auto Ads) integrado**
- **Páginas legais completas (Termos de Uso e Política de Privacidade)**

### Integrações
- **SerpAPI (Google Shopping)**: ✅ FUNCIONANDO - Busca produtos reais
- **SMTP Zoho Mail**: ✅ FUNCIONANDO - Envio de e-mails transacionais
- **Google AdSense**: ✅ INTEGRADO - Auto Ads configurado

## Prioritized Backlog

### P0 (Crítico) - Concluído ✅
- [x] Integrar SerpAPI para dados reais de produtos
- [x] Implementar cache de 24 horas
- [x] Implementar verificação de alertas de preço
- [x] Configurar MongoDB Atlas para produção
- [x] Integrar Google AdSense (Auto Ads)
- [x] Criar páginas legais (Termos de Uso e Privacidade)
- [x] Criar páginas de categoria segmentadas (Vestuário, Geladeiras, Cozinha)

### P1 (Alta Prioridade)
- [x] Implementar cron job externo para verificação diária de alertas (configurado pelo usuário no Render)
- [x] Criar menu de categorias com dropdown no navbar
- [ ] Implementar backend para "Comparador de Planos"
- [ ] Implementar backend para "Calculadora Financeira"

### P2 (Média Prioridade)
- [ ] Substituir dados mockados de planos por dados reais
- [ ] Integrar APIs de afiliados (Amazon, Magazine Luiza, Mercado Livre)
- [ ] Adicionar histórico de preços dos produtos

### P3 (Baixa Prioridade)
- [ ] Autenticação Google OAuth
- [ ] App mobile (PWA)
- [ ] Sistema de reviews/avaliações

## API Endpoints

### Autenticação
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/change-password
```

### Produtos (Dados Reais via SerpAPI)
```
GET  /api/products                    # Produtos populares
GET  /api/products/search?q=<termo>   # Busca
GET  /api/products/{id}               # Detalhes
GET  /api/products/categories/list    # Categorias
GET  /api/products/cache/stats        # Estatísticas do cache
POST /api/products/cache/clear        # Limpar cache expirado
```

### Alertas de Preço
```
GET  /api/alerts                      # Listar alertas do usuário
POST /api/alerts                      # Criar alerta
PUT  /api/alerts/{id}                 # Atualizar alerta
DELETE /api/alerts/{id}               # Remover alerta
POST /api/alerts/check                # Disparar verificação
POST /api/alerts/check-favorites      # Verificar favoritos
GET  /api/alerts/check-history        # Histórico de verificações
```

### Planos (Dados Mockados)
```
GET  /api/plans/internet
GET  /api/plans/mobile
GET  /api/plans/streaming
```

### Outros
```
GET  /api/favorites
POST /api/favorites
DELETE /api/favorites/{type}/{id}
GET  /api/expenses
POST /api/expenses
PUT  /api/expenses/{id}
DELETE /api/expenses/{id}
GET  /api/expenses/summary
```

## Notes
- Produtos: **DADOS REAIS** via SerpAPI (Google Shopping)
- Planos: **DADOS MOCKADOS** (internet, mobile, streaming)
- E-mail configurado via SMTP Zoho (funcional)
- Cache de produtos: 24 horas (economiza chamadas da API)
- Plano gratuito do SerpAPI: 100 buscas/mês

## Testing Status
- Backend: 100% dos testes passando (18/18)
- Frontend: 100% funcionando
- Última execução: Janeiro 2025

## Files Structure
```
/app/
├── backend/
│   ├── .env
│   ├── requirements.txt
│   ├── server.py
│   ├── email_templates.py
│   ├── product_service.py    # SerpAPI integration
│   ├── alert_service.py      # Price alert checks (idempotente)
│   └── run_price_alerts.py   # Script para cron-job
├── frontend/
│   ├── .env
│   ├── package.json
│   ├── public/
│   │   └── index.html        # Google AdSense script
│   └── src/
│       ├── pages/
│       │   ├── ProductsPage.jsx
│       │   ├── CategoryPage.jsx       # Componente base com SEO
│       │   ├── EletronicosPage.jsx    # /categoria/eletronicos
│       │   ├── EletrodomesticosPage.jsx # /categoria/eletrodomesticos
│       │   ├── CasaCozinhaPage.jsx    # /categoria/casa-cozinha
│       │   ├── VestuarioPageNew.jsx   # /categoria/vestuario
│       │   ├── BelezaSaudePage.jsx    # /categoria/beleza-saude
│       │   ├── PetsPage.jsx           # /categoria/pets
│       │   ├── PlansPage.jsx
│       │   ├── TermsPage.jsx
│       │   ├── PrivacyPage.jsx
│       │   └── ...
│       └── components/
│           ├── Navbar.jsx             # Menu com 6 categorias
│           ├── ProductCard.jsx
│           ├── Footer.jsx
│           └── ...
└── memory/
    └── PRD.md
```

## Última Atualização
- **Data**: Janeiro 2025
- **Sessão**: Correção de bugs críticos (busca Home, categorias vazias, paginação)
- **Status**: ✅ Todas as funcionalidades implementadas e testadas (100% de sucesso - 16/16 testes)

## Bugs Corrigidos nesta Sessão
| Bug | Causa | Solução |
|-----|-------|---------|
| Busca Home "Not Found" | ProductsPage não lidava com response.data.products | Reescrito ProductsPage com tratamento correto da resposta |
| Categorias sem produtos | defaultSearch com termos compostos (ex: "roupas moda") | Simplificado para termos únicos (ex: "roupa") |
| "Refine busca" prematuro | SerpAPI retorna poucos resultados para termos compostos | Termos otimizados + validação mínima 2 caracteres |

## Sistema de Cache e Paginação SerpAPI

### Configurações
| Parâmetro | Valor |
|-----------|-------|
| Cache TTL | 24 horas |
| Máx páginas | 3 |
| Itens por página | 20 |
| Rate limit | 10 req/min por IP |
| Debounce backend | 2 segundos |
| Debounce frontend | 400ms |
| Min caracteres busca | 2 |

### Endpoints de Monitoramento
- `GET /api/products/cache/stats` - Estatísticas do cache
- `GET /api/products/search/logs` - Logs de busca recentes
- `POST /api/products/cache/clear` - Limpar cache expirado

### Métricas (última sessão)
- Cache hit rate: ~70%
- Total cache entries: 37
- Produtos cacheados: ~600

## Categorias de Produtos (defaultSearch otimizado)
| Rota | Categoria | Busca Padrão | Subcategorias |
|------|-----------|--------------|---------------|
| /categoria/eletronicos | Eletrônicos | celular | Celulares, TVs, Notebooks, Fones de Ouvido, Smartwatches, Consoles |
| /categoria/eletrodomesticos | Eletrodomésticos | geladeira | Geladeiras, Máquinas de Lavar, Fogões/Cooktops, Micro-ondas, Ar-condicionado, Aspiradores |
| /categoria/casa-cozinha | Casa & Cozinha | panela | Panelas, Talheres, Utensílios, Cafeteiras, Organização, Pratos e Louças, Copos e Taças |
| /categoria/vestuario | Vestuário | roupa | Tênis, Roupas Masculinas/Femininas, Calçados, Camisetas, Jaquetas, Vestidos |
| /categoria/beleza-saude | Beleza & Saúde | maquiagem | Maquiagem, Skincare, Cabelo, Higiene, Perfumes, Saúde e Bem-estar |
| /categoria/pets | Pets | racao | Ração Cachorro/Gato, Petiscos, Acessórios, Higiene Pet, Brinquedos |

### Rotas Legacy (mantidas para compatibilidade)
- /vestuario → VestuarioPage.jsx
- /geladeiras → GeladeirasPage.jsx
- /cozinha → CozinhaPage.jsx
