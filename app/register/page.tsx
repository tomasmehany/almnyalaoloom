'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function RegisterPage() {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [phoneValue, setPhoneValue] = useState('');
  const [passwordValue, setPasswordValue] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordValue !== confirmPassword) {
      setMessage('❌ كلمة السر غير متطابقة');
      return;
    }

    setLoading(true);
    setMessage('🔄 جاري التحقق من البيانات...');

    try {
      const { db } = await import('@/lib/firebase');
      const { collection, addDoc, query, where, getDocs } = await import('firebase/firestore');

      const form = e.target as HTMLFormElement;
      const nameInput = form.querySelector('[name="name"]') as HTMLInputElement;
      const phoneInput = form.querySelector('[name="phone"]') as HTMLInputElement;
      const gradeSelect = form.querySelector('[name="grade"]') as HTMLSelectElement;
      const passwordInput = form.querySelector('[name="password"]') as HTMLInputElement;

      const userData = {
        name: nameInput?.value || 'مستخدم',
        phone: phoneInput?.value || '0000000000',
        grade: gradeSelect?.value || 'غير محدد',
        password: passwordInput?.value || '123456',
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      const phone = userData.phone.trim();
      if (!phone || phone.length < 11) {
        setMessage('❌ رقم الهاتف يجب أن يكون 11 رقم');
        setLoading(false);
        return;
      }

      setMessage('🔍 جاري التحقق من رقم الهاتف...');

      const usersRef = collection(db, 'users');
      const phoneQuery = query(usersRef, where('phone', '==', phone));
      const querySnapshot = await getDocs(phoneQuery);

      if (!querySnapshot.empty) {
        setMessage('❌ رقم الهاتف هذا مسجل بالفعل');
        setLoading(false);
        if (phoneInput) {
          phoneInput.style.borderColor = '#ef4444';
          phoneInput.style.background = '#fee2e2';
          setTimeout(() => {
            phoneInput.style.borderColor = '#e5e7eb';
            phoneInput.style.background = '#f9fafb';
          }, 3000);
        }
        return;
      }

      setMessage('🔄 جاري إنشاء الحساب...');
      await addDoc(collection(db, 'users'), userData);
      setMessage('✅ تم التسجيل بنجاح! سيتم مراجعة طلبك من قبل الأدمن.');
      form.reset();
      setPhoneValue('');
      setPasswordValue('');
      setConfirmPassword('');

      setTimeout(() => {
        setMessage('📞 سيتواصل معك الأدمن قريباً للتفعيل');
      }, 2000);
    } catch (error: any) {
      console.error('Firebase error:', error);
      setMessage('❌ حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, '');
    if (cleaned.length <= 11) {
      setPhoneValue(cleaned);
      e.target.value = cleaned;
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword);

  const contactAdmin = () => {
    window.open('https://wa.me/message/UKASWZCU5BNLN1?src=qr', '_blank');
  };

  useEffect(() => {
    if (confirmPassword.length > 0) {
      setPasswordMatch(passwordValue === confirmPassword);
    } else {
      setPasswordMatch(true);
    }
  }, [passwordValue, confirmPassword]);

  if (!mounted) return null;

  return (
    <div style={styles.container}>
      <div style={styles.background}></div>
      <div style={styles.backgroundOverlay}></div>
      
      <div style={styles.content}>
        {/* ========== الجهة اليمنى ========== */}
        <div style={styles.rightPanel}>
          <div style={styles.imageWrapper}>
            <div style={styles.imageContainer}>
              <img 
                src="/images/boy-register.png" 
                alt="Student" 
                style={styles.image}
                onError={(e) => { e.currentTarget.style.display = 'none'; }}
              />
              <div style={styles.imageFallback}>
                <span style={styles.fallbackIcon}>👨‍🎓</span>
              </div>
            </div>
            
            <div style={styles.welcomeText}>
              <h2 style={styles.welcomeTitle}>مرحباً بك في</h2>
              <h1 style={styles.platformName}>علمني العلوم</h1>
              <p style={styles.welcomeMessage}>مع مستر بيشوي، رحلتك نحو التفوق تبدأ من هنا</p>
            </div>

            {/* رابطين بنفس الحجم - الأخضر والأبيض */}
            <div style={styles.rightPanelLinks}>
              {/* الزر الأخضر */}
              <button type="button" onClick={contactAdmin} style={{...styles.rightLink, ...styles.greenButton}}>
                <span style={styles.linkIcon}>💬</span>
                <span>تواصل مع الدعم عبر واتساب</span>
              </button>

              {/* الزر الأبيض */}
              <Link href="/" style={{...styles.rightLink, ...styles.whiteButton}}>
                <span style={styles.linkIcon}>🏠</span>
                <span>العودة للصفحة الرئيسية</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========== الجهة اليسرى ========== */}
        <div style={styles.leftPanel}>
          <div style={styles.formCard}>
            <div style={styles.formHeader}>
              <h2 style={styles.formTitle}>إنشاء حساب جديد</h2>
              <p style={styles.formSubtitle}>أدخل بياناتك للتسجيل في المنصة</p>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              {/* الاسم */}
              <div style={styles.inputGroup}>
                <label style={styles.label}><span style={styles.labelIcon}>👤</span>الاسم بالكامل</label>
                <input type="text" name="name" placeholder="أدخل اسمك الثلاثي" required style={styles.input} />
              </div>

              {/* التليفون */}
              <div style={styles.inputGroup}>
                <label style={styles.label}><span style={styles.labelIcon}>📱</span>رقم التليفون<span style={styles.required}>*</span></label>
                <input type="tel" name="phone" placeholder="01012345678" required minLength={11} maxLength={11} value={phoneValue} onChange={handlePhoneChange} style={styles.input} dir="ltr" />
                <span style={styles.hint}>أدخل 11 رقم (مثال: 01012345678)</span>
              </div>

              {/* السنة الدراسية */}
              <div style={styles.inputGroup}>
                <label style={styles.label}><span style={styles.labelIcon}>📚</span>السنة الدراسية</label>
                <div style={styles.selectWrapper}>
                  <select name="grade" required style={styles.select}>
                    <option value="" disabled selected>اختر مرحلتك الدراسية</option>
                    <option value="1-prep">📘 الصف الأول الإعدادي</option>
                    <option value="2-prep">📗 الصف الثاني الإعدادي</option>
                    <option value="3-prep">📕 الصف الثالث الإعدادي</option>
                    <option value="1-secondary">📙 الصف الأول الثانوي</option>
                    <option value="2-secondary">📔 الصف الثاني الثانوي</option>
                  </select>
                  <span style={styles.selectArrow}>▼</span>
                </div>
              </div>

              {/* كلمة السر */}
              <div style={styles.inputGroup}>
                <label style={styles.label}><span style={styles.labelIcon}>🔐</span>كلمة السر</label>
                <div style={styles.passwordWrapper}>
                  <input type={showPassword ? "text" : "password"} name="password" placeholder="●●●●●●●●" required minLength={6} value={passwordValue} onChange={(e) => setPasswordValue(e.target.value)} style={styles.passwordInput} />
                  <button type="button" onClick={togglePasswordVisibility} style={styles.passwordToggle}>{showPassword ? "🔒" : "👁️"}</button>
                </div>
                <div style={styles.passwordStrengthContainer}>
                  <div style={styles.passwordStrength}>
                    <div style={{ ...styles.strengthBar, width: passwordValue.length >= 6 ? '100%' : `${(passwordValue.length / 6) * 100}%`, background: passwordValue.length >= 6 ? '#10b981' : passwordValue.length >= 4 ? '#f59e0b' : passwordValue.length >= 2 ? '#ef4444' : '#e5e7eb' }}></div>
                  </div>
                  <span style={styles.passwordHint}>لا تقل عن 6 أحرف</span>
                </div>
              </div>

              {/* تأكيد كلمة السر */}
              <div style={styles.inputGroup}>
                <label style={styles.label}><span style={styles.labelIcon}>🔒</span>تأكيد كلمة السر</label>
                <div style={styles.passwordWrapper}>
                  <input type={showConfirmPassword ? "text" : "password"} placeholder="●●●●●●●●" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} style={{ ...styles.passwordInput, borderColor: !passwordMatch && confirmPassword.length > 0 ? '#ef4444' : '#e5e7eb' }} />
                  <button type="button" onClick={toggleConfirmPasswordVisibility} style={styles.passwordToggle}>{showConfirmPassword ? "🔒" : "👁️"}</button>
                </div>
                <span style={styles.confirmHint}>أعد إدخال كلمة السر</span>
                {!passwordMatch && confirmPassword.length > 0 && <span style={styles.errorMessage}>كلمة السر غير متطابقة</span>}
              </div>

              {/* زر التسجيل */}
              <button type="submit" style={{ ...styles.submitButton, ...(loading && styles.submitButtonLoading) }} disabled={loading || !passwordMatch}>
                {loading ? <span style={styles.buttonContent}><span style={styles.spinner}></span>جاري إنشاء الحساب...</span> : <span style={styles.buttonContent}><span>إنشاء حساب جديد</span><span style={styles.buttonArrow}>←</span></span>}
              </button>
            </form>

            {message && (
              <div style={{ ...styles.message, ...(message.includes('✅') && styles.messageSuccess), ...(message.includes('❌') && styles.messageError), ...(message.includes('🔍') && styles.messageInfo), ...(message.includes('🔄') && styles.messageInfo), ...(message.includes('📞') && styles.messageSuccess) }}>
                <span style={styles.messageIcon}>{message.includes('✅') ? '✅' : message.includes('❌') ? '❌' : message.includes('🔍') ? '🔍' : message.includes('📞') ? '📞' : '🔄'}</span>
                <span>{message}</span>
              </div>
            )}

            {/* الفوتر - رابط تسجيل الدخول */}
            <div style={styles.footer}>
              <div style={styles.loginRow}>
                <span style={styles.loginText}>لديك حساب بالفعل؟</span>
                <Link href="/login" style={styles.loginLink}>تسجيل الدخول</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes gradientMove { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
      `}</style>
    </div>
  );
}

const styles: any = {
  container: { minHeight: '100vh', position: 'relative', overflow: 'hidden', fontFamily: '"Cairo", "Segoe UI", Tahoma, sans-serif', direction: 'rtl' },
  background: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(-45deg, #0b1120, #1a1f35, #1e1b4b, #0f172a)', backgroundSize: '400% 400%', animation: 'gradientMove 15s ease infinite', zIndex: 0 },
  backgroundOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'radial-gradient(circle at 30% 50%, rgba(37,99,235,0.15) 0%, transparent 60%)', zIndex: 1 },
  content: { position: 'relative', zIndex: 2, display: 'flex', minHeight: '100vh' },

  // ========== الجهة اليمنى ==========
  rightPanel: { flex: 1.2, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px', position: 'relative', animation: 'fadeIn 0.8s ease-out' },
  imageWrapper: { maxWidth: '600px', width: '100%', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' },
  imageContainer: { position: 'relative', marginBottom: '30px', animation: 'float 6s ease-in-out infinite' },
  image: { width: '100%', maxWidth: '450px', margin: '0 auto', display: 'block', filter: 'drop-shadow(0 20px 30px rgba(0,0,0,0.3))' },
  imageFallback: { width: '300px', height: '300px', margin: '0 auto', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 30px 40px rgba(0,0,0,0.3)' },
  fallbackIcon: { fontSize: '120px' },
  welcomeText: { marginBottom: '40px', color: 'white' },
  welcomeTitle: { fontSize: '28px', fontWeight: '600', marginBottom: '5px', opacity: 0.9 },
  platformName: { fontSize: '42px', fontWeight: '800', marginBottom: '15px', background: 'linear-gradient(135deg, #fbbf24, #f59e0b)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  welcomeMessage: { fontSize: '18px', opacity: 0.8, lineHeight: 1.6 },

  // الرابطين بنفس الحجم
  rightPanelLinks: { display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '350px', marginTop: '20px' },
  
  // الكلاس الأساسي للرابطين (نفس الحجم)
  rightLink: {
    width: '100%',
    padding: '16px',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    border: 'none',
    cursor: 'pointer',
    textDecoration: 'none',
    boxSizing: 'border-box',
  },
  
  // الزر الأخضر
  greenButton: {
    background: '#25D366',
    color: 'white',
    boxShadow: '0 5px 15px rgba(37, 211, 102, 0.3)',
  },
  
  // الزر الأبيض
  whiteButton: {
    background: 'white',
    color: '#2563eb',
    border: '2px solid #2563eb',
  },
  
  linkIcon: { fontSize: '18px' },

  // ========== الجهة اليسرى ==========
  leftPanel: { flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px' },
  formCard: { background: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)', borderRadius: '40px', padding: '40px', width: '100%', maxWidth: '500px', boxShadow: '0 30px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)', animation: 'fadeIn 0.8s ease-out 0.2s both' },
  formHeader: { textAlign: 'center', marginBottom: '30px' },
  formTitle: { fontSize: '32px', fontWeight: '800', color: '#1f2937', marginBottom: '5px' },
  formSubtitle: { fontSize: '16px', color: '#6b7280' },
  form: { display: 'flex', flexDirection: 'column', gap: '20px' },
  inputGroup: { marginBottom: '5px' },
  label: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontWeight: '600', color: '#374151', fontSize: '14px' },
  labelIcon: { fontSize: '16px' },
  required: { color: '#ef4444', marginRight: '4px', fontSize: '16px' },

  input: { width: '100%', padding: '14px 16px', border: '2px solid #e5e7eb', borderRadius: '16px', fontSize: '15px', transition: 'all 0.3s', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' },
  hint: { display: 'block', fontSize: '12px', color: '#6b7280', marginTop: '6px' },

  selectWrapper: { position: 'relative' },
  select: { width: '100%', padding: '14px 16px', border: '2px solid #e5e7eb', borderRadius: '16px', fontSize: '15px', transition: 'all 0.3s', background: '#f9fafb', outline: 'none', cursor: 'pointer', appearance: 'none', color: '#1f2937' },
  selectArrow: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#6b7280', fontSize: '12px', pointerEvents: 'none' },

  passwordWrapper: { position: 'relative' },
  passwordInput: { width: '100%', padding: '14px 45px 14px 16px', border: '2px solid #e5e7eb', borderRadius: '16px', fontSize: '15px', transition: 'all 0.3s', background: '#f9fafb', outline: 'none', boxSizing: 'border-box' },
  passwordToggle: { position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', color: '#6b7280', display: 'flex', alignItems: 'center', justifyContent: 'center' },

  passwordStrengthContainer: { marginTop: '8px' },
  passwordStrength: { height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' },
  strengthBar: { height: '100%', transition: 'width 0.2s ease' },
  passwordHint: { fontSize: '12px', color: '#6b7280', display: 'block' },

  confirmHint: { fontSize: '12px', color: '#6b7280', display: 'block', marginTop: '6px' },
  errorMessage: { display: 'block', fontSize: '12px', color: '#ef4444', marginTop: '6px' },

  submitButton: { width: '100%', padding: '16px', background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)', color: 'white', border: 'none', borderRadius: '50px', fontSize: '18px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.3s', marginTop: '10px', boxShadow: '0 10px 20px rgba(37,99,235,0.3)' },
  submitButtonLoading: { opacity: 0.8, background: 'linear-gradient(135deg, #94a3b8 0%, #64748b 100%)' },
  buttonContent: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' },
  buttonArrow: { fontSize: '20px' },
  spinner: { width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', borderTopColor: '#ffffff', borderRadius: '50%', animation: 'spin 0.8s linear infinite' },

  message: { marginTop: '20px', padding: '15px 20px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', border: '1px solid', animation: 'fadeIn 0.3s ease' },
  messageSuccess: { background: '#ecfdf5', borderColor: '#a7f3d0', color: '#065f46' },
  messageError: { background: '#fef2f2', borderColor: '#fecaca', color: '#991b1b' },
  messageInfo: { background: '#eff6ff', borderColor: '#bfdbfe', color: '#1e40af' },
  messageIcon: { fontSize: '20px', flexShrink: 0 },

  footer: { marginTop: '25px', textAlign: 'center' },
  loginRow: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' },
  loginText: { color: '#4b5563', fontSize: '15px' },
  loginLink: { color: '#2563eb', fontWeight: '700', textDecoration: 'none', fontSize: '15px' },
};