# Checklist de Auditoria de Conta Google Ads — TráfegoPRO

> Documento operacional da skill `account-audit` (agente `account-auditor`).
> Percorrer item por item. Cada item tem um **ID**, um **critério objetivo de aprovação** e uma **severidade default** quando reprovado. A severidade pode ser agravada (nunca aliviada) pelo contexto da conta.

---

## 0. Matriz de severidade

| Severidade | Definição | Efeito no veredito |
|---|---|---|
| **BLOCKER** | Impede go-live. Risco de suspensão de conta, verba queimada de forma estrutural, ou medição inexistente/enganosa. | 1 ocorrência ⇒ **FAIL** automático |
| **CRITICAL** | Não impede tecnicamente o go-live, mas vai degradar resultado de forma material nas primeiras semanas. | 3+ ocorrências ⇒ FAIL; abaixo disso, PASS com prazo de correção ≤ 7 dias |
| **WARNING** | Subótimo. Corrigir no primeiro ciclo de `optimization-routine`. | Não afeta veredito; listar no relatório |
| **INFO** | Observação, oportunidade, ou achado sem evidência suficiente para severidade maior. | Não afeta veredito |

**Regras de classificação:**
- Achado sem evidência localizada (campanha/grupo/item específico) ⇒ rebaixar para INFO.
- Achado de compliance em categoria sensível (ver `politicas-google-ads.md`) ⇒ agravar um nível.
- Em Modo Pre-Go-Live, itens de tracking reprovados sobem um nível (a conta ainda não gastou nada — é o momento mais barato de corrigir).

---

## 1. Acesso, faturamento e fundação da conta

| ID | Item | Critério de aprovação | Severidade se reprovado |
|---|---|---|---|
| F-01 | Estrutura MCC | Conta do cliente vinculada à MCC da agência; cliente é o **dono** da conta (nunca a agência) | CRITICAL |
| F-02 | Faturamento | Forma de pagamento ativa e válida; sem pendência de pagamento; perfil de pagamentos no nome/CNPJ correto do anunciante | BLOCKER |
| F-03 | Verificação do anunciante | Advertiser verification concluída ou não exigida ainda; se exigida e pendente, há prazo e plano | BLOCKER se prazo expirando |
| F-04 | Fuso horário e moeda | Fuso da conta = fuso do negócio (impacta relatórios e dayparting); moeda correta. **Esses dois campos são imutáveis após criação** | BLOCKER (conta nova) / INFO (conta antiga, documentar distorção) |
| F-05 | Acessos de usuário | Nenhum e-mail desconhecido com acesso admin; acessos antigos de agências anteriores revogados | CRITICAL |
| F-06 | Vinculações | Google Analytics (GA4), Merchant Center (se e-commerce), YouTube (se vídeo) vinculados e com status OK | CRITICAL (e-commerce sem Merchant Center = BLOCKER para PMax/Shopping) |
| F-07 | Auto-apply recommendations | Recomendações automáticas **desligadas** (exceto as explicitamente aprovadas pelo `traffic-strategist`) | CRITICAL — auto-apply de broad match e de criativos muda a conta sem governança |
| F-08 | Histórico de políticas | Sem strikes ativos, sem histórico de suspensão não resolvida (conta-existente) | BLOCKER |

---

## 2. Estrutura e naming convention

### 2.1 Naming convention TráfegoPRO

Toda campanha deve seguir o padrão (validar via regex no script S-01):

```
[CANAL]-[FUNIL]-[OBJETIVO]_[PRODUTO/TEMA]_[GEO]_[VARIANTE]
```

- **CANAL:** `SRC` (Search) / `PMX` (Performance Max) / `DSP` (Display) / `YT` (Vídeo) / `DEM` (Demand Gen)
- **FUNIL:** `TOF` / `MOF` / `BOF` / `BRD` (brand) / `RMK` (remarketing)
- **OBJETIVO:** `LEAD` / `SALE` / `CALL` / `TRAF` / `AWA`
- **GEO:** sigla de país/UF/cidade (`BR`, `SP`, `POA`…)
- Exemplo: `SRC-BOF-LEAD_implante-dentario_POA_v2`

Grupos de anúncios: `[TEMA]_[match type dominante]` — ex.: `implante-carga-imediata_exact`.

