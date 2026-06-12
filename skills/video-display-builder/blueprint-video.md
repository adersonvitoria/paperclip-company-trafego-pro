# Blueprint de Vídeo & Display — Framework Operacional TráfegoPRO

Arquivo auxiliar da skill `video-display-builder`. Contém: árvore de decisão objetivo → formato, tabela de referência de formatos, naming convention, estratégia de lance por estágio, arquitetura de segmentação em camadas, receitas de custom segments, regras de placements e exclusões, escada de remarketing, gestão de frequência, video ad sequencing, especificidades de Demand Gen, checklist de assets de Responsive Display Ads, dependências de mensuração, script Google Ads de exclusão de placements e template preenchível do blueprint final.

> **Regra transversal:** nenhum número de mercado neste arquivo é benchmark. Onde aparecer `[VALIDAR NA CONTA]` ou `[VALIDAR NA DOCUMENTAÇÃO ATUAL DO GOOGLE]`, o agente deve buscar o dado real (histórico da conta, Keyword Planner/Reach Planner, documentação oficial via WebSearch com fonte e ano) ou declarar a lacuna.

---

## 1. Árvore de decisão: objetivo → formato

Percorrer de cima para baixo. O primeiro nó que casa com o objetivo declarado define o(s) formato(s) primário(s). Formatos secundários só entram se houver budget para leitura separada.

```
Objetivo declarado pelo cliente / sub-issue
│
├─ "Quero vendas/leads diretos atribuíveis ao vídeo" (direct response)
│   ├─ Tem vídeo (ou roteiro produzível) de 15–60s?
│   │   ├─ SIM → In-stream pulável com bidding por conversão (Maximize Conversions → tCPA)
│   │   │        + Demand Gen como segunda frente (multi-formato, lookalike)
│   │   └─ NÃO → Demand Gen só com imagens (asset group de imagem) enquanto
│   │            os roteiros desta skill viram vídeo; registrar criativo como gargalo
│   └─ Conversão exige consideração longa (B2B, ticket alto)?
│       └─ SIM → adicionar camada de remarketing de vídeo (escada da seção 8)
│                e in-feed para capturar intenção dentro do YouTube
│
├─ "Quero gerar demanda / encher o funil" (demand generation)
│   → Demand Gen (YouTube in-stream + in-feed + Shorts + Discover + Gmail)
│     com bidding por conversão; lookalike sobre Customer Match quando a lista existir
│   → In-feed dedicado se o nicho tem busca ativa dentro do YouTube (how-to, reviews)
│
├─ "Quero awareness / frequência / lançamento de marca"
│   → Bumper 6s (tCPM) para frequência barata
│   → In-stream não pulável 15s (tCPM) para mensagem completa garantida
│   → Sequência (seção 10) se a narrativa tiver etapas
│   ⚠ Nunca prometer CPA nesses formatos — objetivo é alcance/frequência;
│     conversão aqui é efeito colateral medido por EVC/view-through, não meta
│
├─ "Quero reimpactar quem já me conhece" (remarketing)
│   → Responsive Display Ads sobre listas de site/CRM (volume e onipresença barata)
│   → In-stream pulável curto (15–30s) sobre viewers e visitantes de página de oferta
│   → Demand Gen sobre Customer Match para reativação de base
│
└─ "Quero alcance incremental em mobile / público jovem"
    → Shorts (criativo nativo 9:16; dentro de Demand Gen ou campanha de vídeo
      com inventário Shorts) — nunca reaproveitar 16:9 cortado sem adaptação
```

**Conflitos comuns e como resolver (registrar a decisão no blueprint):**

