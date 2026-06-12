# Políticas do Google Ads — Mapa de Risco e Protocolo de Compliance — TráfegoPRO

> Documento operacional da skill `account-audit` (agente `account-auditor`).
> **Aviso permanente:** políticas do Google Ads mudam com frequência e variam por país. Este documento mapeia as **categorias e mecânicas** de política para orientar a auditoria — ele **não substitui** a documentação oficial. Para qualquer item de categoria sensível, regra com nuance regional, ou dúvida sobre vigência: **pesquisar via WebSearch na central de políticas oficial do Google Ads antes de classificar**. Nunca afirmar de memória o texto atual de uma política. Se a pesquisa não resolver, registrar a lacuna no relatório ("regra não verificada — risco classificado de forma conservadora").

---

## 1. As 4 famílias de política do Google Ads

Toda violação cai em uma destas famílias. Use-as para nomear achados no relatório:

1. **Conteúdo proibido** — anunciar isso é proibido em qualquer circunstância (ex.: produtos falsificados, produtos/serviços perigosos, facilitação de conduta desonesta, conteúdo inapropriado/chocante). Achado aqui ⇒ **BLOCKER + recomendação de não anunciar o item**, não há remediação.
2. **Práticas proibidas** — o *comportamento* do anunciante é o problema: abuso da rede (cloaking, malware, gateway pages), coleta e uso indevido de dados, **deturpação/misrepresentation** (promessas enganosas, omissão de informação de cobrança, identidade não confiável). É a família que mais derruba contas inteiras (suspensão), não só anúncios. Achado ⇒ **BLOCKER**.
3. **Conteúdo e recursos restritos** — permitido com condições: álcool, jogos de azar e apostas, saúde e medicamentos, serviços financeiros, conteúdo político, marcas registradas, conteúdo adulto, entre outros. Exige certificação, verificação, limitação geográfica ou de público. Achado ⇒ severidade conforme árvore da seção 3.
4. **Padrões editoriais e técnicos** — qualidade do anúncio e do destino: editorial (CAPS LOCK abusivo, pontuação!!, símbolos no lugar de palavras), requisitos de destino (LP fora do ar, mismatch de domínio, site em construção), requisitos técnicos, formato. Achado ⇒ geralmente CRITICAL (reprovação de anúncio), BLOCKER se sistêmico.

---

## 2. Mecânica de enforcement (o que está em jogo)

| Nível | O que acontece | Implicação para a auditoria |
|---|---|---|
| **Reprovação de anúncio** | Anúncio individual não veicula | Corrigível; CRITICAL se em massa |
| **Approved (limited)** | Veiculação restrita (geo, público, horário) | Verificar se a limitação inviabiliza o objetivo da campanha |
| **Strike** (em políticas selecionadas) | Sistema progressivo: advertência → strikes com bloqueio temporal crescente → suspensão. Strikes expiram após período sem reincidência | Conta com strike ativo: **congelar mudanças na área afetada** e tratar a causa antes de subir qualquer anúncio similar |
| **Suspensão de conta** | Conta inteira para; violações *egregious* (ex.: burlar sistemas, deturpação grave, fraude de pagamento) suspendem **sem aviso prévio** | Histórico de suspensão não resolvida = BLOCKER F-08. Contas relacionadas (mesmo cartão, mesmo domínio) podem ser suspensas em cadeia — avaliar o ecossistema do cliente |

**Regra TráfegoPRO:** risco de *reprovação* se administra; risco de *suspensão* se elimina antes do go-live. Qualquer achado com plausível leitura de "circumventing systems" ou "misrepresentation" é BLOCKER inegociável.

---

## 3. Árvore de decisão de risco por categoria de negócio

Aplicar no início da auditoria de compliance. Para cada ramo "sensível", **verificar a política vigente via WebSearch antes de concluir**.

