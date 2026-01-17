# Configuração do Google AdSense - EconomizeBem

## 📋 Pré-requisitos

1. Conta aprovada no [Google AdSense](https://www.google.com/adsense/)
2. ID do Publisher (formato: `ca-pub-XXXXXXXXXXXX`)
3. Slots de anúncio criados no painel do AdSense

---

## 🔧 Configuração Inicial

### 1. Configurar o ID do Publisher

Edite o arquivo `frontend/public/index.html` e substitua `ca-pub-XXXXXXXXXXXX` pelo seu ID real:

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-SEU_ID_AQUI"
    crossorigin="anonymous"></script>
```

### 2. Configurar o ID do Publisher no Componente

Edite o arquivo `frontend/src/components/AdSenseBlock.jsx` e substitua `ca-pub-XXXXXXXXXXXX`:

```jsx
data-ad-client="ca-pub-SEU_ID_AQUI"
```

### 3. Criar Slots de Anúncio no Painel do AdSense

No painel do AdSense:
1. Vá em **Anúncios** → **Por unidade de anúncio** → **Criar novo anúncio**
2. Crie os seguintes tipos de anúncio:
   - **Banner horizontal** (para abaixo do hero)
   - **In-feed** (para entre os produtos)
3. Copie o ID do slot (número após `data-ad-slot=`)

### 4. Substituir os Slots nos Componentes

Nos arquivos onde o AdSense é usado, substitua os placeholders:

**`frontend/src/pages/HomePage.jsx`:**
```jsx
<AdSenseBanner adSlot="SEU_SLOT_BANNER_AQUI" />
```

**`frontend/src/pages/ProductsPage.jsx`:**
```jsx
<AdSenseInFeed adSlot="SEU_SLOT_INFEED_AQUI" />
```

---

## 🤖 Configurar Auto Ads (Opcional)

O Auto Ads permite que o Google posicione anúncios automaticamente nas melhores posições.

### No Painel do AdSense:

1. Vá em **Anúncios** → **Por site**
2. Clique no seu site (economizebem.com.br)
3. Ative **Auto Ads**
4. Configure as opções:
   - ✅ Anúncios In-page
   - ✅ Anúncios de âncora
   - ✅ Anúncios de vinheta (com cuidado - pode ser intrusivo)
   - ⬜ Anúncios laterais (desativar se preferir controle manual)

### Vantagens do Auto Ads:
- Google otimiza automaticamente os posicionamentos
- Menos trabalho de configuração manual
- Machine learning para maximizar receita

### Desvantagens:
- Menos controle sobre onde os anúncios aparecem
- Pode afetar a experiência do usuário se não configurado corretamente

---

## 📍 Locais dos Anúncios no EconomizeBem

| Local | Tipo | Arquivo | Slot Placeholder |
|-------|------|---------|------------------|
| Abaixo do Hero (Home) | Banner Horizontal | `HomePage.jsx` | `SLOT_HERO_BANNER` |
| Entre produtos (a cada 8) | In-Feed | `ProductsPage.jsx` | `SLOT_PRODUCTS_INFEED` |

---

## 🔒 Boas Práticas

1. **Não clique nos próprios anúncios** - Violação das políticas do AdSense
2. **Não peça para usuários clicarem** - Também é proibido
3. **Mantenha distância de botões importantes** - Evita cliques acidentais
4. **Teste em dispositivos móveis** - Anúncios devem ser responsivos
5. **Monitore o desempenho** - Use o painel do AdSense para otimizar

---

## 🧪 Testando em Desenvolvimento

Em ambiente de desenvolvimento (`npm start`), os anúncios mostrarão um placeholder visual em vez de anúncios reais. Isso é intencional para:

- Evitar impressões falsas
- Visualizar onde os anúncios aparecerão
- Testar o layout sem afetar métricas

Para testar anúncios reais, faça deploy em produção.

---

## 🚀 Deploy no Render

Após configurar os IDs, faça deploy normalmente. O script do AdSense será carregado automaticamente em produção.

```bash
# Build command no Render
npm install --legacy-peer-deps && npm run build
```

---

## ❓ Solução de Problemas

### Anúncios não aparecem
1. Verifique se o ID do publisher está correto
2. Aguarde 24-48h após aprovação da conta
3. Verifique se o site está listado no painel do AdSense
4. Verifique o console do navegador por erros

### Erro "adsbygoogle.push() error"
- Normal em desenvolvimento (sem anúncios reais)
- Em produção, verifique se o slot está correto

### Anúncios aparecem em branco
- O AdSense pode não ter anúncios para exibir
- Tente diferentes formatos de anúncio
- Aguarde alguns dias para o sistema otimizar

---

## 📞 Suporte

- [Central de Ajuda do AdSense](https://support.google.com/adsense/)
- [Políticas do Programa AdSense](https://support.google.com/adsense/answer/48182)
