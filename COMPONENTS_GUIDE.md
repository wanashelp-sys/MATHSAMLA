# دليل استخدام المكونات الموحدة

## 🎨 مكون الشعار (Logo)

### الاستخدام الأساسي

```jsx
import Logo from '../components/Logo';

function MyComponent() {
  return <Logo />;
}
```

### المتغيرات المتاحة

#### 1. Variant (نوع الشعار)

```jsx
// الشعار الافتراضي
<Logo variant="default" />

// شعار بتدرج لوني
<Logo variant="gradient" />

// شعار فاتح (للخلفيات الداكنة)
<Logo variant="light" />

// شعار داكن (للخلفيات الفاتحة)
<Logo variant="dark" />
```

#### 2. Size (حجم الشعار)

```jsx
// صغير (36px)
<Logo size="small" />

// متوسط (48px) - الافتراضي
<Logo size="medium" />

// كبير (64px)
<Logo size="large" />
```

#### 3. ShowText (إظهار النص)

```jsx
// مع النص
<Logo showText={true} />

// بدون نص (الأيقونة فقط)
<Logo showText={false} />
```

### أمثلة الاستخدام في الصفحات

#### HomePage
```jsx
<Logo variant="gradient" size="medium" showText={true} />
```

#### LoginPage
```jsx
<Logo variant="gradient" size="medium" showText={true} />
```

#### RegisterPage
```jsx
<Logo variant="default" size="small" showText={true} />
```

#### StudentDashboard
```jsx
<Logo variant="default" size="small" showText={false} />
```

---

## 📱 مكون PWA Install Banner

### الاستخدام

المكون يعمل تلقائياً عند إضافته في `App.jsx`:

```jsx
import PWAInstallBanner from './components/PWAInstallBanner';

function App() {
  return (
    <>
      {/* المسارات الخاصة بك */}
      <PWAInstallBanner />
    </>
  );
}
```

### المميزات

- **ظهور تلقائي:** يظهر فقط عندما يكون التطبيق قابل للتثبيت
- **حفظ التفضيلات:** لا يظهر مرة أخرى إذا رفض المستخدم
- **تخفي تلقائياً:** يختفي بعد التثبيت أو الرفض
- **تصميم متجاوب:** يعمل على جميع الأجهزة

---

## 🎨 نظام الألوان الموحد

### استخدام المتغيرات في CSS

```css
.my-element {
  background: var(--bg-primary);
  color: var(--brand-text);
  border: 1px solid var(--border-soft);
}
```

### المتغيرات الأساسية

```css
/* الألوان الرئيسية */
--bg-primary: #7DBECF;
--main-element: #926A2B;
--detail-dark: #572822;
--accent-spark: #FD0000;
--success-color: #A7B683;

/* لوحة التحكم */
--brand-primary: #7DBECF;
--brand-secondary: #926A2B;
--accent-green: #A7B683;
--accent-red: #FD0000;

/* النصوص */
--text-main: #220005;
--text-soft: #64748B;
--text-muted: #572822;

/* الخلفيات */
--bg-page: #F9FBFF;
--bg-card: #FFFFFF;
--bg-card-soft: #F3F6FF;

/* الحدود والظلال */
--border-soft: #E2E8F0;
--shadow-soft: 0 12px 30px rgba(15,23,42,0.10);
```

---

## 📱 دعم Safe Area

### استخدام تلقائي

جميع الحاويات الرئيسية تدعم safe-area تلقائياً:

```css
.my-container {
  padding-left: max(16px, var(--safe-area-inset-left));
  padding-right: max(16px, var(--safe-area-inset-right));
  padding-top: max(24px, var(--safe-area-inset-top));
  padding-bottom: max(32px, var(--safe-area-inset-bottom));
}
```

### المتغيرات المتاحة

```css
--safe-area-inset-top
--safe-area-inset-right
--safe-area-inset-bottom
--safe-area-inset-left
```

---

## 📱 تحسينات الشاشات اللمسية

### CSS التلقائي

على الأجهزة اللمسية، يتم تطبيق التحسينات التالية تلقائياً:

```css
@media (hover: none) and (pointer: coarse) {
  /* زيادة حجم عناصر اللمس */
  button,
  .cta-btn,
  .nav-link {
    min-height: 44px;
    min-width: 44px;
  }

  /* إزالة تأثيرات hover */
  .cta-btn:hover {
    transform: none;
  }

  /* تفعيل تأثيرات active */
  .cta-btn:active {
    transform: scale(0.95);
    opacity: 0.8;
  }
}
```

---

## 🎯 أفضل الممارسات

### 1. استخدام الشعار الموحد

❌ **لا تفعل:**
```jsx
<div className="logo">
  <img src="/logo.png" alt="logo" />
  <span>منصة سلمى</span>
</div>
```

✅ **افعل:**
```jsx
<Logo variant="gradient" size="medium" showText={true} />
```

### 2. استخدام المتغيرات

❌ **لا تفعل:**
```css
.my-button {
  background: #7DBECF;
  color: #220005;
}
```

✅ **افعل:**
```css
.my-button {
  background: var(--bg-primary);
  color: var(--text-main);
}
```

### 3. Safe Area

❌ **لا تفعل:**
```css
.container {
  padding: 20px;
}
```

✅ **افعل:**
```css
.container {
  padding: max(20px, var(--safe-area-inset-top)) 
           max(20px, var(--safe-area-inset-right))
           max(20px, var(--safe-area-inset-bottom))
           max(20px, var(--safe-area-inset-left));
}
```

### 4. عناصر اللمس

❌ **لا تفعل:**
```css
.small-button {
  width: 24px;
  height: 24px;
}
```

✅ **افعل:**
```css
.touch-button {
  min-width: 44px;
  min-height: 44px;
}
```

---

## 🔧 Service Worker

### التسجيل التلقائي

Service Worker يتم تسجيله تلقائياً في `index.html`:

```javascript
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✅ تم تسجيل Service Worker بنجاح');
      });
  });
}
```

### التحديث

لتحديث Service Worker:

1. قم بتعديل ملف `/public/sw.js`
2. غيّر `CACHE_NAME` إلى إصدار جديد:
   ```javascript
   const CACHE_NAME = 'salma-platform-v2';
   ```
3. Service Worker سيقوم بالتحديث تلقائياً

---

## 📱 Manifest

### الموقع

`/public/manifest.json`

### الخصائص المهمة

```json
{
  "name": "منصة سلمى التعليمية - تعلّم الرياضيات باللعب",
  "short_name": "منصة سلمى",
  "display": "standalone",
  "orientation": "portrait-primary",
  "theme_color": "#7DBECF",
  "background_color": "#7DBECF"
}
```

### Shortcuts

الاختصارات المتاحة:
- تسجيل الدخول: `/login`
- التسجيل: `/register`

---

## 🎨 الخطوط

### الخطوط المستخدمة

1. **Tajawal** - المحتوى العام
2. **Almarai** - العناوين
3. **Baloo Bhaijaan 2** - العناصر التفاعلية

### الاستخدام في CSS

```css
.content {
  font-family: 'Tajawal', sans-serif;
}

.heading {
  font-family: 'Almarai', 'Tajawal', sans-serif;
}

.playful {
  font-family: 'Baloo Bhaijaan 2', 'Tajawal', sans-serif;
}
```

---

## ✅ Checklist قبل الإطلاق

- [ ] جميع الصفحات تستخدم `<Logo />` الموحد
- [ ] جميع الألوان تستخدم CSS variables
- [ ] Safe area مطبق على جميع الحاويات
- [ ] عناصر اللمس لا تقل عن 44px
- [ ] Service Worker يعمل بشكل صحيح
- [ ] Manifest.json محدّث
- [ ] الخطوط تُحمّل بشكل صحيح
- [ ] التطبيق يعمل في وضع standalone
- [ ] PWA Install Banner يظهر بشكل صحيح
- [ ] الشعار يظهر في جميع الصفحات

---

## 📞 الدعم

للمزيد من المعلومات، راجع:
- `README.md` - التوثيق الكامل
- `src/components/Logo.jsx` - كود مكون الشعار
- `src/components/PWAInstallBanner.jsx` - كود مكون التثبيت
- `public/sw.js` - Service Worker
- `src/index.css` - نظام الألوان والتنسيقات
