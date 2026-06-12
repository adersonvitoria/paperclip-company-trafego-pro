# Árvores de Decisão — Otimização Google Ads (TráfegoPRO)

Limiares explícitos para o **optimization-executor**. Todos os limiares são **relativos à própria conta** (`CPA_alvo`, `ROAS_alvo`, `CVR`, `CEC = 1/CVR`) — nunca benchmarks de mercado. Se um número externo for indispensável, pesquisar via WebSearch com fonte ou declarar a lacuna.

**Convenção de citação:** toda recomendação no change log cita o nó (ex.: "A2.3"). Saídas possíveis de qualquer árvore: `AGIR (qual ação)` | `AGUARDAR (o que falta)` | `ESCALAR (pra quem)`.

---

## R0 — Regra-mestra do período mínimo de dados (gate de TODAS as árvores)

Antes de qualquer nó:

1. **Recorte temporal:** dados de no mínimo **14 dias corridos**, excluindo os últimos `LAG` dias (janela de conversão). Menos que isso → `AGUARDAR`, sem exceção além da R6.
2. **Amostra mínima por entidade avaliada:**
   - Decisões de **pausa/negativação por performance**: cliques ≥ **2 × CEC** (ou seja, o dobro do esperado pra gerar 1 conversão) **OU** custo ≥ **2 × CPA_alvo** — o que vier primeiro.
   - Decisões de **ajuste fino de lance/alvo**: ≥ **20 conversões** na entidade no recorte (abaixo disso, CPA por entidade é ruído; decidir no nível acima — ad group/campanha).
   - Decisões de **escala**: ≥ **10 conversões** no recorte com CPA ≤ alvo.
3. **Comparações sempre como-com-como:** mesmo recorte, mesma coluna de conversão, sem misturar conversões primárias e secundárias.
4. **Conta de baixíssimo volume** (< 15 conversões/mês na conta toda): proibido decidir por keyword. Subir o nível de análise (campanha/conta), esticar recorte pra 90 dias e priorizar decisões semânticas (classes C/D de negativação), que não dependem de amostra.

---

## R6 — Exceção de sangria (única que fura a R0 e o learning period)

Entidade (termo, keyword, placement, campanha) com **custo ≥ 3 × CPA_alvo e 0 conversões** dentro do recorte → pode pausar/negativar/excluir imediatamente, mesmo em learning period e mesmo sem 14 dias completos. Registrar como "R6 — estancamento de sangria".

---

## A1 — Termo de pesquisa: negativar ou não?

```
A1.0 Termo classificado (Bloco 1.2 da rotina) como:
 ├─ Classe C (job errado) ou D (irrelevante óbvio)?
 │   └─ SIM → A1.1 NEGATIVAR JÁ (decisão semântica, sem limiar de dados).
 │            Match type pelo menor raio possível (regra 1.3 da rotina).
 │            Padrão universal? → lista compartilhada. Pontual? → campanha/ad group.
 ├─ Classe E (marca em campanha genérica, existindo campanha de marca)?
 │   └─ SIM → A1.2 Negativa EXACT na campanha genérica. Registrar.
 └─ Classe A ou B → seguir pros nós de dados:
     A1.3 Custo do termo ≥ 2×CPA_alvo E conversões = 0 E cliques ≥ 2×CEC?
      ├─ SIM → NEGATIVAR (exact se a formulação é o problema; phrase se o padrão é o problema).
      └─ NÃO →
         A1.4 Custo ≥ 1×CPA_alvo, 0 conversões, mas cliques < 2×CEC?
          ├─ SIM → AGUARDAR + colocar na watchlist do change log (reavaliar na próxima rotina).
          └─ NÃO →
             A1.5 Termo converte com CPA ≤ 1,2×alvo e ainda NÃO é keyword?
              ├─ SIM → propor adição como exact match (handoff search-specialist / keyword-research).
              └─ NÃO → MANTER, sem ação.
A1.6 Pós-cheque obrigatório: a negativa proposta colide com keyword ativa em
     qualquer campanha? → reduzir raio (exact) ou restringir destino.
```

---

## A2 — Keyword: pausar, reduzir, manter ou escalar?

