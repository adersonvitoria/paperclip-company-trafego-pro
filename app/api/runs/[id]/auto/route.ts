import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { triggerNextStep } from '@/lib/chain';

export const dynamic = 'force-dynamic';

// Liga/desliga o modo de execução automática. Ao ligar, dispara a primeira
// etapa da cadeia server-side (que se auto-encadeia até concluir).
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const auto = Boolean(body?.auto);

  const run = await prisma.pipelineRun.update({ where: { id: params.id }, data: { auto } });

  if (auto && run.status === 'RUNNING') {
    await triggerNextStep(new URL(req.url).origin, params.id);
  }
  return NextResponse.json({ auto });
}
