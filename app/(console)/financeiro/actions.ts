'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { expandir, reaisToCents, type Tipo } from '@/lib/finance';

function parseVenc(s: string): Date {
  // input type=date => 'YYYY-MM-DD'; fixa meio-dia para evitar drift de fuso
  const d = new Date(`${s}T12:00:00`);
  return isNaN(d.getTime()) ? new Date() : d;
}

export async function createEntry(formData: FormData) {
  await requireSession();
  const tipo = (String(formData.get('tipo')) === 'PAGAR' ? 'PAGAR' : 'RECEBER') as Tipo;
  const descricao = String(formData.get('descricao') ?? '').trim();
  const categoria = String(formData.get('categoria') ?? '').trim() || undefined;
  const valorCents = reaisToCents(String(formData.get('valor') ?? ''));
  const vencimento = parseVenc(String(formData.get('vencimento') ?? ''));
  const modo = (String(formData.get('modo') ?? 'avista') as 'avista' | 'parcelado' | 'recorrente');
  const parcelas = Number(formData.get('parcelas') ?? 1) || 1;
  const meses = Number(formData.get('meses') ?? 1) || 1;

  if (!descricao || !Number.isFinite(valorCents) || valorCents <= 0) {
    throw new Error('Descrição e valor válidos são obrigatórios.');
  }

  const rows = expandir({ tipo, descricao, categoria, valorCents, vencimento, modo, parcelas, meses });
  await prisma.financeEntry.createMany({ data: rows });
  revalidatePath('/financeiro');
}

export async function updateEntry(formData: FormData) {
  await requireSession();
  const id = String(formData.get('id') ?? '');
  const descricao = String(formData.get('descricao') ?? '').trim();
  const categoria = String(formData.get('categoria') ?? '').trim() || null;
  const valorCents = reaisToCents(String(formData.get('valor') ?? ''));
  const vencimento = parseVenc(String(formData.get('vencimento') ?? ''));
  const status = String(formData.get('status') ?? 'PENDENTE') === 'QUITADO' ? 'QUITADO' : 'PENDENTE';
  if (!id || !descricao || !Number.isFinite(valorCents) || valorCents <= 0) {
    throw new Error('Dados inválidos.');
  }
  await prisma.financeEntry.update({ where: { id }, data: { descricao, categoria, valorCents, vencimento, status } });
  revalidatePath('/financeiro');
}

export async function toggleStatus(formData: FormData) {
  await requireSession();
  const id = String(formData.get('id') ?? '');
  const e = await prisma.financeEntry.findUnique({ where: { id } });
  if (!e) return;
  await prisma.financeEntry.update({ where: { id }, data: { status: e.status === 'QUITADO' ? 'PENDENTE' : 'QUITADO' } });
  revalidatePath('/financeiro');
}

export async function deleteEntry(formData: FormData) {
  await requireSession();
  const id = String(formData.get('id') ?? '');
  if (id) await prisma.financeEntry.delete({ where: { id } }).catch(() => undefined);
  revalidatePath('/financeiro');
}

export async function deleteGroup(formData: FormData) {
  await requireSession();
  const grupoId = String(formData.get('grupoId') ?? '');
  if (grupoId) await prisma.financeEntry.deleteMany({ where: { grupoId } });
  revalidatePath('/financeiro');
}
