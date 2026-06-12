# Framework de Funil TOFU/MOFU/BOFU — Google Ads (TráfegoPRO)

> Documento de referência do agente **traffic-strategist** para a skill `media-plan-builder`.
> Define COMO a TráfegoPRO arquiteta funis em Google Ads: tipos de campanha, lances, match types,
> negativação, Quality Score, alocação de verba por modo e árvores de decisão.
> Benchmarks numéricos de mercado (CPC, CVR, CPM por vertical) **não estão fixados aqui de propósito** —
> devem ser pesquisados na data do plano via WebSearch ou declarados como premissa a validar.

---

## 1. Princípio: funil é intenção, não formato

No Google Ads o estágio do funil é definido pela **intenção do usuário no momento do contato**, não pelo canal:

| Estágio | Intenção | Pergunta que o usuário está fazendo | Papel da mídia |
|---|---|---|---|
| **BOFU** (Bottom) | Transacional — pronto para agir | "Onde compro/contrato isso agora?" | Capturar demanda existente |
| **MOFU** (Middle) | Comparativa — avaliando opções | "Qual a melhor opção pra mim?" | Vencer a comparação e re-engajar |
| **TOFU** (Top) | Exploratória ou latente | "Tenho esse problema — como resolvo?" / nem sabe que tem | Criar demanda e abastecer públicos |

**Regra de ouro da TráfegoPRO:** verba sobe no funil somente depois que o estágio abaixo está validado.
BOFU validado → liga MOFU. MOFU alimentando BOFU com remarketing eficiente → liga TOFU.
A exceção é negócio de demanda 100% latente (ninguém pesquisa pelo problema) — aí o funil nasce
TOFU/MOFU-first e o BOFU é remarketing + brand. Identificar isso na pesquisa de keywords
(skill `keyword-research`): se o volume de busca transacional for irrisório, o funil inverte.

---

## 2. BOFU — captura de demanda

### 2.1 Mix de campanhas

| Campanha | Quando entra | Observação |
|---|---|---|
| **Search — Brand** | Sempre que houver marca pesquisada (validar volume na `keyword-research`) | Campanha separada, nunca misturada com categoria. Protege a marca de concorrente e dá denominador limpo de incrementalidade. |
| **Search — Categoria alta intenção** | Sempre | Núcleo do BOFU. Termos transacionais: "comprar", "preço", "orçamento", "perto de mim", modelo/SKU específico. |
| **Search — Concorrentes** | Opcional, só com margem folgada | CPC alto e Quality Score estruturalmente baixo (relevância de anúncio limitada — não se pode usar a marca alheia no copy). Tratar como teste com verba teto. Insumos do agente market-intel (skill `competitor-recon`). |
| **PMax (com feed, e-commerce)** | Após Search BOFU validada OU desde o início se catálogo grande (>50 SKUs) | Exigir exclusão de brand via brand exclusions / account-level negatives para não canibalizar a campanha de marca. Construção pelo pmax-specialist (skill `pmax-campaign-builder`). |
| **Remarketing Search (públicos sobre Search)** | Quando listas ≥ tamanho mínimo exigido pelo Google (pesquisar valor vigente) | Públicos de visitantes/carrinho aplicados como ajuste ou segmentação em campanhas de categoria. |

### 2.2 Estratégia de lance por maturidade (BOFU)

Árvore de decisão:

```
A campanha tem ≥ volume mínimo de conversões/mês recomendado pelo Google
para Smart Bidding? (pesquisar o número vigente — não assumir de memória)
├── NÃO (modo lancamento típico)
│   ├── Fase 1 (semanas 1–2): Maximize Clicks COM teto de CPC máximo
│   │   definido por: CPC_teto = CPA_teto × CVR_premissa (declarar a premissa no plano)
│   ├── Fase 2 (a partir da 1ª conversão consistente): Maximize Conversions SEM tCPA
│   └── Fase 3 (volume mínimo atingido em 30 dias): migrar para tCPA,
│       iniciando o alvo ~20–30% ACIMA do CPA real corrente e baixando
│       em degraus de no máx. 10–15% por ciclo de 1–2 semanas
└── SIM
    ├── Meta é eficiência por venda de valor uniforme → tCPA
    ├── Meta é receita com tickets variáveis (e-commerce) → tROAS
    │   (exige conversão com valor + Enhanced Conversions funcionando)
    └── Em escala: aceitar relaxar o alvo (tCPA +10% / tROAS −10%)
        a cada degrau de verba — registrar a banda aceita no plano
```

**Nunca** trocar estratégia de lance e verba na mesma semana — uma mudança por vez, senão a
atribuição da causa se perde e o aprendizado reseta em dobro.

