# Checklist de Feed — Merchant Center (Shopping & PMax feed-based)

Material de apoio do agente **pmax-specialist** da TráfegoPRO. O feed é o "Quality Score" do Shopping: título, GTIN e dados completos definem em quais leilões o produto entra e a que CPC. Campanha boa com feed ruim perde pra campanha mediana com feed excelente.

---

## 1. Setup do Merchant Center (uma vez por conta)

- [ ] Conta Merchant Center criada e **vinculada à conta Google Ads** (Configurações → Apps e serviços vinculados).
- [ ] **Site verificado e reivindicado** (verificação por tag, GA4 ou DNS). Sem claim, nada serve.
- [ ] **Dados da empresa completos:** nome, endereço, telefone — inconsistência aqui é gatilho clássico de suspensão por "Misrepresentation".
- [ ] **Informações obrigatórias no site** (políticas exigidas): política de devolução/reembolso, dados de contato visíveis (2+ formas), termos e condições, checkout em HTTPS. No Brasil: CNPJ visível no rodapé reduz drasticamente risco de suspensão.
- [ ] **Frete configurado** (serviço de frete no MC ou atributo `shipping` no feed) — obrigatório; divergência entre frete do anúncio e do checkout = reprovação por preço/frete incorreto.
- [ ] **Impostos/moeda:** BRL, preços com impostos inclusos (padrão BR).
- [ ] Método de envio do feed decidido:
  - **Content API / integração nativa da plataforma** (Shopify, VTEX, Nuvemshop, WooCommerce com plugin) → preferido: atualização quase em tempo real de preço/estoque.
  - **Feed agendado (XML/TSV via URL)** → mínimo 1 fetch/dia; e-commerce com preço dinâmico precisa de 2–4 fetches/dia ou Content API.
  - **Planilha Google** → só pra catálogos minúsculos e estáticos.

---

## 2. Atributos obrigatórios (reprovação se faltar ou estiver errado)

| Atributo | Regra prática | Erro comum |
|---|---|---|
| `id` | Único, estável pra sempre (mudar id = perder histórico do produto no leilão) | Plataforma regenera id ao reimportar catálogo |
| `title` | ≤ 150 caracteres (≈ 70 visíveis) — ver fórmula §4 | Título igual ao da loja, sem atributo de busca |
| `description` | ≤ 5.000 caracteres, texto real do produto | Descrição vazia ou em HTML cru |
| `link` | URL final do produto, mesmo domínio verificado, HTTPS | Link com redirect ou domínio divergente |
| `image_link` | ≥ 100×100 (não-vestuário) / ≥ 250×250 (vestuário); sem marca d'água, sem texto promocional, fundo limpo | "FRETE GRÁTIS" estampado na imagem = reprovado |
| `price` | Igual ao da página, com moeda. Se divergir do site → reprovação automática por crawler | Promoção atualiza site mas feed só sincroniza de madrugada |
| `availability` | `in stock` / `out of stock` / `preorder` / `backorder` — espelhando o site | Produto esgotado anunciado como disponível |
| `condition` | `new` / `refurbished` / `used` | — |
| `brand` | Obrigatório pra quase tudo (exceto marca própria sem GTIN, ver §3) | Campo preenchido com nome da loja em vez da marca |
| `google_product_category` | Categoria da taxonomia oficial do Google (a mais específica possível) | Categoria genérica nível 1 — piora o matching de query |
| `product_type` | Sua própria árvore de categorias — base pros listing groups | Não preenchido → impossível segmentar listing group por categoria própria |

**Vestuário (obrigatórios adicionais):** `color`, `size`, `gender`, `age_group`, e `item_group_id` agrupando variantes. Variante sem `item_group_id` = produtos duplicados aos olhos do Google = reprovação ou diluição.

---

## 3. GTIN e identificadores únicos