| ID | Item | Critério | Severidade |
|---|---|---|---|
| E-01 | Naming | ≥ 90% das campanhas ativas seguem a convention (ou a convention documentada do cliente, se houver) | WARNING (CRITICAL se impossibilitar leitura do funil) |
| E-02 | Campanha de brand separada | Termos de marca isolados em campanha `BRD` própria, com keywords de marca **negativadas nas campanhas genéricas** | CRITICAL — brand misturado infla métricas das genéricas e mascara CPA real |
| E-03 | Segmentação por intenção | Grupos de anúncios agrupam keywords por **intenção/tema único** (estilo STAG — single theme ad group); nenhum grupo "balaio" com temas misturados | CRITICAL |
| E-04 | Tamanho de grupo | Grupos de Search com ≤ ~20 keywords; acima disso, exigir justificativa | WARNING |
| E-05 | Sem duplicidade | Nenhuma keyword exata duplicada entre campanhas/grupos competindo consigo mesma (mesmo match type + mesmo geo) | CRITICAL |
| E-06 | Sobreposição Search × PMax | PMax com brand exclusions configuradas e/ou campanhas Search exact protegendo termos core — PMax não pode canibalizar brand/BOF sem decisão explícita | CRITICAL |
| E-07 | Estrutura reflete o plano | Campanhas batem com o `media-plan-builder` aprovado (canais, estágios, budgets relativos) | BLOCKER se divergência material sem aprovação do `traffic-strategist` |

### 2.2 Match types e estratégia de lance por estágio de funil

Padrão TráfegoPRO de coerência **match type × lance × estágio**. Desvio sem justificativa registrada = CRITICAL.

| Estágio | Match types esperados | Estratégia de lance esperada | Condição mínima |
|---|---|---|---|
| **BRD (brand)** | Exact (+ phrase para variações) | Target Impression Share (topo absoluto) com teto de CPC | — |
| **BOF (fundo)** | Exact + phrase | Início: Maximize Conversions (sem target) ou Manual/Enhanced CPC se volume baixo; migrar para tCPA/tROAS **somente após ~30–50 conversões/mês na campanha** | Conversão primária validada |
| **MOF** | Phrase + broad **somente se** pareado com smart bidding baseado em conversão e negativação ativa | Maximize Conversions → tCPA quando houver volume | Tracking validado |
| **TOF / awareness** | Broad apenas com smart bidding + listas de público como observação; nunca broad com lance manual | tCPA com expectativa de CPA mais alto, ou objetivo de tráfego com metas claras | Aprovação do `traffic-strategist` |
| **RMK** | Públicos (não keywords) em Display/YT; em Search, RLSA como observação com ajuste de lance | Conforme canal | Lista com tamanho mínimo exigido pelo Google |

| ID | Item | Critério | Severidade |
|---|---|---|---|
| E-08 | Broad sem rede de proteção | Nenhuma campanha com broad match + lance manual, ou broad sem smart bidding por conversão | BLOCKER |
| E-09 | tCPA/tROAS prematuro | Nenhuma campanha nova com target agressivo sem histórico de conversões (ver tabela acima); target inicial deve partir do CPA/ROAS observado ou do plano de mídia, não de um número aspiracional | CRITICAL |
| E-10 | Teto de CPC em Impression Share | Toda campanha com Target Impression Share tem max CPC bid limit definido | CRITICAL |
| E-11 | Portfólio coerente | Estratégias de portfólio (shared bidding) só agrupam campanhas com mesmo objetivo de conversão | WARNING |

### 2.3 Negativação (regras TráfegoPRO)

| ID | Item | Critério | Severidade |
|---|---|---|---|
| N-01 | Lista universal | Lista negativa compartilhada aplicada a TODAS as campanhas de Search, contendo no mínimo os blocos: *grátis/free*, *emprego/vaga/currículo/salário*, *curso/como fazer/DIY/tutorial/apostila* (quando o negócio não vende educação), *concorrentes que não se quer disputar*, *termos adultos/ilegais* | CRITICAL |
| N-02 | Negativação cruzada | Brand negativado nas genéricas; termos de cada grupo exact negativados (exact) nos grupos phrase/broad irmãos, garantindo funil de termos | CRITICAL |
| N-03 | PMax | Negative keywords de PMax configuradas (no nível disponível da conta) ou exclusões via solicitação/conta; brand exclusions ativas quando há campanha de brand | WARNING (CRITICAL se PMax + brand coexistem sem exclusão) |
| N-04 | Conflitos | Nenhuma keyword negativa bloqueando keyword positiva ativa (rodar script S-03) | CRITICAL |
| N-05 | Rotina | Existe rotina de mineração de search terms definida (de quem é a tarefa: `optimization-executor` via `optimization-routine`, cadência semanal nos primeiros 60 dias) | WARNING |