| Pedido do cliente | Conflito | Resposta padrão |
|---|---|---|
| "Bumper pra gerar leads" | Bumper não tem clique como objetivo; 6s não constrói oferta | Bumper vira camada de frequência sobre quem já viu o in-stream; lead fica no in-stream pulável/Demand Gen |
| "Display pra público 100% frio com CPA igual ao Search" | Display frio sempre tem CPA maior que intenção declarada | Documentar expectativa de CPA mais alto na camada fria; começar display pelo remarketing |
| "Quero aparecer em todo o YouTube" | Alcance sem controle = inventário ruim e fadiga | Placements gerenciados + exclusões (seção 7) + frequency cap |
| "Um vídeo só pra tudo" | Mensagem única não serve frio e quente ao mesmo tempo | Mínimo 2 variações (frio/contexto vs. quente/oferta) — matriz do `roteiros-youtube.md` |

---

## 2. Tabela de referência de formatos

| Formato | Onde aparece | Duração | Cobrança | Bidding típico | Papel no funil | Exigência criativa crítica |
|---|---|---|---|---|---|---|
| **In-stream pulável (skippable)** | Antes/durante/depois de vídeos no YouTube e parceiros | 15s–3min (DR ideal: 30–60s) | CPV (view = 30s ou interação) ou por conversão | Maximize Conversions → tCPA quando houver volume `[VALIDAR NA CONTA]` | MOFU/BOFU — direct response | Hook resolve em 0–5s (antes do "Pular") |
| **In-stream não pulável** | Idem, sem botão de pular | Até 15s | tCPM | tCPM | TOFU — mensagem garantida | Mensagem completa em 15s; sem CTA de clique como meta |
| **Bumper** | Idem | 6s | tCPM | tCPM | TOFU/frequência | Uma ideia só; brand nos primeiros 2s |
| **In-feed (ex-Video Discovery)** | Resultados de busca do YouTube, home, "a seguir" | Livre (vídeo do canal) | Por clique no thumbnail (CPV) | CPV máx / Maximize Conversions em Demand Gen | MOFU — intenção dentro do YouTube | Thumbnail + título fazem o papel do hook |
| **Shorts** | Feed vertical de Shorts | Até 60s (ideal ≤ 35s) | Conforme campanha (vídeo/Demand Gen) | Conforme campanha | TOFU/MOFU — alcance incremental | 9:16 nativo, legenda embutida, ritmo de corte alto |
| **Responsive Display Ads (RDA)** | Rede de Display (sites, apps, Gmail) | n/a (estático/HTML5 auto-montado) | CPC ou CPM otimizado | tCPA / Maximize Conversions (remarketing primeiro) | BOFU remarketing; MOFU prospecção visual | Conjunto completo de assets (seção 12) |
| **Demand Gen** | YouTube (in-stream, in-feed, Shorts) + Discover + Gmail | Vídeo e/ou imagem | Por conversão/clique | Maximize Conversions / tCPA / Maximize Clicks (tROAS onde disponível `[VALIDAR NA DOCUMENTAÇÃO ATUAL DO GOOGLE]`) | MOFU — geração de demanda | Criativos visuais fortes em 16:9, 1:1 e 9:16; suporta lookalike |

Specs de arquivo, proporções aceitas e limites de texto mudam com frequência — antes de fechar o blueprint, **validar as specs vigentes via WebSearch na documentação oficial do Google Ads** e citar a fonte com ano.

---

## 3. Naming convention (obrigatória em todo blueprint)

### Campanha
```
[CLIENTE]_[REDE]_[TIPO]_[OBJETIVO]_[ESTAGIO]_[GEO]_[AAAA-MM]
```
- `REDE`: YT | GDN | DGEN
- `TIPO`: INSTREAM | NONSKIP | BUMPER | INFEED | SHORTS | RDA | MIX
- `OBJETIVO`: DR (direct response) | DEMAND | AWARE | RMKT
- `ESTAGIO`: TOFU | MOFU | BOFU
- `GEO`: BR | SP | RJ | etc.

Exemplos:
- `ACME_YT_INSTREAM_DR_BOFU_BR_2026-06`
- `ACME_DGEN_MIX_DEMAND_MOFU_BR_2026-06`
- `ACME_GDN_RDA_RMKT_BOFU_BR_2026-06`

