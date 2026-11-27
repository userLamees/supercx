# نقل SuperCX إلى Replit

دليل خطوة بخطوة لتشغيل المشروع على Replit. كل شيء يعمل بالبيانات التجريبية من أول يوم، وكل ربط يتحول إلى فعلي بإضافة إعداداته في **Secrets** دون تعديل الكود.

## 1. استيراد المشروع
1. في Replit: **Create App** ← **Import from GitHub** ← اختر المستودع `userLamees/supercx` (فرع `main`).
2. Replit يقرأ ملف `.replit` الموجود: Python 3.12، والتشغيل بـ `uvicorn` على المنفذ 8000.
3. ثبّت المتطلبات مرة واحدة من **Shell**:

```bash
pip install -r requirements.txt
```

## 2. قاعدة البيانات (Postgres)
1. من الأدوات: **Database** ← **Create a database** (PostgreSQL).
2. Replit يضيف `DATABASE_URL` تلقائيًا في Secrets. لا تكتبه بيدك.
3. الجداول تُنشأ وتُحدّث تلقائيًا عند كل تشغيل (Alembic). لا يلزم أي أمر.

> بدون Postgres يستخدم التطبيق SQLite، وملفها **لا يبقى** بين عمليات النشر. لذلك Postgres ضروري.

## 3. الإعدادات (Secrets)
ولّد قيمًا عشوائية جديدة من **Shell**:

```bash
python -m app.preflight --secrets
```

ثم أضفها في **Tools ← Secrets**. لا تضع أي قيمة سرية في الكود أو في المحادثات.

### مطلوبة للتشغيل
| المفتاح | القيمة |
|---|---|
| `DATABASE_URL` | يضيفه Replit تلقائيًا مع Postgres |
| `OTP_SECRET` | من أمر `--secrets` |
| `STAFF_ADMIN_EMAIL` | بريد أول مدير (مثل بريدك في الجمعية) |
| `STAFF_ADMIN_PASSWORD` | من أمر `--secrets`؛ مؤقتة، تُغيَّر عند أول دخول |
| `SUPPORT_TOKEN` | من أمر `--secrets`؛ مفتاح إدارة احتياطي |

### لتفعيل كل ربط (حين يتوفر)
| الربط | المفاتيح |
|---|---|
| المساعد الذكي | `OPENAI_API_KEY` |
| البريد (رموز التحقق والإشعارات) | `SMTP_HOST`، `SMTP_PORT`، `SMTP_USERNAME`، `SMTP_PASSWORD`، `SMTP_FROM` |
| واتساب | `TWILIO_ACCOUNT_SID`، `TWILIO_AUTH_TOKEN`، `TWILIO_WHATSAPP_FROM`، `TWILIO_REPLY_TEMPLATE_SID` |
| سجل الأعضاء | `MEMBER_REGISTRY=api`، `MEMBER_REGISTRY_URL`، `MEMBER_REGISTRY_TOKEN` |
| إرسال الطلبات لنظام الجمعية | `CASE_SYNC=webhook` مع `CASE_WEBHOOK_URL` و`CASE_WEBHOOK_SECRET`، أو `CASE_SYNC=email` مع `CASE_EMAIL_TO` |
| عنوان الروابط في الإشعارات | `PUBLIC_BASE_URL` (اختياري: يُؤخذ من عنوان Replit تلقائيًا؛ اضبطه إن ربطتم نطاقًا خاصًا) |

## 4. التشغيل والفحص
1. اضغط **Run**. في الـ Console تظهر أي مشكلة تمنع الإطلاق بعبارة `Go-live check: ...`.
2. للتفصيل، شغّل في **Shell**:

```bash
python -m app.preflight
```

يعرض كل بند: `LIVE` أو `demo` أو `MISSING`، والإعدادات التي يحتاجها. إذا انتهى بـ "Ready to go live" فالتطبيق جاهز (البنود التجريبية تبقى تعمل بالبيانات التجريبية).

3. افتح `/support` وادخل بـ `STAFF_ADMIN_EMAIL` وكلمة المرور المؤقتة، ثم غيّرها.

## 5. المساعد على واتساب
- **الآن (تجريبي):** من لوحة الموظف ← **واتساب**، جرّب المحادثة كاملة دون أي إعداد.
- **للتشغيل الفعلي:**
  1. أنشئ حساب Twilio وفعّل WhatsApp (للتجربة: WhatsApp Sandbox، وللإنتاج: رقم الجمعية بعد اعتماد Meta).
  2. أضف `TWILIO_ACCOUNT_SID` و`TWILIO_AUTH_TOKEN` و`TWILIO_WHATSAPP_FROM` في Secrets.
  3. في Twilio، اجعل رابط الرسائل الواردة (When a message comes in):
     `https://<عنوان التطبيق>/api/whatsapp/webhook` بطريقة POST.
  4. أرسل «السلام عليكم» إلى الرقم. التطبيق يتحقق من توقيع Twilio في كل رسالة.

## 6. بيانات تجريبية للعرض (اختياري)
لملء لوحة الموظف بأمثلة (أسئلة، طلبات، إشعارات، وحسابان تجريبيان):

```bash
python -m app.seed_demo
```

يطبع كلمة مرور الحسابين التجريبيين مرة واحدة. لا تشغّله على قاعدة الإنتاج بعد بدء الاستخدام الفعلي.

## 7. النشر (Deploy)
- **أنصح بـ Reserved VM**: الإشعارات وإرسال الطلبات تعمل بعد الرد على الزائر، وحدود المحاولات محفوظة في الذاكرة؛ والخادم الدائم يضمن الاثنين.
- مع **Autoscale** اجعل الحد الأقصى نسخة واحدة، واعلم أن العمل بعد الرد قد يتأخر إذا نام الخادم.
- أوامر البناء والتشغيل جاهزة في `.replit`: البناء `pip install -r requirements.txt`، والتشغيل `uvicorn` مع `--proxy-headers` (ليرى التطبيق عنوان الزائر الحقيقي وhttps خلف وكيل Replit).
- بعد النشر: افتح الرابط، جرّب محادثة، وأرسل طلبًا، وتأكد أنه ظهر في لوحة الموظف.

## 8. بعد الإطلاق
- **نسخ احتياطي**: قبل أي تحديث يضيف ملف migration جديدًا (`migrations/versions/`)، خذ نسخة من قاعدة البيانات من أداة Database.
- **التحديث**: ادمج في `main` على GitHub، ثم في Replit اسحب التحديث (Git ← Pull) وأعد النشر. الجداول تتحدث تلقائيًا.
- **إيقاف رمز الفريق المشترك** بعد إنشاء حسابات الفريق: `ALLOW_SUPPORT_TOKEN=false`.