- `gtin` (EAN-13 no Brasil) é **obrigatório quando o produto possui um** atribuído pelo fabricante. GTIN correto melhora o matching de query e habilita o produto a leilões mais qualificados.
- Sem GTIN, informar `brand` + `mpn`. 
- **Marca própria / produto sem GTIN de fato:** `identifier_exists = false` (e aí NÃO preencher gtin/mpn inventados).
- **Nunca inventar ou reciclar GTIN** (ex.: GTIN de outro produto, GTIN interno) — "GTIN incorreto" reprova o item e reincidência escala pra suspensão da conta.
- Validar dígito verificador antes de subir em massa (a maioria das plataformas tem validador; em lote, planilha com fórmula de checksum EAN-13).

---

## 4. Otimização de título (maior alavanca do feed)

O título funciona como a "keyword" do Shopping — o matching de query usa principalmente título, descrição e categoria. Fórmulas por vertical (preencher da esquerda pra direita por ordem de importância, porque o corte visual é ~70 caracteres):

| Vertical | Fórmula |
|---|---|
| Moda | Marca + Gênero + Tipo de produto + Atributo (cor/tamanho/material) |
| Eletrônicos | Marca + Modelo + Spec chave (capacidade/tela) + Tipo |
| Casa/Decoração | Tipo de produto + Atributo (material/medida) + Marca |
| Suplementos/Beleza | Marca + Linha + Tipo + Tamanho/quantidade |
| Peças/Autopeças | Tipo + Compatibilidade (modelo/ano) + Marca + nº da peça |

Regras:
- Termos que o cliente realmente busca (cruzar com o output da `keyword-research` do **market-intel**) — ex.: se a query dominante é "tênis de corrida masculino", isso vai no título, não "Running Shoes X-Trail 5000".
- Sem CAIXA ALTA promocional, sem "frete grátis", sem emojis, sem "promoção" — política do Google reprova texto promocional no título.
- Testar títulos em escala via **supplemental feed** (§5) sem mexer na plataforma.
- A/B de título: o Merchant Center não tem teste nativo confiável pra isso; medir por comparação antes/depois com janela fixa e mesma sazonalidade, e declarar a limitação no relatório.

---

## 5. Supplemental feeds e custom labels

**Supplemental feed** = feed adicional (em geral Planilha Google) que sobrescreve/complementa atributos do feed primário casando pelo `id`. Usos TráfegoPRO:

1. **Custom labels pra segmentação de campanha** (o coração da estrutura por margem do `blueprint-pmax.md` §3.1):

| Label | Convenção TráfegoPRO | Exemplo de valores |
|---|---|---|
| `custom_label_0` | Faixa de margem | `margem-a`, `margem-b`, `margem-c` |
| `custom_label_1` | Curva de vendas | `curva-a`, `curva-b`, `curva-c` (recalcular mensalmente) |
| `custom_label_2` | Sazonalidade/coleção | `verao-26`, `bf-26`, `perene` |
| `custom_label_3` | Faixa de preço | `ate-100`, `100-300`, `300-mais` |
| `custom_label_4` | Status estratégico | `heroi`, `lancamento`, `liquidacao`, `excluir-midia` |

2. **Correção de títulos em massa** sem depender do dev da plataforma.
3. **Enriquecimento:** GTIN faltante, `google_product_category` mais específica, `sale_price` temporário.

Setup: Merchant Center → Fontes de dados → Adicionar feed suplementar → vincular ao feed primário. A regra de precedência: supplemental sobrescreve o primário no atributo informado, pros ids listados.

**Listing groups na PMax/Shopping** então subdividem por `custom_label_0` (margem) → `product_type` (categoria) → "Everything else" **excluído** nas campanhas segmentadas (pra não vazar produto sem label pra campanha errada). Conferência obrigatória: soma dos produtos nos listing groups de todas as campanhas = catálogo ativo, sem interseção.

---

## 6. Atributos recomendados (ganho de leilão e de CTR)