### Ad group / asset group
```
AG_[CAMADA]_[DETALHE]
```
- `CAMADA`: RMKT7 | RMKT30 | RMKT90 | CMATCH | LOOKALIKE | CUSTOM-INTENT | INMARKET | AFINIDADE | TOPICO | PLACEMENT
- `DETALHE`: tema ou fonte da lista (ex: `AG_RMKT7_PAG-OFERTA`, `AG_CUSTOM-INTENT_TERMOS-CONCORRENTE`)

### Criativo (nome do asset/vídeo)
```
[CLIENTE]_[DURACAO]_[PROPORCAO]_[ANGULO]_[VERSAO]
```
Ex: `ACME_30S_16x9_DOR-PRINCIPAL_V1`, `ACME_6S_9x16_PROVA_V2`.

A convenção permite que `performance-analyst` e `optimization-executor` filtrem relatórios por substring sem depender de labels.

---

## 4. Estratégia de lance por estágio

| Estágio | Formato típico | Lance inicial | Quando migrar | Trava |
|---|---|---|---|---|
| TOFU awareness | Bumper / não pulável | tCPM | Não migra — tCPM é terminal para awareness | Frequency cap definido antes de ativar (seção 9) |
| TOFU/MOFU prospecção vídeo | In-stream pulável | CPV máx (fase de aprendizado de criativo) ou Maximize Conversions sem alvo | Para tCPA quando a campanha acumular volume de conversões estável `[VALIDAR NA CONTA — usar a recomendação vigente do Google como referência, com fonte]` | Nunca fixar tCPA agressivo no dia 1 — sufoca entrega |
| MOFU Demand Gen | Demand Gen | Maximize Conversions sem alvo (2–4 semanas de aprendizado, ajustar ao ciclo de conversão real) | tCPA quando o CPA observado estabilizar perto da meta | Mudanças de lance ≤ 1x/semana; alterações grandes resetam aprendizado |
| BOFU remarketing | RDA / in-stream curto | tCPA direto (público quente converte; histórico da conta orienta o alvo) | tROAS se o valor de conversão estiver implementado e validado pelo `tracking-engineer` | Exclusão de convertidos ativa antes do primeiro real gasto |

**Regras de mudança de lance (valem para `optimization-executor` na rotina):**
1. Uma variável por vez (lance OU público OU criativo — nunca os três juntos).
2. Janela mínima de leitura = ciclo de conversão completo + atraso de conversão observado na conta.
3. Ajustes de tCPA/tROAS em passos de no máximo ±15–20% por vez; saltos maiores derrubam entrega.
4. Registrar cada mudança com data no blueprint/issue para o `performance-analyst` correlacionar.

---

## 5. Arquitetura de segmentação em camadas

Princípio: **uma camada por ad group/asset group**, ordenadas da mais quente para a mais fria. Cada camada tem expectativa de CPA própria documentada (qualitativa: a camada N+1 sempre tem CPA esperado maior que a N — números só com histórico da conta).

| # | Camada | Fonte | Uso típico | Observações |
|---|---|---|---|---|
| 1 | Remarketing de site | Listas por profundidade: todos visitantes / página de oferta / carrinho-checkout abandonado | RDA + in-stream curto BOFU | Janelas da seção 8; exclusão de convertidos sempre |
| 2 | Viewers de vídeo / engajados no canal | Quem assistiu X vídeo, inscritos, visitou canal | Sequencing e degrau 2 da escada | Listas de vídeo exigem canal vinculado ao Google Ads — checar vínculo |
| 3 | Customer Match | Upload de e-mails/telefones de clientes e leads (hash) | Reativação, exclusão de clientes em prospecção, semente de lookalike | Exige conformidade LGPD: base própria com consentimento — apontar `tracking-engineer` se houver dúvida |
| 4 | Lookalike (Demand Gen) | Semente = Customer Match ou lista de convertidos | Prospecção "morna" em Demand Gen | Disponibilidade e tamanhos de segmento `[VALIDAR NA DOCUMENTAÇÃO ATUAL DO GOOGLE]` |
| 5 | Custom segments — intenção | Termos que o público pesquisa no Google + URLs visitadas (incl. concorrentes) | Melhor camada fria para DR | Receita na seção 6 |
| 6 | In-market | Segmentos prontos do Google da vertical | Prospecção fria escalável | Validar se existe segmento da vertical; senão, custom segment |
| 7 | Afinidade + demografia detalhada | Interesses amplos + dados demográficos | Awareness apenas | Nunca carregar meta de CPA de BOFU |
| 8 | Tópicos | Controle temático de contexto (Display/YouTube) | Complemento contextual | Pode combinar com camada de público em observação |
| 9 | Placements gerenciados | Canais/vídeos/sites escolhidos a dedo | Controle máximo de contexto | Seção 7 |

