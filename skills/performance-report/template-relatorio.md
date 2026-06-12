# Template de Relatório de Performance — TráfegoPRO

> Arquivo auxiliar da skill `performance-report` (agente performance-analyst).
> Cada seção está marcada com os modos em que entra: **[S]** semanal, **[M]** mensal, **[C]** consolidado.
> Tudo entre `{{chaves}}` é preenchível. Tudo entre `<!-- -->` é instrução para o agente — apagar do output final.

---

## 0. Convenções gerais (ler antes de preencher)

### 0.1 Regras de comparação
- **Semanal:** semana fechada seg–dom vs semana fechada anterior. Nunca semana parcial vs cheia.
- **Mensal:** mês fechado vs mês anterior; quando houver 13+ meses de histórico, adicionar coluna vs mesmo mês do ano anterior (YoY).
- **Consolidado:** série mensal do período + comparação contra o plano original (`media-plan-builder`) quando existir.
- Períodos com nº de dias diferentes → comparar **médias diárias**, não totais, e dizer isso na nota de método.
- Feriado/data atípica dentro de qualquer período → nota obrigatória na seção 1.3.

### 0.2 Regras de semáforo (aplicar em todo scorecard)
Semáforo mede o KPI **contra a meta**, não contra o período anterior (o delta vs anterior é coluna própria).

| Semáforo | Métrica de custo (CPA, CPC) | Métrica de retorno (ROAS, conv., receita) |
|---|---|---|
| 🟢 Verde | ≤ meta, ou até **+5%** acima | ≥ meta, ou até **−5%** abaixo |
| 🟡 Amarelo | entre **+5% e +20%** acima da meta | entre **−5% e −20%** abaixo da meta |
| 🔴 Vermelho | **>+20%** acima da meta | **>−20%** abaixo da meta |
| ⚪ Sem leitura | abaixo do piso de volume (glossário, seção 3) — reportar "amostra insuficiente" | idem |

- KPIs sem meta contratada (ex.: CTR) usam semáforo vs **mediana das últimas 8 semanas da própria conta** (declarar a base). Sem 8 semanas de histórico → ⚪ com nota.
- As faixas ±5/±20% são o padrão da casa; se o contrato definir tolerâncias próprias, as do contrato prevalecem (registrar na nota de método).

### 0.3 Tabela de severidade de alertas
Todo alerta publicado precisa de: severidade, evidência (número), dono e prazo.

| Sev. | Critério (exemplos de gatilho) | Dono padrão | Prazo de ação |
|---|---|---|---|
| **P1 — Crítico** | Tracking quebrado / conversões zeradas com gasto rodando; gasto >120% do pacing planejado; campanha reprovada/conta suspensa; LP fora do ar | tracking-engineer (tracking) / traffic-strategist (verba) / optimization-executor (pausa imediata) | **24h** |
| **P2 — Alto** | KPI primário 🔴 por 2 ciclos seguidos; Search IS lost (budget) >20% em campanha 🟢; perda por classificação subindo 3 semanas seguidas; CPA da maior campanha >+20% sem causa identificada | optimization-executor (via `optimization-routine`) ou traffic-strategist (via `budget-pacing`) | **até o próximo ciclo** |
| **P3 — Atenção** | KPI 🟡; tendência negativa ainda dentro da meta; célula nova ainda sem leitura; lag de conversão distorcendo últimos dias | performance-analyst monitora; entra no radar do próximo relatório | **monitorar** |

### 0.4 Biblioteca de leitura executiva (tom)
Escrever para o decisor do cliente. Padrões:
- ✅ *"O custo por venda subiu 14% (de R$ {{x}} para R$ {{y}}) porque o CPC médio subiu 18% com a entrada de um novo concorrente no leilão das palavras de marca — a taxa de conversão ficou estável, ou seja, o site não é o problema."*
- ✅ *"Deixamos de aparecer em 31% das buscas por falta de orçamento na campanha {{nome}}, que está dentro da meta de CPA — há demanda comprável que não estamos comprando. Recomendação: escalar via pacing."*
- ✅ *"Conversões dos últimos 3 dias ainda vão subir com o lag de atribuição — a leitura final desta semana fecha em {{data}}."*
- ❌ *"O tCPA performou acima do expected com IS lost rank elevado"* (jargão sem tradução).
- ❌ *"Performance boa no geral"* (sem número, sem causa).
- Proibido: prometer resultado futuro como certeza; usar benchmark de mercado sem fonte pesquisada e citada.

---

# RELATÓRIO DE PERFORMANCE — {{CONTA}}

