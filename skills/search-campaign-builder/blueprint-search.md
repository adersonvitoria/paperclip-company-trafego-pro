# Blueprint Search — Playbook Técnico TráfegoPRO

Playbook operacional do agente `search-specialist` para montar campanhas Google Ads Search prontas para publicar. Este documento define **como decidir** (árvores de decisão), **o que entregar** (template preenchível) e **como validar** (checklists). Tudo aqui é padrão interno da TráfegoPRO — onde um número de mercado seria necessário (volume, CPC, benchmark de CTR), o agente pesquisa ou declara a lacuna; os limiares operacionais listados são **heurísticas internas da casa** e devem ser apresentados como tal.

---

## 1. Arquitetura de campanha

### 1.1 Princípio: segmente por intenção, não por palavra

A unidade de segmentação é a **intenção de busca**, não a keyword isolada. SKAG (single keyword ad group) está obsoleto desde a expansão de close variants: grupos de 1 keyword fragmentam dados, multiplicam manutenção e não dão controle real. O padrão TráfegoPRO é **STAG (single theme ad group)**: cada ad group cobre **uma intenção** com 5–20 keywords que disparariam honestamente o **mesmo anúncio**.

Teste do anúncio único: *"Eu escreveria a mesma headline 1 para todas as keywords deste grupo?"* Se não, divida o grupo.

### 1.2 Separação de campanhas (em ordem de prioridade de implantação)

| # | Campanha | Intenção | Quando criar | Por que separada |
|---|---|---|---|---|
| 1 | **Marca (Brand)** | Navegacional — buscam o nome do cliente | Sempre que a marca tem busca própria ou concorrente anuncia nela | CPC baixíssimo e CTR altíssimo distorcem médias; budget e lance precisam ser próprios |
| 2 | **Core / Categoria** | Comercial — buscam o produto/serviço sem citar marca | Sempre (é o coração da conta) | É onde mora o crescimento; precisa de budget protegido da marca |
| 3 | **Fundo de funil** | Transacional explícita ("comprar", "preço", "orçamento", "perto de mim") | Quando há volume suficiente para separar do core | Lances mais agressivos e copies de fechamento |
| 4 | **Concorrente** | Buscam marcas concorrentes | Só em Modo Expansão, com budget-teste isolado | Quality Score estruturalmente baixo, CPC alto; nunca pode contaminar o core |
| 5 | **Broad-teste / mineração** | Descoberta de termos novos | Só em Modo Expansão, com Smart Bidding já maduro | Broad match exige isolamento: budget próprio + negativação pesada |
| 6 | **DSA (Dynamic Search Ads)** | Cobertura de cauda longa via site | Só com site grande, bem indexado e tracking maduro | Funciona como minerador; alimenta o core com termos novos |

Regras de ouro:
- **Campanha de marca SEMPRE separada.** Misturar marca com categoria é o erro nº 1 em contas herdadas — infla ROAS aparente e esconde a performance real do core.
- **Negative cross entre campanhas é obrigatório:** termos de marca negativados (exact) em todas as campanhas não-marca; termos de concorrente negativados no core; o inverso também.
- **1 campanha = 1 objetivo de conversão primária.** Não misture "lead" e "ligação" como conversões primárias na mesma campanha se os valores forem muito diferentes.

### 1.3 Dimensões adicionais de separação (usar só quando justificado)

- **Geografia:** separar campanhas por região apenas se (a) budget, (b) margem ou (c) idioma diferem materialmente entre regiões. Caso contrário, usar ajuste de lance por localização.
- **Device:** não separar campanhas por device (recurso descontinuado na prática via Smart Bidding); usar observação + ajustes apenas em lances manuais.
- **Rede:** **desmarcar Display Network sempre** em campanhas Search. Search Partners: desligado por padrão em conta nova; testar em Modo Expansão olhando o segmento de rede no relatório.

### 1.4 Quantidades de referência (heurística interna TráfegoPRO)

