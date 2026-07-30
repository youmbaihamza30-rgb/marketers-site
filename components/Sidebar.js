'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const SITE_LINKS = [
  { href: '/products', label: 'أسعار المنتجات', icon: '💰' },
  { href: '/images', label: 'صور المنتجات', icon: '🖼️' },
  { href: '/delivery', label: 'أسعار التوصيل', icon: '🚚' },
];

const ADMIN_LINKS = [
  { href: '/admin', label: 'الرئيسية', icon: '🏠' },
  { href: '/admin/products', label: 'المنتجات', icon: '💰' },
  { href: '/admin/categories', label: 'الأقسام', icon: '🗂️' },
  { href: '/admin/images', label: 'الصور', icon: '🖼️' },
  { href: '/admin/delivery', label: 'التوصيل', icon: '🚚' },
  { href: '/admin/settings', label: 'الإعدادات', icon: '⚙️' },
];

export default function Sidebar({ mode = 'site' }) {
  const pathname = usePathname();
  const router = useRouter();
  const links = mode === 'admin' ? ADMIN_LINKS : SITE_LINKS;

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 bg-white border-l border-slate-200 flex flex-col">
      <div className="px-5 py-5 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-brand-700 text-white flex items-center justify-center font-black">م</div>
          <div>
            <div className="font-bold text-brand-900 text-sm leading-tight">كتالوج المسوّقات</div>
            <div className="text-xs text-slate-400">{mode === 'admin' ? 'لوحة الإدارة' : 'واجهة المسوّقات'}</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const active = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors focus-ring ${
                active
                  ? 'bg-brand-700 text-white'
                  : 'text-slate-600 hover:bg-brand-50 hover:text-brand-800'
              }`}
            >
              <span className="text-base">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-slate-100">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-accent-500 transition-colors focus-ring"
        >
          <span>🚪</span>
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </aside>
  );
}