### 2.3 Match types e estrutura (BOFU Search)

- **Estrutura padrão:** 1 campanha por intenção/linha de produto; grupos de anúncio temáticos
  (STAG — single theme ad group) com 5–15 keywords do MESMO tema; 1 RSA forte por grupo
  (produzida pelo ad-copywriter via `ad-copy-builder`) + 1 RSA variante para teste.
- **Match types:**
  - **Exact** `[termo]` — espinha dorsal do BOFU em lancamento e correcao. Controle máximo.
  - **Phrase** `"termo"` — camada de descoberta controlada; entra na semana 2–3 do lançamento.
  - **Broad** — em BOFU, somente acoplado a tCPA/tROAS já maduro e com rotina de negativação
    semanal ativa (skill `optimization-routine`). Broad sem Smart Bidding maduro é vazamento.
- **Brand:** exact + phrase apenas. Broad em brand captura genérico e infla a métrica da marca.

### 2.4 Negativação (BOFU)

1. **Lista universal da conta** (aplicada via lista compartilhada): gratuito, grátis, curso,
   como fazer, vaga, emprego, currículo, "o que é", torrent, download, reclamação, "é confiável"
   (ajustar à vertical — "curso" é negativa para quem vende serviço, mas é o produto de quem vende curso).
2. **Negativação cruzada de funil:** TODOS os termos das campanhas brand entram como negativas
   exact nas campanhas de categoria, e vice-versa. Garante que cada busca tem UMA campanha dona.
3. **Rotina:** revisão do relatório de termos de pesquisa 2×/semana nas 4 primeiras semanas,
   depois semanal (executada pelo optimization-executor). Critério de corte objetivo:
   termo com gasto ≥ 1× CPA_teto e 0 conversões → negativar exact; tema recorrente irrelevante → negativar phrase.
4. **PMax:** manter lista de negativas no nível de conta e usar brand exclusions; documentar no
   plano que PMax tem controle de negativação mais limitado — risco aceito e monitorado.

### 2.5 Quality Score — limites operacionais

QS é diagnóstico, não KPI de negócio. Regras da TráfegoPRO para Search:

| QS da keyword (com tráfego) | Ação |
|---|---|
| 8–10 | Manter. Candidata a receber mais verba/lance. |
| 6–7 | Aceitável. Revisar componente fraco (CTR esperado / relevância / experiência da LP) no ciclo mensal. |
| 4–5 | Alerta. Reescrever RSA (ad-copywriter) ou mover keyword para grupo mais específico. Se for a LP, acionar cro-engineer (skill `lp-cro-audit`). |
| ≤ 3 persistente por 30 dias após correção | Pausar a keyword OU isolar em campanha própria com LP dedicada. Keyword QS ≤ 3 paga leilão proibitivo — não sustentar por teimosia. |

Exceção documentável: termos de concorrente vivem com QS baixo por natureza — avaliar por CPA real, não por QS.

---

## 3. MOFU — vencer a comparação e re-engajar

### 3.1 Mix de campanhas

| Campanha | Papel |
|---|---|
| **Search — termos comparativos** | "melhor X", "X vs Y", "X vale a pena", "alternativa a Y". Phrase + exact. CPA esperado maior que BOFU — definir teto próprio (ex.: 1,5–2× o CPA_teto BOFU, registrado como premissa). |
| **Demand Gen — remarketing** | Re-impactar visitantes/engajados com criativo de prova social e diferenciais (YouTube, Discover, Gmail). |
| **Display — remarketing padrão** | Frequência controlada (definir cap no plano, ex.: 3–5 impressões/usuário/dia, validar com dados). Excluir convertidos. |
| **Video — remarketing (YouTube in-stream)** | Vídeo de objeção/prova para listas de consideração (viu página de preço e não converteu, abandonou carrinho). Construção pelo video-display-specialist (skill `video-display-builder`). |

### 3.2 Públicos MOFU (ordem de prioridade)

1. Abandono de carrinho / iniciou checkout (e-commerce) ou iniciou formulário (lead gen) — últimos 7–14 dias
2. Visitou página de preço/planos/produto sem converter — 14–30 dias
3. Engajou ≥ 50% de vídeo TOFU — 30 dias
4. Lista de clientes (Customer Match) para upsell/cross-sell — exige requisitos de elegibilidade da conta (pesquisar critérios vigentes do Google antes de prometer no plano)
5. Visitantes gerais do site — 30–90 dias (camada mais fria do MOFU)

**Sempre excluir convertidos recentes** de todas as campanhas MOFU (janela = ciclo de recompra do negócio).

