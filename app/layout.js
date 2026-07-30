import { Tajawal } from 'next/font/google';
import './globals.css';

const tajawal = Tajawal({
  subsets: ['arabic'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-tajawal',
  display: 'swap',
});

export const metadata = {
  title: 'كتالوج المسوّقات',
  description: 'منصة أسعار وصور المنتجات وأسعار التوصيل الخاصة بالمسوّقات',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={tajawal.variable}>
      <body className="font-sans bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
