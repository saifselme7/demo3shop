import type { Product } from '../types/store';

const egpFormatter = new Intl.NumberFormat('ar-EG', {
  style: 'currency',
  currency: 'EGP',
  maximumFractionDigits: 0,
});

export function formatEGP(value: number): string {
  return egpFormatter.format(value).replace('ج.م.', 'جنيه');
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ar-EG').format(value);
}

export function productDiscount(product: Product): number | null {
  if (product.discountPercent) return product.discountPercent;
  if (!product.oldPrice || product.oldPrice <= product.price) return null;
  return Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100);
}

export function productPath(product: Pick<Product, 'slug'>): string {
  return `/product/${product.slug}`;
}

export function categoryPath(slug: string): string {
  return `/category/${slug}`;
}

export function normalizePhone(value: string): string {
  return value.replace(/[^0-9]/g, '').replace(/^20/, '');
}

export function isValidEgyptianPhone(value: string): boolean {
  const normalized = normalizePhone(value);
  return /^01[0125][0-9]{8}$/.test(normalized);
}

export function getImageUrl(images: string[], fallback = ''): string {
  return images[0] || fallback;
}
