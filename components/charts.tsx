// Componentes de gráfico em SVG puro — renderizam no servidor, sem dependência.

export function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: string }) {
  return (
    <div className="card">
      <p className="label">{label}</p>
      <p className="text-3xl font-extrabold" style={accent ? { color: accent } : undefined}>{value}</p>
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
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle cx={cx} cy={cx} r={r} fill="none" stroke="#232d45" strokeWidth={stroke} />
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
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
                transform={`rotate(-90 ${cx} ${cx})`}
              />
            );
            offset += len;
            return el;
          })}
        <text x={cx} y={cx - 4} textAnchor="middle" className="fill-white" style={{ fontSize: 26, fontWeight: 800 }}>{total}</text>
        <text x={cx} y={cx + 16} textAnchor="middle" style={{ fontSize: 11, fill: '#93a0b8' }}>total</text>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {data.map((d, i) => (
          <li key={i} className="flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-sm" style={{ background: d.color }} />
            <span className="text-slate-300">{d.label}</span>
            <span className="ml-auto font-semibold">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function BarChart({ data, color = '#4f8cff', unit = '' }: { data: Array<{ label: string; value: number }>; color?: string; unit?: string }) {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="space-y-2">
      {data.map((d, i) => (
        <div key={i} className="flex items-center gap-3 text-sm">
          <span className="w-44 shrink-0 truncate text-slate-300" title={d.label}>{d.label}</span>
          <div className="relative h-5 flex-1 overflow-hidden rounded bg-panel2">
            <div className="h-full rounded" style={{ width: `${(d.value / max) * 100}%`, background: color, minWidth: d.value > 0 ? 4 : 0 }} />
          </div>
          <span className="w-12 shrink-0 text-right font-semibold">{d.value}{unit}</span>
        </div>
      ))}
    </div>
  );
}

export function Sparkbars({ data, color = '#34d399' }: { data: Array<{ day: string; count: number }>; color?: string }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end gap-1.5" style={{ height: 90 }}>
      {data.map((d, i) => (
        <div key={i} className="group flex flex-1 flex-col items-center justify-end gap-1" title={`${d.day}: ${d.count}`}>
          <div
            className="w-full rounded-t"
            style={{ height: `${(d.count / max) * 72}px`, background: d.count > 0 ? color : '#232d45', minHeight: 2 }}
          />
          <span className="text-[9px] text-slate-500">{d.day}</span>
        </div>
      ))}
    </div>
  );
}

// Barra de progresso para uma proporção 0..1
export function Gauge({ pct, color = '#4f8cff' }: { pct: number; color?: string }) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-panel2">
      <div className="h-full rounded-full" style={{ width: `${Math.round(pct * 100)}%`, background: color }} />
    </div>
  );
}
