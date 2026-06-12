# TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads

> **Agent Company Package** para [Paperclip](https://github.com/paperclipai/paperclip) — schema `agentcompanies/v1`

Tráfego pago gerido por agentes de IA — da pesquisa ao ROAS. Este pacote define uma agência completa de tráfego pago especializada em Google Ads (Search, Performance Max, Shopping, YouTube, Display e Demand Gen), com **12 agentes** organizados em **7 setores**, **14 skills** referenciadas e **5 pipelines** pré-definidos, prontos para importação no Paperclip.

É um pacote de **configuração pura** — não há código nem etapa de build. Os agentes nunca inventam benchmarks de mercado: quando um número externo seria necessário, pesquisam ou declaram a lacuna.

---

## Estrutura de Pastas

```
paperclip-company-trafego-pro/
├── COMPANY.md      # Manifesto da empresa (frontmatter agentcompanies/v1 + playbook)
├── agents/         # Definição de cada agente (um arquivo por agente)
├── projects/       # Projetos/pipelines pré-definidos
├── skills/         # Skills referenciadas pelos agentes
└── README.md       # Este arquivo
```

---

## Organograma

O CEO opera como coordenador **hub-and-spoke**: recebe solicitações em linguagem natural, identifica o pipeline correto e delega sub-issues aos especialistas. **Não executa skills** — apenas roteia, sequencia e consolida.

| Setor | Agente | Título | Papel | Skills |
|---|---|---|---|---|
| Direção & Estratégia | `ceo` | CEO — Coordenador Geral | Coordenador (hub) | — |
| Direção & Estratégia | `traffic-strategist` | Estrategista de Tráfego Pago | Estrategista | `media-plan-builder`, `budget-pacing` |
| Inteligência de Mercado | `market-intel` | Especialista de Inteligência de Mercado | Especialista | `keyword-research`, `competitor-recon` |
| Google Ads | `search-specialist` | Especialista em Google Ads Search | Especialista | `search-campaign-builder` |
| Google Ads | `pmax-specialist` | Especialista em Performance Max & Shopping | Especialista | `pmax-campaign-builder` |
| Google Ads | `video-display-specialist` | Especialista em YouTube, Display & Demand Gen | Especialista | `video-display-builder` |
| Criativos & Copy | `ad-copywriter` | Copywriter de Performance | Executor | `ad-copy-builder` |
| Engenharia & Dados | `tracking-engineer` | Engenheiro de Mensuração | Engenheiro | `tracking-blueprint`, `gads-scripts` |
| Engenharia & Dados | `cro-engineer` | Engenheiro de CRO & Landing Pages | Engenheiro | `lp-cro-audit` |
| Operação & Otimização | `optimization-executor` | Executor de Otimização de Campanhas | Executor | `optimization-routine` |
| Operação & Otimização | `performance-analyst` | Analista de Performance & Reporting | Analista | `performance-report` |
| Qualidade & Compliance | `account-auditor` | Auditor de Conta & Compliance Google Ads | Auditor (QA) | `account-audit` |

Regras operacionais fixas da casa:

- **Tracking antes de mídia** — nenhuma campanha vai ao ar sem mensuração validada pelo `tracking-engineer`.
- **Orçamento é do estrategista** — mudanças de verba, pausa e escala passam pelo `traffic-strategist`.
- **QA antes do cliente** — entregas finais passam pelo gate do `account-auditor`.

---

## Pipelines

| # | Pipeline | Slug | Trigger | O que entrega |
|---|---|---|---|---|
| 1 | **Lançamento de Campanha** | `lancamento-campanha` | "Quero lançar tráfego pago / campanha nova no Google Ads" | Pesquisa, plano de mídia, campanhas estruturadas, copy e tracking validado, prontos para go-live |
| 2 | **Otimização Semanal** | `otimizacao-semanal` | "Roda a otimização da semana / revisa as campanhas" | Rotina de otimização executada com registro das decisões (termos, negativações, lances, assets) |
| 3 | **Auditoria 360 da Conta** | `auditoria-360` | "Audita minha conta / por que meu Google Ads não performa?" | Diagnóstico priorizado de conta, tracking e landing pages, com plano de correção |
| 4 | **Escala de Performance** | `escala-performance` | "Campanha está boa, quero escalar" | Plano de escala de orçamento e expansão com proteção de CPA/ROAS |
| 5 | **Relatório Mensal Executivo** | `relatorio-mensal` | "Fecha o mês / relatório pro cliente" | Relatório executivo do período com leitura de resultado e plano do próximo ciclo |

Cada pipeline é orquestrado pelo CEO, que cria sub-issues na ordem correta e passa o contexto entre etapas automaticamente.

---

## Importação

Para importar este pacote no Paperclip:

```bash
paperclipai company import --from paperclip-company-trafego-pro/
```

Após a importação, a empresa estará disponível com todos os agentes, skills e projetos configurados.

---

## Links

- [Paperclip](https://github.com/paperclipai/paperclip)
- Spec de Agent Companies: `docs/companies/companies-spec.md` no repositório do Paperclip

---

## P2A Tech

Pacote criado e mantido pela **P2A Tech**.