---

## 3. Configurações de campanha (o "settings sweep")

Percorrer campanha por campanha:

| ID | Item | Critério | Severidade |
|---|---|---|---|
| C-01 | Redes | Search **sem** Display Network habilitada (expansão para Display em campanha de Search é dreno clássico de verba); Search Partners desligado no go-live (religar só como teste medido) | CRITICAL |
| C-02 | Localização | Targeting de localização correto E opção de presença = **"Presence: pessoas em ou regularmente em"** (nunca "Presence or interest" para negócio local) | BLOCKER para negócio local com "interest" ligado |
| C-03 | Exclusões de localização | Regiões fora da área de atendimento excluídas (especialmente em raio/cidades vizinhas) | WARNING |
| C-04 | Idiomas | Idiomas compatíveis com o público (no Brasil: português; avaliar inglês/espanhol se público bilíngue) | WARNING |
| C-05 | Rotação de anúncios | "Otimizar" (default) — rotação indefinida só com justificativa de teste controlado | WARNING |
| C-06 | Ad schedule | Dayparting coerente com o negócio (ex.: campanha de CALL não roda fora do horário de atendimento) | CRITICAL para objetivo CALL |
| C-07 | Dispositivos | Sem exclusão acidental de dispositivo; ajustes de lance por device documentados | WARNING |
| C-08 | Budget | Budget diário por campanha bate com `media-plan-builder` / `budget-pacing`; nenhuma campanha "limitada por orçamento" no go-live sem decisão consciente | CRITICAL |
| C-09 | Datas | Start/end dates corretos; nenhuma campanha com end date herdado de duplicação | CRITICAL |
| C-10 | URL final | URLs finais resolvem (200), sem redirecionamento para domínio diferente do exibido, com HTTPS | BLOCKER (mismatch de domínio é violação de política — ver `politicas-google-ads.md`) |
| C-11 | Tracking template / sufixo | UTMs padronizados (template no nível da conta: `utm_source=google&utm_medium=cpc&utm_campaign={campaignid}...` ou padrão definido no `tracking-blueprint`); auto-tagging (gclid) **ligado** | CRITICAL |
| C-12 | Assets/extensões | Mínimo por campanha de Search: 4 sitelinks, 4 callouts, 1 structured snippet; call asset se objetivo CALL; lead form/location quando aplicável | CRITICAL se zero assets; WARNING se incompleto |
| C-13 | Públicos em observação | Listas (remarketing, in-market, afinidade) adicionadas em **Observation** nas campanhas de Search (custo zero, ganho de dado) | WARNING |
| C-14 | Conversões da campanha | Campanha usa o conversion goal correto (account-default ou campaign-specific) — campanha de LEAD não pode otimizar para pageview | BLOCKER |

### 3.1 Itens específicos de PMax
| ID | Item | Critério | Severidade |
|---|---|---|---|
| P-01 | Asset groups | Cobertura completa de assets (headlines, long headlines, descriptions, imagens nas proporções exigidas, logo, vídeo — mesmo que auto-gerado, registrar) com Ad Strength mínimo "Good" | CRITICAL |
| P-02 | Audience signals | Cada asset group com signal (dados próprios + intenção) — PMax sem signal demora mais para calibrar | WARNING |
| P-03 | Feed (e-commerce) | Merchant Center sem reprovações de produto pendentes; feed atualizado < 72h | BLOCKER se reprovação em massa |
| P-04 | Final URL expansion | Decisão consciente (ligada com exclusões de URL, ou desligada); nunca ligada "por acidente" em site com páginas sensíveis (carreiras, blog antigo, políticas) | CRITICAL |

---

## 4. Tracking e medição (auditar contra o `tracking-blueprint`)

> Se existe output do `tracking-blueprint` do `tracking-engineer`, ele é a fonte da verdade. Auditar a implementação contra ele. Se não existe, a ausência do blueprint em conta nova já é CRITICAL — recomendar rodar `tracking-blueprint` antes do go-live.

