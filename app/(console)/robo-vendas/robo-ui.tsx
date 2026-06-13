'use client';

import { useEffect, useRef, useState } from 'react';
import { fecharNegocio, type FechamentoResult } from './actions';

type Msg =
  | { role: 'lead' | 'bot' | 'sys'; kind?: 'text'; text: string }
  | { role: 'bot'; kind: 'contrato'; res: FechamentoResult }
  | { role: 'bot'; kind: 'pix'; res: FechamentoResult };

type Ctx = { nome: string; contato: string; segmento: string; objetivo: string; fee: string; setup: string; projecao?: string };
type Flow = 'chat' | 'docs' | 'sign' | 'signcode' | 'done';
type Docs = { cnpj: boolean; social: boolean; acessos: boolean };

const CHIPS_NEG = ['Tá caro pra mim', 'Vou pensar e te falo', 'Não sei se funciona pro meu negócio', 'Agora não é um bom momento'];
const SMS_CODE = '482913';

const DOC_LABEL: Record<keyof Docs, string> = {
  cnpj: '📎 Enviar Cartão CNPJ',
  social: '📎 Enviar contrato social / comprovante',
  acessos: '📎 Enviar acessos (Google Ads / site)',
};
const DOC_VALIDA: Record<keyof Docs, (ctx: Ctx) => string[]> = {
  cnpj: (c) => ['📥 Recebido! Analisando o documento… 🔍',
    `✅ Cartão CNPJ validado!\nLi os dados automaticamente:\n🏢 ${c.nome}\n🪪 CNPJ 12.345.678/0001-90\n✔️ Situação cadastral ATIVA na Receita Federal`],
  social: () => ['📥 Recebido! Analisando… 🔍',
    '✅ Comprovante validado!\n📍 Endereço da sede confirmado\n👤 Sócio-administrador confere com o responsável'],
  acessos: () => ['📥 Recebido! Conferindo os acessos… 🔍',
    '✅ Acessos confirmados!\n🟢 Acesso de gestor à conta Google Ads\n🌐 Site/landing acessível para implantar a tag de conversão'],
};

const brl = (c: number) => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const first = (n: string) => (n || '').trim().split(/\s+/)[0] || 'tudo bem';
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

function checklistText(d: Docs) {
  const i = (b: boolean) => (b ? '✅' : '⬜');
  return `📋 Checklist de documentos:\n${i(d.cnpj)} Cartão CNPJ\n${i(d.social)} Contrato social / comprovante\n${i(d.acessos)} Acessos das contas`;
}

