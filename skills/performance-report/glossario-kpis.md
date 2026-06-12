# Glossário de KPIs e Manual de Leitura — TráfegoPRO

> Arquivo auxiliar da skill `performance-report` (agente performance-analyst).
> Não é um dicionário decorativo: cada KPI vem com fórmula, leitura correta, armadilhas conhecidas e piso de volume. As seções 4 (decomposição) e 5 (qualidade de dado) são **de aplicação obrigatória** antes de qualquer conclusão em relatório.

---

## 1. Como usar este glossário

1. Calcule os KPIs com as fórmulas da seção 2 — sempre a partir dos dados brutos (custo, impressões, cliques, conversões, valor), nunca tirando média de médias.
2. Antes de ler qualquer número, rode os controles da seção 5 (qualidade de dado).
3. Cheque a seção 3 (pisos de volume) — célula abaixo do piso = ⚪ "amostra insuficiente".
4. KPI desviado da meta → rode a árvore correspondente da seção 4 até chegar à causa-raiz (ou declarar investigação aberta).
5. Leitura muda por tipo de campanha → seção 6.

**Regra de ouro das médias:** CPA, CPC, CTR, taxa de conversão e ROAS agregados de várias campanhas são sempre **recalculados dos totais** (Σcusto / Σconversões etc.). Média aritmética das linhas é erro de analista júnior — pondera errado e distorce o relatório.

---

## 2. KPIs essenciais

### 2.1 CTR (Click-Through Rate)
- **Fórmula:** `CTR = cliques / impressões × 100`
- **O que mede:** aderência entre o anúncio e a intenção de quem viu. Em Search, é o primeiro sinal de relevância (e insumo do Quality Score).
- **Leitura:** CTR é **diagnóstico, não objetivo**. CTR alto com taxa de conversão baixa = anúncio promete o que a LP não entrega (ou termo amplo demais atraindo clique errado). CTR caindo com posição estável = criativo fadigado ou concorrente novo com oferta melhor.
- **Armadilhas:**
  - Comparar CTR entre tipos de campanha (Search ~ordens de grandeza acima de Display) ou entre marca e não-marca — marca infla o CTR agregado.
  - CTR subindo após perda de IS pode ser só mudança de mix de leilões, não melhora do anúncio.
  - Em RSA, CTR agregado esconde variação por combinação — olhar a força do anúncio e os relatórios de recursos antes de concluir.
- **Sem meta contratual:** comparar vs mediana das últimas 8 semanas da própria conta.

### 2.2 CPC médio (Cost Per Click)
- **Fórmula:** `CPC = custo / cliques`
- **O que mede:** preço pago pela visita. É função do leilão (concorrência, Quality Score, lance) e do **mix** de onde você está comprando clique.
- **Leitura:** CPC subindo não é, por si, problema — só é problema se o CPA/ROAS degradar junto. Smart Bidding sobe CPC deliberadamente em leilões com maior probabilidade de conversão.
- **Armadilhas:**
  - **Efeito mix:** CPC médio da conta pode subir só porque o gasto migrou de Display barato para Search caro — decompor por campanha antes de culpar "o leilão".
  - CPC de marca é estruturalmente baixo; crescimento da campanha de marca derruba o CPC agregado e mascara alta no não-marca.
  - Em tCPA/tROAS, "subir CPC" não é alavanca direta — a alavanca é o target.

### 2.3 Taxa de conversão (conversion rate)
- **Fórmula:** `CVR = conversões / cliques × 100` (base cliques; declarar a base sempre — em Video usa-se também base impressões/engajamentos, que não é comparável)
- **O que mede:** eficiência do pós-clique: qualidade do tráfego × oferta × landing page × fricção do formulário/checkout.
- **Leitura:** queda de CVR com CTR estável e mesmos termos → o problema está no destino (LP, preço, estoque, formulário, velocidade) → acionar diagnóstico via `lp-cro-audit` (cro-engineer). Queda de CVR com termos novos/mais amplos → problema de tráfego → negativação/ajuste de match type via `optimization-routine`.
- **Armadilhas:**
  - CVR depende da **definição de conversão**: ação de conversão nova ou contagem "todas vs uma por clique" alterada muda o número sem mudar o negócio (ver 5.3).
  - Lag de conversão deprime artificialmente o CVR dos últimos dias (ver 5.1).
  - CVR de remarketing/marca é estruturalmente maior — comparar células equivalentes.

