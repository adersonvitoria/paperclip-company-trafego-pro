import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './db';
import { metricsToText, type DashboardMetrics } from './metrics';

export type AIAnalysis = {
  resumo: string;
  pontosFortes: string[];
  riscos: string[];
  acoes: Array<{ titulo: string; detalhe: string; prioridade: 'alta' | 'media' | 'baixa' }>;
};

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    resumo: { type: 'string' },
    pontosFortes: { type: 'array', items: { type: 'string' } },
    riscos: { type: 'array', items: { type: 'string' } },
    acoes: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          titulo: { type: 'string' },
          detalhe: { type: 'string' },
          prioridade: { type: 'string', enum: ['alta', 'media', 'baixa'] },
        },
        required: ['titulo', 'detalhe', 'prioridade'],
      },
    },
  },
  required: ['resumo', 'pontosFortes', 'riscos', 'acoes'],
} as const;

export async function analyzeMetrics(m: DashboardMetrics): Promise<AIAnalysis> {
  const row = await prisma.setting.findUnique({ where: { key: 'anthropic_api_key' } });
  const apiKey = row?.value?.trim();
  if (!apiKey) throw new Error('Configure a Anthropic API Key em Configurações para usar a análise com IA.');

  const system = [
    'Você é o analista de performance e operações da TráfegoPRO, uma agência autônoma de tráfego pago e Google Ads.',
    'Recebe um snapshot de métricas operacionais (execuções de pipeline, agentes, configuração) e de mídia (Google Ads).',
    'Produza uma análise objetiva em pt-BR: um resumo curto do estado atual, pontos fortes, riscos, e ações concretas priorizadas.',
    'Seja específico e acionável — cada ação deve dizer O QUE fazer e POR QUE, baseado nos números. Não invente dados que não estão no snapshot; se a mídia estiver indisponível, trate isso como um risco/ação (ex.: destravar a API).',
    'Priorize: alta = bloqueia receita ou operação; media = melhora relevante; baixa = otimização incremental. Máximo 6 ações.',
  ].join('\n');

  const client = new Anthropic({ apiKey });
  const params: Record<string, unknown> = {
    model: 'claude-opus-4-8',
    max_tokens: 4000,
    thinking: { type: 'disabled' },
    system,
    messages: [{ role: 'user', content: `Snapshot de métricas:\n\n${metricsToText(m)}\n\nProduza a análise (JSON).` }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  };
  const resp = await client.messages.create(params as unknown as Parameters<typeof client.messages.create>[0]);

  let text = '';
  for (const block of (resp as any).content) if (block.type === 'text') text += block.text;
  try {
    return JSON.parse(text) as AIAnalysis;
  } catch {
    throw new Error('A IA não retornou um JSON válido. Tente novamente.');
  }
}
