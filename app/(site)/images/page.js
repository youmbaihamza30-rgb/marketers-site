'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function ImageCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const catRes = await fetch('/api/categories').then((r) => r.json());
      const cats = catRes.categories || [];
      setCategories(cats);

      const entries = await Promise.all(
        cats.map(async (c) => {
          const res = await fetch(`/api/images?category_id=${c.id}`).then((r) => r.json());
          return [c.id, (res.images || []).length];
        })
      );
      setCounts(Object.fromEntries(entries));
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">صور المنتجات</h1>

      {loading ? (
        <div className="text-slate-400 py-20 text-center">جارٍ التحميل...</div>
      ) : categories.length === 0 ? (
        <div className="text-slate-400 py-20 text-center">لا توجد أقسام بعد</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/images/${c.id}`}
              className="bg-white rounded-xl border border-slate-200 p-6 text-center hover:shadow-md hover:border-brand-300 transition-all"
            >
              <div className="w-14 h-14 mx-auto rounded-full bg-brand-50 flex items-center justify-center text-2xl mb-3">🗂️</div>
              <div className="font-bold text-slate-800">{c.name}</div>
              <div className="text-xs text-slate-400 mt-1">{counts[c.id] ?? 0} صورة</div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
