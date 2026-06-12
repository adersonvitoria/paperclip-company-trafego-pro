# Blueprint Performance Max & Shopping — TráfegoPRO

Playbook operacional do agente **pmax-specialist**. Tudo aqui é pra ser copiado pro blueprint do cliente com os campos preenchidos — não é teoria.

---

## 1. Decisão inicial: PMax vs. Standard Shopping vs. ambos

Árvore de decisão (percorrer de cima pra baixo, parar na primeira que casar):

```
A conta tem conversões confiáveis (tracking validado) E ≥ ~30 conv/mês?
├─ NÃO → começar com Standard Shopping (lance manual ou Maximize Clicks com tCPC teto)
│        + Search de fundo de funil. PMax só depois que o histórico de conversão existir.
│        Smart bidding sem dado é chute caro.
└─ SIM
   ├─ E-commerce com feed aprovado?
   │  ├─ Catálogo grande (centenas+ SKUs), margens heterogêneas?
   │  │  → PMax feed-based segmentada por margem (custom_label) +
   │  │    Standard Shopping "catch-all" de baixa prioridade pra capturar
   │  │    queries que a PMax ignora e revelar search terms (Shopping mostra
   │  │    search terms; PMax mostra pouco).
   │  ├─ Catálogo pequeno (< ~50 SKUs), margem homogênea?
   │  │  → PMax única segmentada por categoria. Standard Shopping opcional.
   │  └─ Produto novo sem histórico?
   │     → Standard Shopping primeiro (2–4 semanas) pra mapear queries e CPCs
   │       reais, depois migrar verba pra PMax com esse aprendizado.
   └─ Lead-gen (sem feed)?
      → PMax lead-gen SOMENTE com enhanced conversions for leads + importação
        de leads qualificados (offline conversion import). Sem isso, PMax
        otimiza pra lead lixo. Alternativa enquanto isso: Search + Demand Gen.
```

**Regra de convivência PMax × Standard Shopping:** PMax tem prioridade sobre Standard Shopping pros mesmos produtos. A Standard só serve de catch-all se a PMax tiver listing groups excluindo o que a Standard cobre, ou se a Standard rodar com prioridade baixa e bid baixo pra pescar sobra de leilão. Documentar essa escolha no blueprint — sobreposição não-intencional é a causa nº 1 de "Shopping morreu do nada".

---

## 2. Naming convention (obrigatória em toda a conta)

Padrão TráfegoPRO:

```
[CANAL]-[TIPO]-[PAÍS/REGIÃO]-[SEGMENTAÇÃO]-[OBJETIVO]
```

| Campo | Valores | Exemplo |
|---|---|---|
| CANAL | PMAX, SHOP, SRCH, VID, DISP, DGEN | PMAX |
| TIPO | FEED, LEADGEN, CATCHALL | FEED |
| PAÍS/REGIÃO | BR, BR-SP, BR-SUL... | BR |
| SEGMENTAÇÃO | categoria, margem ou persona | MARGEM-A |
| OBJETIVO | TROAS400, TCPA80, MAXCONV... | TROAS400 |

Exemplos reais:
- `PMAX-FEED-BR-MARGEM-A-TROAS500`
- `PMAX-FEED-BR-MARGEM-B-TROAS300`
- `SHOP-CATCHALL-BR-ALL-LOWPRIO`
- `PMAX-LEADGEN-BR-PERSONA-CLINICAS-TCPA-PENDENTE`

Asset groups seguem: `AG-[tema]-[variação]`, ex.: `AG-tenis-corrida-performance`, `AG-tenis-corrida-casual`.

Por que importa: scripts, regras automatizadas e os relatórios do **performance-analyst** (skill `performance-report`) fazem parse do nome. Nome fora do padrão quebra automação.

---

## 3. Estrutura de campanhas e asset groups

### 3.1 Quantas campanhas PMax?

Separar em campanhas diferentes SOMENTE quando precisar de:
1. **Orçamentos independentes** (ex.: categoria estratégica com verba protegida);
2. **Metas de tROAS/tCPA diferentes** (margem A ≠ margem C);
3. **Geografias com economics diferentes**.

Todo o resto se resolve com asset groups dentro da mesma campanha. Campanha demais = dado diluído = aprendizado lento.

