import { ArrowLeft, Check, ChevronLeft, ChevronRight, Minus, Plus, Truck } from 'lucide-react';
import { useMemo, useState } from 'react';
import Button from '../components/Button';
import FadeIn from '../components/FadeIn';
import Link from '../components/Link';
import PriceBlock from '../components/PriceBlock';
import ProductGrid from '../components/ProductGrid';
import SectionLabel from '../components/SectionLabel';
import SafeImage from '../components/SafeImage';
import { categoryPath, productDiscount } from '../lib/format';
import { useStore } from '../store/StoreProvider';

export default function ProductPage({ slug }: { slug: string }) {
  const { products, addToCart } = useStore();
  const product = products.find((entry) => entry.slug === slug);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [size, setSize] = useState(product?.sizes[0] ?? '');
  const [color, setColor] = useState(product?.colors[0] ?? '');
  const [added, setAdded] = useState(false);

  const related = useMemo(() => product ? products.filter((entry) => entry.categorySlug === product.categorySlug && entry.id !== product.id).slice(0, 4) : [], [products, product]);

  if (!product) {
    return <main className="flex min-h-[70vh] items-center justify-center bg-paper px-5 pt-32 text-center"><div><p className="eyebrow text-ink/45">404 / مش موجودة</p><h1 className="mt-5 text-4xl font-bold">القطعة دي اختفت.</h1><Link to="/products" className="button-dark mt-8">ارجع للتشكيلة <ArrowLeft size={16} /></Link></div></main>;
  }

  const discount = productDiscount(product);
  const setImage = (direction: 1 | -1) => setActiveImage((current) => (current + direction + product.images.length) % product.images.length);
  const handleAdd = () => { addToCart(product, quantity, size || undefined, color || undefined); setAdded(true); window.setTimeout(() => setAdded(false), 1800); };

  return (
    <main className="bg-paper px-5 pb-24 pt-32 text-ink sm:px-8 sm:pb-32 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <FadeIn className="mb-7 flex flex-wrap items-center gap-2 text-xs font-semibold text-ink/45"><Link to="/products" className="hover:text-ink">التشكيلة</Link><span>/</span><Link to={categoryPath(product.categorySlug)} className="hover:text-ink">{product.categoryName}</Link><span>/</span><span className="text-ink">{product.name}</span></FadeIn>
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
          <FadeIn x={-20} y={0} duration={0.9} className="grid gap-3 sm:grid-cols-[82px_1fr]">
            <div className="order-2 flex gap-2 overflow-x-auto sm:order-1 sm:flex-col">{product.images.map((image, index) => <button key={image} type="button" onClick={() => setActiveImage(index)} className={`h-20 w-16 shrink-0 overflow-hidden border-2 transition-colors sm:h-24 sm:w-[82px] ${activeImage === index ? 'border-ink' : 'border-transparent opacity-55 hover:opacity-100'}`}><SafeImage src={image} alt={`${product.name} صورة ${index + 1}`} className="h-full w-full object-cover" /></button>)}</div>
            <div className="product-detail-image group relative order-1 aspect-[0.86] overflow-hidden bg-fog sm:order-2"><SafeImage src={product.images[activeImage]} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]" /><div className="absolute inset-x-4 bottom-4 flex justify-between sm:inset-x-6 sm:bottom-6"><span className="bg-paper/85 px-3 py-2 text-xs font-bold">{String(activeImage + 1).padStart(2, '0')} / {String(product.images.length).padStart(2, '0')}</span><div className="flex gap-2"><button type="button" onClick={() => setImage(1)} aria-label="الصورة التالية" className="image-nav"><ChevronRight size={17} /></button><button type="button" onClick={() => setImage(-1)} aria-label="الصورة السابقة" className="image-nav"><ChevronLeft size={17} /></button></div></div></div>
          </FadeIn>
          <div className="lg:pt-10">
            <FadeIn delay={0.12}><div className="flex items-start justify-between gap-5"><div><p className="eyebrow text-ink/45">{product.categoryName} / SAIF ESSENTIALS</p><h1 className="mt-5 max-w-xl text-[clamp(2.3rem,5vw,5.3rem)] font-bold leading-[0.98] tracking-[-0.055em]">{product.name}</h1></div>{discount ? <span className="rounded-full bg-ink px-3 py-2 text-xs font-bold text-paper">-{discount}٪</span> : null}</div><div className="mt-7"><PriceBlock product={product} large /></div></FadeIn>
            <FadeIn delay={0.2} y={18} className="mt-8 border-y border-ink/12 py-7"><p className="text-base leading-8 text-ink/65">{product.description}</p></FadeIn>
            <FadeIn delay={0.28} y={18} className="mt-7 space-y-7">
              {product.sizes.length ? <div><div className="mb-3 flex items-center justify-between"><span className="text-sm font-bold">اختار المقاس</span><span className="text-xs text-ink/45">مقاس مظبوط = لبسة أحسن</span></div><div className="flex flex-wrap gap-2">{product.sizes.map((entry) => <button key={entry} type="button" onClick={() => setSize(entry)} className={`variant-button ${size === entry ? 'variant-selected' : ''}`}>{entry}</button>)}</div></div> : null}
              {product.colors.length ? <div><span className="mb-3 block text-sm font-bold">اللون <span className="font-normal text-ink/45">{color}</span></span><div className="flex flex-wrap gap-2">{product.colors.map((entry) => <button key={entry} type="button" onClick={() => setColor(entry)} className={`variant-button ${color === entry ? 'variant-selected' : ''}`}>{entry}</button>)}</div></div> : null}
              <div className="flex flex-wrap items-center gap-3"><div className="flex h-13 items-center rounded-full border border-ink/15 p-1"><button type="button" onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="قلل الكمية" className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink hover:text-paper"><Minus size={15} /></button><span className="w-9 text-center text-sm font-bold tabular-nums">{quantity}</span><button type="button" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} aria-label="زود الكمية" className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-ink hover:text-paper"><Plus size={15} /></button></div><Button onClick={handleAdd} disabled={product.stock <= 0} className="min-h-[52px] flex-1 justify-center sm:flex-none sm:min-w-[240px]" arrow={!added}>{added ? <>اتضافت للسلة <Check size={17} /></> : product.stock > 0 ? 'ضيف للسلة' : 'المنتج خلص'}</Button></div>
              <div className="flex items-center gap-3 text-sm text-ink/55"><Truck size={18} /><span>التوصيل لكل مصر — خلال ٢ لـ ٥ أيام</span></div>
            </FadeIn>
            <FadeIn delay={0.35} y={18} className="mt-8 grid gap-3 border-t border-ink/12 pt-7 text-xs leading-6 text-ink/50 sm:grid-cols-2"><div><strong className="block text-ink">حالة المخزون</strong>{product.stock > 0 ? `متاح — ${product.stock} قطع` : 'المنتج خلص'}</div><div><strong className="block text-ink">الاستبدال</strong>استبدال خلال ١٤ يوم لو المقاس مش مظبوط</div></FadeIn>
          </div>
        </div>
        {related.length ? <section className="mt-28 border-t border-ink/15 pt-14"><div className="mb-10 flex items-end justify-between"><div><SectionLabel index="06">قد يعجبك</SectionLabel> <h2 className="mt-4 text-3xl font-bold sm:text-4xl">كمّل اللوك</h2></div><Link to={categoryPath(product.categorySlug)} className="hidden items-center gap-2 text-sm font-bold sm:flex">التصنيف كامل <ArrowLeft size={16} /></Link></div><ProductGrid products={related} /></section> : null}
      </div>
    </main>
  );
}
