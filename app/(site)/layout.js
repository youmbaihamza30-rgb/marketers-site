import Sidebar from '@/components/Sidebar';

export default function SiteLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-row-reverse">
      <Sidebar mode="site" />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
