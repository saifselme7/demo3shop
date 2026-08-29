import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { SEED_CATEGORIES, SEED_PRODUCTS, SEED_SETTINGS } from '../data/catalog';
import { formatEGP, normalizePhone } from '../lib/format';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { resolvePublicMedia } from '../lib/media';
import { readStorage, writeStorage } from '../lib/storage';
import type {
  Category,
  CartItem,
  CheckoutPayload,
  OrderItemInput,
  OrderRecord,
  OrderStatus,
  OrderStatusResult,
  PaymentStatus,
  Product,
  StoreSettings,
} from '../types/store';

const CART_STORAGE_KEY = 'saif-store-cart';
const LOCAL_ORDERS_STORAGE_KEY = 'saif-store-orders';
const LAST_ORDER_STORAGE_KEY = 'saif-store-last-order';

interface ToastState {
  id: number;
  message: string;
  tone: 'dark' | 'light';
}

interface StoreContextValue {
  products: Product[];
  categories: Category[];
  settings: StoreSettings;
  loading: boolean;
  catalogError: string | null;
  isLive: boolean;
  cartItems: CartItem[];
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  cartCount: number;
  cartSubtotal: number;
  deliveryFee: number;
  cartTotal: number;
  toast: ToastState | null;
  addToCart: (product: Product, quantity?: number, size?: string, color?: string) => void;
  updateCartQuantity: (productId: string, quantity: number, size?: string, color?: string) => void;
  removeFromCart: (productId: string, size?: string, color?: string) => void;
  clearCart: () => void;
  refreshCatalog: () => Promise<void>;
  placeOrder: (payload: CheckoutPayload) => Promise<OrderRecord>;
  trackOrder: (orderNumber: string, phone: string) => Promise<OrderStatusResult | null>;
  lastOrder: OrderRecord | null;
  dismissToast: () => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord {
  return value && typeof value === 'object' ? (value as UnknownRecord) : {};
}

function mapCategory(row: UnknownRecord): Category {
  return {
    id: String(row.id ?? ''),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    description: String(row.description ?? ''),
    imageUrl: resolvePublicMedia(String(row.image_url ?? ''), 'store-assets'),
    isActive: Boolean(row.is_active ?? true),
    displayOrder: Number(row.sort_order ?? 0),
  };
}

function mapProduct(row: UnknownRecord, categoryRows: Category[]): Product {
  const relation = Array.isArray(row.categories)
    ? asRecord(row.categories[0])
    : asRecord(row.categories);
  const categoryId = String(row.category_id ?? relation.id ?? '');
  const category = categoryRows.find((entry) => entry.id === categoryId);
  const imageRows = Array.isArray(row.product_images) ? row.product_images : [];
  const images = imageRows
    .map((entry) => asRecord(entry))
    .sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0))
    .map((entry) => resolvePublicMedia(String(entry.image_url ?? ''), 'product-images'))
    .filter(Boolean);
  const fallbackImage = resolvePublicMedia(String(row.image_url ?? ''), 'product-images');

  return {
    id: String(row.id ?? ''),
    categoryId,
    categorySlug: String(relation.slug ?? category?.slug ?? ''),
    categoryName: String(relation.name ?? category?.name ?? ''),
    name: String(row.name ?? ''),
    slug: String(row.slug ?? ''),
    description: String(row.description ?? ''),
    price: Number(row.price ?? 0),
    oldPrice: row.old_price == null ? null : Number(row.old_price),
    discountPercent: row.discount_percent == null ? null : Number(row.discount_percent),
    sizes: Array.isArray(row.sizes) ? row.sizes.map(String) : [],
    colors: Array.isArray(row.colors) ? row.colors.map(String) : [],
    stock: Number(row.stock ?? 0),
    isActive: Boolean(row.is_active ?? true),
    isFeatured: Boolean(row.is_featured ?? false),
    displayOrder: Number(row.sort_order ?? 0),
    images: images.length ? images : fallbackImage ? [fallbackImage] : [],
  };
}

