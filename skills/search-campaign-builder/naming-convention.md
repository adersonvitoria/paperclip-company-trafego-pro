# Naming Convention — Padrão Oficial TráfegoPRO

Nomenclatura padronizada para todas as entidades de Google Ads criadas pela TráfegoPRO. Objetivos: (1) qualquer agente ou humano entende a estrutura da conta lendo só os nomes; (2) relatórios e scripts filtram entidades por prefixo de forma confiável (`campaign.name LIKE '[SRC]%'`); (3) UTMs alimentam o GA4/CRM com dimensões consistentes. **Nomes fora do padrão reprovam o blueprint** (ver `blueprint-search.md` §11).

---

## 1. Tokens (vocabulário fechado)

Separador entre tokens: ` | ` (espaço-pipe-espaço). Dentro de um token: hífen (`-`). Sem acentos em tokens estruturais; nomes de produto podem manter grafia comercial.

### 1.1 `{CANAL}` — prefixo entre colchetes (sempre o 1º token)

| Token | Tipo de campanha |
|---|---|
| `[SRC]` | Search |
| `[SRC-BRD]` | Search de marca (Brand) |
| `[SRC-CMP]` | Search de concorrente |
| `[SRC-DSA]` | Dynamic Search Ads |
| `[PMX]` | Performance Max (skill `pmax-campaign-builder`) |
| `[VID]` | Vídeo / YouTube (skill `video-display-builder`) |
| `[DSP]` | Display (skill `video-display-builder`) |
| `[DEM]` | Demand Gen |

### 1.2 `{OBJETIVO}`

| Token | Significado |
|---|---|
| `LEAD` | Geração de leads (form) |
| `ECOM` | Venda e-commerce |
| `CALL` | Ligações |
| `AGND` | Agendamento |
| `TRAF` | Tráfego qualificado (exceção — exige aprovação do `traffic-strategist`) |

### 1.3 `{FUNIL}`

| Token | Estágio |
|---|---|
| `TOFU` | Topo — descoberta/educacional |
| `MOFU` | Meio — comparação/categoria |
| `BOFU` | Fundo — transacional |
| `BRD` | Navegacional (marca) |

### 1.4 `{GEO}`

`BR` país inteiro · `UF-SP` estado · `CID-SaoPaulo` cidade · `RAIO-15km-Campinas` raio · `MULTI` múltiplas regiões (detalhar no blueprint).

### 1.5 `{TEMA}` — livre, mas curto

Kebab-case, máx. 30 caracteres, descreve a linha de produto/serviço: `consorcio-imovel`, `clinica-estetica`, `erp-industria`.

### 1.6 `{LANCE}` — sufixo de estratégia de lances (atualizar a cada migração de fase)

| Token | Estratégia |
|---|---|
| `MCPC` | Manual CPC |
| `MAXCLK` | Maximize Clicks (com teto) |
| `MAXCV` | Maximize Conversions sem target |
| `TCPA{n}` | Target CPA (ex.: `TCPA80` = tCPA 80 na moeda da conta) |
| `TROAS{n}` | Target ROAS em % (ex.: `TROAS400`) |
| `TIS` | Target Impression Share |

---

## 2. Sintaxe por entidade

### 2.1 Campanha

```
{CANAL} | {OBJETIVO} | {FUNIL} | {GEO} | {TEMA} | {LANCE}
```

Exemplos:
- `[SRC] | LEAD | BOFU | CID-SaoPaulo | clinica-estetica | MAXCLK`
- `[SRC-BRD] | LEAD | BRD | BR | clinica-bellavita | TIS`
- `[SRC] | ECOM | MOFU | BR | suplementos-whey | TROAS400`
- `[SRC-CMP] | LEAD | BOFU | BR | clinica-estetica | TCPA120`
- `[SRC] | LEAD | BOFU | BR | erp-industria | MAXCV | TESTE-BROAD` → campanhas-teste recebem o sufixo extra `TESTE-{hipotese}`.

### 2.2 Ad group

```
{INTENCAO} | {MATCH}
```

- `{INTENCAO}`: kebab-case, espelha o tema do grupo: `harmonizacao-facial`, `preenchimento-labial-preco`.
- `{MATCH}`: `EXT` (exact), `PHR` (phrase), `BRD` (broad), `MIX` (exact+phrase no mesmo grupo), `DSA` (alvo dinâmico).

