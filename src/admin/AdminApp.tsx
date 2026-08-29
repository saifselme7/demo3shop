import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { navigate, useLocation } from '../lib/navigation';
import LoadingBlock from '../components/LoadingBlock';
import Field from '../components/Field';
import Button from '../components/Button';
import AdminShell from './AdminShell';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminCategories from './pages/AdminCategories';
import AdminOrders from './pages/AdminOrders';
import AdminSettings from './pages/AdminSettings';

export default function AdminApp() {
  const location = useLocation();
  const [checking, setChecking] = useState(true);
  const [sessionUser, setSessionUser] = useState<{ id: string; email?: string } | null>(null);
  const [adminName, setAdminName] = useState('صاحب المتجر');
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const client = supabase;
    if (!client) {
      setChecking(false);
      return;
    }

    let mounted = true;
    const check = async () => {
      const { data } = await client.auth.getSession();
      if (!mounted) return;
      const user = data.session?.user;
      if (!user) {
        setSessionUser(null);
        setChecking(false);
        return;
      }

      const { data: profile, error } = await client.from('profiles').select('is_admin, full_name').eq('id', user.id).maybeSingle();
      if (error || !profile?.is_admin) {
        await client.auth.signOut();
        if (mounted) {
          setAuthError('الحساب ده مش مسموح له يدخل لوحة التحكم.');
          setSessionUser(null);
          setChecking(false);
        }
        return;
      }
      if (mounted) {
        setAdminName(profile.full_name || user.email || 'صاحب المتجر');
        setSessionUser({ id: user.id, email: user.email });
        setChecking(false);
      }
    };

    void check();
    const { data: subscription } = client.auth.onAuthStateChange(() => { void check(); });
    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  if (checking) return <div dir="rtl" className="min-h-screen bg-paper px-5 pt-32"><LoadingBlock label="بنتأكد من الدخول..." /></div>;
  if (!isSupabaseConfigured) return <AdminLogin unavailable />;
  if (!sessionUser) return <AdminLogin error={authError} />;

  const adminPath = location.pathname === '/admin' ? '/admin/dashboard' : location.pathname;
  let page = <AdminDashboard />;
  if (adminPath === '/admin/products') page = <AdminProducts />;
  if (adminPath === '/admin/categories') page = <AdminCategories />;
  if (adminPath === '/admin/orders') page = <AdminOrders />;
  if (adminPath === '/admin/settings') page = <AdminSettings />;

  return <AdminShell pathname={adminPath} adminName={adminName}>{page}</AdminShell>;
}

function AdminLogin({ error = '', unavailable = false }: { error?: string; unavailable?: boolean }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError('');
    const client = supabase;
    if (!client) return;
    setLoading(true);
    const { error: signInError } = await client.auth.signInWithPassword({ email, password });
    if (signInError) setFormError('الإيميل أو الباسورد مش مظبوط.');
    setLoading(false);
  };

  return (
    <main dir="rtl" className="admin-login min-h-screen bg-ink px-5 py-8 text-paper sm:px-8 lg:px-12"><div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-[1280px] items-center justify-center"><div className="grid w-full max-w-5xl overflow-hidden border border-paper/15 bg-soft lg:grid-cols-[0.9fr_1.1fr]"><div className="relative hidden min-h-[590px] flex-col justify-between overflow-hidden p-10 lg:flex"><div className="admin-login-grid absolute inset-0" aria-hidden="true" /><div className="relative z-10"><span className="font-display text-3xl font-bold tracking-[0.08em]">SAIF<span className="text-paper/35">/</span>ADMIN</span><p className="mt-5 max-w-xs text-sm leading-7 text-paper/45">مكانك تتحكم في كل تفصيلة — من أول القطعة لحد ما الطلب يوصل.</p></div><div className="relative z-10"><p className="font-display text-[clamp(5rem,11vw,10rem)] font-bold leading-[0.75] tracking-[-0.08em] text-paper/10">KEEP<br />IT<br />MOVING</p><p className="mt-8 text-xs font-semibold tracking-[0.12em] text-paper/40">STORE CONTROL / CAIRO / 2026</p></div></div><div className="bg-paper p-6 text-ink sm:p-10 lg:p-14"><p className="eyebrow text-ink/45">SAIF STORE / PRIVATE AREA</p><h1 className="mt-5 text-4xl font-bold tracking-tight">أهلاً بيك.</h1><p className="mt-3 max-w-sm text-sm leading-7 text-ink/55">سجّل دخولك عشان تدير المنتجات والطلبات والإعدادات.</p>{unavailable ? <div className="mt-8 rounded-2xl border border-ink/12 bg-fog/50 p-4 text-sm leading-7 text-ink/65">لوحة التحكم جاهزة، بس لازم تربط Supabase الأول من خلال <code className="font-display text-xs">.env.local</code>. استخدم <code className="font-display text-xs">.env.example</code> كمرجع.</div> : <form onSubmit={submit} className="mt-9 space-y-5"><Field id="admin-email" label="الإيميل" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="username" placeholder="you@example.com" required /><Field id="admin-password" label="الباسورد" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" placeholder="••••••••" required />{error || formError ? <p className="field-error" role="alert">{formError || error}</p> : null}<Button type="submit" disabled={loading} className="mt-3 w-full justify-center">{loading ? 'بندخل...' : 'ادخل لوحة التحكم'}</Button></form>}<button type="button" onClick={() => navigate('/')} className="mt-8 text-sm font-semibold text-ink/45 underline-offset-4 hover:text-ink hover:underline">ارجع للموقع</button></div></div></div></main>
  );
}