```
O negócio do cliente envolve...

├─ Saúde? (clínicas, estética, medicamentos, suplementos, telemedicina, testes)
│   ├─ Vende/menciona medicamentos, substâncias ou termos de farmácia? → RESTRITO ALTO
│   │   → Verificar: necessidade de certificação local, termos proibidos em anúncio,
│   │     restrições de remarketing em saúde (personalização vedada p/ condições médicas)
│   ├─ Procedimentos estéticos / "antes e depois"? → RESTRITO MÉDIO
│   │   → LP não pode prometer resultado garantido; imagens chocantes (agulhas, sangue,
│   │     close de procedimento) reprovam; claims de cura = misrepresentation
│   └─ Conteúdo informativo de saúde → checar política de personalização (sem remarketing
│       baseado em condição de saúde — vale também p/ listas de público)
│
├─ Finanças? (crédito, investimento, cripto, seguros, recuperação de dívida)
│   → RESTRITO ALTO. Verificar OBRIGATORIAMENTE: exigência de verificação/certificação
│     de serviços financeiros no país-alvo (vários países exigem credenciamento junto
│     ao regulador local antes de anunciar), divulgação de taxas/condições na LP,
│     proibições específicas (ex.: certos produtos de crédito de curto prazo).
│     Cripto e oportunidades de investimento: entre as categorias mais sujeitas a
│     mudança de regra — nunca classificar sem pesquisa atual.
│
├─ Jogos de azar / apostas / fantasy / loteria?
│   → RESTRITO ALTO + certificação obrigatória por país + licença local.
│     Sem certificação comprovada = BLOCKER. Verificar regra vigente do país-alvo.
│
├─ Álcool, tabaco, armas, fogos, produtos adultos?
│   → Tabaco/armas funcionais: PROIBIDO (família 1) — BLOCKER, não anunciar.
│   → Álcool: restrito por país + sem público menor de idade. Verificar país-alvo.
│
├─ Educação/cursos com promessa de renda? ("ganhe X por mês", "fique rico")
│   → Risco de misrepresentation. Claims de ganho exigem disclaimers e base verificável;
│     "renda garantida" = BLOCKER. Auditar copy do ad-copywriter e a LP.
│
├─ Político / eleitoral / questões sociais?
│   → Verificação de anunciante político obrigatória onde exigida; janelas eleitorais
│     têm regras locais (no Brasil, legislação eleitoral própria). Pesquisar sempre.
│
├─ Usa marca de terceiro? (revenda, comparativo, assistência técnica)
│   → Política de trademark: uso em KEYWORD é geralmente permitido; uso no TEXTO do
│     anúncio pode ser reclamado pelo dono da marca. Revendedor autorizado tem caminhos
│     próprios. Registrar risco como WARNING + plano para eventual trademark complaint.
│
└─ Nenhum dos acima (varejo/serviço comum)
    → Risco-base. Auditar famílias 2 e 4 (práticas + editorial/destino) que valem
      para todos. Não pular a seção 4 deste documento.
```

**Saída desta etapa:** matriz de risco no relatório —

| Área | Categoria de política | Risco (Alto/Médio/Baixo) | Verificado via pesquisa? | Ação |
|---|---|---|---|---|
| ex.: claims da LP | Misrepresentation | Alto | Sim (data) | Reescrever seção de promessa — `cro-engineer` |

---

## 4. Checklist de compliance — anúncios e keywords

| ID | Item | Critério | Severidade |
|---|---|---|---|
| PC-01 | Editorial básico | Sem CAPS abusivo ("GRÁTIS AGORA"), sem pontuação repetida (!!), sem símbolos substituindo letras (R$$$, "✓✓✓"), sem número de telefone no texto do anúncio (usar call asset) | CRITICAL (reprova) |
| PC-02 | Claims verificáveis | Toda promessa quantificada no anúncio ("nº 1", "mais barato", "resultado em 7 dias") tem comprovação na LP ou foi removida | BLOCKER se claim de saúde/renda sem base |
| PC-03 | Superlativo proibido por categoria | "Cura", "garantido", "sem risco", "aprovação garantida" em saúde/finanças | BLOCKER |
| PC-04 | Trademark | Texto de anúncio não usa marca de terceiro sem enquadramento permitido (ver árvore) | CRITICAL |
| PC-05 | Clickbait/sensacionalismo | Sem táticas de medo, "você não vai acreditar", urgência falsa ("apenas hoje" permanente) | CRITICAL — família de práticas enganosas |
| PC-06 | Keywords proibidas | Lista de keywords não contém termos de categoria proibida/restrita não habilitada (substâncias, armas, marca de medicamento, etc.) | BLOCKER |
| PC-07 | DKI (dynamic keyword insertion) | Se usado, nenhum termo do grupo gera anúncio sem sentido ou com marca de terceiro inserida | WARNING |
| PC-08 | Idioma e ortografia | Anúncio no idioma do targeting, sem erros que disparem reprovação editorial | WARNING |
| PC-09 | Imagens (Display/PMax/Demand Gen) | Sem "antes/depois" em saúde, sem nudez/choque, sem botões falsos de play/download na imagem, texto sobre imagem dentro do aceitável | CRITICAL |
| PC-10 | Segmentação sensível | Nenhuma lista de público ou personalização baseada em categoria sensível (saúde, dificuldade financeira, religião, orientação sexual) — vale para remarketing | BLOCKER |