| Campo | Valor |
|---|---|
| Modo | {{Semanal / Mensal / Consolidado}} |
| Período analisado | {{dd/mm/aaaa}} – {{dd/mm/aaaa}} ({{n}} dias) |
| Período de comparação | {{dd/mm/aaaa}} – {{dd/mm/aaaa}} |
| Meta primária contratada | {{CPA ≤ R$ X / ROAS ≥ Yx / Z leads/mês}} |
| Janela/modelo de atribuição vigente | {{ex.: data-driven, janela 30d clique}} |
| Gerado em | {{data}} pelo agente performance-analyst (TráfegoPRO) |

---

## 1. Sumário executivo **[S][M][C]**

### 1.1 Veredito em uma frase
> {{Ex.: "Mês dentro da meta de CPA (R$ 47 vs alvo R$ 50), com oportunidade clara de escala: perdemos 28% das impressões por orçamento nas campanhas que mais convertem."}}

### 1.2 Top 3 destaques / Top 3 atenções
| 🏆 Destaques | ⚠️ Atenções |
|---|---|
| 1. {{fato + número + por quê}} | 1. {{fato + número + por quê}} |
| 2. {{...}} | 2. {{...}} |
| 3. {{...}} | 3. {{...}} |

### 1.3 Notas de método e qualidade do dado *(obrigatória — não publicar relatório sem ela)*
- Lag de conversão: {{ex.: "conversões de {{dd}}–{{dd}} ainda parciais; leitura final em {{data}}" / "sem impacto: período fechou há mais de {{n}} dias"}}
- Comparabilidade: {{feriados/datas atípicas/nº de dias — ajustes feitos}}
- Mudanças estruturais no período: {{atribuição/ações de conversão/tags/site — "nenhuma identificada" ou descrever}}
- Células sem leitura estatística (⚪): {{listar ou "nenhuma"}}

---

## 2. Scorecard de KPIs **[S][M][C]**

<!-- Fórmulas e definições: glossario-kpis.md, seção 2. Modo mensal com 13+ meses de histórico: adicionar coluna "vs YoY". Modo consolidado: substituir por série mensal (seção 8). -->

| KPI | Período atual | Período anterior | Δ vs anterior | Meta | Δ vs meta | Semáforo |
|---|---:|---:|---:|---:|---:|:--:|
| Investimento (R$) | {{}} | {{}} | {{±%}} | {{verba planejada}} | {{pacing %}} | {{🟢🟡🔴}} |
| Impressões | {{}} | {{}} | {{±%}} | — | — | — |
| Cliques | {{}} | {{}} | {{±%}} | — | — | — |
| CTR | {{%}} | {{%}} | {{±p.p.}} | {{mediana 8 sem.}} | {{}} | {{}} |
| CPC médio (R$) | {{}} | {{}} | {{±%}} | {{se houver}} | {{}} | {{}} |
| Conversões | {{}} | {{}} | {{±%}} | {{meta volume}} | {{}} | {{}} |
| Taxa de conversão | {{%}} | {{%}} | {{±p.p.}} | {{se houver}} | {{}} | {{}} |
| CPA (R$) | {{}} | {{}} | {{±%}} | {{CPA-alvo}} | {{±%}} | {{}} |
| Valor de conversão (R$) | {{}} | {{}} | {{±%}} | — | — | — |
| ROAS | {{x}} | {{x}} | {{±%}} | {{ROAS-alvo}} | {{±%}} | {{}} |
| Search Impression Share | {{%}} | {{%}} | {{±p.p.}} | — | — | — |
| Search IS lost (budget) | {{%}} | {{%}} | {{±p.p.}} | <10% (régua da casa) | {{}} | {{}} |
| Search IS lost (rank) | {{%}} | {{%}} | {{±p.p.}} | <30% (régua da casa) | {{}} | {{}} |

<!-- Régua da casa para perdas de IS: são limites operacionais internos da TráfegoPRO para disparo de análise, não benchmark de mercado — manter a nota no relatório. -->

---

## 3. Decomposição de variação (causa-raiz) **[S][M][C]**

<!-- Obrigatória para todo KPI primário 🟡 ou 🔴. Usar as árvores da seção 4 do glossário. Uma sub-seção por KPI desviado. -->

### 3.1 {{KPI}} — {{ex.: "CPA +18% vs mês anterior"}}
| Componente | Período atual | Anterior | Δ | Contribuição para o desvio |
|---|---:|---:|---:|---|
| {{ex.: CPC médio}} | {{}} | {{}} | {{±%}} | {{ex.: "explica ~80% da alta do CPA"}} |
| {{ex.: Taxa de conversão}} | {{}} | {{}} | {{±p.p.}} | {{}} |
| {{ex.: Mix de campanhas (share de gasto por campanha)}} | {{}} | {{}} | {{}} | {{}} |

