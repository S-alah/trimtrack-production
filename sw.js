const CACHE_NAME = 'trimtrack-production-v2';
const ASSETS = [
  'index.html',
  'manifest.json',
  'icon.png'
];

// 1. مرحلة التثبيت: حفظ ملفات النظام الفني الأساسية في الكاش
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('تم فتح ذاكرة الكاش الفنية وتخزين الملفات بنجاح 📦');
      return cache.addAll(ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. مرحلة التفعيل: مسح إصدارات التخزين القديمة لتجنب تضارب الحسابات
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('جاري إزالة ملفات الكاش القديمة لتحديث النظام التشغيلي ومزامنة البيانات 🔄');
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. مرحلة الاستدعاء الذكي: تشغيل النظام الفني من الكاش مباشرة عند انقطاع الشبكة بصالة الإنتاج
self.addEventListener('fetch', (event) => {
  event.waitUntil(
    // نقوم بفحص الاستدعاءات العادية والتنقل الآمن فقط لتجنب معالجة بروتوكولات المتصفح الداخلية الخاصة بالكروم
    if (event.request.mode === 'navigate' || (event.request.url.startsWith('http') && event.request.method === 'GET')) {
      event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
          // إذا وجد الملف في الكاش يعاد فوراً للعمل أوفلاين، وإلا يتم جلبه من الشبكة
          return cachedResponse || fetch(event.request);
        })
      );
    }
  );
});
