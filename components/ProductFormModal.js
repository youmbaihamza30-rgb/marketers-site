'use client';
import { useState } from 'react';

export default function ProductFormModal({ product, categories, onClose, onSaved }) {
  const [name, setName] = useState(product?.name || '');
  const [price, setPrice] = useState(product?.price ?? '');
  const [categoryId, setCategoryId] = useState(product?.category_id || '');
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');

    const form = new FormData();
    form.set('name', name);
    form.set('price', price || 0);
    form.set('category_id', categoryId);
    if (file) form.set('image', file);

    const url = product ? `/api/products/${product.id}` : '/api/products';
    const method = product ? 'PATCH' : 'POST';

    const res = await fetch(url, { method, body: form });
    const data = await res.json();
    setBusy(false);

    if (!res.ok) {
      setError(data.error || 'حدث خطأ');
      return;
    }
    onSaved(data.product);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-bold text-lg text-brand-900 mb-4">{product ? 'تعديل المنتج' : 'إضافة منتج'}</h2>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">اسم المنتج</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">السعر</label>
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              type="number"
              step="0.01"
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">القسم</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500"
            >
              <option value="">بدون قسم</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              صورة المنتج {product && '(اتركها فارغة للإبقاء على الصورة الحالية)'}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />
          </div>

          {error && <p className="text-sm text-accent-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button disabled={busy} className="flex-1 bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold rounded-lg py-2.5">
              {busy ? 'جارٍ الحفظ...' : 'حفظ'}
            </button>
            <button type="button" onClick={onClose} className="px-5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
