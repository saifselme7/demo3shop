import type { Product } from '../types/store';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  featureFirst?: boolean;
}

export default function ProductGrid({ products, emptyMessage = 'لسه مفيش منتجات هنا.', featureFirst = false }: ProductGridProps) {
  if (!products.length) {
    return <div className="empty-state"><p className="text-lg font-bold">{emptyMessage}</p><p className="mt-2 text-sm text-ink/50">جرّب اختيار تصنيف تاني أو ارجع بعد شوية.</p></div>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-6">
      {products.map((product, index) => <ProductCard key={product.id} product={product} index={index} feature={featureFirst && index === 0} />)}
    </div>
  );
}
