import { redirect } from 'next/navigation';
import { authConfigured, checkPassword, createSession, getSession } from '@/lib/auth';
import { MatrixRain } from '@/components/matrix-rain';

export const dynamic = 'force-dynamic';

async function loginAction(formData: FormData) {
  'use server';
  const password = String(formData.get('password') ?? '');
  if (!checkPassword(password)) {
    redirect('/login?erro=1');
  }
  await createSession();
  redirect('/');
}

export default async function LoginPage({ searchParams }: { searchParams: { erro?: string } }) {
  if (await getSession()) redirect('/');
  const configured = authConfigured();

  return (
    <main className="relative flex min-h-screen items-center justify-center px-4">
      <MatrixRain opacity={0.16} />
      <div className="card reveal relative z-10 w-full max-w-sm">
        <div className="mb-6 text-center">
          <p className="mb-3 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-muted">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent2 live-dot" /> secure access
          </p>
          <div className="text-3xl font-extrabold font-display">
            Tráfego<span className="text-accent glow-text">PRO</span>
          </div>
          <p className="mt-1 text-sm text-muted">Command center — Tráfego Pago &amp; Google Ads por agentes de IA</p>
        </div>

        {!configured ? (
          <p className="rounded-lg border border-gold/40 bg-gold/10 p-3 text-sm text-gold">
            O login ainda não foi habilitado: defina as variáveis <code>ADMIN_PASSWORD</code> e <code>AUTH_SECRET</code> no ambiente (Vercel → Settings → Environment Variables) e faça redeploy.
          </p>
        ) : (
          <form action={loginAction} className="space-y-4">
            <div>
              <label className="label" htmlFor="password">Senha de acesso</label>
              <input id="password" name="password" type="password" required autoFocus className="input" placeholder="••••••••" />
            </div>
            {searchParams.erro && <p className="text-sm text-red-400">Senha incorreta. Tente novamente.</p>}
            <button type="submit" className="btn w-full">Entrar</button>
          </form>
        )}
      </div>
    </main>
  );
}
