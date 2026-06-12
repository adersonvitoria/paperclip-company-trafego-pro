---
name: Lançamento de Campanha
slug: lancamento-campanha
owner: ceo
description: >
  Pipeline completo de lançamento de campanha no Google Ads — da pesquisa de
  keywords e concorrência ao blueprint publicável, passando por plano de mídia,
  mensuração, CRO da landing page, copies RSA e auditoria final de qualidade.
---

# Lançamento de Campanha

Pipeline de lançamento de uma campanha nova de tráfego pago no Google Ads, do zero
ao blueprint pronto para publicar. O CEO coordena 8 etapas sequenciais: primeiro a
inteligência de mercado (keywords + concorrência), depois a estratégia (plano de
mídia), a fundação técnica (mensuração e CRO da landing page), a produção criativa
(copies RSA), a construção das campanhas e, por fim, um gate de auditoria que só
libera o lançamento com veredito PASS. Nenhuma etapa cita benchmarks de mercado de
memória — quando um número de referência for necessário, o agente pesquisa ou
declara a lacuna explicitamente.

**Trigger:** "Quero lançar tráfego pago / campanha nova no Google Ads"
**Tempo estimado:** 45-90 min

---

## Etapas

### 1. `keyword-research` — market-intel (Especialista de Inteligência de Mercado)

Pesquisa de keywords que fundamenta todo o pipeline. O agente mapeia o universo de
buscas do nicho, agrupa termos por intenção (transacional, comercial-investigativa,
informacional, branded e competitor) e já separa as negativas óbvias para evitar
desperdício de verba desde o primeiro dia. Volumes e CPCs estimados devem vir de
pesquisa — nunca de memória; onde não houver dado confiável, a lacuna é declarada
no próprio keyword map.

- **Input:** nicho/produto, site, geografia, objetivo
- **Output:** keyword map agrupado por intenção + negativas iniciais

### 2. `competitor-recon` — market-intel (Especialista de Inteligência de Mercado)

Reconhecimento de concorrência sobre as keywords principais do passo anterior. O
agente levanta quem anuncia nos termos transacionais, quais ângulos de copy e
ofertas dominam o leilão, como são as landing pages dos concorrentes e onde estão
as lacunas de posicionamento que a campanha pode explorar (ângulos não usados,
objeções não respondidas, ofertas mais fracas).

- **Input:** keywords principais do passo anterior
- **Output:** dossiê de concorrência com lacunas de posicionamento

### 3. `media-plan-builder` — traffic-strategist (Estrategista de Tráfego Pago)

Tradução da inteligência de mercado em estratégia de investimento. O agente define
o mix de campanhas (Search, PMax, Video/Display conforme o caso), a alocação de
verba por campanha e fase (aprendizado vs. escala), a estratégia de lances inicial
e as metas de CPA/ROAS — derivadas da economia do negócio do cliente (ticket,
margem, taxa de conversão conhecida), nunca de benchmarks genéricos inventados. O
plano também define quais campanhas entram no ar primeiro e quais aguardam dados.

- **Input:** objetivo de negócio + verba + outputs anteriores
- **Output:** plano de mídia com mix de campanhas e metas de CPA/ROAS

### 4. `tracking-blueprint` — tracking-engineer (Engenheiro de Mensuração)

Fundação de mensuração antes de qualquer real investido. O agente especifica os
eventos de conversão exigidos pelo plano de mídia (primárias e secundárias), o
mapeamento GTM → GA4 → Google Ads (tags, triggers, variáveis, conversion actions,
Enhanced Conversions e Consent Mode quando aplicável) e o plano de validação
(Preview do GTM, DebugView do GA4, diagnóstico de conversões do Ads). Sem
mensuração confiável, lances inteligentes otimizam para o alvo errado — esta etapa
é pré-requisito obrigatório do lançamento.

- **Input:** site/LP + eventos de conversão do plano
- **Output:** plano de mensuração GTM/GA4/Google Ads pronto para implantar

### 5. `lp-cro-audit` — cro-engineer (Engenheiro de CRO & Landing Pages)

Auditoria de conversão da landing page antes de receber tráfego. O agente avalia a
LP contra os ângulos definidos no plano (message match anúncio→página), clareza da
oferta, prova social, fricção do formulário/checkout, velocidade e experiência
mobile, e coerência com as políticas do Google Ads que afetam Quality Score e
aprovação. O resultado separa correções obrigatórias pré-tráfego de melhorias
recomendadas pós-lançamento.

- **Input:** URL da LP + ângulos do plano
- **Output:** score da LP + correções obrigatórias pré-tráfego

### 6. `ad-copy-builder` — ad-copywriter (Copywriter de Performance)

Produção das copies de anúncio a partir de toda a inteligência acumulada. O agente
escreve RSAs completas — 15 headlines e 4 descriptions por grupo de anúncio —
cobrindo os ângulos de lacuna identificados no dossiê, com keywords do grupo nos
headlines (relevância/Quality Score), CTAs alinhados à oferta da LP e variações de
pinning quando a mensagem exigir ordem fixa. Inclui também sugestões de assets
(sitelinks, callouts, snippets estruturados) coerentes com o plano.

- **Input:** keyword map + dossiê + plano de mídia
- **Output:** RSAs completas (15H/4D) por grupo de anúncio

### 7. `search-campaign-builder` — search-specialist (Especialista em Google Ads Search)

Construção do blueprint da campanha de Search: estrutura de campanhas e grupos de
anúncio alinhada ao keyword map, match types por fase, listas de negativas
aplicadas, estratégia de lances inicial conforme o plano, segmentação geográfica e
de programação, e as RSAs do passo anterior atribuídas a cada grupo — tudo no nível
de detalhe necessário para publicar sem decisões pendentes.

> **Nota de orquestração:** conforme o mix do plano de mídia, o CEO também aciona
> `pmax-campaign-builder` (pmax-specialist) e/ou `video-display-builder`
> (video-display-specialist) em paralelo nesta etapa, para que todos os blueprints
> cheguem juntos à auditoria final.

- **Input:** plano de mídia + keyword map + copies
- **Output:** blueprint Search pronto para publicar

### 8. `account-audit` — account-auditor (Auditor de Conta & Compliance Google Ads)

**GATE DE QUALIDADE.** Auditoria final e independente de tudo o que foi produzido:
coerência entre blueprints e plano de mídia, cobertura de negativas, conformidade
com políticas do Google Ads (claims, setores restritos, destino da LP), integridade
do plano de mensuração (conversões primárias corretas, sem dupla contagem) e
ausência de decisões pendentes. O pipeline **só avança/conclui com veredito PASS**
do auditor; em caso de FAIL, a lista de bloqueios volta para os agentes
responsáveis corrigirem e a auditoria é refeita — nada vai ao ar reprovado.

- **Input:** todos os blueprints + plano de mensuração
- **Output:** veredito PASS/FAIL + lista de bloqueios
