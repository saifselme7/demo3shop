import type { OrderStatus, PaymentStatus } from '../types/store';

const orderLabels: Record<OrderStatus, string> = {
  pending: 'قيد المراجعة',
  confirmed: 'اتأكد',
  preparing: 'بيتحضر',
  shipped: 'اتشحن',
  delivered: 'اتسلّم',
  cancelled: 'اتلغى',
};

const paymentLabels: Record<PaymentStatus, string> = {
  pending: 'مستني تأكيد الدفع',
  approved: 'الدفع اتأكد',
  rejected: 'الدفع مرفوض',
};

export function OrderStatusPill({ status }: { status: OrderStatus }) {
  return <span className={`status-pill status-${status}`}>{orderLabels[status]}</span>;
}

export function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  return <span className={`status-pill payment-${status}`}>{paymentLabels[status]}</span>;
}
