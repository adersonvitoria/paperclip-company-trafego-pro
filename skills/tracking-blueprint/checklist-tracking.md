# Checklist de Validação de Tracking — Pré-Go-Live (TráfegoPRO)

> Uso: skill `tracking-blueprint`, modo **verificacao** (e fechamento do modo **implantacao**).
> Cada item recebe status **✅ OK / ❌ Falha / ⚠️ Parcial / N/A** + evidência (como foi verificado).
> Severidades: **[B] Bloqueador** — impede go-live. **[C] Crítico** — corrigir na semana 1. **[R] Recomendado**.
> Veredito final: **GO** (zero [B] abertos) ou **NO-GO**.

## Ferramentas de verificação (como testar cada item)

| Ferramenta | O que verifica |
|---|---|
| GTM Preview (Tag Assistant) | Disparo de tags, triggers, valores de variáveis, dataLayer em tempo real |
| GA4 DebugView (Admin → DebugView) | Eventos chegando no GA4 com parâmetros corretos, estado de consentimento |
| Google Ads → Metas → Conversões → Diagnóstico | Status da ação de conversão, enhanced conversions, recência de registro |
| Tag Assistant (tagassistant.google.com) | Consent mode (sinais `ad_storage`/`analytics_storage`), hits gtag |
| Aba Network do navegador (filtro `collect`, `googleadservices`, `gtm.js`) | Hits reais saindo do browser, parâmetros `gcs`/`gcd` do consent |
| Pedido/lead de teste real | Validação ponta a ponta, incluindo dedup e valor |

---

## Bloco 1 — Fundação (GTM + propriedade)

- [ ] **1.1 [B]** Container GTM publicado e presente em **todas** as páginas do funil (home → LP → checkout/formulário → página de obrigado). Verificar via view-source ou Tag Assistant em cada etapa.
- [ ] **1.2 [B]** Apenas **um** container GTM e **um** snippet GA4 por página (duplicidade infla tudo). Verificar hard-coded gtag + GTM coexistindo — caso clássico de contagem dupla.
- [ ] **1.3 [B]** Acesso de administrador da TráfegoPRO ao GTM, GA4 e Google Ads do cliente (contas do cliente, nunca da agência — regra de propriedade de ativos).
- [ ] **1.4 [C]** GA4 ↔ Google Ads vinculados (Admin → Vinculações de produto) e personal ads signals ativados conforme política de privacidade do cliente.
- [ ] **1.5 [C]** Versão do container GTM nomeada e com descrição do que mudou (governança — ver template, seção 9).
- [ ] **1.6 [R]** Ambiente de staging do cliente sem tags de produção (ou bloqueado por trigger exception de hostname) — staging não pode poluir dados reais.
- [ ] **1.7 [R]** Filtro de tráfego interno definido no GA4 (IPs do cliente/agência) e definição de "unwanted referrals" para gateways de pagamento (evita sessão quebrada no retorno do checkout).

## Bloco 2 — Mapa de conversões no Google Ads

- [ ] **2.1 [B]** Toda ação de conversão **primária** do plano existe no Google Ads, com status "Gravando conversões" (não "Inativa"/"Sem conversões recentes" após o teste).
- [ ] **2.2 [B]** Primárias vs. secundárias configuradas conforme o plano de mensuração: só primárias marcadas como "Usada para lances"; micro-conversões (view_item, add_to_cart, begin_checkout, scroll, clique em WhatsApp) como secundárias.
- [ ] **2.3 [B]** Contagem correta por tipo: **"Uma"** para lead (um formulário enviado 3× = 1 lead) e **"Todas"** para compra (3 compras = 3 conversões).
- [ ] **2.4 [C]** Janelas de conversão definidas conscientemente (não só o default) e documentadas no plano — ciclo de venda longo exige janela de clique maior; documentar a escolha.
- [ ] **2.5 [C]** Valor de conversão: compra envia valor dinâmico real (subtotal sem frete/impostos, conforme decisão do plano) com `currency` correto; lead usa valor estático proxy OU valores por estágio (lead qualificado > lead bruto) — decisão registrada no plano.
- [ ] **2.6 [C]** Uma fonte por conversão: nenhuma ação duplicada "tag Ads" + "import GA4" ambas primárias para o mesmo evento. Se as duas existem, a redundante está como secundária ou removida.
- [ ] **2.7 [R]** Nomes das ações seguem a naming convention do plano (ex.: `[TP] Compra - Site`, `[TP] Lead - Form LP`), para leitura limpa nas colunas de segmentação.

