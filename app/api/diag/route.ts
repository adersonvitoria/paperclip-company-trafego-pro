import { NextResponse } from 'next/server';

// Diagnóstico do limite de duração da função na Vercel: GET /api/diag?s=90
// Espera N segundos e responde — se o limite do plano for menor, a Vercel mata a função antes.
export const dynamic = 'force-dynamic';
export const maxDuration = 300;

export async function GET(request: Request) {
  const url = new URL(request.url);
  const seconds = Math.min(Number(url.searchParams.get('s') ?? '1') || 1, 280);
  const startedAt = Date.now();
  await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  return NextResponse.json({ ok: true, requestedSeconds: seconds, elapsedMs: Date.now() - startedAt });
}
