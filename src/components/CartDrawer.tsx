import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Minus, Plus, Trash2, X } from 'lucide-react';
import Link from './Link';
import { formatEGP } from '../lib/format';
import { cartLineLabel, cartLineTotal, useStore } from '../store/StoreProvider';

export default function CartDrawer() {
  const {
    cartItems,
    cartOpen,
    setCartOpen,
    cartSubtotal,
    deliveryFee,
    cartTotal,
    updateCartQuantity,
    removeFromCart,
  } = useStore();

  return (
    <AnimatePresence>
      {cartOpen ? (
        <>
          <motion.button
            type="button"
            aria-label="اقفل السلة"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-[70] bg-ink/45 backdrop-blur-[2px]"
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 330, damping: 34 }}
            className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-[470px] flex-col bg-paper text-ink shadow-2xl"
            aria-label="السلة"
          >
            <div className="flex items-center justify-between border-b border-ink/10 px-5 py-5 sm:px-7">
              <div>
                <p className="eyebrow text-ink/50">SAIF / BAG</p>
                <h2 className="mt-1 text-xl font-bold">السلة <span className="text-ink/40">({cartItems.length})</span></h2>
              </div>
              <button type="button" onClick={() => setCartOpen(false)} aria-label="اقفل السلة" className="icon-button">
                <X size={20} />
              </button>
            </div>

            {cartItems.length ? (
              <>
                <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                  <div className="space-y-5">
                    {cartItems.map((item) => (
                      <article key={`${item.product.id}-${item.size}-${item.color}`} className="flex gap-3 border-b border-ink/10 pb-5">
                        <Link to={`/product/${item.product.slug}`} onClick={() => setCartOpen(false)} className="h-24 w-20 shrink-0 overflow-hidden bg-fog">
                          <img src={item.product.images[0]} alt={item.product.name} className="h-full w-full object-cover grayscale" />
                        </Link>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link to={`/product/${item.product.slug}`} onClick={() => setCartOpen(false)} className="line-clamp-2 text-sm font-bold hover:underline">
                                {item.product.name}
                              </Link>
                              <p className="mt-1 text-xs text-ink/50">{cartLineLabel(item).replace(`${item.product.name} — `, '') || 'اختيار أساسي'}</p>
                            </div>
                            <button type="button" onClick={() => removeFromCart(item.product.id, item.size, item.color)} aria-label={`احذف ${item.product.name}`} className="text-ink/40 transition-colors hover:text-ink">
                              <Trash2 size={16} />
                            </button>
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="flex items-center rounded-full border border-ink/15 p-1">
                              <button type="button" onClick={() => updateCartQuantity(item.product.id, item.quantity - 1, item.size, item.color)} aria-label="قلل الكمية" className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-ink hover:text-paper"><Minus size={12} /></button>
                              <span className="w-7 text-center text-xs font-bold tabular-nums">{item.quantity}</span>
                              <button type="button" onClick={() => updateCartQuantity(item.product.id, item.quantity + 1, item.size, item.color)} aria-label="زود الكمية" className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-ink hover:text-paper"><Plus size={12} /></button>
                            </div>
                            <span className="text-sm font-bold">{cartLineTotal(item)}</span>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
                <div className="border-t border-ink/10 px-5 pb-6 pt-5 sm:px-7">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-ink/60"><span>إجمالي المنتجات</span><span>{formatEGP(cartSubtotal)}</span></div>
                    <div className="flex justify-between text-ink/60"><span>مصاريف التوصيل</span><span>{formatEGP(deliveryFee)}</span></div>
                    <div className="mt-3 flex justify-between border-t border-ink/10 pt-3 text-base font-bold"><span>الإجمالي</span><span>{formatEGP(cartTotal)}</span></div>
                  </div>
                  <Link to="/checkout" onClick={() => setCartOpen(false)} className="button-dark mt-5 w-full justify-between">
                    <span>كمل طلبك</span><ArrowLeft size={17} />
                  </Link>
                  <Link to="/cart" onClick={() => setCartOpen(false)} className="mt-3 block text-center text-sm font-semibold text-ink/55 underline-offset-4 hover:text-ink hover:underline">عرض السلة كاملة</Link>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-ink/15"><ShoppingBagIcon /></div>
                <h3 className="mt-5 text-xl font-bold">السلة مستنياك</h3>
                <p className="mt-2 max-w-xs text-sm leading-7 text-ink/55">اختار قطعة تعجبك، وإحنا هنحطها هنا لحد ما تبقى جاهز.</p>
                <Link to="/products" onClick={() => setCartOpen(false)} className="button-dark mt-7">شوف التشكيلة <ArrowLeft size={17} /></Link>
              </div>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function ShoppingBagIcon() {
  return <span className="font-display text-2xl tracking-[0.1em]">S</span>;
}
