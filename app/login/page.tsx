'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loginUser } from '@/lib/firebase-auth'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === 'phone') {
      const cleaned = e.target.value.replace(/\D/g, '')
      setFormData({
        ...formData,
        [e.target.name]: cleaned
      })
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (formData.phone.length < 11) {
      setError('❌ رقم الهاتف يجب أن يكون 11 رقم')
      setLoading(false)
      return
    }

    try {
      console.log('🚀 محاولة تسجيل الدخول...')
      
      const result = await loginUser(formData.phone, formData.password)
      
      if (result.success) {
        console.log('✅ تسجيل الدخول ناجح:', result.user)
        
        localStorage.setItem('currentUser', JSON.stringify(result.user))
        
        setError('✅ تم تسجيل الدخول بنجاح! جاري التوجيه...')
        
        setTimeout(() => {
          window.location.href = '/platform'
        }, 1000)
        
      } else {
        setError(result.error || '❌ حدث خطأ في تسجيل الدخول')
        console.error('❌ خطأ تسجيل الدخول:', result.error)
      }
      
    } catch (error: any) {
      console.error('🔥 خطأ غير متوقع:', error)
      setError('❌ حدث خطأ في الخادم. حاول مرة أخرى.')
    } finally {
      setLoading(false)
    }
  }

  const contactAdmin = () => {
    const whatsappUrl = `https://wa.me/message/UKASWZCU5BNLN1?src=qr`
    window.open(whatsappUrl, '_blank')
  }

  if (!mounted) return null

  return (
    <div style={styles.container}>
      {/* خلفية متحركة */}
      <div style={styles.background}></div>
      <div style={styles.backgroundOverlay}></div>
      
      {/* المحتوى الرئيسي */}
      <div style={styles.content}>
        {/* الجهة اليمنى - صورة الولد */}
        <div style={styles.rightPanel}>
          <div style={styles.imageWrapper}>
            <div style={styles.imageContainer}>
              <img 
                src="/images/boy-login.png" 
                alt="Student" 
                style={styles.image}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              <div style={styles.imageFallback}>
                <span style={styles.fallbackIcon}>👨‍🎓</span>
              </div>
            </div>
            
            <div style={styles.welcomeText}>
              <h2 style={styles.welcomeTitle}>مرحباً بعودتك!</h2>
              <h1 style={styles.platformName}>علمني العلوم</h1>
              <p style={styles.welcomeMessage}>مع مستر بيشوي، رحلتك نحو التفوق مستمرة</p>
            </div>

            <div style={styles.quickLinks}>
              <Link href="/register" style={styles.quickLink}>
                <span style={styles.quickIcon}>✨</span>
                <span>مشترك جديد؟</span>
              </Link>
              <button onClick={contactAdmin} style={styles.quickLink}>
                <span style={styles.quickIcon}>💬</span>
                <span>تواصل مع الأدمن</span>  {/* ✅ تم التعديل: دعم ← أدمن */}
              </button>
            </div>
          </div>
        </div>

        {/* الجهة اليسرى - نموذج تسجيل الدخول */}
        <div style={styles.leftPanel}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>تسجيل الدخول</h2>
              <p style={styles.formSubtitle}>أدخل بياناتك للوصول إلى حسابك</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* حقل رقم التليفون */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>📱</span>
                  رقم التليفون
                  <span style={styles.required}>*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="01012345678"
                  required
                  style={styles.input}
                  dir="ltr"
                  maxLength={11}
                />
                <span style={styles.hint}>أدخل 11 رقم (مثال: 01012345678)</span>
              </div>

              {/* حقل كلمة السر - نفس حجم input ✅ */}
              <div style={styles.inputGroup}>
                <label style={styles.label}>
                  <span style={styles.labelIcon}>🔐</span>
                  كلمة السر
                </label>
                <div style={styles.passwordWrapper}>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="●●●●●●●●"
                    required
                    minLength={6}
                    style={styles.passwordInput}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? "🔒" : "👁️"}
                  </button>
                </div>
              </div>

              {/* ✅ نسيت كلمة السر؟ - كملحوظة صغيرة مش زر */}
              <div style={styles.forgotHint}>
                <span style={styles.forgotIcon}>❓</span>
                <span>نسيت كلمة السر؟ تواصل مع الأدمن على واتساب</span>
              </div>

              {/* رسائل الخطأ/النجاح */}
              {error && (
                <div style={{
                  ...styles.message,
                  ...(error.includes('✅') && styles.messageSuccess),
                  ...(error.includes('❌') && styles.messageError)
                }}>
                  <span style={styles.messageIcon}>
                    {error.includes('✅') ? '✅' : '⚠️'}
                  </span>
                  <span>{error}</span>
                </div>
              )}

              {/* زر تسجيل الدخول */}
              <button
                type="submit"
                style={{
                  ...styles.submitButton,
                  ...(loading && styles.submitButtonLoading)
                }}
                disabled={loading}
              >
                {loading ? (
                  <span style={styles.buttonContent}>
                    <span style={styles.spinner}></span>
                    جاري تسجيل الدخول...
                  </span>
                ) : (
                  <span style={styles.buttonContent}>
                    <span>دخول إلى حسابي</span>
                    <span style={styles.buttonArrow}>←</span>
                  </span>
                )}
              </button>
            </form>

            {/* ✅ الفوتر - زي صفحة التسجيل بالضبط */}
            <div style={styles.footer}>
              <div style={styles.loginRow}>
                <span style={styles.loginText}>ليس لديك حساب؟</span>
                <Link href="/register" style={styles.loginLink}>
                  إنشاء حساب جديد
                </Link>
              </div>

              <Link href="/" style={styles.homeLink}>
                <span style={styles.homeIcon}>🏠</span>
                <span>العودة للصفحة الرئيسية</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  )
}

