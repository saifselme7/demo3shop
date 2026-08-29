import { ArrowDown, ArrowUp, Check, Edit3, ImagePlus, Plus, Search, Star, ToggleLeft, ToggleRight, Trash2, X } from 'lucide-react';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import Button from '../../components/Button';
import FadeIn from '../../components/FadeIn';
import Field, { TextareaField } from '../../components/Field';
import PriceBlock from '../../components/PriceBlock';
import SafeImage from '../../components/SafeImage';
import { resolvePublicMedia } from '../../lib/media';
import { supabase } from '../../lib/supabase';
import type { Category, Product } from '../../types/store';

interface FormState {
  id?: string;
  name: string;
  slug: string;
  description: string;
  price: string;
  oldPrice: string;
  discountPercent: string;
  categoryId: string;
  stock: string;
  sizes: string;
  colors: string;
  imageUrls: string;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: string;
  files: File[];
}

const blankForm = (categoryId = ''): FormState => ({ name: '', slug: '', description: '', price: '', oldPrice: '', discountPercent: '', categoryId, stock: '0', sizes: 'S, M, L, XL', colors: 'أسود', imageUrls: '', isActive: true, isFeatured: false, displayOrder: '1', files: [] });

function mapAdminProduct(row: Record<string, unknown>, categories: Category[]): Product {
  const category = categories.find((entry) => entry.id === row.category_id);
  const relation = Array.isArray(row.categories) ? (row.categories[0] as Record<string, unknown> | undefined) : (row.categories as Record<string, unknown> | undefined);
  const imageRows = Array.isArray(row.product_images) ? row.product_images as Array<Record<string, unknown>> : [];
  return { id: String(row.id), categoryId: String(row.category_id), categorySlug: String(relation?.slug ?? category?.slug ?? ''), categoryName: String(relation?.name ?? category?.name ?? ''), name: String(row.name ?? ''), slug: String(row.slug ?? ''), description: String(row.description ?? ''), price: Number(row.price ?? 0), oldPrice: row.old_price == null ? null : Number(row.old_price), discountPercent: row.discount_percent == null ? null : Number(row.discount_percent), sizes: Array.isArray(row.sizes) ? row.sizes.map(String) : [], colors: Array.isArray(row.colors) ? row.colors.map(String) : [], stock: Number(row.stock ?? 0), isActive: Boolean(row.is_active), isFeatured: Boolean(row.is_featured), displayOrder: Number(row.sort_order ?? 0), images: imageRows.sort((a, b) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)).map((entry) => resolvePublicMedia(String(entry.image_url ?? ''), 'product-images')).filter(Boolean) };
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const client = supabase;
    if (!client) return;
    setLoading(true);
    const [categoryResult, productResult] = await Promise.all([
      client.from('categories').select('*').order('sort_order', { ascending: true }),
      client.from('products').select('*, categories(id, name, slug), product_images(id, image_url, sort_order)').order('sort_order', { ascending: true }),
    ]);
    if (categoryResult.error || productResult.error) {
      setError('تعذر تحميل المنتجات والتصنيفات. جرّب تحديث الصفحة.');
      setLoading(false);
      return;
    }
    const nextCategories = (categoryResult.data ?? []).map((row) => mapCategory(row as Record<string, unknown>));
    setCategories(nextCategories);
    setProducts((productResult.data ?? []).map((row) => mapAdminProduct(row as Record<string, unknown>, nextCategories)));
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => products.filter((product) => `${product.name} ${product.categoryName}`.toLowerCase().includes(search.toLowerCase())), [products, search]);
  const openNew = () => { setError(''); setMessage(''); setForm(blankForm(categories[0]?.id ?? '')); };
  const openEdit = (product: Product) => { setError(''); setMessage(''); setForm({ id: product.id, name: product.name, slug: product.slug, description: product.description, price: String(product.price), oldPrice: product.oldPrice ? String(product.oldPrice) : '', discountPercent: product.discountPercent ? String(product.discountPercent) : '', categoryId: product.categoryId, stock: String(product.stock), sizes: product.sizes.join(', '), colors: product.colors.join(', '), imageUrls: product.images.join('\n'), isActive: product.isActive, isFeatured: product.isFeatured, displayOrder: String(product.displayOrder), files: [] }); };
  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((current) => current ? { ...current, [key]: value } : current);

  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const client = supabase;
    if (!client || !form) return;
    setError(''); setMessage('');
    if (!form.name.trim() || !form.slug.trim() || !form.categoryId || Number(form.price) <= 0) { setError('الاسم، الرابط، التصنيف، والسعر بيانات أساسية.'); return; }
    setSaving(true);
    try {
      const productPayload = { name: form.name.trim(), slug: form.slug.trim(), description: form.description.trim(), price: Number(form.price), old_price: form.oldPrice ? Number(form.oldPrice) : null, discount_percent: form.discountPercent ? Number(form.discountPercent) : null, category_id: form.categoryId, stock: Math.max(0, Number(form.stock)), sizes: splitList(form.sizes), colors: splitList(form.colors), is_active: form.isActive, is_featured: form.isFeatured, sort_order: Number(form.displayOrder) || 0 };
      const result = form.id ? await client.from('products').update(productPayload).eq('id', form.id).select('id').single() : await client.from('products').insert(productPayload).select('id').single();
      if (result.error) throw result.error;
      const productId = String(result.data.id);
      const uploadedUrls: string[] = [];
      for (const file of form.files) {
        const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
        const path = `products/${productId}/${crypto.randomUUID()}.${ext}`;
        const upload = await client.storage.from('product-images').upload(path, file, { cacheControl: '31536000', upsert: false, contentType: file.type });
        if (upload.error) throw upload.error;
        uploadedUrls.push(client.storage.from('product-images').getPublicUrl(path).data.publicUrl);
      }
      const urls = [...form.imageUrls.split(/\n|,/).map((value) => value.trim()).filter(Boolean), ...uploadedUrls];
      await client.from('product_images').delete().eq('product_id', productId);
      if (urls.length) { const imageResult = await client.from('product_images').insert(urls.map((imageUrl, index) => ({ product_id: productId, image_url: imageUrl, sort_order: index }))); if (imageResult.error) throw imageResult.error; }
      setForm(null); setMessage(form.id ? 'المنتج اتعدل.' : 'المنتج اتضاف.'); await load();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : 'تعذر حفظ المنتج.'); } finally { setSaving(false); }
  };

  const toggle = async (product: Product, key: 'is_active' | 'is_featured') => { const client = supabase; if (!client) return; const { error: updateError } = await client.from('products').update({ [key]: !product[key === 'is_active' ? 'isActive' : 'isFeatured'] }).eq('id', product.id); if (updateError) setError(updateError.message); else await load(); };
  const deleteProduct = async (product: Product) => { if (!window.confirm(`تمسح ${product.name}؟`)) return; const client = supabase; if (!client) return; const { error: deleteError } = await client.from('products').delete().eq('id', product.id); if (deleteError) setError('مينفعش نمسح المنتج لو عليه طلبات. اقفله بدل المسح.'); else { setMessage('المنتج اتمسح.'); await load(); } };

  return <div><FadeIn><div className="admin-heading"><div><p className="eyebrow text-ink/40">الكتالوج / المنتجات</p><h1 className="mt-3 text-4xl font-bold">المنتجات</h1><p className="mt-2 text-sm text-ink/50">ضيف وعدّل وتحكم في كل قطعة من غير ما تلمس الكود.</p></div><Button onClick={openNew}><Plus size={17} /> منتج جديد</Button></div></FadeIn>{message ? <div className="admin-alert admin-alert-success mt-6"><Check size={16} /> {message}</div> : null}{error ? <div className="admin-alert admin-alert-error mt-6">{error}</div> : null}<FadeIn delay={0.1} y={20} className="admin-panel mt-8"><div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><span className="font-display text-3xl font-bold">{products.length}</span><span className="mr-2 text-sm text-ink/45">منتج</span></div><label className="admin-search"><Search size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="دور على منتج..." /></label></div><div className="mt-7 overflow-x-auto">{loading ? <div className="empty-admin">بنحمّل المنتجات...</div> : filtered.length ? <table className="admin-table admin-products-table"><thead><tr><th>المنتج</th><th>التصنيف</th><th>السعر</th><th>المخزون</th><th>ظاهر؟</th><th>إجراءات</th></tr></thead><tbody>{filtered.map((product) => <tr key={product.id}><td><div className="flex min-w-[220px] items-center gap-3"><div className="h-12 w-10 shrink-0 overflow-hidden bg-fog"><SafeImage src={product.images[0]} alt="" className="h-full w-full object-cover" /></div><div><p className="font-bold">{product.name}</p><p className="mt-1 text-[0.68rem] text-ink/40">/{product.slug}</p></div></div></td><td>{product.categoryName}</td><td><PriceBlock product={product} /></td><td><span className={product.stock < 5 ? 'font-bold text-red-700' : ''}>{product.stock}</span></td><td><button type="button" onClick={() => toggle(product, 'is_active')} aria-label={product.isActive ? 'اقفل المنتج' : 'فعّل المنتج'} className="text-ink/60">{product.isActive ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}</button>{product.isFeatured ? <Star size={13} className="mr-1 inline fill-ink" /> : null}</td><td><div className="flex items-center gap-1"><button type="button" onClick={() => openEdit(product)} className="admin-action" aria-label="عدّل المنتج"><Edit3 size={15} /></button><button type="button" onClick={() => toggle(product, 'is_featured')} className="admin-action" aria-label="بدّل المنتج المختار"><Star size={15} /></button><button type="button" onClick={() => deleteProduct(product)} className="admin-action text-red-800/60" aria-label="امسح المنتج"><Trash2 size={15} /></button></div></td></tr>)}</tbody></table> : <div className="empty-admin">مفيش منتجات بالبحث ده.</div>}</div></FadeIn>{form ? <ProductForm form={form} categories={categories} saving={saving} error={error} updateForm={updateForm} onSubmit={save} onClose={() => setForm(null)} /> : null}</div>;
}

