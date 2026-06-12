# Checklist CRO — Rubrica de Score 0-100 para LP de Tráfego Pago

> Arquivo auxiliar da skill `lp-cro-audit` (agente **cro-engineer**, TráfegoPRO).
> Uso: percorrer TODOS os itens da(s) dimensão(ões) do modo escolhido, marcar ✅ (atende) / ⚠️ (parcial, metade dos pontos) / ❌ (não atende, zero) / N/A (redistribuir pontos proporcionalmente dentro da dimensão), com **evidência de 1 linha por item**. Nunca pontuar sem evidência.

---

## 1. Tabela de pesos

| # | Dimensão | Peso | Coberta no modo Express? |
|---|----------|------|--------------------------|
| D1 | Message match anúncio → página | 20 | ✅ |
| D2 | Velocidade & Core Web Vitals | 20 | ✅ |
| D3 | Herói (above the fold) | 15 | ✅ |
| D4 | Prova social & confiança | 10 | — |
| D5 | Oferta & CTA | 15 | — |
| D6 | Formulário & fricção | 10 | — |
| D7 | Mobile | 10 | — |
| **Total** | | **100** | Express = 55 pts brutos, normalizar ×(100/55) |

**Gate de medição (G):** não pontua — é um *gate*. Qualquer item G reprovado:
- **Modo pré-voo:** veredito automático **REPROVADA**.
- **Modos express/completa:** o score final é exibido com selo **"NÃO CONFIÁVEL — medição quebrada"** e fica limitado (cap) a **49/100**, porque nenhuma otimização é verificável sem medição.

**Faixas de interpretação do score:**

| Score | Leitura | Ação padrão |
|-------|---------|-------------|
| 85-100 | LP madura | Entrar em regime de testes iterativos (backlog ICE) |
| 70-84 | Boa, com vazamentos | Corrigir ❌ de D1/D2/D5 antes de escalar verba |
| 50-69 | Vazando conversão | Pausar escala; sprint de correções antes de novos testes |
| 0-49 | Crítica | Não escalar mídia; reconstruir seções reprovadas (ver `anatomia-lp-performance.md`) |

---

## 2. Gate de medição (G) — verificar PRIMEIRO

| Item | Como verificar | Veredito |
|------|----------------|----------|
| G1. A conversão primária da LP tem tag disparando, verificada | Tag Assistant / aba de diagnóstico de conversões no Google Ads / evento visível no GA4 DebugView ao completar a conversão de teste | Bloqueador se ❌ |
| G2. A conversão usada como meta de lance é a primária (não pageview, não clique em botão sem sucesso confirmado) | Conferir coluna "Conversões" e ação de conversão marcada como primária na conta | Bloqueador se ❌ |
| G3. Consent mode implementado (mercados com CMP/LGPD-GDPR aplicável): estados default negados antes do consentimento para `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage`; atualização após aceite | Inspecionar dataLayer / relatório do CMP; perguntar ao tracking-engineer se houver `tracking-blueprint` | Bloqueador se exigível e ❌ |
| G4. Enhanced conversions ativas para a ação primária (lead/compra com e-mail ou telefone capturável) | Configuração da ação de conversão no Google Ads + tag enviando dado hasheado | ⚠️ recomendação forte; bloqueador apenas no pré-voo de campanhas de lead |
| G5. Parâmetros de atribuição chegam à página (gclid/wbraid presentes; nenhum redirect intermediário os descarta) | Clicar no anúncio (ou simular URL final com parâmetros) e conferir a URL de chegada | Bloqueador se ❌ |
| G6. Página de sucesso/evento de sucesso distinto (não dispara na própria LP) | Conferir trigger da tag | Bloqueador se ❌ |

> Se a skill não tiver como verificar G1-G6 diretamente, **perguntar ao usuário** e/ou encaminhar ao **tracking-engineer** (`tracking-blueprint`). Item não verificável = lacuna declarada, nunca "assumido ok".

---

## 3. D1 — Message match anúncio → página (20 pts)

