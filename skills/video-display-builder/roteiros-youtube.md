# Roteiros de YouTube Direct-Response — Framework Criativo TráfegoPRO

Arquivo auxiliar da skill `video-display-builder`. Contém: a estrutura direct-response de 5 blocos com timing por duração, biblioteca de hooks preenchíveis, templates de roteiro por formato (bumper 6s, não pulável 15s, in-stream 30–60s, Shorts 9:16, in-feed), matriz mensagem × camada de público, banco de CTAs, specs técnicas de produção, anti-padrões e exemplo completo.

> **Regras transversais:** roteiro é texto estruturado (cena / narração / texto on-screen) — produção audiovisual está fora do escopo. Prova social só com material REAL do cliente; sem prova, escrever `[LACUNA: sem prova social disponível — solicitar ao cliente depoimento/caso/número]` no bloco. Nunca inventar estatística para dar peso ao roteiro: se um dado de mercado fortalecer o argumento, instruir WebSearch com citação de fonte e ano, ou cortar o dado.

---

## 1. Estrutura direct-response de 5 blocos

Todo roteiro de conversão segue esta espinha. O que muda por duração é quanto cabe de cada bloco.

| Bloco | Função | Erro fatal a evitar |
|---|---|---|
| **1. Hook** | Ganhar o direito aos próximos segundos. Nomeia a dor ou o resultado do ICP. | Abrir com logo, vinheta, "olá, eu sou..." ou institucional |
| **2. Problema / agitação** | Tornar concreto o custo de não agir (tempo, dinheiro, risco, frustração) | Agitar dor genérica que não é a do ICP |
| **3. Mecanismo / solução** | Apresentar a oferta E o porquê de funcionar (diferencial). Demonstração visual sempre que possível | Listar features sem traduzir em resultado |
| **4. Prova** | Depoimento, caso, número real, demonstração ao vivo | Inventar prova; prova vaga ("milhares de clientes") |
| **5. CTA** | UMA instrução específica, em áudio + texto na tela | CTA múltiplo ("acesse, siga, inscreva-se e baixe") |

### Timing por duração

| Duração | Hook | Problema | Mecanismo | Prova | CTA |
|---|---|---|---|---|---|
| **6s (bumper)** | 0–2s (fundido com a mensagem única) | — | 2–5s (uma ideia só) | — | 5–6s (on-screen apenas) |
| **15s (não pulável)** | 0–3s | 3–6s | 6–11s | (embutida em 1 frase, se houver) | 11–15s |
| **30s (in-stream)** | 0–5s | 5–10s | 10–20s | 20–25s | 25–30s |
| **60s (in-stream)** | 0–5s | 5–15s | 15–40s | 40–55s | 55–60s |
| **Shorts (≤35s)** | 0–2s (primeiro frame já é o hook) | 2–8s | 8–22s | 22–28s | 28–35s |

**Regra dos 5 segundos (in-stream pulável):** o botão "Pular" aparece aos 5s. Até lá o espectador precisa ter ouvido/visto (a) para quem é o vídeo e (b) por que continuar. Marca pode aparecer cedo (memória de marca para quem pula), mas a ATENÇÃO vai para a dor/resultado, não para o logo.

**Regra do som desligado:** Shorts, in-feed e parte do Display tocam sem áudio. Todo roteiro carrega `texto on-screen` que sustenta a mensagem sozinho (legendas embutidas + cartelas).

---

## 2. Biblioteca de hooks (preenchíveis)

Escolher 2–3 hooks por bateria de roteiros — hooks diferentes = variações de teste reais. `[ICP]` = como o público se descreve; `[DOR]` / `[RESULTADO]` vêm do briefing, do `media-plan-builder` ou do `competitor-recon`.

