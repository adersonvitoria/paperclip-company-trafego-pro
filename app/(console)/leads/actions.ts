'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';

export async function setLeadStatus(formData: FormData) {
  await requireSession();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? 'NOVO');
  if (id) await prisma.lead.update({ where: { id }, data: { status } }).catch(() => undefined);
  revalidatePath('/leads');
}

export async function deleteLead(formData: FormData) {
  await requireSession();
  const id = String(formData.get('id') ?? '');
  if (id) await prisma.lead.delete({ where: { id } }).catch(() => undefined);
  revalidatePath('/leads');
}
