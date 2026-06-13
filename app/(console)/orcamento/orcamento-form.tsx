'use client';

import { useState } from 'react';

type Cenario = {
  nome: string;
  metricaChave: string;
  investimentoMidiaMensal: number;
  feeServicoMensal: number;
  retornoEstimadoMensal: number;
  observacao: string;
};
type Orcamento = {
  resumo: string;
  precoServico: { modelo: string; minMensal: number; recomendadoMensal: number; maxMensal: number; setupInicial: number; justificativa: string };
  cenarios: Cenario[];
  retornoCliente: string;
  premissas: string[];
  ressalvas: string[];
};

const brl = (v: number) => 'R$ ' + (v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
const CEN_COLOR: Record<string, string> = { Conservador: '#8595b4', Realista: '#22d3ee', Otimista: '#34d399' };

export function OrcamentoForm() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [o, setO] = useState<Orcamento | null>(null);
  const [form, setForm] = useState({ segmento: '', objetivo: '', verbaMidiaMensal: '', ticketMedio: '', regiao: '', modeloCobranca: 'sugerir' });

  function upd(k: string, v: string) { setForm((f) => ({ ...f, [k]: v })); }

  async function gerar(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    try {
      const r = await fetch('/api/orcamento', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
      const data = await r.json();
      if (!r.ok || data.error) setError(data.error ?? `HTTP ${r.status}`);
      else setO(data.orcamento);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha de rede');
    } finally { setBusy(false); }
  }

  const maxRetorno = o ? Math.max(1, ...o.cenarios.map((c) => c.retornoEstimadoMensal)) : 1;

  return (
    <div className="space-y-8">
      <form onSubmit={gerar} className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="label">Segmento do cliente *</label>
            <input className="input" required value={form.segmento} onChange={(e) => upd('segmento', e.target.value)} placeholder="Ex.: clínica odontológica, e-commerce de moda, SaaS B2B financeiro" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Objetivo do cliente *</label>
            <textarea className="input" required rows={2} value={form.objetivo} onChange={(e) => upd('objetivo', e.target.value)} placeholder="Ex.: gerar 30 agendamentos/mês; aumentar vendas online em 40%; X assinaturas/mês" />
          </div>
          <div>
            <label className="label">Verba de mídia mensal do cliente (R$)</label>
            <input className="input" type="number" value={form.verbaMidiaMensal} onChange={(e) => upd('verbaMidiaMensal', e.target.value)} placeholder="opcional — ex.: 3000" />
          </div>
          <div>
            <label className="label">Ticket médio / valor do produto (R$)</label>
            <input className="input" type="number" value={form.ticketMedio} onChange={(e) => upd('ticketMedio', e.target.value)} placeholder="opcional — ex.: 200" />
          </div>
          <div>
            <label className="label">Região</label>
            <input className="input" value={form.regiao} onChange={(e) => upd('regiao', e.target.value)} placeholder="opcional — ex.: Porto Alegre/RS" />
          </div>
          <div>
            <label className="label">Modelo de cobrança</label>
            <select className="input" value={form.modeloCobranca} onChange={(e) => upd('modeloCobranca', e.target.value)}>
              <option value="sugerir">A IA sugere o melhor</option>
              <option value="fee_fixo">Fee fixo mensal</option>
              <option value="fee_percentual">% da verba de mídia</option>
              <option value="fee_mais_percentual">Fee fixo + % da verba</option>
            </select>
          </div>
        </div>
        <button type="submit" className="btn" disabled={busy}>{busy ? 'Calculando proposta…' : 'Gerar proposta com IA'}</button>
      </form>

      {error && <div className="rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">{error}</div>}

      {o && (
        <div className="space-y-6">
          <p className="text-sm leading-relaxed text-slate-200">{o.resumo}</p>

          {/* Preço do serviço */}
          <section className="card reveal">
            <h2 className="font-semibold mb-1">💰 Quanto cobrar pela gestão</h2>
            <p className="text-xs text-muted mb-4">Modelo recomendado: <span className="text-accent">{o.precoServico.modelo}</span></p>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-lg border border-line bg-panel2 p-4 text-center">
                <p className="label">Mínimo</p>
                <p className="text-xl font-bold font-mono-data text-slate-300">{brl(o.precoServico.minMensal)}<span className="text-xs text-muted">/mês</span></p>
              </div>
              <div className="rounded-lg border border-accent/40 bg-accent/10 p-4 text-center shadow-glow">
                <p className="label text-accent">Recomendado</p>
                <p className="text-2xl font-extrabold font-mono-data text-accent glow-text">{brl(o.precoServico.recomendadoMensal)}<span className="text-xs">/mês</span></p>
              </div>
              <div className="rounded-lg border border-line bg-panel2 p-4 text-center">
                <p className="label">Máximo</p>
                <p className="text-xl font-bold font-mono-data text-slate-300">{brl(o.precoServico.maxMensal)}<span className="text-xs text-muted">/mês</span></p>
              </div>
            </div>
            {o.precoServico.setupInicial > 0 && (
              <p className="mt-3 text-sm text-slate-300">Setup inicial sugerido: <span className="font-mono-data text-white">{brl(o.precoServico.setupInicial)}</span></p>
            )}
            <p className="mt-3 text-sm text-muted">{o.precoServico.justificativa}</p>
          </section>

          {/* Projeção de retorno */}
          <section className="card reveal reveal-1">
            <h2 className="font-semibold mb-1">📈 Projeção de retorno do cliente</h2>
            <p className="text-xs text-muted mb-4">Relativo ao objetivo declarado · cenários estimados (não são garantia)</p>
            <div className="grid gap-4 lg:grid-cols-3">
              {o.cenarios.map((c, i) => {
                const inv = c.investimentoMidiaMensal + c.feeServicoMensal;
                const roi = inv > 0 ? c.retornoEstimadoMensal / inv : 0;
                const color = CEN_COLOR[c.nome] ?? '#22d3ee';
                return (
                  <div key={i} className="rounded-lg border border-line bg-panel2 p-4">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold" style={{ color }}>{c.nome}</span>
                      <span className="rounded border border-line px-2 py-0.5 text-xs font-mono-data" style={{ color }}>ROI {roi.toFixed(1)}x</span>
                    </div>
                    <p className="mt-1 text-xs text-muted">{c.metricaChave}</p>
                    <div className="mt-3 space-y-1 text-sm">
                      <div className="flex justify-between"><span className="text-muted">Mídia/mês</span><span className="font-mono-data">{brl(c.investimentoMidiaMensal)}</span></div>
                      <div className="flex justify-between"><span className="text-muted">Sua gestão</span><span className="font-mono-data">{brl(c.feeServicoMensal)}</span></div>
                      <div className="flex justify-between border-t border-line pt-1"><span className="text-muted">Retorno est./mês</span><span className="font-mono-data font-bold" style={{ color }}>{brl(c.retornoEstimadoMensal)}</span></div>
                    </div>
                    {/* barra de retorno */}
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-bg2">
                      <div className="bar-grow h-full rounded-full" style={{ width: `${(c.retornoEstimadoMensal / maxRetorno) * 100}%`, background: color, boxShadow: `0 0 10px ${color}`, animationDelay: `${i * 0.08}s` }} />
                    </div>
                    <p className="mt-2 text-xs text-muted">{c.observacao}</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-slate-200">{o.retornoCliente}</p>
          </section>

          <div className="grid gap-4 sm:grid-cols-2">
            <section className="card">
              <p className="label">Premissas usadas</p>
              <ul className="mt-1 space-y-1 text-sm text-slate-300">{o.premissas.map((x, i) => <li key={i}>• {x}</li>)}</ul>
            </section>
            <section className="card">
              <p className="label text-gold">Ressalvas</p>
              <ul className="mt-1 space-y-1 text-sm text-slate-300">{o.ressalvas.map((x, i) => <li key={i}>⚠️ {x}</li>)}</ul>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
