'use client';

import { useEffect, useRef } from 'react';

// Chuva de código estilo Matrix — fundo fixo, sutil, atrás do conteúdo.
// Pausa quando a aba some e respeita prefers-reduced-motion.
export function MatrixRain({ opacity = 0.1 }: { opacity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const canvas: HTMLCanvasElement = cv;
    const c2d: CanvasRenderingContext2D = ctx;

    const GLYPHS = 'アイウエオカキクケコサシスセソﾀﾁﾂﾃﾄ0123456789ABCDEF$%#@<>/=+'.split('');
    const FONT = 15;
    let cols = 0;
    let drops: number[] = [];
    let raf = 0;
    let last = 0;

    function resize() {
      canvas.width = Math.floor(window.innerWidth * devicePixelRatio);
      canvas.height = Math.floor(window.innerHeight * devicePixelRatio);
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      c2d.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
      cols = Math.floor(window.innerWidth / FONT);
      drops = Array.from({ length: cols }, () => Math.floor((Math.random() * -window.innerHeight) / FONT));
    }

    function frame(t: number) {
      raf = requestAnimationFrame(frame);
      if (t - last < 55) return; // ~18fps: leve e elegante
      last = t;
      c2d.fillStyle = 'rgba(5, 7, 14, 0.16)'; // rastro
      c2d.fillRect(0, 0, window.innerWidth, window.innerHeight);
      c2d.font = `${FONT}px var(--font-mono), monospace`;
      for (let i = 0; i < drops.length; i++) {
        const ch = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        const x = i * FONT;
        const y = drops[i] * FONT;
        // cabeça mais clara, cauda verde
        c2d.fillStyle = Math.random() > 0.975 ? '#cffafe' : '#34d399';
        c2d.fillText(ch, x, y);
        if (y > window.innerHeight && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
      }
    }

    function onVisibility() {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0"
      style={{ opacity }}
    />
  );
}
