# Biblioteca de Google Ads Scripts — TráfegoPRO

Framework operacional da skill `gads-scripts`. Contém: procedimento de instalação e agendamento, limites de plataforma, convenções de código, os 4 scripts canônicos completos (JavaScript), tabela de decisão sintoma→script, checklist de QA pré-agendamento e troubleshooting.

> **Princípio da biblioteca:** scripts são a camada de **vigilância** da conta — eles leem, calculam e avisam. Eles **não** alteram a conta. Mudança na conta é decisão registrada no fluxo `optimization-routine`, executada pelo agente optimization-executor.

---

## 1. Instalação e agendamento (procedimento geral)

### 1.1 Onde os scripts vivem

Na interface do Google Ads (conta única):

1. Menu **Ferramentas** (ícone de chave) → **Ações em massa** → **Scripts**.
2. Botão **+** (novo script) → apagar o esqueleto `function main() {}` → colar o código completo da biblioteca.
3. Nomear o script seguindo a naming convention da seção 1.5.
4. Clicar em **Autorizar** e aceitar as permissões com a conta Google do operador (o script roda *como esse usuário* — ver 1.4).
5. **Pré-visualizar (Preview)** → abrir as abas **Registros/Logs** e **Alterações** → validar contra o checklist da seção 8.
6. **Salvar** e configurar a **Frequência** (coluna "Frequência" na lista de scripts).

Em **MCC**: o caminho é o mesmo, no nível da conta de administrador. Scripts de MCC usam `AdsManagerApp` para iterar contas-filhas (ver 1.6). Os 4 scripts desta biblioteca são entregues, por padrão, em **nível de conta** — instalar um por conta-cliente. Variante MCC só sob demanda (Modo Customizar).

### 1.2 Frequências recomendadas (padrão da casa)

| Script | Frequência | Horário sugerido | Por quê |
|---|---|---|---|
| 01 — Alerta de Anomalia de Gasto | **De hora em hora** | — | Anomalia de gasto precisa ser pega no mesmo dia, não no relatório do dia seguinte |
| 02 — Pacing de Orçamento | **Diário** | 06h (fuso da conta) | Roda antes do horário comercial, com os dados do dia anterior já consolidados |
| 03 — Minerador de Termos | **Semanal** | Segunda, 05h | Janela de 30 dias muda pouco; semanal evita ruído e alimenta a rotina semanal de otimização |
| 04 — Monitor de Link Quebrado | **Diário** | 04h | Página caída de madrugada precisa aparecer no alerta da manhã |

### 1.3 Limites de plataforma (declarar sempre na entrega)

- **30 minutos** de execução por rodada (conta única e MCC). Script que estoura é finalizado com `Exceeded maximum execution time` — por isso os scripts 03 e 04 têm `LIMIT`/fatiamento embutidos.
- **`UrlFetchApp`**: na ordem de 20.000 chamadas/dia por conta — o script 04 controla isso via `MAX_URLS_POR_EXECUCAO` e cache de revisita.
- **`MailApp`**: quota diária de envio da conta Google autorizadora (quota de consumidor é baixa). Por isso os scripts **agrupam tudo em 1 e-mail por execução** — nunca 1 e-mail por item.
- **Preview não altera a conta, mas executa de verdade** e-mails, escrita em planilha e `UrlFetchApp`. Testar com `EMAILS_TESTE` antes de apontar para o cliente.
- Os códigos usam `const`/`let`, template strings e arrow functions — exigem a **experiência atual de Google Ads Scripts** (padrão desde a migração do AdWords Scripts). Se a conta ainda mostrar o editor legado, atualizar antes.

### 1.4 Identidade e permissões

- O script roda **como o usuário que autorizou**. Se esse usuário perder acesso à conta (ou trocar de senha com revogação de sessões), o script para com erro de autorização — reautorizar (seção 9).
- A planilha de relatório/estado deve ser **compartilhada como Editor** com o usuário autorizador. Padrão da casa: uma planilha por conta-cliente, nome `TP — Scripts — <Conta>`, com as abas que cada script cria sozinho.
- Nunca pedir login/senha do cliente. A instalação é feita por quem já está autenticado.

### 1.5 Naming convention de scripts

```
[TP] <nº> — <nome> — v<versão>
Ex.: [TP] 01 — Alerta Anomalia de Gasto — v1.0
     [TP] 03 — Minerador de Termos — v1.2
```

Toda alteração de threshold ou lógica incrementa a versão e é registrada no bloco "Scripts ativos nesta conta" do output da skill.

### 1.6 Nota MCC (quando o cliente pedir variante multi-conta)

- `AdsManagerApp.accounts()` itera contas-filhas; `executeInParallel(fn, callback)` processa até **50 contas** por execução, cada uma com seu próprio teto de tempo, e o `callback` consolida.
- Selecionar contas por **label de MCC** (`.withCondition("LabelNames CONTAINS '...'")`) — nunca "todas as contas" sem filtro.
- Alertas consolidados: o callback monta **um** e-mail com a tabela de todas as contas fora de banda.

---

## 2. Convenções comuns dos 4 scripts

Toda customização (Modo Customizar) preserva estas convenções:

1. **Bloco `CONFIG` único no topo.** Tudo que é ajustável fica ali; nada de número mágico no meio do código. Pendência de preenchimento usa o marcador `<<PREENCHER: ...>>` — o script se recusa a rodar enquanto existir marcador (função `validarConfig_`).
2. **Custo em micros convertido uma única vez.** A API devolve `metrics.cost_micros`; dividir por `1e6` no ponto de leitura (`micros / 1e6`) e nunca mais tocar.
3. **Fuso horário da conta, sempre.** Nunca usar `new Date()` cru para formatar data/hora: usar `Utilities.formatDate(data, TZ, formato)` com `TZ = AdsApp.currentAccount().getTimeZone()`. Divergência de fuso é a causa nº 1 de "número diferente da interface" (seção 9).
4. **GAQL nos relatórios** (`AdsApp.report("SELECT ...")`), acesso a colunas pelo nome completo: `row['metrics.cost_micros']`.
5. **Um e-mail por execução**, assunto com prefixo `[TP][<CONTA>]`, corpo em texto puro com tabela simples. Destinatários em `CONFIG.EMAILS` (string separada por vírgula).
6. **Funções auxiliares com sufixo `_`** (privadas), `main()` curto e legível de cima a baixo.
7. **Logs falam.** `Logger.log` no início (config efetiva), nas decisões (alertou / não alertou e por quê) e no fim (resumo). Log mudo é bug.
8. **Read-only por padrão.** Nenhum script desta biblioteca chama métodos de mutação (`pause()`, `applyLabel` em entidades de campanha, `createNegativeKeyword`, `setAmount` etc.). Se uma variante de mutação for aprovada, ela nasce com `CONFIG.MODO_SOMENTE_LEITURA = true` por padrão.

Validador padrão, presente em todos os scripts:

```javascript
function validarConfig_(config) {
  const pendencias = [];
  Object.keys(config).forEach((chave) => {
    const valor = config[chave];
    if (typeof valor === 'string' && valor.indexOf('<<PREENCHER') !== -1) {
      pendencias.push(chave);
    }
  });
  if (pendencias.length > 0) {
    throw new Error('CONFIG incompleto. Preencha: ' + pendencias.join(', '));
  }
}
```

---

## 3. Script 01 — Alerta de Anomalia de Gasto

### 3.1 O que ele faz

A cada hora, compara o **gasto acumulado de hoje** com a **média do gasto acumulado até a mesma hora nos mesmos dias da semana** das últimas N semanas (terça se compara com terças — gasto de fim de semana não polui a régua de dia útil). Dispara e-mail em três cenários:

- **GASTO_ALTO** — gasto de hoje ≥ `MULTIPLICADOR_ALTA ×` a média histórica até esta hora (e acima do piso anti-ruído).
- **GASTO_ZERO** — já passou de `HORA_MINIMA_GASTO` e a conta não gastou nada, embora historicamente já tivesse gastado (conta parada: pagamento recusado, campanhas reprovadas, site fora do ar).
- **GASTO_BAIXO** (opcional) — gasto ≤ `MULTIPLICADOR_BAIXA ×` a média (entrega despencou).

Anti-spam: guarda na planilha o último alerta do dia por tipo e não repete o mesmo alerta no mesmo dia.

### 3.2 Calibragem dos thresholds (sem inventar benchmark)

- `MULTIPLICADOR_ALTA`: padrão conservador **1,8** (80% acima do histórico). Após 4 semanas de execução, recalibrar olhando os falsos positivos no log — conta pequena/volátil tende a precisar de 2,0–2,5; conta grande e estável aceita 1,5. **A régua é o histórico da própria conta, nunca "média de mercado".**
- `SEMANAS_HISTORICO`: padrão **4**. Conta com sazonalidade forte intra-mês (ver output da skill `budget-pacing`): usar 8.
- `PISO_GASTO_ALERTA`: piso em moeda da conta para não alertar sobre variação percentual de valores irrisórios. Padrão: ~5% do orçamento diário total da conta.
- Conta com **menos de 4 semanas de histórico**: instalar mesmo assim só com o cenário GASTO_ZERO ativo (`MULTIPLICADOR_ALTA = 0` desliga o cenário de alta) e ativar o resto quando houver régua.

### 3.3 Código completo

```javascript
/**
 * [TP] 01 — Alerta Anomalia de Gasto — v1.0
 * TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads
 *
 * Frequência: DE HORA EM HORA.
 * Read-only: não altera nada na conta. Lê gasto, compara com histórico, avisa por e-mail.
 * Estado anti-spam: aba "estado_anomalia" da planilha CONFIG.SHEET_URL.
 */

const CONFIG = {
  // Destinatários dos alertas, separados por vírgula.
  EMAILS: '<<PREENCHER: emails de alerta, ex. gestor@cliente.com,alertas@trafegopro.com>>',

  // Planilha "TP — Scripts — <Conta>" compartilhada como Editor com o usuário autorizador.
  SHEET_URL: '<<PREENCHER: URL da planilha Google>>',

  // Nome curto da conta para o assunto do e-mail.
  NOME_CONTA: '<<PREENCHER: ex. ClienteX-BR>>',

  // Quantas semanas de histórico usar como régua (mesmos dias da semana).
  SEMANAS_HISTORICO: 4,

  // Gasto de hoje >= MULTIPLICADOR_ALTA x média histórica até esta hora => alerta GASTO_ALTO.
  // 0 desliga o cenário (use em conta sem histórico).
  MULTIPLICADOR_ALTA: 1.8,

  // Gasto de hoje <= MULTIPLICADOR_BAIXA x média histórica => alerta GASTO_BAIXO. 0 desliga.
  MULTIPLICADOR_BAIXA: 0.3,

  // Piso (moeda da conta) abaixo do qual variação não gera alerta — anti-ruído.
  PISO_GASTO_ALERTA: 50,

  // A partir desta hora (fuso da conta), gasto zerado com histórico positivo => alerta GASTO_ZERO.
  HORA_MINIMA_GASTO: 10,
};

function main() {
  validarConfig_(CONFIG);

  const conta = AdsApp.currentAccount();
  const TZ = conta.getTimeZone();
  const MOEDA = conta.getCurrencyCode();
  const agora = new Date();
  const horaAtual = Number(Utilities.formatDate(agora, TZ, 'H'));
  const hojeStr = Utilities.formatDate(agora, TZ, 'yyyy-MM-dd');

  // 1) Gasto de hoje, acumulado até agora.
  const gastoHoje = conta.getStatsFor('TODAY').getCost();

  // 2) Média histórica acumulada até a hora atual, mesmos dias da semana.
  const datasHistorico = datasMesmoDiaDaSemana_(CONFIG.SEMANAS_HISTORICO, TZ);
  const mediaHistorica = mediaAcumuladaAteHora_(datasHistorico, horaAtual, TZ);

  Logger.log('Hora atual (conta): %s | Gasto hoje: %s %s | Média histórica até %sh: %s %s',
    horaAtual, MOEDA, gastoHoje.toFixed(2), horaAtual, MOEDA, mediaHistorica.toFixed(2));

  // 3) Classificar.
  let tipo = null;
  let detalhe = '';

  if (horaAtual >= CONFIG.HORA_MINIMA_GASTO && gastoHoje === 0 && mediaHistorica > 0) {
    tipo = 'GASTO_ZERO';
    detalhe = 'A conta nao gastou NADA ate agora, mas historicamente ja teria gastado ' +
      MOEDA + ' ' + mediaHistorica.toFixed(2) + ' ate as ' + horaAtual + 'h. ' +
      'Verificar: forma de pagamento, reprovacao de anuncios/campanhas, site fora do ar.';
  } else if (CONFIG.MULTIPLICADOR_ALTA > 0 &&
             gastoHoje >= CONFIG.PISO_GASTO_ALERTA &&
             mediaHistorica > 0 &&
             gastoHoje >= CONFIG.MULTIPLICADOR_ALTA * mediaHistorica) {
    tipo = 'GASTO_ALTO';
    detalhe = 'Gasto de hoje (' + MOEDA + ' ' + gastoHoje.toFixed(2) + ') ja esta ' +
      (gastoHoje / mediaHistorica).toFixed(1) + 'x acima da media historica ate esta hora (' +
      MOEDA + ' ' + mediaHistorica.toFixed(2) + '). Verificar: mudanca recente de orcamento/lance, ' +
      'leilao anomalo, campanha nova sem teto.';
  } else if (CONFIG.MULTIPLICADOR_BAIXA > 0 &&
             mediaHistorica >= CONFIG.PISO_GASTO_ALERTA &&
             gastoHoje > 0 &&
             gastoHoje <= CONFIG.MULTIPLICADOR_BAIXA * mediaHistorica) {
    tipo = 'GASTO_BAIXO';
    detalhe = 'Gasto de hoje (' + MOEDA + ' ' + gastoHoje.toFixed(2) + ') esta em apenas ' +
      Math.round(100 * gastoHoje / mediaHistorica) + '% da media historica ate esta hora (' +
      MOEDA + ' ' + mediaHistorica.toFixed(2) + '). Verificar: entrega, status das campanhas, ' +
      'rejeicoes, mudanca de lance recente.';
  }

  if (!tipo) {
    Logger.log('Sem anomalia. Nenhum alerta enviado.');
    return;
  }

  // 4) Anti-spam: 1 alerta por tipo por dia.
  if (jaAlertouHoje_(hojeStr, tipo)) {
    Logger.log('Anomalia %s ja alertada hoje. Suprimindo e-mail repetido.', tipo);
    return;
  }

  // 5) E-mail.
  const assunto = '[TP][' + CONFIG.NOME_CONTA + '] Anomalia de gasto: ' + tipo +
    ' (' + hojeStr + ' ' + horaAtual + 'h)';
  const corpo = [
    'Script: [TP] 01 - Alerta Anomalia de Gasto',
    'Conta: ' + CONFIG.NOME_CONTA + ' (' + conta.getCustomerId() + ')',
    'Data/hora (fuso da conta): ' + hojeStr + ' ' + horaAtual + 'h',
    '',
    'TIPO: ' + tipo,
    detalhe,
    '',
    'Gasto acumulado hoje: ' + MOEDA + ' ' + gastoHoje.toFixed(2),
    'Media historica ate esta hora (mesmo dia da semana, ' + CONFIG.SEMANAS_HISTORICO +
      ' semanas): ' + MOEDA + ' ' + mediaHistorica.toFixed(2),
    '',
    'Este alerta e read-only: nada foi alterado na conta.',
    'Proximo passo: registrar a investigacao no fluxo optimization-routine.',
  ].join('\n');

  MailApp.sendEmail(CONFIG.EMAILS, assunto, corpo);
  registrarAlerta_(hojeStr, tipo, gastoHoje, mediaHistorica);
  Logger.log('Alerta %s enviado para %s.', tipo, CONFIG.EMAILS);
}

/** Datas (yyyy-MM-dd) dos mesmos dias da semana nas ultimas N semanas. */
function datasMesmoDiaDaSemana_(numSemanas, tz) {
  const datas = [];
  const agora = new Date();
  for (let i = 1; i <= numSemanas; i++) {
    const d = new Date(agora.getTime() - i * 7 * 24 * 60 * 60 * 1000);
    datas.push(Utilities.formatDate(d, tz, 'yyyy-MM-dd'));
  }
  return datas;
}

/** Media do gasto acumulado ate (exclusive) a hora indicada, nas datas informadas. */
function mediaAcumuladaAteHora_(datas, horaLimite, tz) {
  if (datas.length === 0 || horaLimite === 0) return 0;
  const inicio = datas[datas.length - 1]; // mais antiga
  const fim = datas[0];                   // mais recente
  const query =
    'SELECT segments.date, segments.hour, metrics.cost_micros ' +
    'FROM customer ' +
    "WHERE segments.date BETWEEN '" + inicio + "' AND '" + fim + "'";
  const rows = AdsApp.report(query).rows();
  const somaPorData = {};
  datas.forEach((d) => { somaPorData[d] = 0; });
  while (rows.hasNext()) {
    const row = rows.next();
    const data = row['segments.date'];
    const hora = Number(row['segments.hour']);
    if (somaPorData.hasOwnProperty(data) && hora < horaLimite) {
      somaPorData[data] += Number(row['metrics.cost_micros']) / 1e6;
    }
  }
  const soma = datas.reduce((acc, d) => acc + somaPorData[d], 0);
  return soma / datas.length;
}

/** Anti-spam diario por tipo, persistido na aba "estado_anomalia". */
function abaEstado_() {
  const planilha = SpreadsheetApp.openByUrl(CONFIG.SHEET_URL);
  let aba = planilha.getSheetByName('estado_anomalia');
  if (!aba) {
    aba = planilha.insertSheet('estado_anomalia');
    aba.appendRow(['data', 'tipo', 'gasto', 'media_historica', 'registrado_em']);
  }
  return aba;
}

function jaAlertouHoje_(dataStr, tipo) {
  const valores = abaEstado_().getDataRange().getValues();
  for (let i = 1; i < valores.length; i++) {
    if (String(valores[i][0]) === dataStr && String(valores[i][1]) === tipo) return true;
  }
  return false;
}

function registrarAlerta_(dataStr, tipo, gasto, media) {
  abaEstado_().appendRow([dataStr, tipo, gasto, media, new Date()]);
}

function validarConfig_(config) {
  const pendencias = [];
  Object.keys(config).forEach((chave) => {
    const valor = config[chave];
    if (typeof valor === 'string' && valor.indexOf('<<PREENCHER') !== -1) pendencias.push(chave);
  });
  if (pendencias.length > 0) {
    throw new Error('CONFIG incompleto. Preencha: ' + pendencias.join(', '));
  }
}
```

