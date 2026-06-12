# Banco de Ângulos — TráfegoPRO

Repertório de ângulos de copy por estágio de consciência. Usado pela skill `ad-copy-builder` (agente `ad-copywriter`). Um **ângulo** é o argumento central de uma peça — a razão pela qual o público deveria se importar. A escolha do ângulo vem **antes** da escrita: ângulo errado com texto bonito ainda é anúncio errado.

---

## 1. Os 5 estágios de consciência (Eugene Schwartz, adaptado a Google Ads)

| Estágio | O público sabe... | Sinal típico no Google Ads | Quem traz o sinal |
|---|---|---|---|
| 1. Inconsciente | Nada — não percebe o problema | Audiências de Display/Video, PMax topo, interesses | `video-display-specialist`, `pmax-specialist` |
| 2. Consciente do problema | Que tem uma dor, não que há solução | Buscas de sintoma/dor ("por que X acontece") | `keyword-research` (intenção informacional) |
| 3. Consciente da solução | Que existe uma categoria de solução | Buscas genéricas da categoria ("software de X", "clínica de Y") | `keyword-research` (genéricas, meio de funil) |
| 4. Consciente do produto | Que o anunciante/produto existe | Buscas de marca, comparativas ("X vs Y", "X é bom") | `keyword-research` + `competitor-recon` |
| 5. Totalmente consciente | Só falta o empurrão | Marca + termo transacional ("comprar", "preço", "cupom") | `keyword-research` (transacionais) |

**Regra de ouro:** a copy fala com o estágio em que a pessoa **está**, não com o estágio em que o anunciante gostaria que ela estivesse. Vender oferta para quem está no estágio 2 queima clique; explicar o problema para quem está no estágio 5 perde a venda.

### Mapeamento estágio → campanha → ângulo dominante → CTA

| Estágio | Campanha/segmento típico | Ângulo dominante | Família de CTA (ver `frameworks-copy.md` §6) |
|---|---|---|---|
| 1–2 (topo) | Display, Video, PMax de descoberta | Dor nomeada, Custo da inação, Novidade | Informacional |
| 3 (meio) | Search genérica (phrase/broad com bons sinais), PMax | Mecanismo, Comparação, Sem-fricção | Informacional/Comparativa |
| 4 (meio-fundo) | Search comparativa, remarketing | Diferencial, Prova, Objeção invertida | Comparativa |
| 5 (fundo) | Search marca + transacional (exact/phrase) | Oferta, Redução de risco, Urgência legítima | Transacional/Local |

Se a sub-issue não informar o estágio: inferir pela intenção das keywords (tabela acima) e **registrar a inferência** no artefato.

---

## 2. Biblioteca de ângulos

Formato de cada ângulo: quando usar · fórmula · exemplo de estrutura · risco de política. Os exemplos usam colchetes `[ ]` para dados que **devem vir do briefing** — nunca preencher com número inventado.

### A1 — Dor nomeada
- **Quando:** estágios 1–2. A pessoa se reconhece antes de conhecer a solução.
- **Fórmula:** nomear a dor específica com as palavras do público (usar achados do `market-intel` e do `keyword-research`).
- **Estrutura headline:** `Cansado de [dor específica]?` · `[Dor] de novo este mês?`
- **Estrutura description:** `[Dor] tem causa conhecida e solução prática. Veja como funciona.`
- **Risco:** em saúde, nomear condição médica do usuário pode violar política de personalização — ver §6.

### A2 — Custo da inação
- **Quando:** estágios 2–3. Quantifica o que se perde ao não agir.
- **Fórmula:** `Não resolver [problema] custa [consequência]`.
- **Risco:** a consequência precisa ser verificável ou genérica; número de perda inventado é Misrepresentation. Sem dado do briefing → versão qualitativa ("custa caro todo mês") ou declarar lacuna.

### A3 — Mecanismo
- **Quando:** estágio 3. Diferencia numa categoria comoditizada explicando o "como".
- **Fórmula:** `[Resultado] com [nome do mecanismo/método]`.
- **Estrutura:** headline `[Categoria] com [mecanismo]`; description explica o mecanismo em 1 frase + por que importa.
- **Risco:** baixo. Mecanismo precisa existir de verdade (vem do briefing ou do `competitor-recon` como gap dos concorrentes).

### A4 — Comparação / "sem-fricção"
- **Quando:** estágios 3–4. Posiciona contra a alternativa comum (não necessariamente um concorrente nomeado).
- **Fórmula:** `[Resultado] sem [obstáculo da alternativa]` · `Tudo de [categoria], sem [dor da categoria]`.
- **Risco:** nomear concorrente = trademark → escalar para decisão humana sempre (regra do `frameworks-copy.md` §8.3). Comparar contra "o jeito antigo" é seguro.