## Bloco 3 — Disparo e dados (GTM Preview + DebugView)

- [ ] **3.1 [B]** Evento de conversão principal dispara **exatamente 1×** por ação real (testar: compra/lead de teste, recarregar a página de obrigado, voltar com botão back — não pode disparar de novo sem nova transação).
- [ ] **3.2 [B]** `transaction_id` presente e único por pedido no dataLayer e chegando na tag do Ads e no `purchase` do GA4 (ver Bloco 6 — deduplicação).
- [ ] **3.3 [B]** Valores corretos no disparo: `value` numérico (ponto decimal, sem "R$", sem vírgula), `currency: "BRL"` (ou a moeda real). Erro clássico: valor como string `"1.299,90"` → conversão de R$ 1,29.
- [ ] **3.4 [C]** Página de obrigado/sucesso **inacessível por URL direta** sem conversão real (ou o trigger depende de evento de dataLayer, não de pageview da URL). Se qualquer um pode abrir `/obrigado` e gerar conversão, o dado é lixo.
- [ ] **3.5 [C]** Eventos GA4 com parâmetros de e-commerce completos quando aplicável (`items[]` com `item_id`, `item_name`, `price`, `quantity`) — sem isso, relatórios de produto e PMax feed ficam cegos.
- [ ] **3.6 [C]** Formulários SPA/AJAX: trigger baseado em evento de sucesso real (callback/dataLayer push), não em "clique no botão enviar" (que conta tentativas com erro de validação como lead).
- [ ] **3.7 [R]** Eventos secundários do funil disparando (view_item, add_to_cart, begin_checkout / view de LP, início de formulário) — alimentam diagnóstico do `cro-engineer` via `lp-cro-audit`.

## Bloco 4 — Consent mode v2

> Obrigatório se houver tráfego EEA/UK. Para tráfego só-Brasil: documentar a postura LGPD do cliente no plano; a estrutura abaixo continua sendo a recomendada.

- [ ] **4.1 [B se EEA/UK | C se só BR]** Estado **default** de consentimento definido **antes** de qualquer tag disparar (snippet de default no `<head>`, antes do GTM): `ad_storage`, `ad_user_data`, `ad_personalization`, `analytics_storage` com default `denied` nas regiões exigidas. Os dois parâmetros novos do v2 (`ad_user_data`, `ad_personalization`) presentes — sem eles, públicos e enhanced conversions param de funcionar para tráfego europeu.
- [ ] **4.2 [B se EEA/UK]** CMP instalada e enviando o **update** de consentimento ao gtag/GTM quando o usuário aceita/recusa (verificar parâmetro `gcs`/`gcd` mudando nos hits da aba Network antes e depois do aceite).
- [ ] **4.3 [C]** Tags disparam **depois** da decisão de consentimento ou operam em modo cookieless (pings de consent mode), conforme a escolha basic vs. advanced documentada no plano (template, seção 7).
- [ ] **4.4 [C]** Configuração regional correta: se a decisão for default `granted` para Brasil e `denied` para EEA/UK, o snippet usa o parâmetro `region` — verificar que está conforme a decisão jurídica do cliente, nunca decisão da agência sozinha.
- [ ] **4.5 [R]** "Consent overview" do GTM revisado: toda tag com consentimento adicional exigido coerente (tags Ads exigem `ad_storage`; GA4 exige `analytics_storage`).

## Bloco 5 — Enhanced conversions

- [ ] **5.1 [C]** Enhanced conversions **ativado** na ação de conversão (Google Ads → Conversão → Configurações) e termos de dados do cliente aceitos na conta.
- [ ] **5.2 [C]** Método implementado conforme o plano: automático (gtag detecta campos) só se o campo de e-mail estiver presente na página de conversão; senão, **manual via dataLayer/variável user_provided_data** (spec na seção 6 do template).
- [ ] **5.3 [C]** Dados enviados no momento da conversão: e-mail (mínimo), idealmente telefone/nome/endereço. Verificar no GTM Preview que a variável `user_provided_data` está populada **na página onde a tag de conversão dispara** (erro clássico: e-mail só existe na página do formulário, não na de obrigado).
- [ ] **5.4 [C]** Telefone em formato E.164 (`+5511999998888`) antes do hash — formato errado = match perdido silenciosamente.
- [ ] **5.5 [R]** Diagnóstico da conversão no Google Ads exibindo status saudável de enhanced conversions após alguns dias (o status demora a popular; registrar como pendência de D+7, não como falha no go-live).
- [ ] **5.6 [R — funil offline]** Enhanced conversions **for leads**: GCLID **não** é exigido, mas e-mail/telefone do lead precisa ser capturado no form, armazenado no CRM e reenviado no upload/integração quando o lead converter offline. Verificar o campo no CRM e o processo de upload documentado (responsável + frequência).

