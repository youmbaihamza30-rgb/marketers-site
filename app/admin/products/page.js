'use client';
import { useEffect, useState } from 'react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import SortableProductRow from '@/components/SortableProductRow';
import ProductFormModal from '@/components/ProductFormModal';

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [q, setQ] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | 'new' | product

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  async function loadCategories() {
    const d = await fetch('/api/categories').then((r) => r.json());
    setCategories(d.categories || []);
  }

  async function loadProducts() {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (categoryId) params.set('category_id', categoryId);
    const d = await fetch(`/api/products?${params}`).then((r) => r.json());
    setProducts(d.products || []);
    setLoading(false);
  }

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadProducts(); }, [q, categoryId]);

  async function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = products.findIndex((p) => p.id === active.id);
    const newIndex = products.findIndex((p) => p.id === over.id);
    const reordered = arrayMove(products, oldIndex, newIndex);
    setProducts(reordered);

    const order = reordered.map((p, i) => ({ id: p.id, sort_order: i }));
    await fetch('/api/products/reorder', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order }),
    });
  }

  async function handleDelete(product) {
    if (!confirm(`حذف المنتج "${product.name}"؟`)) return;
    await fetch(`/api/products/${product.id}`, { method: 'DELETE' });
    loadProducts();
  }

  function handleSaved() {
    setModal(null);
    loadProducts();
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-brand-900">المنتجات</h1>
        <button onClick={() => setModal('new')} className="px-5 py-2 rounded-lg bg-brand-700 text-white font-medium hover:bg-brand-800 w-fit">
          + إضافة منتج
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="ابحث عن منتج..."
          className="rounded-lg border border-slate-300 px-4 py-2 focus-ring focus:border-brand-500 w-full sm:w-64"
        />
        <select
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          className="rounded-lg border border-slate-300 px-3 py-2 focus-ring focus:border-brand-500"
        >
          <option value="">كل الأقسام</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-slate-400 mb-3">اسحب أيقونة ⠿ لإعادة ترتيب المنتجات (متاح فقط بدون بحث أو فلترة)</p>

      <div className="bg-white rounded-xl border border-slate-200 overflow-x-auto">
        {loading ? (
          <div className="p-10 text-center text-slate-400">جارٍ التحميل...</div>
        ) : products.length === 0 ? (
          <div className="p-10 text-center text-slate-400">لا توجد منتجات</div>
        ) : (
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="bg-brand-50 text-brand-900 text-right">
                <th className="py-3 px-3 w-10"></th>
                <th className="py-3 px-3">الصورة</th>
                <th className="py-3 px-3">الاسم</th>
                <th className="py-3 px-3">القسم</th>
                <th className="py-3 px-3">السعر</th>
                <th className="py-3 px-3">إجراءات</th>
              </tr>
            </thead>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={products.map((p) => p.id)} strategy={verticalListSortingStrategy}>
                <tbody>
                  {products.map((p) => (
                    <SortableProductRow
                      key={p.id}
                      product={p}
                      categories={categories}
                      onEdit={setModal}
                      onDelete={handleDelete}
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </table>
        )}
      </div>

      {modal && (
        <ProductFormModal
          product={modal === 'new' ? null : modal}
          categories={categories}
          onClose={() => setModal(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
