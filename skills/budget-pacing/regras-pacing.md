# Regras de Pacing — Framework Operacional TráfegoPRO

> Playbook do agente **traffic-strategist** para a skill `budget-pacing`.
> Tudo aqui é regra operacional da TráfegoPRO. Onde aparecer um número padrão ("default TráfegoPRO"), ele é **heurística interna configurável** — deve ser recalibrado com os dados da própria conta assim que houver histórico. Onde um benchmark externo de mercado for necessário, **pesquisar e citar fonte ou declarar a lacuna**. Nunca apresentar heurística interna como "benchmark de mercado".

---

## 1. Fórmulas e indicadores de pacing

### 1.1 Indicadores obrigatórios (calcular antes de qualquer opinião)

| Indicador | Fórmula | Leitura |
|---|---|---|
| **Gasto acumulado (MTD spend)** | Σ custo do dia 1 até hoje | Base de tudo |
| **% do mês decorrido** | dias decorridos ÷ dias do mês | Use dias **completos** (ontem como último dia fechado) |
| **% da verba consumida** | MTD spend ÷ verba mensal | — |
| **Pacing index** | (% da verba consumida) ÷ (% do mês decorrido) | 1,00 = ritmo perfeito |
| **Run rate diário** | MTD spend ÷ dias decorridos | Gasto médio/dia real |
| **Projeção de fechamento (linear)** | run rate × dias do mês | Primeira projeção, ingênua |
| **Projeção de fechamento (ponderada)** | MTD spend + Σ (orçamento diário planejado × peso do dia) para os dias restantes | Use esta quando houver curva de sazonalidade (§2.2) |
| **Verba restante/dia** | (verba mensal − MTD spend) ÷ dias restantes | Novo orçamento diário médio se for redistribuir |

### 1.2 Faixas de leitura do pacing index (default TráfegoPRO)

| Pacing index | Classificação | Postura |
|---|---|---|
| 0,95 – 1,05 | **No ritmo** | Não mexer em orçamento por causa de pacing |
| 0,85 – 0,94 | **Sub-pacing leve** | Investigar causa antes de mexer (§5) |
| < 0,85 | **Sub-pacing grave** | Ação obrigatória no próximo checkpoint |
| 1,06 – 1,15 | **Over-pacing leve** | Investigar causa; preparar freio |
| > 1,15 | **Over-pacing grave** | Ação imediata, sem esperar checkpoint |

Importante: **pacing nunca é lido sozinho** — sempre cruzado com performance (CPA/ROAS vs meta) na tabela da §5. Gastar no ritmo certo com CPA estourado não é sucesso.

### 1.3 Comportamento do Google Ads que afeta a leitura (verificar na documentação oficial antes de citar ao cliente)

- O Google Ads pode gastar **acima do orçamento diário em dias de alta demanda** (historicamente até 2× o orçamento diário), compensando em dias mais fracos; o teto cobrado no ciclo é limitado pelo orçamento diário multiplicado pelo número médio de dias do mês (~30,4). Consequência prática: **nunca diagnostique over-pacing por causa de 1–2 dias acima do orçamento diário** — avalie janelas de 7 dias.
- Mudanças de orçamento **não se propagam instantaneamente** em estratégias de Smart Bidding; o sistema redistribui ao longo de dias.
- Campanhas PMax e Demand Gen tendem a consumir orçamento de forma mais agressiva no início; considere isso ao ler os primeiros dias do mês.

---

## 2. Distribuição da verba mensal em orçamentos diários

### 2.1 Distribuição linear (default para contas sem histórico)

```
orçamento diário = verba mensal líquida ÷ dias do mês
verba mensal líquida = verba aprovada − reserva tática (§3.2)
```

Use linear quando: conta nova, menos de 90 dias de histórico, ou mudança estrutural recente (troca de oferta, sazonalidade atípica). Compense a falta de curva com **checkpoints mais frequentes** (a cada 3–4 dias no primeiro mês).

### 2.2 Distribuição ponderada por dia da semana (default para contas com ≥ 90 dias)

Procedimento — **sempre com dados da própria conta**, nunca com curva inventada:

