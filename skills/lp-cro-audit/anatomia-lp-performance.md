# Anatomia da LP de Performance — Playbook de Diagnóstico e Hipóteses

> Arquivo auxiliar da skill `lp-cro-audit` (agente **cro-engineer**, TráfegoPRO).
> O `checklist-cro.md` diz **o que** pontuar; este arquivo diz **por que** cada elemento importa, **como consertar** o que reprovou e **como transformar achado em hipótese de teste**.

---

## 1. Os 3 níveis de message match (e a ponte com Quality Score)

O Google avalia "experiência na página de destino" como um dos três componentes do Quality Score (com relevância do anúncio e CTR esperado). Message match fraco custa duas vezes: o usuário não reconhece a promessa e sai (conversão cai), e a keyword tende a pagar CPC maior pra mesma posição (leilão pior). A skill nunca afirma o QS da conta sem o dado real — pedir as colunas "Índice de qualidade / Exper. na página de destino / Relevância do anúncio / CTR esperado" no nível de keyword.

| Nível | O que espelha | Exemplo |
|-------|---------------|---------|
| **N1 — Lexical** | A keyword aparece literalmente no H1/subheadline | Keyword `consultoria tráfego pago` → H1 contém "consultoria de tráfego pago" |
| **N2 — Promessa** | A *claim* central do anúncio é a mesma da LP (números, prazos, condições idênticos) | Anúncio "Orçamento em 24h" → herói da LP repete "em 24h" (não "rápido") |
| **N3 — Intenção** | A página atende o *job* por trás da busca: comparação recebe comparação, preço recebe preço, urgência recebe caminho curto | Keyword `X ou Y qual melhor` → LP com tabela comparativa, não página de vendas direta |

**Diagnóstico rápido:** N1 falhou → corrigir H1 (horas). N2 falhou → decidir de que lado consertar: ou a LP passa a entregar a promessa, ou o **ad-copywriter** reescreve a RSA (`ad-copy-builder`) — nunca manter promessa que a página não cumpre. N3 falhou → provavelmente é caso de **outra LP**, não de ajuste; levar ao **traffic-strategist** se implicar o plano de mídia.

**Tática avançada (Search):** uma LP por intenção, não por keyword. Ad groups com a mesma intenção compartilham LP; intenções distintas (marca vs. categoria vs. comparação vs. preço) exigem páginas (ou ao menos heróis) distintos. Inserção dinâmica de keyword na LP (via parâmetro de URL) é aceitável só pra variação lexical do H1 — nunca pra trocar a oferta.

---

## 2. Oferta × estágio do funil (temperatura do tráfego)

O erro nº 1 de LP de mídia paga: pedir casamento no primeiro encontro. O pedido tem que caber na temperatura da origem do clique. Cruzar com o `media-plan-builder` quando existir.

| Origem do tráfego | Temperatura | Pedido compatível (CTA) | Pedido que mata conversão |
|---|---|---|---|
| Search marca / remarketing quente | Quente | Compra, contratação, agendamento direto | — |
| Search categoria/fundo (`comprar`, `preço`, `perto de mim`) | Morna-quente | Orçamento, demo, agendamento, compra com redutor de risco | Formulário de 10 campos antes de mostrar preço |
| Search informacional / PMax prospecção | Morna-fria | Diagnóstico, material rico, simulação, teste grátis | "Fale com vendas" sem nada em troca |
| YouTube/Display/Demand Gen frio (video-display-specialist) | Fria | Conteúdo de valor, lista, quiz, oferta de entrada barata | Checkout direto de ticket alto |

**Anatomia de uma oferta forte (usar como gabarito de reescrita):**
1. **Entregável nomeado** — substantivo concreto, não verbo vago ("Plano de mídia gratuito de 12 páginas" > "entre em contato").
2. **Prazo/formato** — quando e como a pessoa recebe.
3. **Redutor de risco** — garantia, sem compromisso, cancelável.
4. **Razão pra agir agora** — só se for verdadeira (vagas/prazo reais). Escassez falsa é achado de integridade e risco de política do Google Ads.

---

## 3. Anatomia seção a seção (wireframe de referência)

```
┌──────────────────────────────────────────────┐
│ [logo]                  [selo/telefone]      │  ← sem menu completo do site
│                                              │
│ H1: promessa = anúncio (N1+N2)               │
│ Sub: como/quanto tempo/sem o quê             │  HERÓI
│ [CTA primário]  [redutor de risco]           │  (D3)
│ [hero shot: produto/resultado/pessoa]        │
├──────────────────────────────────────────────┤
│ Barra de prova rápida: logos / nota / nº     │  (D4.1)
├──────────────────────────────────────────────┤
│ Problema → agitação curta (espelha a dor     │
│ da keyword) → mecanismo/solução              │
├──────────────────────────────────────────────┤
│ 3-4 benefícios em resultado (não feature)    │
│ [CTA repetido]                               │  (D5.4)
├──────────────────────────────────────────────┤
│ Prova profunda: caso/depoimento com nome,    │
│ foto, resultado específico                   │  (D4.2)
├──────────────────────────────────────────────┤
│ Como funciona em 3 passos (reduz incerteza)  │
├──────────────────────────────────────────────┤
│ Oferta completa + redutor de risco +         │
│ FORMULÁRIO (D6) com confiança adjacente      │  (D4.3)
├──────────────────────────────────────────────┤
│ FAQ de objeções (preço, prazo, "funciona     │
│ pra mim?") · rodapé: CNPJ, privacidade       │  (D4.4)
└──────────────────────────────────────────────┘
   Mobile: CTA sticky após a 1ª dobra (D5.4/D7)
```

