'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function setClientStatus(formData: FormData) {
  await requireSession();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? 'FECHADO');
  if (id) await prisma.client.update({ where: { id }, data: { status } }).catch(() => undefined);
  revalidatePath('/clientes');
}

export async function deleteClient(formData: FormData) {
  await requireSession();
  const id = String(formData.get('id') ?? '');
  if (id) await prisma.client.delete({ where: { id } }).catch(() => undefined);
  revalidatePath('/clientes');
}
