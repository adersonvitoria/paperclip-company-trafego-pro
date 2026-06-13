import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { advanceRun } from '@/lib/run-engine';

export const dynamic = 'force-dynamic';
export const maxDuration = 300;

// Avança UMA etapa da execução. Usado pelo orquestrador automático no cliente
// (uma requisição por etapa, respeitando o limite de duração da função).
export async function POST(_req: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  try {
    const result = await advanceRun(params.id);
    if (result.status === 'DONE') {
      await prisma.pipelineRun.update({ where: { id: params.id }, data: { auto: false } }).catch(() => undefined);
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
