import Link from 'next/link';
import { redirect } from 'next/navigation';
import { clearSession, getSession } from '@/lib/auth';
import { MatrixRain } from '@/components/matrix-rain';

export const dynamic = 'force-dynamic';

async function logoutAction() {
  'use server';
  clearSession();
  redirect('/login');
}

const NAV = [
  { href: '/', label: 'Visão Geral', icon: '◵' },
  { href: '/dashboard', label: 'Dashboard', icon: '▦' },
  { href: '/pipelines', label: 'Pipelines', icon: '⛓' },
  { href: '/conta', label: 'Conta Google Ads', icon: '◎' },
  { href: '/agentes', label: 'Agentes', icon: '⬡' },
  { href: '/configuracoes', label: 'Configurações', icon: '⚙' },
];

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="relative min-h-screen md:flex">
      <MatrixRain opacity={0.08} />

      <aside className="relative z-10 border-b border-line bg-panel/70 px-4 py-5 backdrop-blur-xl md:flex md:min-h-screen md:w-64 md:flex-col">
        <div className="mb-1 flex items-center gap-2 md:mb-6">
          <span className="text-xl font-extrabold font-display tracking-tight">
            Tráfego<span className="text-accent glow-text">PRO</span>
          </span>
        </div>
        <p className="mb-5 hidden font-mono text-[10px] uppercase tracking-[0.2em] text-muted md:flex md:items-center md:gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent2 live-dot" /> command center
        </p>

        <nav className="flex flex-1 flex-wrap gap-1 md:flex-col">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-colors hover:bg-accent/10 hover:text-white"
            >
              <span className="font-mono text-accent/70 transition-colors group-hover:text-accent">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <form action={logoutAction} className="mt-4">
          <button type="submit" className="btn-ghost w-full text-xs">Sair</button>
        </form>
      </aside>

      <main className="relative z-10 w-full flex-1 px-4 py-6 md:px-8 lg:px-10">{children}</main>
    </div>
  );
}
