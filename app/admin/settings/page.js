'use client';
import { useState } from 'react';

function PasswordForm({ target, title }) {
  const [value, setValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setMsg(null);
    if (value !== confirm) {
      setMsg({ type: 'error', text: 'كلمتا المرور غير متطابقتين' });
      return;
    }
    setBusy(true);
    const res = await fetch('/api/admin/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ target, newPassword: value }),
    });
    const data = await res.json();
    setBusy(false);
    if (!res.ok) {
      setMsg({ type: 'error', text: data.error || 'فشل التحديث' });
      return;
    }
    setMsg({ type: 'success', text: 'تم تحديث كلمة المرور بنجاح' });
    setValue('');
    setConfirm('');
  }

  return (
    <form onSubmit={submit} className="bg-white rounded-xl border border-slate-200 p-6">
      <h2 className="font-bold text-slate-800 mb-4">{title}</h2>
      <div className="space-y-3 max-w-sm">
        <input
          type="password"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="كلمة المرور الجديدة"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500"
          required
          minLength={4}
        />
        <input
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          placeholder="تأكيد كلمة المرور"
          className="w-full rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500"
          required
          minLength={4}
        />
        {msg && (
          <p className={`text-sm rounded-lg px-3 py-2 ${msg.type === 'error' ? 'bg-red-50 text-accent-500' : 'bg-green-50 text-green-700'}`}>
            {msg.text}
          </p>
        )}
        <button disabled={busy} className="px-5 py-2 rounded-lg bg-brand-700 text-white font-medium hover:bg-brand-800 disabled:opacity-60">
          {busy ? 'جارٍ الحفظ...' : 'حفظ'}
        </button>
      </div>
    </form>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">الإعدادات</h1>
      <div className="space-y-6 max-w-2xl">
        <PasswordForm target="admin" title="تغيير كلمة مرور المدير" />
        <PasswordForm target="marketer" title="تغيير كلمة مرور المسوّقات (تُطبّق فوراً على الجميع)" />
      </div>
    </div>
  );
}