- Conta nova: 1–2 campanhas, 3–6 ad groups por campanha, 5–20 keywords por ad group.
- Budget diário mínimo viável por campanha: o suficiente para ~10 cliques/dia ao CPC estimado do nicho — se o budget não compra isso, **reduza o escopo** (menos campanhas, menos keywords, geo menor) em vez de pulverizar. CPC estimado: pesquisar ou marcar **[VALIDAR no Planejador de Palavras-chave]**.

---

## 2. Match types por estágio da conta

### 2.1 O que cada match type faz hoje (pós close variants)

- **Exact `[keyword]`** — corresponde à keyword e variações próximas com **mesma intenção** (plural, erro de digitação, parafrase, mesma intenção implícita). Não é mais "exato" literal. Máximo controle, mínimo alcance.
- **Phrase `"keyword"`** — buscas que **incluem o significado** da keyword. Equilíbrio controle/alcance. É o cavalo de batalha da TráfegoPRO.
- **Broad `keyword`** — buscas **relacionadas** ao tema, usando sinais do usuário e da landing page. Alcance máximo, controle mínimo. Só funciona bem acoplado a Smart Bidding com dados; sem isso, queima budget em termos irrelevantes.

### 2.2 Matriz match type × estágio

| Estágio | Exact | Phrase | Broad | Racional |
|---|---|---|---|---|
| **Conta nova (0–30 conversões acumuladas)** | Núcleo: termos de maior intenção | Sim: cobertura do tema | **Não** | Sem dados de conversão, broad é roleta. Phrase já minera termos suficientes via relatório de search terms |
| **Em tração (Smart Bidding ativo e estável)** | Mantém os comprovados | Mantém | Campanha-teste isolada, 10–20% do budget | Broad + tCPA/tROAS é a combinação que o algoritmo precisa; testar isolado protege o core |
| **Madura** | Termos de fundo de funil com lance/valor diferenciado | Estrutura principal | Pode virar estrutura principal SE o teste provou CPA/ROAS equivalente ou melhor por 2+ ciclos de 30 dias | Decisão por dado, nunca por default |

### 2.3 Convivência de match types

- A mesma keyword em exact e phrase **pode** coexistir (o Google prioriza exact idêntico ao termo de busca), mas só duplique quando quiser lance/acompanhamento separado no termo exato. Caso contrário, phrase basta.
- **Nunca** rodar a mesma keyword em broad e phrase no mesmo ad group — redundância sem controle.

---

## 3. Estratégia de lances — árvore de decisão por maturidade

> Os limiares abaixo são **heurísticas operacionais da TráfegoPRO**, não regras publicadas pelo Google. O racional: Smart Bidding precisa de volume de conversões consistente para sair da variância; com pouco dado, ele oscila e estoura CPA.

```
INÍCIO
│
├─ O tracking de conversão está validado (checklist §7 aprovado)?
│   ├─ NÃO → PARE. Acionar tracking-engineer (skill tracking-blueprint).
│   │         Enquanto isso, no máximo: Manual CPC ou Maximize Clicks
│   │         com teto de CPC, tratando a campanha como compra de dados.
│   └─ SIM ↓
│
├─ Conversões registradas nos últimos 30 dias (na campanha ou conta)?
│   │
│   ├─ ~0–15/mês  → FASE 1 — COLETA
│   │   Estratégia: Maximize Clicks COM teto de CPC (obrigatório)
│   │               ou Manual CPC se quiser controle granular.
│   │   Objetivo: validar termos, QS e taxa de conversão da LP.
│   │   Sair da fase quando: conversões consistentes por 2+ semanas.
│   │
│   ├─ ~15–30/mês → FASE 2 — TRANSIÇÃO
│   │   Estratégia: Maximize Conversions SEM target.
│   │   Deixar o algoritmo aprender o perfil de conversão.
│   │   Risco conhecido: CPC pode subir — monitorar diariamente na 1ª semana.
│   │   Sair da fase quando: CPA médio estabilizou por 2–3 semanas.
│   │
│   ├─ 30+/mês    → FASE 3 — EFICIÊNCIA (leads)
│   │   Estratégia: Maximize Conversions COM target CPA.
│   │   tCPA inicial = CPA médio real dos últimos 30 dias (NUNCA o CPA
│   │   desejado pelo cliente — aperto vem depois, em passos).
│   │   Ajustes de tCPA: máximo ±10–15% por vez, com 1–2 semanas
│   │   entre ajustes (cada mudança reinicia parte do aprendizado).
│   │
│   └─ 30–50+/mês COM valores de conversão confiáveis (e-commerce
│       ou lead scoring com valor) → FASE 3B — VALOR
│       Estratégia: Maximize Conversion Value COM target ROAS.
│       tROAS inicial = ROAS médio real dos últimos 30 dias.
│       Pré-requisito duro: valores de conversão dinâmicos no tracking.
│
└─ Campanha de MARCA (qualquer fase):
    Target Impression Share (topo absoluto, 90–95%) com teto de CPC,
    ou Manual CPC baixo. Nunca tCPA em marca — desperdiça dado de
    aprendizado em conversões que viriam de qualquer forma.
```

