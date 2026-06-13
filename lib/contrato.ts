import 'server-only';
import { createHash } from 'crypto';

const brl = (c: number) => 'R$ ' + (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });

export function gerarContrato(opts: {
  empresaNome: string;
  empresaCidade: string;
  clienteNome: string;
  clienteContato: string;
  segmento: string;
  feeMensalCents: number;
  setupCents: number;
  dataISO: string;
}): string {
  const data = new Date(opts.dataISO).toLocaleDateString('pt-BR');
  return `CONTRATO DE PRESTAÇÃO DE SERVIÇOS DE GESTÃO DE TRÁFEGO PAGO

CONTRATADA: ${opts.empresaNome || 'TráfegoPRO'} ("Agência")
CONTRATANTE: ${opts.clienteNome} — contato: ${opts.clienteContato} ("Cliente")
Segmento: ${opts.segmento}
Local e data: ${opts.empresaCidade || 'Brasil'}, ${data}

1. OBJETO
A Agência prestará ao Cliente serviços de gestão de tráfego pago (Google Ads),
incluindo planejamento, estruturação de campanhas, criação de anúncios,
mensuração, otimização contínua e relatórios de desempenho.

2. VALORES
2.1. Setup (implantação): ${brl(opts.setupCents)}, pago à vista para início dos trabalhos.
2.2. Gestão mensal (fee): ${brl(opts.feeMensalCents)}/mês, devido a cada mês de vigência.
2.3. A verba de mídia é de responsabilidade do Cliente e paga diretamente à plataforma de anúncios, não estando inclusa nos valores acima.

3. PRAZO
Contrato por prazo indeterminado, podendo ser encerrado por qualquer das partes
mediante aviso prévio de 30 (trinta) dias.

4. OBRIGAÇÕES DA AGÊNCIA
Executar os serviços com diligência, manter o Cliente informado por relatórios
periódicos e operar dentro das políticas das plataformas de anúncios.

5. OBRIGAÇÕES DO CLIENTE
Fornecer acessos, informações e a verba de mídia necessários à execução.

6. RESULTADOS
As projeções de resultado são estimativas baseadas em premissas de mercado e não
constituem garantia, dependendo de fatores como oferta, página de destino e
concorrência.

7. ACEITE
O aceite digital deste instrumento, registrado eletronicamente com data, hora e
código de verificação, tem validade entre as partes.

____________________________________________
${opts.empresaNome || 'TráfegoPRO'} (Contratada)

____________________________________________
${opts.clienteNome} (Contratante)`;
}

// Assinatura digital simbólica: hash do contrato + identificador + timestamp.
export function assinarDigital(contrato: string, quem: string, dataISO: string): string {
  return createHash('sha256').update(`${contrato}::${quem}::${dataISO}`).digest('hex').slice(0, 32).toUpperCase();
}
