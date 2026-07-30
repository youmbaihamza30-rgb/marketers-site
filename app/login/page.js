'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'حدث خطأ ما');
        setLoading(false);
        return;
      }
      router.push(data.role === 'admin' ? '/admin' : '/products');
      router.refresh();
    } catch {
      setError('تعذّر الاتصال بالخادم');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-brand-900 to-brand-700 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="mx-auto mb-4 w-14 h-14 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 text-2xl font-black">
            م
          </div>
          <h1 className="text-xl font-bold text-brand-900">كتالوج المسوّقات</h1>
          <p className="text-sm text-slate-500 mt-1">أدخل كلمة المرور للمتابعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5" htmlFor="password">
              كلمة المرور
            </label>
            <input
              id="password"
              type="password"
              autoFocus
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus-ring focus:border-brand-500"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-accent-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-bold rounded-lg py-2.5 transition-colors focus-ring"
          >
            {loading ? 'جارٍ الدخول...' : 'دخول'}
          </button>
        </form>
      </div>
    </div>
  );
}
