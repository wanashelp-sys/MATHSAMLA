# إعداد قاعدة البيانات في Supabase

هذا الدليل يشرح كيفية إنشاء الجداول المطلوبة في Supabase لتشغيل منصة سلمى التعليمية.

## 📊 بنية قاعدة البيانات

### 1. جدول users (المستخدمون)

```sql
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  phone VARCHAR(20),
  password_hash TEXT NOT NULL,
  role VARCHAR(20) CHECK (role IN ('teacher', 'student')) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_role ON users(role);
```

### 2. جدول teachers (المعلمات)

```sql
CREATE TABLE teachers (
  teacher_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  school_name VARCHAR(200),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء فهرس
CREATE INDEX idx_teachers_user_id ON teachers(user_id);
```

### 3. جدول students (الطالبات)

```sql
CREATE TABLE students (
  student_id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  user_id INTEGER UNIQUE REFERENCES users(user_id) ON DELETE CASCADE,
  grade INTEGER CHECK (grade BETWEEN 1 AND 6),
  class_section VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- إنشاء فهرس
CREATE INDEX idx_students_user_id ON students(user_id);
CREATE INDEX idx_students_grade ON students(grade);
```

### 4. جدول classes (الفصول)

```sql
CREATE TABLE classes (
  class_id SERIAL PRIMARY KEY,
  teacher_id INTEGER REFERENCES teachers(teacher_id) ON DELETE CASCADE,
  class_name VARCHAR(100) NOT NULL,
  join_code VARCHAR(20) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

-- إنشاء فهرس
CREATE INDEX idx_classes_teacher_id ON classes(teacher_id);
CREATE INDEX idx_classes_join_code ON classes(join_code);
```

### 5. جدول student_classes (ربط الطالبات بالفصول)

```sql
CREATE TABLE student_classes (
  enrollment_id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id) ON DELETE CASCADE,
  class_id INTEGER REFERENCES classes(class_id) ON DELETE CASCADE,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(student_id, class_id)
);

-- إنشاء فهرس
CREATE INDEX idx_student_classes_student_id ON student_classes(student_id);
CREATE INDEX idx_student_classes_class_id ON student_classes(class_id);
```

## 🔒 إعداد Row Level Security (RLS)

يُنصح بتفعيل RLS لحماية البيانات:

```sql
-- تفعيل RLS على جميع الجداول
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_classes ENABLE ROW LEVEL SECURITY;

-- سياسة للقراءة العامة (يمكن تعديلها حسب الحاجة)
CREATE POLICY "Enable read access for all users" ON users
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for registration" ON users
  FOR INSERT WITH CHECK (true);

-- سياسات مشابهة للجداول الأخرى
CREATE POLICY "Enable read access for teachers" ON teachers
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for teachers" ON teachers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for students" ON students
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for students" ON students
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for classes" ON classes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for classes" ON classes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for student_classes" ON student_classes
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for student_classes" ON student_classes
  FOR INSERT WITH CHECK (true);
```

## 📝 ملاحظات مهمة

1. **كلمات المرور:** في التطبيق الحالي، يتم حفظ كلمات المرور كنص عادي (password_hash). في الإنتاج الفعلي، يُنصح باستخدام مكتبة تشفير مثل bcrypt.

2. **التحقق من البريد:** يمكن إضافة حقل `email_verified` لتأكيد البريد الإلكتروني.

3. **الأمان:** تأكدي من ضبط سياسات RLS بشكل صحيح قبل الإنتاج.

4. **النسخ الاحتياطي:** قومي بعمل نسخ احتياطية دورية للقاعدة.

## 🔑 الحصول على بيانات Supabase

1. سجّلي دخول إلى [Supabase Dashboard](https://app.supabase.com/)
2. افتحي مشروعك
3. اذهبي إلى Settings > API
4. انسخي:
   - Project URL (`VITE_SUPABASE_URL`)
   - Project API keys > anon public (`VITE_SUPABASE_ANON_KEY`)

## 📊 جداول إضافية مقترحة (للتوسع المستقبلي)

```sql
-- جدول التحديات
CREATE TABLE challenges (
  challenge_id SERIAL PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
  points INTEGER DEFAULT 10,
  created_by INTEGER REFERENCES teachers(teacher_id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول محاولات الطالبات
CREATE TABLE student_attempts (
  attempt_id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id),
  challenge_id INTEGER REFERENCES challenges(challenge_id),
  score INTEGER,
  time_spent INTEGER, -- بالثواني
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- جدول الإنجازات
CREATE TABLE achievements (
  achievement_id SERIAL PRIMARY KEY,
  student_id INTEGER REFERENCES students(student_id),
  achievement_type VARCHAR(50),
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## ✅ التحقق من التثبيت

بعد إنشاء الجداول، جرّبي تسجيل معلمة أو طالبة من المنصة للتأكد من عمل كل شيء بشكل صحيح.