### 3.4 Instalação específica

1. Criar/abrir a planilha `TP — Scripts — <Conta>` e compartilhar como Editor com o usuário autorizador (a aba `estado_anomalia` é criada sozinha).
2. Preencher `CONFIG` (na primeira instalação, usar `EMAILS` de teste).
3. Colar na conta (seção 1.1), Autorizar, **Preview** → conferir no log a hora, o gasto e a decisão.
4. Agendar **de hora em hora**. Trocar `EMAILS` de teste pelos definitivos.
5. Agendar recalibragem dos multiplicadores para **+4 semanas** (registrar no bloco "Scripts ativos nesta conta").

---

## 4. Script 02 — Monitor de Pacing de Orçamento

### 4.1 O que ele faz

Todo dia de manhã: calcula gasto **acumulado do mês (dias fechados)**, compara com o ritmo ideal da verba mensal, projeta o fechamento do mês, sugere o orçamento diário para os dias restantes e grava uma linha na planilha (série histórica do mês). E-mail **só quando sai da banda** de tolerância — checkpoint silencioso quando está tudo bem.

É o braço automatizado da skill `budget-pacing`: o script vigia todo dia; a decisão de redistribuir/escalar/cortar continua sendo do traffic-strategist via `budget-pacing` + `optimization-routine`. Os valores de `VERBA_MENSAL` e banda devem vir do plano de pacing vigente (output `pacing-plan-<conta>-<AAAA-MM>.md`), quando existir.

### 4.2 Definições (idênticas às da skill `budget-pacing`)

```
dias_decorridos   = dia_do_mes - 1            (apenas dias fechados)
gasto_ideal       = verba_mensal × dias_decorridos / dias_no_mes
pacing_index      = gasto_realizado / gasto_ideal
projecao_linear   = gasto_realizado / dias_decorridos × dias_no_mes
sugestao_diaria   = (verba_mensal - gasto_realizado) / dias_restantes
Banda padrão: 0,85 ≤ pacing_index ≤ 1,15  →  OK (sem e-mail)
```

No dia 1 do mês não há dia fechado: o script grava a linha de abertura e não alerta.

### 4.3 Código completo

