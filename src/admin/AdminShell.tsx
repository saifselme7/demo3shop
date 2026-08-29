import { BarChart3, Boxes, ClipboardList, LogOut, Menu, Settings2, Tags, X } from 'lucide-react';
import { PropsWithChildren, useState } from 'react';
import Link from '../components/Link';
import LogoMark from '../components/LogoMark';
import { navigate } from '../lib/navigation';
import { supabase } from '../lib/supabase';
import { SEED_SETTINGS } from '../data/catalog';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'نظرة عامة', icon: BarChart3 },
  { to: '/admin/products', label: 'المنتجات', icon: Boxes },
  { to: '/admin/categories', label: 'التصنيفات', icon: Tags },
  { to: '/admin/orders', label: 'الطلبات', icon: ClipboardList },
  { to: '/admin/settings', label: 'إعدادات المتجر', icon: Settings2 },
];

interface AdminShellProps {
  pathname: string;
  adminName: string;
}

export default function AdminShell({ pathname, adminName, children }: PropsWithChildren<AdminShellProps>) {
  const [open, setOpen] = useState(false);
  const logout = async () => {
    await supabase?.auth.signOut();
    navigate('/admin');
  };

  return (
    <div dir="rtl" className="admin-shell min-h-screen bg-paper text-ink">
      <aside className={`admin-sidebar ${open ? 'admin-sidebar-open' : ''}`}>
        <div className="flex items-center justify-between"><Link to="/admin/dashboard" onClick={() => setOpen(false)}><LogoMark settings={SEED_SETTINGS} /></Link><button type="button" onClick={() => setOpen(false)} className="icon-button admin-mobile-close lg:hidden" aria-label="اقفل القائمة"><X size={19} /></button></div>
        <div className="mt-12"><p className="eyebrow mb-4 text-ink/35">SAIF / CONTROL</p><nav className="flex flex-col gap-1">{NAV_ITEMS.map(({ to, label, icon: Icon }) => <Link key={to} to={to} onClick={() => setOpen(false)} className={`admin-nav-link ${pathname === to ? 'admin-nav-active' : ''}`}><Icon size={17} strokeWidth={1.8} /><span>{label}</span></Link>)}</nav></div>
        <div className="mt-auto border-t border-ink/10 pt-5"><div className="flex items-center gap-3"><span className="admin-avatar">{adminName.slice(0, 1).toUpperCase()}</span><div className="min-w-0"><p className="truncate text-sm font-bold">{adminName}</p><p className="text-xs text-ink/40">مدير المتجر</p></div></div><button type="button" onClick={logout} className="mt-5 flex items-center gap-2 text-sm font-semibold text-ink/45 transition-colors hover:text-ink"><LogOut size={16} /> تسجيل الخروج</button></div>
      </aside>
      {open ? <button type="button" aria-label="اقفل القائمة" onClick={() => setOpen(false)} className="fixed inset-0 z-30 bg-ink/35 lg:hidden" /> : null}
      <div className="admin-main"><header className="admin-topbar"><button type="button" onClick={() => setOpen(true)} className="icon-button lg:hidden" aria-label="افتح القائمة"><Menu size={19} /></button><div className="flex items-center gap-3"><span className="h-2 w-2 rounded-full bg-ink" /><span className="text-sm font-semibold text-ink/55">لوحة تحكم SAIF STORE</span></div><Link to="/" className="text-xs font-bold text-ink/45 underline-offset-4 hover:text-ink hover:underline">شوف الموقع ←</Link></header><main className="admin-content">{children}</main></div>
    </div>
  );
}