1. Exportar custo e conversões por dia da semana dos **últimos 90 dias** (excluir datas atípicas: Black Friday, feriados, quedas de site — listar exclusões no plano).
2. Calcular o peso de cada dia: `peso(dia) = média de conversões do dia ÷ média geral de conversões/dia`. Se a meta é ROAS, usar valor de conversão no lugar de conversões.
3. Normalizar para que a soma dos pesos da semana = 7.
4. Orçamento do dia D: `(verba mensal líquida ÷ dias do mês) × peso(D)`.
5. **Trava de segurança:** nenhum dia recebe peso < 0,6 nem > 1,5 (default TráfegoPRO) — fora disso, o mais provável é dado contaminado, não sazonalidade real.

Sazonalidade **intra-mês** (ex.: e-commerce com pico no dia do pagamento, B2B morto na última semana de dezembro): aplicar um segundo multiplicador por semana do mês, também derivado do histórico da conta. Se o cliente alega sazonalidade que o histórico não mostra, registrar a alegação e testar com reserva tática — não com a verba base.

### 2.3 Mês com data-evento (lançamento, promoção, Black Friday)

- Separar a verba em **verba always-on** + **verba de evento** com pacing independente.
- Verba de evento: distribuir em rampa — exemplo de estrutura (calibrar com o histórico do evento anterior, se existir): aquecimento (D-14 a D-4) / pico (D-3 a D+1) / cauda (D+2 a D+7).
- Nunca deixar o evento canibalizar o always-on silenciosamente: se o evento estourar, a decisão de tirar verba do always-on é **explícita e registrada**, não automática.

---

## 3. Distribuição por campanha, reserva tática e faixas de tolerância

### 3.1 Alocação por campanha

A alocação por campanha/estágio de funil vem do output da skill `media-plan-builder`. Esta skill **não redesenha o mix** — ela faz o mix aprovado ser gasto no ritmo certo. Se o pacing revelar que o mix está errado (ex.: campanha de fundo de funil sem inventário para gastar), a recomendação é **reabrir o plano de mídia com a `media-plan-builder`**, não improvisar realocação grande no meio do mês.

Realocações permitidas dentro desta skill (sem reabrir o plano): até **15% da verba mensal** movida entre campanhas do **mesmo estágio de funil** por mês (default TráfegoPRO). Acima disso → reabrir plano.

### 3.2 Reserva tática

- Default TráfegoPRO: **10% da verba mensal** fica fora da distribuição inicial (contas voláteis ou mês de evento: até 15%).
- Usos legítimos: financiar degraus de escala (§4) sem estourar o teto, absorver over-pacing de campanha vencedora, testar alegação de sazonalidade do cliente.
- Regra de liberação: reserva não usada até o **dia 20** começa a ser liberada nos checkpoints seguintes para as campanhas com melhor desvio positivo de meta — verba aprovada existe para ser investida, não devolvida por inércia.

### 3.3 Teto rígido vs meta de investimento

Perguntar sempre (Passo 1 da skill): a verba é **teto contratual rígido** (estourar = problema com o cliente) ou **meta de investimento** (sobrar = problema)?

- **Teto rígido:** operar com pacing-alvo 0,97 (gastar ~97% é fechamento perfeito); over-pacing grave é incidente.
- **Meta de investimento:** operar com pacing-alvo 1,00–1,03; sub-pacing grave é incidente (verba não investida = resultado não entregue).

---

## 4. Regras de escala — subir orçamento sem resetar o aprendizado

### 4.1 O que coloca o Smart Bidding de volta em learning (evitar combinar)

Mudanças que individualmente já perturbam o aprendizado — e que **nunca devem ser feitas juntas no mesmo dia** na mesma campanha:

1. Mudança grande de orçamento (acima do degrau da §4.3).
2. Mudança grande de tCPA/tROAS (acima de ~10–15% por ajuste — heurística TráfegoPRO; validar contra a documentação/recomendação atual do Google).
3. Troca de estratégia de lance (ex.: Maximize Conversions → tCPA).
4. Mudança estrutural de segmentação, criativos em massa ou ação de conversão primária.

Regra prática: **uma alavanca por campanha por janela de observação**. Orçamento OU target OU estrutura — nunca dois ao mesmo tempo.

### 4.2 Elegibilidade para escala (todas as condições, não "alguma")

Uma campanha só entra em modo escala se:

