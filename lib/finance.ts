import 'server-only';
import { prisma } from './db';

export type Tipo = 'RECEBER' | 'PAGAR';

export const reaisToCents = (s: string | number): number => {
  if (typeof s === 'number') return Math.round(s * 100);
  const n = parseFloat(String(s).replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(n) ? Math.round(n * 100) : NaN;
};
export const centsToReais = (c: number): string =>
  (c / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export const brlCents = (c: number): string => 'R$ ' + centsToReais(c);

function addMonths(date: Date, n: number): Date {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  // mantém o dia, ajustando para o último dia do mês quando necessário
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, last));
  return d;
}

export type NovoLancamento = {
  tipo: Tipo;
  descricao: string;
  categoria?: string;
  valorCents: number; // valor TOTAL (parcelado) ou valor de cada ocorrência (recorrente/à vista)
  vencimento: Date;
  modo: 'avista' | 'parcelado' | 'recorrente';
  parcelas?: number; // modo parcelado
  meses?: number; // modo recorrente
};

// Expande um lançamento em N linhas (parcelas ou recorrências).
export function expandir(l: NovoLancamento): Array<{
  tipo: string; descricao: string; categoria: string | null; valorCents: number;
  vencimento: Date; grupoId: string | null; parcelaNum: number; parcelasTotal: number; recorrente: boolean;
}> {
  const cat = l.categoria?.trim() || null;
  if (l.modo === 'parcelado' && (l.parcelas ?? 0) > 1) {
    const n = Math.min(120, Math.max(2, Math.floor(l.parcelas!)));
    const base = Math.floor(l.valorCents / n);
    const resto = l.valorCents - base * n;
    const grupoId = cuid();
    return Array.from({ length: n }, (_, i) => ({
      tipo: l.tipo,
      descricao: `${l.descricao} (${i + 1}/${n})`,
      categoria: cat,
      valorCents: base + (i === n - 1 ? resto : 0),
      vencimento: addMonths(l.vencimento, i),
      grupoId,
      parcelaNum: i + 1,
      parcelasTotal: n,
      recorrente: false,
    }));
  }
  if (l.modo === 'recorrente' && (l.meses ?? 0) > 1) {
    const n = Math.min(120, Math.max(2, Math.floor(l.meses!)));
    const grupoId = cuid();
    return Array.from({ length: n }, (_, i) => ({
      tipo: l.tipo,
      descricao: `${l.descricao} (recorrente ${i + 1}/${n})`,
      categoria: cat,
      valorCents: l.valorCents,
      vencimento: addMonths(l.vencimento, i),
      grupoId,
      parcelaNum: i + 1,
      parcelasTotal: n,
      recorrente: true,
    }));
  }
  return [{
    tipo: l.tipo, descricao: l.descricao, categoria: cat, valorCents: l.valorCents,
    vencimento: l.vencimento, grupoId: null, parcelaNum: 1, parcelasTotal: 1, recorrente: false,
  }];
}

// cuid simples (suficiente para agrupar — evita import extra)
function cuid(): string {
  return 'g' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

export type FinanceMetrics = {
  receberPendente: number;
  pagarPendente: number;
  saldoPrevisto: number;
  recebidoMes: number;
  pagoMes: number;
  vencidoReceber: number;
  vencidoPagar: number;
  fluxo: Array<{ label: string; receber: number; pagar: number; saldo: number }>;
  pagarPorCategoria: Array<{ label: string; value: number; color: string }>;
  receberPorCategoria: Array<{ label: string; value: number; color: string }>;
};

const PALETTE = ['#22d3ee', '#34d399', '#fbbf24', '#a78bfa', '#f87171', '#60a5fa', '#f472b6', '#4ade80'];

export async function computeFinance(): Promise<{ entries: any[]; metrics: FinanceMetrics }> {
  const entries = await prisma.financeEntry.findMany({ orderBy: { vencimento: 'asc' } });
  const now = new Date();
  const mesAtual = (d: Date) => d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();

  let receberPendente = 0, pagarPendente = 0, recebidoMes = 0, pagoMes = 0, vencidoReceber = 0, vencidoPagar = 0;
  for (const e of entries) {
    const venc = new Date(e.vencimento);
    if (e.status === 'PENDENTE') {
      if (e.tipo === 'RECEBER') { receberPendente += e.valorCents; if (venc < now) vencidoReceber += e.valorCents; }
      else { pagarPendente += e.valorCents; if (venc < now) vencidoPagar += e.valorCents; }
    } else {
      if (mesAtual(venc)) { if (e.tipo === 'RECEBER') recebidoMes += e.valorCents; else pagoMes += e.valorCents; }
    }
  }

  // Fluxo dos próximos 6 meses (inclui o mês atual)
  const fluxo: FinanceMetrics['fluxo'] = [];
  for (let i = 0; i < 6; i++) {
    const ref = addMonths(now, i);
    const y = ref.getFullYear(), m = ref.getMonth();
    let receber = 0, pagar = 0;
    for (const e of entries) {
      const v = new Date(e.vencimento);
      if (v.getFullYear() === y && v.getMonth() === m) {
        if (e.tipo === 'RECEBER') receber += e.valorCents; else pagar += e.valorCents;
      }
    }
    fluxo.push({ label: ref.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', ''), receber, pagar, saldo: receber - pagar });
  }

  // Por categoria (pendentes)
  const catMap = (tipo: Tipo) => {
    const map = new Map<string, number>();
    for (const e of entries) if (e.tipo === tipo && e.status === 'PENDENTE') {
      const k = e.categoria || 'Sem categoria';
      map.set(k, (map.get(k) ?? 0) + e.valorCents);
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]).map(([label, value], i) => ({ label, value, color: PALETTE[i % PALETTE.length] }));
  };

  return {
    entries: entries.map((e) => ({ ...e, vencimento: new Date(e.vencimento).toISOString() })),
    metrics: {
      receberPendente, pagarPendente, saldoPrevisto: receberPendente - pagarPendente,
      recebidoMes, pagoMes, vencidoReceber, vencidoPagar,
      fluxo, pagarPorCategoria: catMap('PAGAR'), receberPorCategoria: catMap('RECEBER'),
    },
  };
}