Exemplos: `harmonizacao-facial | PHR` · `preenchimento-labial-preco | EXT` · `mineracao-geral | BRD`.

### 2.3 Anúncio (RSA) — campo "nome do anúncio"

```
RSA{n}-{variante}-{AAAAMM}
```

Exemplos: `RSA1-prova-social-202606` · `RSA2-oferta-202606`. O `{variante}` nomeia o ângulo dominante para leitura rápida em testes A/B.

### 2.4 Listas de keywords negativas compartilhadas

```
[NEG] {Escopo}
```

`[NEG] Universal` · `[NEG] Marca` · `[NEG] Concorrentes` · `[NEG] Cross-campanha` · `[NEG] {tema-especifico}` (ex.: `[NEG] emprego-vagas`).

### 2.5 Budgets compartilhados e portfólios de lance

- Budget compartilhado: `[BDG] {OBJETIVO}-{TEMA}` → `[BDG] LEAD-clinica-estetica`
- Bid strategy de portfólio: `[BID] {LANCE}-{TEMA}` → `[BID] TCPA80-clinica-estetica`

### 2.6 Públicos e listas

`[AUD] RMK-{origem}-{janela}d` → `[AUD] RMK-visitantes-lp-30d` · `[AUD] CONV-leads-180d` (customer match).

### 2.7 Labels (rótulos)

MAIÚSCULAS, kebab onde necessário: `QS-BAIXO` · `TESTE-ATIVO` · `PAUSAR-POS-TESTE` · `SAZONAL-{evento}` · `NAO-MEXER` (entidade sob janela de aprendizado).

### 2.8 Conversões (nomes de ações de conversão)

```
{TIPO}-{detalhe}-{origem}
```

Exemplos: `LEAD-form-lp` · `LEAD-whatsapp-click` · `COMPRA-checkout-ga4` · `CALL-asset-gads`. Tipo em maiúsculas; só a primária da campanha sem sufixo `-sec`.

---

## 3. Regras de formação

1. **Ordem fixa dos tokens.** Nunca omitir token do meio — se não se aplica, usar o valor mais próximo (ex.: `MULTI` em GEO), nunca deixar vazio.
2. **Sem datas em nome de campanha** (campanhas são contínuas; datas vivem em labels `SAZONAL-*` e em nomes de anúncio). Exceção: campanhas sazonais de vida curta podem sufixar `| {AAAAMM}`.
3. **Sufixo `{LANCE}` é vivo:** ao migrar de fase (árvore do `blueprint-search.md` §3), renomear a campanha no mesmo dia. Renomear **não** reinicia aprendizado; trocar a estratégia sim — o nome deve sempre refletir a estratégia atual.
4. **Máximo de 90 caracteres** no nome final (margem de leitura no Editor e em relatórios).
5. **Um idioma:** tokens estruturais conforme tabelas (não traduzir); `{TEMA}`/`{INTENCAO}` em pt-BR sem acentos.
6. **Proibido:** emojis, espaços duplos, `_` como separador estrutural, nomes genéricos ("Campanha 1", "Ad group novo"), abreviações fora do vocabulário.

---

## 4. Mapa nome → relatório

A estrutura tokenizada permite ao `performance-analyst` (skill `performance-report`) quebrar performance por dimensão **sem depender de labels**:

| Pergunta do relatório | Como o nome responde |
|---|---|
| Performance por canal | split do token 1 (`[SRC]` vs `[PMX]` vs `[VID]`) |
| Marca vs não-marca | `[SRC-BRD]` vs demais `[SRC*]` |
| Performance por funil | token `{FUNIL}` |
| Performance por região | token `{GEO}` |
| Quais campanhas estão em cada fase de lance | sufixo `{LANCE}` |
| Quais grupos são exact vs phrase vs broad | sufixo do ad group (`EXT`/`PHR`/`BRD`) |

---

## 5. Governança

- **Quem nomeia:** o agente dono da skill que cria a entidade (`search-specialist` para Search, `pmax-specialist` para PMax, `video-display-specialist` para vídeo/display).
- **Quem audita:** o `account-auditor` (skill `account-audit`) inclui verificação de conformidade de nomenclatura em toda auditoria; o `optimization-executor` corrige desvios encontrados na rotina (skill `optimization-routine`).
- **Contas herdadas (Modo Reestruturação):** NÃO renomear tudo no dia 1 — renomear quebra referências mentais do cliente e filtros de relatórios antigos. Plano: (1) novas entidades já nascem no padrão; (2) entidades antigas recebem label `LEGADO`; (3) renomeação em lote só com aprovação do cliente, documentada.
- **Mudança no padrão:** qualquer alteração nesta convenção exige aprovação do `traffic-strategist` e atualização deste arquivo — nunca "exceção local".

