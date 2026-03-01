// app/api/log-chat/route.js
import fs from 'fs';
import path from 'path';

export async function POST(req) {
  console.log("📥 API التسجيل بدأ");
  
  try {
    const body = await req.json();
    console.log("📥 البيانات المستلمة في API:", body);

    const { studentId, studentName, realName, message, reply } = body;

    // التحقق من البيانات
    if (!studentId || !message || !reply) {
      console.log("❌ بيانات ناقصة:", { studentId, message, reply });
      return new Response(JSON.stringify({ success: false }), { status: 200 });
    }

    // استخدام studentName كاسم أساسي
    const finalName = studentName || realName || 'طالب';
    
    console.log("👤 الاسم النهائي للتخزين:", finalName);

    const logsDir = path.join(process.cwd(), 'logs');
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${today}.json`);

    // إنشاء مجلد logs لو مش موجود
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
      console.log("📁 تم إنشاء مجلد logs");
    }

    // قراءة السجلات القديمة
    let logs = [];
    if (fs.existsSync(logFile)) {
      const content = fs.readFileSync(logFile, 'utf8');
      logs = JSON.parse(content);
      console.log(`📁 تم تحميل ${logs.length} سجل قديم`);
    }

    // إضافة السجل الجديد
    const newLog = {
      id: Date.now(),
      studentId,
      studentName: finalName,
      realName: finalName,
      message,
      reply,
      timestamp: new Date().toISOString()
    };
    
    logs.push(newLog);
    
    // حفظ الملف
    fs.writeFileSync(logFile, JSON.stringify(logs, null, 2));
    
    console.log("✅ تم الحفظ بنجاح. إجمالي السجلات:", logs.length);
    console.log("📝 آخر سجل:", newLog);

    return new Response(JSON.stringify({ success: true }), { status: 200 });

  } catch (error) {
    console.error("❌ خطأ في API التسجيل:", error);
    return new Response(JSON.stringify({ success: false }), { status: 200 });
  }
}

export async function GET() {
  return new Response(JSON.stringify({ message: "API log-chat is working" }), { status: 200 });
}