```
A2.0 R0 cumprida pra essa keyword? NÃO → AGUARDAR (ou subir nível de análise).
A2.1 Campanha em learning period? SIM → CONGELAR (só R6 fura).
A2.2 Keyword com 0 conversões:
 ├─ Custo ≥ 3×CPA_alvo → R6: PAUSAR já.
 ├─ Custo ≥ 2×CPA_alvo e cliques ≥ 2×CEC → PAUSAR (A2.3). Revisão +14d no log.
 ├─ Custo ≥ 2×CPA_alvo e cliques < 2×CEC → CPC alto demais pro funil:
 │   reduzir lance −20% (manual) ou sinalizar tCPA da campanha (A2.4).
 └─ Custo < 2×CPA_alvo → AGUARDAR.
A2.5 Keyword com conversões — comparar CPA_kw com alvo:
 ├─ CPA_kw > 2×alvo (≥20 conv. no recorte) → reduzir forte: lance −20% ou,
 │   se padrão se repetir em >50% das keywords do ad group, propor mover o ad group
 │   pra campanha com tCPA próprio (handoff search-specialist).
 ├─ 1,2×alvo < CPA_kw ≤ 2×alvo → reduzir leve: lance −10/−15%; em smart bidding,
 │   NÃO mexer por keyword — registrar; se o desvio for geral da campanha,
 │   apertar tCPA −10% (máx. 1 ajuste a cada 2 semanas) (A2.6).
 ├─ 0,8×alvo ≤ CPA_kw ≤ 1,2×alvo → MANTER (A2.7). Não micro-otimizar o que está no alvo.
 └─ CPA_kw < 0,8×alvo com ≥10 conv. → ESCALAR (A2.8):
     ├─ Search lost IS (budget) > 10%? → pedir verba ao traffic-strategist (budget-pacing);
     │   teto da rotina: +20%/semana na campanha.
     ├─ Search lost IS (rank) > 20%? → lance +10/15% (manual) ou afrouxar tCPA +10%.
     └─ Impression share ≥ 90%? → keyword saturada: crescer por expansão
         (keyword-research) e novos temas, não por lance.
A2.9 Equivalente em ROAS: trocar "CPA > k×alvo" por "ROAS < alvo/k" mantendo os mesmos k.
```

---

## A3 — RSA / asset: manter, trocar ou pausar?

```
A3.0 Anúncio com cliques ≥ 2×CEC OU impressões ≥ 5.000 no recorte? NÃO → AGUARDAR.
A3.1 Ad group tem ≥ 2 RSAs ativos? NÃO → nunca pausar o único; pedir substituto
     ao ad-copywriter (ad-copy-builder) ANTES.
A3.2 Comparar RSAs do mesmo ad group (mesma audiência):
 ├─ CVR do pior < 50% da CVR do melhor, em 2 rotinas consecutivas → PAUSAR o pior
 │   e solicitar variação nova (manter sempre 2+ ativos).
 ├─ Conversões escassas (<10 por anúncio) → decidir por CTR: pior CTR < 60% do melhor
 │   em 2 rotinas → trocar.
 └─ Diferença menor → MANTER ambos (o leilão já distribui).
A3.3 Ad Strength "Poor"/"Average" com gasto relevante (≥1×CPA_alvo/semana)
     → briefing ao ad-copywriter, mesmo sem A3.2 disparar.
A3.4 Assets PMax marcados "Low" no relatório de assets → substituir os "Low";
     0 conversões no asset group com custo ≥ 2×CPA_alvo → escalar ao pmax-specialist.
A3.5 Sitelink/callout reprovado ou CTR zero há 30d → substituir direto (sem limiar).
```

---

## A4 — Campanha sem entrega (impressões baixas/zero)

```
A4.0 Diagnóstico em ordem — parar no primeiro SIM:
 1. Anúncio/asset reprovado ou "limited"? → corrigir política (ad-copywriter se for copy).
 2. Orçamento "Limited by budget" / lost IS budget > 30%? → sinalizar traffic-strategist.
 3. Lance/alvo apertado demais (tCPA muito abaixo do CPA histórico recém-setado)?
    → afrouxar alvo +15/20% e AGUARDAR 7 dias.
 4. Learning period (mudança < 7 dias)? → AGUARDAR, não empilhar mudanças.
 5. Keywords com volume de busca baixo / status rarely shown? → handoff
    keyword-research (search-specialist).
 6. Segmentação estreita demais (geo + audiência + horário empilhados)? → afrouxar
    UMA restrição por vez.
 7. Nada acima? → suspeita estrutural → account-auditor (account-audit).
```

---

## A5 — "O CPA subiu" — diagnóstico antes de qualquer ação

Ordem obrigatória (cada passo elimina uma causa; agir no primeiro culpado encontrado):