**Variações por objetivo:**
- **Lead gen B2B/serviço local:** formulário pode subir pro herói (coluna direita no desktop) quando o tráfego é fundo de funil; multi-step quando > 4 campos.
- **E-commerce (LP de produto/coleção):** herói = produto + preço + frete/prazo + CTA de compra; prova = avaliações com volume; seção "como funciona" vira garantias de troca/entrega.
- **Agendamento (clínicas, consultorias):** o calendário/WhatsApp É a conversão — minimizar passos entre CTA e horário escolhido; click-to-call testado (D7.5).

**Fórmulas de headline pra reescrita (preencher com o material do nicho — nunca inventar números do cliente):**
1. *[Resultado desejado] em [prazo/condição] sem [maior objeção]*
2. *O [mecanismo/serviço] que [público] usa pra [resultado]*
3. *[Pergunta que ecoa a keyword]? [Promessa direta]*
4. Espelho literal: repetir a headline vencedora da RSA (quando o ad-copywriter já tem dado de qual headline tem melhor CTR — pedir via `performance-report` se necessário)

---

## 4. Hierarquia de prova social (da mais forte pra mais fraca)

1. **Resultado verificável de cliente nomeado** (caso com números + nome + empresa/foto)
2. **Volume agregado auditável** (nota em plataforma de reviews com link, nº de clientes)
3. **Depoimento específico** (cita a objeção que superou e o resultado)
4. **Autoridade emprestada** (imprensa, certificações, parcerias oficiais)
5. **Selos genéricos** (segurança, "satisfação garantida") — só funcionam adjacentes ao ponto de decisão
6. **Depoimento genérico anônimo** ("Ótimo serviço! — J.") — vale zero na rubrica; substituir, não acumular

Regra de colocação: a prova certa no lugar certo — prova de *resultado* perto da oferta; prova de *processo* perto do "como funciona"; prova de *segurança* colada no formulário/checkout.

---

## 5. Engenharia de velocidade (correções para D2 reprovado)

Ordenado por razão impacto/esforço típica em LP de mídia paga. A medição de antes/depois é sempre via PageSpeed Insights/CrUX da URL exata — nunca declarar ganho sem re-medir.

**LCP (elemento maior da dobra — quase sempre a imagem do herói):**
1. Servir imagem do herói em AVIF/WebP, dimensionada pro viewport real (não 4000 px de largura), com `fetchpriority="high"` e `preload`; **nunca** lazy-load no herói.
2. `font-display: swap` + preload da fonte do H1, ou fonte do sistema no herói.
3. Eliminar CSS/JS bloqueante antes do herói: criticar CSS inline da dobra, `defer` no resto.
4. CDN + cache + compressão (Brotli); TTFB alto com page builder pesado → considerar LP estática dedicada pra mídia.

**INP:** reduzir JS de terceiros que disputa a main thread — chats, heatmaps e pixels carregam **após** interação ou com delay; GTM enxuto (ver abaixo).

**CLS:** `width`/`height` (ou `aspect-ratio`) em toda imagem/embed; espaço reservado pra banners de consentimento e elementos injetados; fontes com fallback metricamente compatível.

**Higiene de GTM/tags (cruza com o gate G e com o tracking-engineer):**
- Inventário de tags: tudo que não tem dono e uso declarado, sai (cada tag morta é INP pago em CPC).
- Um único container; pixels duplicados (gtag + GTM disparando a mesma conversão) = dupla contagem → encaminhar `tracking-blueprint`.
- Consent mode carrega **antes** das tags, com defaults negados (G3).

**Redirects:** URL final do anúncio → LP em zero saltos. Encurtadores e redirects de domínio derrubam gclid (G5) e somam centenas de ms.

---

## 6. Árvore de decisão — diagnóstico pelo sintoma

Usar quando o usuário traz dados da conta (Google Ads/GA4). Sem dados, registrar a lacuna e auditar pela rubrica apenas.

