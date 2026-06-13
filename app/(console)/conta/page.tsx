import Link from 'next/link';
import { getGoogleAdsConfig, fetchAccountSnapshot, type AccountSnapshot } from '@/lib/google-ads';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const brl = (v: number) => `R$ ${v.toFixed(2).replace('.', ',')}`;

export default async function ContaPage() {
  const cfg = await getGoogleAdsConfig();

  let snapshot: AccountSnapshot | null = null;
  let error: string | null = null;
  if (cfg) {
    try {
      snapshot = await fetchAccountSnapshot(30);
    } catch (e) {
      error = e instanceof Error ? e.message : String(e);
    }
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">Conta Google Ads</h1>
        <p className="text-sm text-muted">Dados reais da conta via Google Ads API — os mesmos que alimentam os pipelines de otimização e relatório.</p>
      </header>

      {!cfg && (
        <div className="rounded-xl border border-gold/40 bg-gold/10 p-4 text-sm text-gold">
          Credenciais incompletas. Preencha todos os campos de <Link href="/configuracoes" className="underline">Configurações → Google Ads API</Link> (Customer ID, Developer Token, Client ID, Client Secret e Refresh Token).
        </div>
      )}

      {error && (
        <div className="rounded-xl border border-red-400/40 bg-red-400/10 p-4 text-sm text-red-300 space-y-2">
          <p className="font-semibold">A API respondeu com erro:</p>
          <p className="font-mono text-xs whitespace-pre-wrap">{error}</p>
          {error.includes('TESTE') && (
            <p className="text-gold">
              ⏳ Isso é esperado até o Google aprovar o acesso básico do Developer Token (solicitado na Central de API da MCC). Assim que a aprovação cair, esta página passa a funcionar sem nenhuma mudança.
            </p>
          )}
        </div>
      )}

      {snapshot && (
        <>
          <section className="grid gap-4 sm:grid-cols-4">
            <div className="card"><p className="label">Custo (30d)</p><p className="text-2xl font-bold">{brl(snapshot.totals.costBRL)}</p></div>
            <div className="card"><p className="label">Cliques</p><p className="text-2xl font-bold">{snapshot.totals.clicks}</p><p className="text-xs text-muted">CTR {(snapshot.totals.ctr * 100).toFixed(2)}% · CPC {brl(snapshot.totals.cpcBRL)}</p></div>
            <div className="card"><p className="label">Conversões</p><p className="text-2xl font-bold">{snapshot.totals.conversions}</p>{snapshot.totals.cpaBRL !== null && <p className="text-xs text-muted">CPA {brl(snapshot.totals.cpaBRL)}</p>}</div>
            <div className="card"><p className="label">ROAS</p><p className="text-2xl font-bold">{snapshot.totals.roas !== null ? snapshot.totals.roas.toFixed(2) : '—'}</p></div>
          </section>

          <section className="card overflow-x-auto">
            <h2 className="font-semibold mb-3">Campanhas ({snapshot.period})</h2>
            {snapshot.campaigns.length === 0 ? (
              <p className="text-sm text-muted">Nenhuma campanha com atividade no período.</p>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-muted border-b border-line">
                    <th className="py-2 pr-4">Campanha</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Canal</th>
                    <th className="py-2 pr-4 text-right">Impr.</th>
                    <th className="py-2 pr-4 text-right">Cliques</th>
                    <th className="py-2 pr-4 text-right">Custo</th>
                    <th className="py-2 text-right">Conv.</th>
                  </tr>
                </thead>
                <tbody>
                  {snapshot.campaigns.map((c) => (
                    <tr key={c.id} className="border-b border-line/50">
                      <td className="py-2 pr-4 font-medium">{c.name}</td>
                      <td className="py-2 pr-4">
                        <span className={c.status === 'ENABLED' ? 'text-accent2' : 'text-muted'}>{c.status === 'ENABLED' ? 'Ativa' : c.status === 'PAUSED' ? 'Pausada' : c.status}</span>
                      </td>
                      <td className="py-2 pr-4 text-muted">{c.channel}</td>
                      <td className="py-2 pr-4 text-right">{c.impressions}</td>
                      <td className="py-2 pr-4 text-right">{c.clicks}</td>
                      <td className="py-2 pr-4 text-right">{brl(c.costBRL)}</td>
                      <td className="py-2 text-right">{c.conversions}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <p className="text-xs text-muted">
            ✓ Conexão ativa com a conta {snapshot.customerId}. Estes dados são injetados automaticamente nos pipelines de Otimização Semanal, Auditoria 360, Escala e Relatório Mensal.
          </p>
        </>
      )}
    </div>
  );
}
