import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import FadeIn from '../components/FadeIn';
import ProductGrid from '../components/ProductGrid';
import SectionLabel from '../components/SectionLabel';
import Link from '../components/Link';
import { categoryPath } from '../lib/format';
import { fashionNavCategories } from '../lib/storefront';
import { useLocation } from '../lib/navigation';
import { useStore } from '../store/StoreProvider';

interface CatalogPageProps {
  categorySlug?: string;
}

type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high';

export default function CatalogPage({ categorySlug }: CatalogPageProps) {
  const { products, categories } = useStore();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const queryCategory = params.get('category') || categorySlug || '';
  const category = categories.find((entry) => entry.slug === queryCategory);
  const initialSort = params.get('sort') === 'newest' ? 'newest' : 'featured';
  const [sort, setSort] = useState<SortOption>(initialSort);
  const [filterOpen, setFilterOpen] = useState(false);
  const navCategories = fashionNavCategories(categories);

  const visibleProducts = useMemo(() => {
    const filtered = products.filter((product) => product.isActive && (!queryCategory || product.categorySlug === queryCategory));
    return [...filtered].sort((a, b) => {
      if (sort === 'price-low') return a.price - b.price;
      if (sort === 'price-high') return b.price - a.price;
      if (sort === 'newest') return b.displayOrder - a.displayOrder;
      return Number(b.isFeatured) - Number(a.isFeatured) || a.displayOrder - b.displayOrder;
    });
  }, [products, queryCategory, sort]);

  return (
    <main className="bg-paper px-5 pb-24 pt-28 text-ink sm:px-8 sm:pb-32 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <FadeIn><SectionLabel index="SHOP">{category ? category.name : 'تسوق'}</SectionLabel></FadeIn>
        <div className="mt-6 flex flex-col justify-between gap-7 border-b border-ink/10 pb-10 lg:flex-row lg:items-end">
          <FadeIn y={28} className="max-w-3xl">
            <h1 className="text-[clamp(2.8rem,7vw,7rem)] font-bold leading-[0.95] tracking-[-0.05em]">
              {category ? category.name : 'كل المجموعة'}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-ink/55">
              {category?.description ?? 'تيشيرتات، هوديز، بناطيل، وجواكيت. اختار القطعة اللي تدخل دولابك وتفضل فيه.'}
            </p>
          </FadeIn>
          <FadeIn delay={0.1} className="shrink-0">
            <span className="font-serif text-6xl italic text-ink/15">{String(visibleProducts.length).padStart(2, '0')}</span>
            <p className="mt-1 text-xs font-semibold text-ink/45">قطعة متاحة</p>
          </FadeIn>
        </div>

        <div className="relative flex flex-wrap items-center justify-between gap-4 border-b border-ink/10 py-5">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-sm font-semibold">
            <Link to="/products" className={`whitespace-nowrap px-4 py-2 ${!queryCategory ? 'bg-ink text-paper' : 'text-ink/55 hover:bg-ink/5'}`}>الكل</Link>
            {navCategories.map((entry) => (
              <Link key={entry.id} to={categoryPath(entry.slug)} className={`whitespace-nowrap px-4 py-2 ${queryCategory === entry.slug ? 'bg-ink text-paper' : 'text-ink/55 hover:bg-ink/5'}`}>
                {entry.name}
              </Link>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setFilterOpen((value) => !value)} className="inline-flex items-center gap-2 border border-ink/15 px-4 py-2 text-sm font-semibold lg:hidden">
              <SlidersHorizontal size={15} /> فلتر
            </button>
            <label className="relative flex items-center gap-2 text-sm font-semibold text-ink/60">
              <span className="hidden sm:inline">ترتيب:</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as SortOption)} className="appearance-none bg-transparent py-2 pl-7 pr-1 font-bold text-ink outline-none">
                <option value="featured">المختارات</option>
                <option value="newest">الأحدث</option>
                <option value="price-low">السعر: من الأقل</option>
                <option value="price-high">السعر: من الأعلى</option>
              </select>
              <ChevronDown size={14} className="pointer-events-none absolute left-0" />
            </label>
          </div>
          {filterOpen ? (
            <div className="absolute inset-x-0 top-full z-20 mt-2 border border-ink/10 bg-paper p-3 shadow-editorial lg:hidden">
              <div className="flex flex-wrap gap-2">
                {navCategories.map((entry) => (
                  <Link key={entry.id} to={categoryPath(entry.slug)} onClick={() => setFilterOpen(false)} className="border border-ink/15 px-3 py-2 text-xs font-bold">
                    {entry.name}
                  </Link>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="pt-12"><ProductGrid products={visibleProducts} /></div>
      </div>
    </main>
  );
}
