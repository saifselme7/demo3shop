import type { StoreSettings } from '../types/store';

interface LogoMarkProps {
  settings: StoreSettings;
  light?: boolean;
  className?: string;
}

export default function LogoMark({ settings, light = false, className = '' }: LogoMarkProps) {
  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      {settings.logoUrl ? (
        <img src={settings.logoUrl} alt={settings.storeName} className="h-8 w-auto object-contain" />
      ) : (
        <span className="font-display text-2xl font-bold leading-none tracking-[0.08em]">SAIF</span>
      )}
      <span className={`h-1.5 w-1.5 rounded-full ${light ? 'bg-paper' : 'bg-ink'}`} aria-hidden="true" />
      <span className="font-display text-[0.7rem] font-medium tracking-[0.18em]">STORE</span>
    </span>
  );
}
