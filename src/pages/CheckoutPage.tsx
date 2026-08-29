import { ArrowLeft, Check, FileImage, LockKeyhole, Smartphone, UploadCloud } from 'lucide-react';
import { FormEvent, useState } from 'react';
import Button from '../components/Button';
import CartSummary from '../components/CartSummary';
import FadeIn from '../components/FadeIn';
import Field, { TextareaField } from '../components/Field';
import Link from '../components/Link';
import SectionLabel from '../components/SectionLabel';
import { formatEGP, isValidEgyptianPhone } from '../lib/format';
import { navigate } from '../lib/navigation';
import { useStore } from '../store/StoreProvider';
import type { PaymentMethod } from '../types/store';

interface FormErrors {
  customerName?: string;
  phone?: string;
  address?: string;
  transferPhone?: string;
  proof?: string;
}

export default function CheckoutPage() {
  const { cartItems, settings, cartTotal, placeOrder, loading, isLive } = useStore();
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('vodafone_cash');
  const [transferPhone, setTransferPhone] = useState('');
  const [proof, setProof] = useState<File | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!cartItems.length) {
    return <main className="flex min-h-[75vh] items-center justify-center bg-paper px-5 pt-32 text-center"><div><p className="eyebrow text-ink/45">CHECKOUT / 00</p><h1 className="mt-5 text-4xl font-bold">مفيش حاجة نأكدها.</h1><p className="mt-3 text-sm text-ink/50">حط قطعة في السلة الأول وبعدها نكمل الطلب.</p><Link to="/products" className="button-dark mt-8">شوف التشكيلة <ArrowLeft size={16} /></Link></div></main>;
  }

  const paymentNumber = paymentMethod === 'vodafone_cash' ? settings.vodafoneCashNumber : settings.instapayNumber;
  const validate = (): FormErrors => {
    const next: FormErrors = {};
    if (customerName.trim().length < 3) next.customerName = 'اكتب اسمك التلاتي أو الاسم اللي بنناديك بيه.';
    if (!isValidEgyptianPhone(phone)) next.phone = 'اكتب رقم موبايل مصري مظبوط.';
    if (address.trim().length < 10) next.address = 'اكتب العنوان بالتفصيل عشان المندوب يوصلك.';
    if (!isValidEgyptianPhone(transferPhone)) next.transferPhone = 'اكتب الرقم اللي حولت منه.';
    if (!proof) next.proof = 'ارفع صورة التحويل عشان نراجع الطلب.';
    if (proof && (!proof.type.startsWith('image/') || proof.size > 5 * 1024 * 1024)) next.proof = 'الصورة لازم تكون أقل من ٥ ميجا وبصيغة صورة.';
    return next;
  };

  const handleFile = (file: File | undefined) => {
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) {
      setErrors((current) => ({ ...current, proof: 'الصورة لازم تكون أقل من ٥ ميجا وبصيغة صورة.' }));
      setProof(null);
      return;
    }
    setProof(file);
    setErrors((current) => ({ ...current, proof: undefined }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);
    setSubmitError('');
    if (Object.keys(nextErrors).length) return;
    setSubmitting(true);
    try {
      const order = await placeOrder({ customerName, phone, email, address, notes, paymentMethod, transferPhone, paymentProof: proof });
      navigate(`/success/${order.orderNumber}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'حصلت مشكلة. جرّب تاني.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="bg-paper px-5 pb-24 pt-36 text-ink sm:px-8 sm:pb-32 lg:px-12">
      <div className="mx-auto max-w-[1240px]">
        <FadeIn><SectionLabel index="CHECKOUT">كمل طلبك</SectionLabel><h1 className="mt-7 max-w-3xl text-[clamp(2.8rem,7vw,7rem)] font-bold leading-[0.95] tracking-[-0.055em]">خطوة واحدة<br /><span className="text-ink/35">وتبقى القطعة عندك.</span></h1></FadeIn>
        <div className="mt-14 grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-20">
          <FadeIn delay={0.1} y={24}><form onSubmit={handleSubmit} className="space-y-10" noValidate>
            <section><div className="mb-6 flex items-center gap-3"><span className="step-number">01</span><div><h2 className="text-xl font-bold">بيانات التوصيل</h2><p className="mt-1 text-xs text-ink/45">هنستخدمها عشان نوصل لك من غير لف.</p></div></div><div className="grid gap-5 sm:grid-cols-2"><Field id="customer-name" label="الاسم" value={customerName} onChange={(event) => setCustomerName(event.target.value)} placeholder="اكتب اسمك" autoComplete="name" error={errors.customerName} /><Field id="phone" label="رقم الموبايل" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01xxxxxxxxx" inputMode="tel" autoComplete="tel" error={errors.phone} /><Field id="email" label="الإيميل (اختياري)" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@email.com" autoComplete="email" /><div className="sm:col-span-2"><TextareaField id="address" label="العنوان بالتفصيل" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="المحافظة، المنطقة، الشارع، رقم العمارة والشقة" error={errors.address} autoComplete="street-address" /></div><div className="sm:col-span-2"><TextareaField id="notes" label="ملاحظات (اختياري)" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="أي حاجة تحب تقولها للمندوب؟" /></div></div></section>
            <section className="border-t border-ink/12 pt-10"><div className="mb-6 flex items-center gap-3"><span className="step-number">02</span><div><h2 className="text-xl font-bold">طريقة الدفع</h2><p className="mt-1 text-xs text-ink/45">حوّل قيمة الطلب وبعتلنا الإثبات.</p></div></div><div className="grid gap-3 sm:grid-cols-2"><button type="button" onClick={() => setPaymentMethod('vodafone_cash')} className={`payment-choice ${paymentMethod === 'vodafone_cash' ? 'payment-choice-selected' : ''}`}><span className="payment-icon">VF</span><span className="flex-1 text-right"><strong className="block text-sm">Vodafone Cash</strong><small className="mt-1 block text-xs text-ink/45">تحويل من المحفظة</small></span>{paymentMethod === 'vodafone_cash' ? <Check size={17} /> : null}</button><button type="button" onClick={() => setPaymentMethod('instapay')} className={`payment-choice ${paymentMethod === 'instapay' ? 'payment-choice-selected' : ''}`}><span className="payment-icon font-display text-xs">IP</span><span className="flex-1 text-right"><strong className="block text-sm">InstaPay</strong><small className="mt-1 block text-xs text-ink/45">تحويل لحظي</small></span>{paymentMethod === 'instapay' ? <Check size={17} /> : null}</button></div><div className="payment-instructions mt-5"><div className="flex items-start gap-3"><Smartphone size={19} className="mt-1 shrink-0" /><div><p className="text-sm font-bold">حوّل {formatEGP(cartTotal)} على الرقم ده</p><p className="mt-2 break-all font-display text-xl tracking-[0.04em]">{paymentNumber || 'الرقم هيتضاف قريباً'}</p><p className="mt-2 text-xs leading-6 text-ink/55">بعد التحويل، اكتب الرقم اللي حولت منه وارفع صورة واضحة للإيصال.</p></div></div></div><div className="mt-5 grid gap-5 sm:grid-cols-2"><Field id="transfer-phone" label="رقم الموبايل اللي حولت منه" value={transferPhone} onChange={(event) => setTransferPhone(event.target.value)} placeholder="01xxxxxxxxx" inputMode="tel" error={errors.transferPhone} /><label htmlFor="payment-proof" className="field-wrap"><span className="field-label">صورة التحويل</span><span className={`upload-control ${errors.proof ? 'border-red-700' : ''}`}><UploadCloud size={18} /><span className="min-w-0 flex-1 truncate">{proof ? proof.name : 'اختار صورة الإيصال'}</span><input id="payment-proof" type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => handleFile(event.target.files?.[0])} className="sr-only" /></span>{proof ? <span className="field-hint flex items-center gap-1"><FileImage size={12} /> الصورة جاهزة للمراجعة</span> : <span className="field-hint">PNG أو JPG أو WEBP · لحد ٥ ميجا</span>}{errors.proof ? <span className="field-error">{errors.proof}</span> : null}</label></div></section>
            {submitError ? <div className="rounded-2xl border border-red-800/20 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800" role="alert">{submitError}</div> : null}
            {!isLive ? <div className="rounded-2xl border border-ink/10 bg-fog/45 px-4 py-3 text-xs leading-6 text-ink/55"><LockKeyhole size={14} className="ml-1 inline" /> وضع المعاينة شغال: الطلب هيتحفظ على الجهاز ده. عند ربط Supabase، الإثبات هيروح لتخزين خاص.</div> : null}
            <Button type="submit" disabled={submitting || loading} className="w-full justify-center sm:w-auto sm:min-w-[260px]" arrow>{submitting ? 'بنأكد طلبك...' : 'أكد الطلب'}</Button>
          </form></FadeIn>
          <FadeIn delay={0.2} y={24} className="lg:sticky lg:top-32 lg:self-start"><CartSummary checkout /><div className="mt-7 border-t border-ink/12 pt-6"><p className="eyebrow text-ink/45">محتويات الطلب</p><div className="mt-4 space-y-3">{cartItems.map((item) => <div key={`${item.product.id}-${item.size}-${item.color}`} className="flex items-center justify-between gap-3 text-xs"><span className="min-w-0 truncate text-ink/60">{item.product.name} <span className="text-ink/35">× {item.quantity}</span></span><span className="shrink-0 font-bold">{formatEGP(item.product.price * item.quantity)}</span></div>)}</div></div></FadeIn>
        </div>
      </div>
    </main>
  );
}