```
A5.1 Medição: conversões caíram com cliques estáveis? Tag/GTM/consent mudou?
     → tracking-engineer ANTES de tocar em mídia. (Causa nº 1 de "CPA subiu" é tag.)
A5.2 Recorte: o período inclui os últimos LAG dias (conversões imaturas)? → refazer recorte.
A5.3 Mudança interna recente (≤14d): lance, orçamento, estrutura, LP nova?
     → reverter/aguardar maturação antes de nova mudança.
A5.4 Mix: o CPA subiu "dentro" das campanhas ou o mix de gasto mudou pra campanhas
     mais caras? (decompor) → se for mix, é decisão de alocação → traffic-strategist.
A5.5 Leilão: CPC médio subiu com CVR estável? → Auction Insights: entrante novo/
     concorrente agressivo? Pesquisar via WebSearch se necessário (market-intel ajuda
     via competitor-recon). Resposta: eficiência (QS, A2), não guerra de lance.
A5.6 Conversão: CVR caiu com CPC estável? → LP/oferta → cro-engineer (lp-cro-audit);
     sazonalidade → performance-analyst valida contra histórico anual.
A5.7 Nada conclusivo → ESCALAR ao performance-analyst com os dados decompostos
     (nunca "ajustar tudo um pouco" no escuro).
```

---

## A6 — Experimento: ship, iterar ou matar?

```
A6.0 Duração mínima cumprida (≥2 semanas E ≥2×CEC cliques/braço)? NÃO →
 ├─ Braço de teste com custo ≥ 3×CPA_alvo e 0 conv.? → R6: MATAR antecipado.
 └─ Senão → AGUARDAR (proibido espiar pra decidir).
A6.1 Conversões por braço ≥ 20? NÃO → resultado só é válido se a diferença for
     gritante (ver A6.2); senão, estender até 4 semanas; ainda insuficiente → MATAR
     por inviabilidade de medição (registrar aprendizado).
A6.2 Teste de ruído rápido: |conv_A − conv_B| > 2×√(conv_A + conv_B)?
 ├─ NÃO → INCONCLUSIVO → estender (1×) ou matar por irrelevância prática.
 └─ SIM →
     A6.3 Métrica primária do braço teste ≥ critério de ship definido no desenho
          E métrica de guarda intacta?
      ├─ SIM → SHIP: aplicar a 100%, registrar no change log, agendar verificação +14d.
      ├─ Métrica primária melhorou mas guarda quebrou (ex.: CPA caiu, volume −40%)
      │   → ITERAR: nova hipótese conciliando as duas; não shipar.
      └─ NÃO → MATAR: registrar hipótese refutada (refutação documentada também é entregável).
A6.4 Sempre: 1 variável; experimento sem critério de ship escrito ANTES do início
     é inválido por definição — não avaliar, redesenhar.
```

---

## Regras de freio (aplicam por cima de todas as árvores)

| # | Freio | Limite |
|---|---|---|
| F1 | Learning period | Nenhuma mudança em campanha com bid strategy trocada ou orçamento ±>20% há < 7 dias (só R6) |
| F2 | Orçamento | Máx. ±20% por campanha por semana; acima → traffic-strategist |
| F3 | Alvo de lance | tCPA/tROAS: máx. ±15% por ajuste, intervalo ≥ 2 semanas |
| F4 | Empilhamento | Máx. 1 mudança estrutural por campanha por rotina (mudanças simultâneas destroem atribuição de causa) |
| F5 | Negativação em massa | > 25 negativas novas numa rotina → revisão de colisão obrigatória (A1.6) antes de aplicar |
| F6 | Sexta-feira | Não aplicar mudança estrutural em véspera de fim de semana sem monitoramento — agendar pra segunda |
| F7 | Reversibilidade | Toda mudança registrada com valor "antes" no change log, pra rollback em 1 passo |

---

## Tabela-resumo de limiares (colar no início de cada rotina, já calibrada)

| Decisão | Limiar | Nó |
|---|---|---|
| Negativar termo (semântico) | Classe C/D/E | A1.1–A1.2 |
| Negativar termo (dados) | custo ≥ 2×CPA_alvo, 0 conv., cliques ≥ 2×CEC | A1.3 |
| Pausar keyword | idem A1.3 (ou R6: 3×CPA_alvo, 0 conv.) | A2.2–A2.3 |
| Reduzir lance leve | 1,2×alvo < CPA ≤ 2×alvo | A2.6 |
| Reduzir lance forte | CPA > 2×alvo com ≥20 conv. | A2.5 |
| Manter | 0,8×alvo ≤ CPA ≤ 1,2×alvo | A2.7 |
| Escalar | CPA < 0,8×alvo com ≥10 conv. | A2.8 |
| Pausar RSA | CVR < 50% do melhor, 2 rotinas, ≥2 RSAs ativos | A3.2 |
| Desligar search partners | CPA partners > 1,5× rede de busca, amostra ≥ CEC | Bloco 4 |
| Excluir local/placement | custo ≥ 1×CPA_alvo (0,5× p/ placement), 0 conv. | Bloco 4 |
| Ship de experimento | critério pré-definido + A6.2 passa + guarda intacta | A6.3 |