- [ ] **Performance:** CPA ≤ meta (ou ROAS ≥ meta) na janela das **últimas 2 semanas completas**, não só ontem.
- [ ] **Volume estatístico:** ≥ 30 conversões nos últimos 30 dias na campanha (default TráfegoPRO; abaixo disso a "boa performance" pode ser ruído). Para contas pequenas, usar ≥ 15 e degraus menores.
- [ ] **Fora de learning:** estratégia de lance sem status "Learning" e sem mudança relevante nos últimos 7 dias.
- [ ] **Demanda comprovada:** evidência de que há inventário para comprar — em Search: `Search IS lost (budget)` > 0 ou orçamento limitando ("Limited by budget"); em PMax/Display/Vídeo: campanha batendo o teto diário consistentemente. **Escalar campanha que não gasta o orçamento atual é incoerência — o gargalo é outro** (lance, segmentação, criativo), e a recomendação correta é diagnóstico, não verba.
- [ ] **Tracking saudável:** sem suspeita de conversão duplicada/quebrada (na dúvida, acionar o agente **tracking-engineer** via skill `tracking-blueprint` antes de escalar — escalar em cima de tracking quebrado é queimar verba com selo de aprovação).

### 4.3 Tabela de degraus de escala (default TráfegoPRO)

| Situação da campanha | Degrau máximo por ajuste | Janela mínima de observação antes do próximo degrau |
|---|---|---|
| Escala padrão (elegível §4.2) | **+20%** do orçamento diário | 5–7 dias **ou** até acumular ~2 ciclos de conversão (o que for maior) |
| Conta/campanha madura, CPA muito abaixo da meta (folga > 30%) | até **+30%** | 7 dias |
| Campanha recém-saída de learning | **+10%** | 7 dias |
| Evento com data marcada (rampa planejada §2.3) | degraus pré-agendados no plano | conforme rampa |

Notas:
- O limite de ~20% por ajuste é **heurística consagrada de mercado, não regra documentada do Google** — apresentar como prática da TráfegoPRO e validar o comportamento na própria conta (se a campanha degrada após degraus de 20%, reduzir para 10–15%).
- "Ciclo de conversão" = lag médio entre clique e conversão (ver em Ferramentas → Atribuição). Campanha com lag de 10 dias **não pode ser julgada 3 dias após o degrau**.
- Escalar com tCPA/tROAS ativo: ao subir orçamento, **não aperte o target junto**. Se quiser mais volume com tCPA, a alavanca alternativa é afrouxar o target (subir tCPA / descer tROAS) em passos de ≤ 10–15% — uma alavanca por vez (§4.1).

### 4.4 Escala vertical vs horizontal

- **Vertical** (mais verba na mesma campanha): primeira opção enquanto `IS lost (budget)` > 0 e CPA estável.
- **Horizontal** (nova campanha/segmento/rede): quando a vertical der sinais de saturação — CPA marginal subindo a cada degrau, IS por orçamento zerado, frequência alta em vídeo/display. Escala horizontal **sai desta skill**: vira demanda para `media-plan-builder` (novo mix) e para os builders (`search-campaign-builder`, `pmax-campaign-builder`, `video-display-builder`).
- Registrar o **CPA marginal** dos degraus (Δcusto ÷ Δconversões entre janelas): quando o CPA marginal cruza a meta, parar a escala vertical mesmo que o CPA médio ainda esteja ok.

### 4.5 Critério de rollback (obrigatório em toda recomendação de escala)

Toda escala sai com: *"Se ao fim da janela de observação o CPA da janela pós-degrau exceder a meta em mais de X% (default: 20%) com volume mínimo de conversões para julgar, reverter o orçamento ao valor anterior e manter por 7 dias antes de novo diagnóstico."* Rollback é volta ao valor anterior — **não** é corte abaixo do ponto de partida.

---

## 5. Tabela de decisão por desvio de meta (pacing × performance)

Cruzar **pacing index** (§1.2) com **performance vs meta** (CPA ou ROAS na janela das últimas 2 semanas). Esta é a tabela usada em todo checkpoint:

