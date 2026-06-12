// Manifesto da empresa TráfegoPRO — espelha o pacote agentcompanies/v1 (agents/, skills/, projects/)

export type AgentDef = {
  slug: string;
  title: string;
  setor: string;
  papel: string;
  skills: string[];
};

export type PipelineStep = {
  skill: string;
  agent: string;
  label: string;
  gate?: boolean;
};

export type PipelineDef = {
  slug: string;
  name: string;
  trigger: string;
  tempo: string;
  steps: PipelineStep[];
};

export const COMPANY_NAME = 'TráfegoPRO — Agência Autônoma de Tráfego Pago & Google Ads';

export const AGENTS: AgentDef[] = [
  { slug: 'ceo', title: 'CEO — Coordenador Geral', setor: 'Direção & Estratégia', papel: 'Coordenador (hub)', skills: [] },
  { slug: 'traffic-strategist', title: 'Estrategista de Tráfego Pago', setor: 'Direção & Estratégia', papel: 'Estrategista', skills: ['media-plan-builder', 'budget-pacing'] },
  { slug: 'market-intel', title: 'Especialista de Inteligência de Mercado', setor: 'Inteligência de Mercado', papel: 'Especialista', skills: ['keyword-research', 'competitor-recon'] },
  { slug: 'search-specialist', title: 'Especialista em Google Ads Search', setor: 'Google Ads', papel: 'Especialista', skills: ['search-campaign-builder'] },
  { slug: 'pmax-specialist', title: 'Especialista em Performance Max & Shopping', setor: 'Google Ads', papel: 'Especialista', skills: ['pmax-campaign-builder'] },
  { slug: 'video-display-specialist', title: 'Especialista em YouTube, Display & Demand Gen', setor: 'Google Ads', papel: 'Especialista', skills: ['video-display-builder'] },
  { slug: 'ad-copywriter', title: 'Copywriter de Performance', setor: 'Criativos & Copy', papel: 'Executor', skills: ['ad-copy-builder'] },
  { slug: 'tracking-engineer', title: 'Engenheiro de Mensuração', setor: 'Engenharia & Dados', papel: 'Engenheiro', skills: ['tracking-blueprint', 'gads-scripts'] },
  { slug: 'cro-engineer', title: 'Engenheiro de CRO & Landing Pages', setor: 'Engenharia & Dados', papel: 'Engenheiro', skills: ['lp-cro-audit'] },
  { slug: 'optimization-executor', title: 'Executor de Otimização de Campanhas', setor: 'Operação & Otimização', papel: 'Executor', skills: ['optimization-routine'] },
  { slug: 'performance-analyst', title: 'Analista de Performance & Reporting', setor: 'Operação & Otimização', papel: 'Analista', skills: ['performance-report'] },
  { slug: 'account-auditor', title: 'Auditor de Conta & Compliance Google Ads', setor: 'Qualidade & Compliance', papel: 'Auditor (QA)', skills: ['account-audit'] },
];

export const SETORES: string[] = Array.from(new Set(AGENTS.map((a) => a.setor)));

export const PIPELINES: PipelineDef[] = [
  {
    slug: 'lancamento-campanha',
    name: 'Lançamento de Campanha',
    trigger: 'Quero lançar tráfego pago / campanha nova no Google Ads',
    tempo: '45-90 min',
    steps: [
      { skill: 'keyword-research', agent: 'market-intel', label: 'Pesquisa de palavras-chave' },
      { skill: 'competitor-recon', agent: 'market-intel', label: 'Reconhecimento de concorrência' },
      { skill: 'media-plan-builder', agent: 'traffic-strategist', label: 'Plano de mídia' },
      { skill: 'tracking-blueprint', agent: 'tracking-engineer', label: 'Plano de mensuração' },
      { skill: 'lp-cro-audit', agent: 'cro-engineer', label: 'Auditoria da landing page' },
      { skill: 'ad-copy-builder', agent: 'ad-copywriter', label: 'Criativos de texto (RSAs)' },
      { skill: 'search-campaign-builder', agent: 'search-specialist', label: 'Blueprint Search' },
      { skill: 'account-audit', agent: 'account-auditor', label: 'GATE — Auditoria pré-go-live', gate: true },
    ],
  },
  {
    slug: 'otimizacao-semanal',
    name: 'Otimização Semanal',
    trigger: 'Roda a otimização da semana / revisa as campanhas',
    tempo: '20-40 min',
    steps: [
      { skill: 'performance-report', agent: 'performance-analyst', label: 'Relatório semanal' },
      { skill: 'optimization-routine', agent: 'optimization-executor', label: 'Rotina de otimização' },
      { skill: 'budget-pacing', agent: 'traffic-strategist', label: 'Pacing de verba' },
    ],
  },
  {
    slug: 'auditoria-360',
    name: 'Auditoria 360 da Conta',
    trigger: 'Audita minha conta / por que meu Google Ads não performa?',
    tempo: '40-60 min',
    steps: [
      { skill: 'account-audit', agent: 'account-auditor', label: 'Auditoria completa' },
      { skill: 'tracking-blueprint', agent: 'tracking-engineer', label: 'Diagnóstico de mensuração' },
      { skill: 'lp-cro-audit', agent: 'cro-engineer', label: 'Auditoria das LPs' },
      { skill: 'media-plan-builder', agent: 'traffic-strategist', label: 'Plano de correção' },
    ],
  },
  {
    slug: 'escala-performance',
    name: 'Escala de Performance',
    trigger: 'Campanha está boa, quero escalar',
    tempo: '30-50 min',
    steps: [
      { skill: 'performance-report', agent: 'performance-analyst', label: 'Prova de estabilidade (30 dias)' },
      { skill: 'media-plan-builder', agent: 'traffic-strategist', label: 'Plano de escala' },
      { skill: 'budget-pacing', agent: 'traffic-strategist', label: 'Cronograma de aumento gradual' },
      { skill: 'gads-scripts', agent: 'tracking-engineer', label: 'Scripts de monitoramento' },
      { skill: 'account-audit', agent: 'account-auditor', label: 'GATE — Auditoria pré-ativação', gate: true },
    ],
  },
  {
    slug: 'relatorio-mensal',
    name: 'Relatório Mensal Executivo',
    trigger: 'Fecha o mês / relatório pro cliente',
    tempo: '15-25 min',
    steps: [
      { skill: 'performance-report', agent: 'performance-analyst', label: 'Relatório executivo do mês' },
      { skill: 'media-plan-builder', agent: 'traffic-strategist', label: 'Recomendações do próximo mês' },
    ],
  },
];

export function agentBySlug(slug: string): AgentDef | undefined {
  return AGENTS.find((a) => a.slug === slug);
}

export function pipelineBySlug(slug: string): PipelineDef | undefined {
  return PIPELINES.find((p) => p.slug === slug);
}
