import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { gerarOrcamento } from '@/lib/orcamento';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Endpoint PÚBLICO (o site comercial posta aqui). Sem auth, com CORS + rate-limit
// para evitar abuso/custo de tokens. Salva o lead e gera o orçamento por IA.

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Rate-limit em memória (por instância). IP: máx 3/30min; global: máx 60/dia.
const ipHits = new Map<string, number[]>();
let dayKey = '';
let dayCount = 0;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const today = new Date().toISOString().slice(0, 10);
  if (today !== dayKey) { dayKey = today; dayCount = 0; }
  if (dayCount >= 60) return true;
  const arr = (ipHits.get(ip) ?? []).filter((t) => now - t < 30 * 60 * 1000);
  if (arr.length >= 3) return true;
  arr.push(now);
  ipHits.set(ip, arr);
  dayCount++;
  return false;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Muitas solicitações. Tente novamente mais tarde.' }, { status: 429, headers: CORS });
  }

  const body = await req.json().catch(() => ({}));
  const nome = String(body?.nome ?? '').trim().slice(0, 120);
  const contato = String(body?.contato ?? '').trim().slice(0, 160);
  const segmento = String(body?.segmento ?? '').trim().slice(0, 160);
  const objetivo = String(body?.objetivo ?? '').trim().slice(0, 600);
  const verbaMidia = String(body?.verbaMidia ?? '').trim().slice(0, 40) || null;

  if (!nome || !contato || !segmento || !objetivo) {
    return NextResponse.json({ error: 'Preencha nome, contato, segmento e objetivo.' }, { status: 400, headers: CORS });
  }

  // Gera o orçamento por IA (best-effort: se falhar, salva o lead mesmo assim)
  let orcamentoJson: string | null = null;
  try {
    const orc = await gerarOrcamento({
      segmento,
      objetivo,
      verbaMidiaMensal: verbaMidia ? Number(verbaMidia.replace(/\D/g, '')) || undefined : undefined,
      modeloCobranca: 'sugerir',
    });
    orcamentoJson = JSON.stringify(orc);
  } catch {
    orcamentoJson = null;
  }

  await prisma.lead.create({ data: { nome, contato, segmento, objetivo, verbaMidia, orcamentoJson, origem: 'site' } });

  return NextResponse.json(
    { ok: true, message: 'Recebemos sua solicitação! Em breve entraremos em contato com seu diagnóstico.' },
    { headers: CORS },
  );
}
