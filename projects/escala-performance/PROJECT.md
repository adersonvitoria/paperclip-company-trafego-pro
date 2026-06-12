---
name: Escala de Performance
slug: escala-performance
owner: ceo
description: >
  Pipeline de escala segura para campanhas Google Ads que já performam — da
  prova de estabilidade ao monitoramento automatizado, com aumento gradual
  de orçamento sem resetar o aprendizado dos algoritmos.
---

# Escala de Performance

Pipeline de escala de campanhas vencedoras. O CEO coordena 6 etapas sequenciais:
primeiro o Analista de Performance prova com 30 dias de dados que a campanha está
estável (escalar campanha instável só amplifica desperdício); depois o Estrategista
de Tráfego desenha o plano de escala (verba alvo, novos públicos/canais, riscos) e
o cronograma de aumento gradual de orçamento que respeita as fases de aprendizado
do Smart Bidding; se o plano indicar expansão horizontal, os especialistas de canal
constroem as campanhas novas (Search, PMax, vídeo/display); o Engenheiro de
Mensuração recalibra scripts de monitoramento e alerta para os novos limiares de
gasto e CPA; por fim, o Auditor de Conta executa o **gate obrigatório de auditoria**
antes de qualquer ativação de campanha nova ou incremento acima do limiar aprovado.
Nenhum número de benchmark é inventado — onde um dado de mercado for necessário,
o agente pesquisa ou declara a lacuna explicitamente.

**Trigger:** "Campanha está boa, quero escalar"
**Tempo estimado:** 30-50 min

---

## Etapas

### 1. `performance-report` — Performance Analyst (Analista de Performance & Reporting)

Prova de estabilidade antes de qualquer aumento de verba. O analista roda o
relatório em modo consolidado sobre uma janela de 30 dias e responde à pergunta
que define se o pipeline continua: a performance é estável ou foi sorte de
curto prazo? Avalia CPA/ROAS por campanha, variância semana a semana, volume de
conversões suficiente para o Smart Bidding operar fora da fase de aprendizado e
sinais de saturação (frequência, impression share perdido por orçamento vs. por
rank). Se a campanha não demonstrar estabilidade, o relatório recomenda
explicitamente NÃO escalar ainda e aponta o que estabilizar primeiro.

- **Input:** dados de 30 dias (modo consolidado)
- **Output:** prova de estabilidade: CPA/ROAS por campanha

### 2. `media-plan-builder` — Traffic Strategist (Estrategista de Tráfego Pago)

Desenho do plano de escala a partir do relatório consolidado. O estrategista
roda a skill em modo escala e decide o caminho de crescimento: escala vertical
(mais verba nas campanhas vencedoras), horizontal (novos públicos, novas
keywords, novos canais — Search → PMax, Video/Display para demanda nova) ou
ambas. Define verba alvo e o racional por campanha, mapeia onde o CPA tende a
subir com o volume (curva de retornos decrescentes) e lista riscos com
mitigação: canibalização entre campanhas, saturação de público, dependência de
um único termo/criativo. Benchmarks de mercado, quando necessários, são
pesquisados ou marcados como lacuna — nunca inventados.

- **Input:** relatório consolidado (modo escala)
- **Output:** plano de escala: verba alvo, novos públicos/canais, riscos

### 3. `budget-pacing` — Traffic Strategist (Estrategista de Tráfego Pago)

Tradução do plano de escala em cronograma de aumento gradual de orçamento. O
estrategista define incrementos percentuais por período e a cadência entre
aumentos, respeitando a regra de ouro: aumentos bruscos de orçamento ou de meta
de CPA/ROAS podem devolver a campanha à fase de aprendizado do Smart Bidding e
destruir a performance que justificou a escala. O cronograma especifica o
degrau de cada semana, os critérios de avanço (CPA/ROAS dentro da faixa
tolerada antes do próximo aumento), os critérios de pausa/rollback se a
performance degradar, e o pacing de verba mensal para não estourar o budget
aprovado antes do fim do ciclo.

- **Input:** plano de escala
- **Output:** cronograma de aumento gradual de orçamento sem resetar aprendizado

### 4. Builders de campanha (condicional, conforme o plano de escala)

Etapa condicional, executada apenas se o plano de escala indicar expansão
horizontal com campanhas novas. O CEO cria uma sub-issue **paralela** por canal
aprovado no plano: `search-campaign-builder` → search-specialist (Especialista
em Rede de Pesquisa), `pmax-campaign-builder` → pmax-specialist (Especialista
em Performance Max) e/ou `video-display-builder` → video-display-specialist
(Especialista em Vídeo & Display). Cada builder recebe o plano de escala e o
cronograma de pacing como insumo e entrega o blueprint da campanha nova pronto
para implementação — nenhuma campanha é ativada nesta etapa: a ativação só
acontece após o gate de auditoria (etapa 6).

- **Input:** plano de escala + cronograma de pacing (canais aprovados no plano)
- **Output:** blueprints das campanhas novas por canal, prontos para o gate

### 5. `gads-scripts` — Tracking Engineer (Engenheiro de Mensuração)

Recalibragem do monitoramento automatizado para a nova realidade de gasto. Com
mais verba em jogo, anomalias custam mais caro e mais rápido — os limiares
antigos de alerta ficam obsoletos. O engenheiro gera/atualiza Google Ads
Scripts de monitoramento com os novos limiares de gasto diário e CPA do plano
de escala: alerta de gasto acima do degrau vigente do cronograma, alerta de CPA
fora da faixa de tolerância, detecção de queda brusca de conversões (possível
quebra de tracking sob volume novo) e verificação de pacing contra o budget
mensal. Cada script sai com instruções de instalação e frequência de execução.

- **Input:** novos limiares de gasto/CPA do plano de escala
- **Output:** scripts de monitoramento e alerta calibrados para a escala

### 6. **GATE:** `account-audit` — account-auditor (Auditor de Conta & Compliance Google Ads)

Gate de qualidade **obrigatório** antes de ativar qualquer campanha nova ou
liberar incremento de orçamento acima do limiar aprovado — invariante da
TráfegoPRO (QA antes do cliente). O auditor verifica as campanhas construídas
na etapa 4 (estrutura, configurações, negativações, localização/idioma, budget
divergente do plano), confirma que o tracking suporta o novo volume e que o
cronograma de pacing não viola o teto de orçamento do usuário. Se a auditoria
apontar bloqueadores, o CEO cria sub-issues de correção para o agente dono do
problema e **repete o gate** após a correção. Ativação e incrementos só são
liberados com o gate aprovado (e com o approval gate humano de gasto, quando
configurado).

- **Input:** blueprints das campanhas novas + cronograma de pacing + scripts de monitoramento
- **Output:** aprovação do gate (ou lista de bloqueadores com owners de correção)
