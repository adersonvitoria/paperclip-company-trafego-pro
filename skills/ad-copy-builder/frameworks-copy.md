# Frameworks de Copy — TráfegoPRO

Manual operacional de escrita de anúncios Google Ads da TráfegoPRO. Usado pela skill `ad-copy-builder` (agente `ad-copywriter`). Todo pacote de copy entregue pela casa segue este documento.

---

## 1. Limites técnicos por formato

Contagem inclui espaços e pontuação. Validar a contagem **antes** de entregar — ativo estourado é entrega reprovada.

### 1.1 Search — Responsive Search Ad (RSA)

| Ativo | Quantidade | Limite | Observação |
|---|---|---|---|
| Headline | 3 a 15 (entregar 15) | 30 car. | Google combina até 3 por exibição |
| Description | 2 a 4 (entregar 4) | 90 car. | Até 2 exibidas por combinação |
| Path de display | 0 a 2 (entregar 2) | 15 car. cada | Não é a URL real; usar keyword/categoria |
| URL final | 1 | — | Vem da sub-issue; nunca inventar |

### 1.2 PMax — Asset group (ativos de texto)

| Ativo | Quantidade | Limite | Observação |
|---|---|---|---|
| Headline | 3 a 15 | 30 car. | |
| Long headline | 1 a 5 | 90 car. | Exibida quando há espaço (ex.: Display grande) |
| Description curta | 1 | 60 car. | Obrigatória |
| Description | até 4 adicionais | 90 car. | |
| Business name | 1 | 25 car. | Nome real do anunciante |

Regra da casa para PMax: **1 asset group = 1 tema/persona/estágio de consciência**. Misturar ângulos de topo e fundo no mesmo asset group embaralha o sinal do algoritmo.

### 1.3 Texto para Video/Display (handoff ao `video-display-specialist`)

| Ativo | Limite típico | Observação |
|---|---|---|
| Headline (Responsive Display) | 30 car. | Até 5 |
| Long headline | 90 car. | 1 |
| Description | 90 car. | Até 5 |
| CTA de vídeo (action campaigns) | 10 car. | + headline de 15 car. |

Se o formato exato não estiver listado aqui, pesquisar o limite vigente na documentação oficial do Google Ads e citar a URL — limites mudam e não devem ser presumidos.

### 1.4 Regras de contagem

- Espaços, vírgulas e acentos contam como 1 caractere cada.
- Em **ad customizers** e **keyword insertion**, o que conta para o limite é o texto renderizado; o texto default precisa caber no limite por conta própria (é o fallback). Validar a renderização no Google Ads Editor antes de publicar.
- Anotar a contagem ao lado de cada ativo no formato `(NN/30)` ou `(NN/90)`.

---

## 2. Matriz de distribuição das 15 headlines

Distribuição obrigatória por pacote de RSA. O objetivo é dar ao algoritmo categorias **combináveis sem redundância** — duas headlines da mesma categoria nunca podem ser quase idênticas.

| Categoria | Qtde | Função | Regra |
|---|---|---|---|
| **Keyword principal** | 3–4 | Relevância e Quality Score (componente de ad relevance) | Usar variações da keyword (singular/plural, sinônimo, forma de pergunta) — nunca repetir a mesma frase literal |
| **Benefício/resultado** | 3–4 | O que o cliente ganha | Benefício concreto e específico; um benefício por headline |
| **Diferencial/prova** | 2–3 | Por que escolher este anunciante | Mecanismo, garantia, autoridade. Número de prova só com dado fornecido e fonte; senão, declarar a lacuna |
| **CTA direto** | 2–3 | Próximo passo | Verbo de ação no imperativo + objeto (ver §6) |
| **Urgência/escassez legítima** | 1–2 | Acelerar decisão | **Apenas** com oferta real e prazo real informados na sub-issue. Sem oferta real → substituir por mais 1–2 de benefício |

### Template preenchível