function ProductForm({ form, categories, saving, error, updateForm, onSubmit, onClose }: { form: FormState; categories: Category[]; saving: boolean; error: string; updateForm: <K extends keyof FormState>(key: K, value: FormState[K]) => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onClose: () => void }) {
  const imageUrls = form.imageUrls.split(/\n|,/).map((value) => value.trim()).filter(Boolean);
  const setImageUrls = (next: string[]) => updateForm('imageUrls', next.join('\n'));

  return <div className="admin-modal-backdrop"><div className="admin-modal"><div className="flex items-start justify-between gap-4 border-b border-ink/10 pb-5"><div><p className="eyebrow text-ink/40">{form.id ? 'تعديل / منتج' : 'جديد / منتج'}</p><h2 className="mt-2 text-2xl font-bold">{form.id ? 'عدّل المنتج' : 'ضيف منتج'}</h2></div><button type="button" onClick={onClose} className="icon-button"><X size={18} /></button></div><form onSubmit={onSubmit} className="mt-6 space-y-5"><div className="grid gap-5 sm:grid-cols-2"><Field id="product-name" label="اسم المنتج" value={form.name} onChange={(event) => updateForm('name', event.target.value)} required /><Field id="product-slug" label="الرابط بالإنجليزي" value={form.slug} onChange={(event) => updateForm('slug', event.target.value)} required /><label className="field-wrap"><span className="field-label">التصنيف</span><select value={form.categoryId} onChange={(event) => updateForm('categoryId', event.target.value)} className="field-control" required><option value="">اختار التصنيف</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><Field id="display-order" label="ترتيب الظهور" type="number" min="0" value={form.displayOrder} onChange={(event) => updateForm('displayOrder', event.target.value)} /><Field id="product-price" label="السعر بالجنيه" type="number" min="0" value={form.price} onChange={(event) => updateForm('price', event.target.value)} required /><Field id="product-old-price" label="السعر القديم (اختياري)" type="number" min="0" value={form.oldPrice} onChange={(event) => updateForm('oldPrice', event.target.value)} /><Field id="discount-percent" label="نسبة الخصم (اختياري)" type="number" min="0" max="100" value={form.discountPercent} onChange={(event) => updateForm('discountPercent', event.target.value)} /><Field id="product-stock" label="المخزون" type="number" min="0" value={form.stock} onChange={(event) => updateForm('stock', event.target.value)} /></div><TextareaField id="product-description" label="الوصف" value={form.description} onChange={(event) => updateForm('description', event.target.value)} /><div className="grid gap-5 sm:grid-cols-2"><Field id="product-sizes" label="المقاسات" hint="افصل بينهم بفاصلة" value={form.sizes} onChange={(event) => updateForm('sizes', event.target.value)} /><Field id="product-colors" label="الألوان" hint="افصل بينهم بفاصلة" value={form.colors} onChange={(event) => updateForm('colors', event.target.value)} /></div><label className="field-wrap"><span className="field-label">روابط الصور</span><textarea value={form.imageUrls} onChange={(event) => updateForm('imageUrls', event.target.value)} className="field-control min-h-24" placeholder="رابط في كل سطر" /><span className="field-hint">ممكن تضيف ملفات من الزر اللي تحت كمان.</span></label>{imageUrls.length ? <div className="space-y-2 rounded-2xl border border-ink/10 p-3"><div className="flex items-center justify-between px-1 text-xs font-bold"><span>ترتيب الصور</span><span className="text-ink/40">{imageUrls.length} صور</span></div>{imageUrls.map((url, index) => <div key={`${url}-${index}`} className="flex items-center gap-3 rounded-xl bg-fog/45 p-2"><div className="h-12 w-10 shrink-0 overflow-hidden bg-fog"><SafeImage src={url} alt="" className="h-full w-full object-cover" /></div><span className="min-w-0 flex-1 truncate text-xs text-ink/55" dir="ltr">{url}</span><div className="flex shrink-0 items-center gap-1"><button type="button" disabled={index === 0} onClick={() => { const next = [...imageUrls]; [next[index - 1], next[index]] = [next[index], next[index - 1]]; setImageUrls(next); }} className="admin-action disabled:opacity-25" aria-label="قدّم الصورة"><ArrowUp size={14} /></button><button type="button" disabled={index === imageUrls.length - 1} onClick={() => { const next = [...imageUrls]; [next[index], next[index + 1]] = [next[index + 1], next[index]]; setImageUrls(next); }} className="admin-action disabled:opacity-25" aria-label="أخّر الصورة"><ArrowDown size={14} /></button><button type="button" onClick={() => setImageUrls(imageUrls.filter((_, imageIndex) => imageIndex !== index))} className="admin-action text-red-800/65" aria-label="احذف الصورة"><Trash2 size={14} /></button></div></div>)}</div> : null}<label className="upload-control"><ImagePlus size={18} /><span className="flex-1 text-sm font-semibold">{form.files.length ? `${form.files.length} صور جاهزة للرفع` : 'ارفع صور المنتج'}</span><input type="file" accept="image/png,image/jpeg,image/webp" multiple onChange={(event) => updateForm('files', Array.from(event.target.files ?? []))} className="sr-only" /></label><div className="flex flex-wrap gap-5"><label className="check-control"><input type="checkbox" checked={form.isActive} onChange={(event) => updateForm('isActive', event.target.checked)} /><span>ظاهر في المتجر</span></label><label className="check-control"><input type="checkbox" checked={form.isFeatured} onChange={(event) => updateForm('isFeatured', event.target.checked)} /><span>منتج مختار</span></label></div>{error ? <p className="field-error">{error}</p> : null}<div className="flex gap-3 border-t border-ink/10 pt-5"><Button type="submit" disabled={saving} className="flex-1 justify-center">{saving ? 'بنحفظ...' : 'احفظ المنتج'}</Button><button type="button" onClick={onClose} className="button-outline">إلغاء</button></div></form></div></div>;
}

function splitList(value: string): string[] { return value.split(',').map((entry) => entry.trim()).filter(Boolean); }
function mapCategory(row: Record<string, unknown>): Category { return { id: String(row.id), name: String(row.name ?? ''), slug: String(row.slug ?? ''), description: String(row.description ?? ''), imageUrl: resolvePublicMedia(String(row.image_url ?? ''), 'store-assets'), isActive: Boolean(row.is_active), displayOrder: Number(row.sort_order ?? 0) }; }
