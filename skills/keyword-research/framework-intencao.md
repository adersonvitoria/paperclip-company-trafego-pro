# Framework de Intenção de Busca — TráfegoPRO

Documento operacional da skill `keyword-research` (agente **market-intel**). Define como expandir seeds, classificar cada termo por intenção, e converter intenção em decisão de estrutura: match type, estratégia de lance, estágio de funil e negativação.

---

## 1. As 4 intenções e o que fazer com cada uma

| Intenção | O que o usuário quer | Sinais típicos (PT-BR) | Estágio de funil | Tratamento padrão em Search |
|---|---|---|---|---|
| **Transacional** | Comprar/contratar AGORA | "comprar", "contratar", "orçamento", "preço de", "valor", "promoção", "cupom", "perto de mim", "urgente", "24 horas", "agendar" | Fundo (BOFU) | Campanha própria, maior prioridade de lance, exact/phrase |
| **Comercial (investigação)** | Comparar antes de decidir | "melhor", "top 10", "vale a pena", "X ou Y", "X vs Y", "avaliação", "review", "alternativa a", "diferença entre" | Meio (MOFU) | Ad group próprio, lance moderado, phrase; LP comparativa se houver |
| **Informacional** | Aprender / resolver dúvida | "como", "o que é", "por que", "quando", "sintomas de", "passo a passo", "grátis", "exemplo de" | Topo (TOFU) | Em geral **fora** do Search pago (vai para negativa ou para YouTube/Display via video-display-specialist); exceção: ticket alto + LP de captura |
| **Navegacional** | Chegar a um site/marca específica | nome da sua marca, nome de concorrente, "login", "site oficial", "telefone da", "endereço" | Variável | Marca própria: campanha de Brand isolada. Marca de concorrente: ver §7. "Login/2ª via/cancelar": negativa |

**Regra de ouro:** intenção define orçamento. Em conta nova, a ordem de ativação é Transacional → Comercial → (só depois, se sobrar verba e fizer sentido) Informacional. Nunca o contrário.

---

## 2. Árvore de decisão de classificação

Aplicar a CADA termo, nesta ordem (a primeira regra que bater, classifica):

```
TERMO
│
├─ 1. Contém nome de marca (sua ou de terceiro)?
│   ├─ Sua marca ........................... NAVEGACIONAL-BRAND → campanha Brand
│   ├─ Marca de concorrente ................ NAVEGACIONAL-COMPETITOR → ver §7
│   └─ Marca de produto que você revende ... TRANSACIONAL (tratar como produto)
│
├─ 2. Contém verbo/sinal de ação de compra?
│   ("comprar", "contratar", "orçamento", "preço", "valor", "agendar",
│    "perto de mim", "entrega", "parcelado", "à vista", "urgente")
│   └─ Sim ................................. TRANSACIONAL
│
├─ 3. Contém sinal de comparação/avaliação?
│   ("melhor", "vs", "ou", "vale a pena", "review", "avaliação",
│    "alternativa", "top", "ranking", "confiável")
│   └─ Sim ................................. COMERCIAL
│
├─ 4. Contém pergunta ou sinal de aprendizado?
│   ("como", "o que é", "por que", "quando", "onde" sem contexto de compra,
│    "grátis", "de graça", "sozinho", "em casa", "caseiro", "DIY")
│   └─ Sim ................................. INFORMACIONAL
│
├─ 5. Termo "head" ambíguo (1–2 palavras, ex.: "advogado trabalhista",
│   "ar condicionado")?
│   └─ Classificar como COMERCIAL-AMBÍGUO → entra em phrase com lance
│      moderado e flag [OBSERVAR TERMOS DE BUSCA 14 DIAS]
│
└─ 6. Nada acima se aplica → DESCARTE ou pesquisa adicional via WebSearch
```

**Casos ambíguos clássicos (decidir pelo contexto do negócio):**
- `"<produto> barato"` → transacional, mas sinaliza sensibilidade a preço. Se o posicionamento é premium, vai para **negativa de campanha**.
- `"curso de <tema>"` quando você vende o serviço (não o curso) → **negativa de conta** ("curso", "como aprender", "vaga de emprego").
- `"<serviço> gratuito"` → negativa, exceto se existe isca/freemium real na oferta.
- Nome próprio que também é palavra comum (ex.: marca "Sol") → exact apenas, nunca broad.

---

## 3. Matriz de expansão de seeds

Partir de 5–15 seeds (o que vende + problema que resolve + categoria). Cruzar cada seed com as 8 famílias de modificadores:

| Família | Modificadores (exemplos) | Intenção que costuma gerar |
|---|---|---|
| **Compra** | comprar, contratar, orçamento, preço, valor, quanto custa, promoção, parcelado | Transacional |
| **Local** | em <cidade>, <bairro>, perto de mim, zona sul, na minha região, delivery | Transacional |
| **Urgência** | urgente, 24 horas, hoje, agora, plantão, emergência, rápido | Transacional (lance ↑) |
| **Comparação** | melhor, top, vs, ou, alternativa a, vale a pena, confiável, original | Comercial |
| **Qualificação** | profissional, especialista, certificado, homologado, para empresas, residencial | Comercial |
| **Problema** | <sintoma>, não funciona, parou, vazando, com defeito, dor de | Comercial/Transacional (serviços de reparo: tratar como transacional) |
| **Pergunta** | como, o que é, quanto tempo, funciona?, é seguro? | Informacional |
| **Armadilha** (gerar para NEGATIVAR, não para ativar) | grátis, curso, vaga, emprego, salário, currículo, como fazer em casa, usado, segunda mão, manual, pdf, download, significado | Negativas |

**Processo:**
1. Gerar a matriz completa (seed × família) — render bruto de 100–400 termos.
2. Validar vocabulário real com WebSearch (autocomplete do Google, "pesquisas relacionadas", People Also Ask, linguagem usada em marketplaces/fóruns do nicho). Regionalismos importam: "encanador" vs "bombeiro hidráulico" muda por estado.
3. Podar: remover duplicatas semânticas (mesma intenção + mesma raiz → manter a variação mais natural; o close variant do Google cobre o resto).
4. **Volume:** marcar cada termo com estimativa relativa (Alto/Médio/Baixo/Long-tail) e a flag `[VALIDAR NO KEYWORD PLANNER]` quando a decisão de orçamento depender do número real. Nunca escrever um número de volume inventado.

---

## 4. Intenção → match type → estratégia de lance

| Intenção / situação | Match type | Lance / estratégia | Justificativa |
|---|---|---|---|
| Transacional comprovada (termo já converteu) | **Exact** | tCPA/tROAS; em manual, lance teto da campanha | Máximo controle onde já há prova de conversão |
| Transacional nova (sem histórico) | **Phrase** | Maximizar conversões (sem alvo) até ~30 conv/mês na campanha, depois migrar p/ tCPA | Phrase coleta termos de busca sem abrir demais |
| Comercial | **Phrase** | tCPA com alvo 20–40% acima do alvo BOFU, ou Maximizar cliques com teto de CPC no início | Funil mais longo tolera CPA maior, não CPC descontrolado |
| Comercial-ambígua (head term) | **Phrase** (nunca broad de início) | Lance moderado + revisão de termos em 14 dias | Head term em broad queima verba antes de gerar sinal |
| Informacional (exceção ativada) | **Phrase/Exact** em campanha separada com orçamento próprio | Maximizar conversões para micro-conversão (lead magnet) | Nunca misturar com BOFU — contamina o Smart Bidding |
| Brand (sua marca) | **Exact + Phrase** em campanha Brand isolada | tImpression Share (topo absoluto 90%+) ou CPC manual baixo | Proteção de marca barata; isolar para não inflar métricas das demais |
| Concorrente | **Phrase** | CPC manual com teto agressivo de teto baixo; medir por conversão assistida | Quality Score estruturalmente baixo; ver §7 |

**Trava de broad match (não-negociável):** broad só entra quando TODAS forem verdadeiras:
1. Campanha em Smart Bidding por conversão (tCPA/tROAS) com conversão primária correta — se houver dúvida sobre o tracking, acionar o **tracking-engineer** (`tracking-blueprint`) antes;
2. Volume mínimo de ~30 conversões/mês na campanha (validar o número na conta, não assumir);
3. Rotina de revisão de termos de busca agendada (mín. semanal — a `optimization-routine` do **optimization-executor** cobre isso);
4. Listas de negativas das 3 camadas já aplicadas.

Sem as 4, o teto é phrase. Sem exceção.

---

## 5. Regras de negativação (3 camadas)