**Combinação segmentação × observação:** nas camadas frias, adicionar as listas quentes em modo **observação** (sem restringir) para ler lift — mas a exclusão das listas quentes como *targeting* nas campanhas frias é obrigatória para não pagar prospecção por quem já é remarketing.

**Expansão de público / otimização de segmentação (decisão obrigatória por campanha):**

| Cenário | Recomendação default | Justificativa a registrar |
|---|---|---|
| Remarketing BOFU | **Desativada** | Expansão dilui a lista quente e contamina o CPA da camada |
| Custom intent DR | Desativada no início; testar ativação só após CPA estável | Preservar leitura limpa da hipótese de público |
| Demand Gen / campanhas com tCPA maduro | Pode ficar ativa | O sistema tem sinal suficiente; monitorar % de gasto fora do público-alvo `[VALIDAR NA CONTA]` |
| Awareness | Indiferente — controle por placement/tópico importa mais | — |

---

## 6. Receita de custom segments

### Custom segment de intenção (pesquisa no Google)
1. Partir do keyword map do `keyword-research` (se existir): usar **apenas termos transacionais e comerciais** — termos informacionais criam segmento frio demais.
2. 15–50 termos por segmento; um tema por segmento (mesma regra de coesão dos ad groups).
3. Nomear: `CS-INTENT_[TEMA]_[AAAA-MM]`.

### Custom segment de URLs (concorrentes e nicho)
1. Importar URLs do `competitor-recon` (concorrentes diretos + portais do nicho + ferramentas que o ICP usa).
2. 10–25 URLs; misturar concorrente com portal genérico dilui o sinal — separar em segmentos distintos (`CS-URL_CONCORRENTES`, `CS-URL_PORTAIS-NICHO`).
3. Lembrete: o Google usa as URLs como *modelo de interesse*, não como placement — quem precisa de contexto literal usa placements gerenciados (seção 7).

### Custom segment de apps
- Apps que o ICP usa (ex: apps de gestão para PMEs). Mesmo princípio: 1 tema por segmento.

---

## 7. Placements gerenciados e listas de exclusão

### Placements gerenciados (inclusão)
- Levantar canais/vídeos candidatos via WebSearch (canais do nicho com audiência compatível) e validar volume no Reach Planner `[VALIDAR NA CONTA]`.
- Estrutura: `AG_PLACEMENT_[TEMA]` com 10–50 placements; menos que isso limita entrega, mais que isso vira broad disfarçado.
- Expectativa documentada: placements gerenciados têm CPM maior em troca de contexto garantido.

### Lista de exclusões — obrigatória em TODA campanha de Display/vídeo

**Exclusões de conteúdo (configuração de adequação de conteúdo / content suitability):**
- [ ] Conteúdo infantil ("made for kids") — público errado e restrições de personalização
- [ ] Conteúdo sensível: tragédias, conflitos, conteúdo chocante, temas sociais delicados (conforme inventário/modos de exclusão vigentes `[VALIDAR NA DOCUMENTAÇÃO ATUAL DO GOOGLE]`)
- [ ] Vídeos ao vivo e conteúdo não rotulado, quando o cliente exigir brand safety estrita
- [ ] Idiomas fora do alvo (configurar idioma da campanha + excluir placements de outros idiomas que vazarem)

