export type PaymentMethod = 'vodafone_cash' | 'instapay';
export type PaymentStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  isActive: boolean;
  displayOrder: number;
}

export interface Product {
  id: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  oldPrice: number | null;
  discountPercent: number | null;
  sizes: string[];
  colors: string[];
  stock: number;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  images: string[];
}

export interface StoreSettings {
  id: string;
  storeName: string;
  logoUrl: string;
  contactPhone: string;
  whatsappNumber: string;
  vodafoneCashNumber: string;
  instapayNumber: string;
  deliveryFee: number;
  heroTitle: string;
  heroSubtitle: string;
  promoText: string;
  storeDescription: string;
  instagramUrl: string;
  facebookUrl: string;
  tiktokUrl: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  size?: string;
  color?: string;
}

export interface OrderItemInput {
  productId: string;
  quantity: number;
  size?: string;
  color?: string;
}

export interface CheckoutPayload {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  notes?: string;
  paymentMethod: PaymentMethod;
  transferPhone: string;
  paymentProof?: File | null;
}

export interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  phone: string;
  email?: string | null;
  address: string;
  notes?: string | null;
  items: Array<{
    id?: string;
    productId?: string | null;
    productName: string;
    quantity: number;
    unitPrice: number;
    size?: string | null;
    color?: string | null;
    imageUrl?: string;
  }>;
  subtotal: number;
  deliveryFee: number;
  total: number;
  paymentMethod: PaymentMethod;
  transferPhone: string;
  paymentProofPath?: string | null;
  paymentStatus: PaymentStatus;
  paymentRejectionReason?: string | null;
  orderStatus: OrderStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface OrderStatusResult {
  orderNumber: string;
  customerName: string;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  createdAt: string;
  items: Array<{
    productName: string;
    quantity: number;
    unitPrice: number;
    size?: string | null;
    color?: string | null;
  }>;
}
