# Template — Keyword Map TráfegoPRO

Template preenchível usado pela skill `keyword-research` (agente **market-intel**). O arquivo final deve se chamar `keyword-map-<slug-do-cliente>.md`. Toda seção é obrigatória — se uma seção não se aplica, escrever explicitamente "N/A + motivo", nunca apagar.

---

## 0. Cabeçalho

```markdown
# Keyword Map — <Nome do Cliente>
- **Data:** <AAAA-MM-DD>
- **Responsável:** market-intel (TráfegoPRO)
- **Negócio / oferta:** <o que vende, ticket médio, margem se conhecida>
- **Região-alvo:** <cidade(s)/estado(s)/país> | **Idioma:** pt-BR
- **Site / LPs disponíveis:** <URLs>
- **Insumos usados:** [ ] competitor-recon (path: ___) [ ] relatório de termos de busca (path: ___) [ ] só pesquisa nova
- **Status do tracking:** [ ] conversões confirmadas pelo tracking-engineer [ ] pendente (bloqueia recomendação de Smart Bidding e de broad)
```

---

## 1. Seeds

| # | Seed | Origem (cliente / site / WebSearch / competitor-recon) | Categoria (produto / problema / categoria de mercado) |
|---|---|---|---|
| 1 | | | |
| 2 | | | |
| ... | | | |

Mínimo 5, máximo 15 seeds. Mais que isso = o negócio precisa de mais de um keyword map (uma oferta por map).

---

## 2. Universo expandido e classificado

Uma linha por keyword aprovada (termos descartados não entram aqui; armadilhas vão direto para §5).

| Keyword | Intenção (T/C/I/N) | Funil (TOFU/MOFU/BOFU) | Volume relativo (Alto/Médio/Baixo/Long-tail) | Flags | Campanha destino | Ad group destino |
|---|---|---|---|---|---|---|
| | | | | `[VALIDAR NO KEYWORD PLANNER]` / `[OBSERVAR TERMOS DE BUSCA 14 DIAS]` / — | | |

Regras de preenchimento:
- Intenção e flags vêm da árvore e da matriz de `framework-intencao.md`.
- **Nunca** preencher volume com número inventado — só a escala relativa + flag quando o número real for decisivo.

---

## 3. Estrutura de campanhas e naming convention

### Naming convention (obrigatória)

```
Campanha:  [Search] | <CLIENTE> | <FUNIL> | <TEMA> | <REGIÃO>
Ad group:  <INTENÇÃO> - <TEMA ESPECÍFICO>

Exemplos:
[Search] | ACME | BOFU | Conserto Ar-Condicionado | SP-Capital
[Search] | ACME | Brand | Marca Própria | BR
[Search] | ACME | Competitor | Concorrentes | BR
Ad group: Transacional - Conserto Split
Ad group: Transacional - Instalação Split
Ad group: Comercial - Melhor Empresa Climatização
```

Convenções fixas: prefixo `[Search]` (a TráfegoPRO usa `[PMax]`, `[Video]`, `[Display]` nas demais skills de build); separador ` | `; sem acentos no slug de exportação; uma campanha NUNCA mistura estágios de funil.

### Tabela de campanhas

| Campanha (nome completo) | Objetivo | Estratégia de lance inicial | Critério de migração de lance | Orçamento (preencher com traffic-strategist via media-plan-builder) | Prioridade de ativação (1 = primeiro) |
|---|---|---|---|---|---|
| | | ex.: Maximizar conversões | ex.: migrar p/ tCPA após ~30 conv/mês `[VALIDAR NA CONTA]` | `[DEFINIR NO MEDIA PLAN]` | |

### Detalhe por ad group (repetir o bloco para cada ad group)

```markdown
#### Ad group: <INTENÇÃO> - <TEMA>
- **Campanha:** <nome completo>
- **Intenção dominante:** Transacional / Comercial / Informacional / Navegacional
- **LP de destino:** <URL> — H1 ecoa a intenção? [ ] sim [ ] não → lacuna p/ cro-engineer (lp-cro-audit)
- **Termo-âncora do headline** (tem que caber literalmente num headline de RSA ≤ 30 caracteres): "<termo>"

| Keyword | Match type | Lance relativo (Alto/Médio/Baixo dentro da campanha) | Observação |
|---|---|---|---|
| [comprar split 12000] | Exact | Alto | já converteu no histórico |
| "comprar ar condicionado split" | Phrase | Médio | |

- **Cross-negativas deste grupo** (exact, espelhando os termos-âncora dos grupos irmãos):
  - [<termo do grupo irmão 1>]
  - [<termo do grupo irmão 2>]
```

Regra de coesão: 5–20 keywords por ad group, 1 intenção + 1 tema. Se passar de 20, dividir; se tiver menos de 5 e não for exact de alto valor, fundir.

---

## 4. Match types — resumo executivo da conta

