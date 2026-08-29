interface SectionLabelProps {
  index: string;
  children: string;
  light?: boolean;
}

export default function SectionLabel({ index, children, light = false }: SectionLabelProps) {
  return (
    <div className={`flex items-center gap-3 text-xs font-semibold tracking-[0.12em] ${light ? 'text-paper/55' : 'text-ink/50'}`}>
      <span className={`font-display text-[0.7rem] ${light ? 'text-paper' : 'text-ink'}`}>{index}</span>
      <span className={`h-px w-8 ${light ? 'bg-paper/30' : 'bg-ink/25'}`} aria-hidden="true" />
      <span>{children}</span>
    </div>
  );
}
