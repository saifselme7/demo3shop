import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { formatEGP, productDiscount, productPath } from '../lib/format';
import type { Product } from '../types/store';
import { useStore } from '../store/StoreProvider';
import Link from './Link';
import SafeImage from './SafeImage';

interface ProductCardProps {
  product: Product;
  index?: number;
  feature?: boolean;
}

export default function ProductCard({ product, index = 0, feature = false }: ProductCardProps) {
  const { addToCart } = useStore();
  const reducedMotion = useReducedMotion();
  const [added, setAdded] = useState(false);
  const discount = productDiscount(product);
  const secondaryImage = product.images[1] ?? product.images[0];

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addToCart(product, 1, product.sizes[0], product.colors[0]);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '60px' }}
      transition={{ delay: reducedMotion ? 0 : Math.min(index * 0.045, 0.28), duration: reducedMotion ? 0.01 : 0.65, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative ${feature ? 'md:col-span-2' : ''}`}
    >
      <div className={`product-image-wrap relative overflow-hidden bg-fog ${feature ? 'aspect-[1.18]' : 'aspect-[0.78]'}`}>
        <Link to={productPath(product)} className="absolute inset-0 z-0 block" aria-label={`شوف ${product.name}`}>
          <SafeImage src={product.images[0]} alt={product.name} loading={index < 4 ? 'eager' : 'lazy'} className="product-image absolute inset-0 h-full w-full object-cover transition-[opacity,transform,filter] duration-700 ease-out group-hover:scale-[1.035]" />
          {secondaryImage ? <SafeImage src={secondaryImage} alt="" loading="lazy" className="product-image absolute inset-0 h-full w-full object-cover opacity-0 transition-[opacity,transform,filter] duration-700 ease-out group-hover:scale-[1.035] group-hover:opacity-100" /> : null}
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3 sm:p-4">
          <div className="flex flex-wrap gap-2">
            {discount ? <span className="product-badge bg-ink text-paper">خصم {discount}٪</span> : null}
            {product.isFeatured ? <span className="product-badge border border-ink/20 bg-paper/85 text-ink">مختار</span> : null}
          </div>
          <span className="font-display text-[0.65rem] tracking-[0.15em] text-ink/55">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <button type="button" onClick={handleAdd} disabled={product.stock <= 0} className={`product-add absolute bottom-3 left-3 z-10 flex h-11 items-center gap-2 overflow-hidden rounded-full px-3 text-sm font-bold transition-[width,background,color] duration-300 sm:bottom-4 sm:left-4 ${added ? 'w-[116px] bg-paper text-ink' : 'w-11 bg-ink text-paper hover:w-[116px]' } disabled:cursor-not-allowed disabled:bg-paper/80 disabled:text-ink/50`} aria-label={product.stock <= 0 ? 'المنتج خلص' : `ضيف ${product.name} للسلة`}>
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span key="added" initial={reducedMotion ? false : { opacity: 0, x: 5 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2 whitespace-nowrap"><Check size={16} /> اتضافت</motion.span>
            ) : product.stock <= 0 ? (
              <motion.span key="sold" initial={reducedMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} className="whitespace-nowrap text-xs">خلصت</motion.span>
            ) : (
              <motion.span key="add" className="flex items-center gap-2 whitespace-nowrap"><Plus size={17} /><span className="hidden group-hover:inline">ضيف للسلة</span></motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <Link to={productPath(product)} className="mt-3 block">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-ink/45">{product.categoryName}</p>
            <h3 className="mt-1 text-sm font-bold leading-6 transition-colors group-hover:text-ink/60 sm:text-base">{product.name}</h3>
          </div>
          <div className="shrink-0 text-left">
            <p className="text-sm font-bold">{formatEGP(product.price)}</p>
            {product.oldPrice ? <p className="text-[0.68rem] text-ink/35 line-through">{formatEGP(product.oldPrice)}</p> : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
