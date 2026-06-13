import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getSession } from '@/lib/auth';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// Robô de vendas: conduz a conversa, apresenta a proposta e CONTORNA objeções
// (resposta negativa -> entende o cliente -> reforça valor -> traz de volta).
export async function POST(req: Request) {
  if (!(await getSession())) return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });

  const row = await prisma.setting.findUnique({ where: { key: 'anthropic_api_key' } });
  const apiKey = row?.value?.trim();
  if (!apiKey) return NextResponse.json({ error: 'Configure a Anthropic API Key em Configurações.' }, { status: 400 });

  const body = await req.json().catch(() => ({}));
  const ctx = body?.ctx ?? {};
  const messages: Array<{ role: 'lead' | 'bot'; text: string }> = Array.isArray(body?.messages) ? body.messages : [];

  const system = [
    'Você é a SDR/closer da TráfegoPRO, agência de tráfego pago e Google Ads operada por IA. Está atendendo um lead pelo WhatsApp.',
    'Tom: brasileiro, próximo, profissional e objetivo. Mensagens CURTAS (1 a 3 frases), como no WhatsApp. Use o nome do lead quando souber. Sem emojis em excesso (no máximo 1).',
    'Objetivo: qualificar, apresentar a proposta e FECHAR (setup + fee mensal).',
    'PLAYBOOK DE OBJEÇÃO (essencial): quando o lead responder algo negativo ("tá caro", "vou pensar", "não tenho certeza", "tá difícil agora"), NÃO desista e NÃO seja insistente bruto. Primeiro VALIDE o sentimento ("entendo, faz sentido pensar com calma"), faça UMA pergunta para entender a real objeção, e então reforce o VALOR ancorando no objetivo e na projeção de retorno (o fee se paga com poucos clientes/vendas), oferecendo um próximo passo fácil. Traga o lead de volta para a negociação.',
    'Quando o lead demonstrar aceite ("vamos", "fechado", "quero começar", "topo"), confirme em uma frase e oriente que o próximo passo é o contrato + PIX do setup — e finalize sua mensagem com a TAG [FECHAR] ao final (só nesse caso).',
    'Nunca prometa resultado garantido; fale em estimativa/projeção.',
    `Contexto da proposta: segmento=${ctx.segmento ?? 'n/d'}; objetivo=${ctx.objetivo ?? 'n/d'}; fee mensal recomendado=R$ ${ctx.fee ?? 'a definir'}; setup=R$ ${ctx.setup ?? 'a definir'}.`,
    ctx.projecao ? `Projeção/argumento de retorno: ${String(ctx.projecao).slice(0, 500)}` : '',
  ].join('\n');

  const history = messages.slice(-16).map((m) => ({ role: m.role === 'lead' ? 'user' as const : 'assistant' as const, content: m.text }));
  if (history.length === 0 || history[0].role !== 'user') {
    history.unshift({ role: 'user', content: '(o lead acabou de chegar pelo site pedindo um diagnóstico gratuito — abra a conversa)' });
  }

  const client = new Anthropic({ apiKey });
  const params: Record<string, unknown> = {
    model: 'claude-opus-4-8',
    max_tokens: 600,
    thinking: { type: 'disabled' },
    system,
    messages: history,
  };
  try {
    const resp = await client.messages.create(params as unknown as Parameters<typeof client.messages.create>[0]);
    let text = '';
    for (const b of (resp as any).content) if (b.type === 'text') text += b.text;
    const fechar = /\[FECHAR\]/i.test(text);
    text = text.replace(/\[FECHAR\]/gi, '').trim();
    return NextResponse.json({ text, fechar });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Falha na IA' }, { status: 500 });
  }
}