Estrutura padrão e-commerce (3 campanhas por margem via custom_label_0 — ver `checklist-feed.md` §5):

```
PMAX-FEED-BR-MARGEM-A-TROAS<alto>     ← heróis de margem, verba protegida
PMAX-FEED-BR-MARGEM-B-TROAS<médio>   ← corpo do catálogo
PMAX-FEED-BR-MARGEM-C-TROAS<baixo>   ← cauda/liquidação (ou excluir da mídia)
SHOP-CATCHALL-BR-ALL-LOWPRIO          ← Standard Shopping, prioridade baixa
```

### 3.2 Asset groups: tema, não formato

**Errado:** `AG-imagens`, `AG-videos`, `AG-geral`.
**Certo:** 1 asset group = 1 tema coeso de demanda (categoria de produto, persona ou oferta), com TODOS os formatos dentro dele.

Composição mínima por asset group (abaixo disso o Ad Strength trava em "Poor" e o alcance cai):

| Asset | Mínimo | Recomendado | Specs |
|---|---|---|---|
| Headlines | 5 | 11–15 | ≤ 30 caracteres |
| Long headlines | 1 | 3–5 | ≤ 90 caracteres |
| Descriptions | 2 | 4–5 | ≤ 90 caracteres (1ª com ≤ 60) |
| Imagens landscape | 1 | 4+ | 1200×628 (1.91:1) |
| Imagens square | 1 | 4+ | 1200×1200 (1:1) |
| Imagem portrait | 0 | 2+ | 960×1200 (4:5) |
| Logos | 1 | 2 (1:1 e 4:1) | 1200×1200 / 1200×300 |
| Vídeos | 0* | 2–3 (16:9, 9:16, 1:1) | ≥ 10s |
| Business name | 1 | 1 | ≤ 25 caracteres |
| Sitelinks (campanha) | 2 | 4+ | — |

\* Se não subir vídeo, o Google **gera um automaticamente** com as imagens — quase sempre ruim pra marca. Regra TráfegoPRO: sempre subir ao menos 1 vídeo próprio por asset group, nem que seja um slideshow bem-feito. Pedir ao **video-display-specialist** (skill `video-display-builder`) quando não houver material.

Copies vêm do **ad-copywriter** via skill `ad-copy-builder` — pedir o pacote já no formato da tabela acima, por tema.

### 3.3 Search themes

Até 25 por asset group. Usar como dica, não como keyword: o Google trata como sinal, com precedência menor que keywords exatas de campanhas de Search existentes. Fonte: output da skill `keyword-research` do **market-intel** — usar os clusters de cabeça de cauda, não keywords longtail soltas.

### 3.4 Final URL expansion

- **E-commerce:** ON, com exclusões de URL (ver §6.3) — deixa a PMax achar landing pages de produto.
- **Lead-gen:** OFF na maioria dos casos — você quer controle total da LP (alinhar com a auditoria `lp-cro-audit` do **cro-engineer**).

---

## 4. Audience signals (por asset group)

Audience signal NÃO é targeting — é ponto de partida do aprendizado. Mas signal vazio = aprendizado mais caro. Montar nesta ordem de prioridade:

1. **First-party data (peso máximo):**
   - Customer Match: lista de compradores (e-commerce) ou de leads qualificados/clientes (lead-gen). Mínimo de 1.000 contatos válidos pra ativar.
   - Visitantes do site 30/90 dias, abandonos de carrinho, compradores 180 dias (este último mais útil como base de exclusão ou de lookalike comportamental).
2. **Custom segments:**
   - Pessoas que pesquisaram no Google os termos de cabeça do cluster (puxar da `keyword-research`).
   - Pessoas que visitam sites de concorrentes (URLs do output da `competitor-recon`).
3. **In-market e affinity:** só os 2–3 mais óbvios da vertical. Não empilhar 15 segmentos genéricos.
4. **Demografia:** restringir só quando o produto exige (ex.: idade mínima legal).

Template de tabela pro blueprint (preencher por asset group):

```markdown
| Asset group | Customer Match | Site visitors | Custom segment (search) | Custom segment (URLs concorrentes) | In-market |
|---|---|---|---|---|---|
| AG-<tema> | compradores-180d | carrinho-30d | "<termo1>, <termo2>" | <concorrente1>.com.br, <concorrente2>.com.br | <segmento> |
```