Avaliar **por ad group** (Search) ou **por asset group** (PMax), usando a matriz da seção 9. Fonte dos anúncios: output do `ad-copy-builder` ou os anúncios reais da conta.

| Item | Pts | Critério de ✅ |
|------|-----|----------------|
| D1.1 Espelhamento de headline | 5 | O H1 da LP repete ou parafraseia diretamente a headline do anúncio dominante do ad group (mesma promessa, mesmos termos-chave) |
| D1.2 Continuidade da keyword | 4 | A keyword (ou tema do asset group) aparece no H1 ou subheadline visível sem rolar |
| D1.3 Continuidade da oferta | 4 | Preço, desconto, bônus ou condição prometida no anúncio aparece na LP exatamente igual (mesmo número, mesmo prazo) |
| D1.4 Continuidade visual | 2 | Se o anúncio é visual (Display/Demand Gen/YouTube via video-display-specialist), a LP mantém identidade (cores, produto, pessoa) |
| D1.5 Um destino por intenção | 3 | Ad groups de intenções diferentes não apontam pra mesma LP genérica (ex.: keyword de marca e keyword de categoria caindo na home) |
| D1.6 Sinal de Quality Score | 2 | Coluna "Experiência na página de destino" das keywords que apontam pra essa LP ≠ "Abaixo da média" (pedir ao usuário o dado da conta; se indisponível, lacuna declarada e pontos redistribuídos) |

**Regra de ouro:** message match não é "a página fala do assunto" — é o usuário reler na LP a promessa exata em que clicou, em até 5 segundos.

---

## 4. D2 — Velocidade & Core Web Vitals (20 pts)

Fonte obrigatória: PageSpeed Insights (pagespeed.web.dev) ou CrUX para a **URL exata** da LP, **mobile** (desktop é secundário — a maior parte do tráfego pago é mobile; confirmar split com o usuário). Limiares "bom" são os publicados pelo Google: **LCP ≤ 2,5 s · INP ≤ 200 ms · CLS ≤ 0,1**. Sem medição real → dimensão inteira vira lacuna declarada com nota provisória 0 e instrução de como medir.

| Item | Pts | Critério de ✅ |
|------|-----|----------------|
| D2.1 LCP mobile | 6 | ≤ 2,5 s (⚠️ se 2,5-4,0 s; ❌ se > 4,0 s) |
| D2.2 INP mobile | 4 | ≤ 200 ms (⚠️ se 200-500 ms; ❌ se > 500 ms) |
| D2.3 CLS mobile | 3 | ≤ 0,1 (⚠️ se 0,1-0,25; ❌ se > 0,25) |
| D2.4 Peso de terceiros | 3 | Auditoria do PSI sem alerta crítico de scripts de terceiros bloqueando renderização (GTM inchado, chats, pixels duplicados) |
| D2.5 Sem redirects na URL final | 2 | URL final do anúncio chega à LP em 0 redirects (cada salto soma latência e pode derrubar parâmetros — ver G5) |
| D2.6 Renderização do herói | 2 | H1 e CTA visíveis no primeiro paint, sem depender de JS pesado/fontes bloqueantes |

> **LCP mobile reprovado (❌ em D2.1) é bloqueador no modo pré-voo.** Correções técnicas: ver seção "Engenharia de velocidade" em `anatomia-lp-performance.md`.

---

## 5. D3 — Herói / above the fold (15 pts)

| Item | Pts | Critério de ✅ |
|------|-----|----------------|
| D3.1 Headline com proposta de valor específica | 4 | Diz O QUE, PRA QUEM e o RESULTADO/diferencial — passaria no "teste dos 5 segundos" (alguém de fora explica o que a página vende) |
| D3.2 Subheadline de suporte | 2 | Resolve a objeção nº 1 ou concretiza a promessa (como/em quanto tempo/sem o quê) |
| D3.3 CTA primário visível sem rolar | 3 | Botão com verbo de ação específico (não "Enviar"/"Saiba mais"), contraste evidente |
| D3.4 Hero shot relevante | 2 | Imagem/vídeo mostra o produto/resultado/pessoa-alvo — não banco de imagem genérico |
| D3.5 Um único objetivo acima da dobra | 2 | Sem CTAs concorrentes, sem menu de navegação completo do site (LP de mídia paga ≠ página institucional) |
| D3.6 Clareza imediata de quem é a empresa | 2 | Logo + (se aplicável) selo/qualificador de credibilidade no topo |

