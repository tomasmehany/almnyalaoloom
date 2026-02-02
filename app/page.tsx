'use client'

import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()

  return (
    <div style={{
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      background: 'linear-gradient(to right, #6a11cb, #2575fc)',
      color: 'white',
      paddingTop: 60,
    }}>
      {/* عنوان ترحيبي */}
      <h1 style={{ fontSize: 36, marginBottom: 10, textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>
        أهلاً بك في منصتنا التعليمية!
      </h1>

      {/* وصف مختصر */}
      <p style={{
        fontSize: 18,
        marginBottom: 40,
        maxWidth: 500,
        textAlign: 'center',
        lineHeight: 1.5,
        textShadow: '1px 1px 2px rgba(0,0,0,0.2)'
      }}>
        أنشئ حسابك أو سجل دخولك للوصول للكورسات والمحتوى التعليمي الخاص بك.
      </p>

      {/* أزرار تسجيل دخول / إنشاء حساب */}
      <div style={{ display: 'flex', gap: 20 }}>
        <button style={buttonStyle} onClick={() => router.push('/login')}>
          تسجيل الدخول
        </button>

        <button style={buttonStyle} onClick={() => router.push('/register')}>
          إنشاء حساب
        </button>
      </div>

      {/* صورة توضيحية */}
      <img 
        src="https://images.unsplash.com/photo-1581090700227-84b5302c8192?fit=crop&w=800&q=80" 
        alt="education illustration"
        style={{ marginTop: 60, borderRadius: 12, width: 400, maxWidth: '90%', boxShadow: '0px 6px 12px rgba(0,0,0,0.3)' }}
      />
    </div>
  )
}

// ستايل الأزرار مرة واحدة
const buttonStyle = {
  padding: '12px 25px',
  fontSize: 16,
  borderRadius: 6,
  border: 'none',
  cursor: 'pointer',
  backgroundColor: '#ff9800',
  color: 'white',
  boxShadow: '0px 4px 6px rgba(0,0,0,0.2)',
  transition: '0.3s',
}