import { useEffect, useState } from 'react';
import type { StoreSettings } from '../types/store';

interface LogoMarkProps {
  settings: StoreSettings;
  light?: boolean;
  className?: string;
}

export default function LogoMark({ settings, light = false, className = '' }: LogoMarkProps) {
  const [logoFailed, setLogoFailed] = useState(false);
  useEffect(() => setLogoFailed(false), [settings.logoUrl]);

  return (
    <span className={`inline-flex items-center gap-3 ${light ? 'text-paper' : 'text-ink'} ${className}`}>
      {settings.logoUrl && !logoFailed ? (
        <img src={settings.logoUrl} alt={settings.storeName} onError={() => setLogoFailed(true)} className="h-8 w-auto object-contain" />
      ) : (
        <span className="font-serif text-[1.65rem] font-semibold leading-none tracking-[0.06em]">SAIF</span>
      )}
      <span className={`h-1 w-1 ${light ? 'bg-paper' : 'bg-ink'}`} aria-hidden="true" />
      <span className="hidden font-display text-[0.68rem] font-medium tracking-[0.28em] min-[380px]:inline">STORE</span>
    </span>
  );
}
