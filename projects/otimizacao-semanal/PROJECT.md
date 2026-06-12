---
name: Otimização Semanal
slug: otimizacao-semanal
owner: ceo
description: >
  Rotina semanal de otimização das contas Google Ads — do relatório de
  performance (7 dias vs. período anterior) à execução de ações de
  otimização e ajuste de pacing de verba.
---

# Otimização Semanal

Pipeline da rotina semanal de otimização da TráfegoPRO. O CEO coordena 3 etapas
sequenciais: primeiro o Analista de Performance gera o relatório comparativo da
semana com alertas priorizados; em seguida o Executor de Otimização transforma
esses alertas em ações concretas na conta (negativações, lances, pausas,
experimentos); por fim o Estrategista de Tráfego revisa o ritmo de gasto contra
a verba do mês e realoca orçamento entre campanhas. Cada etapa consome o output
da anterior — nenhuma ação de otimização é executada sem relatório, e nenhuma
realocação de verba é feita sem a lista de ações da etapa 2. Nunca invente
métricas ou benchmarks: todo número citado deve vir dos dados reais da conta;
se um benchmark de mercado for necessário e não houver fonte, declare a lacuna
explicitamente em vez de estimar.

**Trigger:** "Roda a otimização da semana / revisa as campanhas"
**Tempo estimado:** 20-40 min

---

## Etapas

### 1. `performance-report` — Performance Analyst (Analista de Performance & Reporting)

Geração do relatório semanal de performance da conta, comparando os últimos 7
dias com o período anterior (7 dias antes). O relatório cobre as métricas
centrais por campanha e por rede — gasto, conversões, CPA, ROAS, CPC, CTR,
impression share — e destaca variações relevantes entre os dois períodos. Cada
variação significativa vira um alerta priorizado com hipótese de causa (ex.:
queda de CTR em RSA específico, CPA subindo em PMax, perda de impression share
por orçamento ou por rank). Quando não houver dado suficiente para diagnosticar
uma variação, o alerta deve registrar a lacuna em vez de especular com números.

- **Input:** dados da conta (período: 7 dias vs anterior)
- **Output:** relatório semanal com alertas

### 2. `optimization-routine` — Optimization Executor (Executor de Otimização de Campanhas)

Execução da rotina de otimização a partir dos alertas do relatório e das metas
definidas no plano de mídia (CPA/ROAS alvo, prioridades por campanha). O
executor percorre o checklist operacional: negativação de termos de pesquisa
irrelevantes ou caros, ajustes de lances e de metas de lance automatizado
(tCPA/tROAS), pausa de keywords, anúncios e ativos com performance
consistentemente abaixo da meta, e proposição de experimentos (novos RSAs,
match types, segmentações, ajustes de assets em PMax). Toda ação registrada
distingue claramente o que foi **executado** do que é apenas **recomendado**
(pendente de aprovação humana ou de acesso), com justificativa baseada nos
dados do relatório — nunca em suposições de benchmark.

- **Input:** relatório semanal + metas do plano de mídia
- **Output:** lista de ações executadas/recomendadas (negativações, lances, pausas, experimentos)

### 3. `budget-pacing` — Traffic Strategist (Estrategista de Tráfego Pago)

Revisão do pacing de verba do mês: compara o gasto acumulado até a data com a
verba mensal planejada, projeta o fechamento do mês no ritmo atual e decide os
ajustes necessários — acelerar, frear ou realocar orçamento entre campanhas e
redes (Search, PMax, vídeo/display) conforme a eficiência demonstrada no
relatório e as ações tomadas na etapa anterior. A realocação prioriza campanhas
que batem a meta de CPA/ROAS e estão limitadas por orçamento, e reduz verba de
campanhas abaixo da meta sem perspectiva de recuperação. O resultado fecha o
ciclo semanal com o plano de verba atualizado para os próximos 7 dias.

- **Input:** gasto acumulado vs verba do mês + relatório
- **Output:** ajustes de pacing e realocação de verba
