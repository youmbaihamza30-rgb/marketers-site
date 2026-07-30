'use client';
import { useEffect, useState } from 'react';

const TABS = [
  { key: 'baladiyat', label: 'بلديات ولاية الوادي', nameLabel: 'اسم البلدية' },
  { key: 'wilayat-home', label: 'كل الولايات - توصيل للمنزل', nameLabel: 'اسم الولاية' },
  { key: 'wilayat-office', label: 'كل الولايات - توصيل للمكتب', nameLabel: 'اسم الولاية' },
];

export default function AdminDeliveryPage() {
  const [tab, setTab] = useState(TABS[0].key);
  const [rows, setRows] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const d = await fetch(`/api/delivery/${tab}`).then((r) => r.json());
    setRows(d.rows || []);
    setLoading(false);
  }
  useEffect(() => { load(); }, [tab]);

  async function addRow(e) {
    e.preventDefault();
    if (!name.trim()) return;
    await fetch(`/api/delivery/${tab}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, price: parseFloat(price) || 0 }),
    });
    setName(''); setPrice('');
    await load();
  }

  async function saveEdit() {
    await fetch(`/api/delivery/${tab}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: editing.id, name: editing.name, price: editing.price }),
    });
    setEditing(null);
    await load();
  }

  async function removeRow(id) {
    if (!confirm('حذف هذا السطر؟')) return;
    await fetch(`/api/delivery/${tab}?id=${id}`, { method: 'DELETE' });
    await load();
  }

  const activeTab = TABS.find((t) => t.key === tab);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">أسعار التوصيل</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-ring ${
              tab === t.key ? 'bg-brand-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <form onSubmit={addRow} className="flex flex-wrap gap-3 mb-6">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={activeTab.nameLabel}
          className="rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500 w-56"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="سعر التوصيل"
          type="number"
          step="0.01"
          className="rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500 w-40"
        />
        <button className="px-5 py-2 rounded-lg bg-brand-700 text-white font-medium hover:bg-brand-800">إضافة</button>
      </form>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400">جارٍ التحميل...</div>
        ) : rows.length === 0 ? (
          <div className="p-10 text-center text-slate-400">لا توجد بيانات بعد</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-50 text-brand-900">
                <th className="text-right py-3 px-5 font-bold">{activeTab.nameLabel}</th>
                <th className="text-right py-3 px-5 font-bold">السعر</th>
                <th className="text-right py-3 px-5 font-bold w-32">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  {editing?.id === r.id ? (
                    <>
                      <td className="py-2 px-5">
                        <input
                          value={editing.name}
                          onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                          className="rounded border border-slate-300 px-2 py-1 w-full"
                        />
                      </td>
                      <td className="py-2 px-5">
                        <input
                          type="number"
                          value={editing.price}
                          onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                          className="rounded border border-slate-300 px-2 py-1 w-28"
                        />
                      </td>
                      <td className="py-2 px-5 flex gap-2">
                        <button onClick={saveEdit} className="text-brand-700 font-medium hover:underline">حفظ</button>
                        <button onClick={() => setEditing(null)} className="text-slate-400 hover:underline">إلغاء</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2.5 px-5 text-slate-700">{r.name}</td>
                      <td className="py-2.5 px-5 font-semibold text-brand-700">{Number(r.price).toLocaleString('ar-DZ')} د.ج</td>
                      <td className="py-2.5 px-5 flex gap-3">
                        <button onClick={() => setEditing(r)} className="text-brand-600 text-sm hover:underline">تعديل</button>
                        <button onClick={() => removeRow(r.id)} className="text-accent-500 text-sm hover:underline">حذف</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
