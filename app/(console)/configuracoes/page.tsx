import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { ALL_SETTING_FIELDS, SETTING_SECTIONS } from '@/lib/settings-def';

export const dynamic = 'force-dynamic';

async function saveSettingsAction(formData: FormData) {
  'use server';
  await requireSession();
  for (const field of ALL_SETTING_FIELDS) {
    const raw = formData.get(field.key);
    if (raw === null) continue;
    const value = String(raw).trim();
    // campo secreto deixado em branco = manter o valor atual
    if (field.secret && value === '') continue;
    if (value === '') {
      await prisma.setting.deleteMany({ where: { key: field.key } });
    } else {
      await prisma.setting.upsert({
        where: { key: field.key },
        update: { value },
        create: { key: field.key, value },
      });
    }
  }
  revalidatePath('/configuracoes');
  revalidatePath('/');
}

export default async function ConfiguracoesPage() {
  const settings = await prisma.setting.findMany();
  const byKey = new Map(settings.map((s) => [s.key, s.value]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Configurações</h1>
        <p className="text-sm text-muted">Tudo que os agentes precisam para operar — chaves, contexto do negócio, metas e guardrails.</p>
      </header>

      <form action={saveSettingsAction} className="space-y-6">
        {SETTING_SECTIONS.map((section) => (
          <section key={section.title} className="card">
            <h2 className="font-semibold">{section.title}</h2>
            <p className="mt-1 mb-4 text-sm text-muted">{section.description}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {section.fields.map((field) => {
                const current = byKey.get(field.key);
                return (
                  <div key={field.key} className={field.secret ? 'sm:col-span-2' : ''}>
                    <label className="label" htmlFor={field.key}>
                      {field.label}
                      {field.required && <span className="text-red-400"> *</span>}
                      {field.secret && current && <span className="ml-2 normal-case text-accent2">✓ configurado</span>}
                    </label>
                    <input
                      id={field.key}
                      name={field.key}
                      type={field.secret ? 'password' : 'text'}
                      defaultValue={field.secret ? '' : current ?? ''}
                      placeholder={field.secret && current ? '•••••••• (deixe em branco para manter)' : field.placeholder ?? ''}
                      className="input"
                      autoComplete="off"
                    />
                    {field.help && <p className="mt-1 text-xs text-muted">{field.help}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
        <button type="submit" className="btn">Salvar configurações</button>
      </form>
    </div>
  );
}