**Regras anexas:**
- **Janela de aprendizado:** após qualquer troca de estratégia ou ajuste forte de target/budget, esperar ~1–2 semanas antes de julgar performance. Proibido "ajuste em cima de ajuste".
- **Budget vs. target:** se a campanha é limitada por orçamento com tCPA/tROAS, o target vira sugestão — primeiro resolva budget ou escopo.
- **Portfólio de lances:** usar bid strategy de portfólio quando várias campanhas compartilham o mesmo CPA-alvo e individualmente têm pouco volume.
- **Sazonalidade:** picos previsíveis (Black Friday, datas do nicho) → usar Seasonality Adjustments, nunca trocar a estratégia às vésperas.

---

## 4. Negativação — sistema de 3 camadas

### Camada 1 — Lista universal (nível conta / lista compartilhada `[NEG] Universal`)
Aplicada a todas as campanhas desde o dia 1. Categorias mínimas a preencher conforme o nicho:
- **Gratuito/DIY:** grátis, gratuito, free, como fazer, faça você mesmo, tutorial, passo a passo, manual
- **Emprego:** vaga, vagas, emprego, currículo, salário, trabalhe conosco, concurso
- **Educacional puro:** o que é, significado, definição, wikipedia, monografia, tcc
- **Segunda mão / pirataria (se aplicável):** usado, crackeado, download, torrent, mercado livre*, olx* (*avaliar por nicho — em alguns nichos marketplaces são tráfego válido)
- **Irrelevantes recorrentes do nicho:** preencher a partir do `competitor-recon` / pesquisa

### Camada 2 — Listas temáticas compartilhadas
- `[NEG] Marca` — termos da marca do cliente em **exact negativo**, aplicada a todas as campanhas exceto a de marca (impede o core de canibalizar marca).
- `[NEG] Concorrentes` — marcas concorrentes, aplicada ao core (impede o core de pagar caro por busca de concorrente sem copy adequada). A campanha de concorrente, se existir, fica fora desta lista.
- `[NEG] Cross-campanha` — direcionadores de funil: termos de fundo ("comprar", "preço") negativados em phrase na campanha de topo/categoria quando existe campanha de fundo dedicada.

### Camada 3 — Negativação contínua (nível ad group/campanha)
Rotina operacional (executada pelo `optimization-executor` via skill `optimization-routine`, ou automatizada via `gads-scripts`):
- **Frequência:** 2x/semana nas primeiras 4 semanas; semanal depois.
- **Critérios de corte (heurística interna — ajustar ao CPA-alvo do cliente):**
  - Termo com gasto > 1× CPA-alvo e 0 conversões → negativar (exact) ou mover para ad group próprio se for relevante com copy errada.
  - Termo claramente irrelevante com qualquer gasto → negativar imediatamente; se for um padrão, promover à lista universal.
  - Termo convertendo bem que não está como keyword → **adicionar como keyword** (exact ou phrase) no ad group certo — negativação e mineração são o mesmo ritual.
