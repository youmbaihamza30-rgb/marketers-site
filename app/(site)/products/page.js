'use client';
import { useEffect, useMemo, useState } from 'react';

export default function MarketerProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/categories').then((r) => r.json()).then((d) => setCategories(d.categories || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('category_id', categoryId);
    fetch(`/api/products?${params}`)
      .then((r) => r.json())
      .then((d) => setProducts(d.products || []))
      .finally(() => setLoading(false));
  }, [q, categoryId]);

  const categoryName = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.id] = c.name));
    return map;
  }, [categories]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-brand-900">أسعار المنتجات</h1>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500 w-full sm:w-64"
          />
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2 focus-ring focus:border-brand-500"
          >
            <option value="">كل الأقسام</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-slate-400 py-20 text-center">جارٍ التحميل...</div>
      ) : products.length === 0 ? (
        <div className="text-slate-400 py-20 text-center">لا توجد منتجات مطابقة</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {products.map((p) => (
            <div key={p.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-square bg-slate-100">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 text-3xl">🖼️</div>
                )}
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm text-slate-800 truncate">{p.name}</div>
                {p.category_id && categoryName[p.category_id] && (
                  <div className="text-xs text-slate-400 mt-0.5">{categoryName[p.category_id]}</div>
                )}
                <div className="mt-2 font-bold text-brand-700">{Number(p.price).toLocaleString('ar-DZ')} د.ج</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