---

## 5. Estratégia de lance por estágio

Gatilhos de transição baseados em **volume de conversões da própria campanha** (não da conta inteira). Os números abaixo são regras operacionais da TráfegoPRO pra dar segurança estatística ao smart bidding — não são benchmarks de mercado.

| Estágio | Condição | Estratégia | Regras |
|---|---|---|---|
| 1. Lançamento | 0–30 dias ou < 30 conv/mês | **Maximize Conversions** (lead-gen) / **Maximize Conversion Value** (e-commerce), SEM meta | Não definir tCPA/tROAS sem histórico — meta chutada estrangula entrega. Orçamento estável; não mexer por 2 semanas (aprendizado). |
| 2. Calibração | ≥ 30 conv nos últimos 30 dias | Introduzir **tCPA/tROAS** no valor que a campanha JÁ entrega (CPA/ROAS real dos últimos 30 dias, não o desejado) | Apertar a meta no máx. 10–15% por vez, com ≥ 1 semana entre ajustes. |
| 3. Eficiência | ≥ 50–100 conv/30d, meta estável por 4+ semanas | tROAS/tCPA na meta de negócio (do `media-plan-builder`) | Escalar orçamento ≤ 20% por vez. Orçamento + meta no mesmo dia = reset de aprendizado: nunca. |
| 4. Expansão | Meta batida com orçamento limitado (campanha "Limited by budget") | Subir orçamento mantendo meta; avaliar nova campanha pra novo segmento de margem/região | Antes de escalar, rodar `account-audit` (agente **account-auditor**) pra confirmar que não há vazamento inflando o ROAS. |

**Lead-gen com valores:** assim que o CRM permitir, atribuir valores diferentes por estágio do funil (lead 10, MQL 50, venda 500 — proporção, não moeda) e migrar pra Maximize Conversion Value + tROAS. Coordenar com o **tracking-engineer** (skill `tracking-blueprint`) pra offline conversion import.

**Seasonality adjustments:** usar SOMENTE pra eventos curtos (≤ 7 dias) com mudança brusca e previsível de taxa de conversão (Black Friday, lançamento). Não usar pra "dar um gás".

---

## 6. Exclusões — onde a PMax sangra verba

### 6.1 Brand exclusions

PMax canibaliza brand por padrão: o clique de marca que custaria centavos na Search de brand entra no ROAS da PMax e infla o resultado.

- Configurar **brand exclusions** na campanha PMax (Configurações → Brand exclusions) com a brand list da marca do cliente — cobre Search e Shopping dentro da PMax.
- Se existir campanha `SRCH-BRAND-*` na conta (skill `search-campaign-builder` do **search-specialist**), a exclusão é **obrigatória**, não opcional.
- Variações com typo da marca: adicionar à brand list (o matching do Google pega parte, não tudo).
- **Medir o efeito:** comparar ROAS da PMax antes/depois da exclusão. Queda forte = a campanha vivia de brand. Reportar isso com honestidade no `performance-report`.

### 6.2 Placement e content exclusions

- **Account-level placement exclusions** (Conteúdo → Exclusões, nível de conta — é o único nível que afeta PMax):
  - Categorias de apps onde display de PMax vira clique acidental (jogos infantis etc.) — avaliar por vertical.
  - Lista de domínios/canais de baixa qualidade identificados no relatório de placements.
- **Relatório de onde a PMax apareceu:** Relatórios → Relatório predefinido → "Performance Max placements". Mostra impressões (não custo) — ainda assim revela apps lixo. Rodar quinzenalmente via `optimization-routine` (agente **optimization-executor**).
- **Content suitability** (nível de conta): excluir conteúdo sensível incompatível com a marca; ativar listas de exclusão de site/app compartilhadas.

### 6.3 Exclusões de URL (com Final URL expansion ON)

Excluir sempre: `/carrinho`, `/checkout`, `/login`, `/minha-conta`, `/politica-*`, `/trocas-e-devolucoes`, blog institucional sem oferta. Padrões via regra de URL contém.

### 6.4 Negative keywords na PMax

