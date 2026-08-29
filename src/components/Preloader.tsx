import { Component as Loader3 } from '@/components/ui/loader-3';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ParticleField from './ParticleField';

interface PreloaderProps {
  ready: boolean;
  onRevealStart?: () => void;
}

const PHASES = [{ until: 34, label: 'بنجهز المساحة' }, { until: 76, label: 'بنرتّب التشكيلة' }, { until: 101, label: 'المتجر جاهز' }];
const MODULES = ['الهوية', 'التفاصيل', 'التشكيلة', 'SAIF STORE'];

/** Adapted from the portfolio loader: same cinematic hand-off, new brand voice. */
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

  useEffect(() => { const timeout = window.setTimeout(() => setForced(true), 3500); return () => window.clearTimeout(timeout); }, []);
  useEffect(() => { let frame = 0; let value = 0; const start = performance.now(); const tick = (now: number) => { const elapsed = (now - start) / 1000; const ceiling = readyRef.current ? 100 : Math.min(88, 18 + elapsed * 34); value += (ceiling - value) * 0.085; if (readyRef.current && value > 99.2) { setProgress(100); setExiting(true); return; } setProgress(Math.round(value)); frame = window.requestAnimationFrame(tick); }; frame = window.requestAnimationFrame(tick); return () => window.cancelAnimationFrame(frame); }, []);
  useEffect(() => { if (exiting) revealRef.current(); }, [exiting]);
  useEffect(() => { if (gone) return undefined; const previous = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = previous; }; }, [gone]);
  if (gone) return null;
  const phase = PHASES.find((entry) => progress < entry.until) ?? PHASES[PHASES.length - 1];
  const moduleIndex = Math.min(Math.floor(progress / 26), MODULES.length - 1);

  return <AnimatePresence onExitComplete={() => setGone(true)}>{!exiting ? <motion.div key="preloader" role="status" aria-live="polite" aria-label="بنجهز SAIF STORE" className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-ink text-paper" exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.04, filter: 'blur(7px)' }} transition={{ duration: reducedMotion ? 0.2 : 0.75, ease: [0.22, 1, 0.36, 1] }}><ParticleField className="absolute inset-0 h-full w-full opacity-40" /><div className="preloader-lines absolute inset-0" aria-hidden="true" /><div className="absolute right-6 top-6 z-10 text-[0.6rem] font-semibold tracking-[0.18em] text-paper/35 sm:right-10 sm:top-8">SAIF STORE / DROP 026</div><div className="relative z-10 flex flex-col items-center"><Loader3 className="origin-center scale-[0.46] grayscale sm:scale-[0.58]" /><div className="-mt-12 text-center sm:-mt-16"><p className="font-display text-5xl font-bold tabular-nums sm:text-6xl">{progress}<span className="mr-1 align-top text-lg font-normal text-paper/45">٪</span></p><p className="mt-3 text-xs font-semibold tracking-[0.16em] text-paper/50">{phase.label}</p></div></div><div className="absolute bottom-10 left-1/2 z-10 w-64 -translate-x-1/2 sm:w-80"><div className="h-px w-full overflow-hidden bg-paper/15"><div className="h-full bg-paper transition-[width] duration-200 ease-out" style={{ width: `${progress}%` }} /></div><div className="mt-3 flex items-center justify-between text-[0.6rem] font-semibold tracking-[0.12em] text-paper/35"><span>ادخل المتجر</span><span>{MODULES[moduleIndex]}</span></div></div></motion.div> : null}</AnimatePresence>;
}
