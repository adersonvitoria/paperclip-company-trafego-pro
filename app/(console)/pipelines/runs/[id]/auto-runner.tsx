'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

type Props = {
  runId: string;
  active: boolean;        // run.auto && !done
  nextLabel: string;
  totalSteps: number;
  doneSteps: number;
};

// O encadeamento roda no SERVIDOR (cada etapa dispara a próxima). Este
// componente apenas inicia/para o modo auto e faz polling para atualizar a UI.
export function AutoRunner({ runId, active, nextLabel, totalSteps, doneSteps }: Props) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  // Enquanto auto estiver ativo, recarrega a página a cada 8s para mostrar progresso
  useEffect(() => {
    if (!active) return;
    const t = setInterval(() => router.refresh(), 8000);
    return () => clearInterval(t);
  }, [active, router]);

  async function setAuto(value: boolean) {
    setBusy(true);
    try {
      await fetch(`/api/runs/${runId}/auto`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auto: value }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  if (active) {
    return (
      <div className="card border-accent space-y-3">
        <div className="flex items-center gap-3">
          <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
          <div>
            <p className="font-medium">Executando automaticamente — etapa {doneSteps + 1} de {totalSteps}</p>
            <p className="text-xs text-muted">{nextLabel} · roda no servidor (pode fechar a aba). Cada etapa leva 1–3 min.</p>
          </div>
        </div>
        <button type="button" onClick={() => setAuto(false)} disabled={busy} className="btn-ghost text-xs">Pausar automação</button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <button type="button" onClick={() => setAuto(true)} disabled={busy} className="btn">
        {busy ? 'Iniciando...' : `▶ Rodar tudo automaticamente (${totalSteps - doneSteps} etapas restantes)`}
      </button>
      <p className="text-xs text-muted">Encadeia todas as etapas restantes no servidor — você pode fechar a aba que continua rodando.</p>
    </div>
  );
}
