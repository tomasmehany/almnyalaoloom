// app/api/chat/route.js
export async function POST(req) {
  try {
    // ✅ استقبال الاسم مع الرسالة
    const { message, studentName } = await req.json();
    
    console.log("📝 اسم الطالب المستلم:", studentName); // للفحص

    // قراءة المفاتيح من process.env
    const key1 = process.env.GROQ_API_KEY;
    const key2 = process.env.GROQ_API_KEY_2;
    const key3 = process.env.GROQ_API_KEY_3;
    
    // مصفوفة المفاتيح الموجودة فعلاً
    const API_KEYS = [];
    if (key1) API_KEYS.push(key1);
    if (key2) API_KEYS.push(key2);
    if (key3) API_KEYS.push(key3);

    // التأكد من وجود مفاتيح
    if (API_KEYS.length === 0) {
      return new Response(JSON.stringify({ 
        reply: "عذراً، مشكلة في إعدادات الخادم (المفاتيح غير موجودة)" 
      }), { status: 200 });
    }

    // تجربة كل مفتاح بالترتيب
    let response = null;
    let usedKeyIndex = -1;

    for (let i = 0; i < API_KEYS.length; i++) {
      const currentKey = API_KEYS[i];
      
      try {
        const fetchResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: 'POST',
          headers: { 
            'Authorization': `Bearer ${currentKey}`,
            'Content-Type': 'application/json' 
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              { role: "system", content: getSystemInstruction(message) },
              { role: "user", content: message }
            ],
            temperature: 0.7,
            max_tokens: 1000
          })
        });

        if (fetchResponse.ok || fetchResponse.status === 429) {
          response = fetchResponse;
          usedKeyIndex = i;
          break;
        }
      } catch (err) {
        console.log(`⚠️ خطأ في المفتاح ${i + 1}:`, err.message);
      }
    }

    if (!response) {
      return new Response(JSON.stringify({ 
        reply: "عذراً، مشكلة في الاتصال بالخدمة" 
      }), { status: 200 });
    }

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ 
          reply: "عذراً، تم تجاوز الحد المسموح من الطلبات حالياً. حاول بعد قليل." 
        }), { status: 200 });
      }
      return new Response(JSON.stringify({ 
        reply: "عذراً، حدث خطأ في الاتصال بالخدمة" 
      }), { status: 200 });
    }

    const data = await response.json();
    let replyText = data.choices?.[0]?.message?.content || "عذراً، لم أستطع الإجابة";

    // تنظيف النجوم والصيغ الكيميائية
    replyText = replyText.replace(/\*\*(.*?)\*\*/g, '($1)');
    replyText = replyText.replace(/\*(.*?)\*/g, '($1)');
    replyText = replyText.replace(/#{1,6}\s?/g, '');
    replyText = replyText.replace(/H2O/g, 'H<sub>2</sub>O');
    replyText = replyText.replace(/CO2/g, 'CO<sub>2</sub>');
    replyText = replyText.replace(/O2/g, 'O<sub>2</sub>');

    return new Response(JSON.stringify({ reply: replyText }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error("❌ خطأ:", error);
    return new Response(JSON.stringify({
      reply: "عذراً، حدث خطأ مؤقت"
    }), { status: 200 });
  }
}

// دالة مساعدة لبناء التعليمات
function getSystemInstruction(message) {
  const lowerCaseMessage = message?.toLowerCase() || '';
  const developerKeywords = [
    "من صنعك", "من طورك", "من دربك", "من علمك",
    "المطور", "توماس", "مهني", "اللي عاملك",
    "مين عملك", "مين علمك", "مين دربك", "مين صنعك",
    "who created you", "who made you", "who trained you",
    "your developer", "your creator"
  ];
  
  const isAboutDeveloper = developerKeywords.some(keyword => 
    lowerCaseMessage.includes(keyword)
  );

  let instruction = `أنت Almny Alolom ai، بوت تعليمي متخصص.

**تعليمات مهمة للرد:**

1. **التنسيق**:
   - استخدم سطر جديد بين كل فقرة
   - لو في نقاط، استخدم الأرقام زي (1، 2، 3) أو الشرطات (-)
   - خلي الرد منظم وسهل القراءة

2. **المحتوى**:
   - اكتب إجابة متوسطة الطول (مناسبة للسؤال)
   - استخدم لغة عربية بسيطة وواضحة
   - إذا احتجت توضيح، استخدم (الأقواس)

3. **ممنوع نهائياً**:
   - استخدام النجوم ** أو * في الرد
   - الإجابات الطويلة جداً
   - الإجابات القصيرة جداً (أقل من سطرين)

4. **التعريف**:
   - في بداية المحادثة: (أهلاً بك! أنا T_Almny-ai)`;

  if (isAboutDeveloper) {
    instruction += `\n\n**مهم جداً**: المستخدم يسأل عن المطور الخاص بك. رد عليه بأنك "نموذج ذكاء اصطناعي تم تطويري وتدريبي بواسطة توماس مهني".`;
  }

  return instruction;
}

export async function GET() {
  const key1 = !!process.env.GROQ_API_KEY;
  const key2 = !!process.env.GROQ_API_KEY_2;
  const key3 = !!process.env.GROQ_API_KEY_3;
  
  return new Response(JSON.stringify({ 
    message: "✅ API شغال!",
    keys: {
      key1: key1 ? "✅" : "❌",
      key2: key2 ? "✅" : "❌", 
      key3: key3 ? "✅" : "❌"
    }
  }), {
    status: 200
  });
}