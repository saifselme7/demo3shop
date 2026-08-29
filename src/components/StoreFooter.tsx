import { ArrowUpLeft, Facebook, Instagram } from 'lucide-react';
import { categoryPath } from '../lib/format';
import Link from './Link';
import LogoMark from './LogoMark';
import { useStore } from '../store/StoreProvider';

export default function StoreFooter() {
  const { settings, categories } = useStore();
  const whatsapp = settings.whatsappNumber.replace(/[^0-9]/g, '');

  return (
    <footer className="bg-ink px-5 pb-6 pt-16 text-paper sm:px-8 sm:pt-20 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="grid gap-12 border-b border-paper/15 pb-14 md:grid-cols-[1.4fr_0.8fr_0.8fr_1fr] md:gap-8">
          <div>
            <LogoMark settings={settings} light />
            <p className="mt-6 max-w-sm text-sm leading-8 text-paper/55">{settings.storeDescription}</p>
            {whatsapp ? <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline-offset-4 transition-opacity hover:opacity-65">كلمنا على واتساب <ArrowUpLeft size={16} /></a> : null}
          </div>
          <div>
            <p className="eyebrow text-paper/40">تصفح</p>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-paper/70">
              <Link to="/" className="transition-colors hover:text-paper">الرئيسية</Link>
              <Link to="/products" className="transition-colors hover:text-paper">كل التشكيلة</Link>
              <Link to="/track" className="transition-colors hover:text-paper">تتبع طلبك</Link>
            </nav>
          </div>
          <div>
            <p className="eyebrow text-paper/40">التصنيفات</p>
            <nav className="mt-5 flex flex-col items-start gap-3 text-sm text-paper/70">
              {categories.slice(0, 5).map((category) => <Link key={category.id} to={categoryPath(category.slug)} className="transition-colors hover:text-paper">{category.name}</Link>)}
            </nav>
          </div>
          <div>
            <p className="eyebrow text-paper/40">خليك قريب</p>
            <p className="mt-5 text-sm leading-7 text-paper/55">تابع الجديد والعروض على صفحاتنا.</p>
            <div className="mt-5 flex gap-3">
              {settings.instagramUrl ? <a href={settings.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="footer-social"><Instagram size={17} /></a> : null}
              {settings.facebookUrl ? <a href={settings.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="footer-social"><Facebook size={17} /></a> : null}
              {settings.tiktokUrl ? <a href={settings.tiktokUrl} target="_blank" rel="noopener noreferrer" aria-label="TikTok" className="footer-social font-display text-xs">TK</a> : null}
              {settings.contactPhone ? <a href={`tel:${settings.contactPhone}`} aria-label="اتصل بنا" className="footer-social font-display text-xs"><span className="font-display text-xs">اتصل</span></a> : null}
            </div>
          </div>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-[0.68rem] font-medium tracking-[0.08em] text-paper/35 sm:flex-row">
          <span>© {new Date().getFullYear()} SAIF STORE</span>
          <span>مصنوع في مصر · كل قطعة ليها حكاية</span>
        </div>
      </div>
    </footer>
  );
}