| # | Padrão | Template | Quando usar |
|---|---|---|---|
| H1 | **Callout direto** | "Se você é [ICP] e ainda [DOR], esse vídeo é pra você." | Público frio; qualifica quem fica |
| H2 | **Pergunta incômoda** | "Quanto o/a [PROBLEMA] já te custou esse mês?" | Dor financeira mensurável |
| H3 | **Contraste antes/depois** | "[SITUAÇÃO RUIM COMUM]. Era assim que [PERSONAGEM] vivia — até [VIRADA]." | Quando há caso real para contar |
| H4 | **Quebra de crença** | "Todo mundo diz que [CRENÇA COMUM]. Tá errado — e te custa caro." | Mercado com mito dominante; diferencial forte |
| H5 | **Demonstração imediata** | [CENA: produto resolvendo o problema em tempo real, sem intro] "Isso levou [TEMPO]." | Produto visual/demonstrável |
| H6 | **Número específico** | "[NÚMERO REAL DO CLIENTE] em [PERÍODO]. Sem [OBJEÇÃO COMUM]." | Só com número real e comprovável do cliente |
| H7 | **Proibição reversa** | "Não [AÇÃO DESEJADA] antes de ver isso." | Remarketing (já conhece a oferta) |
| H8 | **Erro ranqueado** | "O erro nº 1 de quem tenta [OBJETIVO]: [ERRO]." | Conteúdo educativo MOFU; in-feed |
| H9 | **Empatia de espelho** | "Você já tentou [SOLUÇÕES COMUNS QUE FALHAM]. Nada segurou. O motivo é um só." | Público sofisticado, queimado por concorrentes |
| H10 | **Urgência honesta** | "[CONDIÇÃO DA OFERTA] até [DATA REAL]." | Remarketing degrau 1; APENAS com prazo verdadeiro |
| H11 | **POV nativo (Shorts)** | [Texto on-screen estilo criador: "POV: você é [ICP] e descobriu que [REVELAÇÃO]"] | Shorts — estética de conteúdo, não de anúncio |
| H12 | **Custo da inação** | "Cada [PERÍODO] sem resolver [PROBLEMA], você perde [CUSTO CONCRETO]." | BOFU; ticket alto; B2B |

**Critério de escolha:** frio → H1, H2, H4, H8 (contexto primeiro). Morno → H3, H5, H9. Remarketing → H6, H7, H10, H12 (direto à oferta/objeção).

---

## 3. Formato padrão de roteiro

Todo roteiro entregue usa esta tabela de 4 colunas:

```markdown
### Roteiro: [NAMING DO ASSET — ex: ACME_30S_16x9_DOR-PRINCIPAL_V1]
- Formato/duração: ___ · Proporção: ___ · Camada de público: ___ · Hook usado: H_
- Objetivo: ___ · CTA: ___

| Tempo | Cena (o que aparece) | Narração (áudio) | Texto on-screen |
|---|---|---|---|
| 0–5s | | | |
| ... | | | |
```

---

## 4. Templates por formato

### 4.1 Bumper 6s — uma ideia só

O bumper não vende: ele **martela uma única associação** (marca ↔ promessa) em quem já foi impactado. Estruturas que cabem em 6s:

- **Eco de campanha:** repetir a frase-síntese do in-stream 30s ("[PROMESSA EM ≤6 PALAVRAS]. [MARCA].")
- **Prova-relâmpago:** "[NÚMERO REAL]. [MARCA]." (cena: resultado na tela)
- **Lembrete de oferta (remarketing):** "[OFERTA] acaba [DATA]. [MARCA]." — CTA on-screen apenas

```markdown
| Tempo | Cena | Narração | Texto on-screen |
|---|---|---|---|
| 0–2s | [Imagem-símbolo da promessa, marca discreta no canto] | "[FRASE-SÍNTESE — máx. 8 palavras]" | [FRASE-SÍNTESE] |
| 2–5s | [Produto/resultado em 1 plano] | "[COMPLEMENTO — máx. 6 palavras]" | — |
| 5–6s | [Logo + URL curta] | — | [MARCA] · [URL] |
```

### 4.2 In-stream não pulável 15s — mensagem completa garantida

15s não pulável = atenção comprada. Usar para 1 dor + 1 mecanismo + 1 CTA leve (awareness com direção, não DR pesado).

```markdown
| Tempo | Cena | Narração | Texto on-screen |
|---|---|---|---|
| 0–3s | [Cena da dor em ação] | "[HOOK H1/H2/H4 condensado]" | [DOR em 3–5 palavras] |
| 3–6s | [Agitação visual: consequência da dor] | "[CUSTO DE NÃO AGIR em 1 frase]" | — |
| 6–11s | [Produto resolvendo / mecanismo visual] | "[MARCA] faz [MECANISMO] pra você [RESULTADO]." | [MECANISMO — nome próprio se houver] |
| 11–15s | [Logo + LP] | "[CTA único]" | [CTA] · [URL] |
```