### A5 — Prova / autoridade
- **Quando:** estágios 3–5. Reduz incerteza com evidência.
- **Fórmula:** `[Número fornecido] de [unidade de prova]` · `[Credencial real]`.
- **Estrutura:** `+[N] clientes atendidos`, `Desde [ano]`, `Nota [X] no [plataforma]`.
- **Risco:** ALTO se o número não tiver fonte. Regra absoluta: prova só com dado do briefing, fonte anotada na seção Compliance. Sem dado → usar A3 ou A6 no lugar e declarar: *"Dado não disponível — necessário pesquisa adicional ou input do usuário."*

### A6 — Redução de risco
- **Quando:** estágios 4–5. Remove o medo de errar na decisão.
- **Fórmula:** `[Garantia/condição real]` — garantia de devolução, teste grátis, sem fidelidade, primeira avaliação sem custo.
- **Risco:** a condição precisa existir contratualmente. "Garantia" sem garantia formal = Misrepresentation.

### A7 — Velocidade / conveniência
- **Quando:** estágios 3–5, especialmente serviços locais e e-commerce.
- **Fórmula:** `[Resultado] em [prazo real]` · `[Ação] em poucos cliques` · `Atendimento no mesmo dia` (se for verdade).
- **Risco:** prazo prometido = prazo cumprível; confirmar no briefing.

### A8 — Oferta / preço
- **Quando:** estágio 5. Só com oferta real.
- **Fórmula:** `[Produto] por [preço real]` · `[X]% off até [data real]` (combinável com countdown — `frameworks-copy.md` §5).
- **Risco:** preço do anúncio ≠ preço da página é reprovação + quebra de confiança. Validar message match com o `cro-engineer` (`lp-cro-audit`).

### A9 — Especificidade local
- **Quando:** serviço local, qualquer estágio. Cidade/bairro no texto aumenta relevância percebida.
- **Fórmula:** `[Serviço] em [cidade/bairro]` · `Atendemos [região]`.
- **Risco:** anunciar cobertura inexistente. Cobertura real vem do briefing; com multi-cidade, considerar `{LOCATION(City)}`.

### A10 — Objeção invertida
- **Quando:** estágios 4–5. Ataca de frente a objeção nº 1 (mapeada pelo `market-intel` ou pelo briefing).
- **Fórmula:** `[Objeção]? [Resposta curta]` — ex. de estrutura: `Acha caro? Veja o que está incluso` · `Sem tempo? Resolvemos online`.
- **Risco:** baixo; a resposta precisa ser sustentada na LP.

### A11 — Novidade / atualização
- **Quando:** estágios 1–3, lançamentos e categorias em mudança (regulatória, tecnológica).
- **Fórmula:** `Novo: [mudança relevante]` · `[Categoria] mudou em [ano]. Veja o que fazer`.
- **Risco:** "novo" tem que ser novo; mudança citada tem que ser real e datada (pesquisar e citar fonte se for fato de mercado).

### A12 — Status / identidade
- **Quando:** estágios 1–3, produtos aspiracionais e B2B de posicionamento.
- **Fórmula:** `Para [identidade do público] que [padrão de exigência]` — ex. de estrutura: `Para clínicas que não param de crescer`.
- **Risco:** em verticais sensíveis, segmentar por identidade pode esbarrar em política de categorias restritas de personalização — ver §6.

---

## 3. Ângulos por objeção comum

Usar quando o briefing ou o `market-intel` trouxer a objeção dominante do público:

| Objeção | Ângulos recomendados | Slot sugerido |
|---|---|---|
| "É caro" | A10 (valor incluso), A2 (custo da inação), A8 (condição de pagamento real) | D3 + 1 headline de diferencial |
| "Não confio / não conheço" | A5 (prova com fonte), A6 (garantia), A9 (presença local) | D3 + headlines de prova |
| "Não tenho tempo" | A7 (velocidade), A10 ("resolvemos online") | Headlines de benefício |
| "É complicado" | A3 (mecanismo simples), A7 (poucos passos) | D2 |
| "Já tentei e não funcionou" | A3 (mecanismo diferente), A4 (sem o obstáculo anterior) | D2 + D3 |
| "Posso fazer sozinho / mais barato" | A2 (custo do erro), A4 (sem fricção) | D3 |

---

## 4. Árvore de seleção de ângulos por grupo de anúncio

