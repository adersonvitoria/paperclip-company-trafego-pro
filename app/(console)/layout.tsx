import Link from 'next/link';
import { redirect } from 'next/navigation';
import { clearSession, getSession } from '@/lib/auth';

export const dynamic = 'force-dynamic';

async function logoutAction() {
  'use server';
  clearSession();
  redirect('/login');
}

const NAV = [
  { href: '/', label: 'Visão Geral' },
  { href: '/pipelines', label: 'Pipelines' },
  { href: '/agentes', label: 'Agentes' },
  { href: '/configuracoes', label: 'Configurações' },
];

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-screen md:flex">
      <aside className="md:w-60 md:min-h-screen border-b md:border-b-0 md:border-r border-line bg-panel px-4 py-5 flex md:flex-col items-center md:items-stretch gap-4">
        <div className="text-xl font-extrabold md:mb-4">
          Tráfego<span className="text-accent">PRO</span>
        </div>
        <nav className="flex md:flex-col gap-1 flex-1">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-panel2 hover:text-white">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button type="submit" className="btn-ghost text-xs">Sair</button>
        </form>
      </aside>
      <main className="flex-1 px-4 md:px-8 py-6 max-w-5xl">{children}</main>
    </div>
  );
}
