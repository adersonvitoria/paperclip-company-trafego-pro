import 'server-only';
import fs from 'fs';
import path from 'path';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './db';
import { agentBySlug, pipelineBySlug, COMPANY_NAME } from './manifest';
import { fetchAccountSnapshot, getGoogleAdsConfig, snapshotToMarkdown } from './google-ads';

// Skills cujo trabalho depende de dados da conta — recebem métricas reais quando a API está configurada
const DATA_DRIVEN_SKILLS = new Set([
  'performance-report',
  'optimization-routine',
  'budget-pacing',
  'account-audit',
  'gads-scripts',
]);

const MAX_DOC_CHARS = 24_000;
const MAX_PREV_OUTPUT_CHARS = 7_000;

export type StepResult = {
  skill: string;
  agent: string;
  output: string;
  at: string;
};

function readDoc(...segments: string[]): string {
  const file = path.join(process.cwd(), ...segments);
  if (!fs.existsSync(file)) return '';
  return fs.readFileSync(file, 'utf8').slice(0, MAX_DOC_CHARS);
}

function readSkillDocs(skillSlug: string): string {
  const dir = path.join(process.cwd(), 'skills', skillSlug);
  if (!fs.existsSync(dir)) return '';
  const parts: string[] = [];
  for (const name of fs.readdirSync(dir)) {
    if (!name.endsWith('.md')) continue;
    parts.push(`\n--- ${name} ---\n` + readDoc('skills', skillSlug, name));
  }
  return parts.join('\n').slice(0, MAX_DOC_CHARS * 2);
}

async function getSetting(key: string): Promise<string | null> {
  const row = await prisma.setting.findUnique({ where: { key } });
  return row?.value ?? null;
}

async function businessContext(): Promise<string> {
  const keys = ['empresa_nome', 'empresa_nicho', 'verba_mensal', 'cpa_alvo', 'roas_alvo', 'geografia', 'site_url', 'ga4_property_id', 'gtm_container_id', 'gads_customer_id'];
  const rows = await prisma.setting.findMany({ where: { key: { in: keys } } });
  if (!rows.length) return 'Nenhum contexto de negócio configurado ainda.';
  const labels: Record<string, string> = {
    empresa_nome: 'Negócio', empresa_nicho: 'Nicho/produto', verba_mensal: 'Verba mensal (R$)',
    cpa_alvo: 'CPA alvo (R$)', roas_alvo: 'ROAS alvo', geografia: 'Geografia',
    site_url: 'Site/LP', ga4_property_id: 'GA4 Property', gtm_container_id: 'GTM Container', gads_customer_id: 'Google Ads Customer ID',
  };
  return rows.map((r) => `- ${labels[r.key] ?? r.key}: ${r.value}`).join('\n');
}

