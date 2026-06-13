import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './db';
import type { CampaignPlan } from './google-ads-mutate';
import type { StepResult } from './run-engine';

// Converte os entregáveis de uma execução de pipeline (blueprint Search + copies +
// keyword map + plano de mídia) em um CampaignPlan estruturado, pronto para publicar.

const MAX_CHARS = 14_000;

const PLAN_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    campaignName: { type: 'string' },
    dailyBudgetBRL: { type: 'number' },
    defaultCpcBidBRL: { type: 'number' },
    finalUrl: { type: 'string' },
    adGroups: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          name: { type: 'string' },
          cpcBidBRL: { type: 'number' },
          keywords: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: { text: { type: 'string' }, matchType: { type: 'string', enum: ['BROAD', 'PHRASE', 'EXACT'] } },
              required: ['text', 'matchType'],
            },
          },
          negativeKeywords: {
            type: 'array',
            items: {
              type: 'object',
              additionalProperties: false,
              properties: { text: { type: 'string' }, matchType: { type: 'string', enum: ['BROAD', 'PHRASE', 'EXACT'] } },
              required: ['text', 'matchType'],
            },
          },
          headlines: { type: 'array', items: { type: 'string' } },
          descriptions: { type: 'array', items: { type: 'string' } },
          path1: { type: 'string' },
          path2: { type: 'string' },
        },
        required: ['name', 'keywords', 'headlines', 'descriptions'],
      },
    },
  },
  required: ['campaignName', 'dailyBudgetBRL', 'defaultCpcBidBRL', 'finalUrl', 'adGroups'],
} as const;

async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value?.trim() ?? null;
}

function pick(steps: StepResult[], skill: string): string {
  return steps.find((s) => s.skill === skill)?.output.slice(0, MAX_CHARS) ?? '';
}

export async function buildCampaignPlanFromRun(runId: string): Promise<CampaignPlan> {
  const run = await prisma.pipelineRun.findUnique({ where: { id: runId } });
  if (!run) throw new Error('Execução não encontrada.');
  const steps: StepResult[] = JSON.parse(run.steps);

  const apiKey = await getSetting('anthropic_api_key');
  if (!apiKey) throw new Error('Configure a Anthropic API Key em Configurações.');

  const siteUrl = (await getSetting('site_url')) ?? '';
  const verba = (await getSetting('verba_mensal')) ?? '';
  const cpa = (await getSetting('cpa_alvo')) ?? '';

  const blueprint = pick(steps, 'search-campaign-builder');
  const copies = pick(steps, 'ad-copy-builder');
  const keywords = pick(steps, 'keyword-research');
  const mediaPlan = pick(steps, 'media-plan-builder');

  if (!blueprint && !keywords) throw new Error('A execução não tem blueprint de Search nem keyword map — rode o pipeline de Lançamento de Campanha primeiro.');

  const system = [
    'Você converte os entregáveis de um pipeline de tráfego pago em UM CampaignPlan estruturado (JSON) para publicar UMA campanha de Search no Google Ads.',
    'Regras rígidas do Google Ads que você DEVE respeitar:',
    '- headlines: entre 3 e 15 por grupo, cada uma com no máximo 30 caracteres.',
    '- descriptions: entre 2 e 4 por grupo, cada uma com no máximo 90 caracteres.',
    '- path1/path2 (opcionais): máximo 15 caracteres cada.',
    '- matchType deve ser BROAD, PHRASE ou EXACT.',
    '- Valores monetários em reais (number), ex.: dailyBudgetBRL=15.00, defaultCpcBidBRL=3.50.',
    'Use as headlines/descriptions REAIS do pacote de copy quando existirem (truncando para o limite se preciso). Use as keywords reais do keyword map, distribuídas nos grupos do blueprint. Não invente URLs: use a finalUrl do contexto.',
    'Para o orçamento diário: se o blueprint/plano de mídia indicar orçamento mensal, divida por 30. Se nada estiver claro, use um valor conservador coerente com o contexto.',
    'Comece com 1 a 4 grupos de anúncio prioritários (BOFU). Não inclua grupos sem keywords.',
  ].join('\n');

  const user = [
    `CONTEXTO: site/finalUrl=${siteUrl || '(não informado — use a URL do blueprint)'} | verba mensal R$=${verba} | CPA alvo R$=${cpa}`,
    `\n=== BLUEPRINT SEARCH ===\n${blueprint}`,
    `\n=== COPIES (RSAs) ===\n${copies}`,
    `\n=== KEYWORD MAP ===\n${keywords}`,
    `\n=== PLANO DE MÍDIA ===\n${mediaPlan}`,
    '\nProduza o CampaignPlan JSON.',
  ].join('\n');

  const client = new Anthropic({ apiKey });
  const params: Record<string, unknown> = {
    model: 'claude-opus-4-8',
    max_tokens: 8000,
    thinking: { type: 'disabled' },
    system,
    messages: [{ role: 'user', content: user }],
    output_config: { format: { type: 'json_schema', schema: PLAN_SCHEMA } },
  };
  const resp = await client.messages.create(params as unknown as Parameters<typeof client.messages.create>[0]);

  let text = '';
  for (const block of (resp as any).content) if (block.type === 'text') text += block.text;
  let plan: CampaignPlan;
  try {
    plan = JSON.parse(text);
  } catch {
    throw new Error('O modelo não retornou um JSON válido para o plano. Tente novamente.');
  }
  // fallback de finalUrl
  if (!/^https?:\/\//i.test(plan.finalUrl) && siteUrl) plan.finalUrl = siteUrl;

  // Sanitização: garante limites do Google Ads (rede de segurança caso o modelo
  // ultrapasse). Corta na fronteira de palavra e remove duplicados (o Google
  // rejeita headlines/descriptions repetidas numa RSA).
  const clamp = (s: string, max: number): string => {
    const t = (s ?? '').trim();
    if (t.length <= max) return t;
    const cut = t.slice(0, max);
    const sp = cut.lastIndexOf(' ');
    return (sp > 10 ? cut.slice(0, sp) : cut).trim();
  };
  const dedupe = (arr: string[]): string[] => {
    const seen = new Set<string>();
    return arr.filter((x) => {
      const k = x.toLowerCase();
      if (!x || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  };
  for (const ag of plan.adGroups ?? []) {
    ag.headlines = dedupe((ag.headlines ?? []).map((h) => clamp(h, 30))).slice(0, 15);
    ag.descriptions = dedupe((ag.descriptions ?? []).map((d) => clamp(d, 90))).slice(0, 4);
    if (ag.path1) ag.path1 = clamp(ag.path1, 15);
    if (ag.path2) ag.path2 = clamp(ag.path2, 15);
  }
  return plan;
}