## Bloco 6 — Deduplicação e integridade

- [ ] **6.1 [B]** `transaction_id` ponta a ponta: gerado pelo backend do pedido → dataLayer → tag Google Ads (campo Transaction ID) → GA4 `purchase`. Testar 2 reloads da página de confirmação: Google Ads deve registrar **1** conversão.
- [ ] **6.2 [C]** Se existir tag Ads direta **e** import GA4 para o mesmo evento (transição), confirmar que apenas uma é primária (ver 2.6) — dedup entre fontes diferentes **não** é automática.
- [ ] **6.3 [C]** Conversões de lead protegidas contra reenvio (form que permite reenviar = contagem "Uma" no Ads + trigger de evento único).
- [ ] **6.4 [R]** Cross-domain configurado quando o checkout vive em outro domínio (GA4 Admin → Fluxos de dados → Configurar domínios + linker no gtag) — sem isso a sessão quebra e a conversão perde o gclid.
- [ ] **6.5 [R]** Auto-tagging (GCLID) ativado na conta Google Ads e **não** sobrescrito por redirects que derrubam parâmetros de URL (testar clique em anúncio de teste ou URL com `?gclid=teste` atravessando o funil).

## Bloco 7 — Validação ponta a ponta (obrigatória antes do veredito)

- [ ] **7.1 [B]** Transação/lead de teste real executado, com evidência: screenshot do GTM Preview (tag disparada + valores) e do GA4 DebugView (evento com parâmetros).
- [ ] **7.2 [B]** Conversão de teste visível no Google Ads (Metas → Resumo de conversões) dentro do prazo esperado de processamento — se passou muito além de algumas horas, investigar antes do GO. *(Não assumir um SLA específico: confirmar na documentação vigente do Google via WebSearch se houver dúvida.)*
- [ ] **7.3 [C]** Linha de corte registrada: data/hora do go-live do tracking comunicada ao `performance-analyst` — relatórios do `performance-report` não comparam períodos pré/pós sem essa anotação.

---

## Árvore de decisão — Troubleshooting de discrepâncias GA4 × Google Ads

```
Conversões do Ads ≠ key events do GA4?
│
├─ A diferença é ESPERADA? Antes de caçar bug, lembrar que os sistemas medem coisas diferentes:
│   • Atribuição: Ads credita à data do CLIQUE; GA4 credita à data do EVENTO.
│   • Escopo: Ads só conta conversões atribuídas a anúncios; GA4 conta tudo (orgânico, direto...).
│   • Contagem: "Uma por clique" no Ads vs. todas as ocorrências no GA4.
│   • Janelas de conversão diferentes entre os dois sistemas.
│   → Se a divergência parecer fora do razoável, NÃO inventar um % aceitável:
│     pesquisar a orientação atual do Google (WebSearch) ou comparar com o histórico da própria conta.
│
├─ Ads em ZERO, GA4 registrando?
│   ├─ Tag Ads não publicada / trigger errado → GTM Preview no fluxo real.
│   ├─ Conversão recém-criada → status "Inativa" é normal nas primeiras horas; refazer teste.
│   ├─ Conversion ID/Label trocados entre contas → conferir contra o Google Ads.
│   └─ Consent mode bloqueando (default denied sem update da CMP) → ver Bloco 4.2.
│
├─ Ads MUITO ACIMA do real (pedidos do backend)?
│   ├─ Falta de transaction_id → dedup quebrada (Bloco 6.1).
│   ├─ Página de obrigado acessível por URL direta / e-mail transacional com link → Bloco 3.4.
│   ├─ Contagem "Todas" em conversão de lead → Bloco 2.3.
│   └─ Tag dupla (gtag hard-coded + GTM) → Bloco 1.2.
│
├─ Ads MUITO ABAIXO do real?
│   ├─ Sessão quebrando no gateway de pagamento → referral exclusion + cross-domain (1.7, 6.4).
│   ├─ GCLID perdido em redirect → Bloco 6.5.
│   ├─ Consent denied em massa sem modelagem ativa → revisar estratégia basic vs. advanced (Bloco 4).
│   ├─ Adblockers/ITP → avaliar tagueamento server-side (registrar como recomendação, projeto à parte).
│   └─ Enhanced conversions desligado/sem dados → Bloco 5 (recupera parte das conversões perdidas).
│
└─ Valores errados (ROAS absurdo p/ cima ou p/ baixo)?
    ├─ Vírgula vs. ponto decimal / "R$" na string → Bloco 3.3.
    ├─ Moeda errada na tag vs. moeda da conta → conferir currency.
    └─ Valor com frete/impostos divergindo da definição do plano → alinhar com a seção 2 do template.
```