### 2.4 CPA (Cost Per Acquisition)
- **Fórmula:** `CPA = custo / conversões`
- **Identidade que rege toda a análise:** `CPA = CPC / CVR`. Todo desvio de CPA é decomponível nesses dois fatores (mais o efeito mix). É a primeira conta a fazer, sempre (árvore 4.1).
- **Leitura:** comparar contra o CPA-alvo contratado e contra o CPA máximo viável do cliente (derivado de margem — se não estiver documentado, pedir ao traffic-strategist; nunca assumir).
- **Armadilhas:**
  - CPA agregado mistura ações de conversão de valores diferentes (lead vs venda) — reportar por ação de conversão quando a conta tiver mais de uma primária.
  - Poucas conversões = CPA volátil por natureza; respeitar o piso da seção 3 antes de chamar tendência.
  - CPA do período parcial (lag) é sempre **superestimado** — vai cair quando as conversões atrasadas chegarem.

### 2.5 ROAS (Return On Ad Spend)
- **Fórmula:** `ROAS = valor de conversão / custo` (expressar em múltiplo: 4,2x — ou %, manter consistência na conta)
- **Identidade de decomposição:** `ROAS = CVR × ticket médio / CPC`. Desvio de ROAS = mudança em custo, em taxa ou em **ticket** (árvore 4.2 — analistas esquecem o ticket com frequência).
- **Leitura:** ROAS é meta típica de e-commerce/receita rastreada. ROAS na meta com volume caindo pode ser pior para o negócio que ROAS 10% abaixo com volume crescendo — sempre ler ROAS **junto com** receita absoluta.
- **Armadilhas:**
  - ROAS depende da qualidade do valor enviado (tag de receita, OCI/conversões offline). Valor zerado ou duplicado quebra o KPI sem quebrar a mídia (ver 5.4).
  - Campanha de marca infla o ROAS agregado (demanda que existiria de qualquer forma, em parte) — reportar marca separada.
  - ROAS alvo agressivo demais no Smart Bidding estrangula volume; diagnóstico de "ROAS ótimo, volume morto" é alerta P2, não vitória.

### 2.6 Conversões e valor de conversão
- **Fonte:** coluna "Conversões" = somente ações marcadas como primárias, na janela e modelo de atribuição vigentes; "Todas as conversões" inclui secundárias. **Declarar no relatório qual coluna está sendo usada e nunca trocar entre períodos comparados.**
- **Armadilhas:** atribuição data-driven redistribui crédito fracionado (conversões com casas decimais são normais); conversões por importação (offline) chegam com atraso próprio do pipeline do cliente — somar esse atraso ao lag da seção 5.1.

### 2.7 Search Impression Share (IS) e perdas
- **Fórmulas (fornecidas pela plataforma, não calculáveis localmente):**
  - `IS = impressões obtidas / impressões elegíveis estimadas`
  - `IS lost (budget)` = % das impressões elegíveis perdidas por orçamento insuficiente
  - `IS lost (rank)` = % perdidas por classificação do anúncio (lance × Quality Score × extensões/contexto)
  - Identidade: `IS + IS lost (budget) + IS lost (rank) = 100%`
- **Leitura (usar a matriz da seção 4 do template-relatorio.md):** perda por **orçamento** é problema "bom" — resolve com verba (decisão do traffic-strategist via `budget-pacing`). Perda por **rank** não se resolve com verba — exige melhorar Quality Score (relevância do anúncio, CTR esperado, experiência de LP) e/ou lance/target, trabalho do search-specialist com execução via `optimization-routine`.
- **Armadilhas:**
  - IS é por **leilões elegíveis** — adicionar palavras-chave amplas faz o IS "cair" sem nenhuma piora real (o denominador cresceu). Sempre checar se houve mudança de cobertura antes de ler queda de IS.
  - IS de Search e de Display/PMax não são comparáveis; Video não reporta.
  - Complementos úteis no mensal: **Top IS** e **Absolute Top IS** (presença nas posições superiores) — relevantes em disputa de marca e termos de fundo de funil.

