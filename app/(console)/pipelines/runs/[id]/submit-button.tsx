'use client';

import { useFormStatus } from 'react-dom';

export function ExecuteStepButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <>
      <button type="submit" className="btn" disabled={pending}>
        {pending ? (
          <>
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
            Executando — pode levar alguns minutos...
          </>
        ) : (
          label
        )}
      </button>
      <p className="mt-2 text-xs text-muted">
        {pending
          ? 'O agente está trabalhando na API da Anthropic. Não feche nem recarregue a página — ela atualiza sozinha ao terminar.'
          : 'A etapa roda na API da Anthropic e pode levar de 1 a 5 minutos.'}
      </p>
    </>
  );
}