**Causa-raiz identificada:** {{narrativa em 2–4 linhas: o que mudou, evidência, desde quando}}
**Se não identificada:** *"Causa não identificada — investigação aberta: {{hipóteses a testar}} — responsável: {{agente}} — prazo: {{data}}."*

---

## 4. Parcela de impressão e espaço de crescimento **[M][C]** *(no semanal: só se houver alerta)*

| Campanha | IS | IS lost (budget) | IS lost (rank) | KPI vs meta | Leitura |
|---|---:|---:|---:|:--:|---|
| {{}} | {{%}} | {{%}} | {{%}} | {{🟢🟡🔴}} | {{escolher leitura da matriz abaixo}} |

**Matriz de leitura (usar exatamente esta lógica):**
| Situação | Leitura | Encaminhamento |
|---|---|---|
| KPI 🟢 + perda por **orçamento** alta | Demanda comprável não comprada — melhor cenário possível | Escala via **traffic-strategist** / `budget-pacing` |
| KPI 🟢 + perda por **rank** alta | Crescer exige melhorar qualidade/lance, não só verba | Diagnóstico com especialista da campanha (search-specialist / pmax-specialist) |
| KPI 🔴 + perda por **orçamento** alta | NÃO escalar — primeiro consertar a eficiência | `optimization-routine` antes de qualquer verba nova |
| KPI 🔴 + perda por **rank** alta | Problema de competitividade + eficiência; possível causa comum (relevância/QS/LP) | Investigação conjunta; se recorrente, `account-audit` |

---

## 5. Leitura por campanha **[S][M]**

<!-- Uma linha por campanha ativa com gasto no período. Ordenar por investimento desc. Campanhas ⚪: listar à parte como "sem leitura". No modo semanal pode-se limitar às top N campanhas = 80% do gasto, declarando o corte. -->

| Campanha | Tipo | Estágio funil | Custo | Conv. | CPA / ROAS | Δ vs anterior | Semáforo | Nota de leitura (1 linha) |
|---|---|---|---:|---:|---:|---:|:--:|---|
| {{}} | {{Search/PMax/Video/Display/Demand Gen}} | {{topo/meio/fundo}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{causa ou ação}} |

**Particularidades por tipo (não esquecer):**
- **PMax:** sem termos de busca completos — usar insights de grupos de recursos/canais; queda de performance pode ser canal (Shopping vs Display vs YouTube) e não "a campanha". Ver glossário, seção 6.2.
- **Video/Display:** CTR e taxa de conversão por clique têm leitura diferente (view-through, intenção baixa) — não comparar com Search na mesma régua.
- **Search marca vs não-marca:** sempre que a conta tiver campanha de marca, reportar os KPIs de marca separados — marca embute ROAS alto que mascara a performance incremental do não-marca.

---

## 6. Alertas ativos **[S][M][C]**

| # | Sev. | Alerta (com número-evidência) | Dono | Prazo | Status |
|---|:--:|---|---|---|---|
| 1 | {{P1/P2/P3}} | {{ex.: "Search IS lost (budget) = 34% na campanha X, que está 🟢 em CPA"}} | {{agente}} | {{data}} | {{novo / em andamento / resolvido}} |

<!-- Repetir alertas P1/P2 ainda abertos do ciclo anterior com status atualizado. Alerta resolvido aparece UMA última vez como "resolvido" e sai do próximo relatório. -->

---

## 7. Decisões do ciclo e próximas ações **[S][M][C]**

### 7.1 O que foi feito neste período
<!-- Importar dos blocos "Decisões deste ciclo" dos outputs de budget-pacing e optimization-routine. -->
| Data | Ação executada | Campanha | Executor | Resultado observado até agora |
|---|---|---|---|---|
| {{}} | {{}} | {{}} | optimization-executor | {{ou "janela de observação até {{data}}"}} |

### 7.2 Plano do próximo ciclo
| Ação recomendada | Justificativa (nº do alerta/seção) | Dono | Skill de execução | Prazo |
|---|---|---|---|---|
| {{}} | {{}} | {{}} | {{optimization-routine / budget-pacing / tracking-blueprint / account-audit}} | {{}} |

---

## 8. Série histórica e tendência **[C]** *(modo consolidado apenas)*

| Mês | Investimento | Conv. | CPA | ROAS | IS | Meta do mês | Atingimento |
|---|---:|---:|---:|---:|---:|---:|---:|
| {{AAAA-MM}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{}} | {{%}} |

