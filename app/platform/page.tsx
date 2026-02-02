'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export default function PlatformPage() {
  const [user, setUser] = useState<any>(null)
  const [userId, setUserId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [courses, setCourses] = useState<any[]>([])
  const [coursesLoading, setCoursesLoading] = useState(false)

  // ⭐ روابط التواصل
  const whatsappLink = 'https://wa.me/message/UKASWZCU5BNLN1?src=qr'
  const telegramBotLink = 'https://t.me/AskMrBishoy_bot'

  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        
        // جلب الـ user ID
        let userId = ''
        if (parsedUser.id) userId = parsedUser.id
        else if (parsedUser.userId) userId = parsedUser.userId
        else if (parsedUser.uid) userId = parsedUser.uid
        else if (parsedUser._id) userId = parsedUser._id
        else if (parsedUser.phone) userId = parsedUser.phone
        
        if (userId) {
          setUserId(userId)
        }
        
        if (parsedUser.grade && !parsedUser.year) {
          parsedUser.year = parsedUser.grade
        }
        
        if (!parsedUser.year) {
          parsedUser.year = 'غير محدد'
        }
        
        setUser(parsedUser)
        
        if (parsedUser.year && userId) {
          fetchCourses(parsedUser.year, userId)
        }
      } catch (error) {
        console.error('❌ خطأ في تحويل بيانات المستخدم:', error)
      }
    }
    
    setLoading(false)
  }, [])

  // دالة جلب الكورسات
  const fetchCourses = async (userYear: string, studentId: string) => {
    try {
      setCoursesLoading(true)
      console.log('🔍 جلب الكورسات للطالب:', studentId, 'السنة:', userYear)
      
      const yearCode = convertYearToCode(userYear)
      
      // 1. جلب كل الكورسات النشطة للمرحلة
      const coursesQuery = query(
        collection(db, "courses"),
        where("grade", "==", yearCode),
        where("isActive", "==", true)
      )
      
      const coursesSnap = await getDocs(coursesQuery)
      const allCourses: any[] = []
      
      coursesSnap.forEach((doc) => {
        allCourses.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      // 2. جلب الكورسات المفتوحة لهذا الطالب
      const studentCoursesQuery = query(
        collection(db, "student_courses"),
        where("studentId", "==", studentId),
        where("isActive", "==", true)
      )
      
      const studentCoursesSnap = await getDocs(studentCoursesQuery)
      const openedCourseIds: string[] = []
      
      studentCoursesSnap.forEach((doc) => {
        const data = doc.data()
        openedCourseIds.push(data.courseId)
      })
      
      // 3. دمج البيانات
      const coursesWithStatus = allCourses.map(course => ({
        ...course,
        isOpened: openedCourseIds.includes(course.id)
      }))
      
      setCourses(coursesWithStatus)
      
    } catch (error) {
      console.error('❌ خطأ في جلب الكورسات:', error)
      setCourses([])
    } finally {
      setCoursesLoading(false)
    }
  }

  // تحويل اسم السنة إلى كود
  const convertYearToCode = (yearName: string): string => {
    const yearMap: { [key: string]: string } = {
      'أولى إعدادي': '1-prep',
      'اولى اعدادي': '1-prep',
      'أولى اعدادي': '1-prep',
      'الصف الأول الإعدادي': '1-prep',
      '1-prep': '1-prep',
      
      'ثانية إعدادي': '2-prep',
      'ثانيه اعدادي': '2-prep',
      'الصف الثاني الإعدادي': '2-prep',
      '2-prep': '2-prep',
      
      'ثالثة إعدادي': '3-prep',
      'ثالثه اعدادي': '3-prep',
      'الصف الثالث الإعدادي': '3-prep',
      '3-prep': '3-prep'
    }
    
    return yearMap[yearName] || yearName
  }

  const getYearName = (yearCode: string) => {
    const yearMap: { [key: string]: string } = {
      '1-prep': 'أولى إعدادي',
      '2-prep': 'ثانية إعدادي', 
      '3-prep': 'ثالثة إعدادي',
      'first-prep': 'أولى إعدادي',
      'second-prep': 'ثانية إعدادي',
      'third-prep': 'ثالثة إعدادي',
      'أولى إعدادي': 'أولى إعدادي',
      'ثانية إعدادي': 'ثانية إعدادي',
      'ثالثة إعدادي': 'ثالثة إعدادي'
    }
    
    return yearMap[yearCode] || yearCode || 'غير محدد'
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ fontSize: '3rem' }}>⏳</div>
        <p style={{ color: 'white', fontSize: '18px', marginBottom: '20px' }}>
          جاري تحميل المنصة...
        </p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={{ fontSize: '3rem' }}>🔒</div>
        <p style={{ color: 'white', fontSize: '18px', marginBottom: '20px' }}>
          يجب تسجيل الدخول أولاً
        </p>
        <Link href="/login" style={styles.loginLink}>
          تسجيل الدخول
        </Link>
      </div>
    )
  }

  const userYear = getYearName(user.year || user.grade || '')

  return (
    <div style={styles.container}>
      {/* الهيدر */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.logo}>🎓 علمني العلوم</h1>
            <p style={styles.subLogo}>مستر بيشوي - منصتك التعليمية</p>
          </div>
          
          <div style={styles.userInfo}>
            <div style={styles.avatar}>
              {user.name?.charAt(0) || 'ط'}
            </div>
            <div>
              <div style={styles.userName}>مرحباً، {user.name || 'طالب'}</div>
              <div style={styles.userGrade}>السنة: <strong>{userYear}</strong></div>
            </div>
            <button 
              onClick={() => {
                localStorage.clear()
                window.location.href = '/login'
              }}
              style={styles.logoutButton}
            >
              تسجيل الخروج
            </button>
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <main style={styles.main}>
        {/* القسم الأيسر */}
        <div style={styles.sidebar}>
          {/* السنة الدراسية */}
          <div style={styles.yearCard}>
            <div style={styles.yearIcon}>📚</div>
            <div>
              <h3 style={styles.yearTitle}>سنتك الدراسية</h3>
              <p style={styles.yearValue}>{userYear}</p>
              <p style={styles.yearNote}>جميع الكورسات المعروضة خاصة بهذه السنة</p>
            </div>
          </div>

          {/* الإحصائيات */}
          <div style={styles.statsCard}>
            <h3 style={styles.statsTitle}>📊 إحصائياتي</h3>
            <div style={styles.statsGrid}>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{courses.length}</div>
                <div style={styles.statLabel}>كورسات متاحة</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>{courses.filter(c => c.isOpened).length}</div>
                <div style={styles.statLabel}>كورسات مفتوحة</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>دروس مكتملة</div>
              </div>
              <div style={styles.statItem}>
                <div style={styles.statNumber}>0%</div>
                <div style={styles.statLabel}>التقدم العام</div>
              </div>
            </div>
          </div>

          {/* زر تحديث الكورسات */}
          <button 
            onClick={() => fetchCourses(user.year || user.grade, userId)}
            style={styles.refreshButton}
            disabled={coursesLoading}
          >
            {coursesLoading ? '🔄 جاري التحديث...' : '🔄 تحديث قائمة الكورسات'}
          </button>

          {/* مربع التواصل */}
          <div style={styles.telegramCard}>
            <div style={styles.telegramIcon}>💬</div>
            <div>
              <h4 style={styles.telegramTitle}>للأسئلة والدعم</h4>
              <p style={styles.telegramText}>
                تواصل مع الدعم عبر واتساب أو تليجرام
              </p>
              <div style={styles.contactButtons}>
                <a 
                  href={whatsappLink} 
                  target="_blank" 
                  style={styles.whatsappButton}
                >
                  📱 واتساب
                </a>
                <a 
                  href={telegramBotLink} 
                  target="_blank" 
                  style={styles.telegramButton}
                >
                  ✈️ تليجرام
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* القسم الأيمن */}
        <div style={styles.content}>
          {/* رسالة ترحيبية */}
          <div style={styles.welcomeCard}>
            <h2 style={styles.welcomeTitle}>🚀 أهلاً بك في منصتك التعليمية</h2>
            <p style={styles.welcomeText}>
              هذه الكورسات المتاحة لسنتك الدراسية ({userYear})، 
              الكورسات المفتوحة <span style={{color: '#10b981', fontWeight: 'bold'}}>✅</span> يمكنك الدخول إليها مباشرة.<br/>
              الكورسات المقفولة <span style={{color: '#ef4444', fontWeight: 'bold'}}>🔒</span> تحتاج للتواصل مع الدعم لتفعيلها.
            </p>
          </div>

          {/* الكورسات الخاصة بالسنة */}
          <div style={styles.coursesCard}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>📚 الكورسات المتاحة لـ {userYear}</h2>
              <div style={styles.yearBadge}>{userYear}</div>
            </div>

            {/* عرض حالة التحميل */}
            {coursesLoading ? (
              <div style={styles.loadingCourses}>
                <div style={styles.loadingIcon}>🔄</div>
                <p>جاري تحميل الكورسات...</p>
              </div>
            ) : courses.length === 0 ? (
              <div style={styles.noCourses}>
                <div style={styles.noCoursesIcon}>📭</div>
                <h3 style={styles.noCoursesTitle}>لا توجد كورسات متاحة</h3>
                <p style={styles.noCoursesText}>
                  لا توجد كورسات مسجلة لسنتك الدراسية ({userYear}) بعد.
                </p>
                <p style={styles.noCoursesSubtext}>
                  يمكن للإدارة إضافة كورسات جديدة من لوحة التحكم.
                </p>
              </div>
            ) : (
              <>
                {/* قائمة الكورسات مع روابط */}
                <div style={styles.coursesGrid}>
                  {courses.map(course => (
                    <div key={course.id} style={{
                      ...styles.courseItem,
                      borderColor: course.isOpened ? '#10b981' : '#e5e7eb'
                    }}>
                      <div style={styles.courseHeader}>
                        <div style={styles.courseIcon}>
                          {course.isOpened ? '📖' : '📚'}
                        </div>
                        <h3 style={styles.courseName}>{course.title}</h3>
                      </div>
                      <p style={styles.courseDescription}>
                        {course.description || 'لا يوجد وصف للكورس'}
                      </p>
                      <div style={styles.courseDetails}>
                        <span>📅 تم الإضافة: {new Date(course.createdAt).toLocaleDateString('ar-EG')}</span>
                        {course.price && <span>💰 السعر: {course.price} ج.م</span>}
                      </div>
                      <div style={styles.courseStatus}>
                        {course.isOpened ? (
                          <span style={styles.openedBadge}>✅ مفتوح</span>
                        ) : (
                          <span style={styles.lockedBadge}>🔒 مقفل</span>
                        )}
                        
                        {course.isOpened ? (
                          <Link href={`/course/${course.id}`} style={styles.courseLink}>
                            دخول للكورس
                          </Link>
                        ) : (
                          <div style={styles.requestButtons}>
                            <a 
                              href={whatsappLink}
                              target="_blank"
                              style={styles.whatsappRequestButton}
                            >
                              📱 طلب تفعيل
                            </a>
                            <a 
                              href={telegramBotLink}
                              target="_blank"
                              style={styles.telegramRequestButton}
                            >
                              ✈️ طلب تفعيل
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* معلومات */}
                <div style={styles.coursesInfo}>
                  <p>📌 <strong>عدد الكورسات:</strong> {courses.length} كورس</p>
                  <p>✅ <strong>الكورسات المفتوحة:</strong> {courses.filter(c => c.isOpened).length} كورس</p>
                  <p>ℹ️ <strong>ملاحظة:</strong> الكورسات المفتوحة يمكن الدخول إليها مباشرة</p>
                </div>
              </>
            )}

            {/* ملاحظة الدفع */}
            <div style={styles.paymentNote}>
              <p>📞 <strong>لطلب التفعيل:</strong> تواصل مع الدعم عبر واتساب أو تليجرام</p>
              <p>💳 <strong>طرق الدفع:</strong> تحويل بنكي، فودافون كاش، أو أي طريقة أخرى</p>
            </div>
          </div>
        </div>
      </main>

      {/* ⭐⭐ الفوتر - تم التعديل ⭐⭐ */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            © 2026 علمني العلوم مستر بيشوي - منصة التعليم الإلكتروني
          </p>
          <div style={styles.footerLinks}>
            <Link href="/privacy" style={styles.footerLink}>سياسة الخصوصية</Link>
            <Link href="/terms" style={styles.footerLink}>الشروط والأحكام</Link>
            <Link href="/contact" style={styles.footerLink}>اتصل بنا</Link>
          </div>
          <div style={styles.footerSupport}>
            <p style={styles.supportInfo}>
              {/* ⭐⭐ تم تغيير الإدارة ⭐⭐ */}
              تطوير وإدارة: <a href="mailto:tomasmehany@gmail.com" style={styles.footerSupportLink}>tomasmehany@gmail.com</a>
            </p>
            <p style={styles.supportInfo}>
              للدعم: 
              <a href={whatsappLink} target="_blank" style={styles.footerSupportLink}>واتساب</a> | 
              <a href={telegramBotLink} target="_blank" style={styles.footerSupportLink}>تليجرام</a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// الأنماط
const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
    direction: 'rtl' as const,
    fontFamily: 'Arial, sans-serif'
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  loginLink: {
    padding: '12px 24px',
    background: 'white',
    color: '#667eea',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold' as const
  },
  header: {
    background: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    padding: '0 20px'
  },
  headerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 0'
  },
  logo: {
    fontSize: '28px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    margin: 0
  },
  subLogo: {
    color: '#6b7280',
    fontSize: '14px',
    margin: 0
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  avatar: {
    width: '50px',
    height: '50px',
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '20px',
    fontWeight: 'bold' as const
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#1f2937'
  },
  userGrade: {
    fontSize: '14px',
    color: '#3b82f6',
    fontWeight: '600' as const
  },
  logoutButton: {
    padding: '10px 20px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600' as const
  },
  refreshButton: {
    padding: '12px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    width: '100%',
    '&:disabled': {
      background: '#9ca3af',
      cursor: 'not-allowed'
    }
  },
  main: {
    maxWidth: '1400px',
    margin: '30px auto',
    padding: '0 20px',
    display: 'grid',
    gridTemplateColumns: '350px 1fr',
    gap: '30px'
  },
  sidebar: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  yearCard: {
    background: 'linear-gradient(to right, #3b82f6, #8b5cf6)',
    color: 'white',
    borderRadius: '12px',
    padding: '25px',
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  yearIcon: {
    fontSize: '36px',
    background: 'rgba(255,255,255,0.2)',
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  yearTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    margin: '0 0 5px 0',
    opacity: 0.9
  },
  yearValue: {
    fontSize: '22px',
    fontWeight: 'bold' as const,
    margin: '0 0 5px 0'
  },
  yearNote: {
    fontSize: '13px',
    opacity: 0.8,
    margin: 0
  },
  statsCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  statsTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#1f2937',
    margin: '0 0 20px 0',
    textAlign: 'center' as const
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '15px'
  },
  statItem: {
    textAlign: 'center' as const,
    padding: '15px',
    background: '#f8fafc',
    borderRadius: '8px'
  },
  statNumber: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#3b82f6',
    marginBottom: '5px'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280'
  },
  telegramCard: {
    background: 'linear-gradient(to right, #dbeafe, #93c5fd)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    gap: '15px',
    alignItems: 'flex-start'
  },
  telegramIcon: {
    fontSize: '24px'
  },
  telegramTitle: {
    fontSize: '16px',
    fontWeight: '600' as const,
    color: '#1e40af',
    margin: '0 0 5px 0'
  },
  telegramText: {
    fontSize: '14px',
    color: '#1e40af',
    margin: '0 0 10px 0'
  },
  contactButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px'
  },
  whatsappButton: {
    flex: 1,
    display: 'inline-block',
    background: '#25D366',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600' as const,
    textAlign: 'center' as const
  },
  telegramButton: {
    flex: 1,
    display: 'inline-block',
    background: '#0088cc',
    color: 'white',
    padding: '8px 15px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontSize: '14px',
    fontWeight: '600' as const,
    textAlign: 'center' as const
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  welcomeCard: {
    background: 'linear-gradient(to right, #10b981, #34d399)',
    color: 'white',
    borderRadius: '12px',
    padding: '25px'
  },
  welcomeTitle: {
    fontSize: '22px',
    fontWeight: 'bold' as const,
    margin: '0 0 10px 0'
  },
  welcomeText: {
    fontSize: '15px',
    opacity: 0.9,
    margin: 0,
    lineHeight: '1.6'
  },
  coursesCard: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#1f2937',
    margin: 0
  },
  yearBadge: {
    background: '#3b82f6',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold' as const
  },
  loadingCourses: {
    padding: '50px',
    textAlign: 'center' as const,
    background: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  loadingIcon: {
    fontSize: '3rem',
    marginBottom: '20px'
  },
  noCourses: {
    padding: '50px',
    textAlign: 'center' as const,
    background: '#f9fafb',
    borderRadius: '8px',
    marginBottom: '20px'
  },
  noCoursesIcon: {
    fontSize: '3rem',
    color: '#9ca3af',
    marginBottom: '20px'
  },
  noCoursesTitle: {
    fontSize: '22px',
    color: '#1f2937',
    marginBottom: '15px'
  },
  noCoursesText: {
    color: '#6b7280',
    marginBottom: '10px'
  },
  noCoursesSubtext: {
    color: '#9ca3af',
    fontSize: '14px',
    fontStyle: 'italic' as const
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
    marginBottom: '25px'
  },
  courseItem: {
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    padding: '20px',
    transition: 'all 0.3s',
    '&:hover': {
      borderColor: '#3b82f6'
    }
  },
  courseHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '15px'
  },
  courseIcon: {
    fontSize: '24px'
  },
  courseName: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#1f2937',
    margin: 0,
    flex: 1
  },
  courseDescription: {
    fontSize: '14px',
    color: '#6b7280',
    margin: '0 0 15px 0',
    lineHeight: '1.5'
  },
  courseDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '8px',
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '15px'
  },
  courseStatus: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  openedBadge: {
    background: '#d1fae5',
    color: '#065f46',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600' as const
  },
  lockedBadge: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600' as const
  },
  requestButtons: {
    display: 'flex',
    gap: '8px'
  },
  whatsappRequestButton: {
    padding: '8px 16px',
    background: '#25D366',
    color: 'white',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '14px',
    display: 'inline-block',
    '&:hover': {
      background: '#1da851'
    }
  },
  telegramRequestButton: {
    padding: '8px 16px',
    background: '#0088cc',
    color: 'white',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '14px',
    display: 'inline-block',
    '&:hover': {
      background: '#0077b3'
    }
  },
  courseLink: {
    padding: '8px 16px',
    background: '#10b981',
    color: 'white',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '14px',
    '&:hover': {
      background: '#059669'
    }
  },
  coursesInfo: {
    background: '#f0f9ff',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#0369a1'
  },
  paymentNote: {
    background: '#f0f9ff',
    borderRadius: '8px',
    padding: '20px',
    marginTop: '20px'
  },
  footer: {
    background: '#1f2937',
    marginTop: '50px',
    padding: '40px 20px'
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    textAlign: 'center' as const
  },
  footerText: {
    color: '#d1d5db',
    marginBottom: '15px',
    fontSize: '16px'
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '30px',
    marginBottom: '25px',
    flexWrap: 'wrap' as const
  },
  footerLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '14px'
  },
  footerSupport: {
    marginTop: '20px'
  },
  supportInfo: {
    color: '#9ca3af',
    fontSize: '14px',
    marginTop: '10px'
  },
  footerSupportLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    margin: '0 5px',
    '&:hover': {
      textDecoration: 'underline'
    }
  }
}