**Exclusões de inventário:**
- [ ] Categorias de app móvel de baixa qualidade (jogos casuais costumam gerar cliques acidentais em Display) — excluir via exclusão de placements/categorias conforme mecanismo vigente da plataforma
- [ ] Lista compartilhada de placements ruins da conta (alimentada pelo script da seção 14 e pela rotina do `optimization-executor`)
- [ ] Sites de conteúdo gerado por usuário sem moderação, quando brand safety exigir

**Exclusões de público (em toda campanha de prospecção):**
- [ ] Convertidos (janela = ciclo de recompra; se não há recompra, 180+ dias)
- [ ] Listas quentes (remarketing/Customer Match) — quem é quente é tratado na campanha quente
- [ ] Funcionários/IPs internos quando aplicável (coordenar com `tracking-engineer`)

---

## 8. Escada de remarketing (template preenchível)

Cada degrau = uma lista + uma mensagem + um formato + um cap. Mensagem distinta por degrau é obrigatória — repetir o mesmo criativo na escada inteira é queimar audiência.

| Degrau | Lista (janela) | Temperatura | Mensagem (ângulo) | Formato | Cap sugerido* |
|---|---|---|---|---|---|
| 1 | Carrinho/checkout abandonado (7d) | Quentíssimo | Objeção + oferta direta (garantia, bônus, prazo) | RDA + in-stream 15s | Mais alto da escada |
| 2 | Página de oferta sem conversão (7–14d) | Quente | Prova social + demonstração | In-stream 30s + RDA | Médio |
| 3 | Visitantes gerais do site (30d) | Morno | Mecanismo/diferencial | In-feed + RDA | Médio |
| 4 | Viewers de vídeo ≥ X% (30d) | Morno | Aprofundar a promessa do vídeo visto | In-stream 30–60s | Médio |
| 5 | Visitantes/viewers antigos (90–180d) | Frio reaquecível | Novidade/ângulo novo (não repetir o que falhou) | Demand Gen | Mais baixo |
| — | **Convertidos** | — | **EXCLUÍDOS de todos os degraus** (entram só em pós-venda/upsell se o cliente tiver essa esteira) | — | — |

\* Caps numéricos são hipótese inicial declarada — calibrar com dados de frequência da conta após 2 semanas; não existe número universal.

**Regras da escada:**
1. Cada degrau exclui os degraus mais quentes acima dele (degrau 3 exclui listas dos degraus 1–2) — senão o usuário cai em dois degraus ao mesmo tempo e a leitura morre.
2. Janelas de lista devem existir no tracking ANTES da campanha — dependência do `tracking-blueprint`.
3. Mensagem do degrau 1 ataca objeção, não awareness — quem abandonou checkout não precisa saber quem você é.
4. Degrau 5 só roda se houver budget sobrando após os degraus 1–4 saturarem.

---

## 9. Gestão de frequência e fadiga de criativo

### Frequency cap
- **Awareness (bumper/não pulável):** cap por campanha definido no lançamento. O valor inicial é hipótese registrada no blueprint (`Cap inicial: [X]/semana — hipótese, revisar em D+14 com dados da conta`). Sem cap, tCPM concentra impressões nos mesmos usuários.
- **Remarketing:** cap por degrau (tabela da seção 8); degraus quentes toleram frequência maior por janela curta.
- **Demand Gen / conversão:** o bidding por conversão autorregula parcialmente; ainda assim monitorar frequência média no relatório de alcance.

### Sinais de fadiga (gatilhos para o `optimization-executor` e o `performance-analyst`)
| Sinal | Leitura | Ação |
|---|---|---|
| VTR caindo semana a semana com público estável | Criativo cansou | Rotacionar para variação de ângulo (não só de cor/corte) |
| CTR caindo + frequência subindo | Saturação de audiência | Reduzir cap ou ampliar camada de público |
| CPA subindo com CVR de LP estável | Problema no topo do criativo (hook) | Trocar hook — manter corpo (teste isolado) |
| CVR de LP caindo com CTR estável | Problema é a página, não o anúncio | Encaminhar `cro-engineer` via `lp-cro-audit` |

