# checklist-recon.md — Protocolo Operacional de Reconhecimento de Concorrência

> Auxiliar da skill `competitor-recon` (agente `market-intel`) — TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads.
> Uso: seguir as partes em ordem. Cada fase tem checklist com critério de saída. Nenhum campo do dossiê pode ser preenchido sem evidência coletada e datada.

---

## Parte 0 — Princípios e higiene de coleta

- [ ] **Geo correta.** O leilão do Google Ads é local: rodar toda amostragem na geografia-alvo da campanha (parâmetro de localização da busca, VPN, ou ao menos declarar a geo usada como limitação).
- [ ] **Sessão limpa.** Janela anônima, sem login Google, para reduzir personalização. Ainda assim a SERP varia — por isso o mínimo de 3 amostras.
- [ ] **Nunca clicar no anúncio.** Botão direito → copiar endereço do link, ou abrir a LP digitando o domínio. Clique em anúncio de concorrente gasta verba alheia e suja sua coleta.
- [ ] **Datar tudo.** Cada evidência recebe `coletado em DD/MM/AAAA, fonte`. Dossiê tem validade prática de ~30–45 dias para anúncios e ~90 dias para posicionamento de LP.
- [ ] **Separar fato de inferência.** Fato: "headline X observada no termo Y". Inferência: "o ângulo dominante parece ser preço". Marcar inferências como tal.
- [ ] **Proibido inventar números.** Impression share, overlap rate, CPC, volume: só de relatório real ou ferramenta consultada (citar qual, com data). Sem fonte → escrever literalmente: *"Dado não disponível — necessário pesquisa adicional ou input do usuário."*

---

## Parte 1 — Fontes de coleta e protocolo por fonte

Ordem de confiabilidade (usar todas que estiverem disponíveis):

### 1.1 Auction Insights (requer conta Google Ads ativa com tráfego)

Onde: Google Ads → Campanhas/Grupos/Palavras-chave → "Informações do leilão". Exportar CSV por campanha de Search e por período (últimos 30 dias + comparativo com 30 anteriores).

Métricas e leitura:

| Métrica | O que mede | Como interpretar no recon |
|---|---|---|
| **Impression share (IS)** | % dos leilões elegíveis em que o anunciante apareceu | Quem tem IS alto nos seus termos é o concorrente estrutural — vai aparecer no dossiê com ficha completa |
| **Overlap rate** | % das vezes em que o concorrente apareceu junto com você | Overlap alto = disputa direta de leilão; priorizar na catalogação |
| **Position above rate** | Quando apareceram juntos, % em que o concorrente ficou acima | Acima de ~50% sugere lance/QS superior ao seu — investigar o anúncio e a LP dele |
| **Top of page rate** | % de impressões do concorrente no topo da página | Mede agressividade de presença premium |
| **Abs. top of page rate** | % na primeira posição absoluta | Quem compra a posição 1 sistematicamente está pagando caro — pode indicar LTV alto ou queima de verba |
| **Outranking share** | % de leilões em que você ficou acima dele (ou apareceu e ele não) | Sua métrica de "quem está ganhando" por concorrente |

**Árvore de decisão — interpretação do Auction Insights:**

```
Concorrente com overlap rate ALTO?
├── SIM → Position above rate dele > 50%?
│   ├── SIM → Ele vence o leilão com frequência.
│   │   ├── Abs. top alto E presente em quase todos os termos → player estrutural com verba.
│   │   │   → Recomendação: NÃO disputar de frente; buscar lacuna de ângulo/long-tail (Fase 4).
│   │   └── Forte só em um cluster de termos → especialista de nicho.
│   │       → Recomendação: mapear o cluster e decidir disputar ou ceder (handoff: traffic-strategist).
│   └── NÃO → Vocês dividem o leilão; diferenciação de copy/LP decide o CTR e o QS.
│       → Recomendação: contra-ângulo direto no copy (handoff: ad-copywriter).
└── NÃO → Concorrente marginal ou sazonal.
    → Registrar no dossiê como "observação", sem ficha completa. Reavaliar no modo monitoramento.
```

