import { ArrowDown, ArrowLeft, ArrowUpLeft, MoveUpLeft } from 'lucide-react';
import { lazy, Suspense } from 'react';
import FadeIn from '../components/FadeIn';
import Link from '../components/Link';
import ParticleField from '../components/ParticleField';
import ProductGrid from '../components/ProductGrid';
import SectionLabel from '../components/SectionLabel';
import SafeImage from '../components/SafeImage';
import { categoryPath, formatEGP } from '../lib/format';
import { useStore } from '../store/StoreProvider';

const AboutShaderBackground = lazy(() => import('../components/AboutShaderBackground'));
const fallbackHeroImage = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=88';

export default function HomePage() {
  const { products, categories, settings } = useStore();
  const featured = products.filter((product) => product.isFeatured && product.isActive).slice(0, 6);
  const heroProduct = featured[0] ?? products[0];
  const discoveryCategories = categories.filter((category) => category.isActive).slice(0, 6);

  return (
    <main className="overflow-hidden">
      <section className="hero-store relative min-h-[760px] overflow-hidden bg-ink text-paper sm:min-h-[850px] lg:min-h-[min(900px,100svh)]">
        <ParticleField className="pointer-events-none absolute inset-0 h-full w-full opacity-25" />
        <div className="hero-grid-lines pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-one pointer-events-none" aria-hidden="true" />
        <div className="hero-orbit hero-orbit-two pointer-events-none" aria-hidden="true" />
        <div className="mx-auto grid min-h-[760px] max-w-[1440px] items-center gap-10 px-5 pb-24 pt-36 sm:min-h-[850px] sm:px-8 sm:pt-40 lg:min-h-[min(900px,100svh)] lg:grid-cols-[0.9fr_1.1fr] lg:gap-20 lg:px-12 lg:pb-20 lg:pt-32">
          <div className="relative z-10 order-2 lg:order-1">
            <FadeIn delay={0.05} y={20} className="eyebrow flex items-center gap-3 text-paper/55">
              <span className="h-px w-8 bg-paper/35" aria-hidden="true" />
              شتاء / ٢٠٢٦ — القاهرة
            </FadeIn>
            <FadeIn as="h1" delay={0.16} y={52} className="mt-6 max-w-3xl font-bold leading-[0.93] tracking-[-0.05em]" style={{ fontSize: 'clamp(3.6rem, 9vw, 9.5rem)' }}>
              {settings.heroTitle}
            </FadeIn>
            <FadeIn delay={0.33} y={24} className="mt-7 max-w-md text-base leading-8 text-paper/65 sm:text-lg">
              {settings.heroSubtitle}
            </FadeIn>
            <FadeIn delay={0.45} y={20} className="mt-9 flex flex-wrap items-center gap-3">
              <Link to="/products" className="button-light">اشتري دلوقتي <ArrowLeft size={17} /></Link>
              <Link to="/#story" className="button-ghost-light">اعرف حكايتنا <ArrowDown size={16} /></Link>
            </FadeIn>
            <FadeIn delay={0.6} y={20} className="mt-14 flex items-center gap-4 text-xs text-paper/45">
              <span className="font-display text-2xl text-paper">01</span>
              <span className="h-px w-12 bg-paper/20" aria-hidden="true" />
              <span>قطع قليلة، معمولة عشان تعيش</span>
            </FadeIn>
          </div>

          <FadeIn delay={0.2} x={-32} y={0} duration={1} className="relative order-1 lg:order-2">
            <div className="hero-image-frame relative mx-auto aspect-[0.77] max-w-[530px] overflow-hidden bg-soft lg:mr-0">
              <SafeImage src={heroProduct?.images[0]} fallbackSrc={fallbackHeroImage} alt="تشكيلة SAIF STORE" className="h-full w-full object-cover transition-transform duration-1000 hover:scale-[1.025]" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/60 via-transparent to-transparent" aria-hidden="true" />
              <div className="absolute bottom-0 inset-x-0 flex items-end justify-between p-5 sm:p-7">
                <div>
                  <p className="eyebrow text-paper/55">القطعة الأولى</p>
                  <p className="mt-2 text-lg font-bold">{heroProduct?.name ?? 'SAIF ESSENTIALS'}</p>
                </div>
                {heroProduct ? <p className="font-display text-sm tracking-[0.08em] text-paper/75">{formatEGP(heroProduct.price)}</p> : null}
              </div>
              <div className="absolute right-4 top-4 flex h-16 w-16 items-center justify-center rounded-full border border-paper/35 text-center text-[0.6rem] leading-4 text-paper/70 sm:right-6 sm:top-6">
                MADE<br />IN EGYPT
              </div>
            </div>
            <p className="mt-4 text-left font-display text-[0.62rem] tracking-[0.2em] text-paper/35">SAIF / FORM 001 — 2026</p>
          </FadeIn>
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t border-paper/15">
          <div className="mx-auto flex max-w-[1440px] items-center justify-between px-5 py-4 text-[0.65rem] font-semibold text-paper/45 sm:px-8 lg:px-12">
            <span>توصيل لكل مصر</span><span className="hidden sm:inline">{settings.promoText || 'دفع آمن بعد التحويل'}</span><span>خامات مختارة بعناية</span>
          </div>
        </div>
      </section>

      <section id="story" className="relative bg-paper px-5 py-24 text-ink sm:px-8 sm:py-32 lg:px-12 lg:py-40">
        <div className="mx-auto grid max-w-[1440px] gap-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
          <FadeIn y={30} className="self-start lg:sticky lg:top-32">
            <SectionLabel index="01" children="الفكرة" />
            <p className="mt-7 max-w-xs text-sm leading-8 text-ink/55">مش بنجري ورا كل ترند. بنعمل القطعة اللي تفضل حلوة بعد ما الترند يخلص.</p>
            <div className="mt-10 flex items-center gap-3 text-xs font-bold text-ink/50"><span className="font-display text-3xl text-ink">S</span><span>SAIF STORE / CAIRO</span></div>
          </FadeIn>
          <div>
            <FadeIn as="h2" y={45} className="max-w-5xl text-[clamp(2.3rem,6vw,6.8rem)] font-bold leading-[1.08] tracking-[-0.045em]">
              لبس بسيط، بس <span className="text-ink/35">مش عادي.</span> معمول عشان يبقى جزء من يومك، مش مجرد صورة حلوة.
            </FadeIn>
            <FadeIn delay={0.12} y={25} className="mt-9 max-w-2xl text-base leading-8 text-ink/60 sm:text-lg">
              من القاهرة، بنختار خامات مريحة وقصّات ليها شخصية. كل drop محدود، وكل تفصيلة ليها سبب. البسها بطريقتك وسيبها تاخد شكل حياتك.
            </FadeIn>
            <FadeIn delay={0.2} className="mt-10">
              <Link to="/products" className="inline-flex items-center gap-3 text-sm font-bold underline decoration-ink/30 underline-offset-8 transition-all hover:gap-5">شوف التشكيلة <ArrowLeft size={17} /></Link>
            </FadeIn>
          </div>
        </div>
      </section>

      <section className="bg-ink px-5 py-20 text-paper sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div><SectionLabel index="02" light>اكتشف حسب مزاجك</SectionLabel><h2 className="mt-5 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">كل يوم له <span className="text-paper/35">طقم.</span></h2></div>
            <Link to="/products" className="inline-flex items-center gap-2 text-sm font-bold text-paper/65 underline-offset-8 hover:text-paper hover:underline">كل القطع <ArrowLeft size={16} /></Link>
          </div>
          <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {discoveryCategories.map((category, index) => (
              <FadeIn key={category.id} delay={index * 0.05} y={24}>
                <Link to={categoryPath(category.slug)} className={`category-tile group relative block overflow-hidden bg-soft ${index === 0 ? 'sm:row-span-2 sm:aspect-auto lg:row-span-2' : ''}`}>
                  <div className="aspect-[1.18] sm:aspect-[1.35]">
                    <SafeImage src={category.imageUrl} alt={category.name} loading="lazy" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6"><div><p className="eyebrow text-paper/50">0{index + 1}</p><h3 className="mt-1 text-xl font-bold text-paper">{category.name}</h3></div><span className="flex h-9 w-9 items-center justify-center rounded-full border border-paper/40 text-paper transition-transform duration-300 group-hover:-translate-x-1"><ArrowUpLeft size={15} /></span></div>
                </Link>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-paper px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
        <div className="mx-auto max-w-[1440px]">
          <div className="flex flex-col justify-between gap-7 md:flex-row md:items-end"><div><SectionLabel index="03">المختارات</SectionLabel><h2 className="mt-5 text-4xl font-bold tracking-tight sm:text-6xl">الناس لابساها</h2></div><p className="max-w-xs text-sm leading-7 text-ink/50">قطع أساسية بتدخل دولابك وتفضل فيه.</p></div>
          <div className="mt-12"><ProductGrid products={featured.length ? featured : products.slice(0, 6)} featureFirst /></div>
          <FadeIn className="mt-14 text-center"><Link to="/products" className="button-outline">شوف كل المنتجات <ArrowLeft size={17} /></Link></FadeIn>
        </div>
      </section>

      <section className="relative overflow-hidden bg-paper px-5 pb-24 sm:px-8 sm:pb-32 lg:px-12">
        <div className="mx-auto grid max-w-[1440px] items-stretch gap-0 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative min-h-[480px] overflow-hidden bg-ink text-paper sm:min-h-[600px]">
            <Suspense fallback={null}><AboutShaderBackground /></Suspense>
            <div className="relative z-10 flex h-full min-h-[480px] flex-col justify-between p-7 sm:min-h-[600px] sm:p-12"><SectionLabel index="04" light>من الاستوديو</SectionLabel><div><p className="font-display text-[clamp(4rem,10vw,9rem)] font-bold leading-[0.8] tracking-[-0.06em]">FORM<br /><span className="text-paper/30">/ 026</span></p><p className="mt-8 max-w-sm text-sm leading-7 text-paper/60">القطعة الحلوة مش محتاجة شعار كبير. محتاجة خامة تعيش، وقصّة تفضل مظبوطة.</p></div><Link to="/products" className="inline-flex w-fit items-center gap-3 text-sm font-bold text-paper underline decoration-paper/30 underline-offset-8">شوف القطع الجديدة <ArrowLeft size={16} /></Link></div>
          </div>
          <div className="flex flex-col justify-between bg-fog p-7 text-ink sm:p-12"><div><p className="eyebrow text-ink/45">DROP NOTES / 01</p><h2 className="mt-8 max-w-sm text-4xl font-bold leading-tight tracking-tight sm:text-5xl">الهدوء<br /><span className="text-ink/35">له شكل.</span></h2></div><div className="mt-16"><p className="max-w-sm text-sm leading-8 text-ink/60">ألوان قليلة. تفاصيل أكتر. اختار اللي شبهك وسيب الباقي علينا.</p><Link to="/category/tshirts" className="mt-8 inline-flex items-center gap-2 text-sm font-bold underline decoration-ink/25 underline-offset-8">ابدأ بالأساسيات <MoveUpLeft size={16} /></Link></div></div>
        </div>
      </section>

      <section className="border-t border-ink/10 bg-paper px-5 py-20 sm:px-8 sm:py-28 lg:px-12">
        <div className="mx-auto max-w-[1440px]"><SectionLabel index="05">ليه SAIF؟</SectionLabel><div className="mt-12 grid gap-0 border-y border-ink/15 md:grid-cols-3">{[['01', 'خامة تتحس', 'بنختار القماش قبل ما نختار الكلام. راحة من أول لبسة.'], ['02', 'تصميم يعيش', 'قصّات هادية وتفاصيل محسوبة عشان القطعة تفضل معاك.'], ['03', 'من مصر لكل مصر', 'براند مصري، شحن سريع، ودعم حقيقي لما تحتاجه.']].map(([number, title, text]) => <FadeIn key={number} delay={Number(number) * 0.06} y={20} className="border-b border-ink/15 p-6 last:border-b-0 md:border-b-0 md:border-l md:p-10 md:first:pr-0 md:last:border-l-0"><span className="font-display text-sm text-ink/45">{number}</span><h3 className="mt-10 text-xl font-bold">{title}</h3><p className="mt-4 max-w-xs text-sm leading-7 text-ink/55">{text}</p></FadeIn>)}</div></div>
      </section>

      <section className="bg-ink px-5 py-24 text-center text-paper sm:px-8 sm:py-32">
        <FadeIn><p className="eyebrow text-paper/45">آخر حاجة</p><h2 className="mx-auto mt-6 max-w-4xl text-[clamp(2.8rem,7vw,7rem)] font-bold leading-[0.98] tracking-[-0.05em]">البسها على <span className="text-paper/35">مزاجك.</span></h2><p className="mx-auto mt-7 max-w-md text-sm leading-7 text-paper/55">مش لازم تستنى مناسبة. القطعة الصح بتعمل اليوم العادي أحسن.</p><Link to="/products" className="button-light mt-9">ادخل التشكيلة <ArrowLeft size={17} /></Link></FadeIn>
      </section>
    </main>
  );
}