### 3.3 Lances e mensuração MOFU

- Demand Gen / Display remarketing: Maximize Conversions → tCPA quando houver volume.
- Video remarketing: otimizar por conversão se o volume permitir; senão, aceitar papel assistencial
  e medir por **conversões assistidas / lift no BOFU**, nunca por last-click isolado.
- Registrar no plano: MOFU/TOFU serão avaliados por métricas de assistência e por efeito no
  CPA blended — cobrar last-click de campanha de consideração é erro de leitura que o
  performance-analyst deve neutralizar no relatório (skill `performance-report`).

---

## 4. TOFU — criação de demanda

### 4.1 Mix de campanhas

| Campanha | Quando entra |
|---|---|
| **YouTube in-stream pulável (prospecção)** | Funil BOFU+MOFU validados; verba dedicada que NÃO compete com captura. Segmentação: custom segments (quem pesquisou termos da categoria), in-market, afinidade qualificada. |
| **Demand Gen — prospecção** | Lookalike/segmentos otimizados a partir das listas de conversores (verificar disponibilidade atual do recurso na plataforma — pesquisar antes de prometer). |
| **Display — prospecção** | Última prioridade. Só com criativo forte e meta clara de alimentação de lista. Placements de apps e jogos entram na exclusão padrão desde o dia 1. |
| **Search — informacional** | "como resolver X", "o que causa X". Só quando há ativo de conteúdo/LP educativa que capture o lead (ímã de leads). Senão, não comprar clique informacional. |

### 4.2 Regras TOFU

- **Objetivo declarado:** custo por usuário engajado / custo por lead de topo / crescimento de listas — definido no plano com número-alvo. "Awareness" sem métrica não é objetivo.
- **Exclusões obrigatórias Display/Video:** convertidos, listas MOFU (para não pagar prospecção em quem já está no meio do funil), conteúdo sensível, placements de baixa qualidade (lista mantida pelo optimization-executor).
- **Frequency cap** explícito em toda campanha de prospecção Video/Display.
- TOFU é a primeira verba cortada em modo correcao e a última religada.

---

## 5. Alocação de verba por modo

A matriz final vai no plano (template, seção 6). Pontos de partida da TráfegoPRO — ajustar à
realidade do negócio e ao output da `keyword-research` (se não há demanda BOFU, inverter):

### Modo Lançamento
| Estágio | Faixa inicial | Racional |
|---|---|---|
| BOFU | 70–85% | Validar conversão onde a intenção é máxima |
| MOFU | 10–20% | Remarketing assim que as listas atingirem tamanho mínimo |
| TOFU | 0–10% | Em geral 0 no mês 1; liga no mês 2–3 se BOFU validar |
| Reserva de teste | 5–10% (dentro dos números acima) | Termos/públicos exploratórios com teto definido |

### Modo Escala
| Estágio | Faixa | Racional |
|---|---|---|
| BOFU | 50–65% | Mantém a base; expansão vertical limitada a +15–20% de verba por ciclo de 1–2 semanas por campanha |
| MOFU | 20–30% | Cresce junto com o tráfego TOFU para não desperdiçar audiência criada |
| TOFU | 15–25% | Motor de crescimento — só escala se o blended segurar a banda de CPA acordada |

Gatilho de escala vertical (mais verba na mesma campanha): campanha bateu a meta por 2 ciclos
seguidos E está limitada por orçamento (perda de parcela de impressões por orçamento — verificar
no relatório). Gatilho de escala horizontal: BOFU saturado (CPC marginal subindo sem volume novo).

### Modo Correção — sequência obrigatória
1. **Semana 0 — estancar:** pausar imediatamente (a) campanhas com gasto ≥ 3× CPA_teto e 0 conversões em 30 dias; (b) TOFU inteiro; (c) Display de prospecção. Congelar mudanças de lance no que sobrou.
2. **Semana 1 — auditar:** exigir `account-audit` (account-auditor) + validação de tracking (tracking-engineer). 50%+ dos casos de "CPA estourou do nada" são mensuração quebrada, não mídia ruim — confirmar antes de mexer em campanha.
3. **Semanas 2–3 — reconstruir BOFU:** estrutura enxuta (exact-first), negativação completa, RSAs novas.
4. **Semana 4+ — religar MOFU**, depois TOFU, cada um condicionado a critério numérico definido no plano.

Verba em correcao: operar com 50–70% da verba histórica até o BOFU voltar à meta; devolver o restante em degraus.

---

## 6. Checklist de mensuração (pré-ativação — obrigatório)