| ID | Item | Critério | Severidade |
|---|---|---|---|
| T-01 | Conversão primária | Existe ≥ 1 ação de conversão **primária** alinhada ao objetivo de negócio (lead qualificado, compra), com status "Recording conversions" e teste de disparo validado (tag assistant / evento de teste) | BLOCKER |
| T-02 | Primária vs. secundária | Micro-conversões (scroll, pageview, clique em botão) marcadas como **secundárias** — smart bidding não pode otimizar para micro-evento | BLOCKER se micro-conversão está como primária |
| T-03 | Dupla contagem | Sem dupla contagem: ex. mesma compra contada via tag Google Ads E via importação GA4 ambas primárias | BLOCKER |
| T-04 | Contagem e janela | "Every" para compra, "One" para lead; janelas de conversão (click-through/engaged-view) documentadas e coerentes com o ciclo de venda | CRITICAL |
| T-05 | Enhanced conversions | Enhanced conversions for web ativas (dado de usuário hasheado via gtag/GTM com user_data) OU lacuna documentada com motivo; para lead com fechamento offline, enhanced conversions for leads ou importação offline (gclid) planejada | CRITICAL |
| T-06 | Consent mode | Se há tráfego de região com exigência de consentimento (EEA/UK obrigatório; LGPD: seguir a política de consentimento do cliente): consent mode v2 implementado (sinais `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`), com defaults definidos ANTES do disparo das tags e update no aceite do banner. Verificar comportamento de tags na recusa | BLOCKER para tráfego EEA/UK sem consent mode v2; CRITICAL nos demais casos com banner presente mas sinais ausentes |
| T-07 | GA4 | GA4 vinculado, eventos-chave importados corretamente (sem duplicar T-03), atribuição padrão documentada (data-driven) | WARNING |
| T-08 | Telefone | Se CALL é objetivo: call reporting ligado, número de encaminhamento Google ou tracking de telefone na LP (snippet de troca de número) | CRITICAL |
| T-09 | Teste ponta a ponta | Simulação completa: clique → LP → conversão → evento aparece na conta (ou em modo debug). Registrar evidência | BLOCKER se nunca testado em conta nova |
| T-10 | Sentinela | Script de monitoramento de conversões zeradas agendado (S-04 abaixo, ou via skill `gads-scripts`) | WARNING |

---

## 5. Desperdício de verba e Quality Score (Modo Conta-Existente)

### 5.1 Desperdício
| ID | Item | Critério | Severidade |
|---|---|---|---|
| W-01 | Search terms irrelevantes | Janela 30–90 dias: % do custo em search terms sem relação com a oferta. > 15% do custo ⇒ CRITICAL; > 30% ⇒ BLOCKER de re-go-live (pausar e reestruturar antes) | ver critério |
| W-02 | Keywords sem conversão | Keywords com custo acumulado > 3× o CPA-alvo e zero conversões (janela ≥ 60 dias) sem decisão registrada | CRITICAL |
| W-03 | Display "acidental" | Gasto em Display/Search Partners dentro de campanhas de Search (ver C-01) | CRITICAL |
| W-04 | Sobreposição | Campanhas disputando o mesmo search term (relatório de search terms cruzado); PMax roubando brand | CRITICAL |
| W-05 | Horários/geos drenos | Células de horário/geo com gasto relevante e conversão nula, sem exclusão ou ajuste | WARNING |
| W-06 | Apps/placements (Display/YT) | Placements de baixa qualidade (apps de jogos infantis, MFA sites) sem exclusão | CRITICAL em Display ativo |

> **Não usar benchmark de mercado decorado** para julgar CPC/CPA "alto". Comparar contra: (a) o histórico da própria conta, (b) o alvo do `media-plan-builder`, (c) benchmark pesquisado via WebSearch com fonte citada — nessa ordem. Sem nenhuma das três referências, registrar a lacuna.

### 5.2 Quality Score — limites de ação TráfegoPRO
Avaliar QS apenas em keywords com impressões suficientes para o dado existir (QS nulo ≠ QS baixo).

