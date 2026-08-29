import { useEffect, useState } from 'react';

export interface AppLocation {
  pathname: string;
  search: string;
  hash: string;
}

const snapshot = (): AppLocation => ({
  pathname: window.location.pathname,
  search: window.location.search,
  hash: window.location.hash,
});

export function navigate(to: string): void {
  if (typeof window === 'undefined') return;
  const target = new URL(to, window.location.origin);
  window.history.pushState({}, '', `${target.pathname}${target.search}${target.hash}`);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.setTimeout(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (target.hash) {
      document.getElementById(target.hash.slice(1))?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, 0);
}

export function useLocation(): AppLocation {
  const [location, setLocation] = useState<AppLocation>(() => snapshot());

  useEffect(() => {
    const update = () => setLocation(snapshot());
    window.addEventListener('popstate', update);
    window.addEventListener('hashchange', update);
    return () => {
      window.removeEventListener('popstate', update);
      window.removeEventListener('hashchange', update);
    };
  }, []);

  return location;
}

export function isInternalHref(href: string): boolean {
  return href.startsWith('/') && !href.startsWith('//');
}
