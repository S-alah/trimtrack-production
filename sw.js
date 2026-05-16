const CACHE_NAME = 'trimtrack-production-v4';
const ASSETS = [
  './',
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

// 2. مرحلة التفعيل: مسح إصدارات التخزين القديمة لتجنب تضارب البيانات
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('جاري إزالة ملفات الكاش القديمة لتحديث النظام 🔄');
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. مرحلة الاستدعاء الذكي: تشغيل النظام من الكاش مباشرة عند انقطاع الشبكة بصالة الإنتاج
self.addEventListener('fetch', (event) => {
  // التأكد من أن الطلب يعتمد على بروتوكول http أو https لضمان أمان المتصفح
  if (event.request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        // إذا كان الملف محفوظاً في ذاكرة الهاتف، افتحه فوراً بدون إنترنت
        if (cachedResponse) {
          return cachedResponse;
        }
        // إذا لم يكن موجوداً، قم بجلبه من الشبكة
        return fetch(event.request);
      })
    );
  }
});