// Executa a próxima etapa pendente de uma run. Retorna o status atualizado.
export async function advanceRun(runId: string): Promise<{ status: string; stepIndex: number }> {
  const run = await prisma.pipelineRun.findUnique({ where: { id: runId } });
  if (!run) throw new Error('Execução não encontrada.');
  if (run.status === 'DONE') return { status: 'DONE', stepIndex: -1 };

  const pipeline = pipelineBySlug(run.pipeline);
  if (!pipeline) throw new Error(`Pipeline desconhecido: ${run.pipeline}`);

  const steps: StepResult[] = JSON.parse(run.steps);
  const idx = steps.length;
  if (idx >= pipeline.steps.length) {
    await prisma.pipelineRun.update({ where: { id: runId }, data: { status: 'DONE' } });
    return { status: 'DONE', stepIndex: -1 };
  }

  const stepDef = pipeline.steps[idx];
  const agent = agentBySlug(stepDef.agent);
  if (!agent) throw new Error(`Agente desconhecido: ${stepDef.agent}`);

  const apiKey = await getSetting('anthropic_api_key');
  if (!apiKey) throw new Error('Configure a Anthropic API Key em Configurações antes de executar.');

  const agentConfig = await prisma.agentConfig.findUnique({ where: { slug: agent.slug } });
  if (agentConfig && !agentConfig.enabled) {
    throw new Error(`O agente "${agent.title}" está desativado. Reative em Agentes.`);
  }
  const model = agentConfig?.model ?? 'claude-opus-4-8';

  const agentDoc = readDoc('agents', agent.slug, 'AGENTS.md');
  const skillDocs = readSkillDocs(stepDef.skill);
  const contexto = await businessContext();

  const system = [
    `Você é um agente da empresa "${COMPANY_NAME}".`,
    `Você está executando a etapa ${idx + 1} de ${pipeline.steps.length} do pipeline "${pipeline.name}", usando a skill "${stepDef.skill}".`,
    `Produza o entregável completo desta etapa em Markdown, em pt-BR, seguindo sua definição de agente e a skill abaixo.`,
    `Não invente dados de mercado: quando faltar dado, declare a lacuna explicitamente.`,
    `\n=== SUA DEFINIÇÃO (AGENTS.md) ===\n${agentDoc}`,
    `\n=== SKILL E MATERIAIS (${stepDef.skill}) ===\n${skillDocs}`,
  ].join('\n');

  const previous = steps
    .map((s, i) => `\n=== OUTPUT DA ETAPA ${i + 1} (${s.skill} por ${s.agent}) ===\n${s.output.slice(0, MAX_PREV_OUTPUT_CHARS)}`)
    .join('\n');

  // Etapas orientadas a dados recebem o snapshot real da conta (ou a razão da indisponibilidade)
  let metricas = '';
  if (DATA_DRIVEN_SKILLS.has(stepDef.skill)) {
    if (await getGoogleAdsConfig()) {
      try {
        const snapshot = await fetchAccountSnapshot(30);
        metricas = `\nMÉTRICAS REAIS DA CONTA (Google Ads API — use estes números, não invente outros):\n${snapshotToMarkdown(snapshot)}`;
      } catch (e) {
        metricas = `\nMÉTRICAS REAIS INDISPONÍVEIS: a Google Ads API retornou erro — "${e instanceof Error ? e.message : String(e)}". Declare essa lacuna no entregável e trabalhe apenas com o que o briefing fornece.`;
      }
    } else {
      metricas = '\nMÉTRICAS REAIS INDISPONÍVEIS: credenciais do Google Ads não configuradas. Declare essa lacuna no entregável.';
    }
  }

  const user = [
    `BRIEFING DO USUÁRIO:\n${run.briefing}`,
    `\nCONTEXTO DO NEGÓCIO (Configurações):\n${contexto}`,
    metricas,
    previous ? `\nOUTPUTS DAS ETAPAS ANTERIORES:${previous}` : '',
    `\nExecute agora a etapa "${stepDef.label}" e entregue o resultado completo.`,
    stepDef.gate ? `\nEsta etapa é um GATE DE QUALIDADE: termine com um veredito explícito "VEREDITO: PASS" ou "VEREDITO: FAIL" seguido da lista de bloqueios.` : '',
  ].join('\n');

  const client = new Anthropic({ apiKey });
  // Streaming evita timeout HTTP no lado da Anthropic; 16k dá espaço para raciocínio + entregável
  const stream = client.messages.stream({
    model,
    max_tokens: 16000,
    thinking: { type: 'adaptive' },
    system,
    messages: [{ role: 'user', content: user }],
  });
  const response = await stream.finalMessage();

  let output = '';
  for (const block of response.content) {
    if (block.type === 'text') output += block.text;
  }
  if (!output.trim()) {
    throw new Error(
      `O modelo não retornou texto (stop_reason: ${response.stop_reason}). Tente executar a etapa novamente; se persistir, troque o modelo do agente "${agent.title}" em Agentes.`,
    );
  }

  steps.push({ skill: stepDef.skill, agent: stepDef.agent, output, at: new Date().toISOString() });
  const done = steps.length >= pipeline.steps.length;

  await prisma.pipelineRun.update({
    where: { id: runId },
    data: { steps: JSON.stringify(steps), status: done ? 'DONE' : 'RUNNING', error: null },
  });

  return { status: done ? 'DONE' : 'RUNNING', stepIndex: idx };
}