---

## Monitoramento contínuo pós-go-live — Conversion Watchdog (Google Ads Script)

Instalar via Google Ads → Ferramentas → Scripts, agendado **a cada hora**. Alerta por e-mail quando uma conta com gasto ativo fica sem conversões por N horas (tracking quebrado é descoberto em horas, não no fechamento do mês). Manutenção e evolução deste script: skill `gads-scripts`.

```javascript
/**
 * TráfegoPRO — Conversion Watchdog v1
 * Alerta se a conta gastou acima do piso e registrou 0 conversões na janela.
 * Agendar: a cada hora. Ajustar CONFIG por conta no plano de mensuração (seção 10).
 */
var CONFIG = {
  LOOKBACK_HOURS: 6,          // janela de observação
  MIN_SPEND: 50,              // gasto mínimo (moeda da conta) p/ considerar "tráfego ativo"
  EMAILS: ['ops@cliente.com'],// destinatários do alerta
  ACCOUNT_LABEL: ''           // opcional (MCC): rodar só em contas com este label
};

function main() {
  var tz = AdsApp.currentAccount().getTimeZone();
  var now = new Date();
  var start = new Date(now.getTime() - CONFIG.LOOKBACK_HOURS * 3600 * 1000);
  var fmt = function (d) { return Utilities.formatDate(d, tz, 'yyyy-MM-dd HH:mm:ss'); };

  var query =
    'SELECT metrics.cost_micros, metrics.conversions ' +
    'FROM customer ' +
    "WHERE segments.date BETWEEN '" +
    Utilities.formatDate(start, tz, 'yyyy-MM-dd') + "' AND '" +
    Utilities.formatDate(now, tz, 'yyyy-MM-dd') + "'";

  var rows = AdsApp.search(query);
  var cost = 0, conv = 0;
  while (rows.hasNext()) {
    var r = rows.next();
    cost += Number(r.metrics.costMicros) / 1e6;
    conv += Number(r.metrics.conversions);
  }

  Logger.log('Janela ' + fmt(start) + ' → ' + fmt(now) +
             ' | Gasto: ' + cost.toFixed(2) + ' | Conversões: ' + conv);

  if (cost >= CONFIG.MIN_SPEND && conv === 0) {
    MailApp.sendEmail({
      to: CONFIG.EMAILS.join(','),
      subject: '[TráfegoPRO][ALERTA] ' + AdsApp.currentAccount().getName() +
               ' — gasto sem conversões nas últimas ' + CONFIG.LOOKBACK_HOURS + 'h',
      htmlBody:
        '<p><b>Possível quebra de tracking ou de funil.</b></p>' +
        '<ul><li>Conta: ' + AdsApp.currentAccount().getCustomerId() + '</li>' +
        '<li>Janela: ' + fmt(start) + ' → ' + fmt(now) + '</li>' +
        '<li>Gasto: ' + cost.toFixed(2) + '</li>' +
        '<li>Conversões: 0</li></ul>' +
        '<p>Roteiro: árvore de troubleshooting do checklist-tracking.md ' +
        '(skill tracking-blueprint) — começar pelo ramo "Ads em ZERO".</p>'
    });
  }
}
```

> Limitações conhecidas: a granularidade por data do relatório inclui o dia inteiro nas bordas da janela — o script é um detector de "zero absoluto com gasto", não um medidor fino. Falsos positivos legítimos: madrugada de nicho B2B, conta nova em aprendizado. Calibrar `LOOKBACK_HOURS`/`MIN_SPEND` por conta.

---

## Bloco final — Veredito

| Campo | Valor |
|---|---|
| Itens [B] abertos | ___ |
| Itens [C] abertos | ___ |
| Itens [R] abertos | ___ |
| **Veredito** | **GO / NO-GO** |
| Pendências com responsável e prazo | ___ |
| Comunicado a (`traffic-strategist`, especialistas de campanha, `performance-analyst`) | ___ |
