# EconomizeBem - Product Requirements Document

## Visão Geral
Plataforma web brasileira de comparação de preços, planos e ferramentas financeiras focada em economia para o usuário final.

**Domínio**: economizebem.com.br
**Preview URL**: https://price-watcher-35.preview.emergentagent.com

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
- ✅ Cache de 24 horas para resultados da SerpAPI
- ✅ Sistema de verificação de alertas de preço (com cron-job configurado pelo usuário)
- ✅ Sistema de favoritos (produtos e planos)
- ✅ Sistema de e-mail via SMTP Zoho (boas-vindas, recuperação de senha, alertas)
- ✅ Dark/Light mode toggle (paleta refinada)
- ✅ Design responsivo (desktop e mobile)
- ✅ Calculadora financeira (gastos, simulador "vale a pena")
- ✅ **Google AdSense (Auto Ads) integrado**
- ✅ **Páginas legais: Termos de Uso e Política de Privacidade**
- ✅ **MongoDB Atlas configurado para produção**

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
- **Endpoints para verificação de alertas de preço**
- Dados mockados para planos (internet, mobile, streaming)

### Frontend
- 6 páginas principais (Home, Produtos, Planos, Calculadora, Auth, Dashboard)
- Sistema de temas (dark/light)
- Componentes reutilizáveis com Shadcn UI
- Gráficos com Recharts (pizza para gastos)
- Navegação responsiva com menu mobile

### Integrações
- **SerpAPI (Google Shopping)**: ✅ FUNCIONANDO - Busca produtos reais
- **SMTP Zoho Mail**: ✅ FUNCIONANDO - Envio de e-mails transacionais

## Prioritized Backlog

### P0 (Crítico) - Concluído ✅
- [x] Integrar SerpAPI para dados reais de produtos
- [x] Implementar cache de 24 horas
- [x] Implementar verificação de alertas de preço
- [x] Configurar MongoDB Atlas para produção
- [x] Integrar Google AdSense (Auto Ads)
- [x] Criar páginas legais (Termos de Uso e Privacidade)

### P1 (Alta Prioridade)
- [x] Implementar cron job externo para verificação diária de alertas (configurado pelo usuário no Render)
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
│   └── alert_service.py      # Price alert checks
├── frontend/
│   ├── .env
│   ├── package.json
│   └── src/
│       ├── pages/
│       │   ├── ProductsPage.jsx
│       │   ├── PlansPage.jsx
│       │   └── ...
│       └── components/
│           ├── ProductCard.jsx
│           └── ...
└── tests/
    └── test_serpapi_integration.py
```