### 4.3 In-stream pulável 30s — cavalo de batalha DR

```markdown
| Tempo | Cena | Narração | Texto on-screen |
|---|---|---|---|
| 0–5s | [HOOK visual — sem logo dominante] | "[HOOK escolhido da biblioteca]" | [versão curta do hook] |
| 5–10s | [Dor encenada/ilustrada] | "[AGITAÇÃO: o que a dor custa, concreto]" | [palavra-âncora da dor] |
| 10–20s | [DEMONSTRAÇÃO: produto em uso, telas, processo] | "[MECANISMO + diferencial: por que funciona quando o resto falha]" | [3 bullets de benefício, 1 por vez] |
| 20–25s | [Depoimento real / número real / selo] | "[PROVA — ou [LACUNA: sem prova social disponível]]" | [aspas do depoimento / número] |
| 25–30s | [Cartela final: oferta + logo + URL] | "[CTA único, imperativo, específico]" | [CTA] · [URL] · [condição da oferta se houver] |
```

### 4.4 In-stream pulável 60s — consideração longa / ticket alto

Mesma espinha do 30s com mecanismo e prova expandidos:
- **15–40s (mecanismo):** estrutura "3 passos" ("Funciona assim: 1… 2… 3…") ou "antes/durante/depois". Cada passo com cena própria.
- **40–55s (prova):** 1 caso contado em mini-narrativa (quem era, o que travava, o que mudou, número real) — não empilhar 5 depoimentos rasos.
- Inserir um **re-hook aos ~25–30s** ("E a parte que ninguém te conta…") — retenção cai no meio; o re-hook segura quem ficaria pela metade.

### 4.5 Shorts 9:16 — nativo, não adaptado

Regras específicas:
1. **Primeiro frame é o hook** — texto on-screen grande já no frame 1 (H11 funciona bem).
2. Corte a cada 1,5–3s; câmera "de criador" (handheld, falando direto) supera produção polida na maioria dos nichos — quando o nicho for exceção (luxo, saúde regulada), registrar a decisão.
3. Legendas embutidas palavra a palavra (consumo sem áudio).
4. **Safe zones:** UI do Shorts cobre a faixa direita (botões) e o rodapé (descrição) — manter texto no centro-superior. Margens exatas: `[VALIDAR NA DOCUMENTAÇÃO ATUAL DO GOOGLE/YOUTUBE]`.
5. CTA falado + on-screen; o clique acontece no botão do anúncio, então o CTA verbal manda para o botão ("toca no botão aqui embaixo").

```markdown
| Tempo | Cena | Narração | Texto on-screen |
|---|---|---|---|
| 0–2s | [Criador olhando pra câmera / cena-choque do problema] | "[H11 ou H2]" | [HOOK GRANDE, centro-superior] |
| 2–8s | [Cortes rápidos da dor] | "[agitação coloquial]" | [legenda embutida] |
| 8–22s | [Demonstração crua do produto] | "[mecanismo em linguagem falada]" | [legenda + 1 cartela de benefício] |
| 22–28s | [Prova: print, número, depoimento] | "[prova real ou [LACUNA]]" | [destaque do número] |
| 28–35s | [Criador aponta para baixo/para o botão] | "[CTA: 'toca no botão...']" | [CTA + seta] |
```

### 4.6 In-feed — thumbnail e título são o anúncio

O vídeo só toca depois do clique; o par **thumbnail + título** faz o papel do hook.

**Framework de título (máximos vigentes de caracteres: `[VALIDAR NA DOCUMENTAÇÃO ATUAL DO GOOGLE]`):**
- Padrão curiosidade + utilidade: "[RESULTADO] sem [OBJEÇÃO] — [MECANISMO]"
- Padrão erro: "O erro que [ICP] comete em [TAREFA] (e como corrigir)"
- Proibido: clickbait que o vídeo não paga — mata VTR e a confiança do canal.

**Checklist de thumbnail:**
- [ ] Rosto humano com emoção legível OU resultado visual claro
- [ ] Máx. 4 palavras de texto, legíveis em miniatura de celular
- [ ] Contraste alto; sem poluição de elementos
- [ ] Coerência com o título (complemento, não repetição)

