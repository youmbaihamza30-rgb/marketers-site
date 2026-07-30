import Sidebar from '@/components/Sidebar';

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-row-reverse">
      <Sidebar mode="admin" />
      <main className="flex-1 min-w-0 p-6 lg:p-8">{children}</main>
    </div>
  );
}
