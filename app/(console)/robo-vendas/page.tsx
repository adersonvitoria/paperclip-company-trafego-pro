import { prisma } from '@/lib/db';
import { RoboUI } from './robo-ui';

export const dynamic = 'force-dynamic';

const reais = (c: number) => (c / 100).toFixed(2);

export default async function RoboVendasPage() {
  const rows = await prisma.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 30 });
  const leads = rows.map((l) => {
    let fee = '1800', setup = '1500', projecao = '';
    try {
      if (l.orcamentoJson) {
        const o = JSON.parse(l.orcamentoJson);
        if (o?.precoServico?.recomendadoMensal) fee = String(o.precoServico.recomendadoMensal);
        if (o?.precoServico?.setupInicial) setup = String(o.precoServico.setupInicial);
        projecao = o?.retornoCliente ?? o?.resumo ?? '';
      }
    } catch { /* ignore */ }
    return { id: l.id, nome: l.nome, contato: l.contato, segmento: l.segmento, objetivo: l.objetivo, fee, setup, projecao };
  });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Robô de Vendas</h1>
        <p className="text-sm text-muted">Teste o atendimento automático: o robô recebe o lead, contorna objeções, fecha o contrato, assina, gera o PIX do setup e cadastra o cliente.</p>
      </header>
      <RoboUI leads={leads} />
    </div>
  );
}