```javascript
/**
 * [TP] 02 — Monitor de Pacing de Orçamento — v1.0
 * TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads
 *
 * Frequência: DIÁRIO (06h, fuso da conta).
 * Read-only: calcula pacing, grava série na planilha, alerta quando sai da banda.
 * Fonte dos parâmetros: plano de pacing vigente (skill budget-pacing).
 */

const CONFIG = {
  EMAILS: '<<PREENCHER: emails de alerta>>',
  SHEET_URL: '<<PREENCHER: URL da planilha TP — Scripts — <Conta>>>',
  NOME_CONTA: '<<PREENCHER: ex. ClienteX-BR>>',

  // Verba mensal aprovada (moeda da conta). Vem do plano de pacing / media plan.
  VERBA_MENSAL: 0, // <<PREENCHER: numero — manter 0 forca erro do validador abaixo>>

  // Banda de tolerância do pacing index (padrão da casa: 0.85–1.15).
  BANDA_MIN: 0.85,
  BANDA_MAX: 1.15,

  // Quantas campanhas listar no detalhamento do e-mail.
  TOP_CAMPANHAS: 10,
};

function main() {
  validarConfig_(CONFIG);
  if (!(CONFIG.VERBA_MENSAL > 0)) {
    throw new Error('CONFIG.VERBA_MENSAL precisa ser > 0 (use o valor do plano de pacing).');
  }

  const conta = AdsApp.currentAccount();
  const TZ = conta.getTimeZone();
  const MOEDA = conta.getCurrencyCode();
  const agora = new Date();

  const ano = Number(Utilities.formatDate(agora, TZ, 'yyyy'));
  const mes = Number(Utilities.formatDate(agora, TZ, 'M'));
  const diaDoMes = Number(Utilities.formatDate(agora, TZ, 'd'));
  const diasNoMes = new Date(ano, mes, 0).getDate();
  const hojeStr = Utilities.formatDate(agora, TZ, 'yyyy-MM-dd');

  const aba = abaPacing_();

  if (diaDoMes === 1) {
    aba.appendRow([hojeStr, 0, 0, 0, '-', '-', '-', 'ABERTURA DO MES — verba ' + CONFIG.VERBA_MENSAL]);
    Logger.log('Dia 1: linha de abertura gravada. Sem pacing ainda.');
    return;
  }

  const diasDecorridos = diaDoMes - 1;
  const diasRestantes = diasNoMes - diasDecorridos;

  // Gasto realizado: do dia 1 ate ontem (dias fechados), via getStatsFor(yyyyMMdd, yyyyMMdd).
  const inicioMes = pad2_(ano) + pad2m_(mes) + '01';
  const ontem = new Date(agora.getTime() - 24 * 60 * 60 * 1000);
  const ontemStr = Utilities.formatDate(ontem, TZ, 'yyyyMMdd');
  const realizado = conta.getStatsFor(inicioMes, ontemStr).getCost();

  const ideal = CONFIG.VERBA_MENSAL * diasDecorridos / diasNoMes;
  const pacingIndex = ideal > 0 ? realizado / ideal : 0;
  const projecao = realizado / diasDecorridos * diasNoMes;
  const sugestaoDiaria = Math.max(0, (CONFIG.VERBA_MENSAL - realizado) / diasRestantes);

  let status = 'OK';
  if (pacingIndex < CONFIG.BANDA_MIN) status = 'SUBPACING';
  if (pacingIndex > CONFIG.BANDA_MAX) status = 'SOBREPACING';
  if (realizado >= CONFIG.VERBA_MENSAL) status = 'VERBA_ESGOTADA';

  Logger.log('Dia %s/%s | realizado %s %s | ideal %s | index %s | projecao %s | status %s',
    diasDecorridos, diasNoMes, MOEDA, realizado.toFixed(2), ideal.toFixed(2),
    pacingIndex.toFixed(2), projecao.toFixed(2), status);

  // Serie historica na planilha (1 linha/dia).
  aba.appendRow([
    hojeStr, realizado, ideal, Number(pacingIndex.toFixed(3)),
    projecao, sugestaoDiaria, status, '',
  ]);

  if (status === 'OK') {
    Logger.log('Dentro da banda. Sem e-mail.');
    return;
  }

  // Detalhamento por campanha (MTD) para o e-mail.
  const inicioGaql = Utilities.formatDate(new Date(ano, mes - 1, 1), TZ, 'yyyy-MM-dd');
  const fimGaql = Utilities.formatDate(ontem, TZ, 'yyyy-MM-dd');
  const linhasCampanha = topCampanhasPorGasto_(inicioGaql, fimGaql, CONFIG.TOP_CAMPANHAS);

  const assunto = '[TP][' + CONFIG.NOME_CONTA + '] Pacing ' + status +
    ' — index ' + pacingIndex.toFixed(2) + ' (' + hojeStr + ')';
  const corpo = [
    'Script: [TP] 02 - Monitor de Pacing de Orcamento',
    'Conta: ' + CONFIG.NOME_CONTA + ' (' + conta.getCustomerId() + ')',
    'Mes: ' + mes + '/' + ano + ' | Dias fechados: ' + diasDecorridos + '/' + diasNoMes,
    '',
    'STATUS: ' + status,
    'Verba mensal: ' + MOEDA + ' ' + CONFIG.VERBA_MENSAL.toFixed(2),
    'Realizado (dias fechados): ' + MOEDA + ' ' + realizado.toFixed(2),
    'Ideal ate ontem: ' + MOEDA + ' ' + ideal.toFixed(2),
    'Pacing index: ' + pacingIndex.toFixed(2) + ' (banda ' + CONFIG.BANDA_MIN + '-' + CONFIG.BANDA_MAX + ')',
    'Projecao linear de fechamento: ' + MOEDA + ' ' + projecao.toFixed(2),
    'Orcamento diario sugerido p/ dias restantes (' + diasRestantes + '): ' +
      MOEDA + ' ' + sugestaoDiaria.toFixed(2),
    '',
    'Top campanhas por gasto no mes:',
    linhasCampanha,
    '',
    'Este alerta e read-only: nada foi alterado na conta.',
    'Decisao de redistribuir/escalar/cortar: skill budget-pacing (modo checkpoint) -> optimization-routine.',
  ].join('\n');

  MailApp.sendEmail(CONFIG.EMAILS, assunto, corpo);
  Logger.log('Alerta %s enviado.', status);
}

function topCampanhasPorGasto_(inicio, fim, topN) {
  const query =
    'SELECT campaign.name, metrics.cost_micros, metrics.conversions ' +
    'FROM campaign ' +
    "WHERE segments.date BETWEEN '" + inicio + "' AND '" + fim + "' " +
    'AND metrics.cost_micros > 0 ' +
    'ORDER BY metrics.cost_micros DESC ' +
    'LIMIT ' + topN;
  const rows = AdsApp.report(query).rows();
  const linhas = [];
  while (rows.hasNext()) {
    const row = rows.next();
    linhas.push(
      ' - ' + row['campaign.name'] +
      ' | gasto ' + (Number(row['metrics.cost_micros']) / 1e6).toFixed(2) +
      ' | conv ' + Number(row['metrics.conversions']).toFixed(1)
    );
  }
  return linhas.join('\n') || ' (sem gasto registrado)';
}

function abaPacing_() {
  const planilha = SpreadsheetApp.openByUrl(CONFIG.SHEET_URL);
  let aba = planilha.getSheetByName('pacing');
  if (!aba) {
    aba = planilha.insertSheet('pacing');
    aba.appendRow(['data', 'realizado', 'ideal', 'pacing_index',
      'projecao_fechamento', 'sugestao_diaria_restante', 'status', 'obs']);
  }
  return aba;
}

function pad2_(n) { return String(n); }
function pad2m_(n) { return (n < 10 ? '0' : '') + n; }

function validarConfig_(config) {
  const pendencias = [];
  Object.keys(config).forEach((chave) => {
    const valor = config[chave];
    if (typeof valor === 'string' && valor.indexOf('<<PREENCHER') !== -1) pendencias.push(chave);
  });
  if (pendencias.length > 0) {
    throw new Error('CONFIG incompleto. Preencha: ' + pendencias.join(', '));
  }
}
```

### 4.4 Instalação específica

1. Preencher `VERBA_MENSAL` com o valor do plano de pacing vigente — se não existir plano, rodar antes a skill `budget-pacing` (Modo Plano) ou registrar a lacuna na entrega.
2. **Virada de mês**: a verba do mês seguinte deve ser atualizada no CONFIG até o dia 1 — incluir esse passo na rotina mensal do `optimization-routine`.
3. Preview no meio do mês deve bater (tolerância de centavos) com "Custo" da visão de campanhas filtrada para "Este mês (dias fechados)". Divergência → seção 9.7.
4. Agendar **diário, 06h**.

---

## 5. Script 03 — Minerador de Termos para Negativação

### 5.1 O que ele faz

Uma vez por semana, varre o relatório de **termos de pesquisa** dos últimos 30 dias e separa **candidatos a negativação** por três réguas objetivas, gravando tudo em planilha com motivo, métrica e sugestão de match type — mais uma aba de **tokens recorrentes** (análise de n-grama simples) para sugerir negativas de frase que matam famílias inteiras de termo lixo.

**O script não aplica negativa nenhuma.** A lista é insumo da rotina semanal: o traffic-strategist/search-specialist revisa, e a aplicação entra no fluxo `optimization-routine` (executada pelo optimization-executor). Termo barato hoje pode ser o termo-ouro de amanhã — negativar é decisão, não automatismo.

### 5.2 Réguas de corte (e como calibrar)

| Régua | Condição padrão | Calibragem |
|---|---|---|
| **R1 — Custo sem conversão** | `conversions = 0` E `custo ≥ CUSTO_MAX_SEM_CONV` | Padrão da casa: **1,5 × CPA-alvo** da conta. Sem CPA-alvo definido: usar o CPA médio da própria conta nos últimos 90 dias. Não existe número de mercado válido aqui — é régua interna. |
| **R2 — Cliques sem conversão** | `conversions = 0` E `cliques ≥ CLIQUES_MAX_SEM_CONV` | Padrão conservador: **12 cliques**. Conta de ticket alto/ciclo longo (conversão demora a registrar): subir para 20+ e considerar `all_conversions`. |
| **R3 — Padrão irrelevante** | termo casa com regex da `PADROES_IRRELEVANTES` | Lista construída com o cliente: "grátis", "vaga", "emprego", "curso", "o que é", "como fazer", concorrentes que não se quer disputar etc. Sempre revisar — regex pega inocente. |
| **Proteção** | termo contém item de `TERMOS_PROTEGIDOS` | Marca, produto, termos-ouro. Termo protegido **nunca** entra na lista, mesmo batendo R1/R2/R3. |

