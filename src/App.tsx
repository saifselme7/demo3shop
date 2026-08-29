import { AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import CartDrawer from './components/CartDrawer';
import CustomCursor from './components/CustomCursor';
import PageTransition from './components/PageTransition';
import Preloader from './components/Preloader';
import StoreFooter from './components/StoreFooter';
import StoreHeader from './components/StoreHeader';
import Toast from './components/Toast';
import AdminApp from './admin/AdminApp';
import CartPage from './pages/CartPage';
import CatalogPage from './pages/CatalogPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import { SuccessPage, TrackPage } from './pages/OrderPages';
import { useLocation, type AppLocation } from './lib/navigation';
import { StoreProvider, useStore } from './store/StoreProvider';
import Link from './components/Link';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  return <StoreProvider><StoreRouter /></StoreProvider>;
}

function StoreRouter() {
  const location = useLocation();
  const { loading } = useStore();
  const isAdmin = location.pathname === '/admin' || location.pathname.startsWith('/admin/');

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) document.title = 'SAIF ADMIN — لوحة التحكم';
    else if (location.pathname.startsWith('/product/')) document.title = 'SAIF STORE — تفاصيل القطعة';
    else document.title = 'SAIF STORE — لبس على مزاجك';
  }, [location.pathname]);

  if (isAdmin) return <AdminApp />;

  return <div className="store-app" dir="rtl"><Preloader ready={!loading} /><CustomCursor /><StoreHeader /><AnimatePresence mode="wait" initial={false}><PageTransition key={`${location.pathname}${location.search}`}><PublicRoute location={location} /></PageTransition></AnimatePresence><StoreFooter /><CartDrawer /><Toast /></div>;
}

function PublicRoute({ location }: { location: AppLocation }) {
  const path = decodeURIComponent(location.pathname.replace(/\/$/, '') || '/');
  if (path === '/') return <HomePage />;
  if (path === '/products') return <CatalogPage />;
  if (path.startsWith('/category/')) return <CatalogPage categorySlug={path.split('/')[2]} />;
  if (path.startsWith('/product/')) return <ProductPage slug={path.split('/')[2]} />;
  if (path === '/cart') return <CartPage />;
  if (path === '/checkout') return <CheckoutPage />;
  if (path === '/track') return <TrackPage />;
  if (path.startsWith('/success/')) return <SuccessPage orderNumber={path.split('/')[2]} />;
  return <NotFoundPage />;
}

function NotFoundPage() {
  return <main className="flex min-h-[75vh] items-center justify-center bg-paper px-5 pt-32 text-center text-ink"><div><p className="eyebrow text-ink/45">404 / LOST PIECE</p><h1 className="mt-5 text-5xl font-bold tracking-tight">الصفحة دي مش هنا.</h1><p className="mt-3 text-sm text-ink/50">بس ممكن تلاقي حاجة تعجبك في التشكيلة.</p><Link to="/products" className="button-dark mt-8">ارجع للتشكيلة <ArrowLeft size={16} /></Link></div></main>;
}
