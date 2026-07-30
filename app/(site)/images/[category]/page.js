'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import ImageLightbox from '@/components/ImageLightbox';

export default function CategoryImagesPage() {
  const params = useParams();
  const categoryId = params.category;
  const [category, setCategory] = useState(null);
  const [images, setImages] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [catRes, imgRes] = await Promise.all([
        fetch('/api/categories').then((r) => r.json()),
        fetch(`/api/images?category_id=${categoryId}`).then((r) => r.json()),
      ]);
      const cat = (catRes.categories || []).find((c) => c.id === categoryId);
      setCategory(cat || null);
      setImages(imgRes.images || []);
      setLoading(false);
    }
    load();
  }, [categoryId]);

  return (
    <div>
      <div className="mb-6">
        <Link href="/images" className="text-sm text-brand-600 hover:underline">← رجوع إلى الأقسام</Link>
        <h1 className="text-2xl font-bold text-brand-900 mt-2">{category?.name || '...'}</h1>
      </div>

      {loading ? (
        <div className="text-slate-400 py-20 text-center">جارٍ التحميل...</div>
      ) : images.length === 0 ? (
        <div className="text-slate-400 py-20 text-center">لا توجد صور في هذا القسم بعد</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {images.map((img) => (
            <button
              key={img.id}
              onClick={() => setSelected(img)}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-md transition-shadow text-right focus-ring"
            >
              <div className="aspect-square bg-slate-100">
                <img src={img.image_url} alt={img.name || ''} className="w-full h-full object-cover" loading="lazy" />
              </div>
              {(img.name || img.price != null) && (
                <div className="p-2.5">
                  {img.name && <div className="text-sm font-semibold text-slate-800 truncate">{img.name}</div>}
                  {img.price != null && <div className="text-brand-700 font-bold text-sm">{Number(img.price).toLocaleString('ar-DZ')} د.ج</div>}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      <ImageLightbox image={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