- [ ] Exportei Auction Insights das campanhas de Search relevantes (ou registrei que a conta não existe/não tem dados).
- [ ] Classifiquei cada anunciante: **estrutural** / **especialista de cluster** / **marginal-sazonal**.
- [ ] Comparei com o período anterior: entrantes novos? alguém sumiu? (sinal de teste, suspensão ou desistência).

### 1.2 Centro de Transparência de Anúncios do Google

Onde: adstransparency.google.com — buscar por anunciante (nome verificado ou domínio), filtrar por região e formato (Texto/Imagem/Vídeo).

Protocolo:
- [ ] Para cada concorrente identificado na 1.1 ou 1.3, buscar o anunciante verificado e registrar: nome legal verificado, formatos ativos, variedade de criativos, período de veiculação visível.
- [ ] Registrar a **amplitude criativa**: 2–3 variações de anúncio = operação simples; dezenas de variações = operação madura com teste ativo (isso muda o quão rápido ele reage ao seu lançamento).
- [ ] Checar formatos além de Search: se o concorrente roda vídeo/display, anotar para o `video-display-specialist` e para o `traffic-strategist` (ele está construindo demanda, não só capturando).
- Limitações a declarar: a ferramenta não mostra termos segmentados, lances nem orçamento — só os criativos. Não inferir investimento a partir dela.

### 1.3 Amostragem manual de SERP

Protocolo mínimo por termo prioritário (usar os termos transacionais/comerciais do keyword map):

- [ ] **3 amostras por termo**, em momentos distintos (ex.: manhã/tarde/noite ou dias diferentes) — leilão é dinâmico.
- [ ] Por amostra, registrar: data/hora, geo, termo, anunciantes presentes (em ordem), posição (topo/fundo), headline visível, sitelinks/assets exibidos, presença de Shopping/PMax (carrossel de produtos), presença de LSAs se aplicável.
- [ ] Calcular **frequência de aparição** por anunciante: apareceu em quantas das 3 amostras × em quantos termos. Frequência ≥ 2/3 em ≥ 50% dos termos = concorrente prioritário.
- [ ] Copiar (sem clicar) a URL de destino de cada anúncio para a Fase 3.

**Tabela de registro de amostragem (preencher):**

| Termo | Amostra (data/hora) | Anunciante | Posição | Headline observada | Assets visíveis | URL destino |
|---|---|---|---|---|---|---|
| | | | | | | |

### 1.4 WebSearch / WebFetch (contexto de oferta)

- [ ] Buscar ofertas públicas, preços, garantias e prova social de cada concorrente prioritário (site, páginas de planos, reclamações públicas, avaliações).
- [ ] Registrar reputação observável (ex.: volume e teor de reclamações públicas) **como fato citável com URL e data** — útil para ângulo de confiança na Fase 4.

**Critério de saída da Parte 1:** lista fechada de 5–8 concorrentes prioritários (3–5 no modo LP), cada um com classificação (estrutural/especialista/marginal) e evidências datadas.

---

## Parte 2 — Catalogação de anúncios (ficha por concorrente)

Preencher uma ficha por concorrente prioritário:

```markdown
### Ficha — [Concorrente X]
- Domínio / anunciante verificado:
- Classificação (estrutural / especialista de cluster / marginal):
- Termos em que aparece (com frequência de aparição):
- Formatos ativos (Search / Shopping-PMax / Vídeo / Display):

**Anúncios observados (Search):**
| Headline(s) | Descrição (resumo) | Assets (sitelinks, callouts, snippets, preço, promoção) | Oferta explícita | CTA |
|---|---|---|---|---|

**Oferta central:** (preço? trial? diagnóstico grátis? garantia? bônus? parcelamento?)
**Prova usada:** (nº de clientes, avaliações, selos, cases, autoridade/credencial, mídia)
**Urgência/escassez:** (prazo, vagas, condição limitada — ou ausente)
**Ângulo(s) dominante(s):** [da taxonomia 2.1]
**CTA dominante:** [da taxonomia 2.2]
**Inferência de posicionamento (marcar como inferência):**
```

### 2.1 Taxonomia de ângulos (classificar cada anúncio em 1–2)

