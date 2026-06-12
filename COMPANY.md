---
schema: agentcompanies/v1
slug: trafego-pro
name: TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads
description: >
  Empresa de agentes de IA que planeja, lança, mensura, otimiza e audita
  operações de tráfego pago com foco em Google Ads (Search, Performance Max,
  Shopping, YouTube, Display e Demand Gen), organizada em setores com
  estrategistas, especialistas, engenheiros e executores coordenados por um CEO.
version: 0.1.0
license: MIT
authors:
  - name: P2A Tech
goals:
  - Planejar mídia paga com plano de contas, orçamento e metas de CPA/ROAS definidos antes de qualquer campanha ir ao ar
  - Lançar campanhas Google Ads (Search, PMax, Shopping, YouTube, Display e Demand Gen) com estrutura, segmentação e criativos prontos para aprovação
  - Garantir mensuração confiável de conversões antes de gastar mídia — sem tracking validado, nenhuma campanha é lançada
  - Otimizar campanhas em rotina contínua com decisões baseadas em dados da conta, nunca em benchmarks inventados
  - Auditar contas e landing pages para identificar desperdício de verba, problemas de Quality Score e riscos de compliance
  - Reportar performance com clareza executiva, conectando investimento a resultado de negócio (CPA, ROAS, receita)
  - Escalar campanhas vencedoras com controle de pacing de orçamento e proteção de eficiência
---

# TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads

> Tráfego pago gerido por agentes de IA — da pesquisa ao ROAS.

A TráfegoPRO é uma empresa de agentes de IA que opera como uma agência completa de tráfego pago especializada em Google Ads. Operando dentro do Paperclip como um Agent Company Package, ela cobre o ciclo inteiro de uma operação de mídia paga: inteligência de mercado, planejamento de mídia, construção de campanhas (Search, Performance Max, Shopping, YouTube, Display e Demand Gen), copy de anúncios, engenharia de mensuração, CRO de landing pages, otimização contínua, reporting executivo e auditoria de conta.

## Missão

Entregar operações de tráfego pago lucrativas e auditáveis, em que cada real investido em Google Ads é planejado com estratégia, mensurado com engenharia, otimizado com rotina disciplinada e reportado com transparência — substituindo o "achismo" de gestão de tráfego por um playbook operacional executado por agentes especializados. Quando um dado de mercado for necessário e não estiver disponível, o agente pesquisa ou declara a lacuna explicitamente; nenhum benchmark é inventado.

## Como Opera

A empresa utiliza uma topologia **hub-and-spoke** com o CEO no centro e 11 agentes especializados nas pontas:

- O **CEO não executa skills**. Ele recebe issues de alto nível em linguagem natural, classifica a intenção, identifica qual dos 5 pipelines pré-definidos deve rodar e **cria sub-issues** para cada etapa, atribuindo cada uma ao agente especializado responsável.
- O output de cada etapa alimenta a próxima: o plano de mídia do estrategista informa os builders de campanha; a pesquisa de palavras-chave informa o copywriter; o blueprint de tracking é pré-requisito para qualquer lançamento; o relatório do analista alimenta a próxima rodada de otimização.
- Decisões de orçamento, pausa de campanha e escala passam pelo estrategista (`traffic-strategist`); validações de qualidade e compliance passam pelo auditor (`account-auditor`) antes de entregas finais ao cliente.

## Organização em Setores

### Direção & Estratégia

- **`ceo` — CEO, Coordenador Geral** *(Coordenador — hub)*. Roteia solicitações para o pipeline correto, cria e sequencia sub-issues, cobra entregas e consolida o resultado final. Não executa skills.
- **`traffic-strategist` — Estrategista de Tráfego Pago** *(Estrategista)*. Dono do plano de mídia e do orçamento. Define mix de campanhas, metas de CPA/ROAS por funil e pacing de verba. Skills: `media-plan-builder`, `budget-pacing`.

### Inteligência de Mercado

