import Link from 'next/link';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { PIPELINES, agentBySlug, pipelineBySlug } from '@/lib/manifest';

export const dynamic = 'force-dynamic';

async function startRunAction(formData: FormData) {
  'use server';
  await requireSession();
  const pipeline = String(formData.get('pipeline') ?? '');
  const briefing = String(formData.get('briefing') ?? '').trim();
  if (!pipelineBySlug(pipeline)) throw new Error('Pipeline desconhecido.');
  if (!briefing) redirect(`/pipelines?erro=briefing&p=${pipeline}`);

  const hasKey = await prisma.setting.findUnique({ where: { key: 'anthropic_api_key' } });
  if (!hasKey?.value) redirect('/pipelines?erro=chave');

  const run = await prisma.pipelineRun.create({
    data: { pipeline, briefing },
  });
  redirect(`/pipelines/runs/${run.id}`);
}

export default async function PipelinesPage({ searchParams }: { searchParams: { erro?: string; p?: string } }) {
  const runs = await prisma.pipelineRun.findMany({ orderBy: { createdAt: 'desc' }, take: 10 });

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Pipelines</h1>
        <p className="text-sm text-muted">Descreva o que você precisa e os agentes executam etapa por etapa, do briefing ao gate de auditoria.</p>
      </header>

      {searchParams.erro === 'chave' && (
        <div className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">
          Configure a <strong>Anthropic API Key</strong> em <Link href="/configuracoes" className="underline">Configurações</Link> antes de executar um pipeline.
        </div>
      )}
      {searchParams.erro === 'briefing' && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
          Escreva um briefing antes de iniciar o pipeline.
        </div>
      )}

      <section className="grid gap-4">
        {PIPELINES.map((pipeline) => (
          <details key={pipeline.slug} className="card" open={searchParams.p === pipeline.slug}>
            <summary className="cursor-pointer select-none">
              <span className="font-semibold">{pipeline.name}</span>
              <span className="ml-2 text-xs text-muted">{pipeline.steps.length} etapas · {pipeline.tempo}</span>
              <p className="mt-1 text-sm text-muted">“{pipeline.trigger}”</p>
            </summary>
            <ol className="mt-4 space-y-1 text-sm">
              {pipeline.steps.map((step, i) => (
                <li key={i} className={step.gate ? 'text-gold' : 'text-slate-300'}>
                  {i + 1}. {step.gate ? '⛔ ' : ''}{step.label}
                  <span className="text-xs text-muted"> — {agentBySlug(step.agent)?.title}</span>
                </li>
              ))}
            </ol>
            <form action={startRunAction} className="mt-4 space-y-3">
              <input type="hidden" name="pipeline" value={pipeline.slug} />
              <div>
                <label className="label" htmlFor={`briefing-${pipeline.slug}`}>Briefing</label>
                <textarea
                  id={`briefing-${pipeline.slug}`}
                  name="briefing"
                  rows={3}
                  className="input"
                  placeholder="Ex.: Quero lançar tráfego pago para minha clínica de estética em Vitória/ES, verba R$ 3.000/mês, objetivo: agendamentos."
                />
              </div>
              <button type="submit" className="btn">Iniciar execução</button>
            </form>
          </details>
        ))}
      </section>

      <section className="card">
        <h2 className="font-semibold mb-3">Histórico</h2>
        {runs.length === 0 ? (
          <p className="text-sm text-muted">Nenhuma execução ainda.</p>
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