### Rotação de criativos
- Mínimo 2 variações ativas por ad group desde o dia 1 (ângulos distintos, não cosmetics).
- Nova variação entra ANTES da atual fadigar — produzir em esteira contínua com o `ad-copywriter` e os templates do `roteiros-youtube.md`.

---

## 10. Video ad sequencing

Usar quando a narrativa tem etapas (lançamento, produto complexo, B2B). Estrutura clássica de 3 passos:

| Passo | Gatilho de avanço | Vídeo | Objetivo |
|---|---|---|---|
| 1 — Hook | Impressão ou view do passo 1 | 6s bumper ou 15s (apresenta tensão/promessa) | Plantar a ideia |
| 2 — Educação | View/impressão do passo 1 | 30–60s in-stream (mecanismo + prova) | Construir caso |
| 3 — Oferta | View/impressão do passo 2 | 15–30s in-stream (CTA direto) | Converter |

Regras:
- Definir o gatilho (impressão vs. view) conscientemente: impressão avança mais rápido e mais barato; view garante atenção.
- Sequência roda sobre camada definida (ex: in-market ou custom intent) — não sobre "todo mundo".
- Medir a sequência como unidade (conversões da campanha de sequência), não vídeo a vídeo.

---

## 11. Especificidades de Demand Gen

- **Estrutura:** campanha → asset groups (não ad groups). Um asset group por camada de público (mesma regra da seção 5).
- **Assets por asset group:** vídeos em 16:9 + 9:16 (e 1:1 quando disponível), imagens em paisagem/quadrado/retrato, headlines e descrições em quantidade máxima permitida — completar com o `ad-copywriter` via `ad-copy-builder`. Limites vigentes de caracteres e quantidade `[VALIDAR NA DOCUMENTAÇÃO ATUAL DO GOOGLE]`.
- **Lookalike:** semente mínima e tamanhos de expansão conforme documentação vigente `[VALIDAR NA DOCUMENTAÇÃO ATUAL DO GOOGLE]`; semente de melhor qualidade = lista de convertidos do Customer Match.
- **Inventário:** YouTube (in-stream, in-feed, Shorts) + Discover + Gmail. Não há controle de placement individual como na Display clássica — quem exige contexto garantido fica na campanha de vídeo com placements gerenciados.
- **Diferença para PMax:** Demand Gen não cobre Search/Shopping e dá mais controle de público; se o cliente precisa de cobertura full-inventory com feed, o caminho é o `pmax-specialist` via `pmax-campaign-builder` — registrar a fronteira no blueprint para não duplicar esforço.

---

## 12. Checklist de assets — Responsive Display Ads

Fornecer o conjunto COMPLETO (RDA com asset faltando entrega pior):

- [ ] Headlines curtas: máximo permitido de variações, ângulos distintos (dor, prova, oferta, urgência) — redigir com `ad-copywriter`
- [ ] Headline longa: 1 (aparece sozinha — precisa se sustentar sem descrição)
- [ ] Descrições: máximo permitido de variações
- [ ] Nome da empresa
- [ ] Imagens paisagem (1.91:1) — mínimo 2, sem texto sobreposto relevante (pode ser cortado)
- [ ] Imagens quadradas (1:1) — mínimo 2
- [ ] Logo 1:1 e logo 4:1
- [ ] Vídeo (opcional, mas recomendado quando existir — herda dos roteiros desta skill)
- [ ] CTA configurado quando o objetivo pedir botão específico
- [ ] URL final com UTMs conforme padrão do `tracking-blueprint`

Quantidades e proporções exatas vigentes: `[VALIDAR NA DOCUMENTAÇÃO ATUAL DO GOOGLE]`.

---

## 13. Dependências de mensuração (gate de lançamento)

Nada entra no ar sem este bloco verificado — owner: `tracking-engineer` via `tracking-blueprint`:

