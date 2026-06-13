'use client';

import { useState } from 'react';

type Acao = { titulo: string; detalhe: string; prioridade: 'alta' | 'media' | 'baixa' };
type Analysis = { resumo: string; pontosFortes: string[]; riscos: string[]; acoes: Acao[] };

const PRIO: Record<string, { label: string; cls: string }> = {
  alta: { label: 'Alta', cls: 'border-red-400/40 bg-red-400/10 text-red-300' },
  media: { label: 'Média', cls: 'border-gold/40 bg-gold/10 text-gold' },
  baixa: { label: 'Baixa', cls: 'border-accent/40 bg-accent/10 text-accent' },
};

export function AIAnalysisPanel() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [a, setA] = useState<Analysis | null>(null);

  async function run() {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch('/api/dashboard/analysis', { method: 'POST' });
      const data = await r.json();
      if (!r.ok || data.error) setError(data.error ?? `HTTP ${r.status}`);
      else setA(data.analysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha de rede');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="card border-accent/40 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold">🤖 Análise com IA</h2>
          <p className="text-sm text-muted">A IA lê todas as métricas acima e recomenda ações priorizadas.</p>
        </div>
        <button type="button" className="btn text-sm" disabled={busy} onClick={run}>
          {busy ? 'Analisando…' : a ? 'Atualizar análise' : 'Gerar análise'}
        </button>
      </div>

      {error && <div className="rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">{error}</div>}

      {a && (
        <div className="space-y-5">
          <p className="text-sm leading-relaxed text-slate-200">{a.resumo}</p>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="label text-accent2">Pontos fortes</p>
              <ul className="mt-1 space-y-1 text-sm text-slate-300">
                {a.pontosFortes.map((x, i) => <li key={i}>✅ {x}</li>)}
              </ul>
            </div>
            <div>
              <p className="label text-gold">Riscos</p>
              <ul className="mt-1 space-y-1 text-sm text-slate-300">
                {a.riscos.map((x, i) => <li key={i}>⚠️ {x}</li>)}
              </ul>
            </div>
          </div>

          <div>
            <p className="label mb-2">Ações recomendadas</p>
            <ol className="space-y-2">
              {[...a.acoes].sort((x, y) => ({ alta: 0, media: 1, baixa: 2 }[x.prioridade] - { alta: 0, media: 1, baixa: 2 }[y.prioridade])).map((ac, i) => {
                const p = PRIO[ac.prioridade] ?? PRIO.media;
                return (
                  <li key={i} className="rounded-lg border border-line bg-panel2 p-3">
                    <div className="flex items-center gap-2">
                      <span className={`rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${p.cls}`}>{p.label}</span>
                      <span className="font-semibold text-white">{ac.titulo}</span>
                    </div>
                    <p className="mt-1 text-sm text-slate-300">{ac.detalhe}</p>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      )}
    </section>
  );
}