```
GRUPO DE ANÚNCIO: ________________   KEYWORD PRINCIPAL: ________________
ESTÁGIO DE CONSCIÊNCIA: ________________   ÂNGULOS USADOS: ________________

H1  [keyword]      ______________________________ (__/30)
H2  [keyword]      ______________________________ (__/30)
H3  [keyword]      ______________________________ (__/30)
H4  [keyword]      ______________________________ (__/30)
H5  [benefício]    ______________________________ (__/30)
H6  [benefício]    ______________________________ (__/30)
H7  [benefício]    ______________________________ (__/30)
H8  [benefício]    ______________________________ (__/30)
H9  [prova]        ______________________________ (__/30)
H10 [prova]        ______________________________ (__/30)
H11 [diferencial]  ______________________________ (__/30)
H12 [CTA]          ______________________________ (__/30)
H13 [CTA]          ______________________________ (__/30)
H14 [urgência*]    ______________________________ (__/30)
H15 [urgência*]    ______________________________ (__/30)
* só com oferta real; senão, benefício

D1  [benefício + keyword]   ______________________________ (__/90)
D2  [diferencial/mecanismo] ______________________________ (__/90)
D3  [prova/objeção]         ______________________________ (__/90)
D4  [CTA + oferta]          ______________________________ (__/90)

PATH1 ______________ (__/15)   PATH2 ______________ (__/15)
PINS RECOMENDADOS: ____________________ (justificativa obrigatória — ver §4)
```

---

## 3. Fórmulas de escrita

### 3.1 Headlines (30 caracteres exigem compressão extrema)

| Fórmula | Estrutura | Quando usar |
|---|---|---|
| **Keyword direta** | `[Keyword] + [qualificador]` | Categoria keyword. Ex. de estrutura: "Keyword em [Cidade]", "Keyword Online" |
| **Benefício seco** | `[Verbo de ganho] + [resultado]` | "Economize em...", "Resolva... hoje" |
| **4U comprimido** | Útil + Único + Ultra-específico (a Urgência só com oferta real) | Headlines de benefício e diferencial |
| **Prova-número** | `[Número fornecido] + [unidade] + [contexto]` | Só com dado verificável do briefing, com fonte |
| **Pergunta-dor** | `[Pergunta que nomeia a dor]?` | Topo/meio de funil (ver `banco-de-angulos.md`) — sem ponto de exclamação |
| **Sem-fricção** | `[Resultado] sem [obstáculo]` | Diferencial contra a alternativa comum |
| **CTA-verbo** | `[Imperativo] + [objeto] + [facilitador]` | "Peça seu orçamento grátis" |
| **Redução de risco** | `[Garantia/condição real]` | Fundo de funil; condição precisa existir no briefing |

### 3.2 Descriptions (90 caracteres — frase completa e autossuficiente)

Cada description deve funcionar combinada com **qualquer** headline. Nunca escrever description que continua a frase de uma headline específica (a não ser que ambas estejam pinadas em par — ver §4).

| Slot | Fórmula | Estrutura |
|---|---|---|
| D1 | Benefício + keyword | `[Benefício principal] com [keyword/categoria]. [Complemento curto].` |
| D2 | Mecanismo/diferencial | `[Como funciona em 1 frase]. [Por que isso importa para o cliente].` |
| D3 | Prova + objeção | `[Prova verificável OU resposta à objeção nº1]. [Reforço de confiança].` |
| D4 | CTA + oferta | `[Oferta real, se houver]. [CTA imperativo] e [próximo passo concreto].` |

### 3.3 Paths de display

- Path1 = keyword ou categoria (`/keyword`), Path2 = qualificador (`/cidade`, `/orcamento`, `/planos`).
- Sem espaços; usar hífen se precisar separar palavras; máx. 15 caracteres cada.
- O path não precisa existir na URL real, mas não pode enganar (mostrar `/gratis` sem nada grátis na página viola Misrepresentation).