| Camada | O que entra | Match type da negativa | Exemplos |
|---|---|---|---|
| **Conta** (lista compartilhada "NEG - Universais") | Termos que NUNCA servem para o negócio | Phrase | grátis, curso, vaga, emprego, salário, currículo, pdf, download, "como fazer", usado, reclame aqui*, significado, wikipedia |
| **Campanha** (lista compartilhada por tema) | Termos válidos no negócio, mas fora do escopo daquela campanha | Phrase | campanha "residencial" negativa "empresarial/industrial"; campanha premium negativa "barato/promoção" |
| **Ad group** (cross-negativation) | Keywords dos OUTROS ad groups da mesma campanha, para forçar o termo a cair no ad group certo | Exact | ad group "comprar X" negativa em exact os termos do ad group "preço X" e vice-versa |

\* "reclame aqui" + sua marca pode merecer campanha de reputação à parte — decisão do **traffic-strategist**, não default.

**Regras de execução:**
- Negativa em **phrase** bloqueia a frase e suas extensões; negativa em **exact** bloqueia só o termo idêntico (close variants de negativas NÃO são expandidos pelo Google — negativar plural e singular explicitamente).
- Nunca negativar em broad termo de 1 palavra que possa estar contido em busca válida (ex.: negativar "manual" em broad pode bloquear "câmbio manual" numa conta automotiva). Default: phrase.
- Toda lista de negativa nasce como **lista compartilhada** (Shared Library) — facilita reuso e auditoria pelo **account-auditor**.
- Pós-go-live: a colheita contínua de negativas a partir do relatório de termos de busca pertence à `optimization-routine`; automatização via script JavaScript (n-grams de termos sem conversão) pertence à skill `gads-scripts`. Este framework entrega apenas a **lista inicial**.

---

## 6. Implicações de Quality Score

O agrupamento existe para maximizar QS (escala 1–10; componentes: CTR esperado, relevância do anúncio, experiência na LP).

Regras estruturais que este framework impõe:
1. **1 intenção + 1 tema por ad group** (modelo SKAG-híbrido, 5–20 keywords por grupo). Misturar "comprar X" com "como funciona X" no mesmo grupo derruba a relevância do anúncio para metade das buscas.
2. O termo central do ad group deve poder aparecer **literalmente no headline do RSA** — se não dá para escrever um headline natural com o termo, o agrupamento está errado. (O **ad-copywriter** valida isso no `ad-copy-builder`.)
3. Cada ad group aponta para **uma LP cuja H1 ecoa a intenção** do grupo. Se a LP não existe, registrar a lacuna no keyword map e acionar o **cro-engineer** (`lp-cro-audit`) — não forçar o grupo numa LP genérica.
4. Keyword com QS ≤ 4 sustentado após 2 ciclos de otimização: pausar ou mover para grupo/LP melhor — diagnóstico contínuo é papel do **performance-analyst** e do `account-audit`.
5. Não citar benchmarks numéricos de QS "de mercado" — avaliar sempre contra o histórico da própria conta.

---

## 7. Campanha de concorrente (navegacional-competitor)

Termos de marca de terceiros são permitidos como keyword no Google Ads, **mas usar a marca registrada no texto do anúncio pode ser bloqueado pela política de trademark e gerar risco legal (concorrência desleal) — no Brasil há decisões em ambos os sentidos; em caso de dúvida sobre nicho regulado, declarar a lacuna e recomendar validação jurídica ao cliente.** Regras operacionais:

1. Campanha **separada**, orçamento próprio e pequeno, nunca misturada com BOFU.
2. Keywords em **phrase**; anúncio SEM o nome do concorrente; copy de comparação indireta ("Compare antes de fechar", "Alternativa com <diferencial>").
3. Esperar CTR e QS baixos por natureza — avaliar por CPA/conversão assistida, não por QS.
4. LP idealmente comparativa. Insumo de diferenciais vem do `competitor-recon`.
5. Se o concorrente faz bid na sua marca, registrar no map e sugerir resposta (reforçar campanha Brand) ao **traffic-strategist**.

---

## 8. Checklist de saída do framework

Antes de levar os termos para o template:

- [ ] Toda keyword tem intenção, estágio de funil e estimativa relativa de volume.
- [ ] Termos com decisão dependente de volume real estão flagados `[VALIDAR NO KEYWORD PLANNER]`.
- [ ] Head terms ambíguos flagados `[OBSERVAR TERMOS DE BUSCA 14 DIAS]`.
- [ ] Família "Armadilha" virou lista de negativas de conta.
- [ ] Termos de concorrente isolados em campanha própria (ou conscientemente descartados).
- [ ] Nenhum broad match recomendado sem as 4 travas do §4.
- [ ] Nenhum número de mercado inventado em nenhuma célula.
