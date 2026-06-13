import { prisma } from '@/lib/db';
import { StatCard } from '@/components/charts';
import { setClientStatus, deleteClient } from './actions';

export const dynamic = 'force-dynamic';

const brl = (c: number) => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
const STATUS = ['FECHADO', 'SETUP_PAGO', 'ATIVO', 'CANCELADO'];
const CLS: Record<string, string> = {
  FECHADO: 'border-gold/40 bg-gold/10 text-gold',
  SETUP_PAGO: 'border-accent/40 bg-accent/10 text-accent',
  ATIVO: 'border-accent2/40 bg-accent2/10 text-accent2',
  CANCELADO: 'border-red-400/40 bg-red-400/10 text-red-300',
};

export default async function ClientesPage() {
  const clients = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } });
  const ativos = clients.filter((c) => c.status !== 'CANCELADO');
  const mrr = ativos.reduce((a, c) => a + c.feeMensalCents, 0);
  const setupTotal = clients.reduce((a, c) => a + c.setupCents, 0);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Clientes</h1>
        <p className="text-sm text-muted">Todos os clientes que contrataram — valores acordados, contrato, assinatura e PIX do setup.</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="reveal reveal-1"><StatCard label="Clientes ativos" count={{ to: ativos.length }} sub={`${clients.length} no total`} accent="#22d3ee" /></div>
        <div className="reveal reveal-2"><StatCard label="MRR (receita recorrente)" count={{ to: mrr / 100, prefix: 'R$ ', decimals: 2 }} sub="soma dos fees mensais ativos" accent="#34d399" /></div>
        <div className="reveal reveal-3"><StatCard label="Setup contratado" count={{ to: setupTotal / 100, prefix: 'R$ ', decimals: 2 }} sub="total de setups" accent="#fbbf24" /></div>
      </section>

      {clients.length === 0 ? (
        <div className="card text-sm text-muted">Nenhum cliente ainda. Feche um negócio no <a href="/robo-vendas" className="text-accent underline">Robô de Vendas</a> e ele aparece aqui.</div>
      ) : (
        <div className="space-y-4">
          {clients.map((c) => (
            <div key={c.id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">{c.nome} <span className={`ml-2 rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${CLS[c.status] ?? ''}`}>{c.status}</span></p>
                  <p className="text-xs text-muted mt-0.5">{c.contato} · {c.segmento} · cliente desde {new Date(c.createdAt).toLocaleDateString('pt-BR')}</p>
                  <p className="text-sm mt-2">Fee mensal: <span className="font-mono-data text-accent2">{brl(c.feeMensalCents)}</span> · Setup: <span className="font-mono-data">{brl(c.setupCents)}</span></p>
                  {c.objetivo && <p className="text-sm text-muted mt-1">Objetivo: {c.objetivo}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <form action={setClientStatus} className="flex items-center gap-1">
                    <input type="hidden" name="id" value={c.id} />
                    <select name="status" defaultValue={c.status} className="input w-auto py-1 text-xs">{STATUS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                    <button className="btn-ghost text-xs">salvar</button>
                  </form>
                  <form action={deleteClient}><input type="hidden" name="id" value={c.id} /><button className="text-xs text-red-400 hover:underline">excluir</button></form>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-4 border-t border-line pt-3 text-xs">
                {c.assinaturaHash && <div><span className="label inline">Assinatura</span> <span className="font-mono-data break-all">{c.assinaturaHash}</span>{c.assinadoEm && <span className="text-muted"> · {new Date(c.assinadoEm).toLocaleString('pt-BR')}</span>}</div>}
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                {c.contratoTexto && <details className="flex-1 min-w-[260px]"><summary className="cursor-pointer text-sm text-accent">Ver contrato</summary><pre className="mt-2 whitespace-pre-wrap rounded-lg bg-panel2 border border-line p-3 text-xs leading-relaxed">{c.contratoTexto}</pre></details>}
                {c.pixPayload && <details className="flex-1 min-w-[260px]"><summary className="cursor-pointer text-sm text-accent">PIX do setup</summary><textarea readOnly className="input font-mono-data text-xs mt-2" rows={3} value={c.pixPayload} /></details>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