1. **Preço/economia** — "mais barato", desconto, parcelamento, custo-benefício.
2. **Autoridade/especialização** — credenciais, anos de mercado, "especialistas em".
3. **Velocidade/conveniência** — "em 24h", "sem sair de casa", entrega/atendimento rápido.
4. **Garantia/redução de risco** — devolução, satisfação garantida, "só paga se".
5. **Exclusividade/premium** — sob medida, atendimento dedicado, escassez de vagas.
6. **Prova social/popularidade** — "+10.000 clientes", avaliações, "o mais usado".
7. **Resultado/transformação** — promessa de outcome específico do nicho.
8. **Medo/custo de não agir** — risco, multa, perda, "não deixe para depois".
9. **Novidade/mecanismo** — tecnologia, método próprio, "novo jeito de".

### 2.2 Taxonomia de CTAs

- **Transacional direto:** Compre / Contrate / Assine / Agende agora.
- **Lead de baixa fricção:** Orçamento grátis / Diagnóstico / Simule / Fale no WhatsApp.
- **Avaliação:** Teste grátis / Demo / Amostra.
- **Informacional (raro em Search transacional):** Saiba mais / Baixe o guia.

### 2.3 Matriz ângulo × concorrente (núcleo analítico da fase)

| Ângulo | Conc. A | Conc. B | Conc. C | Conc. D | Cliente (atual) |
|---|---|---|---|---|---|
| Preço/economia | | | | | |
| Autoridade | | | | | |
| Velocidade | | | | | |
| Garantia | | | | | |
| Exclusividade | | | | | |
| Prova social | | | | | |
| Resultado | | | | | |
| Medo/risco | | | | | |
| Novidade/mecanismo | | | | | |

Marcar: `XX` = ângulo principal, `X` = secundário, vazio = não usa. **Colunas cheias na mesma linha = guerra de mesmice (commodity). Linhas vazias = candidatas a lacuna (Fase 4).**

- [ ] Ficha completa para cada concorrente prioritário.
- [ ] Matriz ângulo × concorrente preenchida.
- [ ] Padrões registrados: ângulo mais saturado, ângulo ausente, CTA dominante do nicho.

---

## Parte 3 — Auditoria de LPs concorrentes (scorecard)

Para cada concorrente prioritário, acessar a URL de destino coletada (direto, sem clicar no anúncio) e pontuar **0 / 1 / 2** por critério:

| # | Critério | 0 (fraco) | 1 (mediano) | 2 (forte) |
|---|---|---|---|---|
| 1 | **Proposta de valor acima da dobra** | Genérica/ausente | Clara mas comum | Específica, diferenciada, com promessa mensurável |
| 2 | **Message match anúncio↔LP** | LP não menciona o que o anúncio prometeu | Tema coerente, termos diferentes | Headline da LP espelha o anúncio e o termo de busca |
| 3 | **CTA principal** | Escondido/múltiplos conflitantes | Visível mas fraco | Único, contrastado, repetido nos pontos de decisão |
| 4 | **Fricção do formulário/conversão** | Formulário longo / cadastro exigido | 4–6 campos | ≤3 campos, ou clique único (WhatsApp/ligação) |
| 5 | **Prova social/confiança** | Nenhuma | Genérica ("clientes satisfeitos") | Específica e verificável (nomes, números, avaliações, selos) |
| 6 | **Oferta** | Só "entre em contato" | Oferta padrão do nicho | Oferta forte (garantia, bônus, risco invertido) |
| 7 | **Tratamento de objeções** | Ignora objeções | FAQ básico | Responde as 3+ objeções centrais do nicho no corpo da página |
| 8 | **Mobile** | Quebrada/lenta no mobile | Usável | Pensada mobile-first, CTA fixo, carregamento leve |
| 9 | **Compliance/clareza** | Promessas irreais, sem dados da empresa | Ok com ressalvas | Termos claros, dados da empresa, políticas visíveis |

- Velocidade real de carregamento: **não estimar a olho** — se necessário, indicar medição via ferramenta (ex.: PageSpeed Insights) ou declarar lacuna.
- **Leitura do total (0–18):** 0–6 = LP fraca (concorrente vulnerável: clique caro dele vira lead barato seu se sua LP for melhor); 7–12 = mediana (diferenciação decide); 13–18 = LP forte (não disputar de frente sem LP à altura — handoff obrigatório ao `cro-engineer`).