function mapSettings(row: UnknownRecord): StoreSettings {
  return {
    id: String(row.id ?? 'store'),
    storeName: String(row.store_name ?? SEED_SETTINGS.storeName),
    logoUrl: resolvePublicMedia(String(row.logo_url ?? ''), 'store-assets'),
    contactPhone: String(row.contact_phone ?? ''),
    whatsappNumber: String(row.whatsapp_number ?? ''),
    vodafoneCashNumber: String(row.vodafone_cash_number ?? ''),
    instapayNumber: String(row.instapay_number ?? ''),
    deliveryFee: Number(row.delivery_fee ?? 0),
    heroTitle: String(row.hero_title ?? SEED_SETTINGS.heroTitle),
    heroSubtitle: String(row.hero_subtitle ?? SEED_SETTINGS.heroSubtitle),
    promoText: String(row.promo_text ?? SEED_SETTINGS.promoText),
    storeDescription: String(row.store_description ?? SEED_SETTINGS.storeDescription),
    instagramUrl: String(row.instagram_url ?? ''),
    facebookUrl: String(row.facebook_url ?? ''),
    tiktokUrl: String(row.tiktok_url ?? ''),
  };
}

function makeOrderNumber(): string {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const suffix = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `SAIF-${stamp}-${suffix}`;
}

