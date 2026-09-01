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
  const secondaryImage = product.images[1];

  const handleAdd = () => {
    if (product.stock <= 0) return;
    addToCart(product, 1, product.sizes[0], product.colors[0]);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  };

  return (
    <motion.article
      initial={reducedMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '60px' }}
      transition={{ delay: reducedMotion ? 0 : Math.min(index * 0.04, 0.24), duration: reducedMotion ? 0.01 : 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className={`group relative ${feature ? 'md:col-span-2' : ''}`}
    >
      <div className={`product-image-wrap relative overflow-hidden ${feature ? 'aspect-[1.05]' : 'aspect-[0.78]'}`}>
        <Link to={productPath(product)} className="absolute inset-0 z-0 block" aria-label={`شوف ${product.name}`}>
          <SafeImage src={product.images[0]} alt={product.name} loading={index < 4 ? 'eager' : 'lazy'} className="product-image absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]" />
          {secondaryImage ? (
            <SafeImage src={secondaryImage} alt="" loading="lazy" className="product-image absolute inset-0 hidden h-full w-full object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 md:block" />
          ) : null}
        </Link>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <div className="flex flex-wrap gap-2">
            {discount ? <span className="product-badge bg-ink text-paper">خصم {discount}٪</span> : null}
            {product.isFeatured ? <span className="product-badge bg-paper/90 text-ink">مختار</span> : null}
            {product.stock <= 0 ? <span className="product-badge bg-paper text-ink">خلصت</span> : null}
          </div>
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={product.stock <= 0}
          className="absolute bottom-3 left-3 z-10 flex min-h-11 items-center gap-2 bg-ink px-3 py-2 text-xs font-bold text-paper transition-colors hover:bg-paper hover:text-ink disabled:bg-paper disabled:text-ink/45 sm:bottom-4 sm:left-4"
          aria-label={product.stock <= 0 ? 'المنتج خلص' : `ضيف ${product.name} للسلة`}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span key="added" className="flex items-center gap-2"><Check size={15} /> اتضافت</motion.span>
            ) : product.stock <= 0 ? (
              <motion.span key="sold">خلصت</motion.span>
            ) : (
              <motion.span key="add" className="flex items-center gap-2"><Plus size={15} /> أضف للسلة</motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
      <Link to={productPath(product)} className="mt-4 block">
        <p className="text-[0.7rem] font-medium tracking-[0.12em] text-ink/40">{product.categoryName}</p>
        <div className="mt-1 flex items-start justify-between gap-3">
          <h3 className="text-sm font-bold leading-6 sm:text-base">{product.name}</h3>
          <div className="shrink-0 text-left">
            <p className="text-sm font-bold">{formatEGP(product.price)}</p>
            {product.oldPrice ? <p className="text-[0.68rem] text-ink/35 line-through">{formatEGP(product.oldPrice)}</p> : null}
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