| | **Performance MELHOR que a meta** (CPA ≤ 90% da meta / ROAS ≥ 110%) | **Performance NA meta** (±10%) | **Performance PIOR que a meta** (CPA > 110% / ROAS < 90%) |
|---|---|---|---|
| **Sub-pacing grave** (< 0,85) | **Acelerar com prioridade.** Diagnóstico de gargalo (IS budget? lance? aprovação de anúncio?). Liberar reserva tática + degrau de escala §4.3 nas campanhas elegíveis. | **Acelerar com cautela.** Redistribuir verba restante (§1.1) nas campanhas no ritmo; degrau de +10–20% onde houver demanda comprovada. | **Não acelerar.** Verba sobrando + CPA ruim = problema de conta, não de pacing. Abrir diagnóstico (account-auditor / skill `account-audit` se for estrutural) antes de qualquer mexida de orçamento. |
| **Sub-pacing leve** (0,85–0,94) | Liberar reserva tática gradualmente nas vencedoras. Sem urgência. | Redistribuir verba restante pelos dias que faltam; monitorar. | Manter orçamentos; atacar performance (negativação, criativos via `ad-copy-builder`, lances). O sub-pacing aqui é amortecedor, não problema. |
| **No ritmo** (0,95–1,05) | **Cenário de escala.** Rodar checklist §4.2; se elegível, propor degrau usando reserva tática ou pedido de verba incremental ao cliente (com projeção de retorno). | **Não mexer.** Registrar e seguir. A pior decisão aqui é mexer por ansiedade. | Manter pacing; atacar performance. Se CPA seguir ruim por 2 checkpoints, iniciar protocolo de corte (§6) nas piores campanhas e realocar dentro do limite da §3.1. |
| **Over-pacing leve** (1,06–1,15) | Tolerável se teto não é rígido — verba indo para resultado bom. Com teto rígido: frear −10% nos orçamentos das campanhas com pior CPA marginal. | Frear −10% distribuído, começando pelas campanhas com pior eficiência. Reavaliar em 3–4 dias. | **Frear forte:** −20% nas campanhas piores que a meta; manter as que performam. |
| **Over-pacing grave** (> 1,15) | Com teto rígido: frear imediatamente para a verba restante/dia (§1.1). Sem teto rígido: propor formalmente verba incremental ao cliente **antes** de frear uma operação que está batendo meta. | Frear imediatamente para verba restante/dia; investigar causa (degrau recente demais? evento? CPC inflado por concorrente — acionar `competitor-recon` se houver suspeita). | **Incidente.** Frear para verba restante/dia HOJE + iniciar protocolo de corte §6 nas ofensoras + comunicar o cliente com plano de correção. Não esperar checkpoint. |

Regras de leitura da tabela:
1. A célula dá a **direção**; os valores exatos saem das fórmulas da §1.1 e dos degraus da §4.3.
2. Ação em **no máximo 30% das campanhas por checkpoint** — mexer na conta inteira de uma vez destrói a capacidade de atribuir causa.
3. Toda ação da tabela vira instrução para o **optimization-executor** (skill `optimization-routine`) com valor exato, data e critério de rollback.

---

## 6. Regras de corte

### 6.1 Pisos de dados antes de cortar (proteção contra corte por ruído)

| Tipo de campanha | Mínimo antes de qualquer corte por performance |
|---|---|
| Search (não-brand) | gasto ≥ 2× CPA-meta **e** ≥ 14 dias corridos |
| PMax | gasto ≥ 3× CPA-meta **e** ≥ 3 semanas (PMax demora mais a estabilizar; validar comportamento na conta) |
| Vídeo/Display (resposta direta) | gasto ≥ 3× CPA-meta e ≥ 14 dias |
| Vídeo/Display (awareness — meta de alcance/CPM/CPV) | **não corta por CPA** — julgar pela métrica contratada |
| Qualquer campanha em learning | não corta — esperar sair de learning + 7 dias |

Campanha abaixo do piso com sinais ruins → status **"em observação"** com data de julgamento marcada, não pausa.

### 6.2 Escada de corte (sempre gradual, exceto incidente)

1. **Degrau −20%** no orçamento diário + correções de performance (termos negativos, exclusões de canal/placement, criativo). Observar 5–7 dias.
2. **Degrau −30%** adicional se não houver melhora. Observar 5–7 dias.
3. **Quarentena:** orçamento mínimo operacional (suficiente para ~1 conversão/dia esperada) por até 14 dias enquanto se decide reformular ou matar.
4. **Pausa** com post-mortem registrado: hipótese de causa, o que foi tentado, aprendizado para o `performance-report`.

