# Template — Plano de Mensuração (TráfegoPRO)

> Uso: skill `tracking-blueprint`, modo **implantacao**. Preencher TODAS as seções; o que não se aplicar recebe `N/A + justificativa`. Lacunas de informação ficam marcadas `[LACUNA — PESQUISAR]` ou `[PREMISSA — VALIDAR COM CLIENTE]` — nunca um número inventado.
> Saída final: `plano-mensuracao-<cliente>.md`.

---

## 1. Contexto do negócio

| Campo | Valor |
|---|---|
| Cliente / projeto | |
| Modelo de negócio | e-commerce / leadgen / SaaS / híbrido |
| Onde a venda fecha | checkout no site / CRM / WhatsApp / telefone / loja física |
| CRM / plataforma de vendas | (HubSpot, RD Station, Pipedrive, planilha...) |
| Stack do site | (Shopify, VTEX, WooCommerce, Next.js custom...) |
| GTM existente? | sim (ID GTM-______) / não — criar |
| GA4 existente? | sim (ID G-______) / não — criar |
| Conta Google Ads | CID ___-___-____ (propriedade do cliente: sim/não) |
| Tráfego EEA/UK? | sim / não → define obrigatoriedade do consent mode v2 (seção 7) |
| Ticket médio / ciclo de venda | (informado pelo cliente — base p/ janelas de conversão e valor de lead) |
| Media plan vinculado | output da skill `media-plan-builder` em: ______ |

---

## 2. Mapa de conversões

### 2.1 Regras de eleição (aplicar, não copiar)

1. **Primária = evento mais próximo de receita que tenha volume suficiente** para a estratégia de lance pretendida pelo `traffic-strategist`. Se o volume do evento-receita for baixo demais para smart bidding, subir um degrau no funil (ex.: de "venda fechada" para "lead qualificado") e documentar o trade-off. O limiar de volume recomendado pelo Google muda por estratégia — **pesquisar a orientação vigente via WebSearch, não usar número de cabeça**.
2. **Máximo de 1–3 primárias por conta** (idealmente 1 por objetivo de campanha). Mais que isso dilui o sinal do lance.
3. **Todo o resto é secundário**: serve a diagnóstico (`performance-analyst`), CRO (`cro-engineer` / `lp-cro-audit`) e construção de públicos — nunca a lances.
4. **Lead com qualidade desigual → valores por estágio** (lead bruto < lead qualificado < oportunidade), via enhanced conversions for leads ou import offline, para o smart bidding otimizar por qualidade e não por volume.

### 2.2 Tabela do mapa (preencher uma linha por evento)

| # | Evento (nome dataLayer/GA4) | Etapa do funil | Tipo | Fonte da ação no Ads | Contagem | Valor | Janela clique / view / engaged-view | Campanhas que usam |
|---|---|---|---|---|---|---|---|---|
| 1 | `purchase` | Macro — receita | **Primária** | Tag Google Ads (GTM) | Todas | dinâmico (`value` + `currency`) | __ / __ / __ dias | Search, PMax, Shopping |
| 2 | `generate_lead` | Macro — lead | Primária ou Secundária* | Tag Google Ads (GTM) | Uma | estático R$ ___ `[PREMISSA]` ou por estágio | __ / __ / __ | Search, Demand Gen |
| 3 | `lead_qualificado` (offline) | Macro — qualificação | Primária* | Import offline / EC for leads | Uma | R$ ___ (do CRM) | __ / __ / __ | Search |
| 4 | `begin_checkout` | Micro | Secundária | Import GA4 key event | Todas | sem valor | default | — (diagnóstico) |
| 5 | `add_to_cart` | Micro | Secundária | Import GA4 key event | Todas | sem valor | default | — (públicos + diagnóstico) |
| 6 | `view_item` | Micro | Secundária | GA4 (não importar) | — | — | — | — (remarketing) |
| 7 | `click_whatsapp` | Micro | Secundária | Import GA4 key event | Todas | sem valor | default | — (diagnóstico LP) |
| ... | | | | | | | | |

