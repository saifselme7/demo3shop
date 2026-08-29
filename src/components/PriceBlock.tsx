import { formatEGP, productDiscount } from '../lib/format';
import type { Product } from '../types/store';

export default function PriceBlock({ product, large = false }: { product: Product; large?: boolean }) {
  const discount = productDiscount(product);
  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={large ? 'text-2xl font-bold sm:text-3xl' : 'text-sm font-bold'}>{formatEGP(product.price)}</span>
      {product.oldPrice ? <span className={large ? 'text-sm text-ink/35 line-through' : 'text-xs text-ink/35 line-through'}>{formatEGP(product.oldPrice)}</span> : null}
      {discount ? <span className="text-xs font-bold text-ink/55">-{discount}٪</span> : null}
    </div>
  );
}
