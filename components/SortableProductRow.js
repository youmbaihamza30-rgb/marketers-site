'use client';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export default function SortableProductRow({ product, categories, onEdit, onDelete }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: product.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const categoryName = categories.find((c) => c.id === product.category_id)?.name;

  return (
    <tr ref={setNodeRef} style={style} className="bg-white border-b border-slate-100 last:border-0">
      <td className="py-2 px-3 w-10 text-center text-slate-300 cursor-grab active:cursor-grabbing" {...attributes} {...listeners}>
        ⠿
      </td>
      <td className="py-2 px-3 w-16">
        <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">🖼️</div>
          )}
        </div>
      </td>
      <td className="py-2 px-3 font-medium text-slate-800">{product.name}</td>
      <td className="py-2 px-3 text-slate-500 text-sm">{categoryName || '—'}</td>
      <td className="py-2 px-3 font-bold text-brand-700">{Number(product.price).toLocaleString('ar-DZ')} د.ج</td>
      <td className="py-2 px-3 flex gap-3">
        <button onClick={() => onEdit(product)} className="text-brand-600 text-sm hover:underline">تعديل</button>
        <button onClick={() => onDelete(product)} className="text-accent-500 text-sm hover:underline">حذف</button>
      </td>
    </tr>
  );
}
