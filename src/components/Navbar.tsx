import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';

const LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Journey', href: '#journey' },
  { label: 'Skills', href: '#skills' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
];

/**
 * Fixed glassmorphism navigation bar with smooth-scroll anchor links and an
 * animated mobile menu.
 */
export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 md:px-8 md:pt-5">
      <div className="glass mx-auto flex max-w-6xl items-center justify-between rounded-full px-5 py-3 md:px-8">
        <a
          href="#home"
          className="flex items-center gap-2 text-sm font-bold uppercase tracking-[0.2em] text-[#D7E2EA]"
        >
          Saif Selme
          <span
            className="inline-block h-1.5 w-1.5 rounded-full"
            style={{ background: 'linear-gradient(123deg, #B600A8, #BE4C00)' }}
            aria-hidden="true"
          />
        </a>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-xs font-medium uppercase tracking-[0.2em] text-[#D7E2EA]/70 transition-colors duration-200 hover:text-[#D7E2EA]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((value) => !value)}
          className="text-[#D7E2EA] md:hidden"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="glass mx-auto mt-2 flex max-w-6xl flex-col gap-1 rounded-3xl p-4 md:hidden"
            aria-label="Mobile"
          >
            {LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-2xl px-4 py-3 text-sm font-medium uppercase tracking-[0.2em] text-[#D7E2EA]/80 transition-colors duration-200 hover:bg-white/5 hover:text-[#D7E2EA]"
              >
                {link.label}
              </a>
            ))}
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