---

## 6. D4 — Prova social & confiança (10 pts)

| Item | Pts | Critério de ✅ |
|------|-----|----------------|
| D4.1 Prova específica e verificável | 3 | Depoimento com nome + foto/empresa/cargo, ou número auditável (clientes, avaliações) — nunca depoimento anônimo genérico |
| D4.2 Prova alinhada à objeção do estágio | 3 | A prova responde a dúvida do público daquela campanha (ver hierarquia de provas em `anatomia-lp-performance.md`) |
| D4.3 Prova próxima do ponto de decisão | 2 | Há elemento de confiança adjacente ao formulário/checkout (selo, garantia, micro-depoimento) |
| D4.4 Sinais de legitimidade | 2 | CNPJ/endereço/política de privacidade acessíveis; HTTPS; sem promessas que violariam as políticas do Google Ads (claims médicos/financeiros enganosos — risco de reprovação do anúncio) |

---

## 7. D5 — Oferta & CTA (15 pts)

| Item | Pts | Critério de ✅ |
|------|-----|----------------|
| D5.1 Oferta nomeada e concreta | 4 | O visitante sabe exatamente o que recebe ao converter (diagnóstico gratuito de X, orçamento em Y horas, 1ª sessão por R$ Z) |
| D5.2 Redutor de risco | 3 | Garantia, teste grátis, "sem compromisso", cancelamento fácil — explícito perto do CTA |
| D5.3 Urgência/escassez honesta | 2 | Se existir, é real e específica (vagas, prazo); contador falso = ❌ e achado de integridade |
| D5.4 CTA repetido em pontos de decisão | 3 | CTA reaparece após blocos de prova e de oferta; em LPs longas, CTA fixo (sticky) no mobile |
| D5.5 Coerência com o estágio do funil | 3 | Pedido compatível com a temperatura do tráfego (ver tabela de oferta × estágio em `anatomia-lp-performance.md`); checar `media-plan-builder` se disponível |

---

## 8. D6 — Formulário & fricção (10 pts)

| Item | Pts | Critério de ✅ |
|------|-----|----------------|
| D6.1 Só campos que serão usados | 3 | Cada campo tem uso declarado no processo comercial; campo "como nos conheceu" em LP de mídia paga = ❌ |
| D6.2 Formato adequado ao tamanho | 2 | >4 campos → multi-step com o dado fácil primeiro e o sensível (telefone) por último |
| D6.3 UX de preenchimento | 2 | Labels visíveis (não só placeholder), teclado correto no mobile (numérico p/ telefone), máscara, validação inline com mensagem útil |
| D6.4 Pós-clique claro | 2 | Estado de carregamento no botão + página/tela de sucesso que confirma o próximo passo (e dispara G6) |
| D6.5 Alternativa de conversão secundária discreta | 1 | Quando fizer sentido (ex.: WhatsApp), sem competir visualmente com a primária |

---

## 9. D7 — Mobile (10 pts)

| Item | Pts | Critério de ✅ |
|------|-----|----------------|
| D7.1 Herói íntegro na dobra mobile | 3 | H1 + CTA visíveis em viewport ~360-390 px sem rolar; sem texto cortado |
| D7.2 Alvos de toque | 2 | Botões/links ≥ ~44 px de altura, espaçados; nada clicável colado em outro clicável |
| D7.3 Sem interstitials intrusivos | 2 | Nenhum pop-up cobrindo o conteúdo na entrada (além de penalizar UX, fere diretriz do Google) |
| D7.4 Formulário utilizável com uma mão | 2 | Campos em coluna única, fonte ≥ 16 px (evita zoom forçado no iOS) |
| D7.5 Click-to-call/WhatsApp funcional | 1 | Se a conversão envolve contato, o link `tel:`/`wa.me` funciona e dispara evento |

