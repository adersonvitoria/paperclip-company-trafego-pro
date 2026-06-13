'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { gerarContrato, assinarDigital } from '@/lib/contrato';
import { gerarPixCopiaECola, gerarPixQrSvg } from '@/lib/pix';
import { reaisToCents } from '@/lib/finance';

export type FechamentoResult = {
  ok: boolean;
  error?: string;
  clientId?: string;
  contrato?: string;
  assinatura?: string;
  pix?: string;
  pixQrSvg?: string;
  pixDemo?: boolean;
  numeroContrato?: string;
  empresaNome?: string;
  empresaCidade?: string;
  dataExtenso?: string;
  feeMensalCents?: number;
  setupCents?: number;
};

const MESES = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

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

  const now = new Date();
  const dataISO = now.toISOString();
  const dataExtenso = `${empresaCidade}, ${now.getDate()} de ${MESES[now.getMonth()]} de ${now.getFullYear()}`;
  const numeroContrato = `TP-${now.getFullYear()}-${String(now.getTime()).slice(-6)}`;

  const contrato = gerarContrato({ empresaNome, empresaCidade, clienteNome: nome, clienteContato: contato, segmento, feeMensalCents, setupCents, dataISO });
  const assinatura = assinarDigital(contrato, `${nome}|${contato}`, dataISO);

  // PIX: usa a chave configurada (escaneável de verdade) ou cai numa chave de
  // demonstração só para a tela de teste renderizar o QR. pixDemo sinaliza isso.
  const pixDemo = !pixKey;
  const chave = pixKey || 'demo@trafegopro.com.br';
  let pix = '';
  let pixQrSvg = '';
  if (setupCents > 0) {
    pix = gerarPixCopiaECola({ chave, nome: empresaNome, cidade: empresaCidade, valorCents: setupCents, txid: numeroContrato.replace(/[^A-Za-z0-9]/g, '').slice(0, 25) });
    pixQrSvg = await gerarPixQrSvg(pix);
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
  return {
    ok: true, clientId: client.id, contrato, assinatura, pix, pixQrSvg, pixDemo,
    numeroContrato, empresaNome, empresaCidade, dataExtenso, feeMensalCents, setupCents,
  };
}