Janela: `LAST_30_DAYS`. Conta de baixo volume pode usar 60–90 dias (Modo Customizar) — mas aí as conversões "atrasadas" pesam mais; conferir a observação de data de conversão na seção 9.7.

### 5.3 Código completo

```javascript
/**
 * [TP] 03 — Minerador de Termos para Negativação — v1.0
 * TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads
 *
 * Frequência: SEMANAL (segunda, 05h).
 * Read-only: NAO aplica negativas. Gera candidatos em planilha + resumo por e-mail.
 * Aplicacao de negativas: decisao registrada no fluxo optimization-routine.
 */

const CONFIG = {
  EMAILS: '<<PREENCHER: emails do resumo semanal>>',
  SHEET_URL: '<<PREENCHER: URL da planilha TP — Scripts — <Conta>>>',
  NOME_CONTA: '<<PREENCHER: ex. ClienteX-BR>>',

  // R1: custo sem conversao. Padrao da casa: 1.5 x CPA-alvo da conta.
  CUSTO_MAX_SEM_CONV: 0, // <<PREENCHER: numero — ex. CPA-alvo 80 => 120>>

  // R2: cliques sem conversao.
  CLIQUES_MAX_SEM_CONV: 12,

  // R3: padroes (regex, case-insensitive) de termo irrelevante para o negocio.
  // Construir COM o cliente. Exemplos genericos — substituir pelos do nicho:
  PADROES_IRRELEVANTES: [
    'gr[aá]tis',
    'gratuito',
    '\\bvagas?\\b',
    '\\bemprego\\b',
    '\\bcurso\\b',
    'o que (e|é)',
    'como fazer',
    'sal[aá]rio',
  ],

  // Termos protegidos: se o termo de pesquisa CONTIVER um destes, nunca e candidato.
  // Minimo obrigatorio: a marca do cliente.
  TERMOS_PROTEGIDOS: [
    '<<PREENCHER: marca do cliente em minusculas>>',
  ],

  // Analise de tokens: token presente em >= N candidatos vira sugestao de negativa de frase.
  MIN_OCORRENCIAS_TOKEN: 3,

  // Teto de linhas lidas do relatorio (protecao contra timeout de 30 min).
  LIMITE_LINHAS: 10000,
};

const STOPWORDS_PT = ['de', 'da', 'do', 'das', 'dos', 'a', 'o', 'as', 'os', 'e', 'em',
  'no', 'na', 'nos', 'nas', 'um', 'uma', 'para', 'pra', 'por', 'com', 'que', 'se',
  'ou', 'ao', 'aos', 'me', 'meu', 'minha', 'mais', 'qual', 'quais'];

function main() {
  validarConfig_(CONFIG);
  if (!(CONFIG.CUSTO_MAX_SEM_CONV > 0)) {
    throw new Error('CONFIG.CUSTO_MAX_SEM_CONV precisa ser > 0 (regra: 1.5 x CPA-alvo).');
  }

  const conta = AdsApp.currentAccount();
  const TZ = conta.getTimeZone();
  const MOEDA = conta.getCurrencyCode();
  const hojeStr = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');

  const regexes = CONFIG.PADROES_IRRELEVANTES.map((p) => new RegExp(p, 'i'));
  const protegidos = CONFIG.TERMOS_PROTEGIDOS.map((t) => t.toLowerCase());

  const query =
    'SELECT campaign.name, ad_group.name, search_term_view.search_term, ' +
    'metrics.impressions, metrics.clicks, metrics.cost_micros, metrics.conversions ' +
    'FROM search_term_view ' +
    'WHERE segments.date DURING LAST_30_DAYS ' +
    'AND metrics.clicks >= 1 ' +
    'ORDER BY metrics.cost_micros DESC ' +
    'LIMIT ' + CONFIG.LIMITE_LINHAS;

  const rows = AdsApp.report(query).rows();
  const candidatos = [];
  let totalLinhas = 0;
  let custoCandidatos = 0;

  while (rows.hasNext()) {
    const row = rows.next();
    totalLinhas++;
    const termo = String(row['search_term_view.search_term']).toLowerCase();
    const cliques = Number(row['metrics.clicks']);
    const custo = Number(row['metrics.cost_micros']) / 1e6;
    const conv = Number(row['metrics.conversions']);

    if (protegidos.some((p) => p && termo.indexOf(p) !== -1)) continue;

    const motivos = [];
    if (conv === 0 && custo >= CONFIG.CUSTO_MAX_SEM_CONV) {
      motivos.push('R1 custo sem conv (' + MOEDA + ' ' + custo.toFixed(2) + ')');
    }
    if (conv === 0 && cliques >= CONFIG.CLIQUES_MAX_SEM_CONV) {
      motivos.push('R2 ' + cliques + ' cliques sem conv');
    }
    regexes.forEach((re, i) => {
      if (re.test(termo)) motivos.push('R3 padrao "' + CONFIG.PADROES_IRRELEVANTES[i] + '"');
    });

    if (motivos.length === 0) continue;

    custoCandidatos += custo;
    candidatos.push({
      termo: termo,
      campanha: String(row['campaign.name']),
      grupo: String(row['ad_group.name']),
      impressoes: Number(row['metrics.impressions']),
      cliques: cliques,
      custo: custo,
      conversoes: conv,
      motivos: motivos.join(' | '),
      // Sugestao default: negativa EXATA no nivel onde o termo apareceu.
      // R3 puro tende a virar negativa de FRASE em lista compartilhada — decidir na revisao.
      sugestao: motivos.some((m) => m.indexOf('R3') === 0 || m.indexOf('| R3') !== -1)
        ? 'avaliar frase em lista compartilhada'
        : 'exata na campanha/grupo de origem',
    });
  }

  // Analise de tokens recorrentes entre os candidatos (n-grama de 1 palavra).
  const contagem = {};
  candidatos.forEach((c) => {
    const vistos = {};
    c.termo.split(/\s+/).forEach((tk) => {
      if (tk.length < 3 || STOPWORDS_PT.indexOf(tk) !== -1 || vistos[tk]) return;
      vistos[tk] = true;
      if (!contagem[tk]) contagem[tk] = { ocorrencias: 0, custo: 0 };
      contagem[tk].ocorrencias++;
      contagem[tk].custo += c.custo;
    });
  });
  const tokens = Object.keys(contagem)
    .filter((tk) => contagem[tk].ocorrencias >= CONFIG.MIN_OCORRENCIAS_TOKEN)
    .sort((a, b) => contagem[b].custo - contagem[a].custo);

  // Escrita na planilha (snapshot da semana substitui o anterior).
  escreverCandidatos_(candidatos, hojeStr);
  escreverTokens_(tokens, contagem, hojeStr);

  Logger.log('Linhas lidas: %s | Candidatos: %s | Custo dos candidatos (30d): %s %s | Tokens: %s',
    totalLinhas, candidatos.length, MOEDA, custoCandidatos.toFixed(2), tokens.length);

  if (totalLinhas >= CONFIG.LIMITE_LINHAS) {
    Logger.log('ATENCAO: relatorio atingiu LIMITE_LINHAS — pode haver candidatos fora da amostra. ' +
      'A leitura e por custo desc, entao o corte fica na cauda barata.');
  }

  // Resumo por e-mail (top 20).
  const top = candidatos.slice(0, 20).map((c) =>
    ' - "' + c.termo + '" | ' + MOEDA + ' ' + c.custo.toFixed(2) + ' | ' +
    c.cliques + ' cliques | ' + c.motivos);
  const assunto = '[TP][' + CONFIG.NOME_CONTA + '] Minerador de termos: ' +
    candidatos.length + ' candidatos (' + MOEDA + ' ' + custoCandidatos.toFixed(2) + ' em 30d)';
  const corpo = [
    'Script: [TP] 03 - Minerador de Termos para Negativacao',
    'Conta: ' + CONFIG.NOME_CONTA + ' | Janela: ultimos 30 dias | Data: ' + hojeStr,
    '',
    'Candidatos: ' + candidatos.length + ' termos, somando ' + MOEDA + ' ' +
      custoCandidatos.toFixed(2) + ' de custo na janela.',
    'Planilha (abas "negativacao_candidatos" e "negativacao_tokens"): ' + CONFIG.SHEET_URL,
    '',
    'Top 20 por custo:',
    top.join('\n') || ' (nenhum candidato nesta semana)',
    '',
    'NENHUMA negativa foi aplicada. Revisar a lista e registrar a aplicacao no fluxo optimization-routine.',
  ].join('\n');
  MailApp.sendEmail(CONFIG.EMAILS, assunto, corpo);
}

function escreverCandidatos_(candidatos, dataStr) {
  const aba = abaLimpa_('negativacao_candidatos', ['data_snapshot', 'termo', 'campanha',
    'grupo_de_anuncios', 'impressoes', 'cliques', 'custo', 'conversoes', 'motivos',
    'sugestao_match_type', 'decisao (preencher na revisao)']);
  const linhas = candidatos.map((c) => [dataStr, c.termo, c.campanha, c.grupo,
    c.impressoes, c.cliques, c.custo, c.conversoes, c.motivos, c.sugestao, '']);
  if (linhas.length > 0) {
    aba.getRange(2, 1, linhas.length, linhas[0].length).setValues(linhas);
  }
}

function escreverTokens_(tokens, contagem, dataStr) {
  const aba = abaLimpa_('negativacao_tokens', ['data_snapshot', 'token',
    'ocorrencias_em_candidatos', 'custo_somado', 'sugestao']);
  const linhas = tokens.map((tk) => [dataStr, tk, contagem[tk].ocorrencias,
    contagem[tk].custo, 'avaliar negativa de frase "' + tk + '" em lista compartilhada']);
  if (linhas.length > 0) {
    aba.getRange(2, 1, linhas.length, linhas[0].length).setValues(linhas);
  }
}

function abaLimpa_(nome, cabecalho) {
  const planilha = SpreadsheetApp.openByUrl(CONFIG.SHEET_URL);
  let aba = planilha.getSheetByName(nome);
  if (!aba) aba = planilha.insertSheet(nome);
  aba.clearContents();
  aba.appendRow(cabecalho);
  return aba;
}

function validarConfig_(config) {
  const pendencias = [];
  Object.keys(config).forEach((chave) => {
    const valor = config[chave];
    if (typeof valor === 'string' && valor.indexOf('<<PREENCHER') !== -1) pendencias.push(chave);
    if (Array.isArray(valor)) {
      valor.forEach((v) => {
        if (typeof v === 'string' && v.indexOf('<<PREENCHER') !== -1) pendencias.push(chave);
      });
    }
  });
  if (pendencias.length > 0) {
    throw new Error('CONFIG incompleto. Preencha: ' + pendencias.join(', '));
  }
}
```