function randomId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `local-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function cartKey(productId: string, size?: string, color?: string): string {
  return `${productId}::${size ?? ''}::${color ?? ''}`;
}

function getResponseRecord(data: unknown): UnknownRecord {
  if (Array.isArray(data)) return asRecord(data[0]);
  return asRecord(data);
}

function toPaymentStatus(value: unknown): PaymentStatus {
  return value === 'approved' || value === 'rejected' ? value : 'pending';
}

function toOrderStatus(value: unknown): OrderStatus {
  return value === 'confirmed' || value === 'preparing' || value === 'shipped' || value === 'delivered' || value === 'cancelled'
    ? value
    : 'pending';
}

function mapRemoteOrder(data: unknown, cartItems: CartItem[], settings: StoreSettings, checkout?: CheckoutPayload): OrderRecord {
  const record = getResponseRecord(data);
  const fallbackItems = cartItems.map((item) => ({
    productId: item.product.id,
    productName: item.product.name,
    quantity: item.quantity,
    unitPrice: item.product.price,
    size: item.size ?? null,
    color: item.color ?? null,
    imageUrl: item.product.images[0],
  }));
  const subtotal = Number(record.subtotal ?? cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0));
  const delivery = Number(record.delivery_fee ?? settings.deliveryFee);

  return {
    id: String(record.id ?? randomId()),
    orderNumber: String(record.order_number ?? makeOrderNumber()),
    customerName: String(record.customer_name ?? checkout?.customerName ?? ''),
    phone: String(record.phone ?? (checkout ? normalizePhone(checkout.phone) : '')),
    email: record.email == null ? checkout?.email ?? null : String(record.email),
    address: String(record.address ?? checkout?.address ?? ''),
    notes: record.notes == null ? checkout?.notes ?? null : String(record.notes),
    items: fallbackItems,
    subtotal,
    deliveryFee: delivery,
    total: Number(record.total ?? subtotal + delivery),
    paymentMethod: record.payment_method === 'instapay' ? 'instapay' : 'vodafone_cash',
    transferPhone: String(record.transfer_phone ?? (checkout ? normalizePhone(checkout.transferPhone) : '')),
    paymentProofPath: record.payment_proof_path == null ? null : String(record.payment_proof_path),
    paymentStatus: toPaymentStatus(record.payment_status),
    paymentRejectionReason: record.payment_rejection_reason == null ? null : String(record.payment_rejection_reason),
    orderStatus: toOrderStatus(record.order_status),
    createdAt: String(record.created_at ?? new Date().toISOString()),
    updatedAt: record.updated_at == null ? undefined : String(record.updated_at),
  };
}

function mapTrackResult(data: unknown): OrderStatusResult | null {
  const record = getResponseRecord(data);
  if (!record.order_number) return null;
  const items = Array.isArray(record.items)
    ? record.items.map((entry) => {
        const item = asRecord(entry);
        return {
          productName: String(item.product_name ?? ''),
          quantity: Number(item.quantity ?? 0),
          unitPrice: Number(item.unit_price ?? 0),
          size: item.size == null ? null : String(item.size),
          color: item.color == null ? null : String(item.color),
        };
      })
    : [];

  return {
    orderNumber: String(record.order_number),
    customerName: String(record.customer_name ?? ''),
    total: Number(record.total ?? 0),
    paymentMethod: record.payment_method === 'instapay' ? 'instapay' : 'vodafone_cash',
    paymentStatus: toPaymentStatus(record.payment_status),
    orderStatus: toOrderStatus(record.order_status),
    createdAt: String(record.created_at ?? new Date().toISOString()),
    items,
  };
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [products, setProducts] = useState<Product[]>(SEED_PRODUCTS);
  const [categories, setCategories] = useState<Category[]>(SEED_CATEGORIES);
  const [settings, setSettings] = useState<StoreSettings>(SEED_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>(() => readStorage(CART_STORAGE_KEY, []));
  const [cartOpen, setCartOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [lastOrder, setLastOrder] = useState<OrderRecord | null>(() =>
    readStorage<OrderRecord | null>(LAST_ORDER_STORAGE_KEY, null),
  );
  const toastId = useRef(0);
  const toastTimer = useRef<number | null>(null);

  const showToast = useCallback((message: string, tone: ToastState['tone'] = 'dark') => {
    toastId.current += 1;
    setToast({ id: toastId.current, message, tone });
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const fetchCatalog = useCallback(async () => {
    const client = supabase;
    if (!client) {
      setLoading(false);
      return;
    }

    setCatalogError(null);
    setLoading(true);
    try {
      const [categoryResult, productResult, settingsResult] = await Promise.all([
        client.from('categories').select('*').order('sort_order', { ascending: true }),
        client
          .from('products')
          .select('*, categories(id, name, slug), product_images(id, image_url, sort_order)')
          .order('sort_order', { ascending: true }),
        client.from('store_settings').select('*').eq('id', 'store').maybeSingle(),
      ]);

      if (categoryResult.error) throw categoryResult.error;
      if (productResult.error) throw productResult.error;
      if (settingsResult.error) throw settingsResult.error;

      const remoteCategories = (categoryResult.data ?? []).map((row) => mapCategory(asRecord(row)));
      const activeCategories = remoteCategories.filter((category) => category.isActive);
      const activeCategoryIds = new Set(activeCategories.map((category) => category.id));
      const remoteProducts = (productResult.data ?? [])
        .map((row) => mapProduct(asRecord(row), remoteCategories))
        .filter((product) => product.isActive && activeCategoryIds.has(product.categoryId));

      // A successful live query is authoritative, including an intentionally empty catalog.
      setCategories(activeCategories);
      setProducts(remoteProducts);
      const remoteProductsById = new Map(remoteProducts.map((product) => [product.id, product]));
      setCartItems((current) => current.flatMap((item) => {
        const liveProduct = remoteProductsById.get(item.product.id);
        if (!liveProduct || liveProduct.stock <= 0) return [];
        return [{ ...item, product: liveProduct, quantity: Math.min(item.quantity, liveProduct.stock) }];
      }));
      if (settingsResult.data) setSettings(mapSettings(asRecord(settingsResult.data)));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'تعذر تحميل بيانات المتجر.';
      setCatalogError(message);
      // Keep the curated catalog visible if Supabase is empty or unavailable.
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchCatalog();
  }, [fetchCatalog]);

  useEffect(() => {
    writeStorage(CART_STORAGE_KEY, cartItems);
  }, [cartItems]);

  useEffect(() => {
    return () => {
      if (toastTimer.current) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const addToCart = useCallback(
    (product: Product, quantity = 1, size?: string, color?: string) => {
      if (product.stock <= 0 || !product.isActive) {
        showToast('المنتج ده خلص حالياً.');
        return;
      }
      const safeQuantity = Math.max(1, Math.floor(quantity));
      const key = cartKey(product.id, size, color);
      let couldAdd = true;

      setCartItems((current) => {
        const existing = current.find((item) => cartKey(item.product.id, item.size, item.color) === key);
        if (existing && existing.quantity >= product.stock) {
          couldAdd = false;
          return current;
        }

        if (!existing) {
          return [...current, { product, quantity: Math.min(safeQuantity, product.stock), size, color }];
        }

        return current.map((item) =>
          cartKey(item.product.id, item.size, item.color) === key
            ? { ...item, product, quantity: Math.min(item.quantity + safeQuantity, product.stock) }
            : item,
        );
      });

      if (!couldAdd) {
        showToast('وصلت لأقصى كمية متاحة من المنتج.');
        return;
      }
      setCartOpen(true);
      showToast(`${product.name} دخل السلة`,'light');
    },
    [showToast],
  );

  const updateCartQuantity = useCallback(
    (productId: string, quantity: number, size?: string, color?: string) => {
      const key = cartKey(productId, size, color);
      setCartItems((current) =>
        current
          .map((item) =>
            cartKey(item.product.id, item.size, item.color) === key
              ? { ...item, quantity: Math.max(0, Math.min(Math.floor(quantity), item.product.stock)) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      );
    },
    [],
  );

  const removeFromCart = useCallback((productId: string, size?: string, color?: string) => {
    const key = cartKey(productId, size, color);
    setCartItems((current) => current.filter((item) => cartKey(item.product.id, item.size, item.color) !== key));
  }, []);

  const clearCart = useCallback(() => setCartItems([]), []);

  const cartCount = useMemo(() => cartItems.reduce((sum, item) => sum + item.quantity, 0), [cartItems]);
  const cartSubtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cartItems],
  );
  const deliveryFee = cartItems.length ? settings.deliveryFee : 0;
  const cartTotal = cartSubtotal + deliveryFee;

  const placeOrder = useCallback(
    async (payload: CheckoutPayload): Promise<OrderRecord> => {
      if (!cartItems.length) throw new Error('السلة فاضية.');

      const itemInputs: OrderItemInput[] = cartItems.map((item) => ({
        product_id: item.product.id,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
      }));
      const orderPayload = {
        customer_name: payload.customerName.trim(),
        phone: normalizePhone(payload.phone),
        email: payload.email?.trim() || null,
        address: payload.address.trim(),
        notes: payload.notes?.trim() || null,
        payment_method: payload.paymentMethod,
        transfer_phone: normalizePhone(payload.transferPhone),
        payment_proof_path: null,
        items: itemInputs,
      };

      let order: OrderRecord;
      const client = supabase;
      if (client && isSupabaseConfigured) {
        if (!payload.paymentProof) throw new Error('إثبات الدفع مطلوب.');
        const body = new FormData();
        body.append('order', JSON.stringify(orderPayload));
        body.append('proof', payload.paymentProof);
        const { data, error } = await client.functions.invoke('create-order', { body });
        if (error) throw new Error('حصلت مشكلة وإحنا بنبعت إثبات التحويل. جرّب تاني.');
        order = mapRemoteOrder(asRecord(data).order ?? data, cartItems, settings, payload);
      } else {
        const subtotal = cartSubtotal;
        order = {
          id: randomId(),
          orderNumber: makeOrderNumber(),
          customerName: payload.customerName.trim(),
          phone: normalizePhone(payload.phone),
          email: payload.email?.trim() || null,
          address: payload.address.trim(),
          notes: payload.notes?.trim() || null,
          items: cartItems.map((item) => ({
            productId: item.product.id,
            productName: item.product.name,
            quantity: item.quantity,
            unitPrice: item.product.price,
            size: item.size ?? null,
            color: item.color ?? null,
            imageUrl: item.product.images[0],
          })),
          subtotal,
          deliveryFee: settings.deliveryFee,
          total: subtotal + settings.deliveryFee,
          paymentMethod: payload.paymentMethod,
          transferPhone: normalizePhone(payload.transferPhone),
          paymentProofPath: payload.paymentProof ? 'local-proof-attached' : null,
          paymentStatus: 'pending',
          paymentRejectionReason: null,
          orderStatus: 'pending',
          createdAt: new Date().toISOString(),
        };

        const existingOrders = readStorage<OrderRecord[]>(LOCAL_ORDERS_STORAGE_KEY, []);
        writeStorage(LOCAL_ORDERS_STORAGE_KEY, [order, ...existingOrders]);
      }

      setProducts((current) =>
        current.map((product) => {
          const line = cartItems.find((item) => item.product.id === product.id);
          return line ? { ...product, stock: Math.max(0, product.stock - line.quantity) } : product;
        }),
      );
      setLastOrder(order);
      writeStorage(LAST_ORDER_STORAGE_KEY, order);
      clearCart();
      setCartOpen(false);
      showToast(`طلبك ${order.orderNumber} اتسجل بنجاح`, 'light');
      return order;
    },
    [cartItems, cartSubtotal, clearCart, settings, showToast],
  );

  const trackOrder = useCallback(async (orderNumber: string, phone: string): Promise<OrderStatusResult | null> => {
    const normalizedNumber = orderNumber.trim().toUpperCase();
    const normalizedPhone = normalizePhone(phone);
    const client = supabase;

    if (client && isSupabaseConfigured) {
      const { data, error } = await client.rpc('get_public_order_status', {
        p_order_number: normalizedNumber,
        p_phone: normalizedPhone,
      });
      if (error) throw new Error('مش لاقيين طلب بالبيانات دي. راجع رقم الطلب ورقم الموبايل.');
      return mapTrackResult(data);
    }

    const localOrders = readStorage<OrderRecord[]>(LOCAL_ORDERS_STORAGE_KEY, []);
    const order = localOrders.find(
      (entry) => entry.orderNumber.toUpperCase() === normalizedNumber && normalizePhone(entry.phone) === normalizedPhone,
    );
    if (!order) return null;
    return {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      total: order.total,
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      orderStatus: order.orderStatus,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        size: item.size,
        color: item.color,
      })),
    };
  }, []);

  const value = useMemo<StoreContextValue>(
    () => ({
      products,
      categories,
      settings,
      loading,
      catalogError,
      isLive: isSupabaseConfigured,
      cartItems,
      cartOpen,
      setCartOpen,
      cartCount,
      cartSubtotal,
      deliveryFee,
      cartTotal,
      toast,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      refreshCatalog: fetchCatalog,
      placeOrder,
      trackOrder,
      lastOrder,
      dismissToast: () => setToast(null),
    }),
    [
      products,
      categories,
      settings,
      loading,
      catalogError,
      cartItems,
      cartOpen,
      cartCount,
      cartSubtotal,
      deliveryFee,
      cartTotal,
      toast,
      addToCart,
      updateCartQuantity,
      removeFromCart,
      clearCart,
      fetchCatalog,
      placeOrder,
      trackOrder,
      lastOrder,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used inside StoreProvider');
  return context;
}

export function cartLineLabel(item: CartItem): string {
  const options = [item.size, item.color].filter(Boolean).join(' · ');
  return options ? `${item.product.name} — ${options}` : item.product.name;
}

export function cartLineTotal(item: CartItem): string {
  return formatEGP(item.product.price * item.quantity);
}