- [ ] Scorecard preenchido por concorrente, com evidência (o que foi visto, citação curta, URL, data).
- [ ] Registrado **o melhor padrão do nicho** (benchmark a superar) e **a pior fraqueza recorrente** (oportunidade coletiva).

---

## Parte 4 — Lacunas de posicionamento exploráveis

Cruzar Partes 2 e 3. Tipos de lacuna a procurar:

1. **Ângulo vazio** — linha da matriz que ninguém ocupa e que importa para o público (validar contra as dores do keyword map). *Output: ângulo recomendado + por que está vazio (descartado por ser fraco, ou ignorado por preguiça?).*
2. **Objeção não respondida** — objeção central do nicho que nenhuma LP trata. *Output: requisito de LP para o `cro-engineer` + ângulo de copy.*
3. **Termo pouco disputado** — termo prioritário do keyword map com ≤1 anunciante recorrente na amostragem. *Output: oportunidade de IS barato — sinalizar ao `traffic-strategist` e ao `search-specialist`.*
4. **Oferta superável** — a melhor oferta do nicho é fraca (sem garantia, sem risco invertido). *Output: proposta de oferta superior para validação com o cliente — o agente não inventa a oferta sozinho, recomenda e pede aprovação.*
5. **Fricção coletiva alta** — todas as LPs pedem formulário longo. *Output: conversão de baixa fricção como vantagem estrutural (handoff: `cro-engineer`).*

**Priorização de cada lacuna — score ICE (1–5 cada):**
- **Impacto:** quanto move CTR/CVR/CPA se explorada?
- **Confiança:** a evidência é forte (fato observado em múltiplas amostras) ou inferência?
- **Esforço (invertido):** 5 = dá pra explorar só com copy; 1 = exige mudar oferta/produto.

Prioridade = I × C × E. Reportar as lacunas em ordem decrescente; recomendar execução imediata só para as de score ≥ 27 com confiança ≥ 3.

- [ ] Cada lacuna tem: tipo, evidência (com fonte/data), score ICE, recomendação e **dono do handoff** (`ad-copywriter`, `cro-engineer`, `traffic-strategist` ou `search-specialist`).

---

## Parte 5 — Template do dossiê de concorrência (output final)

```markdown
# Dossiê de Concorrência — [Nicho/Cliente] — [AAAA-MM]
Modo: [completo/ângulos/LP/monitoramento] · Geo: [__] · Termos analisados: [n] · Concorrentes priorizados: [n]
Fontes: [Auction Insights? Transparência? SERP (datas)?] · Validade sugerida: 30–45 dias

## 1. Sumário executivo (máx. 5 bullets)
- [maior ameaça] · [maior oportunidade] · [recomendação nº1]

## 2. Mapa do leilão
| Concorrente | Classificação | Termos disputados | Frequência | Pressão (Auction Insights ou "dado não disponível") |
|---|---|---|---|---|

## 3. Fichas de concorrente
[colar fichas da Parte 2]

## 4. Matriz ângulo × concorrente
[colar matriz 2.3]

## 5. Scorecards de LP
| Concorrente | Score (0–18) | Maior força | Maior fraqueza |
|---|---|---|---|

## 6. Lacunas exploráveis (priorizadas por ICE)
| # | Lacuna | Tipo | Evidência (fonte, data) | ICE | Recomendação | Handoff |
|---|---|---|---|---|---|---|

## 7. Implicações por agente
- ad-copywriter (ad-copy-builder): [ângulos a usar / evitar; CTAs do nicho]
- cro-engineer (lp-cro-audit): [benchmark a superar; requisitos de LP]
- traffic-strategist (media-plan-builder / budget-pacing): [pressão de leilão; termos baratos; risco de guerra de lance]
- search-specialist (search-campaign-builder): [termos pouco disputados; negativas sugeridas por sobreposição de marca]

## 8. Lacunas de dado declaradas
- [tudo que não foi possível confirmar e como obter]
```

---

## Parte 6 — Script Google Ads: monitor de pressão competitiva (quando a conta existir)

