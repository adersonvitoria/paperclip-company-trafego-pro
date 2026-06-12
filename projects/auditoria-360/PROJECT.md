---
name: Auditoria 360 da Conta
slug: auditoria-360
owner: ceo
description: >
  Auditoria completa da conta Google Ads — estrutura, compliance, mensuração
  e landing pages — consolidada em plano de correção priorizado por impacto.
---

# Auditoria 360 da Conta

Pipeline de diagnóstico completo de uma conta Google Ads que não performa (ou que
está prestes a escalar e precisa de base sólida). O CEO coordena 4 etapas
sequenciais que cobrem os três pilares onde contas perdem dinheiro: estrutura e
compliance da conta, mensuração de conversões e taxa de conversão das landing
pages. O resultado final não é um relatório de problemas — é um plano de correção
priorizado por impacto, pronto para execução. Nenhum benchmark de mercado é
inventado durante a auditoria: quando um número de referência for necessário (CPC
médio do setor, CTR esperado, etc.), o agente responsável deve pesquisar a fonte
ou declarar explicitamente a lacuna.

**Trigger:** "Audita minha conta" / "Por que meu Google Ads não performa?"
**Tempo estimado:** 40-60 min

---

## Etapas

### 1. `account-audit` — account-auditor (Auditor de Conta & Compliance Google Ads)

Varredura completa da conta: arquitetura de campanhas (Search, PMax, Video/Display),
match types e termos de busca sem negativação, sobreposição entre campanhas,
Quality Score e relevância dos anúncios (incluindo RSAs com assets fracos),
configurações que drenam verba silenciosamente (Display expandido em Search,
locations "presence or interest", brand traffic contaminando PMax), estratégias
de lance incompatíveis com o volume de conversões, e riscos de compliance com as
políticas do Google Ads que podem suspender a conta. Cada achado é classificado
por severidade (bloqueio crítico / desperdício de verba / oportunidade) com
evidência da conta — nunca suposição.

- **Input:** acesso à conta + contexto do negócio
- **Output:** auditoria completa com bloqueios e desperdícios

### 2. `tracking-blueprint` — tracking-engineer (Engenheiro de Mensuração)

Executa em **modo verificação**: parte dos achados de tracking da etapa 1 e
verifica a fundo a camada de mensuração — quais ações de conversão existem, quais
estão como primária vs. secundária, duplicidade de contagem, conversões disparando
sem valor ou com valor errado, status do Enhanced Conversions e do consent mode,
janelas de atribuição e divergência entre Google Ads e a fonte de verdade (CRM/
plataforma). Se a conta otimiza lances em cima de dado de conversão quebrado, todo
o resto da auditoria fica condicionado a este conserto — o diagnóstico deixa isso
explícito. Sai com plano de correção técnico passo a passo (tags, GTM/gtag,
ações de conversão a recriar ou rebaixar).

- **Input:** achados de tracking da auditoria (modo verificacao)
- **Output:** diagnóstico de mensuração + plano de correção

### 3. `lp-cro-audit` — cro-engineer (Engenheiro de CRO & Landing Pages)

Auditoria das landing pages ativas das campanhas auditadas — porque metade dos
"problemas de Google Ads" morre depois do clique. Avalia coerência de mensagem
anúncio→página (message match com os RSAs reais da conta), velocidade e
experiência mobile, clareza da oferta e do CTA, fricção de formulário, prova
social e objeções não respondidas. Cada LP recebe um score e uma lista de
correções de conversão ordenadas por esforço vs. impacto, vinculadas às campanhas
que enviam tráfego para ela.

- **Input:** LPs ativas das campanhas auditadas
- **Output:** score + correções de conversão

### 4. `media-plan-builder` — traffic-strategist (Estrategista de Tráfego Pago)

Executa em **modo correção**: consolida todos os achados das etapas 1-3 em um
único plano de correção priorizado por impacto financeiro estimado — primeiro o
que estanca sangria (tracking quebrado, desperdício de verba, risco de
suspensão), depois o que destrava performance (estrutura, lances, Quality Score),
por fim o que escala (CRO, expansão de campanhas). Cada item traz responsável
sugerido, dependências entre correções (ex.: não trocar bidding antes de
consertar conversões) e ordem de execução em sprints. Onde o impacto depender de
benchmark de mercado, o plano cita a fonte pesquisada ou marca a estimativa como
lacuna a validar com dados da própria conta.

- **Input:** todos os achados (modo correcao)
- **Output:** plano de correção priorizado por impacto