**Pausa imediata (pular a escada)** apenas em: tracking comprovadamente quebrado inflando otimização errada, política/reprovação grave, erro de configuração gastando em alvo errado (ex.: geo errado), ou ordem expressa do cliente.

### 6.3 O que NUNCA cortar por pacing

- **Campanha brand** (Search de marca): corte só por decisão estratégica explícita com o cliente — nunca como ajuste de pacing.
- **Campanhas de remarketing alimentadas pelo topo:** antes de cortar o topo de funil, registrar que o fundo perde audiência em ~2–4 semanas (lag a validar na conta) — corte de topo é decisão de plano de mídia, não de checkpoint.
- A **última campanha ativa de um estágio do funil** sem aprovação do plano revisado pela `media-plan-builder`.

### 6.4 Para onde vai a verba cortada

Ordem de preferência: (1) campanhas elegíveis para escala (§4.2) no mesmo estágio de funil; (2) reserva tática; (3) redução formal do investimento do mês comunicada ao cliente (última opção — e nunca decisão unilateral do agente).

---

## 7. Script Google Ads — monitor diário de pacing (JavaScript)

Instalar em **Ferramentas → Scripts** da conta, agendar **diário entre 06h e 08h**. O script calcula pacing da conta e por campanha, aplica labels de estado e envia alerta por e-mail quando sair das faixas. A instalação/manutenção operacional segue o fluxo da skill `gads-scripts`.