Campaign-level negative keywords pra PMax estão disponíveis na interface (rollout concluído em 2024–2025; confirmar o limite vigente via WebSearch se for relevante). Usar pra: termos de concorrente que não convertem, termos institucionais (vagas, trabalhe conosco, reclame aqui), e SKUs descontinuados. Pra exclusões em massa, solicitar account-level negatives ou usar a lista compartilhada quando disponível.

### 6.5 Exclusão de clientes existentes (aquisição)

Configuração "Bid only for new customers" ou "New customer value": exige Customer Match saudável. Usar quando a meta do `media-plan-builder` for aquisição — senão a PMax remarketeia a base e chama de performance.

---

## 7. Conversões e tracking (pré-requisito, não detalhe)

Validar com o **tracking-engineer** (output da skill `tracking-blueprint`) antes de publicar:

- [ ] **Conversão primária única e correta** por objetivo: e-commerce = `purchase` com valor dinâmico e moeda; lead-gen = lead qualificado, NUNCA pageview de obrigado como primária junto com o form submit (duplica).
- [ ] Demais eventos (add_to_cart, begin_checkout, view_item) marcados como **secundários** — observação, não otimização.
- [ ] **Consent Mode v2** ativo (parâmetros `ad_user_data` e `ad_personalization`) — sem isso, perda de mensuração de audiências EEA e degradação de modeling; no Brasil, manter alinhado à LGPD e ao banner de consentimento do site.
- [ ] **Enhanced Conversions** (web pra e-commerce; for leads + offline import pra lead-gen) ativas e com diagnóstico "Recording conversions" verde.
- [ ] Janela de conversão coerente com o ciclo de venda (ticket alto = janela maior; documentar a escolhida).
- [ ] Atribuição data-driven (padrão) — se a conta usa last click, anotar e discutir antes.
- [ ] GA4 linkado e importação de conversão sem dupla contagem (ou Google Ads tag OU GA4 import como primária — nunca os dois pro mesmo evento).

---

## 8. Scripts Google Ads (JavaScript)

### 8.1 Alerta diário de orçamento e anomalia de gasto PMax

```javascript
// TráfegoPRO — alerta diário: gasto anômalo em campanhas PMax
// Agendar: diariamente, 08:00. Editar EMAIL e LIMITE.
var EMAIL = 'gestor@cliente.com.br';
var VARIACAO_MAX = 0.4; // alerta se gasto de ontem variar >40% vs média 7d

function main() {
  var report = AdsApp.report(
    "SELECT campaign.name, metrics.cost_micros " +
    "FROM campaign " +
    "WHERE campaign.advertising_channel_type = 'PERFORMANCE_MAX' " +
    "AND campaign.status = 'ENABLED' " +
    "AND segments.date DURING LAST_7_DAYS"
  );
  var porCampanha = {};
  var rows = report.rows();
  while (rows.hasNext()) {
    var r = rows.next();
    var nome = r['campaign.name'];
    var custo = parseInt(r['metrics.cost_micros'], 10) / 1e6;
    if (!porCampanha[nome]) porCampanha[nome] = [];
    porCampanha[nome].push(custo);
  }
  var alertas = [];
  for (var nome in porCampanha) {
    var dias = porCampanha[nome];
    var ontem = dias[dias.length - 1];
    var media = dias.slice(0, -1).reduce(function(a, b) { return a + b; }, 0) /
                Math.max(dias.length - 1, 1);
    if (media > 0 && Math.abs(ontem - media) / media > VARIACAO_MAX) {
      alertas.push(nome + ': ontem R$' + ontem.toFixed(2) +
                   ' vs média 7d R$' + media.toFixed(2));
    }
  }
  if (alertas.length > 0) {
    MailApp.sendEmail(EMAIL, '[TráfegoPRO] Gasto anômalo em PMax',
                      alertas.join('\n'));
  }
}
```

### 8.2 Vigia de reprovações no feed (Shopping/PMax feed-based)

