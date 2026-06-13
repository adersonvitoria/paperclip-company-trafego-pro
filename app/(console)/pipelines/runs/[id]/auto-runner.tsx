'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  runId: string;
  active: boolean;        // run.auto && !done — começa rodando ao montar
  nextLabel: string;      // rótulo da próxima etapa
  totalSteps: number;
  doneSteps: number;
};

export function AutoRunner({ runId, active, nextLabel, totalSteps, doneSteps }: Props) {
  const router = useRouter();
  const [running, setRunning] = useState(active);
  const [error, setError] = useState<string | null>(null);
  const loopGuard = useRef(false);

  async function setAuto(value: boolean) {
    await fetch(`/api/runs/${runId}/auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ auto: value }),
    }).catch(() => undefined);
  }

  useEffect(() => {
    if (!running || loopGuard.current) return;
    loopGuard.current = true;
    let cancelled = false;

    (async () => {
      while (!cancelled) {
        let data: { status?: string; error?: string };
        try {
          const res = await fetch(`/api/runs/${runId}/advance`, { method: 'POST' });
          data = await res.json();
          if (!res.ok) data.error = data.error ?? `HTTP ${res.status}`;
        } catch (e) {
          data = { error: e instanceof Error ? e.message : 'Falha de rede' };
        }
        if (cancelled) return;

        if (data.error) {
          setError(data.error);
          setRunning(false);
          router.refresh();
          return;
        }
        router.refresh();
        if (data.status === 'DONE') {
          setRunning(false);
          return;
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    })().finally(() => {
      loopGuard.current = false;
    });

    return () => {
      cancelled = true;
    };
  }, [running, runId, router]);

  async function start() {
    setError(null);
    await setAuto(true);
    setRunning(true);
  }

  async function stop() {
    await setAuto(false);
    setRunning(false);
    router.refresh();
  }

  if (running) {
    return (
      <div className="card border-accent space-y-3">
        <div className="flex items-center gap-3">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          <div>
            <p className="font-medium">Executando automaticamente — etapa {doneSteps + 1} de {totalSteps}</p>
            <p className="text-xs text-muted">{nextLabel} · cada etapa leva 1–3 min. Mantenha esta aba aberta.</p>
          </div>
        </div>
        <button type="button" onClick={stop} className="btn-ghost text-xs">Pausar automação</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">
          A automação parou: {error}
        </div>
      )}
      <button type="button" onClick={start} className="btn">
        ▶ Rodar tudo automaticamente ({totalSteps - doneSteps} etapas restantes)
      </button>
      <p className="text-xs text-muted">Encadeia todas as etapas restantes sem você clicar a cada uma. A aba precisa ficar aberta.</p>
    </div>
  );
}
