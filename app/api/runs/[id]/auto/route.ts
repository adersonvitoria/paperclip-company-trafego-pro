import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Liga/desliga o modo de execução automática de uma run.
export async function POST(req: Request, { params }: { params: { id: string } }) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const auto = Boolean(body?.auto);
  await prisma.pipelineRun.update({ where: { id: params.id }, data: { auto } });
  return NextResponse.json({ auto });
}