| Faixa de QS | Leitura | Ação exigida |
|---|---|---|
| 8–10 | Saudável | Manter; usar como referência de estrutura |
| 5–7 | Aceitável | Diagnosticar componente fraco (Expected CTR / Ad Relevance / LP Experience) e tratar no ciclo de `optimization-routine` |
| 3–4 | Dreno | CRITICAL se a keyword concentra > 10% do gasto da campanha: exigir realinhamento anúncio↔keyword↔LP (envolver `ad-copywriter` e `cro-engineer` via `lp-cro-audit`) |
| 1–2 | Tóxica | Pausar ou reestruturar antes do go-live — manter QS 1–2 com gasto relevante é BLOCKER |

| ID | Item | Critério | Severidade |
|---|---|---|---|
| Q-01 | Distribuição de QS | Nenhuma keyword QS ≤ 2 com gasto relevante ativo | BLOCKER (ver tabela) |
| Q-02 | Componentes | Para QS ≤ 6 com gasto: componente fraco identificado e ação atribuída ao agente certo | CRITICAL |
| Q-03 | Ad Strength RSA | RSAs com Ad Strength ≥ "Good"; mínimo 8–10 headlines e 3–4 descriptions distintas por RSA; pinning usado com parcimônia e justificado | CRITICAL se "Poor" generalizado (acionar `ad-copywriter` / `ad-copy-builder`) |

---

## 6. Scripts de auditoria (Google Ads Scripts — JavaScript)

> Instalar/rodar via interface de Scripts da conta. Para monitoramento contínuo pós-PASS, encaminhar a instalação definitiva à skill `gads-scripts`. Os snippets abaixo são ferramentas de auditoria pontual.

### S-01 — Validador de naming convention
```javascript
function main() {
  var PATTERN = /^(SRC|PMX|DSP|YT|DEM)-(TOF|MOF|BOF|BRD|RMK)-(LEAD|SALE|CALL|TRAF|AWA)_[a-z0-9\-]+_[A-Z]{2,3}(_v\d+)?$/;
  var it = AdsApp.campaigns().withCondition("campaign.status IN ('ENABLED','PAUSED')").get();
  var fails = [];
  while (it.hasNext()) {
    var c = it.next();
    if (!PATTERN.test(c.getName())) fails.push(c.getName());
  }
  Logger.log('Fora da convention (' + fails.length + '):\n' + fails.join('\n'));
}
```

### S-02 — Caçador de keywords-dreno (custo alto, zero conversões)
```javascript
function main() {
  var CPA_ALVO = 50.0;          // ajustar para o CPA-alvo do plano de mídia
  var MULTIPLO = 3;             // regra W-02
  var query =
    "SELECT campaign.name, ad_group.name, ad_group_criterion.keyword.text, " +
    "metrics.cost_micros, metrics.conversions " +
    "FROM keyword_view " +
    "WHERE segments.date DURING LAST_60_DAYS " +
    "AND metrics.conversions = 0 AND metrics.cost_micros > " + (CPA_ALVO * MULTIPLO * 1e6) +
    " ORDER BY metrics.cost_micros DESC";
  var rows = AdsApp.search(query);
  while (rows.hasNext()) {
    var r = rows.next();
    Logger.log([r.campaign.name, r.adGroup.name, r.adGroupCriterion.keyword.text,
      (r.metrics.costMicros / 1e6).toFixed(2)].join(' | '));
  }
}
```

### S-03 — Detector de conflito negativa × positiva
```javascript
function main() {
  // Coleta negativas de campanha e compara (matching simplificado por contenção de texto)
  var campIt = AdsApp.campaigns().withCondition("campaign.status = 'ENABLED'").get();
  while (campIt.hasNext()) {
    var camp = campIt.next();
    var negs = [];
    var negIt = camp.negativeKeywords().get();
    while (negIt.hasNext()) negs.push(negIt.next().getText().toLowerCase().replace(/[\[\]"]/g, ''));
    var kwIt = camp.keywords().withCondition("ad_group_criterion.status = 'ENABLED'").get();
    while (kwIt.hasNext()) {
      var kw = kwIt.next();
      var text = kw.getText().toLowerCase().replace(/[\[\]"+]/g, '');
      for (var i = 0; i < negs.length; i++) {
        if (text.indexOf(negs[i]) !== -1) {
          Logger.log('CONFLITO em "' + camp.getName() + '": positiva "' + kw.getText() +
            '" pode ser bloqueada pela negativa "' + negs[i] + '"');
        }
      }
    }
  }
  // Nota: matching real do Google é mais sutil (word order, close variants em negativas NÃO se aplicam).
  // Tratar saída como lista de suspeitas a revisar manualmente.
}
```