### 2.8 Quality Score (uso diagnóstico)
- **O que é:** nota 1–10 por palavra-chave (componentes: CTR esperado, relevância do anúncio, experiência na página de destino). Não é KPI de relatório executivo — é **ferramenta de diagnóstico** da perda por rank e do CPC.
- **Régua operacional da casa:** QS ≤ 4 em palavra com gasto relevante = candidata a reestruturação (anúncio/agrupamento/LP) ou pausa — entra como recomendação ao search-specialist, com execução via `optimization-routine`. QS 7+ em termos centrais é o estado saudável a manter. (Régua interna de priorização, não benchmark de mercado.)
- **Armadilha:** otimizar QS como fim em si é erro — QS serve ao CPA/ROAS, não o contrário.

### 2.9 Pacing de verba (visão do relatório)
- **Fórmula:** `pacing index = gasto acumulado / (verba mensal × dias decorridos / dias do mês)`
- **Leitura no relatório:** 1,00 = no ritmo; a tabela de tolerâncias, degraus de escala e protocolo de corte é dona da skill `budget-pacing` — o relatório **reporta** o índice e encaminha desvios, não redefine as regras.

---

## 3. Pisos de volume mínimo para leitura (regra da casa)

Abaixo destes pisos, a célula é ⚪ "amostra insuficiente" — proibido narrar como tendência, vitória ou derrota. São réguas operacionais internas da TráfegoPRO (heurísticas de proteção contra ruído), não testes estatísticos formais; quando uma decisão grande depender de uma diferença pequena, recomendar teste controlado (experimento de campanha) em vez de leitura observacional.

| Leitura desejada | Piso mínimo no período analisado |
|---|---|
| Tendência de CTR / CPC | ≥ 300 cliques na célula (campanha/grupo) |
| Tendência de CVR / CPA | ≥ 30 conversões na célula |
| Tendência de ROAS | ≥ 30 conversões **e** ≥ 50 pedidos/leads com valor (se aplicável) |
| Comparação entre 2 criativos/anúncios | ≥ 30 conversões **em cada** braço |
| Leitura de termo de busca individual | ≥ 50 cliques ou ≥ 5 conversões |
| Sazonalidade da conta | ≥ 2 ciclos completos comparáveis |

**Saída honesta quando abaixo do piso:** agregar células (subir um nível: grupo → campanha → tipo), alongar o período, ou declarar "sem leitura". Nunca afinar a conclusão para caber no dado.

---

## 4. Árvores de decomposição de variação (aplicação obrigatória em KPI 🟡/🔴)

### 4.1 CPA subiu
```
CPA ↑  (CPA = CPC / CVR)
├─ 1. Foi mix? Recalcular CPA por campanha. O CPA de cada campanha está estável,
│     mas o gasto migrou para campanhas mais caras?
│     └─ SIM → causa = decisão de alocação. Checar se foi intencional
│        (decisão registrada em budget-pacing/optimization-routine?) ou deriva do
│        Smart Bidding. Encaminhar ao traffic-strategist.
├─ 2. CPC subiu (CVR estável)?
│     ├─ Leilão: CPC subiu nos mesmos termos? → concorrência nova / sazonalidade
│     │  de leilão. Evidência: Auction Insights. Ação possível: lance/target,
│     │  qualidade (QS), ou aceitar e repactuar meta.
│     ├─ Termos: entraram termos/posicionamentos novos mais caros? → revisar
│     │  match types e cobertura; negativação via optimization-routine.
│     └─ Target: alguém subiu tCPA/tROAS ou orçamento (re-aprendizado)? →
│        cruzar com histórico de alterações da conta. Se mudança recente:
│        aguardar janela de observação antes de nova ação.
└─ 3. CVR caiu (CPC estável)?
      ├─ Tráfego mudou: novos termos/audiências de intenção menor →
      │  search terms / segmentos → negativar/ajustar.
      ├─ Destino piorou: LP lenta, formulário quebrado, preço/estoque,
      │  oferta vencida → teste manual + lp-cro-audit (cro-engineer).
      ├─ Medição mudou: ação de conversão, janela, tag, consent (seção 5) →
      │  se sim, PARE: o relatório vira nota de medição, não de performance.
      └─ Lag: os dias recentes ainda não fecharam → reclassificar como
         "leitura parcial" (template, seção 9).
```

