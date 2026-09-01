import { ArrowLeft } from 'lucide-react';
import FadeIn from '../components/FadeIn';
import Link from '../components/Link';
import ProductGrid from '../components/ProductGrid';
import SectionLabel from '../components/SectionLabel';
import SafeImage from '../components/SafeImage';
import { categoryPath, formatEGP, productPath } from '../lib/format';
import { campaignProduct, fashionNavCategories, featuredProducts, newestProducts } from '../lib/storefront';
import { useStore } from '../store/StoreProvider';

const fallbackHeroImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1800&q=88';
const MARQUEE = ['T-SHIRTS', 'HOODIES', 'PANTS', 'JACKETS', 'ESSENTIALS', 'NEW DROP', 'SAIF STORE'];

export default function HomePage() {
  const { products, categories, settings } = useStore();
  const featured = featuredProducts(products, 8);
  const newest = newestProducts(products, 4);
  const heroProduct = campaignProduct(products);
  const lookProduct = featured[1] ?? heroProduct;
  const discoveryCategories = fashionNavCategories(categories).slice(0, 5);

  return (
    <main className="overflow-hidden">
      <section className="hero-store relative min-h-[100svh] bg-ink text-paper">
        <div className="absolute inset-0">
          <SafeImage
            src={heroProduct?.images[0]}
            fallbackSrc={fallbackHeroImage}
            alt={heroProduct?.name ?? 'SAIF STORE'}
            className="h-full w-full object-cover object-[center_20%]"
          />
          <div className="hero-veil-mobile absolute inset-0 lg:hidden" aria-hidden="true" />
          <div className="hero-veil absolute inset-0 hidden lg:block" aria-hidden="true" />
        </div>
        <div className="relative z-10 mx-auto flex min-h-[100svh] max-w-[1440px] flex-col justify-end px-5 pb-16 pt-32 sm:px-8 lg:justify-center lg:px-12 lg:pb-24">
          <FadeIn delay={0.08} y={18} className="eyebrow text-paper/55">
            {settings.promoText || 'NEW SEASON / CAIRO'}
          </FadeIn>
          <FadeIn as="p" delay={0.16} y={28} className="font-serif mt-5 max-w-4xl text-[clamp(3.2rem,9vw,8.4rem)] italic leading-[0.88] tracking-[-0.03em]">
            Wear your statement.
          </FadeIn>
          <FadeIn as="h1" delay={0.28} y={22} className="mt-6 max-w-xl text-2xl font-bold leading-snug sm:text-4xl">
            {settings.heroTitle || 'SAIF STORE'}
          </FadeIn>
          <FadeIn delay={0.38} y={18} className="mt-4 max-w-md text-sm leading-8 text-paper/70 sm:text-base">
            {settings.heroSubtitle || 'أزياء أساسية بشخصية. اكتشف المجموعة، اختار القطعة، ولبسها على مزاجك.'}
          </FadeIn>
          <FadeIn delay={0.5} y={16} className="mt-9 flex flex-wrap gap-3">
            <Link to="/products" className="button-light">اكتشف المجموعة <ArrowLeft size={16} /></Link>
            <Link to="/products" className="button-ghost-light">شوف الجديد</Link>
          </FadeIn>
        </div>
      </section>

      <div className="fashion-marquee bg-ink py-4" aria-hidden="true">
        <div className="fashion-marquee-track">
          {[...MARQUEE, ...MARQUEE, ...MARQUEE, ...MARQUEE].map((item, index) => (
            <span key={`${item}-${index}`}>{item} ·</span>
          ))}
        </div>
      </div>

      <section className="bg-paper px-5 py-20 text-ink sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel index="01">وصل حديثًا</SectionLabel>
              <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">New Drop</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-ink/55">أحدث القطع من التشكيلة الحالية — من غير اختراع ترند.</p>
            </div>
            <Link to="/products" className="text-sm font-bold underline decoration-ink/25 underline-offset-8">شوف كل الجديد</Link>
          </div>
          <div className="mt-12"><ProductGrid products={newest} /></div>
        </div>
      </section>

      <section className="bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <SectionLabel index="02" light>تسوق حسب التصنيف</SectionLabel>
          <h2 className="mt-5 max-w-2xl text-4xl font-bold leading-tight sm:text-6xl">اختار اللبس <span className="text-paper/35">اللي شبهك.</span></h2>
          <div className="mt-12 grid gap-3 md:grid-cols-2 lg:grid-cols-6">
            {discoveryCategories.map((category, index) => (
              <FadeIn key={category.id} delay={index * 0.05} y={20} className={index === 0 ? 'lg:col-span-3' : 'lg:col-span-3'}>
                <Link to={categoryPath(category.slug)} className="group relative block min-h-[280px] overflow-hidden bg-soft sm:min-h-[340px]">
                  <SafeImage src={category.imageUrl} alt={category.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                    <div>
                      <p className="eyebrow text-paper/50">0{index + 1}</p>
                      <h3 className="mt-2 text-3xl font-bold">{category.name}</h3>
                    </div>
                    <span className="text-sm font-bold">اكتشف</span>
                  </div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <SectionLabel index="03">مختارات SAIF</SectionLabel>
              <h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">الأكثر حضورًا</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-ink/55">قطع معلّمة كمختارات من المتجر — مش ترتيب مبيعات وهمي.</p>
            </div>
            <Link to="/products" className="text-sm font-bold underline decoration-ink/25 underline-offset-8">كل المجموعة</Link>
          </div>
          <div className="mt-12"><ProductGrid products={featured} featureFirst /></div>
        </div>
      </section>

      <section id="story" className="bg-fog px-5 py-24 text-ink sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-24">
          <FadeIn y={24} className="self-start lg:sticky lg:top-28">
            <SectionLabel index="04">الهوية</SectionLabel>
            <p className="font-serif mt-8 text-5xl italic leading-none sm:text-7xl">Quiet luxury.<br />Loud taste.</p>
          </FadeIn>
          <div>
            <FadeIn as="h2" y={32} className="text-[clamp(2.1rem,5vw,4.6rem)] font-bold leading-[1.08] tracking-[-0.04em]">
              مش بنعمل لبس عشان الصورة. بنعمله عشان يتلبس.
            </FadeIn>
            <FadeIn delay={0.12} y={18} className="mt-8 max-w-xl text-base leading-8 text-ink/60">
              SAIF STORE براند أزياء من القاهرة: تيشيرتات، هوديز، بناطيل، وجواكيت بقصّات واضحة وخامات تتحس من أول يوم. القطعة الصح بتفضل في الدولاب، مش في الترند.
            </FadeIn>
            <FadeIn delay={0.2} className="mt-10">
              <Link to="/products" className="button-dark">اكتشف المجموعة <ArrowLeft size={16} /></Link>
            </FadeIn>
          </div>
        </div>
      </section>

      {lookProduct ? (
        <section className="grid min-h-[70vh] bg-ink text-paper lg:grid-cols-2">
          <div className="relative min-h-[420px]">
            <SafeImage src={lookProduct.images[1] ?? lookProduct.images[0]} alt={lookProduct.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex flex-col justify-between px-6 py-16 sm:px-12 sm:py-24">
            <SectionLabel index="05" light>LOOK / CAMPAIGN</SectionLabel>
            <div>
              <p className="font-serif text-[clamp(2.8rem,6vw,5.5rem)] italic leading-[0.9]">The everyday uniform.</p>
              <p className="mt-6 max-w-md text-sm leading-8 text-paper/65">قطعة واحدة تقدر تلبسها الصبح وبالليل. {lookProduct.name} — {formatEGP(lookProduct.price)}</p>
              <Link to={productPath(lookProduct)} className="button-light mt-8 w-fit">اطلب دلوقتي <ArrowLeft size={16} /></Link>
            </div>
          </div>
        </section>
      ) : null}

      {heroProduct ? (
        <section className="bg-paper px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
          <div className="mx-auto grid max-w-[1440px] items-center gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <Link to={productPath(heroProduct)} className="group block overflow-hidden bg-fog">
              <SafeImage src={heroProduct.images[0]} alt={heroProduct.name} className="aspect-[0.86] w-full object-cover transition duration-700 group-hover:scale-[1.03]" />
            </Link>
            <div>
              <SectionLabel index="06">قطعة الأسبوع</SectionLabel>
              <h2 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl">{heroProduct.name}</h2>
              <p className="mt-5 max-w-md text-sm leading-8 text-ink/60">{heroProduct.description}</p>
              <p className="mt-6 text-xl font-bold">{formatEGP(heroProduct.price)}</p>
              <Link to={productPath(heroProduct)} className="button-dark mt-8">أضف للسلة من صفحة المنتج</Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-ink px-5 py-24 text-center text-paper sm:px-8 sm:py-32">
        <FadeIn>
          <p className="eyebrow text-paper/45">SAIF STORE</p>
          <h2 className="font-serif mx-auto mt-6 max-w-4xl text-[clamp(2.8rem,8vw,7.2rem)] italic leading-[0.92]">تسوق دلوقتي.</h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-7 text-paper/55">المجموعة جاهزة. اختار القطعة، اختار المقاس، وكمّل الطلب.</p>
          <Link to="/products" className="button-light mt-9">اكتشف المجموعة <ArrowLeft size={16} /></Link>
        </FadeIn>
      </section>
    </main>
  );
}