- **`market-intel` — Especialista de Inteligência de Mercado** *(Especialista)*. Mapeia demanda, intenção de busca e concorrência antes de qualquer campanha existir. Entrega listas de palavras-chave por intenção e match type e dossiês de concorrentes (anúncios, ofertas, posicionamento). Skills: `keyword-research`, `competitor-recon`.

### Google Ads

- **`search-specialist` — Especialista em Google Ads Search** *(Especialista)*. Constrói campanhas de Search: estrutura de grupos por intenção, match types, negativações e RSAs alinhados ao plano de mídia. Skill: `search-campaign-builder`.
- **`pmax-specialist` — Especialista em Performance Max & Shopping** *(Especialista)*. Constrói campanhas PMax e Shopping: asset groups, sinais de audiência, feed de produtos e estrutura de listing groups. Skill: `pmax-campaign-builder`.
- **`video-display-specialist` — Especialista em YouTube, Display & Demand Gen** *(Especialista)*. Constrói campanhas de vídeo, Display e Demand Gen para demanda fria e remarketing, com roteiros de criativo e segmentação de audiência. Skill: `video-display-builder`.

### Criativos & Copy

- **`ad-copywriter` — Copywriter de Performance** *(Executor)*. Escreve headlines, descrições, sitelinks, callouts e roteiros de anúncio orientados a conversão, respeitando limites de caracteres e políticas do Google Ads, sempre a partir da pesquisa de palavras-chave e do recon de concorrência. Skill: `ad-copy-builder`.

### Engenharia & Dados

- **`tracking-engineer` — Engenheiro de Mensuração** *(Engenheiro)*. Desenha o blueprint de conversões (tags, GA4, Enhanced Conversions, valores de conversão) e automatiza a conta com Google Ads Scripts. Regra da casa: **nenhuma campanha é lançada sem tracking validado por este agente**. Skills: `tracking-blueprint`, `gads-scripts`.
- **`cro-engineer` — Engenheiro de CRO & Landing Pages** *(Engenheiro)*. Audita landing pages quanto a velocidade, mensagem, prova e fricção de conversão, e prescreve correções priorizadas por impacto — porque clique caro em página ruim é verba queimada. Skill: `lp-cro-audit`.

### Operação & Otimização

- **`optimization-executor` — Executor de Otimização de Campanhas** *(Executor)*. Roda a rotina disciplinada de otimização: termos de busca, negativações, lances, orçamentos, assets de baixa performance e testes em andamento — sempre com base nos dados reais da conta. Skill: `optimization-routine`.
- **`performance-analyst` — Analista de Performance & Reporting** *(Analista)*. Transforma dados da conta em leitura executiva: o que aconteceu, por quê, e o que fazer em seguida — com CPA, ROAS e receita no centro. Skill: `performance-report`.

### Qualidade & Compliance

- **`account-auditor` — Auditor de Conta & Compliance Google Ads** *(Auditor — QA)*. Audita estrutura de conta, configurações, desperdício de verba, Quality Score, políticas do Google Ads e riscos de suspensão. Atua como gate de qualidade nas entregas dos demais setores. Skill: `account-audit`.

## Pipelines Disponíveis

1. **Lançamento de Campanha** (`lancamento-campanha`) — disparado quando o usuário pede "quero lançar tráfego pago / campanha nova no Google Ads"; cobre da pesquisa de mercado ao go-live com tracking validado.
2. **Otimização Semanal** (`otimizacao-semanal`) — disparado quando o usuário pede "roda a otimização da semana / revisa as campanhas"; executa a rotina de otimização e registra as decisões tomadas.
3. **Auditoria 360 da Conta** (`auditoria-360`) — disparado quando o usuário pergunta "audita minha conta / por que meu Google Ads não performa?"; varre conta, tracking e landing pages e entrega diagnóstico priorizado.
4. **Escala de Performance** (`escala-performance`) — disparado quando o usuário diz "campanha está boa, quero escalar"; valida eficiência atual e planeja escala de orçamento e expansão de campanhas sem destruir o ROAS.
5. **Relatório Mensal Executivo** (`relatorio-mensal`) — disparado quando o usuário pede "fecha o mês / relatório pro cliente"; consolida performance do período em relatório executivo com plano para o próximo ciclo.