\* Decidir 2 vs. 3 conforme regra 2.1.1: se o funil fecha offline e o CRM permite retorno do dado, a primária ideal é o estágio qualificado, não o form bruto.

### 2.3 Janelas de conversão — guia de decisão

- Compra por impulso / ticket baixo → janela de clique curta reflete melhor a realidade.
- B2B / ticket alto / ciclo longo → janela de clique no máximo permitido; registrar que conversões "atrasadas" reabrem números de semanas passadas (avisar `performance-analyst` para o `performance-report`).
- View-through e engaged-view interessam a `video-display-specialist` (Demand Gen/YouTube) — definir explicitamente em vez de aceitar default cego.
- Registrar **toda** escolha na tabela 2.2; "default do Google" só é aceitável se anotado como decisão consciente.

---

## 3. Decisão de fonte: tag Google Ads direta × import de key event do GA4

```
O evento vai ALIMENTAR LANCES (primária)?
├─ SIM → Tag Google Ads via GTM (direta)
│        Motivos: dado mais fresco, suporte nativo a enhanced conversions,
│        transaction_id no campo dedicado, sem dependência da vinculação GA4.
│        → GA4 continua recebendo o MESMO evento para análise (fontes paralelas,
│          mas só a tag Ads conta conversão — regra "uma fonte de verdade").
└─ NÃO (secundária/diagnóstico) → Import de key event do GA4
         Motivos: zero tag extra, suficiente para observação,
         centraliza micro-eventos no GA4.

EXCEÇÃO: conta pequena/simples, sem enhanced conversions e sem valor dinâmico
→ aceitável operar 100% via import GA4; registrar o trade-off aqui: ______
```

---

## 4. Arquitetura GTM

### 4.1 Naming convention (obrigatória)

| Elemento | Padrão | Exemplos |
|---|---|---|
| Tag | `<Plataforma> - <Tipo> - <Evento>` | `GA4 - Evento - purchase` · `GAds - Conversao - purchase` · `GAds - Remarketing - Global` |
| Trigger | `<Tipo> - <Condição>` | `CE - purchase` (custom event) · `PV - /obrigado` (pageview) · `CL - btn-whatsapp` (click) |
| Variável | `<Origem> - <Nome>` | `DLV - transaction_id` · `DLV - value` · `DLV - user_data.email` · `CONST - Conversion ID` |
| Pasta | uma por finalidade | `01 GA4` · `02 Google Ads` · `03 Consent` · `04 Utilidades` |
| Ação de conversão (no Ads) | `[TP] <Macro> - <Origem>` | `[TP] Compra - Site` · `[TP] Lead - Form LP` · `[TP] Lead Qualificado - CRM` |

### 4.2 Inventário de tags (preencher)

| Tag | Trigger | Variáveis consumidas | Consent exigido |
|---|---|---|---|
| `GA4 - Config` (Google tag) | Initialization - All Pages | `CONST - GA4 ID` | `analytics_storage` |
| `GA4 - Evento - purchase` | `CE - purchase` | items, value, currency, transaction_id | `analytics_storage` |
| `GAds - Conversao - purchase` | `CE - purchase` | Conversion ID/Label, value, currency, `DLV - transaction_id`, `user_provided_data` | `ad_storage` |
| `GAds - Conversao - generate_lead` | `CE - generate_lead` | Conversion ID/Label, `user_provided_data` | `ad_storage` |
| `GAds - Remarketing - Global` | All Pages | Conversion ID | `ad_storage`, `ad_personalization` |
| (CMP) | Consent Initialization | — | — |

### 4.3 Spec de dataLayer (entregar ao dev do cliente como está)

**Compra — disparar na confirmação real do pedido (server-rendered ou callback de sucesso), nunca em clique de botão:**

