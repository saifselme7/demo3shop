interface LiveProjectButtonProps {
  className?: string;
  href?: string;
  label?: string;
  /** Opens the link in a new tab when true. */
  external?: boolean;
}

export default function LiveProjectButton({
  className = '',
  href = '#projects',
  label = 'Live Project',
  external = false,
}: LiveProjectButtonProps) {
  return (
    <a
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`inline-block rounded-full border-2 border-[#D7E2EA] px-8 py-3 text-sm font-medium uppercase tracking-widest text-[#D7E2EA] transition-colors duration-200 hover:bg-[#D7E2EA]/10 sm:px-10 sm:py-3.5 sm:text-base ${className}`}
    >
      {label}
    </a>
  );
}