### 5.4 Da planilha à conta (o que acontece depois do script)

1. Revisão humana/do search-specialist na aba `negativacao_candidatos`: preencher a coluna **decisão** (`negativar exata` / `negativar frase` / `manter` / `observar`).
2. Tokens da aba `negativacao_tokens` com decisão "frase": avaliar entrada na **lista de negativas compartilhada** da conta (afeta todas as campanhas vinculadas — cuidado redobrado).
3. Aplicação: fluxo `optimization-routine` (optimization-executor), com registro de data e critério de rollback.
4. PMax não aparece em `search_term_view` da mesma forma que Search — negativação de PMax tem caminho próprio (tratada nas skills `pmax-campaign-builder` / `optimization-routine`), e este script **não cobre** esse caso. Dizer isso na entrega.

---

## 6. Script 04 — Monitor de Link Quebrado

### 6.1 O que ele faz

Todo dia, coleta as **final URLs** de anúncios e keywords ativos (campanha, grupo e entidade `ENABLED`), deduplica, e testa via `UrlFetchApp`:

- **HTTP ≥ 400** ou falha de fetch (DNS, timeout, certificado) → **QUEBRADO**.
- **HTTP 200 com corpo contendo padrões de soft-404** ("página não encontrada", "page not found"…) → **SOFT_404** (página que responde 200 mas é erro — o leilão continua pagando clique por ela).

Mantém **cache de revisita** em planilha: URL verificada com sucesso só é retestada após `RECHECK_DIAS`; URLs nunca testadas e as mais antigas têm prioridade. Com `MAX_URLS_POR_EXECUCAO` isso fatia contas grandes em rodadas diárias, respeitando o teto de 30 min e a quota de `UrlFetchApp`.

**Não pausa nada.** Alerta lista URL → status → campanhas/grupos afetados. Pausar/corrigir é decisão do fluxo `optimization-routine` (geralmente: corrigir a página ou trocar a final URL — pausar é último recurso). Página com problema de conversão (carrega, mas não converte) não é caso deste script — é caso da skill `lp-cro-audit`.

### 6.2 Código completo