```javascript
/**
 * TráfegoPRO — Budget Pacing Monitor v1.2
 * Agendamento: diário (06h–08h). Conta única (não-MCC).
 * O que faz:
 *  1) Calcula gasto MTD, pacing index e projeção de fechamento da conta.
 *  2) Calcula pacing por campanha ativa (vs. orçamento diário planejado).
 *  3) Aplica labels PACING_OK / PACING_UNDER / PACING_OVER nas campanhas.
 *  4) Envia e-mail de alerta quando a conta sai da faixa de tolerância.
 */

var CONFIG = {
  MONTHLY_BUDGET: 30000.00,      // verba mensal líquida (após reserva tática) — moeda da conta
  HARD_CAP: true,                // true = teto contratual rígido (§3.3)
  TOLERANCE_UNDER: 0.85,         // limites da §1.2
  TOLERANCE_OVER: 1.15,
  ALERT_EMAILS: ['gestor@trafegopro.example'],
  LABEL_OK: 'PACING_OK',
  LABEL_UNDER: 'PACING_UNDER',
  LABEL_OVER: 'PACING_OVER',
  TIMEZONE: AdsApp.currentAccount().getTimeZone()
};

function main() {
  ensureLabels_();

  var now = new Date();
  var daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  // Dias COMPLETOS decorridos (ontem é o último dia fechado) — §1.1
  var daysElapsed = Math.max(1, now.getDate() - 1);

  var mtdStats = AdsApp.currentAccount().getStatsFor('THIS_MONTH');
  var mtdSpend = mtdStats.getCost();

  var pctMonth = daysElapsed / daysInMonth;
  var pctBudget = mtdSpend / CONFIG.MONTHLY_BUDGET;
  var pacingIndex = pctBudget / pctMonth;
  var runRate = mtdSpend / daysElapsed;
  var projection = runRate * daysInMonth;
  var remainingPerDay = (CONFIG.MONTHLY_BUDGET - mtdSpend) / Math.max(1, daysInMonth - daysElapsed);

  var lines = [];
  lines.push('=== TráfegoPRO Pacing — conta ' + AdsApp.currentAccount().getName() + ' ===');
  lines.push('Gasto MTD: ' + mtdSpend.toFixed(2) + ' / ' + CONFIG.MONTHLY_BUDGET.toFixed(2) +
             ' (' + (pctBudget * 100).toFixed(1) + '% da verba em ' + (pctMonth * 100).toFixed(1) + '% do mês)');
  lines.push('Pacing index: ' + pacingIndex.toFixed(2));
  lines.push('Run rate: ' + runRate.toFixed(2) + '/dia | Projeção de fechamento: ' + projection.toFixed(2));
  lines.push('Verba restante/dia para fechar exato: ' + remainingPerDay.toFixed(2));
  lines.push('');

  // ---- Pacing por campanha ----
  lines.push('--- Campanhas ativas ---');
  var campaignIt = AdsApp.campaigns()
    .withCondition('campaign.status = ENABLED')
    .get();

  while (campaignIt.hasNext()) {
    var c = campaignIt.next();
    var stats = c.getStatsFor('THIS_MONTH');
    var spend = stats.getCost();
    var dailyBudget = c.getBudget().getAmount();
    var plannedMtd = dailyBudget * daysElapsed;
    var cPacing = plannedMtd > 0 ? spend / plannedMtd : 0;

    var state = CONFIG.LABEL_OK;
    if (cPacing < CONFIG.TOLERANCE_UNDER) state = CONFIG.LABEL_UNDER;
    if (cPacing > CONFIG.TOLERANCE_OVER) state = CONFIG.LABEL_OVER;
    setExclusiveLabel_(c, state);

    lines.push(
      c.getName() + ' | gasto MTD ' + spend.toFixed(2) +
      ' | orçamento/dia ' + dailyBudget.toFixed(2) +
      ' | pacing ' + cPacing.toFixed(2) + ' | ' + state
    );
  }

  var report = lines.join('\n');
  Logger.log(report);

  // ---- Alerta ----
  var accountOff = pacingIndex < CONFIG.TOLERANCE_UNDER || pacingIndex > CONFIG.TOLERANCE_OVER;
  var capRisk = CONFIG.HARD_CAP && projection > CONFIG.MONTHLY_BUDGET * 1.02;
  if (accountOff || capRisk) {
    var subject = '[TráfegoPRO][PACING] ' + AdsApp.currentAccount().getName() +
                  ' — index ' + pacingIndex.toFixed(2) +
                  (capRisk ? ' — RISCO DE ESTOURAR TETO' : '');
    MailApp.sendEmail(CONFIG.ALERT_EMAILS.join(','), subject, report);
  }
}

function ensureLabels_() {
  [CONFIG.LABEL_OK, CONFIG.LABEL_UNDER, CONFIG.LABEL_OVER].forEach(function (name) {
    var it = AdsApp.labels().withCondition("label.name = '" + name + "'").get();
    if (!it.hasNext()) AdsApp.createLabel(name, 'TráfegoPRO budget-pacing', '#999999');
  });
}

function setExclusiveLabel_(campaign, target) {
  [CONFIG.LABEL_OK, CONFIG.LABEL_UNDER, CONFIG.LABEL_OVER].forEach(function (name) {
    var labelIt = campaign.labels().withCondition("label.name = '" + name + "'").get();
    var has = labelIt.hasNext();
    if (has && name !== target) campaign.removeLabel(name);
    if (!has && name === target) campaign.applyLabel(name);
  });
}
```

Limitações conhecidas (declarar ao cliente): o script **lê e rotula, não altera orçamentos** — por decisão da TráfegoPRO, mudança de verba passa pela tabela da §5 e pelo `optimization-executor`, não por automação cega. Para contas MCC ou pausa automática emergencial de teto, tratar como demanda da skill `gads-scripts`.

---

## 8. Template preenchível — Plano de Pacing Mensal