| Match type | Quando este map recomenda | Quantidade de keywords |
|---|---|---|
| Exact | | |
| Phrase | | |
| Broad | Somente se as 4 travas do framework (§4) estiverem marcadas abaixo | |

Travas de broad (marcar só com evidência):
- [ ] Smart Bidding por conversão ativo com conversão primária validada pelo **tracking-engineer**
- [ ] ~30 conversões/mês na campanha `[VALIDAR NA CONTA]`
- [ ] Rotina semanal de termos de busca agendada (`optimization-routine`)
- [ ] 3 camadas de negativas aplicadas

---

## 5. Negativas iniciais

### 5.1 Lista compartilhada de conta — `NEG - Universais - <CLIENTE>`

| Negativa | Match type | Motivo |
|---|---|---|
| "grátis" | Phrase | sem oferta gratuita |
| "curso" | Phrase | não vende educação |
| "vaga" / "vagas" | Phrase | intenção de emprego (negativar singular E plural — close variants não se aplicam a negativas) |
| "como fazer" | Phrase | DIY informacional |
| "pdf" / "download" | Phrase | busca por material, não por serviço |
| | | |

### 5.2 Listas compartilhadas por campanha — `NEG - <TEMA> - <CLIENTE>`

| Lista | Aplicada em | Negativa | Match type | Motivo |
|---|---|---|---|---|
| | | | | |

### 5.3 Cross-negativas (nível ad group)
Já registradas em cada bloco do §3. Conferir aqui que TODO par de ad groups irmãos tem espelhamento mútuo: [ ] conferido.

### 5.4 Pipeline pós-go-live
A colheita contínua (termos de busca → negativas semanais, n-grams sem conversão via script JavaScript) é responsabilidade da `optimization-routine` (**optimization-executor**) com apoio da `gads-scripts`. Este map entrega apenas o estado inicial.

---

## 6. Campanha de concorrente (se aplicável)

| Concorrente | Termos (phrase) | Fonte (competitor-recon?) | Diferencial a explorar na copy (SEM citar a marca) | Risco/observação legal |
|---|---|---|---|---|
| | | | | |

Se não aplicável: `N/A — motivo: ___`.

---

## 7. Lacunas e pendências declaradas

| # | Lacuna | Quem resolve | Skill |
|---|---|---|---|
| 1 | ex.: volume real dos head terms | cliente/market-intel no Keyword Planner | keyword-research (modo expansão) |
| 2 | ex.: LP de comparação inexistente | cro-engineer | lp-cro-audit |
| 3 | ex.: conversões não validadas | tracking-engineer | tracking-blueprint |

**Proibido** entregar o map "limpo" escondendo lacunas — número de mercado desconhecido é declarado, nunca inventado.

---

## 8. Checklist de handoff

- [ ] Cabeçalho completo, insumos e status de tracking marcados
- [ ] Toda keyword do §2 tem campanha e ad group de destino
- [ ] Naming convention aplicada em 100% das campanhas/ad groups
- [ ] Cada ad group tem LP, termo-âncora de headline e cross-negativas
- [ ] Travas de broad verificadas (ou broad ausente)
- [ ] 3 camadas de negativas preenchidas como listas compartilhadas
- [ ] Nenhum volume/CPC/benchmark inventado; flags `[VALIDAR ...]` onde necessário
- [ ] §7 (lacunas) preenchido honestamente
- [ ] Próximos passos comunicados: **search-specialist** (`search-campaign-builder`), **ad-copywriter** (`ad-copy-builder`), **traffic-strategist** (`media-plan-builder`)

---

## 9. Exemplo preenchido (mínimo, para calibrar o nível)

> Cliente fictício: assistência técnica de ar-condicionado em São Paulo, ticket médio informado pelo cliente, sem conta ativa.

- Seed: "conserto de ar condicionado" (problema) →
- §2: `conserto de ar condicionado split` | T | BOFU | Alto `[VALIDAR NO KEYWORD PLANNER]` | — | `[Search] | FRIOTEC | BOFU | Conserto AC | SP-Capital` | `Transacional - Conserto Split`
- §2: `ar condicionado não gela` | C* | MOFU | Médio | `[OBSERVAR TERMOS DE BUSCA 14 DIAS]` | mesma campanha, ad group `Comercial - Problema Não Gela` (*sintoma de reparo: framework §3 permite tratar como quase-transacional — lance Médio, phrase)
- §2: `como limpar filtro de ar condicionado` | I | TOFU | — | — | **não ativa**: vai para `NEG - Universais` como "como limpar" (phrase)
- §5.1: "curso", "vaga", "manual", "pdf", "grátis", "como limpar", "como instalar sozinho" — todas phrase
- Cross-negativa: `Transacional - Conserto Split` negativa [instalação de ar condicionado split] (exact); `Transacional - Instalação Split` negativa [conserto de ar condicionado split] (exact)
- §7: lacuna 1 — volume real de "conserto de ar condicionado" vs "manutenção de ar condicionado" decide qual vira campanha própria → Keyword Planner.
