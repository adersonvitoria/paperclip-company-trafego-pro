import { computeFinance, brlCents } from '@/lib/finance';
import { StatCard, DonutChart, CashflowBars } from '@/components/charts';
import { FinanceUI } from './finance-ui';

export const dynamic = 'force-dynamic';

export default async function FinanceiroPage() {
  const { entries, metrics: m } = await computeFinance();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Faturamento</h1>
        <p className="text-sm text-muted">Contas a pagar e a receber — com parcelamento, recorrência e gestão por gráficos.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="reveal reveal-1"><StatCard label="A receber (pendente)" count={{ to: m.receberPendente / 100, prefix: 'R$ ', decimals: 2 }} sub={m.vencidoReceber > 0 ? `${brlCents(m.vencidoReceber)} vencido` : 'em dia'} accent="#34d399" /></div>
        <div className="reveal reveal-2"><StatCard label="A pagar (pendente)" count={{ to: m.pagarPendente / 100, prefix: 'R$ ', decimals: 2 }} sub={m.vencidoPagar > 0 ? `${brlCents(m.vencidoPagar)} vencido` : 'em dia'} accent="#f87171" /></div>
        <div className="reveal reveal-3"><StatCard label="Saldo previsto" count={{ to: m.saldoPrevisto / 100, prefix: 'R$ ', decimals: 2 }} sub="a receber − a pagar" accent={m.saldoPrevisto >= 0 ? '#22d3ee' : '#f87171'} /></div>
        <div className="reveal reveal-4"><StatCard label="Quitado no mês" count={{ to: m.recebidoMes / 100, prefix: 'R$ ', decimals: 2 }} sub={`pago: ${brlCents(m.pagoMes)}`} accent="#a78bfa" /></div>
      </section>

      <section className="card">
        <h2 className="font-semibold mb-4">Fluxo de caixa projetado (6 meses)</h2>
        <CashflowBars data={m.fluxo} />
      </section>

      {(m.pagarPorCategoria.length > 0 || m.receberPorCategoria.length > 0) && (
        <section className="grid gap-4 lg:grid-cols-2">
          {m.receberPorCategoria.length > 0 && (
            <div className="card">
              <h2 className="font-semibold mb-4">A receber por categoria</h2>
              <DonutChart data={m.receberPorCategoria.map((c) => ({ ...c, value: Math.round(c.value / 100) }))} />
            </div>
          )}
          {m.pagarPorCategoria.length > 0 && (
            <div className="card">
              <h2 className="font-semibold mb-4">A pagar por categoria</h2>
              <DonutChart data={m.pagarPorCategoria.map((c) => ({ ...c, value: Math.round(c.value / 100) }))} />
            </div>
          )}
        </section>
      )}

      <FinanceUI entries={entries} />
    </div>
  );
}
