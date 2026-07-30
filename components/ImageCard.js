'use client';
import { useState } from 'react';

export default function ImageCard({ image, onSaved, onDelete }) {
  const [name, setName] = useState(image.name || '');
  const [price, setPrice] = useState(image.price ?? '');
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  async function save() {
    setSaving(true);
    const res = await fetch(`/api/images/${image.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: price === '' ? null : parseFloat(price) }),
    });
    const data = await res.json();
    setSaving(false);
    setDirty(false);
    if (res.ok) onSaved(data.image);
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="aspect-square bg-slate-100 relative">
        <img src={image.image_url} alt={name} className="w-full h-full object-cover" loading="lazy" />
        <button
          onClick={() => onDelete(image)}
          className="absolute top-1.5 left-1.5 w-7 h-7 rounded-full bg-black/50 hover:bg-accent-600 text-white text-sm flex items-center justify-center"
          title="حذف الصورة"
        >
          ✕
        </button>
      </div>
      <div className="p-2.5 space-y-1.5">
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setDirty(true); }}
          placeholder="اسم المنتج"
          className="w-full text-sm rounded border border-slate-200 px-2 py-1 focus-ring focus:border-brand-500"
        />
        <input
          value={price}
          onChange={(e) => { setPrice(e.target.value); setDirty(true); }}
          placeholder="السعر"
          type="number"
          step="0.01"
          className="w-full text-sm rounded border border-slate-200 px-2 py-1 focus-ring focus:border-brand-500"
        />
        {dirty && (
          <button
            onClick={save}
            disabled={saving}
            className="w-full text-xs bg-brand-700 hover:bg-brand-800 text-white rounded py-1.5 font-medium disabled:opacity-60"
          >
            {saving ? 'جارٍ الحفظ...' : 'حفظ'}
          </button>
        )}
      </div>
    </div>
  );
}
