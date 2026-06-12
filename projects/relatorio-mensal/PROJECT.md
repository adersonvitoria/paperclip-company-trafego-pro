---
name: Relatório Mensal Executivo
slug: relatorio-mensal
owner: ceo
description: >
  Fechamento mensal da conta — relatório executivo com KPIs, tendências e
  alertas, seguido das recomendações estratégicas e do plano do próximo mês.
---

# Relatório Mensal Executivo

Pipeline de fechamento do mês. O CEO coordena 2 etapas sequenciais: primeiro a
consolidação analítica do mês fechado (resultados vs mês anterior vs meta), depois
a tradução desses números em decisão estratégica e plano de mídia para o próximo
ciclo. O entregável final é o pacote que vai para o cliente: relatório executivo +
plano do próximo mês com justificativa em dados. Nenhum número de benchmark de
mercado deve ser inventado — quando uma comparação externa for relevante e não
houver dado confiável, o relatório deve declarar a lacuna explicitamente.

**Trigger:** "Fecha o mês / relatório pro cliente"
**Tempo estimado:** 15-25 min

---

## Etapas

### 1. `performance-report` — Performance Analyst (Analista de Performance & Reporting)

Consolidação do mês fechado em modo mensal. O analista cruza o mês encerrado
contra o mês anterior e contra a meta acordada, cobrindo os KPIs centrais da
conta (investimento, conversões, CPA, ROAS, CTR, CPC, Impression Share,
Quality Score onde aplicável) por campanha e por tipo de campanha (Search, PMax,
vídeo/display). Além do "o quê", o relatório explica o "porquê": tendências de
3+ meses, sazonalidade, mudanças estruturais feitas no período e seus efeitos,
e alertas acionáveis (pacing de budget, queda de Impression Share por rank ou
budget, fadiga de criativo, anomalias de tracking). Comparações com benchmark
de mercado só entram se houver fonte verificável; caso contrário, a lacuna é
declarada no próprio relatório.

- **Input:** dados do mês fechado vs mês anterior vs meta (modo mensal)
- **Output:** relatório executivo completo com KPIs, tendências e alertas

### 2. `media-plan-builder` — Traffic Strategist (Estrategista de Tráfego Pago)

Tradução do relatório em estratégia para o próximo mês. O estrategista lê o
relatório da etapa anterior e escolhe o modo conforme o resultado: **modo
correcao** se o mês fechou abaixo da meta (diagnóstico das alavancas que
falharam — mix de campanhas, lances, segmentação, criativo, landing page — e
plano de recuperação priorizado por impacto), ou **modo escala** se a meta foi
batida com eficiência (onde há headroom: Impression Share perdido por budget,
expansão de keywords/audiências, novos tipos de campanha, teto de CPA/ROAS
para escalar sem degradar). A saída inclui realocação de budget por campanha,
metas do próximo mês justificadas pelos dados do relatório (nunca por
benchmarks inventados) e os testes/experimentos planejados para o ciclo.

- **Input:** relatório mensal (modo correcao ou escala, conforme resultado)
- **Output:** recomendações estratégicas e plano do próximo mês