Auction Insights completo não é exportável via Scripts em todas as contas; o proxy operacional é monitorar **impression share perdido por classificação (rank)** — quando ele sobe, concorrentes estão ganhando leilões de você. Instalar em Ferramentas → Scripts (manutenção e variações avançadas: skill `gads-scripts` do `tracking-engineer`).

```javascript
/**
 * TráfegoPRO — Monitor de Pressão Competitiva (Search)
 * Compara IS perdido por rank (últimos 30d vs 30d anteriores) por campanha
 * e registra alerta quando a perda cresce acima do limiar.
 * Agendar: semanal.
 */
var LIMIAR_ALERTA_PP = 5; // alerta se IS perdido por rank subir >= 5 pontos percentuais

function main() {
  var hoje = new Date();
  var fmt = function (d) {
    return Utilities.formatDate(d, AdsApp.currentAccount().getTimeZone(), 'yyyy-MM-dd');
  };
  var d30 = new Date(hoje.getTime() - 30 * 864e5);
  var d60 = new Date(hoje.getTime() - 60 * 864e5);

  var atual = coletar(fmt(d30), fmt(hoje));
  var anterior = coletar(fmt(d60), fmt(d30));

  Logger.log('Campanha | IS | IS perdido (rank) atual | anterior | delta');
  for (var nome in atual) {
    var a = atual[nome];
    var b = anterior[nome] || { lostRank: 0 };
    var delta = (a.lostRank - b.lostRank) * 100;
    var linha = nome + ' | IS ' + (a.is * 100).toFixed(1) + '% | ' +
      (a.lostRank * 100).toFixed(1) + '% | ' + (b.lostRank * 100).toFixed(1) +
      '% | ' + delta.toFixed(1) + ' pp';
    if (delta >= LIMIAR_ALERTA_PP) {
      Logger.log('[ALERTA pressão competitiva] ' + linha +
        ' -> acionar competitor-recon (modo monitoramento) e revisar lances/QS.');
    } else {
      Logger.log(linha);
    }
  }
}

function coletar(ini, fim) {
  var out = {};
  var query =
    "SELECT campaign.name, metrics.search_impression_share, " +
    "metrics.search_rank_lost_impression_share " +
    "FROM campaign " +
    "WHERE campaign.advertising_channel_type = 'SEARCH' " +
    "AND campaign.status = 'ENABLED' " +
    "AND segments.date BETWEEN '" + ini + "' AND '" + fim + "'";
  var rows = AdsApp.search(query);
  while (rows.hasNext()) {
    var r = rows.next();
    out[r.campaign.name] = {
      is: Number(r.metrics.searchImpressionShare) || 0,
      lostRank: Number(r.metrics.searchRankLostImpressionShare) || 0
    };
  }
  return out;
}
```

Leitura do alerta: IS perdido por **rank** subindo = problema de lance e/ou Quality Score sob pressão de entrantes → disparar modo monitoramento desta skill e avisar `traffic-strategist`. (IS perdido por **orçamento** é assunto de `budget-pacing`, não de recon.)

---

## Parte 7 — Erros comuns (anti-checklist)

- ❌ Concluir "ninguém anuncia nesse termo" com 1 amostra de SERP. (Mínimo 3.)
- ❌ Citar impression share "estimado". Ou veio de relatório, ou é lacuna declarada.
- ❌ Confundir anúncio orgânico-rico (SEO + schema) com anúncio pago na catalogação.
- ❌ Copiar o ângulo dominante do nicho "porque todo mundo usa" — saturação é argumento contra, não a favor.
- ❌ Auditar LP pela home do concorrente em vez da URL de destino real do anúncio.
- ❌ Recomendar guerra de lance contra player estrutural sem sinalizar o custo ao `traffic-strategist`.
- ❌ Entregar dossiê sem a seção "Implicações por agente" — recon sem handoff é relatório de gaveta.

## Definition of Done

- [ ] 5–8 concorrentes priorizados com ficha completa (3–5 no modo LP).
- [ ] Matriz ângulo × concorrente + scorecards de LP preenchidos com evidência datada.
- [ ] Lacunas priorizadas por ICE, cada uma com recomendação e dono de handoff.
- [ ] Lacunas de dado declaradas explicitamente.
- [ ] Dossiê gravado no path combinado e postado na sub-issue, com CTA padrão TráfegoPRO.