- **Match types negativos não têm close variants:** cubra plural/singular e erros de grafia frequentes manualmente.
- **Cuidado em broad-teste:** negativar phrase demais estrangula a mineração — preferir exact negativo cirúrgico.

---

## 5. Quality Score — framework de diagnóstico e ação

QS (1–10) é composto de 3 fatores visíveis por keyword. Tratar como **ferramenta de diagnóstico**, não como KPI a perseguir — a meta é CPA/ROAS, e QS alto é consequência de relevância.

| Fator | Status possível | Ação quando "Abaixo da média" |
|---|---|---|
| **CTR esperado** | Acima / Média / Abaixo | Reescrever RSAs com o termo central na H1; revisar se a keyword está no grupo certo (teste do anúncio único §1.1); revisar match contra search terms reais |
| **Relevância do anúncio** | Acima / Média / Abaixo | Garantir que a intenção do grupo aparece nas headlines; dividir ad group se cobre 2 intenções; acionar `ad-copywriter` (skill `ad-copy-builder`) para ângulos novos |
| **Experiência na LP** | Acima / Média / Abaixo | Promessa do anúncio = promessa da LP (message match); velocidade mobile; acionar `cro-engineer` (skill `lp-cro-audit`) |

**Regras operacionais (heurística interna):**
- QS ≤ 4 persistente em keyword com gasto relevante → tratar como incidente: ou conserta (grupo/copy/LP) ou pausa. Manter keyword de QS baixo queimando budget é proibido.
- QS 5–6 → fila de melhoria, priorizada por gasto.
- QS 7+ → não mexer por QS; otimizar por CPA/ROAS.
- QS de campanha de **concorrente** é estruturalmente baixo (3–5) — esperado, não "consertável"; avaliar essa campanha só por CPA.
- Keywords com poucas impressões não têm QS confiável — ignorar QS de cauda longa recém-criada.

---

## 6. RSAs e Assets

### 6.1 Especificação de RSA (por ad group — mínimo 1, ideal 2 RSAs)

**Obrigatório:** 15 headlines (até 30 caracteres cada) + 4 descriptions (até 90 caracteres cada). Meta de Ad Strength: "Good" ou "Excellent" — mas Ad Strength é diagnóstico de diversidade, não promessa de performance.

**Mix de headlines TráfegoPRO (preencher as 15 com ângulos realmente distintos):**

| Slots | Ângulo | Exemplo de molde |
|---|---|---|
| 1–3 | Keyword/intenção do grupo | "{Serviço} em {Cidade}" / "{Produto} com {Atributo-chave}" |
| 4–5 | Proposta de valor / diferencial | "{Diferencial verificável do cliente}" |
| 6–7 | Prova social / autoridade | "+{N} clientes atendidos" — **só com número real fornecido pelo cliente** |
| 8–9 | CTA direto | "Peça seu Orçamento", "Fale com um Especialista" |
| 10–11 | Urgência/oferta (se houver oferta real) | "Condição válida até {data}" — nunca urgência falsa |
| 12–13 | Objeção/risco | "Sem fidelidade", "Garantia de {X}" — só se verdadeiro |
| 14–15 | Marca / confiança | "{Marca} — Desde {ano}" |

**Pinning:** por padrão, **não pinar** (pinning reduz combinações e tende a reduzir Ad Strength). Exceções permitidas e documentadas: (a) compliance/jurídico exige texto fixo; (b) marca obrigatória na H1 por guideline do cliente. Ao pinar, pinar 2–3 headlines na mesma posição (não 1) para preservar variação.

**Descriptions:** 4 ângulos distintos — (1) benefício central + CTA, (2) prova/diferencial, (3) tratamento de objeção, (4) oferta/escopo do serviço. Nunca 4 variações da mesma frase.

**Paths de display:** sempre preencher os 2 (15 caracteres cada) com a intenção do grupo: `dominio.com/{categoria}/{intencao}`.