- [ ] `sale_price` + `sale_price_effective_date` — habilita selo de desconto no anúncio (preço riscado). Nunca simular desconto inflando `price` — política de preço enganoso.
- [ ] `shipping` granular ou frete grátis configurado — frete grátis exibido no anúncio mexe em CTR.
- [ ] `product_highlight` (até 10 bullets) e `product_detail` — alimentam formatos ricos.
- [ ] Imagens adicionais (`additional_image_link`, até 10) — ângulos, lifestyle.
- [ ] **Avaliações de produto** (programa Product Ratings, mínimo agregado de reviews) e **Google Customer Reviews** — estrelas no anúncio.
- [ ] **Promotions** (feed de promoções BR disponível) — cupom/selo "promoção" no anúncio.
- [ ] `lifestyle_image_link` — usado em superfícies de descoberta da PMax.

---

## 7. Reprovações e suspensões — triagem

### 7.1 Itens reprovados (Diagnóstico → nível do item)

Ordem de ataque (impacto × esforço):
1. **Preço/disponibilidade divergente** (mismatch com crawler) → aumentar frequência de sync ou migrar pra Content API; conferir microdados schema.org (`Product`/`Offer`) na página, que o crawler usa pra comparar.
2. **GTIN incorreto/ausente** → §3.
3. **Imagem (texto promocional, marca d'água, genérica)** → trocar imagem via supplemental feed se a plataforma travar.
4. **Categoria sensível mal classificada** (suplemento tratado como medicamento etc.) → corrigir `google_product_category` e revisar descrição (palavras como "cura", "trata" disparam política de saúde).

### 7.2 Suspensão de conta (Misrepresentation e afins)

Não tem atalho — checklist de credibilidade antes de pedir revisão:
- [ ] CNPJ, endereço e telefone visíveis e consistentes entre site, MC e Google Business Profile
- [ ] Políticas de troca/devolução e privacidade completas e alcançáveis em ≤ 2 cliques
- [ ] Checkout funcional de ponta a ponta (testar de aba anônima)
- [ ] Sem claims agressivos ("o mais barato do Brasil", contadores falsos de estoque)
- [ ] Preços e parcelamento idênticos entre anúncio, página e checkout

Pedir revisão SÓ depois de corrigir tudo (limite prático de tentativas — revisão reprovada repetidamente alonga a quarentena). Se o motivo da suspensão for obscuro, escalar pro **account-auditor** rodar a skill `account-audit` antes da próxima tentativa.

### 7.3 Rotina de saúde do feed (delegar à `optimization-routine` do optimization-executor)

| Frequência | Ação |
|---|---|
| Diária (automática) | Script de queda de impressões (`blueprint-pmax.md` §8.2) + e-mails do MC |
| Semanal | Diagnóstico do MC: % itens ativos vs reprovados (meta operacional: > 95% ativos); top 5 motivos de reprovação |
| Mensal | Recalcular `custom_label_1` (curva ABC) via supplemental feed; revisar títulos dos 20 produtos de maior gasto sem conversão |
| Trimestral | Re-validar políticas do site; conferir se novas categorias do catálogo têm `google_product_category` específica |

---

## 8. Checklist final do feed (gate pro blueprint)

- [ ] Site verificado e reivindicado; políticas e CNPJ no site
- [ ] Frete e moeda configurados; preço com imposto
- [ ] 100% dos itens core com: id estável, título otimizado (§4), imagem conforme, price/availability sincronizados, brand + GTIN (ou `identifier_exists=false` legítimo)
- [ ] Vestuário: variantes com `item_group_id` + color/size/gender/age_group
- [ ] `product_type` preenchido (árvore própria) — pré-requisito dos listing groups
- [ ] Custom labels 0–4 populados via supplemental feed conforme convenção §5
- [ ] > 95% do catálogo ativo no Diagnóstico, zero reprovação em produto herói
- [ ] Sync de preço/estoque ≥ 1×/dia (ou Content API se preço dinâmico)
- [ ] sale_price, promotions e reviews avaliados (ganhos de CTR documentados como hipótese a medir, sem prometer número)
- [ ] Rotina de saúde §7.3 agendada com o optimization-executor

**Lacunas de benchmark:** taxas "normais" de reprovação, CTR médio de Shopping por vertical e impacto típico de estrelas no anúncio variam demais por nicho — quando o cliente pedir esses números, pesquisar via WebSearch fontes recentes (e citar) ou medir na própria conta. Nunca chutar.
