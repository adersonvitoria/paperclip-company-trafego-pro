import { prisma } from '@/lib/db';
import { setLeadStatus, deleteLead } from './actions';

export const dynamic = 'force-dynamic';

const brl = (v: number) => 'R$ ' + (v ?? 0).toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const STATUS = ['NOVO', 'CONTATADO', 'GANHO', 'PERDIDO'];
const STATUS_CLS: Record<string, string> = {
  NOVO: 'border-accent/40 bg-accent/10 text-accent',
  CONTATADO: 'border-gold/40 bg-gold/10 text-gold',
  GANHO: 'border-accent2/40 bg-accent2/10 text-accent2',
  PERDIDO: 'border-red-400/40 bg-red-400/10 text-red-300',
};

export default async function LeadsPage() {
  const leads = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' } });
  const novos = leads.filter((l) => l.status === 'NOVO').length;
  const ganhos = leads.filter((l) => l.status === 'GANHO').length;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Leads</h1>
        <p className="text-sm text-muted">
          Capturados pelo site comercial. A IA já gera o orçamento de cada lead automaticamente — você fecha com a proposta pronta.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card"><p className="label">Total de leads</p><p className="text-3xl font-extrabold font-display glow-text">{leads.length}</p></div>
        <div className="card"><p className="label">Novos</p><p className="text-3xl font-extrabold font-display" style={{ color: '#22d3ee' }}>{novos}</p></div>
        <div className="card"><p className="label">Ganhos</p><p className="text-3xl font-extrabold font-display" style={{ color: '#34d399' }}>{ganhos}</p></div>
      </section>

      {leads.length === 0 ? (
        <div className="card text-sm text-muted">
          Nenhum lead ainda. Quando alguém preencher o formulário do site comercial (trafegopro-site.vercel.app), o lead aparece aqui com o orçamento já calculado.
        </div>
      ) : (
        <div className="space-y-4">
          {leads.map((l) => {
            let orc: any = null;
            try { orc = l.orcamentoJson ? JSON.parse(l.orcamentoJson) : null; } catch { orc = null; }
            return (
              <div key={l.id} className="card">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{l.nome} <span className={`ml-2 rounded border px-2 py-0.5 text-[10px] font-bold uppercase ${STATUS_CLS[l.status] ?? ''}`}>{l.status}</span></p>
                    <p className="text-xs text-muted mt-0.5">{l.contato} · {l.segmento} · {new Date(l.createdAt).toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-slate-300 mt-2"><span className="text-muted">Objetivo:</span> {l.objetivo}{l.verbaMidia ? ` · Verba: ${l.verbaMidia}` : ''}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <form action={setLeadStatus} className="flex items-center gap-1">
                      <input type="hidden" name="id" value={l.id} />
                      <select name="status" defaultValue={l.status} className="input w-auto py-1 text-xs">
                        {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                      <button className="btn-ghost text-xs">salvar</button>
                    </form>
                    <form action={deleteLead}><input type="hidden" name="id" value={l.id} /><button className="text-xs text-red-400 hover:underline">excluir</button></form>
                  </div>
                </div>

                {orc ? (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm text-accent">
                      Orçamento gerado pela IA — fee recomendado {brl(orc?.precoServico?.recomendadoMensal ?? 0)}/mês
                    </summary>
                    <div className="mt-3 space-y-3 border-t border-line pt-3">
                      <p className="text-sm text-slate-200">{orc.resumo}</p>
                      <div className="grid gap-2 sm:grid-cols-3">
                        {(orc.cenarios ?? []).map((c: any, i: number) => {
                          const inv = (c.investimentoMidiaMensal ?? 0) + (c.feeServicoMensal ?? 0);
                          const roi = inv > 0 ? (c.retornoEstimadoMensal ?? 0) / inv : 0;
                          return (
                            <div key={i} className="rounded-lg border border-line bg-panel2 p-3 text-xs">
                              <p className="font-semibold">{c.nome} · <span className="font-mono-data">ROI {roi.toFixed(1)}x</span></p>
                              <p className="text-muted mt-1">{c.metricaChave}</p>
                              <p className="mt-1">Retorno est.: <span className="font-mono-data text-accent2">{brl(c.retornoEstimadoMensal ?? 0)}/mês</span></p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </details>
                ) : (
                  <p className="mt-2 text-xs text-gold">Orçamento não gerado automaticamente — gere manualmente em Orçamento com os dados acima.</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