- [ ] Conversão primária definida, implementada e testada (lead, compra, etc.)
- [ ] Valores de conversão (se tROAS estiver no plano)
- [ ] Enhanced Conversions ativas (qualidade de mensuração em ambiente de perda de cookies)
- [ ] Consent mode configurado conforme exigência legal aplicável (LGPD no Brasil; consent mode v2 obrigatório para tráfego do EEA — se o cliente atende Europa, é gate, não opção)
- [ ] Listas de remarketing criadas com as janelas da seção 8 (site + vídeo + Customer Match)
- [ ] Canal do YouTube vinculado à conta Google Ads (pré-requisito das listas de viewers)
- [ ] Janela de atribuição e contagem (uma/todas) decididas e documentadas
- [ ] EVC (engaged-view conversions) e view-through: janelas registradas no blueprint para o `performance-analyst` ler corretamente

Se qualquer item crítico falhar → blueprint sai com status **BLOQUEADO** e a pendência nomeada.

---

## 14. Script Google Ads — exclusão automática de placements ruins

Script JavaScript para Google Ads (implantação e agendamento via skill `gads-scripts`, execução semanal). Exclui placements de Display com gasto relevante e zero conversões. **Sempre rodar em PREVIEW primeiro e revisar a lista antes da primeira execução real.**

```javascript
/**
 * TráfegoPRO — Exclusão automática de placements (Display)
 * Regra: placements com custo >= COST_THRESHOLD e 0 conversões na janela
 * LOOKBACK são adicionados à lista compartilhada de exclusões.
 *
 * Limitações conhecidas:
 * - Cobre placements da Rede de Display (entidades Display/placements do
 *   scripts API). Exclusão granular de canais do YouTube pode não estar
 *   disponível via Scripts dependendo da versão da API — validar na
 *   documentação vigente; se indisponível, gerar relatório e excluir
 *   manualmente ou via Google Ads Editor.
 * - COST_THRESHOLD deve refletir o CPA-alvo da conta (ex: 1x a 2x o CPA
 *   médio) — definir com dados reais, não usar o valor default às cegas.
 */

var CONFIG = {
  LOOKBACK: 'LAST_30_DAYS',
  COST_THRESHOLD: 0,           // DEFINIR: ex. 1x o CPA-alvo da conta, em moeda da conta
  MIN_CLICKS: 5,               // ignora placements sem tráfego mínimo (ruído)
  SHARED_LIST_NAME: 'TrafegoPRO - Placements Excluidos (auto)',
  LABEL_CAMPAIGNS: 'AUTO-PLACEMENT-CLEAN', // só processa campanhas com este label
  EMAIL_REPORT: ''             // opcional: e-mail para receber o log
};

function main() {
  if (CONFIG.COST_THRESHOLD <= 0) {
    throw new Error('Defina COST_THRESHOLD com base no CPA-alvo da conta antes de executar.');
  }

  var excluded = [];
  var iterator = AdsApp.display().placements()
    .withCondition('metrics.cost_micros >= ' + (CONFIG.COST_THRESHOLD * 1000000))
    .withCondition('metrics.conversions = 0')
    .withCondition('metrics.clicks >= ' + CONFIG.MIN_CLICKS)
    .withCondition('campaign.status = ENABLED')
    .forDateRange(CONFIG.LOOKBACK)
    .get();

  while (iterator.hasNext()) {
    var placement = iterator.next();
    var campaign = placement.getCampaign();
    if (!campaignHasLabel(campaign, CONFIG.LABEL_CAMPAIGNS)) continue;

    var url = placement.getUrl();
    var stats = placement.getStatsFor(CONFIG.LOOKBACK);
    placement.getAdGroup().display().newPlacementBuilder()
      .withUrl(url)
      .exclude();
    excluded.push(url + ' | custo: ' + stats.getCost().toFixed(2) +
                  ' | cliques: ' + stats.getClicks());
  }

  Logger.log('Placements excluídos (' + excluded.length + '):\n' + excluded.join('\n'));

  if (CONFIG.EMAIL_REPORT && excluded.length > 0) {
    MailApp.sendEmail(CONFIG.EMAIL_REPORT,
      '[TráfegoPRO] ' + excluded.length + ' placements excluídos',
      excluded.join('\n'));
  }
}

function campaignHasLabel(campaign, labelName) {
  var labels = campaign.labels().withCondition(
    "label.name = '" + labelName + "'").get();
  return labels.hasNext();
}
```

