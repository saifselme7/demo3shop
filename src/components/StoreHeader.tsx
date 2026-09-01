import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Menu, ShoppingBag, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { categoryPath } from '../lib/format';
import { fashionNavCategories } from '../lib/storefront';
import Link from './Link';
import LogoMark from './LogoMark';
import { useStore } from '../store/StoreProvider';

export default function StoreHeader() {
  const { settings, categories, cartCount, setCartOpen } = useStore();
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const navCategories = fashionNavCategories(categories).slice(0, 6);

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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-paper/10 bg-ink/80 text-paper backdrop-blur-md">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3.5 sm:px-8 lg:px-12">
        <Link to="/" aria-label="SAIF STORE - الرئيسية" onClick={close} className="shrink-0 text-paper">
          <LogoMark settings={settings} light />
        </Link>

        <nav className="hidden items-center gap-6 xl:flex" aria-label="التنقل الرئيسي">
          <Link to="/" className="header-link text-[0.8rem] font-semibold text-paper/70 hover:text-paper">الرئيسية</Link>
          <Link to="/products" className="header-link text-[0.8rem] font-semibold text-paper/70 hover:text-paper">تسوق</Link>
          {navCategories.map((category) => (
            <Link key={category.id} to={categoryPath(category.slug)} className="header-link text-[0.8rem] font-semibold text-paper/70 hover:text-paper">
              {category.name}
            </Link>
          ))}
          <Link to="/products?sort=newest" className="header-link text-[0.8rem] font-semibold text-paper/70 hover:text-paper">الجديد</Link>
          <Link to="/products" className="header-link text-[0.8rem] font-semibold text-paper/70 hover:text-paper">الأكثر مبيعًا</Link>
        </nav>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCartOpen(true)}
            className="relative inline-flex h-11 w-11 items-center justify-center text-paper transition-colors hover:bg-paper/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-paper"
            aria-label={`افتح السلة، ${cartCount} منتجات`}
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            {cartCount > 0 ? (
              <motion.span
                key={cartCount}
                initial={reducedMotion ? false : { scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute left-1 top-1 flex h-4 min-w-4 items-center justify-center bg-paper px-1 text-[0.6rem] font-bold text-ink"
              >
                {cartCount > 99 ? '٩٩+' : cartCount}
              </motion.span>
            ) : null}
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center text-paper hover:bg-paper/10 xl:hidden"
            aria-label={open ? 'اقفل القائمة' : 'افتح القائمة'}
            aria-expanded={open}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={reducedMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reducedMotion ? { opacity: 1 } : { opacity: 0 }}
            className="fixed inset-0 top-[57px] z-40 bg-ink text-paper xl:hidden"
          >
            <nav className="flex h-full flex-col overflow-y-auto px-6 py-8" aria-label="قائمة الموبايل">
              <Link to="/" onClick={close} className="border-b border-paper/10 py-4 text-2xl font-bold">الرئيسية</Link>
              <Link to="/products" onClick={close} className="border-b border-paper/10 py-4 text-2xl font-bold">تسوق</Link>
              {navCategories.map((category) => (
                <Link key={category.id} to={categoryPath(category.slug)} onClick={close} className="border-b border-paper/10 py-4 text-xl font-semibold text-paper/80">
                  {category.name}
                </Link>
              ))}
              <Link to="/products" onClick={close} className="border-b border-paper/10 py-4 text-xl font-semibold">الجديد</Link>
              <Link to="/track" onClick={close} className="py-4 text-base text-paper/55">تتبع طلبك</Link>
              <button
                type="button"
                onClick={() => { setCartOpen(true); close(); }}
                className="button-light mt-8 w-full justify-between"
              >
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