```
CTR do anúncio OK, mas taxa de conversão da LP baixa?
├─ Bounce/saída rápida alta (engajamento GA4 baixo)?
│   ├─ SIM → suspeitos: D1 (message match) e D2 (LCP) — checar matriz + PSI
│   └─ NÃO (a pessoa rola, lê e não converte) → suspeitos: D5 (oferta fraca/
│        pedido grande demais pro estágio) e D4 (falta prova na decisão)
├─ Muita gente inicia o formulário e abandona? (medir form_start vs. submit)
│   └─ SIM → D6: campos demais, erro de validação, quebra no mobile (D7.4)
├─ Converte no desktop e não no mobile?
│   └─ SIM → D7 inteiro + D2 mobile (auditar no device, não no emulador só)
└─ Conversões caíram de repente sem mudança na página?
    └─ Provável quebra de medição (G1/G3/G5) → tracking-engineer ANTES de
       qualquer hipótese de CRO; se a conta toda oscila, considerar
       account-audit (agente account-auditor)
```

---

## 7. Biblioteca de hipóteses recorrentes (adaptar com a evidência local)

Cada entrada já no formato obrigatório — substituir os colchetes pela evidência da auditoria. Métrica primária padrão: taxa de conversão da LP (conversões primárias ÷ cliques); secundárias entre parênteses.

| # | Hipótese | Origem típica |
|---|----------|---------------|
| H1 | Se o H1 passar a espelhar a headline "[headline da RSA]" do ad group [X], então a taxa de conversão vai subir, porque a matriz de message match mostrou ❌ em D1.1/D1.2 pra [keyword] | D1 |
| H2 | Se a imagem do herói for convertida pra AVIF com preload (LCP medido em [valor]s no PSI), então a taxa de conversão mobile vai subir (secundária: LCP ≤ 2,5 s re-medido), porque D2.1 reprovou | D2 |
| H3 | Se o CTA "[texto vago atual]" virar "[verbo + entregável + prazo]", então o CTR do botão e a conversão vão subir, porque D3.3/D5.1 mostraram pedido inespecífico | D3/D5 |
| H4 | Se o formulário cair de [n] pra [n-k] campos (removendo [campos sem uso declarado]), então a taxa de envio vai subir, porque D6.1 reprovou e o funil mostra abandono em form_start | D6 |
| H5 | Se o formulário de [n>4] campos virar multi-step com telefone por último, então a taxa de envio vai subir, porque o custo percebido inicial cai (D6.2) | D6 |
| H6 | Se um bloco de prova "[caso/nota com volume]" for inserido adjacente ao formulário, então a conversão vai subir, porque D4.3 mostrou decisão sem reasseguramento | D4 |
| H7 | Se a oferta ganhar o redutor de risco "[garantia/sem compromisso real]", então a conversão vai subir, porque D5.2 reprovou e o pedido atual transfere todo o risco ao visitante | D5 |
| H8 | Se o menu de navegação completo for removido (mantendo só logo + CTA), então a conversão vai subir, porque D3.5 mostrou rotas de fuga acima da dobra | D3 |
| H9 | Se um CTA sticky for adicionado no mobile após a 1ª dobra, então a conversão mobile vai subir, porque D5.4/D7 mostraram LP longa com CTA distante | D5/D7 |
| H10 | Se a LP do ad group [intenção de comparação] ganhar tabela comparativa própria em vez da página de vendas genérica, então conversão e "exper. na página de destino" vão subir, porque D1.5/N3 reprovaram | D1 |

---

## 8. Desenho do teste (pra hipótese virar experimento honesto)

1. **Uma métrica primária** por teste, definida antes (conversão primária da LP). Secundárias só observacionais.
2. **Tamanho de amostra antes de começar:** calcular com calculadora de teste A/B (informar baseline de conversão e MDE — efeito mínimo detectável — escolhido). **Nunca chutar duração.** Regra prática de viabilidade: pouco tráfego + MDE pequeno = teste impossível; nesse caso, preferir mudanças de correção (❌ da rubrica) em vez de teste formal, medindo antes/depois com janela comparável.
3. **Duração mínima:** ciclos completos de semana (capturar sazonalidade dia-da-semana); não parar no primeiro dia "significativo" (peeking infla falso positivo).
4. **Sem mudanças simultâneas** na mesma página/campanha durante o teste — congelar lances/criativos da campanha que alimenta a LP ou anotar toda mudança; alinhar com **optimization-executor** (`optimization-routine`) pra rotina de otimização não contaminar o experimento.
5. **Registro:** cada teste com data de início/fim, variantes (screenshot), amostra, resultado e decisão (implementar/descartar/re-testar). O **performance-analyst** consome esse registro no `performance-report`.
6. **Ferramenta:** redirect 50/50 com parâmetro distinto, feature flag, ou teste nativo do CMS — desde que a divisão seja aleatória e a medição (gate G) dispare igual nas duas variantes. Validar tags na variante B antes de ligar.

**Critérios de parada e decisão:**
- Atingiu a amostra planejada → ler resultado e decidir.
- Bug ou quebra de medição detectada → abortar, consertar, recomeçar (dados contaminados não se "ajustam").
- Vitória → implementar 100%, re-rodar PSI (mudança visual pode mexer em D2) e registrar o aprendizado pro próximo ciclo do backlog.