**Estrutura do vídeo in-feed:** quem clicou já demonstrou intenção → pular agitação longa, ir de hook-confirmação ("Você clicou porque [DOR]. Em [DURAÇÃO] eu te mostro [PROMESSA].") direto ao mecanismo, prova e CTA.

---

## 5. Matriz mensagem × camada de público

Uma variação criativa por temperatura é o mínimo. A mesma oferta muda de roupa conforme a camada:

| Camada (do blueprint) | O que o público sabe | Ênfase do roteiro | Hooks | Duração indicada |
|---|---|---|---|---|
| Custom intent / in-market (frio) | Tem o problema, não conhece a marca | Problema + mecanismo (contexto antes de oferta) | H1, H2, H4, H8 | 30–60s |
| Afinidade (frio amplo) | Talvez nem nomeie o problema | Educar a dor; marca como guia | H3, H8 | 15s não pulável + 30s |
| Viewers de vídeo (morno) | Já viu a mensagem 1 | Aprofundar promessa + prova (sequencing passo 2) | H9, H3, H5 | 30–60s |
| Visitantes do site (morno-quente) | Conhece a oferta, não converteu | Prova + diferencial + quebra de objeção | H6, H9, H12 | 15–30s |
| Carrinho/checkout abandonado (quentíssimo) | Quase comprou | Objeção específica + oferta/garantia + urgência honesta | H7, H10, H12 | 15s + bumper 6s |
| Customer Match clientes | Já comprou | Upsell/novidade — NUNCA o anúncio de aquisição | H6, H5 | 15–30s |

---

## 6. Banco de CTAs

CTA único por peça. Escolher pela ação real da LP (coerência CTA ↔ página é requisito de CVR — desvios viram achado do `lp-cro-audit` do `cro-engineer`).

| Ação da LP | CTA verbal | CTA on-screen |
|---|---|---|
| Compra direta | "Garanta o seu em [URL]." | `[URL]` + condição da oferta |
| Lead/orçamento | "Peça seu orçamento gratuito — leva 2 minutos." | `Orçamento grátis → [URL]` |
| Agendamento | "Agende sua avaliação no link." | `Agende: [URL]` |
| Trial/demo | "Teste grátis por [PERÍODO REAL] — sem cartão." (só se for verdade) | `Teste grátis → [URL]` |
| Download/isca | "Baixe o [MATERIAL] gratuito no link." | `Download grátis → [URL]` |
| WhatsApp | "Chama no WhatsApp pelo botão." | `Fale agora → WhatsApp` |

Regras:
1. Verbo imperativo + objeto específico + onde ("no link", "no botão").
2. Remover atrito no próprio CTA quando for verdade ("sem cartão", "leva 2 minutos").
3. Urgência só com condição real (estoque, data, turma) — urgência falsa viola política de Google Ads e queima a conta.

---

## 7. Specs técnicas e checklist de produção

Specs mudam — antes de fechar a bateria, **validar na documentação vigente do Google Ads/YouTube via WebSearch** (citar fonte e ano). Checklist estrutural:

- [ ] Versões por proporção: 16:9 (in-stream), 1:1 (feeds/Display), 9:16 (Shorts/Demand Gen) — adaptar enquadramento, não só cortar
- [ ] Resolução mínima HD; áudio limpo; loudness consistente entre variações
- [ ] Legendas embutidas em TODAS as versões (consumo sem som)
- [ ] Texto on-screen legível em tela de celular (testar em miniatura)
- [ ] Safe zones respeitadas (UI do player/Shorts)
- [ ] Vídeo hospedado no canal do YouTube vinculado à conta (público ou não listado, conforme estratégia do canal)
- [ ] Naming do asset conforme convenção do `blueprint-video.md` (seção 3)
- [ ] Direitos de uso: música licenciada, imagens próprias/licenciadas, depoimentos com autorização
- [ ] Conformidade de política: sem claims de resultado garantido, sem alegações de saúde/financeiras restritas, sem urgência falsa — em nicho regulado (saúde, finanças, jurídico), validar a política específica vigente via WebSearch antes de rodar

---

## 8. Anti-padrões (revisão obrigatória antes da entrega)

