'use client'
import { useState } from 'react'

export default function RegisterPage() {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('🔄 جاري التسجيل في Firebase...')
    
    try {
      // 1. نستورد Firebase
      const { db } = await import('@/lib/firebase')
      const { collection, addDoc } = await import('firebase/firestore')
      
      // 2. نجيب البيانات من الفورم
      const form = e.target as HTMLFormElement
      const userData = {
        name: (form.querySelector('[name="name"]') as HTMLInputElement)?.value || 'مستخدم',
        phone: (form.querySelector('[name="phone"]') as HTMLInputElement)?.value || '0000000000',
        grade: (form.querySelector('[name="grade"]') as HTMLSelectElement)?.value || 'غير محدد',
        password: (form.querySelector('[name="password"]') as HTMLInputElement)?.value || '123456',
        status: 'pending',
        createdAt: new Date().toISOString()
      }
      
      // 3. نحفظ في Firebase
      await addDoc(collection(db, 'users'), userData)
      
      // 4. نجاح
      setMessage('✅ تم التسجيل بنجاح! سيتم مراجعة طلبك.')
      form.reset()
      
    } catch (error: any) {
      console.error('Firebase error:', error)
      setMessage('❌ خطأ: ' + (error.message || 'فشل في التسجيل'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>إنشاء حساب جديد</h1>
          <p style={styles.subtitle}>انضم إلى المنصة التعليمية المجانية</p>
        </div>
        
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>الاسم بالكامل</label>
            <input
              type="text"
              name="name"
              placeholder="أحمد محمد"
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>رقم التليفون</label>
            <input
              type="tel"
              name="phone"
              placeholder="01XXXXXXXXX"
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>السنة الدراسية</label>
            <select name="grade" required style={styles.input}>
              <option value="">اختر السنة</option>
              <option value="1-prep">أولى إعدادي</option>
              <option value="2-prep">ثانية إعدادي</option>
              <option value="3-prep">ثالثة إعدادي</option>
            </select>
          </div>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>كلمة السر</label>
            <input
              type="password"
              name="password"
              placeholder="********"
              required
              minLength={6}
              style={styles.input}
            />
          </div>
          
          <button
            type="submit"
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1
            }}
            disabled={loading}
          >
            {loading ? '🔄 جاري التسجيل...' : 'إنشاء حساب'}
          </button>
        </form>
        
        {message && (
          <div style={{
            ...styles.message,
            background: message.startsWith('✅') ? '#d4edda' : '#f8d7da',
            color: message.startsWith('✅') ? '#155724' : '#721c24',
            borderColor: message.startsWith('✅') ? '#c3e6cb' : '#f5c6cb'
          }}>
            {message}
          </div>
        )}
        
        <div style={styles.footer}>
          <p style={styles.footerText}>
            لديك حساب بالفعل؟{' '}
            <a href="/login" style={styles.link}>سجل دخول</a>
          </p>
          <p style={{...styles.footerText, marginTop: '10px'}}>
            <a href="/" style={styles.link}>← الرجوع للرئيسية</a>
          </p>
        </div>
      </div>
    </div>
  )
}

// الأنماط
const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
    direction: 'rtl' as const
  },
  card: {
    background: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '450px',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
  },
  header: {
    background: 'linear-gradient(to right, #3498db, #2ecc71)',
    color: 'white',
    padding: '30px',
    textAlign: 'center' as const
  },
  title: {
    fontSize: '28px',
    marginBottom: '8px',
    fontWeight: 'bold' as const
  },
  subtitle: {
    fontSize: '16px',
    opacity: 0.9
  },
  form: {
    padding: '30px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600' as const,
    color: '#333',
    fontSize: '14px'
  },
  input: {
    width: '100%',
    padding: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'border 0.3s',
    background: '#f9fafb'
  },
  button: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(to right, #3498db, #2ecc71)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '17px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '10px'
  },
  message: {
    marginTop: '20px',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center' as const,
    fontWeight: '500' as const,
    border: '1px solid'
  },
  footer: {
    textAlign: 'center' as const,
    padding: '25px 30px',
    borderTop: '1px solid #e5e7eb',
    backgroundColor: '#f9fafb'
  },
  footerText: {
    color: '#666',
    fontSize: '15px'
  },
  link: {
    color: '#3498db',
    fontWeight: 'bold' as const,
    textDecoration: 'none'
  }
}