import { CountUp } from './count-up';

// Componentes de gráfico em SVG/CSS — animam ao montar. Estética command-center.

export function StatCard({
  label,
  value,
  count,
  sub,
  accent,
}: {
  label: string;
  value?: string;
  count?: { to: number; prefix?: string; suffix?: string; decimals?: number };
  sub?: string;
  accent?: string;
}) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className="text-3xl font-extrabold font-display glow-text" style={accent ? { color: accent } : undefined}>
        {count ? <CountUp {...count} /> : value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

type Seg = { label: string; value: number; color: string };

export function DonutChart({ data, size = 150, stroke = 22 }: { data: Seg[]; size?: number; stroke?: number }) {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  let offset = 0;
  const cx = size / 2;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="donut-in shrink-0">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#16203a" strokeWidth={stroke} />
        {total > 0 &&
          data.map((d, i) => {
            const len = (d.value / total) * c;
            const el = (
              <circle
                key={i}
                cx={cx}
                cy={cx}
                r={r}
                fill="none"
                stroke={d.color}
                strokeWidth={stroke}
                strokeLinecap="round"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cx})`}
                style={{ filter: `drop-shadow(0 0 5px ${d.color}aa)` }}
              />
            );
            offset += len;
            return el;
          })}
        <text x={cx} y={cx - 2} textAnchor="middle" className="fill-white font-mono-data" style={{ fontSize: 28, fontWeight: 800 }}>{total}</text>
        <text x={cx} y={cx + 17} textAnchor="middle" style={{ fontSize: 10, fill: '#8595b4', letterSpacing: 2 }}>TOTAL</text>
      </svg>
      <ul className="space-y-2 text-sm">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: d.color, boxShadow: `0 0 8px ${d.color}` }} />
            <span className="text-slate-300">{d.label}</span>
            <span className="ml-auto font-mono-data font-semibold">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarChart({ data, color = '#22d3ee', unit = '' }: { data: Array<{ label: string; value: number }>; color?: string; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2.5">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <span className="w-44 shrink-0 truncate text-slate-300" title={d.label}>{d.label}</span>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-panel2">
            <div
              className="bar-grow h-full rounded"
              style={{
                width: `${(d.value / max) * 100}%`,
                background: `linear-gradient(90deg, ${color}99, ${color})`,
                boxShadow: `0 0 12px -2px ${color}`,
                minWidth: d.value > 0 ? 4 : 0,
                animationDelay: `${i * 0.07}s`,
              }}
            />
          </div>
          <span className="w-12 shrink-0 text-right font-mono-data font-semibold">{d.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

export function Sparkbars({ data, color = '#34d399' }: { data: Array<{ day: string; count: number }>; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-1.5" style={{ height: 96 }}>
      {data.map((d, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1" title={`${d.day}: ${d.count}`}>
          <div
            className="col-grow w-full rounded-t"
            style={{
              height: `${(d.count / max) * 74}px`,
              background: d.count > 0 ? `linear-gradient(180deg, ${color}, ${color}55)` : '#16203a',
              boxShadow: d.count > 0 ? `0 0 10px -2px ${color}` : 'none',
              minHeight: 3,
              animationDelay: `${i * 0.04}s`,
            }}
          />
          <span className="font-mono-data text-[9px] text-slate-500">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// Fluxo de caixa: barras agrupadas (receber x pagar) por mês + linha de saldo
export function CashflowBars({ data }: { data: Array<{ label: string; receber: number; pagar: number; saldo: number }> }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.receber, d.pagar]));
  const fmt = (c: number) => 'R$ ' + Math.round(c / 100).toLocaleString('pt-BR');
  return (
    <div>
      <div className="flex items-end gap-4" style={{ height: 150 }}>
        {data.map((d, i) => (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5" title={`Receber ${fmt(d.receber)} · Pagar ${fmt(d.pagar)} · Saldo ${fmt(d.saldo)}`}>
            <div className="flex w-full items-end justify-center gap-1" style={{ height: 120 }}>
              <div className="col-grow w-1/2 rounded-t" style={{ height: `${(d.receber / max) * 116}px`, background: 'linear-gradient(180deg,#34d399,#34d39955)', boxShadow: '0 0 8px -1px #34d399', minHeight: d.receber > 0 ? 3 : 0, animationDelay: `${i * 0.05}s` }} />
              <div className="col-grow w-1/2 rounded-t" style={{ height: `${(d.pagar / max) * 116}px`, background: 'linear-gradient(180deg,#f87171,#f8717155)', boxShadow: '0 0 8px -1px #f87171', minHeight: d.pagar > 0 ? 3 : 0, animationDelay: `${i * 0.05 + 0.03}s` }} />
            </div>
            <span className="font-mono-data text-[10px] uppercase text-slate-400">{d.label}</span>
            <span className="font-mono-data text-[10px]" style={{ color: d.saldo >= 0 ? '#34d399' : '#f87171' }}>{d.saldo >= 0 ? '+' : ''}{Math.round(d.saldo / 100).toLocaleString('pt-BR')}</span>
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#34d399' }} /> A receber</span>
        <span className="flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: '#f87171' }} /> A pagar</span>
        <span className="ml-auto">saldo por mês abaixo das barras</span>
      </div>
    </div>
  );
}

export function Gauge({ pct, color = '#22d3ee' }: { pct: number; color?: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-panel2">
      <div
        className="bar-grow h-full rounded-full"
        style={{ width: `${Math.round(pct * 100)}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, boxShadow: `0 0 10px -1px ${color}` }}
      />
    </div>
  );
}