---

## 4. Pinning — árvore de decisão

Pinning trava um ativo numa posição (H1/H2/H3, D1/D2) e **reduz o número de combinações** que o algoritmo pode testar — em geral derruba o Ad Strength. Por isso pin é exceção justificada, nunca padrão.

```
O ativo PRECISA aparecer em toda exibição?
├─ NÃO → não pinar.
└─ SIM → por quê?
   ├─ Exigência legal/compliance do cliente (disclaimers, vertical regulada)
   │   → PIN obrigatório. Pinar o disclaimer em D2 (ou H3) e registrar a exigência.
   ├─ Marca obrigatória na posição 1 (guideline do cliente)
   │   → Pinar 2–3 headlines de marca DIFERENTES todas em H1
   │     (pin de grupo: várias opções na mesma posição preserva rotação).
   ├─ Oferta que não pode aparecer fora de contexto
   │   → Pinar a headline da oferta em H2 e a description da condição em D1, em par.
   └─ "Quero controlar a mensagem" sem motivo acima
       → NÃO pinar. Controle estético não justifica perder combinações.
```

**Regras de pin da casa:**
1. Nunca pinar um único ativo sozinho numa posição se houver alternativa — pinar 2–3 ativos equivalentes na mesma posição (pin de grupo) mantém rotação.
2. Documentar no artefato: o que foi pinado, em qual posição, por quê, e o impacto esperado em Ad Strength.
3. Meta: Ad Strength **"Good"** ou **"Excellent"** sem sacrificar mensagem obrigatória. Ad Strength é diagnóstico de diversidade de ativos, **não** métrica de performance — nunca reescrever copy boa só para subir Ad Strength, e nunca avaliar teste A/B por Ad Strength (ver §7).
4. H3 e D2 não aparecem em todas as exibições — mensagem obrigatória nunca vai apenas em H3/D2.

---

## 5. Ad customizers e recursos dinâmicos

| Recurso | Sintaxe | Uso | Risco |
|---|---|---|---|
| Keyword insertion | `{KeyWord:texto default}` | Headline de keyword em grupos com muitas variações próximas | Keyword estranha renderizada no anúncio; default obrigatório e dentro do limite; **nunca** usar em grupo com keywords de marca de terceiros (trademark) |
| Countdown | `{=COUNTDOWN("AAAA-MM-DD HH:MM:SS","pt-BR")}` | Urgência **real** com data de término real (fim de oferta informado no briefing) | Usar sem prazo real = urgência falsa = Misrepresentation |
| Location insertion | `{LOCATION(City)}` | Serviço local multi-cidade | Cidade sem cobertura real |
| IF function | `{=IF(device=mobile, "texto"):default}` | CTA diferente para mobile (ex.: "Chame no WhatsApp") | Complexidade de QA; validar fallback |
| Business data / customizer de atributo | `{CUSTOMIZER.atributo:default}` | Preço/estoque dinâmico vindo de feed | Exige feed configurado — alinhar com `tracking-engineer` antes de usar |

Capitalização do keyword insertion: `{KeyWord:...}` = primeira letra de cada palavra maiúscula; `{Keyword:...}` = só a primeira palavra; `{keyword:...}` = tudo minúsculo.

---

## 6. Banco de CTAs por intenção

Selecionar conforme intenção da keyword e estágio de consciência (cruzar com `banco-de-angulos.md`). Adaptar o objeto ao produto real.

**Informacional (topo/meio):** "Veja como funciona", "Baixe o guia grátis"*, "Entenda em 2 min"*, "Compare as opções", "Descubra seu plano ideal", "Faça o diagnóstico grátis"*.

**Comparativa (meio):** "Compare antes de fechar", "Veja a diferença", "Peça uma demonstração", "Simule sem compromisso", "Receba uma proposta".

**Transacional (fundo):** "Peça seu orçamento", "Contrate online", "Agende sua avaliação", "Compre com frete grátis"*, "Comece hoje", "Garanta sua vaga"*.

