# Rotina Semanal de Otimização — TráfegoPRO

Playbook operacional do **optimization-executor**. Executar os blocos **na ordem** — a ordem importa: não adianta negativar termo se a conversão não está medindo, e não adianta ajustar lance antes de limpar o tráfego lixo que contamina a média.

**Pré-requisitos de calibragem (calcular antes do Bloco 1):**

| Variável | Como obter | Uso |
|---|---|---|
| `CPA_alvo` (ou `ROAS_alvo`) | Definido pelo cliente / traffic-strategist | Unidade base de todos os limiares de custo |
| `CVR` (taxa de conversão da conta) | Conversões ÷ cliques, últimos 30–90 dias | Define cliques esperados por conversão |
| `CEC` = cliques esperados por conversão | `1 / CVR` (ex.: CVR 2% → CEC = 50) | Define o que é "amostra suficiente" |
| `LAG` = janela típica de conversão | Relatório de lag de conversão ou estimativa do cliente | Define o recorte de datas confiável |

> Se o cliente não fornecer `CPA_alvo`/`CVR`, derive dos dados históricos fornecidos e **declare por escrito** que os limiares foram derivados, não definidos. Nunca usar um número "de mercado" inventado.

**Recorte de datas padrão:** últimos 30 dias, **excluindo os últimos `LAG` dias** (conversões ainda não maturadas distorcem CPA pra cima e induzem pausa errada). Para contas de alto volume (> 10 conversões/dia), 14 dias podem bastar; para baixo volume, estique para 60–90 dias.

---

## Bloco 0 — Pré-voo (10 min) — GATE: se falhar, a rotina para

Checklist binário. Qualquer ❌ → interromper, registrar e encaminhar.

- [ ] **Conversões chegando:** há conversões registradas nos últimos 7 dias em volume compatível com o histórico (queda > 50% semana contra semana sem queda equivalente de cliques = suspeita de tracking quebrado, não de performance)? ❌ → **tracking-engineer** (`tracking-blueprint`).
- [ ] **Ação de conversão primária correta:** a coluna "Conversões" soma apenas as ações primárias certas (sem page_view ou micro-conversão inflando)? ❌ → **tracking-engineer**.
- [ ] **Enhanced conversions ativas** (quando aplicável a leads/e-commerce) e **consent mode** configurado para tráfego de regiões que exigem consentimento? Não confirmado → registrar lacuna e pedir verificação ao **tracking-engineer**. Não otimizar lances com base em conversões modeladas sem saber que são modeladas.
- [ ] **Sem mudança estrutural < 7 dias** que coloque campanhas em learning period (troca de bid strategy, orçamento ±>20%, reestruturação)? Se houver, marcar essas campanhas como **CONGELADAS** nesta rotina (exceção de sangria: ver R6 em `arvore-decisao.md`).
- [ ] **Pacing de verba ok:** gasto mensal acumulado dentro de ±15% do esperado pró-rata? ❌ → sinalizar ao **traffic-strategist** (`budget-pacing`); não corrigir por conta própria mexendo em orçamentos.
- [ ] **Billing/política:** sem reprovação de anúncio em massa nem alerta de pagamento? ❌ → escalar ao **ceo** se houver risco de conta suspensa.

---

## Bloco 1 — Termos de pesquisa → Negativação (30–45 min)

### 1.1 Puxar o relatório
Search terms report do período padrão, todas as campanhas de Search e Shopping. Ordenar por **custo decrescente**. Avaliar no mínimo os termos que somam **80% do custo** do período (Pareto) + todos os termos com ≥ `CEC` cliques.

### 1.2 Classificar a intenção de cada termo