```markdown
# Plano de Pacing — [CONTA] — [MÊS/ANO]

## 1. Verba
- Verba mensal aprovada: R$ [____]
- Tipo: [ ] teto rígido  [ ] meta de investimento   → pacing-alvo: [0,97 / 1,00–1,03]
- Reserva tática ([10–15]%): R$ [____]
- Verba mensal líquida (distribuída): R$ [____]

## 2. Metas
- Meta primária: [CPA ≤ R$ ___ | ROAS ≥ ___ | ___ leads]
- Janela de julgamento de performance: últimas 2 semanas completas
- Lag médio clique→conversão da conta: [___ dias | desconhecido → assumir 7 e medir]

## 3. Distribuição diária
- Método: [ ] linear  [ ] ponderada (histórico 90d — exclusões: ______)
- Pesos por dia da semana (soma = 7): Seg [__] Ter [__] Qua [__] Qui [__] Sex [__] Sáb [__] Dom [__]
- Evento no mês? [não / sim: ______ — verba de evento R$ ____ com rampa própria]

## 4. Alocação por campanha (fonte: media-plan-builder de [data])
| Campanha | Estágio funil | Verba mês | Orç. diário base | Meta da linha | Elegível p/ escala hoje? (§4.2) |
|---|---|---|---|---|---|
| [____] | [topo/meio/fundo] | R$ [__] | R$ [__] | [__] | [sim/não — motivo] |

## 5. Calendário de checkpoints
- D+7 [data]: leitura completa §5  | D+14 [data]: leitura + decisão de escala/corte
- D+21 [data]: leitura + liberação de reserva | D+25 [data]: trava de fechamento (só freios; sem escala nova após D+25)
- Conta sem histórico: checkpoints extras a cada 3–4 dias.

## 6. Automação
- Script de monitoramento (§7) instalado? [sim — data / não — motivo]
- E-mails de alerta: [____]

## 7. Decisões deste ciclo
| Data | Campanha | Ação | Valor | Motivo (célula da §5) | Reavaliar em | Rollback se |
|---|---|---|---|---|---|---|

## 8. Lacunas declaradas
- [ex.: sem histórico de sazonalidade → distribuição linear; benchmark de CPC da vertical não verificado → não citado]
```

---

## 9. Checkpoint — checklist e árvore de decisão

### 9.1 Checklist do checkpoint (executar na ordem)

1. [ ] Exportar gasto/conversões MTD por campanha (dia fechado = ontem).
2. [ ] Calcular os 8 indicadores da §1.1 (conta e por campanha).
3. [ ] Verificar saúde antes de julgar números: tracking ok? (sem queda/pico anômalo de conversões — na dúvida, `tracking-blueprint`); anúncios reprovados? campanhas "Limited by budget"? status de learning?
4. [ ] Classificar cada campanha na matriz da §5.
5. [ ] Montar lista de ações (máx. 30% das campanhas) com valor exato + data + rollback.
6. [ ] Verificar conflitos com a regra "uma alavanca por janela" (§4.1) — adiar o que conflitar.
7. [ ] Emitir instruções para o `optimization-executor` (skill `optimization-routine`).
8. [ ] Atualizar a tabela "Decisões deste ciclo" do plano (§8.7) — insumo do `performance-report`.

### 9.2 Árvore de decisão rápida

```
Pacing index calculado?
├── NÃO → calcular (§1.1). Proibido opinar sem número.
└── SIM
    ├── 0,95–1,05 (no ritmo)
    │   ├── Performance ≥ meta? → rodar checklist de escala §4.2
    │   │   ├── elegível → degrau §4.3 + rollback §4.5
    │   │   └── não elegível → não mexer; registrar motivo
    │   └── Performance < meta? → atacar performance, não orçamento
    │       └── 2 checkpoints ruins seguidos → escada de corte §6.2
    ├── < 0,95 (sub-pacing)
    │   ├── Há demanda não comprada (IS budget / limited)? 
    │   │   ├── SIM e performance ok → acelerar (reserva + redistribuição)
    │   │   └── NÃO → gargalo não é verba: diagnóstico (lance/criativo/aprovação);
    │   │             se estrutural → account-audit
    │   └── < 0,85 → ação obrigatória neste checkpoint
    └── > 1,05 (over-pacing)
        ├── Causado por 1–2 dias de pico (comportamento normal de orçamento diário)? 
        │   └── SIM → observar janela de 7 dias antes de frear
        ├── Teto rígido e projeção > verba? → frear para verba restante/dia
        ├── Performance ≥ meta e sem teto rígido? → propor verba incremental ao cliente
        └── > 1,15 → ação imediata (não espera checkpoint) + comunicar cliente
```

### 9.3 Disciplina de fechamento (D+25 em diante)

- Sem novos degraus de escala após D+25 — degrau tardio não tem janela de observação dentro do mês.
- Reserva tática remanescente: liberar só em campanhas `PACING_OK` com performance ≥ meta.
- D+último dia: registrar fechamento (gasto final, pacing final, % de desvio) — primeiro insumo do plano do mês seguinte e do `performance-report`.
