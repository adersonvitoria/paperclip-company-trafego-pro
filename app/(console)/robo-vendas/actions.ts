'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { gerarContrato, assinarDigital } from '@/lib/contrato';
import { gerarPixCopiaECola } from '@/lib/pix';
import { reaisToCents } from '@/lib/finance';

export type FechamentoResult = {
  ok: boolean;
  error?: string;
  clientId?: string;
  contrato?: string;
  assinatura?: string;
  pix?: string;
  feeMensalCents?: number;
  setupCents?: number;
};

export async function fecharNegocio(input: {
  nome: string;
  contato: string;
  segmento: string;
  objetivo?: string;
  feeMensal: string;
  setup: string;
}): Promise<FechamentoResult> {
  await requireSession();
  const nome = (input.nome || '').trim();
  const contato = (input.contato || '').trim();
  const segmento = (input.segmento || '').trim();
  const feeMensalCents = reaisToCents(input.feeMensal || '0');
  const setupCents = reaisToCents(input.setup || '0');

  if (!nome || !contato || !segmento || !Number.isFinite(feeMensalCents)) {
    return { ok: false, error: 'Preencha nome, contato, segmento e valores.' };
  }

  const cfg = await prisma.setting.findMany({ where: { key: { in: ['empresa_nome', 'empresa_cidade', 'pix_key'] } } });
  const get = (k: string) => cfg.find((c) => c.key === k)?.value?.trim() ?? '';
  const empresaNome = get('empresa_nome') || 'TráfegoPRO';
  const empresaCidade = get('empresa_cidade') || 'Brasil';
  const pixKey = get('pix_key');

  const dataISO = new Date().toISOString();
  const contrato = gerarContrato({ empresaNome, empresaCidade, clienteNome: nome, clienteContato: contato, segmento, feeMensalCents, setupCents, dataISO });
  const assinatura = assinarDigital(contrato, `${nome}|${contato}`, dataISO);

  let pix = '';
  if (pixKey && setupCents > 0) {
    pix = gerarPixCopiaECola({ chave: pixKey, nome: empresaNome, cidade: empresaCidade, valorCents: setupCents, txid: 'SETUP' + Date.now().toString().slice(-8) });
  }

  const client = await prisma.client.create({
    data: {
      nome, contato, segmento, objetivo: input.objetivo ?? null,
      feeMensalCents, setupCents, status: 'FECHADO',
      contratoTexto: contrato, assinaturaHash: assinatura, assinadoEm: new Date(dataISO),
      pixPayload: pix || null,
    },
  });

  revalidatePath('/clientes');
  return { ok: true, clientId: client.id, contrato, assinatura, pix, feeMensalCents, setupCents };
}
