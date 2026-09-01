import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import CartDrawer from './components/CartDrawer';
import CustomCursor from './components/CustomCursor';
import PageTransition from './components/PageTransition';
import Preloader from './components/Preloader';
import StoreFooter from './components/StoreFooter';
import StoreHeader from './components/StoreHeader';
import Toast from './components/Toast';
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

const AdminApp = lazy(() => import('./admin/AdminApp'));

export default function App() {
  return <StoreProvider><StoreRouter /></StoreProvider>;
}

function StoreRouter() {
  const location = useLocation();
  const { loading, catalogError, isLive, refreshCatalog } = useStore();
  const isAdmin = location.pathname === '/admin' || location.pathname.startsWith('/admin/');
  const wasAdmin = useRef(false);
  const [revealsReady, setRevealsReady] = useState(false);

  useEffect(() => {
    if (wasAdmin.current && !isAdmin && isLive) void refreshCatalog();
    wasAdmin.current = isAdmin;
  }, [isAdmin, isLive, refreshCatalog]);

  useEffect(() => {
    if (location.pathname.startsWith('/admin')) document.title = 'SAIF ADMIN — لوحة التحكم';
    else if (location.pathname.startsWith('/product/')) document.title = 'SAIF STORE — تفاصيل القطعة';
    else if (location.pathname.startsWith('/checkout')) document.title = 'SAIF STORE — إتمام الطلب';
    else if (location.pathname.startsWith('/cart')) document.title = 'SAIF STORE — السلة';
    else document.title = 'SAIF STORE — Wear Your Statement.';
  }, [location.pathname]);

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-paper px-5 pt-32 text-center text-ink"><p className="text-sm font-semibold text-ink/55">بنجهز لوحة التحكم...</p></div>}>
        <AdminApp />
      </Suspense>
    );
  }

  return (
    <div className="store-app" dir="rtl">
      <Preloader ready={!loading} onRevealStart={() => setRevealsReady(true)} />
      <CustomCursor />
      <StoreHeader />
      {isLive && catalogError ? <CatalogConnectionNotice onRetry={refreshCatalog} /> : null}
      {revealsReady ? (
        <AnimatePresence mode="wait">
          <PageTransition key={`${location.pathname}${location.search}`}>
            <PublicRoute location={location} />
          </PageTransition>
        </AnimatePresence>
      ) : (
        <div className="min-h-screen bg-ink" aria-hidden="true" />
      )}
      <StoreFooter />
      <CartDrawer />
      <Toast />
    </div>
  );
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

function CatalogConnectionNotice({ onRetry }: { onRetry: () => Promise<void> }) {
  return (
    <div role="alert" className="relative z-40 mx-4 mt-24 flex items-center justify-between gap-4 border border-ink/10 bg-paper px-4 py-3 text-xs text-ink/65 shadow-editorial sm:mx-auto sm:max-w-[900px] sm:px-5">
      <span>في مشكلة مؤقتة في تحديث بيانات المتجر. جرّب تاني كمان شوية.</span>
      <button type="button" onClick={() => void onRetry()} className="shrink-0 font-bold text-ink underline underline-offset-4">حاول تاني</button>
    </div>
  );
}

function NotFoundPage() {
  return (
    <main className="flex min-h-[75vh] items-center justify-center bg-paper px-5 pt-32 text-center text-ink">
      <div>
        <p className="eyebrow text-ink/45">404</p>
        <h1 className="mt-5 text-5xl font-bold tracking-tight">الصفحة دي مش هنا.</h1>
        <p className="mt-3 text-sm text-ink/50">بس ممكن تلاقي حاجة تعجبك في المجموعة.</p>
        <Link to="/products" className="button-dark mt-8">ارجع للمجموعة <ArrowLeft size={16} /></Link>
      </div>
    </main>
  );
}
