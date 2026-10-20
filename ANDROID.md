# حصصي — بناء تطبيق أندرويد (APK)

> **مهم:** استضافة Lovable تنشر نسخة الويب فقط ولا تُخرج ملف APK مباشرة.
> ملف الـ APK يُنتَج فقط عبر سير عمل GitHub Actions الموجود في
> `.github/workflows/android-apk.yml` (أو بالبناء محلياً بـ Android Studio).

## الطريقة 1: GitHub Actions (موصى بها)
1. في Lovable افتح **Project settings → Git** وتحقق من عنوان المستودع والفرع المتزامن. لا يمكن تأكيد اتصال GitHub من ملفات المشروع وحدها.
2. إذا كان المستودع هو `AzizMo2030/hissi-android-project-test`، انتظر وصول التعديلات إلى الفرع المتزامن وتحقق من وجود `.github/workflows/android-apk.yml` و`bun.lock` فيه. ربط Git من Lovable ينشئ مستودعًا جديدًا ولا يربط مستودعًا موجودًا؛ إن كان الاتصال مختلفًا، انقل نسخة الكود المحدثة إلى المستودع المطلوب بنفسك.
3. افتح https://github.com/AzizMo2030/hissi-android-project-test/actions، وفعّل Actions إن ظهرت رسالة تعطيلها. يجب أن يوجد ملف سير العمل على الفرع الافتراضي حتى يظهر زر التشغيل اليدوي.
4. اختر **Build Android APK → Run workflow**، وحدد الفرع الذي يحتوي الكود المحدث، ثم اضغط **Run workflow**. الدفع إلى `main` أو `master` يشغّل البناء أيضًا.
5. انتظر انتهاء التشغيل وظهور علامة نجاح خضراء. افتح التشغيل ثم قسم **Artifacts → hissi-debug-apk**، ونزّل الأرشيف واستخرج ملف `app-debug.apk` منه (يبقى الأرشيف متاحًا لمدة 14 يومًا).
6. انقل ملف APK للهاتف وثبّته (فعّل "التثبيت من مصادر غير معروفة"). إن فشل التشغيل، افتح الخطوة الحمراء وأرسل سجل الخطأ بعد إخفاء أي بيانات حساسة.

وجود ملف سير العمل ليس دليلًا على إنتاج APK. لا تعتبر الملف جاهزًا إلا بعد نجاح تشغيل فعلي ووجود الملف داخل الأرشيف.

## الطريقة 2: محلياً
تحتاج Node.js 22 أو أحدث، وJava 21، وAndroid SDK 36 مع Build Tools 35.0.0. لا يحتوي هذا المشروع على مجلد `android` محفوظ؛ ينشئه Capacitor عند أول بناء.

```bash
bun install --frozen-lockfile
CAPACITOR=1 bun run build
[ -f dist/client/index.html ] || cp dist/client/_shell.html dist/client/index.html
[ -d android ] || bunx cap add android
bunx cap sync android
bunx cap open android  # ثم Build → Build APK
```

## التذكيرات
- على أندرويد: إشعارات محلية أسبوعية عند بداية ونهاية كل حصة (تعمل والتطبيق مغلق). اضغط زر "التذكيرات" لمنح الإذن.
- على الويب: إشعارات المتصفح تعمل فقط والصفحة مفتوحة.

## ملاحظات
- البيانات تُحفظ محلياً على الجهاز (localStorage).
- APK الناتج نسخة debug للتجربة؛ لنشره على Google Play تحتاج نسخة release موقّعة.