**Local/imediata:** "Chame no WhatsApp", "Ligue agora", "Visite a unidade", "Agende pelo site".

\* Só usar se a condição for real (material grátis existe, frete grátis existe, vagas são limitadas de fato, duração confere). CTA com condição inexistente é Misrepresentation.

Regra: **1 CTA dominante por RSA** (repetido em headline de CTA e em D4). CTAs concorrentes na mesma RSA diluem a mensagem.

---

## 7. Metodologia de teste A/B de RSA

1. **Unidade de teste:** 2 RSAs no mesmo grupo de anúncio (RSA A = controle, RSA B = desafiante). Rotação de anúncios em "Otimizar" (default) — aceitar que o Google distribui de forma desigual e ler resultado por anúncio, não por impressões iguais.
2. **Um eixo por teste.** Eixos válidos: ângulo dominante (benefício vs. prova), CTA, oferta, presença de pinning, formato de headline (pergunta vs. afirmação). A RSA B muda **só** o eixo testado; o resto permanece igual à A.
3. **Hipótese escrita, sempre.** Formato: *"Se [mudança no eixo X], então [métrica] melhora, porque [racional ligado ao estágio de consciência]."* Sem hipótese registrada, o teste não roda.
4. **Métricas de leitura:** CTR e taxa de conversão por anúncio (com conversão validada pelo `tracking-engineer` via `tracking-blueprint`). Ad Strength **não** é métrica de resultado. Usar também o Asset Report (rótulos Low/Good/Best) para decidir substituição de ativos individuais no Modo Refresh.
5. **Volume e duração mínimos:** não declarar vencedor sem volume estatisticamente defensável. Não existe número mágico universal — calcular com uma calculadora de significância (pesquisar ferramenta atual se necessário) ou, no mínimo, exigir que ambos os anúncios tenham conversões em quantidade comparável e ciclo completo de semana (sazonalidade dia-da-semana). Declarar a lacuna quando o volume da conta for baixo demais para teste — nesse caso, recomendar teste sequencial mais longo em vez de fingir significância.
6. **Naming convention de RSAs:** `RSA-[A|B]_[eixo]_[AAAAMM]` — ex.: `RSA-A_beneficio_202606` vs. `RSA-B_prova_202606`. O nome carrega a hipótese para que `optimization-executor` e `performance-analyst` leiam o teste sem contexto adicional.
7. **Handoff:** o pacote registra o eixo, a hipótese e a métrica de decisão. Quem executa pausa/promoção é o `optimization-executor` (via `optimization-routine`); quem lê o resultado é o `performance-analyst` (via `performance-report`).

---

## 8. Checklist de compliance (rodar ativo a ativo, antes de toda entrega)

### 8.1 Editorial — Pontuação e símbolos
- [ ] Nenhum ponto de exclamação em headline (permitido no máx. 1 em description).
- [ ] Sem CAPS LOCK abusivo (sigla real e nome de marca registrada são exceções).
- [ ] Sem emojis, sem símbolos repetidos (!!, ???, $$$), sem símbolos no lugar de palavras ("&" só se fizer parte do nome da marca).
- [ ] Sem espaçamento criativo ("g r á t i s") e sem erro de ortografia proposital.
- [ ] Sem número de telefone no texto do anúncio (usar asset de chamada — alinhar com `search-specialist`).

### 8.2 Misrepresentation
- [ ] Nenhuma promessa de resultado garantido ("garantido", "100%", "sempre") sem garantia contratual real e citada.
- [ ] Nenhuma urgência/escassez sem oferta real com prazo/estoque real informado na sub-issue.
- [ ] Todo número (desconto, prazo, quantidade de clientes) tem fonte no briefing — anotada na seção Compliance.
- [ ] Preço/condição exibidos no anúncio existem na landing page (message match — divergência vai para o `cro-engineer` via `lp-cro-audit`).
- [ ] Nenhum superlativo não verificável ("o melhor do Brasil") sem prêmio/fonte de terceiro.