export function RoboUI({ leads }: { leads: Array<{ id: string; nome: string; contato: string; segmento: string; objetivo: string; fee: string; setup: string; projecao?: string }> }) {
  const test: Ctx = { nome: 'Mariana Lopes', contato: '(51) 99999-0000', segmento: 'Clínica odontológica', objetivo: 'gerar 30 agendamentos/mês', fee: '1800', setup: '1500' };
  const [ctx, setCtx] = useState<Ctx>(leads[0] ? mapLead(leads[0]) : test);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [fechado, setFechado] = useState<FechamentoResult | null>(null);
  const [canClose, setCanClose] = useState(false);
  const [flow, setFlow] = useState<Flow>('chat');
  const [docs, setDocs] = useState<Docs>({ cnpj: false, social: false, acessos: false });
  const chatRef = useRef<HTMLDivElement>(null);

  function mapLead(l: any): Ctx { return { nome: l.nome, contato: l.contato, segmento: l.segmento, objetivo: l.objetivo, fee: l.fee, setup: l.setup, projecao: l.projecao }; }

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs, typing]);

  function reset(c: Ctx) {
    setCtx(c); setMsgs([]); setFechado(null); setCanClose(false); setFlow('chat'); setDocs({ cnpj: false, social: false, acessos: false }); setInput('');
  }

  // Reproduz mensagens do bot com indicador de "digitando" e timing natural.
  async function playBot(items: Array<Msg | string>) {
    for (const it of items) {
      const len = typeof it === 'string' ? it.length : 40;
      setTyping(true);
      await delay(650 + Math.min(950, len * 11));
      setTyping(false);
      const msg: Msg = typeof it === 'string' ? { role: 'bot', text: it } : it;
      setMsgs((m) => [...m, msg]);
      await delay(160);
    }
  }

  async function botReply(history: Msg[]) {
    setTyping(true);
    try {
      const payload = history.filter((m) => m.role !== 'sys' && (m.kind ?? 'text') === 'text').map((m) => ({ role: m.role, text: (m as any).text }));
      const r = await fetch('/api/robo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ctx, messages: payload }) });
      const d = await r.json();
      if (d.text) { setMsgs((m) => [...m, { role: 'bot', text: d.text }]); if (d.fechar) setCanClose(true); }
      else setMsgs((m) => [...m, { role: 'sys', text: d.error || 'Erro ao responder' }]);
    } catch { setMsgs((m) => [...m, { role: 'sys', text: 'Falha de rede' }]); }
    finally { setTyping(false); }
  }

  function iniciar() {
    setFechado(null); setCanClose(false); setFlow('chat'); setDocs({ cnpj: false, social: false, acessos: false });
    const inicio: Msg[] = [];
    setMsgs(inicio);
    botReply(inicio);
  }

  function send(text: string) {
    if (!text.trim() || typing || flow !== 'chat') return;
    const next: Msg[] = [...msgs, { role: 'lead', text }];
    setMsgs(next); setInput('');
    botReply(next);
  }

  // ===== Fechamento: documentos → contrato → assinatura → PIX =====
  async function iniciarFechamento() {
    if (flow !== 'chat' || typing) return;
    setFlow('docs');
    setMsgs((m) => [...m, { role: 'lead', text: 'Boa, vamos fechar! 🚀' }]);
    const vazio: Docs = { cnpj: false, social: false, acessos: false };
    await playBot([
      `Que ótimo, ${first(ctx.nome)}! 🎉 Pra deixar tudo certinho e já começar, preciso de 3 coisinhas rápidas da sua empresa 📎`,
      checklistText(vazio),
      'Pode mandar aqui mesmo (foto ou arquivo). Eu valido na hora, gero seu contrato e te envio pra assinatura digital ✍️ — sem cartório, sem sair de casa.',
    ]);
  }

  async function enviarDoc(tipo: keyof Docs) {
    if (typing || docs[tipo]) return;
    setMsgs((m) => [...m, { role: 'lead', text: DOC_LABEL[tipo].replace('Enviar ', '') + ' 📄' }]);
    const novo: Docs = { ...docs, [tipo]: true };
    setDocs(novo);
    await playBot(DOC_VALIDA[tipo](ctx));
    if (novo.cnpj && novo.social && novo.acessos) {
      await playBot([checklistText(novo), '🎉 Documentação completa e validada! Gerando seu contrato com os seus dados…']);
      setTyping(true);
      const res = await fecharNegocio({ nome: ctx.nome, contato: ctx.contato, segmento: ctx.segmento, objetivo: ctx.objetivo, feeMensal: ctx.fee, setup: ctx.setup });
      setTyping(false);
      if (!res.ok) { setMsgs((m) => [...m, { role: 'sys', text: res.error || 'Erro ao gerar contrato' }]); return; }
      setFechado(res);
      setMsgs((m) => [...m, { role: 'bot', kind: 'contrato', res }]);
      await playBot(['Confere os dados acima 👆 Está tudo certo? Gerei seu link de assinatura digital (validade jurídica, registrada com data, hora e código):',
        '🔗 assina.trafegopro.com.br/c/' + (res.numeroContrato || '').toLowerCase()]);
      setFlow('sign');
    } else {
      await playBot([checklistText(novo)]);
    }
  }

  async function assinar() {
    if (typing) return;
    setMsgs((m) => [...m, { role: 'lead', text: '✍️ Assinar contrato agora' }]);
    setFlow('signcode');
    await playBot(['Abrindo o ambiente seguro de assinatura… 🔐', `Enviei um código de 6 dígitos por SMS pro celular ${ctx.contato}. Me confirma o código aqui pra validar a sua assinatura 😊`]);
  }

  async function confirmarCodigo() {
    if (typing || !fechado) return;
    setMsgs((m) => [...m, { role: 'lead', text: `Código: ${SMS_CODE}` }]);
    await playBot(['Verificando… ✅ Assinatura confirmada!',
      `🎉 Contrato Nº ${fechado.numeroContrato} assinado digitalmente!\n🔐 Assinatura: ${(fechado.assinatura || '').slice(0, 16)}…\n📄 Cópia enviada aqui no WhatsApp e por e-mail.`,
      `Por fim, o setup de ${brl(fechado.setupCents ?? 0)} é via PIX pra gente já começar 🚀 Aponta a câmera no QR ou usa o copia-e-cola:`]);
    setMsgs((m) => [...m, { role: 'bot', kind: 'pix', res: fechado }]);
    await playBot([`Assim que o PIX cair, a equipe já começa a estruturação. Bem-vinda à TráfegoPRO, ${first(ctx.nome)}! 💚 Gestão mensal de ${brl(fechado.feeMensalCents ?? 0)}.`]);
    setFlow('done');
  }

  const closingActive = flow !== 'chat';

  return (
    <div className="grid gap-6 lg:grid-cols-[410px_1fr] items-start">
      {/* ===== Celular ===== */}
      <div className="phone">
        <div className="phone-screen">
          <div className="phone-island" />
          <div className="wa-top">
            <div className="wa-ava">🤖</div>
            <div className="who"><b>TráfegoPRO · Vendas</b><span>online agora</span></div>
            <button className="wa-reset" onClick={iniciar} title="Reiniciar conversa">↻</button>
          </div>
          <div className="wa-chat" ref={chatRef}>
            {msgs.length === 0 && <div className="wa-day">Toque em “Iniciar atendimento”</div>}
            {msgs.map((m, i) => {
              if (m.role === 'sys') return <div key={i} className="wa-day" style={{ color: '#b91c1c' }}>{m.text}</div>;
              if (m.kind === 'contrato') return <ContratoCard key={i} ctx={ctx} res={m.res} />;
              if (m.kind === 'pix') return <PixCard key={i} res={m.res} />;
              return (
                <div key={i} className={`msg ${m.role === 'lead' ? 'out' : 'in'}`}>
                  {m.text.split('\n').map((l, j) => <div key={j} style={{ wordBreak: 'break-word' }}>{l}</div>)}
                  <span className="t">{m.role === 'lead' ? 'você' : 'bot'}</span>
                </div>
              );
            })}
            {typing && <div className="typing"><i /><i /><i /></div>}
          </div>

          {/* chips contextuais por etapa do fluxo */}
          <div className="chips">
            {msgs.length === 0 && <button className="chip" onClick={iniciar}>▶ Iniciar atendimento</button>}
            {msgs.length > 0 && flow === 'chat' && (<>
              {canClose && <button className="chip chip-go" onClick={iniciarFechamento} disabled={typing}>✅ Bora fechar!</button>}
              {CHIPS_NEG.map((c) => <button key={c} className="chip" onClick={() => send(c)} disabled={typing}>{c}</button>)}
            </>)}
            {flow === 'docs' && (Object.keys(docs) as Array<keyof Docs>).filter((k) => !docs[k]).map((k) => (
              <button key={k} className="chip" onClick={() => enviarDoc(k)} disabled={typing}>{DOC_LABEL[k]}</button>
            ))}
            {flow === 'sign' && <button className="chip chip-go" onClick={assinar} disabled={typing}>✍️ Assinar contrato agora</button>}
            {flow === 'signcode' && <button className="chip chip-go" onClick={confirmarCodigo} disabled={typing}>Confirmar código: {SMS_CODE}</button>}
            {flow === 'done' && <button className="chip" onClick={() => { window.location.href = '/clientes'; }}>Ver em Clientes →</button>}
          </div>

          <div className="wa-input">
            <input className="field" placeholder={closingActive ? 'Use os botões acima 👆' : (msgs.length === 0 ? 'Toque em iniciar' : 'Responda como o lead…')} value={input}
              disabled={typing || closingActive || msgs.length === 0}
              onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(input); }} />
            <button className="send" onClick={() => send(input)} disabled={typing || closingActive}>➤</button>
          </div>
        </div>
      </div>

      {/* ===== Painel lateral ===== */}
      <div className="space-y-4">
        <div className="card">
          <h2 className="font-semibold mb-1">Simular atendimento</h2>
          <p className="text-sm text-muted mb-3">Escolha um lead real (do site) ou use o lead de teste. Você responde como o cliente; o robô conduz, contorna objeções e, no aceite, faz todo o fechamento dentro do chat.</p>
          {leads.length > 0 && (
            <select className="input mb-3" onChange={(e) => { const l = leads.find((x) => x.id === e.target.value); if (l) reset(mapLead(l)); }}>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.nome} — {l.segmento}</option>)}
            </select>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="label">Nome<input className="input" value={ctx.nome} disabled={closingActive} onChange={(e) => setCtx({ ...ctx, nome: e.target.value })} /></label>
            <label className="label">Contato<input className="input" value={ctx.contato} disabled={closingActive} onChange={(e) => setCtx({ ...ctx, contato: e.target.value })} /></label>
            <label className="label">Segmento<input className="input" value={ctx.segmento} disabled={closingActive} onChange={(e) => setCtx({ ...ctx, segmento: e.target.value })} /></label>
            <label className="label">Objetivo<input className="input" value={ctx.objetivo} disabled={closingActive} onChange={(e) => setCtx({ ...ctx, objetivo: e.target.value })} /></label>
            <label className="label">Fee mensal (R$)<input className="input" value={ctx.fee} disabled={closingActive} onChange={(e) => setCtx({ ...ctx, fee: e.target.value })} /></label>
            <label className="label">Setup (R$)<input className="input" value={ctx.setup} disabled={closingActive} onChange={(e) => setCtx({ ...ctx, setup: e.target.value })} /></label>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-2">Fechamento</h2>
          {flow !== 'done' ? (
            <>
              <p className="text-sm text-muted mb-3">Etapas dentro do chat: <b>documentos → validação → contrato → assinatura digital (código SMS) → QR Code do PIX</b> → cadastro do cliente.</p>
              <ol className="text-xs space-y-1 mb-3">
                <li className={flow === 'docs' ? 'text-accent' : 'text-muted'}>1 · Documentos {docs.cnpj && docs.social && docs.acessos ? '✅' : ''}</li>
                <li className={fechado ? 'text-accent2' : 'text-muted'}>2 · Contrato {fechado ? '✅' : ''}</li>
                <li className={flow === 'sign' || flow === 'signcode' ? 'text-accent' : 'text-muted'}>3 · Assinatura</li>
                <li className="text-muted">4 · PIX do setup</li>
              </ol>
              <button className="btn" disabled={typing || closingActive} onClick={iniciarFechamento}>
                💚 Iniciar fechamento {canClose ? '(lead aceitou!)' : ''}
              </button>
              {closingActive && <p className="text-xs text-muted mt-2">Fechamento em andamento no chat — use os botões do celular.</p>}
            </>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-accent2">✅ Negócio fechado e cliente cadastrado.</p>
              <p className="text-xs">Contrato <span className="font-mono-data">{fechado?.numeroContrato}</span></p>
              <div><p className="label">Assinatura digital</p><p className="font-mono-data text-xs break-all">{fechado?.assinatura}</p></div>
              {fechado?.pix && <div><p className="label">PIX do setup (copia e cola)</p><textarea readOnly className="input font-mono-data text-xs" rows={3} value={fechado.pix} /></div>}
              {fechado?.pixDemo && <p className="text-xs text-gold">⚠ PIX de demonstração — configure sua Chave PIX em Configurações para gerar um QR real.</p>}
              <details><summary className="cursor-pointer text-accent">Ver contrato gerado</summary><pre className="mt-2 whitespace-pre-wrap rounded-lg bg-panel2 border border-line p-3 text-xs leading-relaxed">{fechado?.contrato}</pre></details>
              <a href="/clientes" className="btn-ghost text-xs">Ver em Clientes →</a>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .phone{width:410px;background:#060503;border-radius:54px;padding:12px;position:relative;box-shadow:0 34px 70px -22px rgba(0,0,0,.85),0 0 0 1px rgba(34,211,238,.35),0 0 40px -10px rgba(34,211,238,.18)}
        .phone-screen{border-radius:43px;overflow:hidden;background:#e5ddd5;display:flex;flex-direction:column;height:720px;position:relative}
        .phone-island{position:absolute;top:9px;left:50%;transform:translateX(-50%);width:88px;height:24px;background:#060503;border-radius:20px;z-index:30}
        .wa-top{background:#075e54;color:#fff;padding:40px 14px 11px;display:flex;align-items:center;gap:10px;flex-shrink:0}
        .wa-ava{width:36px;height:36px;border-radius:50%;display:grid;place-items:center;font-size:17px;background:linear-gradient(135deg,#22d3ee,#34d399);flex-shrink:0}
        .wa-top .who{flex:1;min-width:0} .wa-top .who b{display:block;font-size:14px;line-height:1.2} .wa-top .who span{font-size:11px;opacity:.85;display:flex;align-items:center;gap:5px} .wa-top .who span::before{content:"";width:6px;height:6px;border-radius:50%;background:#5df0a0}
        .wa-reset{background:rgba(255,255,255,.15);border:none;color:#fff;width:30px;height:30px;border-radius:50%;font-size:15px;flex-shrink:0;cursor:pointer}
        .wa-chat{flex:1;overflow-y:auto;padding:14px 12px;display:flex;flex-direction:column;gap:8px;background:#e5ddd5;font-size:13.5px;line-height:1.48;color:#1c211c}
        .msg{max-width:84%;padding:7px 10px 5px;border-radius:9px;box-shadow:0 1px 1px rgba(0,0,0,.12);position:relative;animation:msgin .25s ease}
        @keyframes msgin{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .msg .t{display:block;text-align:right;font-size:9.5px;color:rgba(0,0,0,.4);margin-top:2px;line-height:1}
        .msg.in{background:#fff;align-self:flex-start;border-top-left-radius:2px}
        .msg.out{background:#d9fdd3;align-self:flex-end;border-top-right-radius:2px}
        .wa-day{align-self:center;background:rgba(255,255,255,.85);color:#56655e;font-size:10px;font-weight:600;padding:4px 10px;border-radius:7px;text-transform:uppercase;letter-spacing:.04em;text-align:center}
        .typing{background:#fff;align-self:flex-start;border-radius:9px;border-top-left-radius:2px;padding:10px 13px;display:flex;gap:4px;box-shadow:0 1px 1px rgba(0,0,0,.12)}
        .typing i{width:6px;height:6px;border-radius:50%;background:#9aa59f;animation:blink 1.3s infinite} .typing i:nth-child(2){animation-delay:.2s} .typing i:nth-child(3){animation-delay:.4s}
        @keyframes blink{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
        /* card de contrato dentro do chat */
        .ctr-card{align-self:flex-start;max-width:90%;border:1px solid #bfe3d4;border-radius:10px;background:#f3fbf6;padding:10px 12px;box-shadow:0 1px 2px rgba(0,0,0,.12);animation:msgin .25s ease}
        .ctr-card .ctr-head{font-size:9.5px;font-weight:800;letter-spacing:.07em;color:#075e54;text-transform:uppercase;border-bottom:1px dashed #bfe3d4;padding-bottom:5px;margin-bottom:7px}
        .ctr-card .ctr-t{font-size:13px;font-weight:700;color:#10241c}
        .ctr-card .ctr-row{display:block;font-size:11.5px;color:#2b3a33;margin-top:4px}
        .ctr-card .ctr-foot{font-size:9.5px;color:#6c7a72;border-top:1px dashed #bfe3d4;margin-top:8px;padding-top:6px;word-break:break-all}
        /* card de PIX (QR) dentro do chat */
        .pix-card{align-self:flex-start;max-width:90%;border:1px solid #bfe3d4;border-radius:10px;background:#fff;padding:11px 12px;box-shadow:0 1px 2px rgba(0,0,0,.12);animation:msgin .25s ease;text-align:center}
        .pix-card .pix-head{font-size:9.5px;font-weight:800;letter-spacing:.07em;color:#075e54;text-transform:uppercase;margin-bottom:8px}
        .pix-card .pix-qr{width:188px;height:188px;margin:0 auto;background:#fff;border-radius:8px;display:flex;align-items:center;justify-content:center}
        .pix-card .pix-qr svg{width:100%;height:100%}
        .pix-card .pix-val{font-family:'JetBrains Mono',monospace;font-weight:700;font-size:15px;color:#075e54;margin-top:8px}
        .pix-card .pix-cc{margin-top:8px;width:100%;font-family:'JetBrains Mono',monospace;font-size:9.5px;color:#33403a;background:#f3fbf6;border:1px solid #bfe3d4;border-radius:7px;padding:7px;resize:none;word-break:break-all}
        .pix-card .pix-copy{margin-top:6px;background:#075e54;color:#fff;border:none;border-radius:100px;font-size:11px;font-weight:600;padding:7px 16px;cursor:pointer}
        .pix-card .pix-demo{margin-top:7px;font-size:9.5px;color:#a6720b;background:#fff7e6;border:1px solid #f0d79a;border-radius:6px;padding:5px 7px;text-align:left}
        .chips{display:flex;gap:6px;padding:7px 10px 2px;flex-wrap:wrap;flex-shrink:0;max-height:120px;overflow-y:auto}
        .chips .chip{background:#fff;border:1px solid #cfd8d2;color:#075e54;font-size:11px;font-weight:600;padding:6px 12px;border-radius:100px;cursor:pointer;white-space:nowrap}
        .chips .chip:hover{background:#075e54;color:#fff}
        .chips .chip:disabled{opacity:.5;cursor:default}
        .chips .chip-go{background:#075e54;color:#fff;border-color:#075e54}
        .chips .chip-go:hover{background:#0a7a6c}
        .wa-input{flex-shrink:0;padding:8px 10px 16px;display:flex;gap:8px;align-items:center;background:#e5ddd5}
        .wa-input .field{flex:1;background:#fff;border:none;border-radius:100px;padding:11px 15px;font-size:12.5px;color:#1c211c;outline:none}
        .wa-input .field:disabled{opacity:.7}
        .wa-input .send{width:38px;height:38px;border-radius:50%;background:#075e54;border:none;color:#fff;font-size:15px;flex-shrink:0;cursor:pointer}
        .wa-input .send:disabled{opacity:.5}
        @media(max-width:980px){.phone{width:100%;max-width:410px;margin:0 auto}}
      `}</style>
    </div>
  );
}

function ContratoCard({ ctx, res }: { ctx: Ctx; res: FechamentoResult }) {
  return (
    <div className="ctr-card">
      <div className="ctr-head">📄 Contrato digital · Nº {res.numeroContrato}</div>
      <div className="ctr-t">Gestão de Tráfego Pago · Google Ads</div>
      <span className="ctr-row">👤 <b>{ctx.nome}</b> · {ctx.segmento}</span>
      <span className="ctr-row">💰 Setup (implantação): <b>{brl(res.setupCents ?? 0)}</b> à vista</span>
      <span className="ctr-row">📆 Gestão mensal: <b>{brl(res.feeMensalCents ?? 0)}</b>/mês</span>
      <span className="ctr-row">🏢 {res.empresaNome} · {res.dataExtenso}</span>
      <span className="ctr-foot">🔐 Assinado digitalmente · {(res.assinatura || '').slice(0, 24)}…</span>
    </div>
  );
}

function PixCard({ res }: { res: FechamentoResult }) {
  const [copiado, setCopiado] = useState(false);
  function copiar() {
    if (res.pix) navigator.clipboard?.writeText(res.pix).then(() => { setCopiado(true); setTimeout(() => setCopiado(false), 1800); }).catch(() => {});
  }
  return (
    <div className="pix-card">
      <div className="pix-head">💸 PIX do setup</div>
      {res.pixQrSvg
        ? <div className="pix-qr" dangerouslySetInnerHTML={{ __html: res.pixQrSvg }} />
        : <div className="pix-qr" style={{ fontSize: 11, color: '#6c7a72' }}>Sem valor de setup</div>}
      <div className="pix-val">{brl(res.setupCents ?? 0)}</div>
      {res.pix && <textarea className="pix-cc" readOnly rows={3} value={res.pix} onFocus={(e) => e.currentTarget.select()} />}
      {res.pix && <button className="pix-copy" onClick={copiar}>{copiado ? '✓ Copiado!' : '📋 Copiar código'}</button>}
      {res.pixDemo && <div className="pix-demo">⚠ QR de demonstração. Configure sua <b>Chave PIX</b> em Configurações para gerar um código escaneável de verdade.</div>}
    </div>
  );
}
