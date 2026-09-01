import type { Category, Product } from '../types/store';

const FASHION_NAV_SLUGS = ['tshirts', 'hoodies', 'sweatshirts', 'pants', 'jackets', 'shirts', 'shorts'];

export function fashionNavCategories(categories: Category[]): Category[] {
  const active = categories.filter((category) => category.isActive);
  const preferred = FASHION_NAV_SLUGS
    .map((slug) => active.find((category) => category.slug === slug))
    .filter((category): category is Category => Boolean(category));
  const rest = active.filter((category) => !preferred.some((entry) => entry.id === category.id));
  return [...preferred, ...rest];
}

export function newestProducts(products: Product[], count = 4): Product[] {
  return [...products]
    .filter((product) => product.isActive)
    .sort((a, b) => b.displayOrder - a.displayOrder || Number(b.isFeatured) - Number(a.isFeatured))
    .slice(0, count);
}

export function featuredProducts(products: Product[], count = 8): Product[] {
  const featured = products.filter((product) => product.isActive && product.isFeatured);
  if (featured.length) return featured.slice(0, count);
  return products.filter((product) => product.isActive).slice(0, count);
}

export function campaignProduct(products: Product[]): Product | undefined {
  return featuredProducts(products, 1)[0] ?? products.find((product) => product.isActive);
}