### 4.2 ROAS caiu
```
ROAS ↓  (ROAS = CVR × ticket médio / CPC)
├─ 1. Ticket médio caiu?  ← checar PRIMEIRO (é o fator esquecido)
│     ├─ Mix de produtos vendidos mudou (promoção, ruptura de estoque,
│     │  campanha empurrando categoria barata — comum em PMax/Shopping).
│     └─ Valor de conversão mal medido (tag de receita, moeda, dedup) → seção 5.4.
├─ 2. CVR caiu? → seguir ramo 3 da árvore 4.1.
├─ 3. CPC subiu? → seguir ramo 2 da árvore 4.1.
└─ 4. Mix de campanhas (gasto migrou para linhas de ROAS menor)? →
      intencional (estratégia de crescimento) vs deriva → traffic-strategist.
```

### 4.3 Volume de conversões caiu (com eficiência estável)
```
Conversões ↓ com CPA/ROAS ok
├─ 1. Gasto caiu? → pacing (orçamento esgotando? verba reduzida? campanha
│     pausada?) → budget-pacing / histórico de alterações.
├─ 2. Gasto estável, impressões caíram?
│     ├─ IS lost (budget) ↑ → CPCs mais caros consumindo a mesma verba.
│     ├─ IS lost (rank) ↑ → perdeu competitividade (QS/lance/concorrente).
│     └─ Demanda caiu (impressões elegíveis ↓) → sazonalidade/mercado —
│        validar com Google Trends/WebSearch citando fonte, ou declarar hipótese.
└─ 3. Impressões estáveis, cliques caíram (CTR ↓)? → criativo fadigado,
      concorrente com oferta melhor (Auction Insights), mudança de SERP →
      ad-copywriter via ad-copy-builder.
```

### 4.4 CTR caiu
```
CTR ↓
├─ Posição/competição: Top IS e Abs Top IS caíram? → rank (lance/QS) ou
│  concorrente agressivo (Auction Insights).
├─ Cobertura: termos novos mais amplos diluindo o CTR? → match types/negativas.
├─ Criativo: mesmo anúncio há 8+ semanas com CTR derretendo lentamente? →
│  fadiga → ad-copy-builder.
└─ Sazonal/comportamental: queda simultânea em toda a vertical → pesquisar
   evidência externa (WebSearch, com fonte) ou declarar hipótese não confirmada.
```

---

## 5. Controles de qualidade de dado (gate obrigatório — rodar ANTES da análise)

### 5.1 Lag de conversão
- Conversões são atribuídas à **data do clique**, não à data da conversão: os últimos dias do período sempre parecem piores do que fecharão.
- **Procedimento:** medir o ciclo da própria conta (relatório de atraso de conversão / "dias até a conversão"): identificar em quantos dias ~90% das conversões fecham. Marcar como "parcial" todo dia mais recente que esse ciclo e preencher o Anexo A do template (refechamento com data).
- **Regra:** nenhuma decisão de corte pode citar como evidência exclusivamente dias em lag. Conversões offline importadas: somar o atraso do pipeline do cliente.

### 5.2 Janela e modelo de atribuição
- Mudou modelo (ex.: last click → data-driven) ou janela (30d → 7d) no meio do histórico comparado? **Comparação direta inválida** — relatório deve segmentar "antes/depois" e dizer isso na nota de método (seção 1.3 do template).
- Conversões fracionadas (decimais) são esperadas em data-driven — não "arredondar para consertar".

