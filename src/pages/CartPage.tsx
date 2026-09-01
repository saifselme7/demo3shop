import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import CartSummary from '../components/CartSummary';
import FadeIn from '../components/FadeIn';
import Link from '../components/Link';
import SectionLabel from '../components/SectionLabel';
import SafeImage from '../components/SafeImage';
import { formatEGP } from '../lib/format';
import { cartLineLabel, useStore } from '../store/StoreProvider';

export default function CartPage() {
  const { cartItems, updateCartQuantity, removeFromCart } = useStore();
  const reducedMotion = useReducedMotion();

  return (
    <main className="bg-paper px-5 pb-24 pt-28 text-ink sm:px-8 sm:pb-32 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <FadeIn>
          <SectionLabel index="BAG">مشترياتك</SectionLabel>
          <h1 className="mt-6 text-[clamp(3rem,8vw,7.2rem)] font-bold leading-[0.9] tracking-[-0.05em]">السلة</h1>
        </FadeIn>
        {cartItems.length ? (
          <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
            <div>
              {cartItems.map((item, index) => (
                <motion.article
                  key={`${item.product.id}-${item.size}-${item.color}`}
                  initial={reducedMotion ? false : { opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: reducedMotion ? 0 : index * 0.05, duration: reducedMotion ? 0.01 : undefined }}
                  className="flex gap-4 border-t border-ink/10 py-6 sm:gap-6"
                >
                  <Link to={`/product/${item.product.slug}`} className="h-32 w-24 shrink-0 overflow-hidden bg-fog sm:h-44 sm:w-32">
                    <SafeImage src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col justify-between gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium text-ink/45">{item.product.categoryName}</p>
                        <Link to={`/product/${item.product.slug}`} className="mt-1 block text-sm font-bold leading-6 hover:underline sm:text-lg">{item.product.name}</Link>
                        <p className="mt-1 text-xs text-ink/50">{cartLineLabel(item).replace(`${item.product.name} — `, '') || 'اختيار أساسي'}</p>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.product.id, item.size, item.color)} className="text-ink/40 transition-colors hover:text-ink" aria-label={`احذف ${item.product.name}`}>
                        <Trash2 size={17} />
                      </button>
                    </div>
                    <div className="flex items-end justify-between gap-4">
                      <div className="flex items-center border border-ink/15 p-1">
                        <button type="button" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.size, item.color)} aria-label="قلل الكمية" className="flex h-8 w-8 items-center justify-center hover:bg-ink hover:text-paper"><Minus size={12} /></button>
                        <span className="w-8 text-center text-xs font-bold">{item.quantity}</span>
                        <button type="button" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.size, item.color)} aria-label="زود الكمية" className="flex h-8 w-8 items-center justify-center hover:bg-ink hover:text-paper"><Plus size={12} /></button>
                      </div>
                      <span className="text-sm font-bold sm:text-base">{formatEGP(item.product.price * item.quantity)}</span>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
            <div>
              <CartSummary />
              <Link to="/products" className="mt-7 flex items-center justify-center gap-2 text-sm font-bold text-ink/55 hover:text-ink">كمّل تسوق <ArrowLeft size={16} /></Link>
            </div>
          </div>
        ) : (
          <FadeIn y={24} className="empty-state mt-14">
            <p className="text-2xl font-bold">السلة فاضية دلوقتي.</p>
            <p className="mt-3 text-sm leading-7 text-ink/50">ابدأ بقطعة أساسية تفضل معاك.</p>
            <Link to="/products" className="button-dark mt-8">اكتشف المجموعة <ArrowLeft size={17} /></Link>
          </FadeIn>
        )}
      </div>
    </main>
  );
}
