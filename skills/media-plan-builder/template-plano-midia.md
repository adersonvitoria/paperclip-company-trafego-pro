# Template — Plano de Mídia Google Ads (TráfegoPRO)

> Template preenchível usado pela skill `media-plan-builder`. O entregável final deve conter
> TODAS as 12 seções preenchidas com os dados do cliente — nenhuma pode permanecer com
> `{{placeholder}}`. Onde um benchmark de mercado for citado, incluir fonte + data da pesquisa
> (WebSearch) ou marcar explicitamente como `PREMISSA A VALIDAR`.

---

```markdown
# Plano de Mídia — {{cliente}} — {{AAAA-MM}}

**Modo:** {{lancamento | escala | correcao}}
**Elaborado por:** traffic-strategist (TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads)
**Status:** {{RASCUNHO | APROVADO PARA ATIVAÇÃO | BLOQUEADO — aguardando tracking-engineer}}
**Validade:** {{data}} a {{data}} (replanejar a cada ciclo de {{30|60|90}} dias)

---

## 1. Contexto do negócio

| Campo | Valor |
|---|---|
| Produto/serviço | {{...}} |
| Ticket médio | R$ {{...}} |
| Margem bruta | {{...}}% |
| LTV (se recorrente) | R$ {{...}} ou `não informado` |
| Ciclo de venda | {{compra imediata / lead → vendas em N dias}} |
| Geografia / idioma | {{...}} |
| Sazonalidade relevante | {{...}} ou `nenhuma identificada` |
| Insumos recebidos | {{outputs de keyword-research / competitor-recon / account-audit, com paths}} |

## 2. Objetivo e metas

- **Objetivo primário:** {{ex.: gerar vendas com CPA ≤ R$X | atingir ROAS ≥ Y}}
- **Derivação do teto:**
  - CPA_teto = ticket médio × margem bruta × {{fração da margem destinada a aquisição}} = **R$ {{...}}**
  - ou ROAS_minimo = 1 / (margem bruta × fração destinada) = **{{...}}**
- **Meta de volume:** {{N}} conversões/mês até {{marco}}
- **Banda aceita em escala:** CPA até +{{10–20}}% / ROAS até −{{10–20}}% durante degraus de verba

## 3. Premissas e benchmarks (com fonte ou lacuna declarada)

| Premissa | Valor usado | Origem |
|---|---|---|
| CVR da LP (BOFU Search) | {{...}}% | {{fonte+data | PREMISSA A VALIDAR nas semanas 1–2}} |
| CPC médio da vertical | R$ {{...}} | {{fonte+data | PREMISSA A VALIDAR}} |
| {{outras premissas usadas na projeção}} | | |

> Lacunas declaradas: {{listar benchmarks NÃO encontrados em pesquisa e como serão validados com dados reais}}

## 4. Arquitetura de funil

Resumo da aplicação do framework (`framework-funil.md`) a este cliente:

| Estágio | Liga quando | Campanhas | Papel |
|---|---|---|---|
| BOFU | {{dia 1 | condição}} | {{lista}} | {{...}} |
| MOFU | {{condição numérica, ex.: listas ≥ tamanho mínimo}} | {{lista}} | {{...}} |
| TOFU | {{condição numérica, ex.: BOFU com CPA ≤ teto por 2 semanas}} | {{lista}} | {{...}} |

## 5. Mix de campanhas (detalhe por campanha)

Repetir o bloco para CADA campanha proposta:

### {{nome da campanha conforme naming convention — ver seção 11}}
- **Tipo:** {{Search | PMax | Demand Gen | Video | Display}}
- **Estágio:** {{TOFU|MOFU|BOFU}} · **Dono da build:** {{search-specialist | pmax-specialist | video-display-specialist}}
- **Segmentação:** {{keywords e match types / públicos / feed}}
- **Estratégia de lance:** {{fase 1 → fase 2 → fase 3, conforme árvore do framework}}
- **Verba diária inicial:** R$ {{...}} ({{...}}% da verba do estágio)
- **Negativação:** {{listas compartilhadas aplicadas + cruzamentos de funil}}
- **Anúncios:** {{N}} RSAs por grupo (ad-copywriter via `ad-copy-builder`); criativos de vídeo/display: {{specs}}
- **LP de destino:** {{URL}} — {{auditada pelo cro-engenheiro? sim/não → se não, agendar `lp-cro-audit`}}
- **Critério de pausa:** gasto ≥ {{X}}× CPA_teto com 0 conversões em {{janela}}

## 6. Matriz de verba

Verba mensal de mídia: **R$ {{TOTAL}}** (a soma das linhas DEVE fechar exatamente neste valor)

| Estágio | Campanha | % | R$/mês | R$/dia |
|---|---|---|---|---|
| BOFU | {{...}} | {{...}}% | {{...}} | {{...}} |
| MOFU | {{...}} | {{...}}% | {{...}} | {{...}} |
| TOFU | {{...}} | {{...}}% | {{...}} | {{...}} |
| Reserva de teste | — | {{5–10}}% | {{...}} | {{...}} |
| **Total** | | **100%** | **R$ {{TOTAL}}** | |

Regras de pacing: desvio mensal tolerado ±{{10}}%; monitoramento via skill `budget-pacing` + script de pacing (skill `gads-scripts`).

## 7. Projeções — 3 cenários (fórmulas abertas)

Modelo: `Cliques = Verba / CPC` → `Conversões = Cliques × CVR` → `CPA = Verba / Conversões` → `ROAS = (Conversões × ticket) / Verba`

| Variável | Conservador | Realista | Otimista | Origem |
|---|---|---|---|---|
| CPC | {{...}} | {{...}} | {{...}} | {{fonte | premissa}} |
| CVR | {{...}} | {{...}} | {{...}} | {{fonte | premissa}} |
| Conversões/mês | {{calc}} | {{calc}} | {{calc}} | derivado |
| CPA | {{calc}} | {{calc}} | {{calc}} | derivado |
| ROAS | {{calc}} | {{calc}} | {{calc}} | derivado |

> Leitura: se nem o cenário otimista alcança CPA ≤ CPA_teto, o plano deve recomendar revisão de oferta/LP (cro-engineer) ANTES de mídia.

## 8. Critérios de sucesso e go/no-go

| Checkpoint | Data | Critério numérico | Decisão se falhar |
|---|---|---|---|
| Semana 2 | {{...}} | {{ex.: ≥N cliques, CTR ≥ x%, 1ª conversão registrada}} | {{ajuste específico}} |
| Semana 4 | {{...}} | {{ex.: CPA ≤ 1,5× teto}} | {{ex.: voltar exact-only / revisar LP}} |
| Semana 8 | {{...}} | {{ex.: CPA ≤ teto com ≥N conversões}} | {{ex.: replanejamento de modo}} |
| Critério de abandono | — | {{condição em que a tese é declarada invalidada}} | encerrar e reportar ao ceo |

## 9. Mensuração (gate de ativação)

Checklist da seção 6 do framework, item a item, com status `OK / PENDENTE / N-A` e responsável
(tracking-engineer via `tracking-blueprint`): conversões primárias, valores, Consent Mode v2,
Enhanced Conversions, auditoria de tag, atribuição, auto-tagging/UTM, listas de remarketing.
**Qualquer PENDENTE crítico ⇒ Status do plano = BLOQUEADO.**

## 10. Riscos e mitigação

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| {{ex.: CVR real abaixo da premissa}} | {{...}} | {{...}} | {{ex.: checkpoint semana 2 + lp-cro-audit}} |
| {{ex.: canibalização PMax × brand}} | {{...}} | {{...}} | brand exclusions + monitoramento de termos |
| {{...}} | | | |

## 11. Naming convention (obrigatória)

Padrão TráfegoPRO para campanhas:

`[{{SIGLA-CLIENTE}}] {{TIPO}} | {{ESTAGIO}} | {{TEMA}} | {{GEO}} | {{LANCE}}`

- TIPO: `SRC` (Search) · `PMX` (PMax) · `DGN` (Demand Gen) · `VID` (Video) · `DSP` (Display)
- ESTAGIO: `BOFU` / `MOFU` / `TOFU`
- LANCE: `MC` (Maximize Clicks) · `MCV` (Maximize Conversions) · `TCPA{{valor}}` · `TROAS{{valor}}`
- Exemplo: `[ACME] SRC | BOFU | categoria-frete | BR-SP | TCPA80`
- Grupos de anúncio: `{{tema}}--{{match}}` (ex.: `frete-expresso--exact`)
- UTM: `utm_source=google&utm_medium=cpc&utm_campaign={{nome-da-campanha-slugificado}}`

## 12. Handoff de execução

| Entrega | Agente | Skill | Prazo |
|---|---|---|---|
| Campanhas Search | search-specialist | `search-campaign-builder` | {{...}} |
| Campanhas PMax | pmax-specialist | `pmax-campaign-builder` | {{...}} |
| Video/Display/Demand Gen | video-display-specialist | `video-display-builder` | {{...}} |
| RSAs e criativos de copy | ad-copywriter | `ad-copy-builder` | {{...}} |
| Tracking (gate) | tracking-engineer | `tracking-blueprint` | ANTES da ativação |
| Scripts de vigilância | tracking-engineer | `gads-scripts` | dia 1 |
| Auditoria de LP | cro-engineer | `lp-cro-audit` | {{...}} |
| Rotina de otimização | optimization-executor | `optimization-routine` | a partir da ativação |
| Pacing de verba | optimization-executor | `budget-pacing` | a partir da ativação |
| Relatório de performance | performance-analyst | `performance-report` | semanal |
| Aprovação final do plano | ceo | — | {{...}} |
```

---

## Instruções de preenchimento (para o traffic-strategist — NÃO incluir no entregável)

1. **Seção 3 antes da 7:** nenhuma projeção sem a tabela de premissas preenchida. Cada número da
   seção 7 deve apontar para uma linha da seção 3.
2. **Matriz de verba (6):** conferir a soma com calculadora — erro de soma invalida o plano.
   A reserva de teste sai do total, não é extra.
3. **Modo correcao:** acrescentar à seção 4 a sequência de estancamento (semana 0) do framework,
   com a lista nominal de campanhas a pausar e o porquê de cada uma.
4. **Modo escala:** a seção 6 vira matriz em degraus — uma coluna por ciclo de escala
   (M0 atual → M1 → M2), cada degrau condicionado ao critério da seção 8.
5. **Critérios (8):** todo critério tem número, data e decisão-se-falhar. Reler antes de entregar:
   se alguma célula puder ser respondida com "depende", reescrever.
6. **Nunca prometer recurso de plataforma sem verificar** (ex.: disponibilidade de Demand Gen,
   requisitos de Customer Match, mínimos de Smart Bidding): pesquisar via WebSearch na data do
   plano e citar a fonte, ou marcar `A CONFIRMAR pelo specialist na build`.