**Final URL:** a LP mais específica disponível para a intenção do grupo — nunca a home se existir página de categoria/serviço. Copies finais refinadas são trabalho do `ad-copywriter` (skill `ad-copy-builder`); o blueprint entrega a primeira versão completa.

### 6.2 Assets (extensões) — mínimos por campanha

| Asset | Mínimo | Regras TráfegoPRO |
|---|---|---|
| **Sitelinks** | 4 (ideal 6–8) | Cada um com 2 linhas de descrição; apontar para páginas distintas e reais; nada de 4 sitelinks pra mesma URL |
| **Callouts** | 6+ | Diferenciais curtos e verificáveis ("Atendimento 24h", "Parcelamento em 12x") — sem CTA, sem pontuação final |
| **Structured snippets** | 2 cabeçalhos | Escolher cabeçalho que exista de verdade (Serviços, Marcas, Tipos…) com 4+ valores |
| **Call asset** | Se objetivo inclui ligação | Com horário de exibição = horário de atendimento real; conversão de chamada configurada |
| **Lead form** | Avaliar | Só se o cliente consome leads rápido; senão, form da LP rastreado é melhor |
| **Location** | Se negócio local | Exige vínculo com Perfil da Empresa no Google |
| **Image** | Recomendado | Imagens próprias do cliente, nos ratios exigidos; sem banco de imagem genérico com texto |
| **Price / Promotion** | Se aplicável | Apenas com preços/promoções reais e atualizáveis |

---

## 7. Checklist de tracking, Consent Mode e Enhanced Conversions

**Itens bloqueantes — sem isso o blueprint NÃO é "pronto para publicar".** Implementação é do `tracking-engineer` (skill `tracking-blueprint`); o search-specialist valida.

### 7.1 Conversões
- [ ] Ação de conversão **primária** definida e única por objetivo de campanha (as demais como secundárias/observação).
- [ ] Origem correta: tag Google Ads direta ou import GA4 — **não as duas contando em paralelo** (dupla contagem).
- [ ] Contagem: "Uma" para leads; "Todas" para compras.
- [ ] Janela de conversão coerente com o ciclo de venda do cliente.
- [ ] Teste real executado: conversão de teste disparada e registrada (Tag Assistant / aba Diagnóstico).
- [ ] Valores de conversão dinâmicos, se a meta futura é tROAS.

### 7.2 Consent Mode (obrigatório para tráfego do EEA/UK; recomendado como padrão LGPD no Brasil)
- [ ] CMP (banner de consentimento) implementada na LP e no site.
- [ ] Consent Mode **v2** ativo com os 4 sinais: `ad_storage`, `analytics_storage`, `ad_user_data`, `ad_personalization`.
- [ ] Comportamento de tag verificado nos dois estados (consent granted / denied).
- [ ] Se houver qualquer tráfego/remarketing no EEA: sem Consent Mode v2 as listas e a mensuração degradam — tratar como bloqueante; no Brasil, registrar a decisão do cliente por escrito.

### 7.3 Enhanced Conversions
- [ ] Enhanced conversions for leads/web ativado na ação de conversão.
- [ ] Dado first-party (email/telefone) capturado no form e enviado **hasheado (SHA-256)** via tag/GTM.
- [ ] Diagnóstico da ação de conversão sem alertas após 48–72h da publicação.

### 7.4 UTMs e auto-tagging
- [ ] Auto-tagging (GCLID) **ativado** na conta.
- [ ] UTMs no padrão da `naming-convention.md` §6 via tracking template — UTMs **não substituem** GCLID, convivem com ele.

---

## 8. Configurações de campanha — checklist pré-publicação

