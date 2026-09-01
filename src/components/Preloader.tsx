import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface PreloaderProps {
  ready: boolean;
  onRevealStart?: () => void;
}

export default function Preloader({ ready, onRevealStart = () => undefined }: PreloaderProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const [forced, setForced] = useState(false);
  const readyRef = useRef(ready || forced);
  readyRef.current = ready || forced;
  const revealRef = useRef(onRevealStart);
  revealRef.current = onRevealStart;

  useEffect(() => {
    const timeout = window.setTimeout(() => setForced(true), 2800);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    let frame = 0;
    let value = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const ceiling = readyRef.current ? 100 : Math.min(88, 22 + elapsed * 42);
      value += (ceiling - value) * 0.1;
      if (readyRef.current && value > 99.2) {
        setProgress(100);
        setExiting(true);
        return;
      }
      setProgress(Math.round(value));
      frame = window.requestAnimationFrame(tick);
    };
    frame = window.requestAnimationFrame(tick);
    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (exiting) revealRef.current();
  }, [exiting]);

  useEffect(() => {
    if (gone) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [gone]);

  if (gone) return null;

  return (
    <AnimatePresence onExitComplete={() => setGone(true)}>
      {!exiting ? (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          aria-label="بنجهز SAIF STORE"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink text-paper"
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          transition={{ duration: reducedMotion ? 0.18 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="relative z-10 flex flex-col items-center px-6 text-center">
            <p className="eyebrow text-paper/40">SAIF STORE / CAIRO</p>
            <motion.h1
              initial={reducedMotion ? false : { opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.7 }}
              className="font-serif mt-6 text-[clamp(3.4rem,12vw,8rem)] font-medium leading-none tracking-[0.04em]"
            >
              SAIF
            </motion.h1>
            <p className="mt-3 font-display text-xs tracking-[0.42em] text-paper/55">STORE</p>
            <div className="mt-12 h-px w-48 overflow-hidden bg-paper/15 sm:w-64">
              <div className="h-full bg-paper transition-[width] duration-200 ease-out" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-4 font-display text-xs tabular-nums tracking-[0.18em] text-paper/40">{String(progress).padStart(2, '0')}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
