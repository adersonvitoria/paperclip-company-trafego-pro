import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { advanceRun } from '@/lib/run-engine';
import { internalSecret, triggerNextStep } from '@/lib/chain';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Avança UMA etapa da execução. Aceita sessão do usuário OU o gatilho interno
// (encadeamento server-side). Ao terminar a etapa, se a run estiver em modo
// auto e ainda houver etapas, dispara a próxima numa nova invocação.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  const internalOk = Boolean(internalSecret()) && req.headers.get('x-internal-trigger') === internalSecret();
  if (!internalOk && !(await getSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }

  try {
    const result = await advanceRun(params.id);

    if (result.status === 'DONE') {
      await prisma.pipelineRun.update({ where: { id: params.id }, data: { auto: false } }).catch(() => undefined);
    } else {
      // Encadeia a próxima etapa server-side se ainda estiver em modo auto
      const run = await prisma.pipelineRun.findUnique({ where: { id: params.id } });
      if (run?.auto && run.status === 'RUNNING') {
        await triggerNextStep(new URL(req.url).origin, params.id);
      }
    }
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await prisma.pipelineRun
      .update({ where: { id: params.id }, data: { error: message, auto: false } })
      .catch(() => undefined);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
