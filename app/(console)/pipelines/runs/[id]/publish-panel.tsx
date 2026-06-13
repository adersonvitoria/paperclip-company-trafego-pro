'use client';

import { useState } from 'react';

type Issue = { level: 'error' | 'warn'; message: string };
type Plan = {
  campaignName: string;
  dailyBudgetBRL: number;
  defaultCpcBidBRL: number;
  finalUrl: string;
  adGroups: Array<{ name: string; keywords: unknown[]; negativeKeywords?: unknown[]; headlines: string[]; descriptions: string[] }>;
};
type ApiResp = {
  plan?: Plan;
  issues?: Issue[];
  result?: { ok: boolean; validateOnly: boolean; operations: number; resourceNames?: string[]; error?: string };
  error?: string;
};

export function PublishPanel({ runId, gatePassed }: { runId: string; gatePassed: boolean }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [resp, setResp] = useState<ApiResp | null>(null);

  async function call(mode: 'plan' | 'preview' | 'apply') {
    setBusy(mode);
    setResp(null);
    try {
      const r = await fetch(`/api/runs/${runId}/publish`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode }),
      });
      setResp(await r.json());
    } catch (e) {
      setResp({ error: e instanceof Error ? e.message : 'Falha de rede' });
    } finally {
      setBusy(null);
    }
  }

  const plan = resp?.plan;
  const errors = (resp?.issues ?? []).filter((i) => i.level === 'error');
  const warns = (resp?.issues ?? []).filter((i) => i.level === 'warn');

  return (
    <section className="card border-accent2/40 space-y-4">
      <div>
        <h2 className="font-semibold">Publicar na conta Google Ads</h2>
        <p className="text-sm text-muted">
          Converte o blueprint desta execução em uma campanha Search real. A campanha é criada{' '}
          <strong>pausada</strong> (nada gasta até você revisar e ativar no Google Ads).
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button type="button" className="btn-ghost text-sm" disabled={!!busy} onClick={() => call('plan')}>
          {busy === 'plan' ? 'Gerando…' : '1. Gerar plano estruturado'}
        </button>
        <button type="button" className="btn-ghost text-sm" disabled={!!busy} onClick={() => call('preview')}>
          {busy === 'preview' ? 'Validando…' : '2. Pré-visualizar na API (validateOnly)'}
        </button>
        <button
          type="button"
          className="btn text-sm"
          disabled={!!busy || !gatePassed}
          title={gatePassed ? '' : 'Bloqueado: o gate de auditoria precisa estar PASS'}
          onClick={() => call('apply')}
        >
          {busy === 'apply' ? 'Publicando…' : '3. Publicar (pausada)'}
        </button>
      </div>

      {!gatePassed && (
        <p className="text-xs text-gold">
          ⛔ Publicação real travada até o gate de auditoria dar PASS (hoje FAIL — Developer Token em modo teste). Os passos 1 e 2 já funcionam para revisar o plano.
        </p>
      )}

      {resp?.error && (
        <div className="rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-sm text-red-300">{resp.error}</div>
      )}

      {resp?.result && (
        <div className={`rounded-lg border p-3 text-sm ${resp.result.ok ? 'border-accent2/40 bg-accent2/10 text-accent2' : 'border-red-400/40 bg-red-400/10 text-red-300'}`}>
          {resp.result.ok
            ? `✓ ${resp.result.validateOnly ? 'Validação OK (validateOnly)' : 'Campanha publicada (pausada)'} — ${resp.result.operations} operações${resp.result.resourceNames?.length ? '. Recursos: ' + resp.result.resourceNames.join(', ') : ''}`
            : `Erro na API: ${resp.result.error}`}
        </div>
      )}

      {plan && (
        <div className="space-y-3">
          {errors.length > 0 && (
            <ul className="rounded-lg border border-red-400/40 bg-red-400/10 p-3 text-xs text-red-300 space-y-1">
              {errors.map((e, i) => <li key={i}>⛔ {e.message}</li>)}
            </ul>
          )}
          {warns.length > 0 && (
            <ul className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-xs text-gold space-y-1">
              {warns.map((e, i) => <li key={i}>⚠️ {e.message}</li>)}
            </ul>
          )}
          <div className="rounded-lg bg-panel2 border border-line p-4 text-sm">
            <p className="font-semibold">{plan.campaignName}</p>
            <p className="text-xs text-muted">
              Orçamento diário R$ {plan.dailyBudgetBRL} · CPC padrão R$ {plan.defaultCpcBidBRL} · {plan.adGroups.length} grupos · {plan.finalUrl}
            </p>
            <ul className="mt-2 space-y-1 text-xs">
              {plan.adGroups.map((ag, i) => (
                <li key={i} className="text-slate-300">
                  • <strong>{ag.name}</strong>: {ag.keywords.length} keywords{ag.negativeKeywords?.length ? ` (+${ag.negativeKeywords.length} negativas)` : ''}, {ag.headlines.length} headlines, {ag.descriptions.length} descriptions
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