### S-04 — Sentinela de tracking zerado (instalar como rotina via `gads-scripts`)
```javascript
function main() {
  var EMAIL = 'ops@cliente.com'; // destinatário do alerta
  var query =
    "SELECT customer.id, metrics.conversions, metrics.clicks " +
    "FROM customer WHERE segments.date DURING LAST_3_DAYS";
  var rows = AdsApp.search(query);
  var clicks = 0, conv = 0;
  while (rows.hasNext()) { var r = rows.next(); clicks += Number(r.metrics.clicks); conv += Number(r.metrics.conversions); }
  if (clicks > 100 && conv === 0) {
    MailApp.sendEmail(EMAIL, '[TráfegoPRO] ALERTA: conversões zeradas',
      'Últimos 3 dias: ' + clicks + ' cliques e 0 conversões. Possível quebra de tracking. ' +
      'Acionar tracking-engineer para validar contra o tracking-blueprint.');
  }
}
```

### S-05 — Radar de reprovações de anúncio
```javascript
function main() {
  var query =
    "SELECT campaign.name, ad_group.name, ad_group_ad.ad.id, " +
    "ad_group_ad.policy_summary.approval_status, ad_group_ad.policy_summary.policy_topic_entries " +
    "FROM ad_group_ad " +
    "WHERE ad_group_ad.policy_summary.approval_status IN ('DISAPPROVED','APPROVED_LIMITED') " +
    "AND ad_group_ad.status != 'REMOVED'";
  var rows = AdsApp.search(query);
  var count = 0;
  while (rows.hasNext()) {
    var r = rows.next();
    count++;
    Logger.log(r.campaign.name + ' | ' + r.adGroup.name + ' | ad ' + r.adGroupAd.ad.id +
      ' | ' + r.adGroupAd.policySummary.approvalStatus +
      ' | topics: ' + JSON.stringify(r.adGroupAd.policySummary.policyTopicEntries));
  }
  Logger.log('Total reprovados/limitados: ' + count);
}
```

---

## 7. Template de relatório de auditoria

Gerar como `auditoria-conta-<cliente>-<AAAA-MM-DD>.md`:

```markdown
# Auditoria de Conta Google Ads — <Cliente>
**Data:** <data> · **Modo:** <pre-go-live / conta-existente / compliance-only> · **Auditor:** account-auditor (TráfegoPRO)

## Veredito: ✅ PASS / ❌ FAIL

<Sumário executivo em 1 parágrafo: estado geral, principais riscos, condição do veredito.>

## Bloqueios (se FAIL)
| # | ID | Achado | Evidência | Responsável pela correção |
|---|----|--------|-----------|---------------------------|
| 1 | T-01 | ... | ... | tracking-engineer / tracking-blueprint |

## Achados por severidade
### BLOCKER (n)
### CRITICAL (n) — prazo de correção: 7 dias
### WARNING (n) — tratar no primeiro ciclo de optimization-routine
### INFO (n)

(cada achado: ID · evidência · ação · responsável)

## Compliance (resumo da matriz de risco — ver politicas-google-ads.md)
| Área | Risco | Observação |
|---|---|---|

## Monitoramento pós-go-live (se PASS)
- Scripts a instalar via gads-scripts: <S-04, S-05, ...>
- WARNINGs a acompanhar nos primeiros 14 dias → performance-analyst (performance-report)

## Condições de re-auditoria (se FAIL)
Reapresentar após corrigir os bloqueios #1–#n. A re-auditoria cobre os itens reprovados + regressão das seções afetadas.
```

---

## 8. Ordem de execução recomendada

1. Seção 1 (fundação) — se F-02/F-03/F-08 reprovarem, **abortar e reportar imediatamente** (não vale auditar estrutura de conta que não pode anunciar).
2. Compliance (`politicas-google-ads.md`) — categorias sensíveis primeiro.
3. Seções 2 e 3 (estrutura + settings).
4. Seção 4 (tracking) — com teste ponta a ponta.
5. Seção 5 (apenas conta-existente).
6. Scripts S-01..S-05 quando houver acesso de execução; caso contrário, executar os checks manualmente sobre o export.
7. Consolidar relatório e emitir veredito.
