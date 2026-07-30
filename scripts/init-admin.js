// سكربت تهيئة: يشفّر كلمتي المرور الابتدائيتين من .env ويخزّنهما في قاعدة البيانات.
// التشغيل مرة واحدة بعد إعداد Supabase وقبل أول استخدام للموقع:
//   node scripts_init_admin.js
require('dotenv').config();
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const adminPass = process.env.INITIAL_ADMIN_PASSWORD;
  const marketerPass = process.env.INITIAL_MARKETER_PASSWORD;

  if (!url || !serviceKey || !adminPass || !marketerPass) {
    console.error('تأكد من ضبط كل المتغيرات في ملف .env أولاً (انظر .env.example)');
    process.exit(1);
  }

  const supabase = createClient(url, serviceKey);
  const adminHash = await bcrypt.hash(adminPass, 10);
  const marketerHash = await bcrypt.hash(marketerPass, 10);

  const { error } = await supabase
    .from('app_settings')
    .upsert({ id: 1, admin_password_hash: adminHash, marketer_password_hash: marketerHash, updated_at: new Date().toISOString() });

  if (error) {
    console.error('فشل التهيئة:', error.message);
    process.exit(1);
  }
  console.log('تم ضبط كلمتي المرور بنجاح. يمكنك الآن تغييرهما لاحقاً من لوحة الإدارة.');
}

main();