```javascript
/**
 * [TP] 04 — Monitor de Link Quebrado — v1.0
 * TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads
 *
 * Frequência: DIÁRIO (04h, fuso da conta).
 * Read-only: testa final URLs de anuncios e keywords ativos. NAO pausa nada.
 * Cache de revisita: aba "links_cache" da planilha CONFIG.SHEET_URL.
 */

const CONFIG = {
  EMAILS: '<<PREENCHER: emails de alerta>>',
  SHEET_URL: '<<PREENCHER: URL da planilha TP — Scripts — <Conta>>>',
  NOME_CONTA: '<<PREENCHER: ex. ClienteX-BR>>',

  // Teto de URLs testadas por execucao (30 min / quota UrlFetchApp ~20k/dia).
  MAX_URLS_POR_EXECUCAO: 400,

  // URL verificada OK so e retestada apos N dias.
  RECHECK_DIAS: 7,

  // Tambem coletar final URLs de keywords (alem das dos anuncios).
  INCLUIR_KEYWORDS: true,

  // Padroes (minusculas) que, num corpo HTTP 200, indicam soft-404.
  PADROES_SOFT_404: [
    'página não encontrada',
    'pagina nao encontrada',
    'page not found',
    'erro 404',
  ],
};

function main() {
  validarConfig_(CONFIG);

  const conta = AdsApp.currentAccount();
  const TZ = conta.getTimeZone();
  const hojeStr = Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd');

  // 1) Coletar URLs ativas e onde sao usadas.
  const usoPorUrl = coletarUrlsAtivas_();
  const urls = Object.keys(usoPorUrl);
  Logger.log('URLs unicas ativas: %s', urls.length);

  // 2) Selecionar a fatia desta execucao via cache.
  const cache = lerCache_();
  const agoraMs = Date.now();
  const recheckMs = CONFIG.RECHECK_DIAS * 24 * 60 * 60 * 1000;
  const fila = urls
    .filter((u) => !cache[u] || cache[u].status !== 'OK' ||
      agoraMs - cache[u].verificadaEmMs >= recheckMs)
    .sort((a, b) => (cache[a] ? cache[a].verificadaEmMs : 0) -
                    (cache[b] ? cache[b].verificadaEmMs : 0))
    .slice(0, CONFIG.MAX_URLS_POR_EXECUCAO);
  Logger.log('URLs a testar nesta execucao: %s (teto %s)', fila.length, CONFIG.MAX_URLS_POR_EXECUCAO);

  // 3) Testar.
  const quebradas = [];
  fila.forEach((url) => {
    const resultado = testarUrl_(url);
    cache[url] = { status: resultado.status, verificadaEmMs: agoraMs, detalhe: resultado.detalhe };
    if (resultado.status !== 'OK') {
      quebradas.push({ url: url, status: resultado.status, detalhe: resultado.detalhe,
        uso: usoPorUrl[url].slice(0, 5).join(' ; ') });
    }
  });

  // 4) Persistir cache e reportar.
  gravarCache_(cache);
  Logger.log('Testadas: %s | Com problema: %s', fila.length, quebradas.length);

  if (quebradas.length === 0) {
    Logger.log('Nenhum link com problema nesta execucao. Sem e-mail.');
    return;
  }

  const linhas = quebradas.map((q) =>
    ' - [' + q.status + '] ' + q.url + '\n     detalhe: ' + q.detalhe + '\n     usada em: ' + q.uso);
  const assunto = '[TP][' + CONFIG.NOME_CONTA + '] ' + quebradas.length +
    ' final URL(s) com problema (' + hojeStr + ')';
  const corpo = [
    'Script: [TP] 04 - Monitor de Link Quebrado',
    'Conta: ' + CONFIG.NOME_CONTA + ' (' + conta.getCustomerId() + ')',
    'Data: ' + hojeStr + ' | Testadas nesta execucao: ' + fila.length + ' de ' + urls.length + ' URLs ativas',
    '',
    'URLs com problema:',
    linhas.join('\n'),
    '',
    'NADA foi pausado. Caminho recomendado: corrigir a pagina ou trocar a final URL; ',
    'pausar e ultimo recurso. Registrar a acao no fluxo optimization-routine.',
  ].join('\n');
  MailApp.sendEmail(CONFIG.EMAILS, assunto, corpo);
}

/** Mapa url -> ["Campanha > Grupo (anuncio|keyword)", ...] das entidades ENABLED. */
function coletarUrlsAtivas_() {
  const uso = {};
  const registrar = (url, origem) => {
    if (!url) return;
    if (!uso[url]) uso[url] = [];
    uso[url].push(origem);
  };

  const anuncios = AdsApp.ads()
    .withCondition('ad_group_ad.status = ENABLED')
    .withCondition('ad_group.status = ENABLED')
    .withCondition('campaign.status = ENABLED')
    .get();
  while (anuncios.hasNext()) {
    const ad = anuncios.next();
    registrar(ad.urls().getFinalUrl(),
      ad.getCampaign().getName() + ' > ' + ad.getAdGroup().getName() + ' (anuncio)');
  }

  if (CONFIG.INCLUIR_KEYWORDS) {
    const keywords = AdsApp.keywords()
      .withCondition('ad_group_criterion.status = ENABLED')
      .withCondition('ad_group.status = ENABLED')
      .withCondition('campaign.status = ENABLED')
      .get();
    while (keywords.hasNext()) {
      const kw = keywords.next();
      registrar(kw.urls().getFinalUrl(), // null quando a keyword herda a URL do anuncio
        kw.getCampaign().getName() + ' > ' + kw.getAdGroup().getName() + ' (keyword)');
    }
  }
  return uso;
}

/** Testa uma URL: OK | QUEBRADO | SOFT_404 | FETCH_ERROR. */
function testarUrl_(url) {
  try {
    const resposta = UrlFetchApp.fetch(url, {
      muteHttpExceptions: true,
      followRedirects: true,
    });
    const codigo = resposta.getResponseCode();
    if (codigo >= 400) {
      return { status: 'QUEBRADO', detalhe: 'HTTP ' + codigo };
    }
    const corpo = String(resposta.getContentText()).toLowerCase();
    for (let i = 0; i < CONFIG.PADROES_SOFT_404.length; i++) {
      if (corpo.indexOf(CONFIG.PADROES_SOFT_404[i]) !== -1) {
        return { status: 'SOFT_404', detalhe: 'HTTP ' + codigo + ' com padrao "' +
          CONFIG.PADROES_SOFT_404[i] + '" no corpo' };
      }
    }
    return { status: 'OK', detalhe: 'HTTP ' + codigo };
  } catch (e) {
    return { status: 'FETCH_ERROR', detalhe: String(e).slice(0, 200) };
  }
}

function abaCache_() {
  const planilha = SpreadsheetApp.openByUrl(CONFIG.SHEET_URL);
  let aba = planilha.getSheetByName('links_cache');
  if (!aba) {
    aba = planilha.insertSheet('links_cache');
    aba.appendRow(['url', 'status', 'verificada_em_ms', 'detalhe']);
  }
  return aba;
}

function lerCache_() {
  const valores = abaCache_().getDataRange().getValues();
  const cache = {};
  for (let i = 1; i < valores.length; i++) {
    cache[String(valores[i][0])] = {
      status: String(valores[i][1]),
      verificadaEmMs: Number(valores[i][2]) || 0,
      detalhe: String(valores[i][3]),
    };
  }
  return cache;
}

function gravarCache_(cache) {
  const aba = abaCache_();
  aba.clearContents();
  aba.appendRow(['url', 'status', 'verificada_em_ms', 'detalhe']);
  const linhas = Object.keys(cache).map((u) =>
    [u, cache[u].status, cache[u].verificadaEmMs, cache[u].detalhe]);
  if (linhas.length > 0) {
    aba.getRange(2, 1, linhas.length, 4).setValues(linhas);
  }
}

function validarConfig_(config) {
  const pendencias = [];
  Object.keys(config).forEach((chave) => {
    const valor = config[chave];
    if (typeof valor === 'string' && valor.indexOf('<<PREENCHER') !== -1) pendencias.push(chave);
  });
  if (pendencias.length > 0) {
    throw new Error('CONFIG incompleto. Preencha: ' + pendencias.join(', '));
  }
}
```

### 6.3 Avisos de operação

- **Preview já consome quota de `UrlFetchApp` e testa URLs de verdade.** Em conta grande, baixar `MAX_URLS_POR_EXECUCAO` para 30–50 no primeiro Preview.
- Sites com **WAF/anti-bot** podem responder 403 para o fetch e 200 para humanos → falso positivo recorrente. Tratamento: pedir liberação do user-agent do Google no WAF do cliente, ou registrar a URL como exceção conhecida (coluna `detalhe` do cache).
- Conta com mais URLs ativas do que `MAX_URLS_POR_EXECUCAO`: a cobertura completa leva `ceil(URLs/teto)` dias — dizer isso na entrega, é o comportamento desenhado.
- Sitelinks e outros assets com URL própria não entram na varredura padrão — variante via Modo Customizar quando o cliente usa muitos sitelinks com destino diferente da final URL.

---

## 7. Tabela de decisão — sintoma → script (Modo Recomendar)

| Sintoma relatado | Resposta | Observação |
|---|---|---|
| "A conta estourou o gasto num dia / fim de semana" | **Script 01** (horário) + **Script 02** (estrutural) | 01 pega o pico no dia; 02 evita que o mês inteiro derive |
| "Acabou a verba no dia 20" / "sobrou verba no fim do mês" | **Script 02** + revisão do plano na skill `budget-pacing` | Script vigia; a redistribuição é decisão da `budget-pacing` |
| "A conta parou de gastar e ninguém viu" (pagamento, reprovação, site fora) | **Script 01** (cenário GASTO_ZERO) | É o cenário que mais paga o custo de instalação da biblioteca |
| "Tem clique lixo / termo absurdo gastando" | **Script 03** | Lembrar: só Search; PMax tem caminho próprio |
| "Anúncio levando pra 404 / página fora do ar" | **Script 04** | Soft-404 incluído; página que carrega mas não converte → skill `lp-cro-audit` |
| "Quero relatório automático de performance" | **Nenhum desses** → skill `performance-report` | Script de vigilância ≠ relatório executivo |
| "Conversão parou de registrar / número não bate" | **Nenhum desses** → skill `tracking-blueprint` | Problema de medição se resolve na fundação do tracking, não com script de gasto |
| "Quero que o script pause sozinho o que estiver ruim" | **Recusar o automatismo**; oferecer alerta + fluxo `optimization-routine` | Regra 3 da skill: read-only por padrão; mutação só com aprovação registrada |
| "Quero vigiar 15 contas do MCC de uma vez" | Variante MCC (Modo Customizar) dos scripts 01/02 | Limite de 50 contas por `executeInParallel`; seleção por label de MCC |