```html
<script>
window.dataLayer = window.dataLayer || [];
dataLayer.push({ ecommerce: null }); // limpa o objeto anterior
dataLayer.push({
  event: "purchase",
  transaction_id: "PED-2026-000123",   // ID ÚNICO do pedido, vindo do backend
  value: 1299.90,                      // número com PONTO decimal, sem símbolo
  currency: "BRL",
  ecommerce: {
    items: [{
      item_id: "SKU-123",
      item_name: "Nome do produto",
      price: 1299.90,
      quantity: 1
    }]
  },
  user_data: {                          // para enhanced conversions (seção 6)
    email: "cliente@dominio.com",       // texto puro — o gtag faz o hash SHA-256
    phone_number: "+5511999998888",     // E.164 obrigatório
    address: {
      first_name: "Maria",
      last_name: "Silva",
      postal_code: "01310-100",
      country: "BR"
    }
  }
});
</script>
```

**Lead — disparar no callback de sucesso do formulário (não no submit):**

```html
<script>
dataLayer.push({
  event: "generate_lead",
  lead_id: "LEAD-000456",              // único, p/ dedup e p/ casar com o CRM
  form_id: "form-lp-principal",
  user_data: {
    email: "lead@dominio.com",
    phone_number: "+5511988887777"
  }
});
</script>
```

Regras da spec:
- `transaction_id` / `lead_id` nascem no **backend** e atravessam até o CRM — são a espinha da deduplicação (seção 8) e do casamento online↔offline.
- **PII jamais** em nome de evento, parâmetro de URL ou custom dimension do GA4; só dentro de `user_data` (consumido pelo enhanced conversions, hash feito pelo gtag).
- SPA: além dos pushes acima, emitir `page_view` virtual a cada rota.

---

## 5. Configuração GA4

| Item | Decisão |
|---|---|
| Eventos coletados | (lista da tabela 2.2) |
| Key events marcados | `purchase`, `generate_lead`, + ______ |
| Key events importados ao Ads | somente os marcados como "Import GA4" na tabela 2.2 |
| Retenção de dados | máxima disponível na edição da propriedade |
| Google signals / personalized ads | conforme política de privacidade do cliente: ☐ on ☐ off |
| Filtro tráfego interno | IPs: ______ |
| Unwanted referrals | gateways: ______ (ex.: pagseguro, mercadopago) |
| Cross-domain | domínios: ______ (se checkout externo) |
| Vinculação Google Ads | CID ___-___-____ ✅ |

---

## 6. Enhanced conversions

| Item | Decisão |
|---|---|
| Variante | ☐ Enhanced conversions for web ☐ for leads (funil fecha offline) ☐ ambas |
| Método (web) | ☐ Automático (campo de e-mail visível na página da tag) ☐ **Manual via `user_data` do dataLayer** (preferido — controle total) |
| Campos enviados | e-mail (mínimo) + telefone E.164 + nome + endereço quando disponíveis |
| Onde a tag dispara × onde a PII existe | confirmar que `user_data` está populado NA PÁGINA da conversão (persistir via dataLayer entre form → obrigado se preciso) |
| Variável GTM | `User-Provided Data` (tipo dedicado) lendo `DLV - user_data.*`, anexada às tags `GAds - Conversao - *` |
| Termos aceitos na conta Ads | ☐ sim |
| **For leads — circuito offline** | campo e-mail/telefone gravado no CRM `______`; quando o lead vira `lead_qualificado`/venda, upload/integração reenvia o dado à ação `[TP] Lead Qualificado - CRM`. Responsável: ______ · Frequência: ______ |
| Fallback se CRM não devolve dado | operar só com lead bruto e registrar como limitação ao `traffic-strategist` |

---

## 7. Consent mode v2

### 7.1 Decisões

| Item | Decisão |
|---|---|
| Tráfego EEA/UK | ☐ sim → consent mode v2 **obrigatório** ☐ não → estrutura recomendada + postura LGPD documentada |
| CMP | ______ (Cookiebot, OneTrust, Usercentrics, própria...) — **decisão jurídica é do cliente**, a TráfegoPRO implementa |
| Modo | ☐ **Advanced** (tags carregam, pings cookieless quando denied → habilita modelagem) ☐ Basic (nada carrega antes do aceite) |
| Defaults por região | EEA/UK: denied · Brasil: ______ `[VALIDAR COM JURÍDICO DO CLIENTE]` |

### 7.2 Snippet de default — no `<head>`, ANTES do snippet do GTM