const styles: any = {
  container: {
    minHeight: '100vh',
    position: 'relative',
    overflow: 'hidden',
    fontFamily: '"Cairo", "Segoe UI", Tahoma, sans-serif',
    direction: 'rtl',
  },

  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(-45deg, #0b1120, #1a1f35, #1e1b4b, #0f172a)',
    backgroundSize: '400% 400%',
    animation: 'gradientMove 15s ease infinite',
    zIndex: 0,
  },

  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 50%, rgba(37,99,235,0.15) 0%, transparent 60%)',
    zIndex: 1,
  },

  content: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    minHeight: '100vh',
  },

  // ========== الجهة اليمنى ==========
  rightPanel: {
    flex: 1.2,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
    position: 'relative',
    animation: 'fadeIn 0.8s ease-out',
  },

  imageWrapper: {
    maxWidth: '600px',
    width: '100%',
    textAlign: 'center' as const,
  },

  imageContainer: {
    position: 'relative' as const,
    marginBottom: '30px',
    animation: 'float 6s ease-in-out infinite',
  },

  image: {
    width: '100%',
    maxWidth: '450px',
    margin: '0 auto',
    display: 'block',
    filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))',
  },

  imageFallback: {
    width: '300px',
    height: '300px',
    margin: '0 auto',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 30px 40px rgba(0,0,0,0.3)',
  },

  fallbackIcon: {
    fontSize: '120px',
  },

  welcomeText: {
    marginBottom: '30px',
    color: 'white',
  },

  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '600',
    marginBottom: '5px',
    opacity: 0.9,
  },

  platformName: {
    fontSize: '42px',
    fontWeight: '800',
    marginBottom: '15px',
    background: 'linear-gradient(135deg, #fbbf24, #f59e0b)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },

  welcomeMessage: {
    fontSize: '18px',
    opacity: 0.8,
    lineHeight: 1.6,
  },

  quickLinks: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center',
  },

  quickLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    background: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    color: 'white',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.3s',
    '&:hover': {
      background: 'rgba(255,255,255,0.2)',
      transform: 'translateY(-2px)',
    },
  },

  quickIcon: {
    fontSize: '18px',
  },

  // ========== الجهة اليسرى ==========
  leftPanel: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px',
  },

  formCard: {
    background: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '40px',
    padding: '40px',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
    animation: 'fadeIn 0.8s ease-out 0.2s both',
  },

  formHeader: {
    textAlign: 'center' as const,
    marginBottom: '30px',
  },

  formTitle: {
    fontSize: '32px',
    fontWeight: '800',
    color: '#1f2937',
    marginBottom: '5px',
  },

  formSubtitle: {
    fontSize: '16px',
    color: '#6b7280',
  },

  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px',
  },

  inputGroup: {
    marginBottom: '5px',
  },

  label: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#374151',
    fontSize: '14px',
  },

  labelIcon: {
    fontSize: '16px',
  },

  required: {
    color: '#ef4444',
    marginRight: '4px',
    fontSize: '16px',
  },

  input: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    fontSize: '15px',
    transition: 'all 0.3s',
    background: '#f9fafb',
    outline: 'none',
    boxSizing: 'border-box' as const,
    '&:focus': {
      borderColor: '#2563eb',
      background: '#ffffff',
      boxShadow: '0 0 0 4px rgba(37,99,235,0.1)',
    },
    '&::placeholder': {
      color: '#9ca3af',
    },
  },

  hint: {
    display: 'block',
    fontSize: '12px',
    color: '#6b7280',
    marginTop: '6px',
  },

  passwordWrapper: {
    position: 'relative' as const,
  },

  // ✅ نفس حجم input العادي بالضبط
  passwordInput: {
    width: '100%',
    padding: '14px 45px 14px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '16px',
    fontSize: '15px',
    transition: 'all 0.3s',
    background: '#f9fafb',
    outline: 'none',
    boxSizing: 'border-box' as const,
    '&:focus': {
      borderColor: '#2563eb',
      background: '#ffffff',
      boxShadow: '0 0 0 4px rgba(37,99,235,0.1)',
    },
  },

  passwordToggle: {
    position: 'absolute' as const,
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    fontSize: '18px',
    color: '#6b7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      color: '#2563eb',
    },
  },

  // ✅ ملحوظة نسيت كلمة السر (مش زر)
  forgotHint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontSize: '13px',
    color: '#6b7280',
    marginTop: '-5px',
    marginBottom: '5px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:hover': {
      color: '#2563eb',
    },
  },

  forgotIcon: {
    fontSize: '14px',
  },

  message: {
    padding: '15px 20px',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    fontWeight: '500',
    border: '1px solid',
    animation: 'fadeIn 0.3s ease',
  },

  messageSuccess: {
    background: '#ecfdf5',
    borderColor: '#a7f3d0',
    color: '#065f46',
  },

  messageError: {
    background: '#fef2f2',
    borderColor: '#fecaca',
    color: '#991b1b',
  },

  messageIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },

  submitButton: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '18px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginTop: '10px',
    boxShadow: '0 10px 20px rgba(37,99,235,0.3)',
    '&:hover:not(:disabled)': {
      transform: 'translateY(-2px)',
      boxShadow: '0 15px 30px rgba(37,99,235,0.4)',
    },
    '&:active:not(:disabled)': {
      transform: 'translateY(0)',
    },
    '&:disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
      background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)',
    },
  },

  submitButtonLoading: {
    opacity: 0.8,
  },

  buttonContent: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },

  buttonArrow: {
    fontSize: '20px',
  },

  spinner: {
    width: '20px',
    height: '20px',
    border: '3px solid rgba(255,255,255,0.3)',
    borderTopColor: '#ffffff',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },

  // ✅ الفوتر الجديد زي صفحة التسجيل
  footer: {
    marginTop: '25px',
    textAlign: 'center' as const,
  },

  loginRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '15px',
  },

  loginText: {
    color: '#4b5563',
    fontSize: '15px',
  },

  loginLink: {
    color: '#2563eb',
    fontWeight: '700',
    textDecoration: 'none',
    fontSize: '15px',
    transition: 'all 0.2s',
    '&:hover': {
      color: '#7c3aed',
      textDecoration: 'underline',
    },
  },

  homeLink: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    color: '#64748b',
    textDecoration: 'none',
    fontSize: '15px',
    fontWeight: '500',
    padding: '10px',
    borderRadius: '12px',
    transition: 'all 0.2s',
    '&:hover': {
      color: '#2563eb',
      background: '#f1f5f9',
    },
  },

  homeIcon: {
    fontSize: '16px',
  },
}