---

## 10. Matriz de message match (preencher no relatório)

| Ad group / Asset group | Keyword ou tema (match type) | Headline dominante do anúncio | H1 da LP | Oferta no anúncio | Oferta na LP | Match? |
|---|---|---|---|---|---|---|
| ex.: ag-search-[produto]-exata | [keyword] (exata) | "..." | "..." | "..." | "..." | ✅/⚠️/❌ |

Preencher uma linha por ad group que aponta pra LP auditada. ❌ em qualquer linha gera hipótese obrigatória no backlog (corrigir do lado da LP **ou** do anúncio — neste caso, encaminhar ao **ad-copywriter**).

---

## 11. Priorização ICE do backlog

Cada hipótese recebe 3 notas de 1-5; **Score ICE = I × C × E** (máx. 125). Ordenar decrescente.

| Nota | Impacto (I) | Confiança (C) | Esforço invertido (E) |
|------|-------------|----------------|------------------------|
| 5 | Afeta 100% do tráfego pago em elemento de decisão (herói, oferta, LCP) | Evidência direta da auditoria + padrão recorrente documentado | Texto/imagem — horas, sem dev |
| 3 | Afeta parte do tráfego ou elemento de suporte (prova, seção do meio) | Evidência indireta (heurística da rubrica, sem dado comportamental) | Precisa de dev/design — dias |
| 1 | Elemento periférico (rodapé, microcopy menor) | Palpite sem evidência → **não entra no backlog** (regra 4 da skill) | Reestruturação da página — semanas |

**Regras de fila:**
1. Bloqueadores G antes de tudo (não são "testes", são consertos).
2. Correções de ❌ em D1/D2 vêm antes de testes criativos — message match e velocidade são multiplicadores de todo o resto.
3. Um teste por vez por página, salvo tráfego suficiente pra variantes simultâneas (ver desenho de teste em `anatomia-lp-performance.md`).

**Formato obrigatório da hipótese:**
> *"Se [mudança específica], então [métrica primária] vai [subir/cair ~direção], porque [racional ancorado em evidência da auditoria — item da rubrica + o que foi observado]."*

---

## 12. Template do relatório final (`lp-cro-audit-<slug>.md`)

```markdown
# Auditoria CRO — [nome/URL da LP]
Data: [AAAA-MM-DD] · Modo: [express|completa|pre-voo] · Auditor: cro-engineer (TráfegoPRO)

## 1. Score
| Dimensão | Pts obtidos | Peso | Notas |
|---|---|---|---|
| D1 Message match | x | 20 | |
| D2 Velocidade/CWV | x | 20 | |
| D3 Herói | x | 15 | |
| D4 Prova & confiança | x | 10 | |
| D5 Oferta & CTA | x | 15 | |
| D6 Formulário | x | 10 | |
| D7 Mobile | x | 10 | |
| **TOTAL** | **x** | **100** | [selo "NÃO CONFIÁVEL" se gate G reprovado] |

Veredito: [faixa + leitura] · [Pré-voo: APROVADA / APROVADA COM RESSALVAS / REPROVADA + bloqueadores]

## 2. Gate de medição
[G1-G6 com ✅/❌/lacuna + evidência]

## 3. Diagnóstico por dimensão
[Itens ⚠️/❌ com evidência de 1 linha cada; matriz de message match preenchida]

## 4. Backlog de hipóteses (ICE)
| # | Hipótese (Se→então→porque) | Dimensão | I | C | E | ICE | Métrica primária | Dono |
|---|---|---|---|---|---|---|---|---|

## 5. Lacunas declaradas
[Dado faltante → como obter → quem pode obter]

## 6. Encaminhamentos
- tracking-engineer (`tracking-blueprint`): [...]
- ad-copywriter (`ad-copy-builder`): [...]
- optimization-executor (`optimization-routine`): [...]
- performance-analyst (`performance-report`): [...]
```
