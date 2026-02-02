'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/lib/firebase-auth'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      console.log('🚀 محاولة تسجيل الدخول...')
      
      const result = await loginUser(formData.phone, formData.password)
      
      if (result.success) {
        console.log('✅ تسجيل الدخول ناجح:', result.user)
        
        localStorage.setItem('currentUser', JSON.stringify(result.user))
        
        // 🔥 التوجيه الصح
        window.location.href = '/platform'
        // أو
        // router.push('/platform')
        
      } else {
        setError(result.error || 'حدث خطأ في تسجيل الدخول')
        console.error('❌ خطأ تسجيل الدخول:', result.error)
      }
      
    } catch (error: any) {
      console.error('🔥 خطأ غير متوقع:', error)
      setError('حدث خطأ في الخادم. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>تسجيل الدخول</h1>
          <p style={styles.subtitle}>ادخل إلى حسابك في علمني العلوم مستر بيشوي</p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>📱 رقم التليفون</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="01XXXXXXXXX"
              required
              style={styles.input}
              dir="ltr"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>🔐 كلمة السر</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="********"
              required
              style={styles.input}
            />
          </div>

          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorIcon}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? '⏳ جاري تسجيل الدخول...' : '🔑 دخول إلى حسابي'}
          </button>
        </form>

        <div style={styles.footer}>
          <p>ليس لديك حساب؟ <Link href="/register">⭐ إنشاء حساب جديد</Link></p>
        </div>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px'
  },
  card: {
    background: 'white',
    borderRadius: '20px',
    width: '100%',
    maxWidth: '450px',
    padding: '40px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.25)'
  },
  header: {
    textAlign: 'center' as const,
    marginBottom: '30px'
  },
  title: {
    fontSize: '32px',
    marginBottom: '10px',
    color: '#333'
  },
  subtitle: {
    color: '#666',
    fontSize: '16px'
  },
  form: {
    marginBottom: '30px'
  },
  inputGroup: {
    marginBottom: '20px'
  },
  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600' as const,
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '15px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    fontSize: '16px'
  },
  errorBox: {
    background: '#ffeaea',
    color: '#c00',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  button: {
    width: '100%',
    padding: '15px',
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    cursor: 'pointer'
  },
  footer: {
    textAlign: 'center' as const,
    borderTop: '1px solid #eee',
    paddingTop: '20px',
    color: '#666'
  }
}