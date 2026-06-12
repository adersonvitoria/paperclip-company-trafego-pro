import Link from 'next/link';
import { prisma } from '@/lib/db';
import { AGENTS, PIPELINES, SETORES, pipelineBySlug } from '@/lib/manifest';
import { SETTING_SECTIONS } from '@/lib/settings-def';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const [settings, agentConfigs, runs] = await Promise.all([
    prisma.setting.findMany(),
    prisma.agentConfig.findMany(),
    prisma.pipelineRun.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
  ]);

  const setKeys = new Set(settings.filter((s) => s.value.trim() !== '').map((s) => s.key));
  const disabled = new Set(agentConfigs.filter((c) => !c.enabled).map((c) => c.slug));
  const iaOk = setKeys.has('anthropic_api_key');

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Visão Geral</h1>
        <p className="text-sm text-muted">7 setores · {AGENTS.length} agentes · {PIPELINES.length} pipelines</p>
      </header>

      {!iaOk && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
          ⚠️ A <strong>Anthropic API Key</strong> ainda não foi configurada — os pipelines não conseguem executar.{' '}
          <Link href="/configuracoes" className="underline">Configurar agora →</Link>
        </div>
      )}

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="card">
          <h2 className="font-semibold mb-3">Checklist de configuração</h2>
          <ul className="space-y-2 text-sm">
            {SETTING_SECTIONS.map((section) => {
              const total = section.fields.length;
              const done = section.fields.filter((f) => setKeys.has(f.key)).length;
              return (
                <li key={section.title} className="flex items-center justify-between">
                  <span className="text-slate-300">{section.title}</span>
                  <span className={done === total ? 'text-accent2' : done > 0 ? 'text-gold' : 'text-muted'}>
                    {done}/{total}
                  </span>
                </li>
              );
            })}
          </ul>
          <Link href="/configuracoes" className="btn-ghost mt-4 text-xs">Abrir configurações</Link>
        </div>

        <div className="card">
          <h2 className="font-semibold mb-3">Setores</h2>
          <ul className="space-y-2 text-sm">
            {SETORES.map((setor) => {
              const agents = AGENTS.filter((a) => a.setor === setor);
              const active = agents.filter((a) => !disabled.has(a.slug)).length;
              return (
                <li key={setor} className="flex items-center justify-between">
                  <span className="text-slate-300">{setor}</span>
                  <span className={active === agents.length ? 'text-accent2' : 'text-gold'}>
                    {active}/{agents.length} ativos
                  </span>
                </li>
              );
            })}
          </ul>
          <Link href="/agentes" className="btn-ghost mt-4 text-xs">Gerenciar agentes</Link>
        </div>
      </section>

      <section className="card">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">Últimas execuções</h2>
          <Link href="/pipelines" className="btn text-xs">Executar pipeline</Link>
        </div>
        {runs.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma execução ainda. Inicie um pipeline para colocar os agentes para trabalhar.</p>
        ) : (
          <ul className="divide-y divide-line">
            {runs.map((run) => {
              const def = pipelineBySlug(run.pipeline);
              const stepsDone = (JSON.parse(run.steps) as unknown[]).length;
              return (
                <li key={run.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <Link href={`/pipelines/runs/${run.id}`} className="font-medium hover:text-accent">
                      {def?.name ?? run.pipeline}
                    </Link>
                    <p className="text-xs text-muted line-clamp-1">{run.briefing}</p>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <span className={run.status === 'DONE' ? 'text-accent2' : run.status === 'ERROR' ? 'text-red-400' : 'text-gold'}>
                      {run.status === 'DONE' ? 'Concluído' : run.status === 'ERROR' ? 'Erro' : 'Em andamento'}
                    </span>
                    <p className="text-muted">{stepsDone}/{def?.steps.length ?? '?'} etapas</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