| Classe | Definição | Ação default |
|---|---|---|
| **A — Transacional aderente** | Intenção de compra do que o cliente vende | Manter; se ainda não é keyword, considerar adicionar como exact (handoff: `keyword-research` do **search-specialist**) |
| **B — Aderente mas ambíguo** | Pode converter, intenção incerta (informacional próximo) | Manter sob observação; aplicar árvore A1 com dados |
| **C — Job errado** | Produto/serviço parecido que o cliente NÃO atende | Negativar imediatamente, sem esperar dados |
| **D — Irrelevante óbvio** | Grátis, vaga de emprego, curso, concorrente que não se quer disputar, outra cidade não atendida | Negativar imediatamente |
| **E — Marca própria** | Termo de marca caindo em campanha genérica | Negativar na genérica (exact) pra forçar pro funil de marca — só se existir campanha de marca |

Classes C, D e E **não precisam de dados** — a negativação é semântica. Classe B só negativa via **árvore A1** de `arvore-decisao.md` (limiar de cliques/custo sem conversão).

### 1.3 Escolher o match type da negativa — regra de menor raio possível

- **Negative exact** `[termo]` — quando só aquela formulação é ruim ("consultoria de tráfego **gratuita**" → `[consultoria de trafego gratuita]` é raio largo demais; negativar `gratuita`? ver abaixo).
- **Negative phrase** `"termo"` — quando a sequência é sempre ruim em qualquer contexto ("vaga de emprego").
- **Negative broad** `termo` — só para palavras isoladas universalmente ruins na conta (`grátis`, `pirata`, `pdf`). Lembrar: negativas **não expandem** para plurais/erros de digitação — cobrir variações relevantes manualmente.
- **Atenção a colisão:** antes de negativar phrase/broad, verificar se a negativa não bloqueia keyword ativa de outra campanha (rodar busca mental ou script da seção 7).

### 1.4 Escolher o destino

| Destino | Quando |
|---|---|
| Nível de ad group | Termo ruim só naquele contexto (ex.: cross-pollination entre ad groups) |
| Nível de campanha | Termo ruim pra campanha toda |
| **Lista compartilhada** (negative keyword list) | Termo ruim pra conta toda — manter 3 listas padrão: `NEG - Universais` (grátis, emprego, curso...), `NEG - Concorrentes`, `NEG - Marca` |
| **PMax** | Negativas de campanha em PMax (disponibilidade do recurso varia — se a interface da conta não expuser, registrar e usar exclusões de brand list / solicitar via suporte). Verificar estado atual do recurso via WebSearch se houver dúvida |

### 1.5 Análise n-gram (quinzenal)
Agrupar termos por unigramas/bigramas e somar custo/conversões por grupo. Um n-gram com custo ≥ 2× `CPA_alvo` e 0 conversões agregadas é candidato a negative broad mesmo que nenhum termo individual atinja o limiar sozinho. O script da seção 7 automatiza isso.

---

## Bloco 2 — Keywords e lances (30 min)

### 2.1 Pausas e reduções
Para cada keyword com gasto no período, aplicar a **árvore A2** de `arvore-decisao.md`. Resumo operacional:
- Gasto ≥ 2× `CPA_alvo` sem conversão **e** amostra ≥ 2× `CEC` cliques → pausar ou reduzir exposição.
- CPA entre 1,2× e 2× alvo com amostra suficiente → reduzir (lance manual: −15 a −20%; smart bidding: ajustar tCPA/tROAS da campanha apenas se o desvio for generalizado, não por keyword).
- CPA ≤ 0,8× alvo com volume → escalar (ver árvore A2, ramo de escala).

### 2.2 Quality Score — triagem mensal (rodar 1×/mês dentro da rotina)
- Exportar QS + componentes (Expected CTR / Ad Relevance / Landing Page Experience).
- **QS ≤ 4 em keyword com gasto relevante** (≥ 1× `CPA_alvo`/semana) → diagnóstico por componente:
  - Expected CTR "abaixo da média" → copy: briefing pro **ad-copywriter** (`ad-copy-builder`).
  - Ad Relevance "abaixo da média" → granularidade: keyword no ad group errado; propor mover/segmentar (handoff **search-specialist**).
  - LP Experience "abaixo da média" → **cro-engineer** (`lp-cro-audit`).
- QS baixo em keyword sem gasto → ignorar (não otimizar o que não gasta).

