import { ArrowUpLeft, Facebook, Instagram } from 'lucide-react';
import { categoryPath } from '../lib/format';
import { fashionNavCategories } from '../lib/storefront';
import Link from './Link';
import LogoMark from './LogoMark';
import { useStore } from '../store/StoreProvider';

export default function StoreFooter() {
  const { settings, categories } = useStore();
  const whatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');
  const navCategories = fashionNavCategories(categories).slice(0, 6);

  return (
    <footer className="bg-ink px-5 pb-6 pt-20 text-paper sm:px-8 sm:pt-24 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="flex flex-col justify-between gap-8 border-b border-paper/10 pb-12 md:flex-row md:items-end">
          <div>
            <p className="font-serif text-[clamp(2.4rem,6vw,5.5rem)] leading-[0.9] tracking-[0.02em]">SAIF STORE</p>
            <p className="mt-4 max-w-md text-sm leading-8 text-paper/55">{settings.storeDescription || 'لبس بشخصية. قصّات معاصرة، خامات تعيش، وستايل من القاهرة لكل مصر.'}</p>
          </div>
          <LogoMark settings={settings} light />
        </div>
        <div className="grid gap-12 border-b border-paper/10 py-14 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr] md:gap-8">
          <div>
            {whatsapp ? (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 transition-opacity hover:opacity-65">
                كلمنا على واتساب <ArrowUpLeft size={16} />
              </a>
            ) : null}
            {settings.contactPhone ? <p className="mt-4 text-sm text-paper/55">{settings.contactPhone}</p> : null}
          </div>
          <div>
            <p className="eyebrow text-paper/40">تسوق</p>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-paper/70">
              <Link to="/" className="transition-colors hover:text-paper">الرئيسية</Link>
              <Link to="/products" className="transition-colors hover:text-paper">كل المجموعة</Link>
              <Link to="/track" className="transition-colors hover:text-paper">تتبع طلبك</Link>
            </nav>
          </div>
          <div>
            <p className="eyebrow text-paper/40">التصنيفات</p>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-paper/70">
              {navCategories.map((category) => (
                <Link key={category.id} to={categoryPath(category.slug)} className="transition-colors hover:text-paper">{category.name}</Link>
              ))}
            </nav>
          </div>
          <div>
            <p className="eyebrow text-paper/40">خليك قريب</p>
            <p className="mt-5 text-sm leading-7 text-paper/55">تابع الدروب الجديد على صفحاتنا.</p>
            <div className="mt-5 flex gap-3">
              {settings.instagramUrl ? <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social inline-flex h-10 w-10 items-center justify-center border border-paper/20 hover:bg-paper hover:text-ink"><Instagram size={17} /></a> : null}
              {settings.facebookUrl ? <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social inline-flex h-10 w-10 items-center justify-center border border-paper/20 hover:bg-paper hover:text-ink"><Facebook size={17} /></a> : null}
              {settings.tiktokUrl ? <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="footer-social inline-flex h-10 w-10 items-center justify-center border border-paper/20 font-display text-xs hover:bg-paper hover:text-ink">TK</a> : null}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-[0.68rem] font-medium tracking-[0.08em] text-paper/35 sm:flex-row">
          <span>© {new Date().getFullYear()} SAIF STORE</span>
          <span>FASHION FROM CAIRO</span>
        </div>
      </div>
    </footer>
  );
}
