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
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {settings.logoUrl && !logoFailed ? (
        <img src={settings.logoUrl} alt={settings.storeName} onError={() => setLogoFailed(true)} className="h-8 w-auto object-contain" />
      ) : (
        <span className="font-display text-2xl font-bold leading-none tracking-[0.08em]">SAIF</span>
      )}
      <span className={`h-1.5 w-1.5 rounded-full ${light ? 'bg-paper' : 'bg-ink'}`} aria-hidden="true" />
      <span className="font-display text-[0.7rem] font-medium tracking-[0.18em]">STORE</span>
    </span>
  );
}