1. **Logo-primeiro:** vinheta institucional nos primeiros 5s = pulo garantido.
2. **Roteiro de TV:** linguagem publicitária genérica ("há 20 anos no mercado…") não é direct-response.
3. **Feature-dump:** lista de características sem tradução em resultado para o ICP.
4. **Prova inventada ou vaga:** "milhares de clientes satisfeitos" sem nome/número real → substituir por `[LACUNA]` e pedir material.
5. **CTA múltiplo:** cada ação adicional divide a taxa de clique da principal.
6. **Mesmo criativo para frio e quente:** ignora a matriz da seção 5.
7. **16:9 cortado para 9:16:** enquadramento errado, texto fora da safe zone — Shorts exige versão nativa.
8. **Estatística decorativa:** número de mercado sem fonte → cortar ou pesquisar com citação.
9. **Hook que não paga:** prometer no hook o que o vídeo não entrega derruba retenção e confiança (e VTR cai — sinal de fadiga falso).
10. **Urgência falsa:** além de antiético, é risco de reprovação/suspensão por política.

---

## 9. Exemplo completo (fictício, para calibrar nível de detalhe)

Cliente-exemplo: clínica odontológica "SorrirBem" (lead = agendamento de avaliação). **Exemplo ilustrativo — nunca copiar dados dele para um cliente real.**

### Roteiro: SORRIRBEM_30S_16x9_MEDO-DENTISTA_V1
- Formato/duração: in-stream pulável 30s · Proporção: 16:9 · Camada: custom intent "implante dentário" · Hook: H9
- Objetivo: agendamento de avaliação · CTA: "Agende sua avaliação no link."

| Tempo | Cena | Narração | Texto on-screen |
|---|---|---|---|
| 0–5s | Paciente em casa, cobrindo a boca ao rir em foto de família | "Você já adiou o implante umas três vezes. Não foi pelo preço — foi pelo medo." | "Adiando o implante?" |
| 5–10s | Close: calendário com consultas remarcadas; expressão de desconforto | "E cada ano adiado é mastigação pior, osso que reabsorve e um tratamento mais longo depois." | "Adiar custa caro" |
| 10–20s | Dentista mostrando planejamento digital na tela; paciente tranquilo na cadeira | "Na SorrirBem, o planejamento é digital e a sedação consciente faz você passar pela cirurgia sem o pânico de antes. Você vê o resultado simulado antes de decidir." | "Planejamento digital" → "Sedação consciente" → "Simulação antes de decidir" |
| 20–25s | Depoimento real em vídeo da paciente [NOME], sorrindo | "[Trecho real do depoimento — [LACUNA: solicitar depoimento autorizado à clínica]]" | "[Nome], paciente desde [ano]" |
| 25–30s | Cartela: logo + botão + endereço do site | "Agende sua avaliação no link. A primeira conversa é só pra você entender suas opções." | "Agende sua avaliação → sorrirbem.com.br/avaliacao" |

Variações derivadas (mesma lógica, entregues junto):
- `SORRIRBEM_6S_16x9_ECO_V1` — bumper eco: "Implante sem pânico. SorrirBem." (frequência sobre viewers)
- `SORRIRBEM_15S_16x9_OBJECAO-PRECO_V1` — remarketing visitantes da página de preços: H12 + parcelamento real + CTA
- `SORRIRBEM_30S_9x16_POV_V1` — Shorts nativo: H11 "POV: você descobriu que dá pra fazer implante dormindo tranquilo" com legendas embutidas

---

## 10. Checklist de entrega da bateria de roteiros

- [ ] Mínimo 2 ângulos distintos por camada de público atendida (variações de teste reais, não cosméticas)
- [ ] Toda duração/proporção exigida pelo blueprint coberta
- [ ] Cada roteiro com cabeçalho completo (naming, formato, camada, hook, CTA)
- [ ] Hooks variados (não repetir o mesmo padrão em todas as peças)
- [ ] Blocos de prova com material real ou `[LACUNA]` declarada
- [ ] CTA único e coerente com a ação da LP
- [ ] Texto on-screen sustenta a mensagem sem áudio
- [ ] Anti-padrões da seção 8 revisados peça a peça
- [ ] Handoff: tabela de criativos do blueprint (`blueprint-video.md`, template seção 15, bloco 6) preenchida com status de cada peça