```javascript
// TráfegoPRO — alerta de produtos reprovados via relatório de product group
// Agendar: diariamente. Complementa (não substitui) o Merchant Center.
var EMAIL = 'gestor@cliente.com.br';
var LIMIAR_QUEDA_IMPRESSOES = 0.5; // queda >50% de impressões dia-a-dia

function main() {
  var query =
    "SELECT campaign.name, metrics.impressions, segments.date " +
    "FROM shopping_performance_view " +
    "WHERE segments.date DURING LAST_3_DAYS";
  var report = AdsApp.report(query);
  var porDia = {};
  var rows = report.rows();
  while (rows.hasNext()) {
    var r = rows.next();
    var d = r['segments.date'];
    porDia[d] = (porDia[d] || 0) + parseInt(r['metrics.impressions'], 10);
  }
  var datas = Object.keys(porDia).sort();
  if (datas.length >= 2) {
    var anteontem = porDia[datas[datas.length - 2]];
    var ontem = porDia[datas[datas.length - 1]];
    if (anteontem > 0 && (anteontem - ontem) / anteontem > LIMIAR_QUEDA_IMPRESSOES) {
      MailApp.sendEmail(EMAIL,
        '[TráfegoPRO] Queda brusca de impressões Shopping — verificar feed',
        'Impressões: ' + anteontem + ' → ' + ontem +
        '. Causa provável: reprovação em massa no Merchant Center. ' +
        'Rodar checklist-feed.md §7 imediatamente.');
    }
  }
}
```

Scripts mais elaborados (n-gram de search terms da Standard Shopping, pacing de orçamento mensal) ficam na skill `gads-scripts` do **tracking-engineer** — referenciar, não duplicar.

---

## 9. Checklist pré-publicação (gate final)

Copiar pro blueprint e marcar cada item. **Qualquer item da seção A em aberto = não publica.**

### A. Bloqueadores
- [ ] Conversão primária validada pelo tracking-engineer (§7 completo)
- [ ] Consent Mode v2 + Enhanced Conversions com diagnóstico verde
- [ ] Feed aprovado no Merchant Center sem reprovações em itens core (e-commerce — ver `checklist-feed.md`)
- [ ] Brand exclusions configuradas (se existe Search de brand)
- [ ] Faturamento/billing da conta ativo e sem alerta
- [ ] Orçamento diário = verba mensal do media plan ÷ 30,4 (sem "testar com pouquinho" — PMax subverbada não aprende)

### B. Estrutura
- [ ] Naming convention aplicada em campanhas e asset groups
- [ ] 1 tema por asset group; nenhum asset group "geral"
- [ ] Assets mínimos por asset group (tabela §3.2) — Ad Strength ≥ "Good"
- [ ] Vídeo próprio em todo asset group (nada de vídeo auto-gerado)
- [ ] Audience signals preenchidos (tabela §4) com ao menos 1 fonte first-party
- [ ] Search themes carregados a partir da keyword-research
- [ ] Final URL expansion decidida e exclusões de URL aplicadas
- [ ] Listing groups conferem com a segmentação por custom_label (e-commerce)

### C. Proteções
- [ ] Placement exclusions de conta aplicadas
- [ ] Negative keywords de campanha carregadas (institucional, concorrente não-conversor)
- [ ] Content suitability configurada
- [ ] Geo targeting em "Presence" (presença física), não "Presence or interest" — salvo decisão explícita
- [ ] Exclusão de clientes existentes configurada se a meta é aquisição

### D. Pós-publicação (agendar)
- [ ] Scripts §8 instalados e agendados
- [ ] `optimization-routine` agendada (D+3 primeira checagem leve; sem mudança estrutural por 2 semanas)
- [ ] Primeira leitura de performance com o **performance-analyst** marcada pra depois do aprendizado
- [ ] Auditoria de placements PMax quinzenal no calendário

---

## 10. Anti-padrões (o que esta skill nunca recomenda)

1. PMax como primeira e única campanha numa conta sem histórico de conversão.
2. tROAS agressivo no dia 1 ("o cliente quer 800%") — define meta a campanha não entrega impressão nenhuma.
3. Asset group único com o catálogo inteiro.
4. Pausar/reativar PMax em ciclos curtos — cada pausa longa reseta aprendizado.
5. Julgar PMax por CTR ou CPC isolados — é campanha de conversão multi-inventário; CTR mistura Search com Display e não significa nada sozinho.
6. Copiar benchmark de "ROAS bom" de outra vertical. Quando o cliente pedir referência de mercado, pesquisar via WebSearch fontes recentes e citar a fonte, ou declarar que o número confiável virá das primeiras 2–4 semanas da própria conta.