- [ ] Rede: Display **desmarcado**; Search Partners conforme estágio (§1.3).
- [ ] Localização: opção de presença **"Presença: pessoas em ou regularmente em"** (nunca o default "presença ou interesse" para negócio local).
- [ ] Idioma: idiomas do público (no Brasil: português + inglês, pois o Google lê o idioma do navegador).
- [ ] Rotação de anúncios: "Otimizar".
- [ ] Budget diário = budget mensal ÷ 30,4; ciente de que o Google pode gastar até 2× o diário num dia (compensa no mês).
- [ ] Programação de anúncios: 24/7 por padrão com Smart Bidding; restringir só se o atendimento for o gargalo (ex.: campanhas de ligação).
- [ ] Datas de início/fim; sem fim para campanha contínua.
- [ ] Exclusões de conteúdo/brand safety se o cliente exigir.
- [ ] Nomenclatura de TODAS as entidades validada contra `naming-convention.md` (regex §7 daquele arquivo).
- [ ] Nenhum item bloqueante do §7 deste arquivo em aberto.

---

## 9. Scripts Google Ads (JavaScript)

Scripts de apoio para a fase pós-publicação. O repositório completo e a instalação são da skill `gads-scripts`; abaixo, os dois essenciais que todo blueprint referencia. Instalar em **Ferramentas → Scripts** e **sempre rodar Preview antes de autorizar**.

### 9.1 Auditor de search terms (alerta de desperdício — não negativa sozinho)

```javascript
/**
 * TráfegoPRO — Auditor de Search Terms v1
 * Lista termos com gasto acima do limiar e zero conversões nos últimos 30 dias
 * e envia por email para revisão humana. NÃO negativa automaticamente.
 * Agendar: diário, 06:00.
 */
var CONFIG = {
  EMAIL: 'gestor@cliente.com.br',
  LIMIAR_CUSTO: 50.0,        // moeda da conta — calibrar para ~1x CPA-alvo
  DIAS: 'LAST_30_DAYS',
  PREFIXO_CAMPANHA: '[SRC]'  // só campanhas Search no padrão de nomenclatura
};

function main() {
  var query =
    "SELECT search_term_view.search_term, campaign.name, ad_group.name, " +
    "metrics.cost_micros, metrics.clicks, metrics.conversions " +
    "FROM search_term_view " +
    "WHERE segments.date DURING " + CONFIG.DIAS + " " +
    "AND metrics.cost_micros > " + (CONFIG.LIMIAR_CUSTO * 1000000) + " " +
    "AND metrics.conversions = 0 " +
    "AND campaign.name LIKE '" + CONFIG.PREFIXO_CAMPANHA + "%' " +
    "ORDER BY metrics.cost_micros DESC";

  var rows = AdsApp.search(query);
  var linhas = [];
  while (rows.hasNext()) {
    var r = rows.next();
    linhas.push([
      r.searchTermView.searchTerm,
      r.campaign.name,
      r.adGroup.name,
      (r.metrics.costMicros / 1000000).toFixed(2),
      r.metrics.clicks
    ].join(' | '));
  }

  if (linhas.length === 0) return;
  MailApp.sendEmail(
    CONFIG.EMAIL,
    '[TráfegoPRO] ' + linhas.length + ' termos com gasto e 0 conversões — ' +
      AdsApp.currentAccount().getName(),
    'Termo | Campanha | Ad Group | Custo | Cliques\n' + linhas.join('\n') +
    '\n\nRevisar e negativar conforme blueprint-search.md §4 (camada 3).'
  );
}
```

### 9.2 Sentinela de Quality Score