### 5.3 Definição de conversão
- Conferir antes de comparar períodos: mesmas ações primárias? Mesma contagem ("uma" vs "todas" por interação)? Nenhuma ação nova/pausada no meio? Qualquer mudança → tratar como quebra de série e reportar os períodos separadamente.

### 5.4 Integridade da medição (tag, consent, enhanced)
Checklist rápido — qualquer "sim" suspeito → acionar **tracking-engineer** via `tracking-blueprint` antes de concluir performance:
- [ ] Conversões zeradas ou caindo >50% de um dia para o outro com gasto estável? (tag/GTM/site)
- [ ] Valor de conversão zerado, duplicado ou em moeda errada? (tag de receita/dedup transaction_id)
- [ ] Mudança recente de CMP/banner de cookies? Consent Mode pode ter alterado a proporção de conversões **modeladas** vs observadas — degraus na série sem mudança de mídia são sintoma típico.
- [ ] Enhanced conversions ativadas/desativadas no período? (muda a taxa de captura, não a mídia)
- [ ] Auto-tagging (GCLID) desligado ou parâmetros sendo perdidos por redirect da LP?
- [ ] Discrepância forte entre plataforma e GA4/CRM? (atribuições diferentes explicam parte; quebra de tag explica o resto — quantificar antes de escolher a narrativa)

### 5.5 Comparabilidade de período
- Mesmo nº de dias (senão, médias diárias + nota). Mesma proporção dia útil/fim de semana quando o negócio for sensível a isso. Feriados, Black Friday, datas de campanha promocional: sinalizar em qual dos períodos caem.

---

## 6. Particularidades por tipo de campanha

### 6.1 Search
- KPIs plenos: CTR, CPC, CVR, CPA/ROAS, IS e perdas, QS por palavra. Leitura mais rica da conta.
- **Sempre separar marca vs não-marca** no relatório — sem isso, CTR/CVR/ROAS agregados mentem para cima.
- Termos de busca são a trilha de auditoria do CVR: queda de taxa → ler os termos antes de culpar a LP.

### 6.2 Performance Max (PMax)
- **Não há relatório completo de termos de busca** nem segmentação plena por canal — a leitura é por: grupos de recursos (asset groups), insights de termos (categorias), e distribuição por canal quando disponível.
- Queda de performance em PMax pode ser **mudança de mix de canal** (mais Display/YouTube, menos Shopping/Search) com a campanha "igual" por fora — sinalizar como hipótese quando os insights apontarem nessa direção.
- PMax captura demanda de marca por padrão — sem exclusão de marca configurada, o ROAS da PMax fica inflado e **não comparável** com Search não-marca; anotar no relatório se a exclusão existe (confirmar com pmax-specialist).
- IS de Search não cobre a PMax da mesma forma — não somar nem comparar diretamente.

### 6.3 Video / Display / Demand Gen
- CTR e CVR por clique têm leitura própria (intenção baixa, papel de topo/meio de funil): avaliar contra o **objetivo do estágio** definido no plano de mídia (alcance qualificado, custo por visualização/engajamento, conversões assistidas/view-through quando configuradas), não contra a régua de Search.
- Conversões view-through, quando reportadas, vêm separadas — nunca somar silenciosamente às conversões por clique.
- Frequência alta + CTR derretendo = fadiga de criativo → video-display-specialist via `video-display-builder`.

---

## 7. Política de benchmarks externos

1. **Nunca inventar número de mercado.** "CTR bom para a vertical é X%" sem fonte = proibido.
2. Quando o cliente pedir referência externa: pesquisar via WebSearch, citar fonte + data da publicação, e qualificar ("estudo da fonte Y, mercado Z, ano W — não necessariamente comparável à sua conta porque {{motivo}}").
3. **A referência padrão da TráfegoPRO é a própria conta:** mediana de 8 semanas para métricas de tráfego, metas contratadas para CPA/ROAS, série histórica para tendência.
4. Réguas internas citadas neste glossário e no template (faixas de semáforo, pisos de volume, limites de IS lost, régua de QS) são **heurísticas operacionais da casa** — o relatório deve apresentá-las como tal, nunca como "padrão do mercado".