### 2.3 Conflitos e higiene
- Keywords com status "Rarely shown (low Quality Score)" ou volume zero há 90 dias → pausar (poluem a estrutura).
- Duplicatas entre campanhas (mesma keyword + match type) → manter a de melhor histórico, pausar a outra.
- Broad match **sem** smart bidding (tCPA/tROAS/Max Conv.) → sinalizar: broad + lance manual é vazamento estrutural; recomendação padrão é phrase/exact ou migrar a campanha pra smart bidding (decisão do **search-specialist**).

### 2.4 Estratégia de lance por estágio (referência para recomendar, não trocar por conta própria)

| Estágio da campanha | Estratégia típica | Quando recomendar transição |
|---|---|---|
| Lançamento (0–30 conv.) | Maximize Clicks com teto de CPC, ou Manual CPC | — |
| Coleta (30–50 conv./mês) | Maximize Conversions **sem** alvo | Ao estabilizar volume de conversão |
| Maturidade | tCPA / tROAS | ≥ 30–50 conv./mês na campanha; setar alvo no CPA real atual, nunca direto no desejado |
| Aperto de alvo | tCPA/tROAS com ajustes de ±10–15% por vez, intervalo ≥ 2 semanas | Quando CPA real ≤ alvo por 2 semanas seguidas |

