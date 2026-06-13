import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { buildCampaignPlanFromRun } from '@/lib/campaign-plan';
import { publishCampaign, validatePlan } from '@/lib/google-ads-mutate';
import type { StepResult } from '@/lib/run-engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Verifica se o gate de auditoria (etapa account-audit) deu PASS/APROVADO.
function gatePassed(run: { steps: string }): boolean {
  const steps: StepResult[] = JSON.parse(run.steps);
  const audit = steps.find((s) => s.skill === 'account-audit');
  if (!audit) return false;
  const m = audit.output.match(/VEREDITO[:\s*]*\**\s*(PASS|FAIL|APROVAD[OA]|REPROVAD[OA])/i);
  const verdict = (m?.[1] ?? '').toUpperCase();
  return verdict === 'PASS' || verdict.startsWith('APROVAD');
}

// mode: 'plan' (só gera o JSON, sem API) | 'preview' (validateOnly na API) | 'apply' (publica de verdade, gated)
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const mode: string = body?.mode ?? 'plan';

  const run = await prisma.pipelineRun.findUnique({ where: { id: params.id } });
  if (!run) return NextResponse.json({ error: 'Execução não encontrada.' }, { status: 404 });

  if (mode === 'apply' && !gatePassed(run)) {
    return NextResponse.json(
      { error: 'Publicação bloqueada: o gate de auditoria (account-audit) precisa ter veredito PASS. Hoje está FAIL (Developer Token ainda em modo teste).' },
      { status: 409 },
    );
  }

  try {
    const plan = await buildCampaignPlanFromRun(params.id);
    const issues = validatePlan(plan);

    if (mode === 'plan') {
      return NextResponse.json({ mode, plan, issues });
    }

    const result = await publishCampaign(plan, { validateOnly: mode !== 'apply' });
    return NextResponse.json({ mode, plan, issues, result });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
