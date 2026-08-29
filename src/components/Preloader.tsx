import { Component as Loader3 } from '@/components/ui/loader-3';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import ParticleField from './ParticleField';

interface PreloaderProps {
  /** True once the hero's WebGL scene has rendered its first frame. */
  ready: boolean;
  /**
   * Called the moment the reveal transition starts, so the hero content can
   * animate in underneath the fading loader for a seamless hand-off.
   */
  onRevealStart: () => void;
}

const PHASES = [
  { until: 34, label: 'System initialization' },
  { until: 76, label: 'Constructing environment' },
  { until: 101, label: 'World activation' },
];

const MODULES = ['Render pipeline', 'Shader systems', 'Particle fields', 'Camera rig'];

/**
 * Cinematic boot sequence shown before the hero is revealed. It shares the
 * hero's visual language (particle drift, atmospheric orb, orbital rings) so
 * the reveal feels like the loader transforming into the real scene.
 *
 * Progress chases real readiness: it eases toward ~88% while the 3D scene
 * loads, then completes as soon as the first WebGL frame has rendered. A 6s
 * failsafe guarantees visitors are never trapped if WebGL is unavailable.
 */
export default function Preloader({ ready, onRevealStart }: PreloaderProps) {
  const reducedMotion = useReducedMotion() ?? false;
  const [progress, setProgress] = useState(0);
  const [exiting, setExiting] = useState(false);
  const [gone, setGone] = useState(false);
  const [forced, setForced] = useState(false);

  const isReady = ready || forced;
  const isReadyRef = useRef(isReady);
  isReadyRef.current = isReady;

  const revealRef = useRef(onRevealStart);
  revealRef.current = onRevealStart;

  // Failsafe: never trap the visitor if WebGL or the lazy chunk fails.
  useEffect(() => {
    const timeout = window.setTimeout(() => setForced(true), 6000);
    return () => window.clearTimeout(timeout);
  }, []);

  // Smoothly chase readiness; completes as soon as the scene is truly ready.
  useEffect(() => {
    let frame = 0;
    let value = 0;
    const start = performance.now();

    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const ceiling = isReadyRef.current ? 100 : Math.min(88, 18 + elapsed * 42);
      value += (ceiling - value) * 0.065;

      if (isReadyRef.current && value > 99.1) {
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

  // Let the hero start animating in the moment the reveal begins.
  useEffect(() => {
    if (exiting) revealRef.current();
  }, [exiting]);

  // Lock scrolling while the boot sequence is on screen.
  useEffect(() => {
    if (gone) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [gone]);

  if (gone) return null;

  const phase = PHASES.find((entry) => progress < entry.until) ?? PHASES[PHASES.length - 1];
  const moduleIndex = Math.min(Math.floor(progress / 26), MODULES.length - 1);

  return (
    <AnimatePresence onExitComplete={() => setGone(true)}>
      {!exiting && (
        <motion.div
          key="preloader"
          role="status"
          aria-live="polite"
          aria-label="Loading the portfolio experience"
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-[#0C0C0C]"
          exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 1.08, filter: 'blur(8px)' }}
          transition={{ duration: reducedMotion ? 0.3 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Phase 1 — initialization: particle drift + atmospheric light forming. */}
          <ParticleField className="absolute inset-0 h-full w-full opacity-70" />
          <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <motion.div
              className="hero-orb"
              initial={{ opacity: 0, scale: 0.55 }}
              animate={{ opacity: Math.min(1, progress / 55), scale: 0.55 + (progress / 100) * 0.45 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              aria-hidden="true"
            />
          </div>

          <div className="absolute left-6 top-6 z-10 text-[0.55rem] font-light uppercase tracking-[0.3em] text-[#D7E2EA]/35 sm:left-10 sm:top-8 sm:text-[0.65rem]">
            Saif Selme — Portfolio OS v2.0
          </div>

          {/* Phase 2 — construction: the new loader drives the center stage. */}
          <div className="relative z-10 flex flex-col items-center">
            <Loader3 className="pointer-events-none scale-[0.48] origin-center sm:scale-[0.62]" />

            {/* Phase 3 — activation readout. */}
            <div className="-mt-12 text-center sm:-mt-16">
              <p className="text-5xl font-black tabular-nums text-[#D7E2EA] sm:text-6xl">
                {progress}
                <span className="align-top text-lg font-light text-[#D7E2EA]/50">%</span>
              </p>
              <p className="mt-3 text-[0.6rem] font-light uppercase tracking-[0.4em] text-[#D7E2EA]/55 sm:text-xs">
                {phase.label}
              </p>
            </div>
          </div>

          <div className="absolute bottom-10 left-1/2 z-10 w-64 -translate-x-1/2 sm:w-80">
            <div className="h-px w-full overflow-hidden bg-white/10">
              <div
                className="h-full bg-gradient-to-r from-[#c9a6ff] via-[#e05fd0] to-[#ff9d5c] transition-[width] duration-200 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-[0.55rem] font-light uppercase tracking-[0.3em] text-[#D7E2EA]/40">
              <span>Enter portfolio</span>
              <span>{MODULES[moduleIndex]}</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
