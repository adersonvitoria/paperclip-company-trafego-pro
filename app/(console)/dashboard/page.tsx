import Link from 'next/link';
import { computeDashboardMetrics } from '@/lib/metrics';
import { StatCard, DonutChart, BarChart, Sparkbars, Gauge } from '@/components/charts';
import { AIAnalysisPanel } from './ai-analysis-panel';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;
const pct = (v: number) => `${Math.round(v * 100)}%`;

export default async function DashboardPage() {
  const m = await computeDashboardMetrics();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted">Métricas e estatísticas da operação, dos agentes e da mídia — com análise de IA.</p>
      </header>

      {/* KPIs principais */}
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Execuções de pipeline" value={String(m.runs.total)} sub={`${m.runs.done} concluídas · ${m.runs.running} ativas · ${m.runs.error} com erro`} accent="#4f8cff" />
        <StatCard label="Taxa de conclusão" value={pct(m.runs.completionRate)} sub={`${m.runs.stepsTotal} etapas geradas`} accent="#34d399" />
        <StatCard label="Agentes ativos" value={`${m.agents.active}/${m.agents.total}`} sub={`${m.catalog.setores} setores · ${m.catalog.skills} skills`} accent="#fbbf24" />
        <StatCard label="Configuração" value={pct(m.config.pct)} sub={`${m.config.filled}/${m.config.total} campos preenchidos`} accent="#a78bfa" />
      </section>

      {/* Operação */}
      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-4">Execuções por status</h2>
          <DonutChart
            data={[
              { label: 'Concluídas', value: m.runs.done, color: '#34d399' },
              { label: 'Em andamento', value: m.runs.running, color: '#fbbf24' },
              { label: 'Com erro', value: m.runs.error, color: '#f87171' },
            ]}
          />
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Atividade (últimos 14 dias)</h2>
          <Sparkbars data={m.timeline} />
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-4">Execuções por pipeline</h2>
          <BarChart data={m.byPipeline} color="#4f8cff" />
        </div>
        <div className="card">
          <h2 className="font-semibold mb-4">Agentes ativos por setor</h2>
          <BarChart data={m.agents.bySetor.map((s) => ({ label: s.setor, value: s.active }))} color="#fbbf24" />
        </div>
      </section>

      {/* Configuração detalhada */}
      <section className="card">
        <h2 className="font-semibold mb-4">Completude da configuração</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {m.config.sections.map((s) => (
            <div key={s.title}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-slate-300">{s.title}</span>
                <span className={s.done === s.total ? 'text-accent2' : s.done > 0 ? 'text-gold' : 'text-muted'}>{s.done}/{s.total}</span>
              </div>
              <Gauge pct={s.total ? s.done / s.total : 0} color={s.done === s.total ? '#34d399' : '#fbbf24'} />
            </div>
          ))}
        </div>
      </section>

      {/* Mídia Google Ads */}
      <section className="card">
        <h2 className="font-semibold mb-1">Mídia paga (Google Ads · 30 dias)</h2>
        {m.ads.available && m.ads.snapshot ? (
          <>
            <p className="text-sm text-muted mb-4">Conta {m.ads.snapshot.customerId}</p>
            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Custo" value={brl(m.ads.snapshot.totals.costBRL)} />
              <StatCard label="Cliques" value={String(m.ads.snapshot.totals.clicks)} sub={`CTR ${pct(m.ads.snapshot.totals.ctr)}`} />
              <StatCard label="CPC" value={brl(m.ads.snapshot.totals.cpcBRL)} />
              <StatCard label="Conversões" value={String(m.ads.snapshot.totals.conversions)} />
              <StatCard label="CPA" value={m.ads.snapshot.totals.cpaBRL !== null ? brl(m.ads.snapshot.totals.cpaBRL) : '—'} />
              <StatCard label="ROAS" value={m.ads.snapshot.totals.roas !== null ? m.ads.snapshot.totals.roas.toFixed(2) : '—'} />
            </div>
          </>
        ) : (
          <div className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-gold">
            Métricas de mídia indisponíveis: {m.ads.reason}{' '}
            <Link href="/conta" className="underline">Ver detalhes →</Link>
          </div>
        )}
      </section>

      {/* Análise com IA */}
      <AIAnalysisPanel />

      <p className="text-xs text-muted">Snapshot gerado em {new Date(m.generatedAt).toLocaleString('pt-BR')}.</p>
    </div>
  );
}
