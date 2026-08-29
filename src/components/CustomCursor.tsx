import { useEffect, useRef, useState } from 'react';

/**
 * Elegant two-layer custom cursor: an instant dot plus a trailing ring that
 * expands over interactive elements. Only activates on fine-pointer devices
 * and respects the reduced-motion preference.
 */
export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!finePointer || reduceMotion) return;

    setEnabled(true);
    document.body.classList.add('has-custom-cursor');

    let x = 0;
    let y = 0;
    let ringX = 0;
    let ringY = 0;
    let hovering = false;
    let frameId = 0;

    const handleMove = (event: globalThis.MouseEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    };

    const handleOver = (event: globalThis.MouseEvent) => {
      const target = event.target as HTMLElement | null;
      hovering = Boolean(target?.closest('a, button'));
    };

    const loop = () => {
      ringX += (x - ringX) * 0.16;
      ringY += (y - ringY) * 0.16;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) scale(${hovering ? 1.7 : 1})`;
      }
      frameId = window.requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', handleMove, { passive: true });
    window.addEventListener('mouseover', handleOver, { passive: true });
    frameId = window.requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseover', handleOver);
      window.cancelAnimationFrame(frameId);
      document.body.classList.remove('has-custom-cursor');
    };
  }, []);

  if (!enabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[100]" aria-hidden="true">
      <div ref={ringRef} className="cursor-ring" />
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
