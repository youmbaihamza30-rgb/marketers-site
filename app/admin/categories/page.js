'use client';
import { useEffect, useState } from 'react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState('');
  const [busy, setBusy] = useState(false);

  async function load() {
    const d = await fetch('/api/categories').then((r) => r.json());
    setCategories(d.categories || []);
  }
  useEffect(() => { load(); }, []);

  async function addCategory(e) {
    e.preventDefault();
    if (!newName.trim()) return;
    setBusy(true);
    await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName.trim() }),
    });
    setNewName('');
    await load();
    setBusy(false);
  }

  async function saveEdit(id) {
    await fetch(`/api/categories/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: editingName }),
    });
    setEditingId(null);
    await load();
  }

  async function removeCategory(id) {
    if (!confirm('حذف هذا القسم سيحذف المنتجات والصور المرتبطة به من ظهورها هنا. هل أنت متأكد؟')) return;
    await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">الأقسام</h1>

      <form onSubmit={addCategory} className="flex gap-3 mb-6">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="اسم القسم الجديد (مثال: مخدات)"
          className="flex-1 max-w-sm rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500"
        />
        <button disabled={busy} className="px-5 py-2 rounded-lg bg-brand-700 text-white font-medium hover:bg-brand-800 disabled:opacity-60">
          إضافة قسم
        </button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100">
        {categories.length === 0 && <div className="p-6 text-center text-slate-400">لا توجد أقسام بعد</div>}
        {categories.map((c) => (
          <div key={c.id} className="flex items-center justify-between px-5 py-3">
            {editingId === c.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                className="rounded-lg border border-slate-300 px-3 py-1.5 focus-ring focus:border-brand-500"
                autoFocus
              />
            ) : (
              <span className="font-medium text-slate-800">{c.name}</span>
            )}

            <div className="flex gap-2">
              {editingId === c.id ? (
                <>
                  <button onClick={() => saveEdit(c.id)} className="text-sm text-brand-700 font-medium hover:underline">حفظ</button>
                  <button onClick={() => setEditingId(null)} className="text-sm text-slate-400 hover:underline">إلغاء</button>
                </>
              ) : (
                <>
                  <button onClick={() => { setEditingId(c.id); setEditingName(c.name); }} className="text-sm text-brand-600 hover:underline">تعديل</button>
                  <button onClick={() => removeCategory(c.id)} className="text-sm text-accent-500 hover:underline">حذف</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