```html
<script>
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',        // novo no v2 — obrigatório
  ad_personalization: 'denied',  // novo no v2 — obrigatório
  analytics_storage: 'denied',
  wait_for_update: 500,
  region: ['AT','BE','BG','HR','CY','CZ','DK','EE','FI','FR','DE','GR','HU',
           'IE','IT','LV','LT','LU','MT','NL','PL','PT','RO','SK','SI','ES',
           'SE','IS','LI','NO','GB']
});

// Default fora das regiões acima (ex.: Brasil) — ajustar à decisão jurídica do cliente:
gtag('consent', 'default', {
  ad_storage: 'granted',
  ad_user_data: 'granted',
  ad_personalization: 'granted',
  analytics_storage: 'granted'
});
</script>
```

O **update** (`gtag('consent','update',{...})`) é responsabilidade da CMP no aceite/recusa. Validação: Bloco 4 do `checklist-tracking.md` (parâmetros `gcs`/`gcd` nos hits).

---

## 8. Deduplicação

| Camada | Mecanismo |
|---|---|
| Recarga da página de obrigado | `transaction_id` no campo Transaction ID da tag Ads → Google ignora repetido |
| GA4 | mesmo `transaction_id` no evento `purchase` |
| Reenvio de formulário | contagem "Uma" + `lead_id` + trigger por evento de sucesso |
| Tag Ads × import GA4 do mesmo evento | **não há dedup automática** → uma única fonte primária (seção 3) |
| Online × offline (CRM) | `lead_id`/GCLID como chave de casamento; upload offline atualiza estágio em ação separada, não duplica a do form |
| E-mail transacional com link p/ página de obrigado | trigger por `CE - purchase` (dataLayer), nunca por pageview de URL |

---

## 9. Governança

- **Propriedade dos ativos**: GTM, GA4 e Ads na conta do cliente; TráfegoPRO com acesso admin nomeado.
- **Versionamento GTM**: toda publicação com nome `vNN - <resumo>` e descrição; rollback = republicar versão anterior.
- **Changelog** mantido neste documento (tabela abaixo).
- **Mudança em conversão primária** (trocar, pausar, mudar contagem/janela) exige aval do `traffic-strategist` — afeta smart bidding e reseta aprendizado.
- **Auditoria periódica**: a skill `account-audit` (do `account-auditor`) revalida este plano; divergências voltam para o modo verificacao desta skill.

| Data | Versão GTM | Mudança | Autor | Aprovado por |
|---|---|---|---|---|
| | | | | |

---

## 10. Monitoramento pós-go-live

| Item | Valor |
|---|---|
| Conversion Watchdog instalado (script do `checklist-tracking.md`) | ☐ sim — agendado a cada hora |
| `LOOKBACK_HOURS` / `MIN_SPEND` calibrados para a conta | ___ h / R$ ___ |
| Evolução do script | skill `gads-scripts` |
| Rotina humana/agente | verificação semanal dentro da `optimization-routine` (`optimization-executor`): status das ações de conversão + diagnóstico de enhanced conversions |
| Linha de corte de dados comunicada ao `performance-analyst` | data/hora: ______ |

---

## 11. Riscos, lacunas e pendências

| # | Item | Tipo | Responsável | Prazo |
|---|---|---|---|---|
| 1 | (ex.: CRM não expõe API p/ conversões offline) | Limitação | Cliente | |
| 2 | (ex.: volume de `purchase` possivelmente baixo p/ tROAS — pesquisar limiar vigente) | `[LACUNA — PESQUISAR]` | tracking-engineer | |
| 3 | (ex.: default LGPD `granted` aguardando aval jurídico) | `[PREMISSA — VALIDAR]` | Cliente | |

---

## 12. Assinatura do plano

| Campo | Valor |
|---|---|
| Elaborado por | agente tracking-engineer (TráfegoPRO) |
| Checklist pré-go-live executado | ☐ sim — veredito: GO / NO-GO (anexar `verificacao-tracking-<cliente>.md`) |
| Handoff feito para | `traffic-strategist` · `search-specialist` · `pmax-specialist` · `video-display-specialist` · `performance-analyst` · `cro-engineer` |
| Data | |
