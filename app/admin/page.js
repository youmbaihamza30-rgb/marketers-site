'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, images: 0 });

  useEffect(() => {
    async function load() {
      const [products, categories, images] = await Promise.all([
        fetch('/api/products').then((r) => r.json()),
        fetch('/api/categories').then((r) => r.json()),
        fetch('/api/images').then((r) => r.json()),
      ]);
      setStats({
        products: (products.products || []).length,
        categories: (categories.categories || []).length,
        images: (images.images || []).length,
      });
    }
    load();
  }, []);

  const cards = [
    { label: 'المنتجات', value: stats.products, href: '/admin/products', icon: '💰' },
    { label: 'الأقسام', value: stats.categories, href: '/admin/categories', icon: '🗂️' },
    { label: 'الصور', value: stats.images, href: '/admin/images', icon: '🖼️' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">مرحباً بك في لوحة الإدارة</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="bg-white rounded-xl border border-slate-200 p-6 hover:shadow-md transition-shadow">
            <div className="text-3xl mb-2">{c.icon}</div>
            <div className="text-3xl font-black text-brand-900">{c.value}</div>
            <div className="text-slate-500 text-sm mt-1">{c.label}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <h2 className="font-bold text-slate-800 mb-3">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products" className="px-4 py-2 rounded-lg bg-brand-700 text-white text-sm font-medium hover:bg-brand-800">إضافة منتج</Link>
          <Link href="/admin/images" className="px-4 py-2 rounded-lg bg-brand-50 text-brand-800 text-sm font-medium hover:bg-brand-100">رفع صور</Link>
          <Link href="/admin/delivery" className="px-4 py-2 rounded-lg bg-brand-50 text-brand-800 text-sm font-medium hover:bg-brand-100">تعديل أسعار التوصيل</Link>
          <Link href="/admin/settings" className="px-4 py-2 rounded-lg bg-brand-50 text-brand-800 text-sm font-medium hover:bg-brand-100">تغيير كلمات المرور</Link>
        </div>
      </div>
    </div>
  );
}