O plano só sai com status `APROVADO PARA ATIVAÇÃO` se TODOS os itens abaixo estiverem confirmados
(executor: tracking-engineer, via skill `tracking-blueprint`):

- [ ] **Conversões primárias definidas** (máx. 1–2 ações realmente de negócio: compra, lead qualificado). Micro-conversões (scroll, clique em botão) como secundárias — NUNCA primárias otimizáveis.
- [ ] **Valores de conversão** atribuídos (receita real no e-commerce; valor estimado por estágio no lead gen) se a estratégia for tROAS.
- [ ] **Consent Mode v2** implementado e em modo avançado ou básico — documentar qual, pois afeta modelagem de conversões na região (obrigatório para públicos no EEA; verificar exigências vigentes para o Brasil/LGPD na data do plano).
- [ ] **Enhanced Conversions** ativas (Search/PMax) com hash de e-mail/telefone no evento de conversão.
- [ ] **Tag (gtag/GTM) auditada**: evento de conversão dispara 1× por transação, deduplicação ok, sem conversão dupla GA4-import + tag nativa contando em paralelo como primárias.
- [ ] **Janelas de atribuição e modelo** documentados no plano (anotar o modelo vigente da conta).
- [ ] **Auto-tagging (GCLID) ativo** e parâmetros UTM padronizados conforme naming convention.
- [ ] Listas de remarketing criadas e populando (mesmo antes do MOFU ligar — lista cresce desde o dia 1).

---

## 7. Automação e vigilância

Scripts Google Ads (JavaScript) cobrindo pacing de verba, alerta de anomalia de CPA, auditoria de
QS e detecção de termo de pesquisa lixo são mantidos pela skill `gads-scripts` (agente
tracking-engineer) — o plano deve listar QUAIS scripts ficam ativos desde o dia 1. Mínimo
obrigatório da TráfegoPRO em qualquer modo:

1. **Pacing diário de verba** — projeta gasto do mês vs. verba contratada e alerta a partir de ±10% de desvio (operado em conjunto com a skill `budget-pacing`).
2. **Alerta de anomalia** — gasto sem conversão acima de limiar (1× CPA_teto por campanha/dia) gera notificação.
3. **Auditoria semanal de QS** — exporta keywords com QS ≤ 4 para a fila do optimization-executor.

Exemplo mínimo de verificação de pacing (referência de formato; a versão mantida/instalável é a da `gads-scripts`):

```javascript
// Pacing simples: alerta se o gasto projetado do mês desviar >10% da verba.
function main() {
  var VERBA_MENSAL = 30000; // preencher com a verba do plano (moeda da conta)
  var TOLERANCIA = 0.10;
  var hoje = new Date();
  var diaDoMes = hoje.getDate();
  var diasNoMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0).getDate();
  var gastoMes = AdsApp.currentAccount()
    .getStatsFor('THIS_MONTH')
    .getCost();
  var gastoProjetado = (gastoMes / diaDoMes) * diasNoMes;
  var desvio = (gastoProjetado - VERBA_MENSAL) / VERBA_MENSAL;
  if (Math.abs(desvio) > TOLERANCIA) {
    var direcao = desvio > 0 ? 'ACIMA' : 'ABAIXO';
    MailApp.sendEmail(
      'alertas@trafegopro.exemplo',
      '[TráfegoPRO] Pacing ' + direcao + ' da verba',
      'Gasto no mês: ' + gastoMes.toFixed(2) +
      '\nProjeção fim do mês: ' + gastoProjetado.toFixed(2) +
      '\nVerba contratada: ' + VERBA_MENSAL.toFixed(2) +
      '\nDesvio projetado: ' + (desvio * 100).toFixed(1) + '%'
    );
  }
}
```

---

## 8. Anti-padrões que o plano deve proibir explicitamente

1. Ligar PMax no dia 1 de conta zerada sem feed nem histórico — PMax sem sinal de conversão aprende devagar e caro.
2. Misturar brand e categoria na mesma campanha.
3. Broad match + lance manual.
4. Mudar tCPA/tROAS mais de 1× por semana ou em degraus > 15%.
5. Julgar campanha em período de aprendizado (primeiros dias após mudança estrutural) — definir no plano a janela de carência antes de qualquer veredito.
6. Otimizar para micro-conversão primária "para dar volume ao algoritmo" — o algoritmo otimiza para o que você pedir, inclusive para lixo.
7. Pausar/ativar campanhas em reação a 1 dia ruim — decisões com janela mínima definida no plano (em geral 7 dias ou N conversões, o que vier antes).
8. Escalar verba e trocar criativo simultaneamente.
