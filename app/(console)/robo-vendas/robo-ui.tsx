'use client';

import { useEffect, useRef, useState } from 'react';
import { fecharNegocio, type FechamentoResult } from './actions';

type Msg = { role: 'lead' | 'bot' | 'sys'; text: string };
type Ctx = { nome: string; contato: string; segmento: string; objetivo: string; fee: string; setup: string; projecao?: string };

const CHIPS_NEG = ['Tá caro pra mim', 'Vou pensar e te falo', 'Não sei se funciona pro meu negócio', 'Agora não é um bom momento'];

const brl = (c: number) => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export function RoboUI({ leads }: { leads: Array<{ id: string; nome: string; contato: string; segmento: string; objetivo: string; fee: string; setup: string; projecao?: string }> }) {
  const test: Ctx = { nome: 'Mariana', contato: '(51) 99999-0000', segmento: 'Clínica odontológica', objetivo: 'gerar 30 agendamentos/mês', fee: '1800', setup: '1500' };
  const [ctx, setCtx] = useState<Ctx>(leads[0] ? mapLead(leads[0]) : test);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [fechado, setFechado] = useState<FechamentoResult | null>(null);
  const [canClose, setCanClose] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  function mapLead(l: any): Ctx { return { nome: l.nome, contato: l.contato, segmento: l.segmento, objetivo: l.objetivo, fee: l.fee, setup: l.setup, projecao: l.projecao }; }

  useEffect(() => { if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight; }, [msgs, typing]);

  async function botReply(history: Msg[]) {
    setTyping(true);
    try {
      const r = await fetch('/api/robo', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ctx, messages: history.filter((m) => m.role !== 'sys') }) });
      const d = await r.json();
      if (d.text) { setMsgs((m) => [...m, { role: 'bot', text: d.text }]); if (d.fechar) setCanClose(true); }
      else setMsgs((m) => [...m, { role: 'sys', text: d.error || 'Erro ao responder' }]);
    } catch { setMsgs((m) => [...m, { role: 'sys', text: 'Falha de rede' }]); }
    finally { setTyping(false); }
  }

  function iniciar() {
    setFechado(null); setCanClose(false);
    const inicio: Msg[] = [];
    setMsgs(inicio);
    botReply(inicio);
  }

  function send(text: string) {
    if (!text.trim() || typing) return;
    const next = [...msgs, { role: 'lead' as const, text }];
    setMsgs(next); setInput('');
    botReply(next);
  }

  async function fechar() {
    setTyping(true);
    const res = await fecharNegocio({ nome: ctx.nome, contato: ctx.contato, segmento: ctx.segmento, objetivo: ctx.objetivo, feeMensal: ctx.fee, setup: ctx.setup });
    setTyping(false);
    if (!res.ok) { setMsgs((m) => [...m, { role: 'sys', text: res.error || 'Erro ao fechar' }]); return; }
    setFechado(res);
    setMsgs((m) => [...m,
      { role: 'bot', text: `Perfeito, ${ctx.nome.split(' ')[0]}! Acabei de gerar seu contrato e já está assinado digitalmente ✅` },
      { role: 'bot', text: `Para liberar o início, o setup de ${brl(res.setupCents ?? 0)} é pago via PIX. Te mando o código copia e cola agora 👇` },
      { role: 'bot', text: `PIX (copia e cola):\n${res.pix || '(configure a chave PIX em Configurações para gerar)'}` },
      { role: 'bot', text: `Cliente cadastrado! Gestão mensal de ${brl(res.feeMensalCents ?? 0)}. Bem-vinda à TráfegoPRO 🚀` },
    ]);
  }

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
            {msgs.map((m, i) => m.role === 'sys'
              ? <div key={i} className="wa-day" style={{ color: '#b91c1c' }}>{m.text}</div>
              : <div key={i} className={`msg ${m.role === 'lead' ? 'out' : 'in'}`}>{m.text.split('\n').map((l, j) => <div key={j} style={{ wordBreak: 'break-word' }}>{l}</div>)}<span className="t">{m.role === 'lead' ? 'você' : 'bot'}</span></div>
            )}
            {typing && <div className="typing"><i /><i /><i /></div>}
          </div>
          {!fechado && (
            <div className="chips">
              {msgs.length === 0
                ? <button className="chip" onClick={iniciar}>▶ Iniciar atendimento</button>
                : CHIPS_NEG.map((c) => <button key={c} className="chip" onClick={() => send(c)} disabled={typing}>{c}</button>)}
            </div>
          )}
          <div className="wa-input">
            <input className="field" placeholder={fechado ? 'Negócio fechado ✅' : 'Responda como o lead…'} value={input}
              disabled={typing || !!fechado || msgs.length === 0}
              onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(input); }} />
            <button className="send" onClick={() => send(input)} disabled={typing || !!fechado}>➤</button>
          </div>
        </div>
      </div>

      {/* ===== Painel lateral ===== */}
      <div className="space-y-4">
        <div className="card">
          <h2 className="font-semibold mb-1">Simular atendimento</h2>
          <p className="text-sm text-muted mb-3">Escolha um lead real (do site) ou use o lead de teste. Você responde como o cliente; o robô conduz, contorna objeções e fecha.</p>
          {leads.length > 0 && (
            <select className="input mb-3" onChange={(e) => { const l = leads.find((x) => x.id === e.target.value); if (l) setCtx(mapLead(l)); setMsgs([]); setFechado(null); setCanClose(false); }}>
              {leads.map((l) => <option key={l.id} value={l.id}>{l.nome} — {l.segmento}</option>)}
            </select>
          )}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label className="label">Nome<input className="input" value={ctx.nome} onChange={(e) => setCtx({ ...ctx, nome: e.target.value })} /></label>
            <label className="label">Contato<input className="input" value={ctx.contato} onChange={(e) => setCtx({ ...ctx, contato: e.target.value })} /></label>
            <label className="label">Segmento<input className="input" value={ctx.segmento} onChange={(e) => setCtx({ ...ctx, segmento: e.target.value })} /></label>
            <label className="label">Objetivo<input className="input" value={ctx.objetivo} onChange={(e) => setCtx({ ...ctx, objetivo: e.target.value })} /></label>
            <label className="label">Fee mensal (R$)<input className="input" value={ctx.fee} onChange={(e) => setCtx({ ...ctx, fee: e.target.value })} /></label>
            <label className="label">Setup (R$)<input className="input" value={ctx.setup} onChange={(e) => setCtx({ ...ctx, setup: e.target.value })} /></label>
          </div>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-2">Fechamento</h2>
          {!fechado ? (
            <>
              <p className="text-sm text-muted mb-3">Quando o lead aceitar (o robô sinaliza, ou você decide), feche: gera contrato, assina digitalmente, cria o PIX do setup e cadastra o cliente.</p>
              <button className="btn" disabled={typing} onClick={fechar}>💚 Fechar negócio {canClose ? '(lead aceitou!)' : ''}</button>
            </>
          ) : (
            <div className="space-y-3 text-sm">
              <p className="text-accent2">✅ Negócio fechado e cliente cadastrado.</p>
              <div><p className="label">Assinatura digital</p><p className="font-mono-data text-xs break-all">{fechado.assinatura}</p></div>
              {fechado.pix && <div><p className="label">PIX do setup (copia e cola)</p><textarea readOnly className="input font-mono-data text-xs" rows={3} value={fechado.pix} /></div>}
              <details><summary className="cursor-pointer text-accent">Ver contrato gerado</summary><pre className="mt-2 whitespace-pre-wrap rounded-lg bg-panel2 border border-line p-3 text-xs leading-relaxed">{fechado.contrato}</pre></details>
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
        .wa-day{align-self:center;background:rgba(255,255,255,.85);color:#56655e;font-size:10px;font-weight:600;padding:4px 10px;border-radius:7px;text-transform:uppercase;letter-spacing:.04em}
        .typing{background:#fff;align-self:flex-start;border-radius:9px;border-top-left-radius:2px;padding:10px 13px;display:flex;gap:4px;box-shadow:0 1px 1px rgba(0,0,0,.12)}
        .typing i{width:6px;height:6px;border-radius:50%;background:#9aa59f;animation:blink 1.3s infinite} .typing i:nth-child(2){animation-delay:.2s} .typing i:nth-child(3){animation-delay:.4s}
        @keyframes blink{0%,60%,100%{opacity:.3;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
        .chips{display:flex;gap:6px;padding:7px 10px 2px;flex-wrap:wrap;flex-shrink:0}
        .chips .chip{background:#fff;border:1px solid #cfd8d2;color:#075e54;font-size:11px;font-weight:600;padding:6px 12px;border-radius:100px;cursor:pointer;white-space:nowrap}
        .chips .chip:hover{background:#075e54;color:#fff}
        .wa-input{flex-shrink:0;padding:8px 10px 16px;display:flex;gap:8px;align-items:center;background:#e5ddd5}
        .wa-input .field{flex:1;background:#fff;border:none;border-radius:100px;padding:11px 15px;font-size:12.5px;color:#1c211c;outline:none}
        .wa-input .send{width:38px;height:38px;border-radius:50%;background:#075e54;border:none;color:#fff;font-size:15px;flex-shrink:0;cursor:pointer}
        .wa-input .send:disabled{opacity:.5}
        @media(max-width:980px){.phone{width:100%;max-width:410px;margin:0 auto}}
      `}</style>
    </div>
  );
}
