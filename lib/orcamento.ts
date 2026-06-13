import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import { prisma } from './db';

// Gera uma proposta comercial: preço do serviço sugerido + projeção de retorno
// do cliente em cenários, a partir do segmento e do objetivo informados.

export type OrcamentoInput = {
  segmento: string;
  objetivo: string;
  verbaMidiaMensal?: number; // verba de mídia mensal do cliente (R$)
  ticketMedio?: number; // ticket médio / valor do produto (R$)
  regiao?: string;
  modeloCobranca?: 'sugerir' | 'fee_fixo' | 'fee_percentual' | 'fee_mais_percentual';
};

export type Cenario = {
  nome: string; // Conservador | Realista | Otimista
  metricaChave: string; // ex.: "~22 leads/mês · CPA R$45"
  investimentoMidiaMensal: number;
  feeServicoMensal: number;
  retornoEstimadoMensal: number; // receita/valor estimado gerado no mês
  observacao: string;
};

export type Orcamento = {
  resumo: string;
  precoServico: {
    modelo: string;
    minMensal: number;
    recomendadoMensal: number;
    maxMensal: number;
    setupInicial: number;
    justificativa: string;
  };
  cenarios: Cenario[];
  retornoCliente: string;
  premissas: string[];
  ressalvas: string[];
};

const SCHEMA = {
  type: 'object',
  additionalProperties: false,
  properties: {
    resumo: { type: 'string' },
    precoServico: {
      type: 'object',
      additionalProperties: false,
      properties: {
        modelo: { type: 'string' },
        minMensal: { type: 'number' },
        recomendadoMensal: { type: 'number' },
        maxMensal: { type: 'number' },
        setupInicial: { type: 'number' },
        justificativa: { type: 'string' },
      },
      required: ['modelo', 'minMensal', 'recomendadoMensal', 'maxMensal', 'setupInicial', 'justificativa'],
    },
    cenarios: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          nome: { type: 'string' },
          metricaChave: { type: 'string' },
          investimentoMidiaMensal: { type: 'number' },
          feeServicoMensal: { type: 'number' },
          retornoEstimadoMensal: { type: 'number' },
          observacao: { type: 'string' },
        },
        required: ['nome', 'metricaChave', 'investimentoMidiaMensal', 'feeServicoMensal', 'retornoEstimadoMensal', 'observacao'],
      },
    },
    retornoCliente: { type: 'string' },
    premissas: { type: 'array', items: { type: 'string' } },
    ressalvas: { type: 'array', items: { type: 'string' } },
  },
  required: ['resumo', 'precoServico', 'cenarios', 'retornoCliente', 'premissas', 'ressalvas'],
} as const;

const MODELO_LABEL: Record<string, string> = {
  sugerir: 'sugira o melhor modelo',
  fee_fixo: 'fee fixo mensal',
  fee_percentual: 'percentual da verba de mídia',
  fee_mais_percentual: 'fee fixo + percentual da verba',
};

export async function gerarOrcamento(input: OrcamentoInput): Promise<Orcamento> {
  const row = await prisma.setting.findUnique({ where: { key: 'anthropic_api_key' } });
  const apiKey = row?.value?.trim();
  if (!apiKey) throw new Error('Configure a Anthropic API Key em Configurações para gerar orçamentos.');
  if (!input.segmento?.trim() || !input.objetivo?.trim()) {
    throw new Error('Informe o segmento e o objetivo do cliente.');
  }

  const system = [
    'Você é o estrategista comercial da TráfegoPRO, agência de tráfego pago e Google Ads.',
    'A partir do segmento e do objetivo de um cliente, você gera uma proposta comercial em pt-BR com: (1) o preço do serviço de gestão de tráfego a cobrar, e (2) a projeção de retorno do cliente em 3 cenários (Conservador, Realista, Otimista).',
    'PREÇO: precifique a GESTÃO de tráfego (seu serviço), não a verba de mídia. Use faixas de mercado brasileiro coerentes com o porte/verba do cliente. Dê min, recomendado e max mensais, um setup inicial (0 se não fizer sentido) e o modelo de cobrança.',
    'PROJEÇÃO: para cada cenário estime, de forma realista para o segmento, o investimento de mídia mensal, o seu fee, o retorno estimado mensal (receita/valor gerado) e uma métrica-chave (ex.: leads/mês, vendas, CPA, ROAS). Relacione o retorno ao OBJETIVO declarado do cliente.',
    'REGRAS: não invente números como se fossem fatos — toda estimativa é uma PREMISSA; liste as premissas usadas e as ressalvas (resultados não são garantidos, dependem de execução, oferta e mercado). Se faltar dado (ex.: ticket médio), assuma um valor plausível e declare a suposição. Seja específico do segmento, não genérico.',
    'Valores monetários como number em reais.',
  ].join('\n');

  const ctx = [
    `Segmento do cliente: ${input.segmento}`,
    `Objetivo do cliente: ${input.objetivo}`,
    input.verbaMidiaMensal ? `Verba de mídia mensal informada: R$ ${input.verbaMidiaMensal}` : 'Verba de mídia: não informada (estime uma faixa coerente com o segmento).',
    input.ticketMedio ? `Ticket médio / valor do produto: R$ ${input.ticketMedio}` : 'Ticket médio: não informado (assuma um valor plausível e declare).',
    input.regiao ? `Região: ${input.regiao}` : '',
    `Modelo de cobrança preferido: ${MODELO_LABEL[input.modeloCobranca ?? 'sugerir']}`,
  ].filter(Boolean).join('\n');

  const client = new Anthropic({ apiKey });
  const params: Record<string, unknown> = {
    model: 'claude-opus-4-8',
    max_tokens: 5000,
    thinking: { type: 'disabled' },
    system,
    messages: [{ role: 'user', content: `${ctx}\n\nGere a proposta (JSON).` }],
    output_config: { format: { type: 'json_schema', schema: SCHEMA } },
  };
  const resp = await client.messages.create(params as unknown as Parameters<typeof client.messages.create>[0]);

  let text = '';
  for (const block of (resp as any).content) if (block.type === 'text') text += block.text;
  try {
    return JSON.parse(text) as Orcamento;
  } catch {
    throw new Error('A IA não retornou um JSON válido. Tente novamente.');
  }
}