---

## 6. Padrão de UTMs

Auto-tagging (GCLID) **sempre ativo**; UTMs convivem com ele para GA4/CRM/BI. Aplicar via **tracking template no nível da conta** (ou campanha quando precisar de override):

```
{lpurl}?utm_source=google&utm_medium=cpc&utm_campaign={_canal}-{_tema}&utm_term={keyword}&utm_content={creative}
```

Com custom parameters definidos na campanha:

| Custom parameter | Valor (espelha o nome da campanha) | Exemplo |
|---|---|---|
| `{_canal}` | token CANAL sem colchetes, minúsculo | `src`, `src-brd`, `pmx` |
| `{_tema}` | token TEMA | `clinica-estetica` |

Regras:
- `utm_source=google` e `utm_medium=cpc` são **fixos** para Google Ads — nunca variar (quebra agrupamento de canal no GA4).
- `{keyword}` e `{creative}` são ValueTrack — preenchidos pelo Google em runtime.
- Tudo minúsculo; sem acentos; sem espaços (UTM é case-sensitive no GA4).
- WhatsApp/telefone na LP: propagar UTMs para o link de clique (responsabilidade do `tracking-engineer`, skill `tracking-blueprint`).

---

## 7. Validação automática (regex)

Para revisão do blueprint e para uso em scripts (skill `gads-scripts`):

```javascript
// Campanha Search TráfegoPRO
var RE_CAMPANHA = /^\[(SRC|SRC-BRD|SRC-CMP|SRC-DSA|PMX|VID|DSP|DEM)\] \| (LEAD|ECOM|CALL|AGND|TRAF) \| (TOFU|MOFU|BOFU|BRD) \| (BR|UF-[A-Z]{2}|CID-[A-Za-z-]+|RAIO-\d+km-[A-Za-z-]+|MULTI) \| [a-z0-9-]{1,30} \| (MCPC|MAXCLK|MAXCV|TCPA\d+|TROAS\d+|TIS)( \| TESTE-[a-z0-9-]+| \| \d{6})?$/;

// Ad group
var RE_ADGROUP = /^[a-z0-9-]{1,40} \| (EXT|PHR|BRD|MIX|DSA)$/;

// Lista negativa compartilhada
var RE_NEG = /^\[NEG\] [A-Za-z][A-Za-z0-9 -]{1,30}$/;
```

Snippet de auditoria (rodar em Preview; apenas reporta, não renomeia):

```javascript
function auditarNomenclatura() {
  var fora = [];
  var it = AdsApp.campaigns().withCondition('Status IN [ENABLED, PAUSED]').get();
  while (it.hasNext()) {
    var c = it.next();
    if (!RE_CAMPANHA.test(c.getName())) fora.push(c.getName());
  }
  Logger.log(fora.length + ' campanhas fora do padrão:\n' + fora.join('\n'));
}
```

---

## 8. Exemplo completo (conta de clínica de estética, Modo Conta Nova)

```
[SRC-BRD] | LEAD | BRD  | CID-SaoPaulo | clinica-bellavita  | TIS
[SRC]     | LEAD | BOFU | CID-SaoPaulo | clinica-estetica   | MAXCLK
  ├─ harmonizacao-facial | PHR
  │    ├─ RSA1-prova-social-202606
  │    └─ RSA2-oferta-202606
  ├─ harmonizacao-facial-preco | EXT
  ├─ preenchimento-labial | PHR
  └─ botox-aplicacao | PHR

Listas: [NEG] Universal · [NEG] Marca · [NEG] Concorrentes
Budget: [BDG] LEAD-clinica-estetica
Conversões: LEAD-form-lp (primária) · LEAD-whatsapp-click · CALL-asset-gads
Labels em uso: TESTE-ATIVO · NAO-MEXER
```

Após migrar a campanha core para a Fase 3 (árvore `blueprint-search.md` §3), o nome vira:
`[SRC] | LEAD | BOFU | CID-SaoPaulo | clinica-estetica | TCPA90` — renomeada no mesmo dia da troca de estratégia.
