import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { gerarOrcamento, type OrcamentoInput } from '@/lib/orcamento';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST(req: Request) {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const input: OrcamentoInput = {
    segmento: String(body?.segmento ?? '').trim(),
    objetivo: String(body?.objetivo ?? '').trim(),
    verbaMidiaMensal: body?.verbaMidiaMensal ? Number(body.verbaMidiaMensal) : undefined,
    ticketMedio: body?.ticketMedio ? Number(body.ticketMedio) : undefined,
    regiao: body?.regiao ? String(body.regiao).trim() : undefined,
    modeloCobranca: body?.modeloCobranca,
  };
  try {
    const orcamento = await gerarOrcamento(input);
    return NextResponse.json({ orcamento });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
