-- ============================================================
-- سكيما قاعدة البيانات لموقع كتالوج المسوّقات
-- نفّذ هذا الملف بالكامل مرة واحدة من: Supabase Dashboard > SQL Editor
-- ============================================================

-- إعدادات عامة (كلمتا المرور المشفّرتان)
create table if not exists app_settings (
  id int primary key default 1,
  admin_password_hash text not null,
  marketer_password_hash text not null,
  updated_at timestamptz not null default now(),
  constraint single_row check (id = 1)
);

-- أقسام صور المنتجات (مخدات، أكواب، تيشرتات ...) وتُستخدم أيضاً كأقسام تصنيف عامة
create table if not exists categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

-- المنتجات (قسم "أسعار المنتجات")
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null default 0,
  image_path text,          -- المسار داخل bucket التخزين
  category_id uuid references categories(id) on delete set null,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_products_category on products(category_id);
create index if not exists idx_products_sort on products(sort_order);
create index if not exists idx_products_name_search on products using gin (to_tsvector('simple', name));

-- صور المنتجات (قسم "صور المنتجات") - مستقلة عن جدول المنتجات، منظمة حسب الأقسام
create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references categories(id) on delete cascade,
  storage_path text not null,     -- المسار داخل bucket
  name text,                      -- اسم المنتج (يُملأ بعد الرفع)
  price numeric(12,2),            -- السعر (يُملأ بعد الرفع)
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists idx_pimages_category on product_images(category_id);

-- جداول أسعار التوصيل الثلاثة
create table if not exists delivery_baladiyat (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null default 0,
  sort_order int not null default 0
);

create table if not exists delivery_wilayat_home (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null default 0,
  sort_order int not null default 0
);

create table if not exists delivery_wilayat_office (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric(12,2) not null default 0,
  sort_order int not null default 0
);

-- ============================================================
-- تفعيل Row Level Security: نمنع أي وصول مباشر من المتصفح.
-- كل القراءة/الكتابة تمر حصراً عبر واجهات API الخاصة بالموقع
-- والتي تستخدم مفتاح service_role (متجاوز لـ RLS بطبيعته).
-- ============================================================
alter table app_settings enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table delivery_baladiyat enable row level security;
alter table delivery_wilayat_home enable row level security;
alter table delivery_wilayat_office enable row level security;
-- لا نضيف أي policy => لا وصول إطلاقاً عبر anon key، فقط عبر service_role من السيرفر.

-- صف الإعدادات الابتدائي (سيتم تحديث الهاش الحقيقي عبر سكربت التهيئة init-admin.js)
insert into app_settings (id, admin_password_hash, marketer_password_hash)
values (1, '', '')
on conflict (id) do nothing;
