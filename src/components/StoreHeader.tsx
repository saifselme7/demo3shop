import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { categoryPath } from '../lib/format';
import Link from './Link';
import LogoMark from './LogoMark';
import { useStore } from '../store/StoreProvider';

const NAV_LINKS = [
  { label: 'الرئيسية', to: '/' },
  { label: 'التشكيلة', to: '/products' },
  { label: 'حكاية SAIF', to: '/#story' },
];

export default function StoreHeader() {
  const { settings, categories, cartCount, setCartOpen } = useStore();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6 lg:px-8">
      <div className="store-header mx-auto flex max-w-[1440px] items-center justify-between gap-5 rounded-full border border-black/10 bg-paper/95 px-4 py-3 text-ink shadow-[0_10px_30px_rgba(17,17,17,0.08)] backdrop-blur-xl sm:px-6">
        <Link to="/" aria-label="SAIF STORE - الرئيسية" onClick={close} className="shrink-0">
          <LogoMark settings={settings} />
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label="التنقل الرئيسي">
          {NAV_LINKS.map((link) => (
            <Link key={link.to} to={link.to} className="header-link text-sm font-semibold text-ink/65 transition-colors hover:text-ink">
              {link.label}
            </Link>
          ))}
          <span className="h-4 w-px bg-ink/15" aria-hidden="true" />
          <Link to={categoryPath('hoodies')} className="header-link text-sm font-semibold text-ink/65 transition-colors hover:text-ink">
            هودي الموسم
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink/15 text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            aria-label={`افتح السلة، ${cartCount} منتجات`}
          >
            <ShoppingBag size={18} strokeWidth={1.7} />
            {cartCount > 0 ? (
              <motion.span
                key={cartCount}
                initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-ink px-1 text-[0.65rem] font-bold text-paper"
              >
                {cartCount > 99 ? '٩٩+' : cartCount}
              </motion.span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-ink text-paper transition-transform active:scale-95 lg:hidden"
            aria-label={open ? 'اقفل القائمة' : 'افتح القائمة'}
            aria-expanded={open}
          >
            {open ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={reducedMotion ? { duration: 0.01 } : { duration: 0.24, ease: 'easeOut' }}
            className="mx-auto mt-2 max-w-[1440px] rounded-[28px] border border-black/10 bg-paper p-3 text-ink shadow-editorial lg:hidden"
          >
            <nav className="flex flex-col" aria-label="قائمة الموبايل">
              {NAV_LINKS.map((link) => (
                <Link key={link.to} to={link.to} onClick={close} className="rounded-2xl px-4 py-3.5 text-base font-semibold transition-colors hover:bg-ink/5">
                  {link.label}
                </Link>
              ))}
              <div className="my-2 h-px bg-ink/10" />
              {categories.slice(0, 4).map((category) => (
                <Link key={category.id} to={categoryPath(category.slug)} onClick={close} className="rounded-2xl px-4 py-3 text-sm font-medium text-ink/65 transition-colors hover:bg-ink/5 hover:text-ink">
                  {category.name}
                </Link>
              ))}
              <button type="button" onClick={() => { setCartOpen(true); close(); }} className="mt-2 flex items-center justify-between rounded-2xl bg-ink px-4 py-3.5 text-sm font-bold text-paper">
                <span>افتح السلة</span>
                <span>{cartCount ? `${cartCount} منتجات` : 'لسه فاضية'}</span>
              </button>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