```
1. Qual o estágio de consciência do grupo? (keywords → tabela §1)
2. O briefing tem prova verificável (número, prêmio, nota)?
   ├─ SIM → incluir A5 entre os ângulos.
   └─ NÃO → registrar a lacuna; substituir por A3 ou A6.
3. Existe oferta real com prazo/condição?
   ├─ SIM → A8 entra (fundo de funil) + urgência legítima permitida.
   └─ NÃO → zero urgência; reforçar benefício/mecanismo.
4. Existe objeção dominante mapeada?
   ├─ SIM → reservar D3 e 1 headline para A10/tabela §3.
   └─ NÃO → D3 vira prova ou redução de risco.
5. É serviço local? → A9 obrigatório em pelo menos 1 headline + path.
6. Vertical restrita? → aplicar filtros do §6 ANTES de escrever.
RESULTADO: 2–3 ângulos selecionados por RSA (nunca os 12 de uma vez —
RSA com ângulo de menos é genérica; com ângulo demais é ruído).
```

---

## 5. Matriz de teste de ângulos (alimenta o eixo A/B do `frameworks-copy.md` §7)

Pares de teste com maior potencial de aprendizado — escolher **um** por rodada:

| Controle | Desafiante | O que o resultado ensina |
|---|---|---|
| Benefício (A1/A7) | Prova (A5) | O público decide por ganho ou por confiança? |
| Mecanismo (A3) | Oferta (A8) | Diferenciação vale mais que preço neste estágio? |
| CTA informacional | CTA transacional | O grupo está mais acima ou abaixo no funil do que o assumido? |
| Sem urgência | Urgência legítima (A8 + countdown) | Prazo real mexe com a taxa de conversão? |
| Genérico | Local (A9) | Cidade no texto muda CTR? |

O resultado lido pelo `performance-analyst` realimenta este banco: ângulo vencedor vira controle da próxima rodada (registrar no artefato qual ângulo venceu e em qual conta/segmento).

---

## 6. Adaptações por vertical restrita

Antes de escrever em vertical restrita, **pesquisar a política vigente** na documentação oficial do Google Ads (support.google.com/adspolicy) e citar URL + data no artefato — este documento orienta o ângulo, não substitui a política.

| Vertical | Ângulos a evitar/adaptar | Direção segura |
|---|---|---|
| Saúde / clínicas / emagrecimento | A1 dirigido à condição do usuário ("Você tem [doença]?"), promessa de cura/resultado físico, antes-e-depois textual | Falar do serviço e da clínica (A3, A9, A6 com condição real), não do estado de saúde do leitor |
| Finanças / crédito | A8 com taxa sem divulgação completa, A5 com promessa de retorno | A3 (como funciona), A6 (sem tarifa de abertura, se real), verificar exigências de divulgação vigentes no Brasil |
| Jurídico | A5 com promessa de êxito ("ganhe sua causa") | A3 (como o processo funciona), A9, A7 (atendimento rápido) — observar também as regras publicitárias da OAB (pesquisar versão vigente) |
| Educação | A5 com promessa de emprego/renda garantida | A3 (método), A5 apenas com dados institucionais verificáveis |
| Jogos/apostas, álcool, política, adulto | Política específica com certificação prévia — não escrever antes de confirmar elegibilidade | Escalar para decisão humana com a política citada |

Qualquer dúvida sobre se um ângulo passa na política → marcar o ativo como "risco" na seção Compliance e escalar; nunca apostar na aprovação.

---

## 7. Exemplo completo de aplicação (estrutura, com placeholders)

Cenário marcado como exemplo didático — **todos os colchetes devem ser substituídos por dados reais do briefing; nada aqui é benchmark**.

> Grupo de anúncio: "[serviço] + [cidade]" (estágio 5, transacional, serviço local).
> Ângulos selecionados pela árvore §4: A9 (local) + A6 (redução de risco, pois briefing confirma "[condição de garantia real]") + A8 (oferta "[oferta real]" até "[data real]").
>
> - H-keyword: `[Serviço] em [Cidade]` (contar caracteres)
> - H-benefício: `[Resultado principal] sem [obstáculo]`
> - H-prova: `[N fornecido] [unidade de prova]` — se [N] não veio no briefing: *"Dado não disponível — necessário input do usuário"* e usar A6 no lugar
> - H-CTA: `Agende sua avaliação`
> - H-urgência: `[Oferta real] até [data real]` (apenas porque a oferta existe; caso contrário, omitir)
> - D4: `[Oferta real]. Agende pelo site ou chame no WhatsApp.` (CTA dominante repetido)
> - Paths: `/[serviço]` + `/[cidade]`
> - Pin: nenhum (não há disclaimer legal nem marca obrigatória — árvore do `frameworks-copy.md` §4)
> - Teste A/B: RSA-B troca o eixo "oferta" por "prova" — hipótese: *"Se a RSA liderar com prova em vez de oferta, a taxa de conversão melhora, porque o público local decide por confiança."*