### 8.3 Trademark
- [ ] Uso de marca de terceiro (inclusive concorrentes vindos do `competitor-recon`) está **sinalizado para decisão humana** — a skill nunca aprova sozinha.
- [ ] Sem keyword insertion em grupos que contenham marcas de terceiros.
- [ ] Marca do próprio cliente grafada conforme guideline do briefing.

### 8.4 Verticais restritas
Se o nicho cair em vertical com política específica (saúde e medicamentos, serviços financeiros/crédito, jogos e apostas, álcool, jurídico, política, conteúdo adulto, emagrecimento):
- [ ] Pesquisar a política vigente na documentação oficial do Google Ads (support.google.com/adspolicy) e **citar a URL e a data da consulta** no artefato.
- [ ] Listar as restrições aplicáveis e marcar cada ativo afetado.
- [ ] Em saúde/emagrecimento: sem promessa de cura/resultado físico garantido, sem antes-e-depois implícito no texto.
- [ ] Em finanças: verificar exigências de divulgação (taxas, registro) vigentes no Brasil — se houver dúvida regulatória, escalar para decisão humana.
- [ ] Ver adaptações de ângulo por vertical em `banco-de-angulos.md` §6.

### 8.5 Formato da seção "Compliance" no artefato

```
## Compliance
| Ativo | Pontuação/símbolos | Misrepresentation | Trademark | Vertical | Status |
|---|---|---|---|---|---|
| H1 ... | ok | ok | ok | n/a | APROVADO |
| H9 ... | ok | número sem fonte | ok | n/a | AJUSTAR — pedir fonte |
Fontes consultadas: [URL + data, quando política foi pesquisada]
```

---

## 9. Template de entrega do pacote

```
# Pacote de Copy — [Cliente] / [Campanha] / [Grupo de anúncio]
Modo: [rsa|pmax|refresh|compliance] · Estágio: [topo|meio|fundo] · Data: AAAA-MM-DD

## Contexto usado
- Oferta real: ...
- Keywords do grupo: ... (fonte: keyword-research / sub-issue)
- Ângulos selecionados: ... (ref. banco-de-angulos.md)
- URL final: ...

## RSA A (controle) — RSA-A_[eixo]_[AAAAMM]
[15 headlines com categoria e contagem]
[4 descriptions com contagem]
[2 paths com contagem]
Pinning: [nenhum | detalhe + justificativa + trade-off]

## RSA B (teste) — RSA-B_[eixo]_[AAAAMM]
Hipótese: "Se ..., então ..., porque ..."
Eixo testado: [um só]
[ativos alterados, demais idênticos à RSA A]

## Banco de CTAs
[lista por intenção]

## Compliance
[tabela do §8.5]

## Handoffs
- search-specialist / pmax-specialist: publicar via search-campaign-builder / pmax-campaign-builder
- optimization-executor: critério de decisão do teste = [métrica + condição]
- cro-engineer: validar message match da promessa "[X]" na LP via lp-cro-audit
```

---

## 10. Coerência copy ↔ landing page (message match)

- A headline mais forte do pacote deve ter correspondência **literal ou semântica direta** acima da dobra da landing page.
- Oferta no anúncio = oferta na página (mesmo número, mesma condição).
- Se a LP não sustentar a promessa, a copy **não** se adapta para baixo automaticamente: sinalizar o conflito na entrega e acionar o `cro-engineer` (`lp-cro-audit`) — quem decide se muda a página ou a copy é o fluxo de otimização, com dado.
- Quality Score: copy com keyword (ad relevance) + LP coerente (landing page experience) + CTR esperado são os três componentes. A copy responde pelos dois primeiros; nunca prometer "subir Quality Score para X" — o score é diagnóstico por keyword, não meta contratável.
