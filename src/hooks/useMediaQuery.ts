import { useEffect, useState } from 'react';

/**
 * Subscribes to a CSS media query and re-renders whenever it changes, so
 * device checks stay correct across resizes, rotations, and OS settings
 * (unlike a one-shot `window.innerWidth` check).
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.matchMedia(query).matches : false,
  );

  useEffect(() => {
    const mediaQueryList = window.matchMedia(query);
    const onChange = (event: MediaQueryListEvent) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener('change', onChange);
    return () => mediaQueryList.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}

/** Reactive mobile check (matches Tailwind's `md` breakpoint boundary). */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 767px)');
}

/** Reactive `prefers-reduced-motion` check. */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
