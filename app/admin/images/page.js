'use client';
import { useEffect, useState, useRef } from 'react';
import { supabaseBrowser } from '@/lib/supabaseClient';
import ImageCard from '@/components/ImageCard';

export default function AdminImagesPage() {
  const [categories, setCategories] = useState([]);
  const [categoryId, setCategoryId] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const fileInputRef = useRef(null);

  async function loadCategories() {
    const d = await fetch('/api/categories').then((r) => r.json());
    const cats = d.categories || [];
    setCategories(cats);
    if (!categoryId && cats.length > 0) setCategoryId(cats[0].id);
  }

  async function loadImages(catId) {
    if (!catId) { setImages([]); return; }
    setLoading(true);
    const d = await fetch(`/api/images?category_id=${catId}`).then((r) => r.json());
    setImages(d.images || []);
    setLoading(false);
  }

  useEffect(() => { loadCategories(); }, []);
  useEffect(() => { loadImages(categoryId); }, [categoryId]);

  async function handleFilesSelected(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0 || !categoryId) return;

    setUploading(true);
    setProgress({ done: 0, total: files.length });

    const supabase = supabaseBrowser();
    const BATCH = 8;
    const confirmedItems = [];

    for (let i = 0; i < files.length; i += BATCH) {
      const batch = files.slice(i, i + BATCH);

      // 1) طلب روابط رفع موقّعة لهذه الدفعة
      const urlRes = await fetch('/api/images/upload-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category_id: categoryId,
          files: batch.map((f) => ({ filename: f.name })),
        }),
      }).then((r) => r.json());

      // 2) رفع كل ملف مباشرة إلى التخزين باستخدام الرابط الموقّع
      await Promise.all(
        (urlRes.uploads || []).map(async (u, idx) => {
          if (u.error) return;
          const file = batch[idx];
          const { error } = await supabase.storage
            .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || 'product-images')
            // ملاحظة: هذا المتغير يجب أن يطابق NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET في .env
            .uploadToSignedUrl(u.path, u.token, file);
          if (!error) {
            confirmedItems.push({ category_id: categoryId, storage_path: u.path });
          }
          setProgress((p) => ({ ...p, done: p.done + 1 }));
        })
      );
    }

    // 3) تأكيد إنشاء السجلات في قاعدة البيانات
    if (confirmedItems.length > 0) {
      await fetch('/api/images', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: confirmedItems }),
      });
    }

    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
    loadImages(categoryId);
  }

  async function handleDelete(image) {
    if (!confirm('حذف هذه الصورة نهائياً؟')) return;
    await fetch(`/api/images/${image.id}`, { method: 'DELETE' });
    setImages((prev) => prev.filter((i) => i.id !== image.id));
  }

  function handleSaved(updated) {
    setImages((prev) => prev.map((i) => (i.id === updated.id ? { ...i, ...updated } : i)));
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-900 mb-6">صور المنتجات</h1>

      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">القسم</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full sm:w-64 rounded-lg border border-slate-300 px-3 py-2 focus-ring focus:border-brand-500"
            >
              {categories.length === 0 && <option value="">أنشئ قسماً أولاً من صفحة الأقسام</option>}
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className={`inline-block px-5 py-2 rounded-lg font-medium cursor-pointer ${
              !categoryId || uploading ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-brand-700 text-white hover:bg-brand-800'
            }`}>
              {uploading ? `جارٍ الرفع... (${progress.done}/${progress.total})` : '⬆ رفع صور (يمكن اختيار عدة صور مرة واحدة)'}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handleFilesSelected}
                disabled={!categoryId || uploading}
                className="hidden"
              />
            </label>
          </div>
        </div>
        <p className="text-xs text-slate-400 mt-3">
          بعد رفع الصور، ستظهر أسفل الصفحة لكل صورة حقلا "اسم المنتج" و"السعر" لتعبئتهما وحفظهما.
        </p>
      </div>

      {loading ? (
        <div className="text-slate-400 py-16 text-center">جارٍ التحميل...</div>
      ) : images.length === 0 ? (
        <div className="text-slate-400 py-16 text-center">لا توجد صور في هذا القسم بعد</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((img) => (
            <ImageCard key={img.id} image={img} onSaved={handleSaved} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
