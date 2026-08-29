import { ArrowLeft } from 'lucide-react';
import Link from './Link';
import { formatEGP } from '../lib/format';
import { useStore } from '../store/StoreProvider';

interface CartSummaryProps {
  checkout?: boolean;
}

export default function CartSummary({ checkout = false }: CartSummaryProps) {
  const { cartSubtotal, deliveryFee, cartTotal } = useStore();
  return (
    <aside className="cart-summary">
      <p className="eyebrow text-ink/50">SAIF / TOTAL</p>
      <div className="mt-5 space-y-3 text-sm">
        <div className="flex justify-between text-ink/60"><span>إجمالي المنتجات</span><span>{formatEGP(cartSubtotal)}</span></div>
        <div className="flex justify-between text-ink/60"><span>مصاريف التوصيل</span><span>{formatEGP(deliveryFee)}</span></div>
        <div className="mt-5 flex justify-between border-t border-ink/15 pt-5 text-lg font-bold"><span>إجمالي الطلب</span><span>{formatEGP(cartTotal)}</span></div>
      </div>
      {!checkout ? <Link to="/checkout" className="button-dark mt-7 w-full justify-between">كمل طلبك <ArrowLeft size={17} /></Link> : null}
      <p className="mt-4 text-center text-xs leading-6 text-ink/45">التوصيل لكل محافظات مصر · الدفع عن طريق تحويل بنكي موبايل</p>
    </aside>
  );
}
