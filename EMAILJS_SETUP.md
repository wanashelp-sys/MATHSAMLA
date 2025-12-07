# إعداد EmailJS لمنصة سلمى التعليمية

هذا الدليل يشرح كيفية إعداد EmailJS لإرسال رسائل الترحيب للمعلمات والطالبات.

## 📧 الخطوات الأساسية

### 1. إنشاء حساب EmailJS

1. اذهبي إلى [EmailJS](https://www.emailjs.com/)
2. انقري على "Sign Up" لإنشاء حساب جديد
3. أكّدي بريدك الإلكتروني

### 2. إضافة خدمة البريد الإلكتروني

1. من لوحة التحكم، انقري على "Add New Service"
2. اختاري مزود البريد الإلكتروني (Gmail موصى به)
3. قومي بالربط مع حسابك
4. احفظي الـ **Service ID** (مثال: `service_tv0lnvr`)

### 3. إنشاء قالب رسالة المعلمة

1. اذهبي إلى "Email Templates"
2. انقري على "Create New Template"
3. اختاري اسم القالب: "Teacher Welcome Email"

#### محتوى القالب المقترح:

**الموضوع:**
```
مرحباً بك في منصة سلمى التعليمية! 🎓
```

**الرسالة:**
```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Tajawal', Arial, sans-serif; direction: rtl; text-align: right; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7DBECF, #926A2B); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f5f5f5; padding: 30px; }
    .code-box { background: white; border: 2px dashed #926A2B; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; }
    .code { font-size: 28px; font-weight: bold; color: #7DBECF; letter-spacing: 5px; font-family: monospace; }
    .btn { display: inline-block; background: #7DBECF; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #220005; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 مرحباً بك في منصة سلمى التعليمية!</h1>
      <p>نحن سعداء بانضمامك إلينا كمعلمة</p>
    </div>
    
    <div class="content">
      <h2>أهلاً {{teacher_name}}! 👋</h2>
      
      <p>تم إنشاء حسابك بنجاح في منصة سلمى التعليمية. الآن يمكنك البدء في إدارة فصولك ومتابعة تقدم طالباتك.</p>
      
      <div class="code-box">
        <p style="margin: 0 0 10px 0; color: #926A2B; font-weight: bold;">كود الفصل الخاص بك:</p>
        <div class="code">{{teacher_code}}</div>
        <p style="margin: 10px 0 0 0; font-size: 14px; color: #666;">شاركي هذا الكود مع طالباتك للانضمام إلى فصلك</p>
      </div>
      
      <h3>ماذا بعد؟</h3>
      <ul style="line-height: 2;">
        <li>شاركي كود الفصل مع طالباتك</li>
        <li>ابدئي بإنشاء التحديات التعليمية</li>
        <li>تابعي تقدم الطالبات من لوحة التحكم</li>
        <li>استفيدي من التقارير والإحصائيات</li>
      </ul>
      
      <div style="text-align: center;">
        <a href="{{login_url}}" class="btn">الدخول إلى المنصة</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 منصة سلمى التعليمية - تطوير معلمة سلمى بكل حب 💜</p>
      <p style="font-size: 12px; opacity: 0.8;">لأي استفسارات، تواصلي معنا عبر البريد الإلكتروني</p>
    </div>
  </div>
</body>
</html>
```

#### المتغيرات المطلوبة:
- `{{teacher_name}}` - اسم المعلمة
- `{{teacher_email}}` - بريد المعلمة
- `{{teacher_code}}` - كود الفصل
- `{{login_url}}` - رابط تسجيل الدخول

احفظي الـ **Template ID** (مثال: `template_3doz3mf`)

### 4. إنشاء قالب رسالة الطالبة

كرّري نفس الخطوات لقالب الطالبة:

**الموضوع:**
```
مرحباً بك في منصة سلمى التعليمية! 🎮
```

**الرسالة:**
```html
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: 'Tajawal', Arial, sans-serif; direction: rtl; text-align: right; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #7DBECF, #A7B683); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f5f5f5; padding: 30px; }
    .highlight-box { background: white; border-right: 4px solid #A7B683; padding: 20px; margin: 20px 0; border-radius: 8px; }
    .btn { display: inline-block; background: #A7B683; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
    .footer { background: #220005; color: white; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 مرحباً بك في منصة سلمى التعليمية!</h1>
      <p>استعدي لمغامرة تعليمية ممتعة!</p>
    </div>
    
    <div class="content">
      <h2>أهلاً {{student_name}}! 👧</h2>
      
      <p>تم إنشاء حسابك بنجاح! الآن أنتِ جزء من فصل <strong>{{teacher_name}}</strong> وجاهزة للبدء في رحلة تعلّم الرياضيات بطريقة ممتعة ومشوقة.</p>
      
      <div class="highlight-box">
        <h3 style="color: #926A2B; margin-top: 0;">ماذا ستجدين في المنصة؟</h3>
        <ul style="line-height: 2;">
          <li>🎮 ألعاب تعليمية ممتعة</li>
          <li>🏆 تحديات وإنجازات</li>
          <li>⭐ نظام نقاط وأوسمة</li>
          <li>📊 متابعة تقدمك الشخصي</li>
        </ul>
      </div>
      
      <div style="background: #e8f5f7; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p style="margin: 0; color: #926A2B;">💡 <strong>نصيحة:</strong> ابدئي بالتحديات السهلة أولاً، ثم انتقلي تدريجياً للمستويات الأصعب!</p>
      </div>
      
      <div style="text-align: center;">
        <a href="{{login_url}}" class="btn">الدخول إلى المنصة والبدء</a>
      </div>
    </div>
    
    <div class="footer">
      <p>© 2025 منصة سلمى التعليمية - نتمنى لك رحلة تعليمية ممتعة! 💜</p>
    </div>
  </div>
</body>
</html>
```

#### المتغيرات المطلوبة:
- `{{student_name}}` - اسم الطالبة
- `{{student_email}}` - بريد الطالبة
- `{{teacher_name}}` - اسم المعلمة
- `{{teacher_code}}` - كود الفصل
- `{{login_url}}` - رابط تسجيل الدخول

احفظي الـ **Template ID** (مثال: `template_jmr3xcd`)

### 5. الحصول على المفتاح العام (Public Key)

1. اذهبي إلى "Account" > "General"
2. ستجدين "Public Key" في قسم "API Keys"
3. انسخي المفتاح (مثال: `84xd6IihCfLS1SIPD`)

### 6. إضافة المفاتيح في ملف .env

أضيفي جميع المفاتيح في ملف `.env`:

```env
VITE_EMAILJS_PUBLIC_KEY=your_public_key_here
VITE_EMAILJS_SERVICE_ID=service_tv0lnvr
VITE_EMAILJS_TEACHER_TEMPLATE_ID=template_3doz3mf
VITE_EMAILJS_STUDENT_TEMPLATE_ID=template_jmr3xcd
```

## 🧪 اختبار الإعداد

1. سجّلي حساب تجريبي من المنصة
2. تحققي من وصول البريد الإلكتروني
3. تأكدي من ظهور جميع المتغيرات بشكل صحيح

## 📊 حدود الاستخدام المجاني

EmailJS يوفر الخطة المجانية:
- **200 رسالة شهرياً**
- لزيادة الحد، يمكن الترقية للخطة المدفوعة

## 🔒 نصائح الأمان

1. لا ترفعي ملف `.env` إلى GitHub
2. استخدمي مفاتيح مختلفة للتطوير والإنتاج
3. راقبي عدد الرسائل المرسلة لتجنب تجاوز الحد

## ❓ استكشاف الأخطاء

### الرسالة لا تصل:
- تحققي من صحة Service ID و Template ID
- تأكدي من تهيئة EmailJS بالمفتاح العام
- راجعي سجلات EmailJS Dashboard

### المتغيرات لا تظهر:
- تحققي من تطابق أسماء المتغيرات في الكود والقالب
- استخدمي `{{variable_name}}` بشكل صحيح

### خطأ CORS:
- تأكدي من تفعيل النطاق في إعدادات EmailJS
- أضيفي `localhost:5173` للنطاقات المسموحة أثناء التطوير

## ✅ جاهز!

بعد إتمام هذه الخطوات، ستعمل خدمة إرسال البريد الإلكتروني بشكل كامل في المنصة! 🎉