**Leitura estrutural (responder explicitamente):**
1. A conta está ficando mais eficiente, estável ou mais cara ao longo do período? Evidência: {{}}
2. O que escalou e sustentou? O que escalou e degradou? O que foi cortado e por quê?
3. Sazonalidade observada na própria conta (mínimo 2 ciclos comparáveis — senão declarar "histórico insuficiente para afirmar sazonalidade"): {{}}
4. Desvio vs plano original (`media-plan-builder`): {{dentro / desvio tático / desvio estrutural}}
5. **Se desvio estrutural por 3+ ciclos:** recomendação formal de `account-audit` (account-auditor) + revisão de plano (traffic-strategist). {{sim/não + justificativa}}

---

## 9. Anexo A — Fechamento de leitura com lag **[S][M]**

<!-- Preencher quando a nota 1.3 indicou conversões parciais. -->
- Ciclo típico de conversão da conta (medido nela mesma): {{n}} dias entre clique e conversão para {{x}}% das conversões.
- Datas com leitura ainda parcial neste relatório: {{dd}}–{{dd}}.
- Data em que esta leitura será refechada: {{data}} — responsável: performance-analyst.
- Regra: nenhuma decisão de corte (`optimization-routine`) pode citar como evidência exclusivamente os dias listados acima.

---

## 10. Anexo B — Script Google Ads de extração do scorecard

<!-- Oferecer ao cliente quando ele quiser automatizar a coleta. A instalação/manutenção segue o fluxo da skill `gads-scripts`. Frequência sugerida: diária, 1ª hora da manhã. -->

```javascript
/**
 * TráfegoPRO — Extrator de scorecard para performance-report
 * Escreve em uma planilha: data, campanha, tipo, custo, impressões, cliques,
 * conversões, valor de conversão, IS e perdas de IS (budget/rank).
 * Janela: últimos 35 dias (cobre semana + mês + margem de lag).
 * Instalação e manutenção: skill gads-scripts.
 */
var CONFIG = {
  SPREADSHEET_URL: 'COLE_AQUI_A_URL_DA_PLANILHA',
  ABA: 'raw_scorecard',
  DIAS: 35
};

function main() {
  var ss = SpreadsheetApp.openByUrl(CONFIG.SPREADSHEET_URL);
  var sheet = ss.getSheetByName(CONFIG.ABA) || ss.insertSheet(CONFIG.ABA);
  sheet.clearContents();
  sheet.appendRow(['data', 'campanha', 'tipo', 'custo', 'impressoes', 'cliques',
                   'conversoes', 'valor_conversao', 'search_is',
                   'is_lost_budget', 'is_lost_rank']);

  var query =
    "SELECT segments.date, campaign.name, campaign.advertising_channel_type, " +
    "metrics.cost_micros, metrics.impressions, metrics.clicks, " +
    "metrics.conversions, metrics.conversions_value, " +
    "metrics.search_impression_share, " +
    "metrics.search_budget_lost_impression_share, " +
    "metrics.search_rank_lost_impression_share " +
    "FROM campaign " +
    "WHERE segments.date DURING LAST_30_DAYS " +  // ajustar com BETWEEN para CONFIG.DIAS se necessário
    "AND metrics.cost_micros > 0 " +
    "ORDER BY segments.date";

  var rows = AdsApp.search(query);
  var out = [];
  while (rows.hasNext()) {
    var r = rows.next();
    out.push([
      r.segments.date,
      r.campaign.name,
      r.campaign.advertisingChannelType,
      Number(r.metrics.costMicros) / 1e6,
      Number(r.metrics.impressions),
      Number(r.metrics.clicks),
      Number(r.metrics.conversions),
      Number(r.metrics.conversionsValue),
      r.metrics.searchImpressionShare || '',
      r.metrics.searchBudgetLostImpressionShare || '',
      r.metrics.searchRankLostImpressionShare || ''
    ]);
  }
  if (out.length > 0) {
    sheet.getRange(2, 1, out.length, out[0].length).setValues(out);
  }
  Logger.log('Linhas exportadas: ' + out.length);
}
```

**Notas de uso do script:**
- Métricas de IS vêm vazias para tipos de campanha que não as reportam (ex.: Video) — o template trata como "—", não como zero.
- Conversões dos últimos dias chegarão incompletas (lag) — por isso a janela de 35 dias: o refechamento da seção 9 usa a mesma planilha.
- Mudou ação de conversão ou janela de atribuição? Anotar a data na aba `changelog` da planilha — a seção 1.3 do relatório depende disso.

---

*Fim do template. Lembrete final ao agente: relatório sem seção 1.3 preenchida, sem causa-raiz nos KPIs desviados ou com alerta sem dono/prazo está INCOMPLETO — não entregar.*
