import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/db';
import { requireSession } from '@/lib/auth';
import { AGENTS, SETORES } from '@/lib/manifest';

export const dynamic = 'force-dynamic';

const MODELS = ['claude-opus-4-8', 'claude-sonnet-4-6', 'claude-haiku-4-5'];

async function saveAgentAction(formData: FormData) {
  'use server';
  await requireSession();
  const slug = String(formData.get('slug') ?? '');
  if (!AGENTS.some((a) => a.slug === slug)) throw new Error('Agente desconhecido.');
  const enabled = formData.get('enabled') === 'on';
  const modelRaw = String(formData.get('model') ?? MODELS[0]);
  const model = MODELS.includes(modelRaw) ? modelRaw : MODELS[0];
  await prisma.agentConfig.upsert({
    where: { slug },
    update: { enabled, model },
    create: { slug, enabled, model },
  });
  revalidatePath('/agentes');
  revalidatePath('/');
}

export default async function AgentesPage() {
  const configs = await prisma.agentConfig.findMany();
  const bySlug = new Map(configs.map((c) => [c.slug, c]));

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Agentes</h1>
        <p className="text-sm text-muted">A organização em setores — ative/desative agentes e escolha o modelo de IA de cada um.</p>
      </header>

      {SETORES.map((setor) => (
        <section key={setor} className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">{setor}</h2>
          <div className="grid gap-3">
            {AGENTS.filter((a) => a.setor === setor).map((agent) => {
              const cfg = bySlug.get(agent.slug);
              const enabled = cfg?.enabled ?? true;
              const model = cfg?.model ?? MODELS[0];
              return (
                <form key={agent.slug} action={saveAgentAction} className="card flex flex-wrap items-center gap-4">
                  <input type="hidden" name="slug" value={agent.slug} />
                  <div className="flex-1 min-w-52">
                    <p className="font-medium">{agent.title}</p>
                    <p className="text-xs text-muted">
                      {agent.papel}
                      {agent.skills.length > 0 && (
                        <> · {agent.skills.map((s) => <span key={s} className="chip mr-1">{s}</span>)}</>
                      )}
                    </p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" name="enabled" defaultChecked={enabled} className="h-4 w-4 accent-[#4f8cff]" />
                    Ativo
                  </label>
                  <select name="model" defaultValue={model} className="input w-auto">
                    {MODELS.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                  <button type="submit" className="btn-ghost text-xs">Salvar</button>
                </form>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
