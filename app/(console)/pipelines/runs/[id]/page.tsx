import Link from 'next/link';
import { notFound } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { agentBySlug, pipelineBySlug } from '@/lib/manifest';
import { advanceRun, type StepResult } from '@/lib/run-engine';
import { ExecuteStepButton } from './submit-button';

export const dynamic = 'force-dynamic';
// Cada etapa é uma chamada longa ao modelo — dar folga ao limite da função
export const maxDuration = 300;

async function advanceAction(formData: FormData) {
  'use server';
  await requireSession();
  const runId = String(formData.get('runId') ?? '');
  try {
    await advanceRun(runId);
  } catch (error) {
    await prisma.pipelineRun.update({
      where: { id: runId },
      data: { error: error instanceof Error ? error.message : String(error) },
    }).catch(() => undefined);
  }
  revalidatePath(`/pipelines/runs/${runId}`);
}

export default async function RunPage({ params }: { params: { id: string } }) {
  const run = await prisma.pipelineRun.findUnique({ where: { id: params.id } });
  if (!run) notFound();

  const pipeline = pipelineBySlug(run.pipeline);
  if (!pipeline) notFound();

  const steps: StepResult[] = JSON.parse(run.steps);
  const nextIndex = steps.length;
  const done = run.status === 'DONE' || nextIndex >= pipeline.steps.length;

  return (
    <div className="space-y-6">
      <header>
        <Link href="/pipelines" className="text-xs text-muted hover:text-accent">← Pipelines</Link>
        <h1 className="text-2xl font-bold mt-1">{pipeline.name}</h1>
        <p className="text-sm text-muted mt-1">Briefing: {run.briefing}</p>
        <p className="mt-2 text-sm">
          Status:{' '}
          <span className={done ? 'text-accent2' : 'text-gold'}>
            {done ? '✓ Concluído' : `Em andamento — ${steps.length}/${pipeline.steps.length} etapas`}
          </span>
        </p>
      </header>

      {run.error && (
        <div className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300">
          Erro na última tentativa: {run.error}
        </div>
      )}

      <ol className="space-y-3">
        {pipeline.steps.map((stepDef, i) => {
          const result = steps[i];
          const isNext = i === nextIndex && !done;
          const agent = agentBySlug(stepDef.agent);
          return (
            <li key={i} className={`card ${isNext ? 'border-accent' : ''} ${stepDef.gate ? 'border-gold/60' : ''}`}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-medium">
                    {i + 1}. {stepDef.gate ? '⛔ ' : ''}{stepDef.label}
                  </p>
                  <p className="text-xs text-muted">{agent?.title} · skill <span className="chip">{stepDef.skill}</span></p>
                </div>
                <span className="text-xs shrink-0">
                  {result ? <span className="text-accent2">✓ concluída</span> : isNext ? <span className="text-accent">próxima</span> : <span className="text-muted">pendente</span>}
                </span>
              </div>
              {result && (
                <details className="mt-3">
                  <summary className="cursor-pointer text-sm text-accent">Ver entregável</summary>
                  <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-panel2 border border-line p-4 text-sm leading-relaxed font-sans">{result.output}</pre>
                </details>
              )}
            </li>
          );
        })}
      </ol>

      {!done && (
        <form action={advanceAction}>
          <input type="hidden" name="runId" value={run.id} />
          <ExecuteStepButton label={`Executar etapa ${nextIndex + 1}: ${pipeline.steps[nextIndex]?.label}`} />
        </form>
      )}
    </div>
  );
}
