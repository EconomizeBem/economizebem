# EconomizeBem - Product Requirements Document

## Visão Geral
Plataforma web brasileira de comparação de preços, planos e ferramentas financeiras focada em economia para o usuário final.

**Domínio**: economizebem.com.br

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

## Core Requirements (Implementados)
- ✅ Sistema de autenticação JWT (cadastro, login, logout, recuperação de senha)
- ✅ Comparador de preços de produtos (8 produtos mockados de lojas brasileiras)
- ✅ Comparador de planos (Internet, Celular, Streaming)
- ✅ Calculadora financeira (gastos, simulador "vale a pena", conversão salário)
- ✅ Sistema de favoritos (produtos e planos)
- ✅ Alertas de preço por e-mail (estrutura pronta, Resend configurado)
- ✅ Dark/Light mode toggle
- ✅ Design responsivo (desktop e mobile)
- ✅ SEO básico configurado

## Tech Stack
- **Backend**: FastAPI + Python
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Database**: MongoDB
- **Email**: Resend (configuração pendente de chave API)
- **Auth**: JWT

## What's Been Implemented (Jan 2025)

### Backend
- API REST completa com 15+ endpoints
- Autenticação JWT com bcrypt
- CRUD de favoritos, alertas, despesas
- Dados mockados realistas de produtos e planos brasileiros

### Frontend
- 6 páginas principais (Home, Produtos, Planos, Calculadora, Auth, Dashboard)
- Sistema de temas (dark/light)
- Componentes reutilizáveis com Shadcn UI
- Gráficos com Recharts (pizza para gastos)
- Navegação responsiva com menu mobile

### Rebrand (v1.1)
- Nome alterado de "Economizaí" para "EconomizeBem"
- Identidade visual atualizada (verde → azul sky)
- Logo com ícone de carteira (Wallet)
- Nova paleta de cores consistente em toda aplicação

## Prioritized Backlog

### P0 (Próximos Passos)
- [ ] Configurar chave Resend para envio real de e-mails
- [ ] Implementar job de verificação de preços para alertas

### P1 (Melhorias)
- [ ] Adicionar mais produtos mockados
- [ ] Implementar histórico de preços
- [ ] Adicionar gráficos de evolução de preços

### P2 (Futuro)
- [ ] Integração real com APIs de lojas (web scraping)
- [ ] Autenticação Google OAuth
- [ ] App mobile (PWA)
- [ ] Sistema de afiliados para monetização

## API Endpoints
```
POST /api/auth/register
POST /api/auth/login
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
PUT  /api/auth/profile
PUT  /api/auth/change-password
GET  /api/products
GET  /api/products/{id}
GET  /api/products/categories/list
GET  /api/plans/internet
GET  /api/plans/mobile
GET  /api/plans/streaming
GET  /api/favorites
POST /api/favorites
DELETE /api/favorites/{type}/{id}
GET  /api/alerts
POST /api/alerts
PUT  /api/alerts/{id}
DELETE /api/alerts/{id}
GET  /api/expenses
POST /api/expenses
PUT  /api/expenses/{id}
DELETE /api/expenses/{id}
GET  /api/expenses/summary
```

## Notes
- Todos os dados de produtos e planos são MOCKADOS
- E-mail de envio configurado como onboarding@resend.dev (modo teste)
- Frontend URL: https://economizebem.preview.emergentagent.com
