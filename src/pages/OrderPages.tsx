import { ArrowLeft, Check, Clock3, PackageCheck, Search, Truck } from 'lucide-react';
import { FormEvent, useState } from 'react';
import Button from '../components/Button';
import FadeIn from '../components/FadeIn';
import Field from '../components/Field';
import Link from '../components/Link';
import { OrderStatusPill, PaymentStatusPill } from '../components/OrderStatusPill';
import SectionLabel from '../components/SectionLabel';
import { formatEGP, normalizePhone } from '../lib/format';
import { useStore } from '../store/StoreProvider';
import type { OrderStatus, OrderStatusResult } from '../types/store';

export function SuccessPage({ orderNumber }: { orderNumber: string }) {
  const { lastOrder } = useStore();
  const order = lastOrder?.orderNumber === orderNumber ? lastOrder : null;
  return (
    <main className="min-h-[78vh] bg-paper px-5 pb-24 pt-40 text-ink sm:px-8 lg:px-12"><div className="mx-auto max-w-3xl text-center"><FadeIn><div className="success-mark"><Check size={28} /></div><p className="eyebrow mt-7 text-ink/45">ORDER / CONFIRMED</p><h1 className="mt-5 text-[clamp(2.8rem,7vw,6.5rem)] font-bold leading-[0.95] tracking-[-0.06em]">طلبك في السكة.</h1><p className="mx-auto mt-6 max-w-lg text-base leading-8 text-ink/55">تمام يا {order?.customerName || 'بطل'}. هنراجع التحويل ونتواصل معاك على رقم الموبايل قريب.</p><div className="mx-auto mt-10 max-w-sm border-y border-ink/15 py-5"><p className="text-xs font-semibold text-ink/45">رقم الطلب</p><p className="mt-2 font-display text-2xl font-bold tracking-[0.08em]">{orderNumber}</p>{order ? <p className="mt-2 text-sm text-ink/55">الإجمالي: <strong className="text-ink">{formatEGP(order.total)}</strong></p> : null}</div><div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/track" className="button-dark">تتبع طلبك <ArrowLeft size={17} /></Link><Link to="/products" className="button-outline">كمّل تسوق</Link></div></FadeIn></div></main>
  );
}

const ORDER_STEPS: Array<{ status: OrderStatus; label: string; icon: typeof Clock3 }> = [
  { status: 'pending', label: 'مراجعة الطلب', icon: Clock3 },
  { status: 'confirmed', label: 'اتأكد', icon: Check },
  { status: 'preparing', label: 'بيتحضر', icon: PackageCheck },
  { status: 'shipped', label: 'اتشحن', icon: Truck },
  { status: 'delivered', label: 'اتسلّم', icon: Check },
];

export function TrackPage() {
  const { trackOrder } = useStore();
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState<OrderStatusResult | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(''); setResult(null);
    if (!orderNumber.trim() || normalizePhone(phone).length < 10) { setError('اكتب رقم الطلب ورقم الموبايل اللي سجلت بيه.'); return; }
    setLoading(true);
    try {
      const next = await trackOrder(orderNumber, phone);
      if (!next) setError('مش لاقيين طلب بالبيانات دي. راجعهم وجرب تاني.'); else setResult(next);
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : 'حصلت مشكلة في البحث.'); } finally { setLoading(false); }
  };

  const currentIndex = result ? Math.max(0, ORDER_STEPS.findIndex((step) => step.status === result.orderStatus)) : -1;

  return (
    <main className="bg-paper px-5 pb-24 pt-36 text-ink sm:px-8 sm:pb-32 lg:px-12"><div className="mx-auto max-w-[1000px]"><FadeIn><SectionLabel index="TRACKING">فيه جديد؟</SectionLabel><h1 className="mt-7 max-w-3xl text-[clamp(3rem,8vw,8rem)] font-bold leading-[0.9] tracking-[-0.06em]">تتبع طلبك</h1><p className="mt-6 max-w-xl text-base leading-8 text-ink/55">اكتب رقم الطلب ورقم الموبايل، وهنقولك وصلنا لفين.</p></FadeIn><div className="mt-12 grid gap-10 lg:grid-cols-[0.8fr_1.2fr]"><FadeIn delay={0.1} y={24}><form onSubmit={handleSubmit} className="rounded-[28px] border border-ink/12 bg-fog/35 p-5 sm:p-7"><Field id="order-number" label="رقم الطلب" value={orderNumber} onChange={(event) => setOrderNumber(event.target.value)} placeholder="SAIF-260829-XXXXX" className="font-display tracking-[0.06em]" /><Field id="track-phone" label="رقم الموبايل" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01xxxxxxxxx" inputMode="tel" className="mt-5" />{error ? <p className="field-error mt-3" role="alert">{error}</p> : null}<Button type="submit" disabled={loading} className="mt-6 w-full justify-center">{loading ? 'بندور...' : 'دور على الطلب'} <Search size={16} /></Button></form></FadeIn><FadeIn delay={0.18} y={24}>{result ? <TrackResult result={result} currentIndex={currentIndex} /> : <div className="flex h-full min-h-[280px] flex-col justify-center border-y border-ink/12 py-10"><p className="font-display text-7xl font-bold tracking-[-0.06em] text-ink/10">WHERE<br />IS IT?</p><p className="mt-4 max-w-xs text-sm leading-7 text-ink/45">الطلب بيبدأ بمراجعة التحويل، وبعدها بيتحضر ويتشحن لحد بابك.</p></div>}</FadeIn></div></div></main>
  );
}

function TrackResult({ result, currentIndex }: { result: OrderStatusResult; currentIndex: number }) {
  return <div className="rounded-[28px] border border-ink/12 bg-white/35 p-5 sm:p-8"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="eyebrow text-ink/45">{result.orderNumber}</p><h2 className="mt-3 text-2xl font-bold">يا {result.customerName}</h2><p className="mt-1 text-sm text-ink/50">طلبك اتسجل يوم {new Date(result.createdAt).toLocaleDateString('ar-EG')}</p></div><div className="flex flex-col items-end gap-2"><OrderStatusPill status={result.orderStatus} /><PaymentStatusPill status={result.paymentStatus} /></div></div><div className="mt-9 space-y-0">{ORDER_STEPS.map((step, index) => { const Icon = step.icon; const active = index <= currentIndex && result.orderStatus !== 'cancelled'; return <div key={step.status} className="relative flex gap-4 pb-7 last:pb-0"><div className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full border ${active ? 'border-ink bg-ink text-paper' : 'border-ink/15 bg-paper text-ink/30'}`}><Icon size={15} /></div>{index < ORDER_STEPS.length - 1 ? <span className={`absolute right-[17px] top-9 h-full w-px ${index < currentIndex ? 'bg-ink' : 'bg-ink/12'}`} aria-hidden="true" /> : null}<div className="pt-1"><p className={`text-sm font-bold ${active ? 'text-ink' : 'text-ink/35'}`}>{step.label}</p>{index === currentIndex ? <p className="mt-1 text-xs leading-6 text-ink/50">هنبعتلك تحديث أول ما الحالة تتغير.</p> : null}</div></div>; })}</div><div className="mt-7 flex items-baseline justify-between border-t border-ink/12 pt-5 text-sm"><span className="text-ink/50">إجمالي الطلب</span><strong>{formatEGP(result.total)}</strong></div></div>;
}