---

## 5. Checklist de compliance — landing page (requisitos de destino)

> Para problemas estruturais de LP que afetam conversão (não política), encaminhar ao `cro-engineer` via `lp-cro-audit`. Os itens abaixo são os de **política** — responsabilidade desta auditoria.

| ID | Item | Critério | Severidade |
|---|---|---|---|
| LP-01 | Disponibilidade | LP responde 200, sem soft-404, sem "em construção", carrega em mobile | BLOCKER |
| LP-02 | Mismatch de domínio | Display URL e domínio final coincidem; sem redirect para domínio diferente (violação de destination requirements) | BLOCKER |
| LP-03 | Identidade do negócio | Nome do negócio, CNPJ/razão social ou identificação clara, e canal de contato real visível — anonimato é gatilho de misrepresentation | BLOCKER |
| LP-04 | Transparência de cobrança | Se há venda/assinatura: preço, recorrência, condições de cancelamento e reembolso acessíveis ANTES da compra | BLOCKER (omissão de billing = suspensão) |
| LP-05 | Política de privacidade | Link visível para política de privacidade; se há formulário, descrição do uso dos dados (LGPD) | CRITICAL |
| LP-06 | Consentimento de cookies | Se a página instala cookies de ads/analytics e atende região que exige consentimento: banner funcional integrado ao consent mode (cruzar com item T-06 do checklist de auditoria) | BLOCKER para EEA/UK; CRITICAL demais casos |
| LP-07 | Pop-ups e interstitials | Sem pop-up que bloqueie o conteúdo no load, sem redirect automático, sem download forçado | CRITICAL |
| LP-08 | Conteúdo original | LP não é cópia rasa de outra (gateway/doorway page); conteúdo suficiente e útil | CRITICAL |
| LP-09 | Coerência anúncio↔LP | A oferta prometida no anúncio existe na LP, com os mesmos números (preço, desconto, prazo) | BLOCKER se promessa do anúncio não existe na LP |
| LP-10 | Claims regulados na LP | Saúde: sem promessa de cura/resultado garantido, com responsável técnico quando exigido; Finanças: taxas e disclaimers regulatórios; Renda: disclaimer de resultados não típicos | BLOCKER em categoria sensível |

---

## 6. Protocolo de remediação

### 6.1 Anúncio reprovado
1. Rodar script S-05 (radar de reprovações — ver `checklist-auditoria.md`) e listar o **policy topic** exato de cada reprovação.
2. Classificar: editorial/destino (corrigir e reenviar) × restrito (habilitar condição: certificação, verificação, geo) × proibido (remover e não recriar).
3. Corrigir a **causa**, não o sintoma: reescrever o anúncio "trocando uma palavra" para passar no filtro sem mudar a substância é circumventing systems ⇒ risco de suspensão. Encaminhar reescrita ao `ad-copywriter` (`ad-copy-builder`) com o policy topic anotado.
4. Após correção, apelar/reenviar para revisão. Documentar data e resultado no relatório.

### 6.2 Strike ou conta suspensa
1. **Congelar**: nenhuma campanha nova, nenhuma duplicação de anúncio na área atingida, **nunca criar conta nova para contornar** (suspensão em cadeia + violação grave).
2. Identificar a política citada na notificação; cruzar com as famílias da seção 1.
3. Montar dossiê de correção: o que violava, o que foi mudado (na conta E na LP), evidências.
4. Submeter apelo único e completo (apelos repetidos e vazios queimam credibilidade).
5. Registrar no relatório como BLOCKER até resolução confirmada por escrito na conta.

### 6.3 Reincidência
Se a mesma família de política reprova pela 2ª vez na mesma conta: escalar ao `ceo` e ao `traffic-strategist` com recomendação de revisão da oferta/posicionamento do cliente — o problema deixou de ser operacional e passou a ser de negócio.

---

## 7. Disciplina de verificação (resumo)

- **Sempre pesquisar antes de classificar**: categorias da árvore da seção 3, qualquer exigência de certificação/verificação, qualquer regra com variação por país.
- **Citar no relatório**: data da verificação e o que foi confirmado.
- **Nunca**: citar de memória limites, valores, listas de países ou textos de política; inventar benchmark de taxa de reprovação; prometer ao cliente que "o Google aprova".
- **Lacuna declarada > confiança falsa**: se não foi possível verificar, classificar de forma conservadora e escrever "não verificado" no achado.
