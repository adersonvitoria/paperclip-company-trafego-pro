import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
      colors: {
        bg: '#05070e',
        bg2: '#0a1020',
        panel: '#0e1526',
        panel2: '#121b30',
        line: '#1d2942',
        muted: '#8595b4',
        accent: '#22d3ee',
        accent2: '#34d399',
        matrix: '#4ade80',
        gold: '#fbbf24',
        violet: '#a78bfa',
      },
      boxShadow: {
        glow: '0 0 24px -4px rgba(34,211,238,0.35)',
        glow2: '0 0 24px -4px rgba(52,211,153,0.35)',
      },
    },
  },
  plugins: [],
};

export default config;
