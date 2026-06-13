import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { computeDashboardMetrics } from '@/lib/metrics';
import { analyzeMetrics } from '@/lib/dashboard-ai';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function POST() {
  if (!(await getSession())) {
    return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
  }
  try {
    const metrics = await computeDashboardMetrics();
    const analysis = await analyzeMetrics(metrics);
    return NextResponse.json({ analysis });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