Rotina associada (handoff ao `optimization-executor` via `optimization-routine`):
1. Semanal: revisar log do script + relatório "onde os anúncios apareceram".
2. Mensal: promover exclusões recorrentes à lista compartilhada da conta.
3. Sempre: nunca excluir placement com conversões view-through relevantes sem checar a janela de EVC.

---

## 15. Template preenchível — Blueprint final

Gerar o entregável `blueprint-video-<slug-do-cliente>.md` neste formato:

```markdown
# Blueprint Vídeo & Display — [CLIENTE]
Data: [AAAA-MM-DD] · Autor: video-display-specialist (TráfegoPRO)
Status: [PRONTO PARA IMPLEMENTAÇÃO | BLOQUEADO — pendência: ___ / owner: ___]

## 1. Contexto
- Oferta: ___ · Ticket: ___ · LP: ___
- Objetivo do canal: ___ · Budget mensal: ___ · Meta CPA/ROAS: ___ (origem: media-plan-builder [path] ou input direto)
- Insumos lidos: [keyword map / competitor-recon / tracking-blueprint — paths]

## 2. Decisões objetivo → formato
| Objetivo | Formato escolhido | Justificativa (nó da árvore) |
|---|---|---|

## 3. Estrutura de campanhas
| Campanha (naming) | Tipo | Bidding inicial → migração | Budget/dia | Expansão de público | Frequency cap |
|---|---|---|---|---|---|

## 4. Segmentação por ad group / asset group
| Campanha | AG (naming) | Camada | Definição da lista/segmento | Exclusões | Expectativa de CPA (qualitativa) |
|---|---|---|---|---|---|

## 5. Custom segments criados
| Nome | Tipo (intent/URL/app) | Conteúdo (termos/URLs) | Fonte (keyword-research / competitor-recon) |
|---|---|---|---|

## 6. Criativos / roteiros
| Asset (naming) | Duração | Proporção | Ângulo | Camada que atende | Status (roteiro pronto / produção) |
|---|---|---|---|---|---|
(roteiros completos em anexo, formato do roteiros-youtube.md)

## 7. Escada de remarketing
(tabela da seção 8 preenchida, com exclusões entre degraus)

## 8. Sequencing (se aplicável)
(tabela da seção 10 preenchida)

## 9. Dependências de mensuração
(checklist da seção 13 com status item a item)

## 10. Checklist de pré-lançamento
- [ ] Naming convention aplicada em campanhas, AGs e assets
- [ ] Uma camada por AG/asset group — verificado
- [ ] Exclusão de convertidos em TODAS as campanhas
- [ ] Listas de exclusão de conteúdo/inventário aplicadas
- [ ] Decisão de expansão de público registrada por campanha
- [ ] Frequency caps configurados (awareness + escada)
- [ ] UTMs conforme tracking-blueprint
- [ ] Mínimo 2 variações de criativo por AG
- [ ] Script de placements agendado (preview validado) — via gads-scripts
- [ ] Budget reconciliado com media-plan-builder / budget-pacing

## 11. Handoffs
- ad-copywriter → headlines/descrições RDA e Demand Gen (ad-copy-builder)
- tracking-engineer → pendências da seção 9 (tracking-blueprint)
- optimization-executor → rotina semanal (optimization-routine) + script (gads-scripts)
- performance-analyst → leitura de VTR/CPV/CPA por camada e fadiga (performance-report)
- cro-engineer → se CVR da LP for o gargalo (lp-cro-audit)

---
🚀 TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads
Tráfego pago gerido por agentes de IA — da pesquisa ao ROAS.
```
