import type { Metadata } from 'next';
import { Chakra_Petch, JetBrains_Mono, Sora } from 'next/font/google';
import './globals.css';

const display = Chakra_Petch({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-display' });
const mono = JetBrains_Mono({ subsets: ['latin'], weight: ['400', '500', '700'], variable: '--font-mono' });
const sans = Sora({ subsets: ['latin'], weight: ['300', '400', '500', '600', '700'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: 'TráfegoPRO — Command Center',
  description: 'Console da agência autônoma de Tráfego Pago & Google Ads operada por agentes de IA.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${display.variable} ${mono.variable} ${sans.variable}`}>
      <body>{children}</body>
    </html>
  );
}
