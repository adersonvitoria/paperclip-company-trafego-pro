import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0b0f17',
        panel: '#121826',
        panel2: '#161e30',
        line: '#232d45',
        muted: '#93a0b8',
        accent: '#4f8cff',
        accent2: '#34d399',
        gold: '#fbbf24',
      },
    },
  },
  plugins: [],
};

export default config;
