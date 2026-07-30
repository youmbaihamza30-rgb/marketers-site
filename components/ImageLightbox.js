'use client';
import { useEffect, useState } from 'react';

export default function ImageLightbox({ image, onClose }) {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setZoom(1);
    function onKey(e) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="absolute top-4 left-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setZoom((z) => Math.min(z + 0.5, 4))}
          className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full text-lg focus-ring"
          aria-label="تكبير"
        >
          +
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(z - 0.5, 1))}
          className="bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full text-lg focus-ring"
          aria-label="تصغير"
        >
          −
        </button>
        <a
          href={image.image_url}
          download
          onClick={(e) => e.stopPropagation()}
          className="bg-brand-600 hover:bg-brand-500 text-white px-4 h-10 rounded-full text-sm font-medium flex items-center gap-1.5 focus-ring"
        >
          تحميل الصورة الأصلية ⬇
        </a>
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full text-lg focus-ring"
        aria-label="إغلاق"
      >
        ✕
      </button>

      <div className="overflow-auto max-w-full max-h-full" onClick={(e) => e.stopPropagation()}>
        <img
          src={image.image_url}
          alt={image.name || ''}
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.2s' }}
          className="max-w-full max-h-[85vh] object-contain mx-auto"
        />
      </div>

      {(image.name || image.price) && (
        <div className="absolute bottom-4 inset-x-0 text-center text-white" onClick={(e) => e.stopPropagation()}>
          {image.name && <div className="font-bold">{image.name}</div>}
          {image.price != null && <div className="text-brand-200">{Number(image.price).toLocaleString('ar-DZ')} د.ج</div>}
        </div>
      )}
    </div>
  );
}
