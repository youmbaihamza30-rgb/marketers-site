'use client';
import { useEffect, useState } from 'react';

const TABS = [
  { key: 'baladiyat', label: 'بلديات ولاية الوادي', nameLabel: 'البلدية' },
  { key: 'wilayat-home', label: 'كل الولايات - توصيل للمنزل', nameLabel: 'الولاية' },
  { key: 'wilayat-office', label: 'كل الولايات - توصيل للمكتب', nameLabel: 'الولاية' },
];

export default function DeliveryPage() {
  const [tab, setTab] = useState(TABS[0].key);
  const [rows, setRows] = useState([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/delivery/${tab}`)
      .then((r) => r.json())
      .then((d) => setRows(d.rows || []))
      .finally(() => setLoading(false));
  }, [tab]);

  const filtered = rows.filter((r) => r.name.includes(q));
  const activeTab = TABS.find((t) => t.key === tab);

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">أسعار التوصيل</h1>

      <div className="flex flex-wrap gap-2 mb-5">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => { setTab(t.key); setQ(''); }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors focus-ring ${
              tab === t.key ? 'bg-brand-700 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:border-brand-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={`ابحث عن ${activeTab.nameLabel}...`}
        className="rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500 w-full sm:w-72 mb-4"
      />

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="text-slate-400 py-16 text-center">جارٍ التحميل...</div>
        ) : filtered.length === 0 ? (
          <div className="text-slate-400 py-16 text-center">لا توجد نتائج</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-brand-50 text-brand-900">
                <th className="text-right py-3 px-5 font-bold">{activeTab.nameLabel}</th>
                <th className="text-right py-3 px-5 font-bold">سعر التوصيل</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r, i) => (
                <tr key={r.id} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                  <td className="py-2.5 px-5 text-slate-700">{r.name}</td>
                  <td className="py-2.5 px-5 font-semibold text-brand-700">{Number(r.price).toLocaleString('ar-DZ')} د.ج</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
