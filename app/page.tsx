'use client'

import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function Home() {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={styles.container}>
      {/* خلفية متحركة */}
      <div style={styles.background}></div>
      <div style={styles.backgroundOverlay}></div>
      
      {/* الهيدر */}
      <header style={{
        ...styles.header,
        background: scrolled ? 'rgba(10, 25, 47, 0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(10px)' : 'none',
        boxShadow: scrolled ? '0 10px 30px rgba(0, 0, 0, 0.2)' : 'none'
      }}>
        <div style={styles.headerContent}>
          <div style={styles.logo}>
            <div style={styles.logoIconWrapper}>
              <span style={styles.logoIcon}>🎓</span>
            </div>
            <div style={styles.logoText}>
              <h1 style={styles.logoMain}>علمني العلوم</h1>
              <p style={styles.logoSub}>منصة مستر بيشوي التعليمية</p>
            </div>
          </div>
          
          <nav style={styles.nav}>
            <button 
              style={styles.navButton}
              onClick={() => router.push('/login')}
            >
              تسجيل الدخول
            </button>
            <button 
              style={styles.navButtonPrimary}
              onClick={() => router.push('/register')}
            >
              إنشاء حساب
            </button>
          </nav>
        </div>
      </header>

      {/* القسم الرئيسي */}
      <main style={styles.main}>
        {/* Hero Section - بدون إحصائيات */}
        <div style={{
          ...styles.hero,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
          transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
        }}>
          <div style={styles.heroContent}>
            <span style={styles.heroBadge}>منصة تعليمية متكاملة</span>
            
            <h1 style={styles.heroTitle}>
              أهلاً بك في  
              <span style={styles.heroHighlight}> "علمني العلوم"</span>
            </h1>
            
            <p style={styles.heroSubtitle}>
              مع مستر بيشوي، رحلتك نحو التفوق تبدأ من هنا
            </p>

            <p style={styles.heroDescription}>
              أنشئ حسابك أو سجل دخولك للوصول إلى الكورسات التعليمية المتخصصة 
              والمحتوى التفاعلي المعد خصيصاً لطلاب المراحل الإعدادية والثانوية
            </p>

            <div style={styles.heroButtons}>
              <button 
                style={styles.primaryButton}
                onClick={() => router.push('/register')}
              >
                <span style={styles.buttonIcon}>✨</span>
                ابدأ رحلتك الآن
                <span style={styles.buttonArrow}>←</span>
              </button>

              <button 
                style={styles.secondaryButton}
                onClick={() => router.push('/login')}
              >
                <span style={styles.buttonIcon}>🔐</span>
                تسجيل الدخول
              </button>
            </div>
          </div>

          <div style={styles.heroImage}>
            <div style={styles.imageWrapper}>
              {/* ✅ غير مسار الصورة هنا */}
              <img 
                src="/home.png" 
                alt="تعليم تفاعلي"
                style={styles.mainImage}
              />
              <div style={styles.imageOverlay}></div>
              <div style={styles.imageBadge}>
                <span>✨ التعلم التفاعلي</span>
              </div>
            </div>
          </div>
        </div>

        {/* مميزات المنصة */}
        <div style={styles.featuresSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>لماذا تختارنا؟</span>
            <h2 style={styles.sectionTitle}>مميزات المنصة</h2>
            <p style={styles.sectionSubtitle}>
              نقدم لك تجربة تعليمية متكاملة تجمع بين الشرح المبسط والتقييم المستمر
            </p>
          </div>
          
          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>📚</span>
              </div>
              <h3 style={styles.featureTitle}>كورسات متخصصة</h3>
              <p style={styles.featureText}>
                شروح مفصلة للعلوم والكيمياء والفيزياء لكل المراحل الإعدادية والثانوية
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>🎬</span>
              </div>
              <h3 style={styles.featureTitle}>فيديوهات تعليمية</h3>
              <p style={styles.featureText}>
                محتوى مرئي مع شرح مبسط وسهل الفهم لكل درس
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>👨‍🏫</span>
              </div>
              <h3 style={styles.featureTitle}>متابعة شخصية</h3>
              <p style={styles.featureText}>
               إجابات على أسئلتك من المدرس والمساعد الذكي الخاص بك 
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={styles.featureIconWrapper}>
                <span style={styles.featureIcon}>📊</span>
              </div>
              <h3 style={styles.featureTitle}>تقييم وتقارير</h3>
              <p style={styles.featureText}>
                متابعة تقدمك الدراسي وتقارير أداء مفصلة عن مستوى فهمك
              </p>
            </div>
          </div>
        </div>

        {/* قسم الكورسات */}
        <div style={styles.coursesSection}>
          <div style={styles.sectionHeader}>
            <span style={styles.sectionBadge}>كورساتنا</span>
            <h2 style={styles.sectionTitle}>الكورسات المتاحة</h2>
            <p style={styles.sectionSubtitle}>
              اختر المرحلة الدراسية وابدأ رحلة التعلم معنا
            </p>
          </div>

          <div style={styles.coursesGrid}>
            <div style={styles.courseCard}>
              <div style={styles.courseIcon}>📘</div>
              <h3 style={styles.courseTitle}>المرحلة الإعدادية</h3>
              <div style={styles.courseDetails}>
                <span>الصف الأول الإعدادي</span>
                <span>الصف الثاني الإعدادي</span>
                <span>الصف الثالث الإعدادي</span>
              </div>
              <button 
                style={styles.courseButton}
                onClick={() => router.push('/register')}
              >
                ابدأ التعلم
              </button>
            </div>

            <div style={styles.courseCard}>
              <div style={styles.courseIcon}>📙</div>
              <h3 style={styles.courseTitle}>المرحلة الثانوية</h3>
              <div style={styles.courseDetails}>
                <span>الصف الأول الثانوي</span>
                <span>الصف الثاني الثانوي - كيمياء</span>
                <span>الصف الثاني الثانوي - فيزياء</span>
              </div>
              <button 
                style={styles.courseButton}
                onClick={() => router.push('/register')}
              >
                ابدأ التعلم
              </button>
            </div>
          </div>
        </div>

        {/* قسم الدعم */}
        <div style={styles.supportSection}>
          <div style={styles.supportCard}>
            <div style={styles.supportIcon}>💬</div>
            <div>
              <h3 style={styles.supportTitle}> للمساعدة تواصل مع الادمن </h3>
              <p style={styles.supportText}>
                لديك استفسار؟ تواصل معنا 
              </p>
            </div>
            <button 
              style={styles.supportButton}
              onClick={() => window.open('https://wa.me/message/UKASWZCU5BNLN1?src=qr', '_blank')}
            >
              تواصل عبر واتساب
            </button>
          </div>
        </div>
      </main>

      {/* الفوتر */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div style={styles.footerTop}>
            <div style={styles.footerInfo}>
              <div style={styles.footerLogo}>
                <span style={styles.footerLogoIcon}>🎓</span>
                <div>
                  <h3 style={styles.footerTitle}>علمني العلوم</h3>
                  <p style={styles.footerSubtitle}>منصة مستر بيشوي التعليمية</p>
                </div>
              </div>
              <p style={styles.footerDescription}>
                منصة تعليمية متخصصة في تدريس العلوم والكيمياء والفيزياء للمراحل الإعدادية والثانوية
              </p>
            </div>

            <div style={styles.footerLinks}>
              <h4 style={styles.footerLinksTitle}>روابط سريعة</h4>
              <button 
                style={styles.footerLink}
                onClick={() => router.push('/login')}
              >
                تسجيل الدخول
              </button>
              <button 
                style={styles.footerLink}
                onClick={() => router.push('/register')}
              >
                إنشاء حساب
              </button>
              <button 
                style={styles.footerLink}
                onClick={() => window.open('https://wa.me/message/UKASWZCU5BNLN1?src=qr', '_blank')}
              >
                الدعم الفني
              </button>
            </div>
          </div>

          <div style={styles.footerBottom}>
            <p style={styles.copyright}>
              جميع الحقوق محفوظة © {new Date().getFullYear()} علمني العلوم
            </p>
            <p style={styles.developer}>
              تطوير: <a href="mailto:tomasmehany@gmail.com" style={styles.developerLink}>tomasmehany@gmail.com</a>
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  )
}

const styles: any = {
  container: {
    minHeight: '100vh',
    fontFamily: '"Cairo", "Segoe UI", Tahoma, sans-serif',
    position: 'relative',
    overflowX: 'hidden',
    background: '#0a192f',
    direction: 'rtl'
  },

  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(-45deg, #0a192f, #112240, #1a2f4f, #0a192f)',
    backgroundSize: '400% 400%',
    animation: 'gradientMove 15s ease infinite',
    zIndex: 0
  },

  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 30% 50%, rgba(37,99,235,0.1) 0%, transparent 60%)',
    zIndex: 1
  },

  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '15px 5%',
    transition: 'all 0.3s ease'
  },

  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    zIndex: 2
  },

  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },

  logoIconWrapper: {
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'float 3s ease-in-out infinite'
  },

  logoIcon: {
    fontSize: '30px'
  },

  logoText: {
    display: 'flex',
    flexDirection: 'column'
  },

  logoMain: {
    fontSize: '24px',
    fontWeight: '800',
    color: 'white',
    margin: 0,
    lineHeight: 1.2
  },

  logoSub: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
  },

  nav: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },

  navButton: {
    padding: '12px 24px',
    background: 'transparent',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },

  navButtonPrimary: {
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    boxShadow: '0 10px 20px rgba(37,99,235,0.3)'
  },

  main: {
    position: 'relative',
    zIndex: 2,
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '40px 5%'
  },

  hero: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '60px',
    alignItems: 'center',
    marginBottom: '100px',
    minHeight: '600px'
  },

  heroContent: {
    color: 'white'
  },

  heroBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    background: 'rgba(37,99,235,0.1)',
    border: '1px solid rgba(37,99,235,0.3)',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#60a5fa',
    marginBottom: '20px'
  },

  heroTitle: {
    fontSize: '56px',
    fontWeight: '800',
    marginBottom: '20px',
    lineHeight: 1.2,
    color: 'white'
  },

  heroHighlight: {
    color: '#2563eb'
  },

  heroSubtitle: {
    fontSize: '20px',
    color: '#94a3b8',
    marginBottom: '20px'
  },

  heroDescription: {
    fontSize: '18px',
    lineHeight: 1.8,
    color: '#cbd5e1',
    marginBottom: '40px'
  },

  heroButtons: {
    display: 'flex',
    gap: '20px',
    marginBottom: '40px',
    flexWrap: 'wrap'
  },

  primaryButton: {
    padding: '16px 32px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    boxShadow: '0 10px 20px rgba(37,99,235,0.3)'
  },

  secondaryButton: {
    padding: '16px 32px',
    background: 'transparent',
    color: 'white',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    transition: 'all 0.3s'
  },

  buttonIcon: {
    fontSize: '20px'
  },

  buttonArrow: {
    fontSize: '20px'
  },

  heroImage: {
    position: 'relative',
    animation: 'float 6s ease-in-out infinite'
  },

  imageWrapper: {
    position: 'relative',
    borderRadius: '30px',
    overflow: 'hidden',
    boxShadow: '0 30px 60px rgba(0,0,0,0.5)',
    border: '1px solid rgba(255,255,255,0.1)'
  },

  mainImage: {
    width: '100%',
    height: '500px',
    objectFit: 'cover',
    display: 'block'
  },

  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.7))'
  },

  imageBadge: {
    position: 'absolute',
    top: '20px',
    left: '20px',
    padding: '10px 20px',
    background: 'rgba(37,99,235,0.9)',
    backdropFilter: 'blur(10px)',
    borderRadius: '50px',
    color: 'white',
    fontSize: '14px',
    fontWeight: '600',
    border: '1px solid rgba(255,255,255,0.2)',
    boxShadow: '0 10px 20px rgba(0,0,0,0.3)'
  },

  featuresSection: {
    marginBottom: '100px'
  },

  sectionHeader: {
    textAlign: 'center',
    marginBottom: '60px'
  },

  sectionBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    background: 'rgba(37,99,235,0.1)',
    border: '1px solid rgba(37,99,235,0.3)',
    borderRadius: '50px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#60a5fa',
    marginBottom: '20px'
  },

  sectionTitle: {
    fontSize: '42px',
    fontWeight: '800',
    color: 'white',
    marginBottom: '20px'
  },

  sectionSubtitle: {
    fontSize: '18px',
    color: '#94a3b8',
    maxWidth: '600px',
    margin: '0 auto',
    lineHeight: 1.6
  },

  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '30px'
  },

  featureCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '24px',
    padding: '30px',
    textAlign: 'center',
    transition: 'all 0.3s',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)'
  },

  featureIconWrapper: {
    width: '70px',
    height: '70px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 20px',
    animation: 'pulse 2s infinite'
  },

  featureIcon: {
    fontSize: '32px'
  },

  featureTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '15px'
  },

  featureText: {
    fontSize: '15px',
    color: '#94a3b8',
    lineHeight: 1.6
  },

  coursesSection: {
    marginBottom: '100px'
  },

  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '30px',
    maxWidth: '900px',
    margin: '0 auto'
  },

  courseCard: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '30px',
    padding: '40px',
    textAlign: 'center',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
    transition: 'all 0.3s'
  },

  courseIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },

  courseTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '20px'
  },

  courseDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginBottom: '30px',
    color: '#94a3b8',
    fontSize: '16px'
  },

  courseButton: {
    padding: '14px 28px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    width: '100%'
  },

  supportSection: {
    marginBottom: '60px'
  },

  supportCard: {
    background: 'linear-gradient(135deg, #1e293b, #334155)',
    borderRadius: '30px',
    padding: '40px',
    display: 'flex',
    alignItems: 'center',
    gap: '30px',
    border: '1px solid rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)'
  },

  supportIcon: {
    fontSize: '48px',
    width: '80px',
    height: '80px',
    background: 'linear-gradient(135deg, #25D366, #128C7E)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    animation: 'pulse 2s infinite'
  },

  supportTitle: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
    marginBottom: '10px'
  },

  supportText: {
    fontSize: '16px',
    color: '#94a3b8'
  },

  supportButton: {
    padding: '14px 28px',
    background: '#25D366',
    color: 'white',
    border: 'none',
    borderRadius: '50px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s',
    marginRight: 'auto'
  },

  footer: {
    background: 'rgba(0,0,0,0.3)',
    backdropFilter: 'blur(10px)',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '60px 5% 30px',
    position: 'relative',
    zIndex: 2
  },

  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto'
  },

  footerTop: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '60px',
    marginBottom: '60px'
  },

  footerInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },

  footerLogo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },

  footerLogoIcon: {
    fontSize: '40px',
    width: '60px',
    height: '60px',
    background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },

  footerTitle: {
    fontSize: '20px',
    fontWeight: '700',
    color: 'white',
    margin: 0
  },

  footerSubtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: 0
  },

  footerDescription: {
    fontSize: '16px',
    color: '#94a3b8',
    lineHeight: 1.8,
    maxWidth: '400px'
  },

  footerLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },

  footerLinksTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: 'white',
    marginBottom: '10px'
  },

  footerLink: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    fontSize: '15px',
    textAlign: 'right',
    cursor: 'pointer',
    padding: '5px 0',
    transition: 'all 0.3s'
  },

  footerBottom: {
    paddingTop: '30px',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '20px'
  },

  copyright: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0
  },

  developer: {
    color: '#94a3b8',
    fontSize: '14px',
    margin: 0
  },

  developerLink: {
    color: '#2563eb',
    textDecoration: 'none',
    transition: 'all 0.3s'
  }
}