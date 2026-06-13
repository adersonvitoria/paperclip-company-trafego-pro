import 'server-only';
import { prisma } from './db';
import { AGENTS, SETORES, PIPELINES, pipelineBySlug } from './manifest';
import { SETTING_SECTIONS } from './settings-def';
import { fetchAccountSnapshot, getGoogleAdsConfig, type AccountSnapshot } from './google-ads';

export type DashboardMetrics = {
  runs: {
    total: number;
    done: number;
    running: number;
    error: number;
    completionRate: number; // 0..1 sobre runs finalizadas
    stepsTotal: number;
    avgSteps: number;
  };
  byPipeline: Array<{ label: string; value: number }>;
  timeline: Array<{ day: string; count: number }>; // últimos 14 dias
  agents: { total: number; active: number; bySetor: Array<{ setor: string; active: number; total: number }> };
  catalog: { setores: number; agents: number; skills: number; pipelines: number };
  config: { filled: number; total: number; pct: number; sections: Array<{ title: string; done: number; total: number }> };
  ads: { available: boolean; reason?: string; snapshot?: AccountSnapshot };
  generatedAt: string;
};

function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export async function computeDashboardMetrics(): Promise<DashboardMetrics> {
  const [runs, agentConfigs, settings] = await Promise.all([
    prisma.pipelineRun.findMany({ orderBy: { createdAt: 'desc' } }),
    prisma.agentConfig.findMany(),
    prisma.setting.findMany(),
  ]);

  // Execuções
  const done = runs.filter((r) => r.status === 'DONE').length;
  const running = runs.filter((r) => r.status === 'RUNNING').length;
  const error = runs.filter((r) => r.status === 'ERROR').length;
  const finalized = done + error;
  const stepsTotal = runs.reduce((acc, r) => {
    try { return acc + (JSON.parse(r.steps) as unknown[]).length; } catch { return acc; }
  }, 0);

  // Por pipeline
  const pipeCount = new Map<string, number>();
  for (const r of runs) pipeCount.set(r.pipeline, (pipeCount.get(r.pipeline) ?? 0) + 1);
  const byPipeline = PIPELINES.map((p) => ({ label: p.name, value: pipeCount.get(p.slug) ?? 0 }));

  // Timeline (14 dias)
  const days: string[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push(dayKey(d));
  }
  const timelineMap = new Map<string, number>(days.map((d) => [d, 0]));
  for (const r of runs) {
    const k = dayKey(new Date(r.createdAt));
    if (timelineMap.has(k)) timelineMap.set(k, (timelineMap.get(k) ?? 0) + 1);
  }
  const timeline = days.map((d) => ({ day: d.slice(5), count: timelineMap.get(d) ?? 0 }));

  // Agentes
  const disabled = new Set(agentConfigs.filter((c) => !c.enabled).map((c) => c.slug));
  const bySetor = SETORES.map((setor) => {
    const list = AGENTS.filter((a) => a.setor === setor);
    return { setor, total: list.length, active: list.filter((a) => !disabled.has(a.slug)).length };
  });
  const activeAgents = AGENTS.filter((a) => !disabled.has(a.slug)).length;

  // Configuração
  const setKeys = new Set(settings.filter((s) => s.value.trim() !== '').map((s) => s.key));
  const sections = SETTING_SECTIONS.map((s) => ({
    title: s.title,
    total: s.fields.length,
    done: s.fields.filter((f) => setKeys.has(f.key)).length,
  }));
  const filled = sections.reduce((a, s) => a + s.done, 0);
  const totalFields = sections.reduce((a, s) => a + s.total, 0);

  // Google Ads (mídia real)
  let ads: DashboardMetrics['ads'] = { available: false, reason: 'Credenciais do Google Ads não configuradas.' };
  if (await getGoogleAdsConfig()) {
    try {
      const snapshot = await fetchAccountSnapshot(30);
      ads = { available: true, snapshot };
    } catch (e) {
      ads = { available: false, reason: e instanceof Error ? e.message : String(e) };
    }
  }

  return {
    runs: {
      total: runs.length,
      done,
      running,
      error,
      completionRate: finalized > 0 ? done / finalized : 0,
      stepsTotal,
      avgSteps: runs.length ? stepsTotal / runs.length : 0,
    },
    byPipeline,
    timeline,
    agents: { total: AGENTS.length, active: activeAgents, bySetor },
    catalog: { setores: SETORES.length, agents: AGENTS.length, skills: 14, pipelines: PIPELINES.length },
    config: { filled, total: totalFields, pct: totalFields ? filled / totalFields : 0, sections },
    ads,
    generatedAt: new Date().toISOString(),
  };
}

// Versão compacta (texto) para alimentar a análise de IA
export function metricsToText(m: DashboardMetrics): string {
  const pct = (x: number) => `${Math.round(x * 100)}%`;
  const lines = [
    `Data: ${m.generatedAt}`,
    `EXECUÇÕES DE PIPELINE: total=${m.runs.total}, concluídas=${m.runs.done}, em andamento=${m.runs.running}, com erro=${m.runs.error}, taxa de conclusão=${pct(m.runs.completionRate)}, etapas geradas=${m.runs.stepsTotal} (média ${m.runs.avgSteps.toFixed(1)}/execução).`,
    `EXECUÇÕES POR PIPELINE: ${m.byPipeline.map((p) => `${p.label}=${p.value}`).join(', ')}.`,
    `ATIVIDADE (14 dias): ${m.timeline.map((t) => `${t.day}:${t.count}`).join(' ')}.`,
    `AGENTES: ${m.agents.active}/${m.agents.total} ativos. Por setor: ${m.agents.bySetor.map((s) => `${s.setor} ${s.active}/${s.total}`).join('; ')}.`,
    `CATÁLOGO: ${m.catalog.setores} setores, ${m.catalog.agents} agentes, ${m.catalog.skills} skills, ${m.catalog.pipelines} pipelines.`,
    `CONFIGURAÇÃO: ${m.config.filled}/${m.config.total} campos preenchidos (${pct(m.config.pct)}). Seções: ${m.config.sections.map((s) => `${s.title} ${s.done}/${s.total}`).join('; ')}.`,
  ];
  if (m.ads.available && m.ads.snapshot) {
    const t = m.ads.snapshot.totals;
    lines.push(`MÍDIA (Google Ads, 30d): custo R$${t.costBRL.toFixed(2)}, impressões=${t.impressions}, cliques=${t.clicks}, CTR=${pct(t.ctr)}, CPC=R$${t.cpcBRL.toFixed(2)}, conversões=${t.conversions}, CPA=${t.cpaBRL !== null ? 'R$' + t.cpaBRL.toFixed(2) : 'n/d'}, ROAS=${t.roas !== null ? t.roas.toFixed(2) : 'n/d'}.`);
  } else {
    lines.push(`MÍDIA (Google Ads): indisponível — ${m.ads.reason}`);
  }
  return lines.join('\n');
}