Troca de estratégia de lance = mudança estrutural → handoff **search-specialist**/**pmax-specialist** com a recomendação fundamentada; reinicia learning period.

---

## Bloco 3 — Anúncios e assets (20 min)

### 3.1 RSAs
- Cada ad group ativo precisa de **≥ 2 RSAs** com Ad Strength mínimo "Good". Ad Strength "Poor/Average" em ad group com gasto → briefing pro **ad-copywriter**.
- Comparar RSAs do mesmo ad group pela árvore **A3**: amostra mínima por anúncio = 2× `CEC` cliques **ou** 5.000 impressões, o que vier primeiro; vencedor por CVR (ou CTR, se conversão for escassa). Perdedor consistente em 2 rotinas seguidas → pausar e pedir substituto.
- **Não pausar** o RSA único de um ad group — primeiro chega o substituto, depois pausa.

### 3.2 Assets (extensões) e assets de PMax
- Sitelinks/callouts/structured snippets reprovados ou com CTR nulo há 30 dias → substituir.
- PMax: asset groups com classificação "Low" em assets individuais (quando o relatório expõe) → trocar os "Low", manter "Best/Good". Performance por canal da PMax não é exposta nativamente — usar script (skill `gads-scripts` do **tracking-engineer**) para estimar split Search/Display/Video/Shopping e detectar PMax virando "Display barato". Sinais de canal-lixo: CTR de display alto com CVR ~0 → reportar ao **pmax-specialist**.

### 3.3 Naming convention (validar, corrigir desvios)
Padrão TráfegoPRO para tudo que for criado/renomeado:

```
[Canal]-[Funil]-[Tema]-[Match/Formato]-[Geo]
Ex.: SRC-BOF-ConsultoriaTrafego-EXACT-BR
     PMX-MOF-Catalogo-FEED-SP
     YT-TOF-Institucional-SKIP-BR
Canais: SRC (Search) | PMX (PMax) | DSP (Display) | YT (Video) | SHP (Shopping) | DG (Demand Gen)
Funil: TOF | MOF | BOF | BRD (marca)
```

Campanha fora do padrão → registrar no change log como pendência de renomeação (renomear não afeta performance; afeta relatório do **performance-analyst**).

---

## Bloco 4 — Caça-desperdício (20 min)

Checklist dos vazamentos clássicos — verificar TODOS, marcar ✅/❌/N/A:

- [ ] **Search Partners** ligado? Segmentar performance por rede; partners com CPA > 1,5× o da rede de busca e amostra ≥ `CEC` cliques → desligar.
- [ ] **Display Network** habilitada em campanha de Search? Quase sempre desligar — tráfego de display dentro de campanha de search raramente é intencional.
- [ ] **Localização "Presença ou interesse"** em negócio local? Trocar para "Presença". Revisar relatório geográfico: locais com gasto ≥ 1× `CPA_alvo` e 0 conversões e fora da área atendida → excluir.
- [ ] **Dispositivos:** segmento com CPA ≥ 2× o da média da campanha e amostra suficiente → bid adjustment negativo (lances manuais) ou registrar pra smart bidding (que já pondera — não empilhar ajuste manual em tCPA, exceto −100% pra cortar de vez).
- [ ] **Horários/dias:** mesmo critério de dispositivos. Atenção: conta de leads B2B com formulário 24/7 ≠ conta que depende de ligação em horário comercial — checar com o cliente antes de cortar madrugada.
- [ ] **Vazamento de broad match:** % do custo vindo de termos classe C/D no Bloco 1 por campanha. > 20% do custo em lixo → recomendar aperto de match type ao **search-specialist**.
- [ ] **PMax canibalizando marca:** termos de marca aparecendo na PMax → aplicar brand exclusions / negativas de marca na PMax.
- [ ] **Audiências de observação** esquecidas com bid adjustment antigo? Limpar ajustes órfãos.
- [ ] **Campanhas "zumbi":** gasto > 0, conversão 0 há 60+ dias, ninguém olhando → propor pausa formal ao **traffic-strategist** (pode haver razão estratégica de cobertura).
- [ ] **Conteúdo/placements (Display/Video):** placements com custo ≥ 0,5× `CPA_alvo` e 0 conversões + CTR anômalo (apps de jogos infantis etc.) → excluir; lista grande → handoff **video-display-specialist**.

Somar o **desperdício identificado em R$** no período e registrar — é o número que o **performance-analyst** vai usar no `performance-report` pra mostrar valor da rotina.

---

## Bloco 5 — Experimentos (15 min)

### 5.1 Inventário
Manter no máximo **1 experimento ativo por campanha** e 3 por conta. Mais que isso, ninguém consegue atribuir efeito.

### 5.2 Desenho (template preenchível)

```markdown
## Experimento: [nome curto]
- **Hipótese:** Se [mudança única], então [métrica primária] vai [direção esperada], porque [racional].
- **Variável única:** [ex.: tCPA −10% | novo RSA com prova social | LP variante B]
- **Métrica primária:** [CPA | CVR | CTR] — métrica de guarda: [volume de conversões não cair > X%]
- **Mecanismo:** [Custom experiment 50/50 | troca sequencial com período espelho | Ad variation]
- **Duração mínima:** [≥ 2 semanas E ≥ 2× CEC cliques por braço E ≥ N conversões por braço — preencher N conforme árvore A6]
- **Data início:** ___ | **Data avaliação:** ___ (proibido olhar pra decidir antes disso)
- **Critério de ship:** [ex.: CPA do braço B ≤ 0,9× braço A com amostra mínima cumprida]
- **Critério de kill antecipado:** [gasto do braço B ≥ 3× CPA_alvo com 0 conversões]
```

### 5.3 Avaliação
Aplicar árvore **A6** (ship / iterar / matar). Nunca declarar vencedor por diferença pequena com amostra pequena — se a diferença de conversões entre braços for menor que `2 × √(conversões totais)` (aproximação rápida de ruído), o resultado é **inconclusivo**: estender ou matar por irrelevância prática.

---

## Bloco 6 — Change log e handoffs (10 min)

### 6.1 Template do change log (obrigatório, 1 por rotina)

```markdown
# Change Log — [Cliente] — Rotina de [AAAA-MM-DD]
Executor: optimization-executor | Recorte de dados: [início]–[fim] (LAG de [N] dias excluído)
Calibragem: CPA_alvo = R$ ___ | CVR = ___% | CEC = ___ cliques

## Pré-voo
| Item | Status | Ação |
|---|---|---|
| Conversões íntegras | ✅/❌ | ... |

## Mudanças aplicadas/recomendadas
| # | Item | Tipo | Nó da árvore | Limiar disparado | Antes → Depois | Revisão em |
|---|---|---|---|---|---|---|
| 1 | [keyword X] | Pausa | A2.3 | 2×CPA_alvo s/ conv., 2×CEC cliques | Ativa → Pausada | +14d |
| 2 | "[termo]" | Negativa phrase | A1.2 | Classe D | — → NEG - Universais | — |

## AGUARDAR (dados insuficientes)
| Item | Faltam | Reavaliar em |
|---|---|---|

## Desperdício identificado: R$ ___ /período
## Experimentos: [ativos / propostos / decididos]
## Handoffs
- [ ] tracking-engineer: ...
- [ ] traffic-strategist: ...
- [ ] performance-analyst: anexar este log ao próximo performance-report
```

### 6.2 Regras do log
- Mudança sem linha no log = mudança proibida.
- Toda pausa/redução ganha **data de revisão** (default +14 dias) — pausar não é enterrar.
- O log da semana anterior é **leitura obrigatória** no início da próxima rotina (verificar efeito do que foi feito antes de fazer mais).

---

## 7 — Script de apoio (Google Ads Scripts, JavaScript)

Detector de termos e n-grams sangrando — roda no editor de Scripts da conta (a biblioteca completa e a instalação são da skill `gads-scripts` do **tracking-engineer**; este é o snippet mínimo da rotina):

```javascript
// TráfegoPRO — Termos sem conversão acima do limiar (rotina semanal)
// Configurar: CPA_ALVO em moeda da conta; PERIODO conforme recorte da rotina.
var CPA_ALVO = 100.0;          // <- preencher com o CPA-alvo do cliente
var MULTIPLO_CUSTO = 2.0;      // limiar A1.3: custo >= 2x CPA_alvo sem conversão
var PERIODO = 'LAST_30_DAYS';

function main() {
  var query =
    "SELECT Query, CampaignName, AdGroupName, Clicks, Cost, Conversions " +
    "FROM SEARCH_QUERY_PERFORMANCE_REPORT " +
    "WHERE Conversions = 0 AND Cost > " + (CPA_ALVO * MULTIPLO_CUSTO) +
    " DURING " + PERIODO;
  var rows = AdsApp.report(query).rows();
  var linhas = [['Termo','Campanha','AdGroup','Cliques','Custo','Sugestão']];
  var ngrams = {};
  while (rows.hasNext()) {
    var r = rows.next();
    linhas.push([r['Query'], r['CampaignName'], r['AdGroupName'],
                 r['Clicks'], r['Cost'], 'Avaliar negativa (no A1.3)']);
    r['Query'].split(' ').forEach(function (w) {
      if (w.length < 3) return;
      ngrams[w] = (ngrams[w] || 0) + parseFloat(String(r['Cost']).replace(/,/g, ''));
    });
  }
  Logger.log('Termos acima do limiar: ' + (linhas.length - 1));
  Object.keys(ngrams)
    .sort(function (a, b) { return ngrams[b] - ngrams[a]; })
    .slice(0, 20)
    .forEach(function (k) {
      Logger.log('n-gram "' + k + '" custo sem conversão: ' + ngrams[k].toFixed(2));
    });
  // Saída: colar as linhas no change log; decisão final SEMPRE pela árvore A1,
  // nunca negativar automaticamente a partir do script.
}
```

> O script **lista**, não decide. A decisão de negativar passa pela árvore A1 (classes C/D direto; classe B só com limiar). Antes de usar, validar se o report `SEARCH_QUERY_PERFORMANCE_REPORT` segue disponível na versão vigente da API — se houver dúvida, pesquisar via WebSearch ou delegar à skill `gads-scripts`.

---

## Cadência resumida

| Frequência | O quê |
|---|---|
| Semanal | Blocos 0, 1 (termos), 2.1, 3.1, 5, 6 |
| Quinzenal | 1.5 (n-gram), Bloco 4 completo |
| Mensal | 2.2 (Quality Score), 3.2 (assets PMax), revisão de naming |
| Trimestral | Sugerir `account-audit` completo ao **account-auditor** |