```javascript
/**
 * TráfegoPRO — Sentinela de QS v1
 * Aplica label e alerta para keywords ativas com QS <= limiar.
 * Agendar: semanal, segunda 07:00.
 */
var CONFIG = {
  EMAIL: 'gestor@cliente.com.br',
  QS_LIMIAR: 4,
  LABEL: 'QS-BAIXO',
  MIN_IMPRESSOES_30D: 100   // ignora keywords sem dado estatístico
};

function main() {
  garantirLabel(CONFIG.LABEL);
  var alertas = [];
  var it = AdsApp.keywords()
    .withCondition('Status = ENABLED')
    .withCondition('CampaignStatus = ENABLED')
    .withCondition('Impressions > ' + CONFIG.MIN_IMPRESSOES_30D)
    .forDateRange('LAST_30_DAYS')
    .get();

  while (it.hasNext()) {
    var kw = it.next();
    var qs = kw.getQualityScore(); // null quando indisponível
    if (qs !== null && qs <= CONFIG.QS_LIMIAR) {
      kw.applyLabel(CONFIG.LABEL);
      alertas.push(kw.getText() + ' | QS ' + qs + ' | ' +
        kw.getAdGroup().getName() + ' | ' + kw.getCampaign().getName());
    }
  }

  if (alertas.length > 0) {
    MailApp.sendEmail(
      CONFIG.EMAIL,
      '[TráfegoPRO] ' + alertas.length + ' keywords com QS <= ' + CONFIG.QS_LIMIAR,
      'Keyword | QS | Ad Group | Campanha\n' + alertas.join('\n') +
      '\n\nTratar conforme blueprint-search.md §5 (consertar ou pausar).'
    );
  }
}

function garantirLabel(nome) {
  var labels = AdsApp.labels().withCondition("Name = '" + nome + "'").get();
  if (!labels.hasNext()) AdsApp.createLabel(nome, 'Keywords com Quality Score baixo');
}
```

---

## 10. Template preenchível do blueprint (estrutura do entregável)

O arquivo final `blueprint-search-<cliente>-<AAAA-MM>.md` segue exatamente esta estrutura:

```markdown
# Blueprint Search — {Cliente} — {AAAA-MM}
Agente: search-specialist · TráfegoPRO

## 1. Resumo executivo
- Modo: {Conta Nova | Expansão | Reestruturação}
- Objetivo de conversão primária: {…}
- Budget mensal Search: {…} → diário: {…}
- Estratégia de lances inicial: {…} (Fase {1|2|3} da árvore §3)
- Gatilho de migração de fase: {ex.: 15 conversões/30d consistentes}
- Lacunas de dados: {lista de itens [VALIDAR — dado não disponível]}

## 2. Mapa da estrutura
| Campanha (nome no padrão) | Budget diário | Lances | Ad groups |
|---|---|---|---|

## 3. Ad groups e keywords
### {nome do ad group no padrão}
- Intenção: {…} · LP: {URL}
| Keyword | Match | Justificativa |
|---|---|---|

## 4. RSAs
### {ad group}
- H1–H15: {…}  (pinning: {nenhum | justificado})
- D1–D4: {…}
- Paths: /{…}/{…} · Final URL: {…}

## 5. Assets
{sitelinks (4+), callouts (6+), snippets (2 cabeçalhos), call/lead/location/image conforme §6.2}

## 6. Negativação
- [NEG] Universal: {termos}
- [NEG] Marca / [NEG] Concorrentes / [NEG] Cross-campanha: {termos}
- Rotina camada 3: {frequência + responsável: optimization-executor / gads-scripts}

## 7. Configurações de campanha
{checklist §8 preenchido item a item}

## 8. Checklist de tracking (bloqueante)
{checklist §7 preenchido; pendências delegadas ao tracking-engineer}

## 9. Rotina dos primeiros 30 dias
- Semana 1: {checagens diárias: gasto, termos, aprovação de anúncios, conversões chegando}
- Semanas 2–4: {negativação 2x/sem, leitura de QS, gatilho de fase de lances}
- D+30: handoff para performance-analyst (skill performance-report)

## 10. Handoffs
{lista de próximos passos com agente/skill responsável}
```

---

## 11. Erros que reprovam um blueprint (revisão final do agente)

1. Marca e categoria na mesma campanha.
2. Broad match em campanha core de conta nova.
3. tCPA/tROAS recomendado sem histórico de conversões validado.
4. RSA com headlines que são variações triviais da mesma frase.
5. Benchmark de mercado citado sem fonte ou sem a marca [VALIDAR].
6. Qualquer entidade fora da naming convention.
7. Checklist de tracking com bloqueante em aberto e blueprint rotulado de "pronto para publicar".
8. Sitelinks apontando todos para a mesma URL.
9. Display Network marcada em campanha Search.
10. Promessa em copy que a LP não cumpre (quebra de message match).