**Kit mínimo de vigilância TráfegoPRO** (o que o account-auditor verifica na skill `account-audit`): scripts **01 e 02 instalados e agendados** em toda conta gerida; 03 em toda conta com campanhas de Search; 04 em toda conta cujo site não tem monitoramento próprio de uptime.

---

## 8. Checklist de QA pré-agendamento (obrigatório — regra 2 da skill)

Executar em **Preview** e marcar item a item antes de ativar a frequência:

- [ ] `CONFIG` sem nenhum marcador `<<PREENCHER>>` (o validador travaria, mas conferir a olho também os valores numéricos: verba, thresholds).
- [ ] Script nomeado na naming convention `[TP] <nº> — <nome> — v<versão>`.
- [ ] Autorização feita por usuário com acesso permanente à conta (não usar acesso temporário de freelancer).
- [ ] Planilha `TP — Scripts — <Conta>` compartilhada como **Editor** com o usuário autorizador; abas criadas pelo script apareceram após o Preview.
- [ ] Log do Preview legível: config efetiva no início, decisão no meio (alertou/não alertou e por quê), resumo no fim. Sem exceções não tratadas.
- [ ] Números do Preview conferidos contra a interface do Google Ads (mesmo período, mesmo fuso) — tolerância de centavos.
- [ ] E-mail de teste recebido (lembrar: Preview envia e-mail de verdade) e legível no celular.
- [ ] Aba **Alterações** do Preview **vazia** — confirma que o script é read-only. Qualquer mutação listada = reprovado.
- [ ] Frequência configurada conforme seção 1.2 e horário no fuso da conta.
- [ ] `EMAILS` de teste trocado pelos destinatários definitivos (incluindo o canal monitorado pelo performance-analyst).
- [ ] Bloco "Scripts ativos nesta conta" atualizado no registro da conta, com data de recalibragem de thresholds (+4 semanas para o script 01).

---

## 9. Troubleshooting (Modo Diagnosticar)

### 9.1 "Authorization required" / script desativado sozinho
O usuário autorizador perdeu acesso, trocou senha com revogação de sessões, ou a conta Google foi suspensa. **Correção:** reautorizar com usuário válido (botão Autorizar no editor do script). **Prevenção:** autorizar sempre com usuário institucional da operação, não pessoal.

### 9.2 "Exceeded maximum execution time"
Estourou os 30 min. **Correção por script:** 03 → reduzir `LIMITE_LINHAS` e/ou a janela; 04 → reduzir `MAX_URLS_POR_EXECUCAO` (o cache reparte a cobertura nos dias seguintes); 01/02 raramente estouram — se estourar, a conta tem volume anômalo de campanhas: filtrar por status já ajuda (os códigos já filtram `ENABLED`).

### 9.3 Erro de GAQL ("Unrecognized field", "Invalid query")
Campo digitado errado ou cláusula inválida após customização. Conferir nomes completos (`metrics.cost_micros`, `segments.date`, `search_term_view.search_term`) e se o recurso (`FROM customer/campaign/search_term_view`) suporta os campos pedidos. Testar a query isolada num script descartável com `Logger.log` antes de devolver a versão corrigida.

### 9.4 "You do not have permission" ao abrir a planilha
A planilha não está compartilhada com o usuário **que autorizou o script** (não basta estar compartilhada com quem instalou). Compartilhar como Editor e rodar Preview de novo.

### 9.5 E-mail não chega
Na ordem: (1) `EMAILS` vazio/typo; (2) caixa de spam (remetente é a conta autorizadora); (3) quota diária de `MailApp` da conta Google estourada — sintoma típico quando a mesma conta autoriza scripts em dezenas de contas; correção: distribuir autorizações ou consolidar alertas; (4) o script decidiu não alertar — ler o log antes de supor bug (regra 7 da seção 2: o log diz por quê).

### 9.6 Script roda mas nunca alerta (ou alerta demais)
Threshold descalibrado. Nunca alerta: multiplicadores/pisos altos demais para a volatilidade real — recalibrar com o histórico de log das últimas 4 semanas. Alerta demais: subir multiplicador/piso, ou (script 01) aumentar `SEMANAS_HISTORICO` para suavizar a régua. Caso especial do 01: alerta repetido suprimido por estado antigo na aba `estado_anomalia` — limpar as linhas do dia se precisar reemitir.

### 9.7 "Os números do script não batem com a interface"
Quatro causas clássicas, nesta ordem:
1. **Fuso horário** — comparação feita com a UI em outro fuso ou com "Hoje" parcial vs dias fechados.
2. **Data do clique vs data da conversão** — `metrics.conversions` por data segue a atribuição da coluna na API; conversões chegam com atraso e reescrevem o passado recente. Para os scripts 02 e 03 isso significa: número de conversão de ontem ainda vai subir. Decisões de corte respeitam os mínimos de dados da skill `budget-pacing` justamente por isso.
3. **`conversions` vs `all_conversions`** — a UI pode estar exibindo "Todas as conversões". Os scripts usam `metrics.conversions` (ações de conversão principais).
4. **Janela "LAST_30_DAYS"** — não inclui hoje; a UI com "Últimos 30 dias" customizado pode incluir.

### 9.8 Script 04 cheio de falso positivo
Ver seção 6.3 (WAF/anti-bot → 403 só para robô). Também comum: site que faz soft-404 com texto fora dos padrões configurados — adicionar o padrão real do site em `PADROES_SOFT_404`; e redirecionamento para a home em vez de 404 (não detectável por status — registrar como limitação na entrega).

### 9.9 Agendamento "pulou" uma execução
Execuções podem atrasar alguns minutos ou ser puladas em janelas de manutenção da plataforma. Um buraco isolado no log/planilha não é bug; recorrente, sim — verificar se a execução anterior está estourando tempo (9.2), pois execução em andamento bloqueia a seguinte.

---

## 10. Modelo do bloco "Scripts ativos nesta conta" (fecha toda entrega)

```markdown
## Scripts ativos nesta conta — <Conta> (atualizado em AAAA-MM-DD)

| Script | Versão | Frequência | Thresholds vigentes | Instalado em | Recalibrar em |
|---|---|---|---|---|---|
| [TP] 01 — Alerta Anomalia de Gasto | v1.0 | horário | alta 1.8x / baixa 0.3x / piso R$ 50 / zero ≥10h | AAAA-MM-DD | AAAA-MM-DD (+4 sem) |
| [TP] 02 — Monitor de Pacing | v1.0 | diário 06h | verba R$ X / banda 0.85–1.15 | AAAA-MM-DD | virada do mês |
| [TP] 03 — Minerador de Termos | v1.0 | semanal seg 05h | R1 R$ X / R2 12 cliques / R3 n padrões | AAAA-MM-DD | AAAA-MM-DD |
| [TP] 04 — Monitor de Link | v1.0 | diário 04h | 400 URLs/exec / recheck 7d | AAAA-MM-DD | — |

Pendências: <nenhuma / listar>
Canal de alertas monitorado pelo performance-analyst: <e-mail/canal>
```
