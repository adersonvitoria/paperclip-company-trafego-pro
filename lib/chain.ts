import 'server-only';

// Encadeamento server-side: ao terminar uma etapa em modo auto, o próprio
// servidor dispara a próxima execução numa NOVA invocação de função (não
// depende de aba aberta). O segredo interno autentica a chamada self-to-self.

export function internalSecret(): string {
  return process.env.AUTH_SECRET ?? '';
}

// Dispara a próxima etapa. A requisição é enviada e abortada após ~3s — tempo
// suficiente para a Vercel rotear e iniciar uma invocação NOVA e independente,
// que roda a próxima etapa por completo no servidor. Aguardar o abort (curto)
// garante que a requisição saia antes de a função atual congelar.
export async function triggerNextStep(origin: string, runId: string): Promise<void> {
  try {
    await fetch(`${origin}/api/runs/${runId}/advance`, {
      method: 'POST',
      headers: { 'x-internal-trigger': internalSecret() },
      signal: AbortSignal.timeout(3000),
    });
  } catch {
    // Esperado: abortamos o cliente cedo; a invocação recebedora continua sozinha.
  }
}
