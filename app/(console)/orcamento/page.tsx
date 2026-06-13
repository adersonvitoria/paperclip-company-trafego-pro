import { OrcamentoForm } from './orcamento-form';

export const dynamic = 'force-dynamic';

export default function OrcamentoPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Orçamento</h1>
        <p className="text-sm text-muted">
          Informe o segmento e o objetivo do cliente — a IA sugere quanto cobrar pela gestão e projeta o retorno do cliente em cenários.
        </p>
      </header>
      <OrcamentoForm />
    </div>
  );
}
