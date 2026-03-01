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
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    opened: 0,
    completed: 0,
    progress: 0
  })

  const whatsappLink = 'https://wa.me/message/UKASWZCU5BNLN1?src=qr'
  const telegramBotLink = 'https://t.me/AskMrBishoy_bot'

  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        const parsedUser = JSON.parse(userData)
        
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
        console.error('خطأ في تحويل بيانات المستخدم:', error)
      }
    }
    
    setLoading(false)
  }, [])

  const fetchCourses = async (userYear: string, studentId: string) => {
    try {
      setCoursesLoading(true)
      
      const yearCode = convertYearToCode(userYear)
      
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
      
      const coursesWithStatus = allCourses.map(course => ({
        ...course,
        isOpened: openedCourseIds.includes(course.id)
      }))
      
      setCourses(coursesWithStatus)
      
      // تحديث الإحصائيات
      const openedCount = coursesWithStatus.filter(c => c.isOpened).length
      setStats({
        total: coursesWithStatus.length,
        opened: openedCount,
        completed: 0,
        progress: coursesWithStatus.length > 0 ? Math.round((openedCount / coursesWithStatus.length) * 100) : 0
      })
      
    } catch (error) {
      console.error('خطأ في جلب الكورسات:', error)
      setCourses([])
    } finally {
      setCoursesLoading(false)
    }
  }

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
      '3-prep': '3-prep',
      
      'أولى ثانوي': '1-secondary',
      'اولى ثانوي': '1-secondary',
      'الصف الأول الثانوي': '1-secondary',
      '1-secondary': '1-secondary',
      
      'ثانية ثانوي': '2-secondary',
      'ثانيه ثانوي': '2-secondary',
      'الصف الثاني الثانوي': '2-secondary',
      '2-secondary': '2-secondary'
    }
    
    return yearMap[yearName] || yearName
  }

  const getYearName = (yearCode: string) => {
    const yearMap: { [key: string]: string } = {
      '1-prep': 'أولى إعدادي',
      '2-prep': 'ثانية إعدادي', 
      '3-prep': 'ثالثة إعدادي',
      '1-secondary': 'أولى ثانوي',
      '2-secondary': 'ثانية ثانوي',
      'first-prep': 'أولى إعدادي',
      'second-prep': 'ثانية إعدادي',
      'third-prep': 'ثالثة إعدادي',
      'أولى إعدادي': 'أولى إعدادي',
      'ثانية إعدادي': 'ثانية إعدادي',
      'ثالثة إعدادي': 'ثالثة إعدادي',
      'أولى ثانوي': 'أولى ثانوي',
      'ثانية ثانوي': 'ثانية ثانوي'
    }
    
    return yearMap[yearCode] || yearCode || 'غير محدد'
  }

  const categorizeCourses = () => {
    if (userYear !== 'ثانية ثانوي') {
      return null
    }
    
    const categories: { [key: string]: any[] } = {
      'all': courses,
      'كيمياء': [],
      'فيزياء': []
    }
    
    courses.forEach(course => {
      if (course.category === 'كيمياء') {
        categories['كيمياء'].push(course)
      } else if (course.category === 'فيزياء') {
        categories['فيزياء'].push(course)
      }
    })
    
    return categories
  }
  
  const getDisplayedCourses = () => {
    if (userYear !== 'ثانية ثانوي' || activeCategory === 'all') {
      return courses
    }
    
    const categories = categorizeCourses()
    return categories ? categories[activeCategory] : courses
  }
  
  const getCategoryStats = () => {
    if (userYear !== 'ثانية ثانوي') return null
    
    const categories = categorizeCourses()
    if (!categories) return null
    
    return {
      chemistry: categories['كيمياء'].length,
      physics: categories['فيزياء'].length,
      total: courses.length
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingSpinner}></div>
        <p style={styles.loadingText}>جاري تحميل المنصة...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.lockIcon}>🔒</div>
        <p style={styles.loadingText}>يجب تسجيل الدخول أولاً</p>
        <Link href="/login" style={styles.loginLink}>
          تسجيل الدخول
        </Link>
      </div>
    )
  }

  const userYear = getYearName(user.year || user.grade || '')
  const categoryStats = getCategoryStats()
  const displayedCourses = getDisplayedCourses()

  const handleLogout = () => {
    localStorage.clear()
    window.location.href = '/login'
  }

  return (
    <div style={styles.container}>
      {/* الهيدر العلوي */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.logoSection}>
            <button 
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              style={styles.menuToggle}
            >
              ☰
            </button>
            <div>
              <h1 style={styles.logo}>🎓 علمني العلوم</h1>
              <p style={styles.logoSub}>منصة مستر بيشوي التعليمية</p>
            </div>
          </div>
          
          <div style={styles.userSection}>
            <div style={styles.userAvatar}>
              {user.name?.charAt(0) || 'ط'}
            </div>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.name || 'طالب'}</div>
              <div style={styles.userBadge}>{userYear}</div>
            </div>
            {/* زر تسجيل الخروج شيلناه من هنا */}
          </div>
        </div>
      </header>

      {/* المحتوى الرئيسي */}
      <div style={styles.mainContent}>
        {/* الشريط الجانبي */}
        <aside style={{
          ...styles.sidebar,
          width: sidebarCollapsed ? '80px' : '300px'
        }}>
          <div style={styles.sidebarContent}>
            {/* بطاقة السنة الدراسية */}
            <div style={styles.yearCard}>
              <div style={styles.yearIcon}>📚</div>
              {!sidebarCollapsed && (
                <div style={styles.yearInfo}>
                  <div style={styles.yearLabel}>سنتك الدراسية</div>
                  <div style={styles.yearValue}>{userYear}</div>
                </div>
              )}
            </div>

            {/* إحصائيات سريعة */}
            <div style={styles.statsCard}>
              {!sidebarCollapsed && <h3 style={styles.statsTitle}>إحصائياتك</h3>}
              <div style={styles.statsList}>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>📊</span>
                  {!sidebarCollapsed && (
                    <div>
                      <div style={styles.statNumber}>{stats.total}</div>
                      <div style={styles.statLabel}>كورسات</div>
                    </div>
                  )}
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>✅</span>
                  {!sidebarCollapsed && (
                    <div>
                      <div style={styles.statNumber}>{stats.opened}</div>
                      <div style={styles.statLabel}>مفتوح</div>
                    </div>
                  )}
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statIcon}>📈</span>
                  {!sidebarCollapsed && (
                    <div>
                      <div style={styles.statNumber}>{stats.progress}%</div>
                      <div style={styles.statLabel}>تقدم</div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* فولدرات تانية ثانوي */}
            {userYear === 'ثانية ثانوي' && categoryStats && !sidebarCollapsed && (
              <div style={styles.foldersCard}>
                <h4 style={styles.foldersTitle}>فولدرات المواد</h4>
                <button
                  onClick={() => setActiveCategory('all')}
                  style={{
                    ...styles.folderItem,
                    background: activeCategory === 'all' ? '#f0f9ff' : 'transparent',
                    borderRight: activeCategory === 'all' ? '4px solid #3b82f6' : '4px solid transparent'
                  }}
                >
                  <span>📚 كل المواد</span>
                  <span style={styles.folderCount}>{categoryStats.total}</span>
                </button>
                <button
                  onClick={() => setActiveCategory('كيمياء')}
                  style={{
                    ...styles.folderItem,
                    background: activeCategory === 'كيمياء' ? '#f0f9ff' : 'transparent',
                    borderRight: activeCategory === 'كيمياء' ? '4px solid #8b5cf6' : '4px solid transparent'
                  }}
                >
                  <span>⚗️ كيمياء</span>
                  <span style={styles.folderCount}>{categoryStats.chemistry}</span>
                </button>
                <button
                  onClick={() => setActiveCategory('فيزياء')}
                  style={{
                    ...styles.folderItem,
                    background: activeCategory === 'فيزياء' ? '#f0f9ff' : 'transparent',
                    borderRight: activeCategory === 'فيزياء' ? '4px solid #ef4444' : '4px solid transparent'
                  }}
                >
                  <span>⚛️ فيزياء</span>
                  <span style={styles.folderCount}>{categoryStats.physics}</span>
                </button>
              </div>
            )}

            {/* ✅ روابط سريعة - مع التعديلات المطلوبة */}
            <div style={styles.quickLinks}>
              {!sidebarCollapsed && <h4 style={styles.quickTitle}>روابط سريعة</h4>}
              
              {/* واتساب */}
              <a href={whatsappLink} target="_blank" style={styles.quickLink}>
                <span>📱</span>
                {!sidebarCollapsed && <span>واتساب</span>}
              </a>
              
              {/* تليجرام */}
              <a href={telegramBotLink} target="_blank" style={styles.quickLink}>
                <span>✈️</span>
                {!sidebarCollapsed && <span>تليجرام</span>}
              </a>
              
              {/* المساعد الذكي */}
              <Link href="/bot" style={styles.quickLink}>
                <span>🤖</span>
                {!sidebarCollapsed && <span>المساعد الذكي</span>}
              </Link>
              
              {/* ✅ الدعم الفني (جديد) */}
              <Link href="/support/chat" style={styles.quickLink}>
                <span>💬</span>
                {!sidebarCollapsed && <span>الدعم الفني</span>}
              </Link>
              
              {/* ✅ تسجيل الخروج (كآخر خانة) */}
              <button 
                onClick={handleLogout}
                style={{
                  ...styles.quickLink,
                  background: '#fee2e2',
                  color: '#dc2626',
                  border: 'none',
                  width: '100%',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                <span>🚪</span>
                {!sidebarCollapsed && <span>تسجيل الخروج</span>}
              </button>
            </div>
          </div>
        </aside>

        {/* منطقة المحتوى الرئيسي */}
        <main style={{
          ...styles.mainArea,
          marginRight: sidebarCollapsed ? '80px' : '300px'
        }}>
          {/* شريط التنقل العلوي */}
          <div style={styles.navBar}>
            <div style={styles.breadcrumb}>
              <span>الرئيسية</span>
              {activeCategory !== 'all' && (
                <>
                  <span style={styles.breadcrumbSeparator}>/</span>
                  <span style={styles.breadcrumbActive}>{activeCategory}</span>
                </>
              )}
            </div>
          </div>

          {/* الترحيب */}
          <div style={styles.welcomeBanner}>
            <div>
              <h2 style={styles.welcomeTitle}>
                مرحباً {user.name} 👋
              </h2>
              <p style={styles.welcomeText}>
                {userYear === 'ثانية ثانوي' 
                  ? 'استعرض كورسات الكيمياء والفيزياء حسب المادة'
                  : `هذه هي الكورسات المتاحة لسنتك الدراسية (${userYear})`
                }
              </p>
            </div>
            <div style={styles.progressRing}>
              <svg width="60" height="60" viewBox="0 0 60 60">
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="4"
                />
                <circle
                  cx="30"
                  cy="30"
                  r="26"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="4"
                  strokeDasharray={`${2 * Math.PI * 26}`}
                  strokeDashoffset={`${2 * Math.PI * 26 * (1 - stats.progress / 100)}`}
                  transform="rotate(-90 30 30)"
                />
                <text
                  x="30"
                  y="30"
                  textAnchor="middle"
                  dy="7"
                  fill="#10b981"
                  fontSize="12"
                  fontWeight="bold"
                >
                  {stats.progress}%
                </text>
              </svg>
            </div>
          </div>

          {/* شريط التصنيفات */}
          {userYear === 'ثانية ثانوي' && (
            <div style={styles.categoriesBar}>
              <button
                onClick={() => setActiveCategory('all')}
                style={{
                  ...styles.categoryButton,
                  background: activeCategory === 'all' ? '#3b82f6' : '#f3f4f6',
                  color: activeCategory === 'all' ? 'white' : '#4b5563'
                }}
              >
                📚 الكل
              </button>
              <button
                onClick={() => setActiveCategory('كيمياء')}
                style={{
                  ...styles.categoryButton,
                  background: activeCategory === 'كيمياء' ? '#8b5cf6' : '#f3f4f6',
                  color: activeCategory === 'كيمياء' ? 'white' : '#4b5563'
                }}
              >
                ⚗️ كيمياء
              </button>
              <button
                onClick={() => setActiveCategory('فيزياء')}
                style={{
                  ...styles.categoryButton,
                  background: activeCategory === 'فيزياء' ? '#ef4444' : '#f3f4f6',
                  color: activeCategory === 'فيزياء' ? 'white' : '#4b5563'
                }}
              >
                ⚛️ فيزياء
              </button>
            </div>
          )}

          {/* شبكة الكورسات */}
          {coursesLoading ? (
            <div style={styles.loadingCourses}>
              <div style={styles.spinner}></div>
              <p>جاري تحميل الكورسات...</p>
            </div>
          ) : displayedCourses.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>📭</div>
              <h3 style={styles.emptyTitle}>
                {userYear === 'ثانية ثانوي' && activeCategory !== 'all'
                  ? `لا توجد كورسات في ${activeCategory}`
                  : 'لا توجد كورسات متاحة'
                }
              </h3>
              <p style={styles.emptyText}>
                {userYear === 'ثانية ثانوي' && activeCategory !== 'all'
                  ? 'سيتم إضافة كورسات قريباً'
                  : 'يمكنك التواصل مع الدعم لمعرفة المزيد'
                }
              </p>
            </div>
          ) : (
            <div style={styles.coursesGrid}>
              {displayedCourses.map(course => (
                <div key={course.id} style={styles.courseCard}>
                  <div style={styles.courseHeader}>
                    <div style={styles.courseIcon}>
                      {course.isOpened ? '📖' : '📚'}
                    </div>
                    <div>
                      <h3 style={styles.courseTitle}>{course.title}</h3>
                      {course.category && (
                        <span style={{
                          ...styles.courseCategory,
                          background: course.category === 'كيمياء' ? '#ede9fe' : '#fee2e2',
                          color: course.category === 'كيمياء' ? '#6b21a8' : '#991b1b'
                        }}>
                          {course.category}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p style={styles.courseDescription}>
                    {course.description || 'شرح مبسط ومتكامل للمنهج الدراسي'}
                  </p>
                  
                  <div style={styles.courseMeta}>
                    <span>📅 {new Date(course.createdAt).toLocaleDateString('ar-EG')}</span>
                    {course.price && <span>💰 {course.price} ج.م</span>}
                  </div>
                  
                  <div style={styles.courseFooter}>
                    <span style={{
                      ...styles.statusBadge,
                      background: course.isOpened ? '#d1fae5' : '#fee2e2',
                      color: course.isOpened ? '#065f46' : '#991b1b'
                    }}>
                      {course.isOpened ? '✅ مفتوح' : '🔒 مقفل'}
                    </span>
                    
                    {course.isOpened ? (
                      <Link href={`/course/${course.id}`} style={styles.courseButton}>
                        دخول الكورس ←
                      </Link>
                    ) : (
                      <div style={styles.requestButtons}>
                        <a href={whatsappLink} target="_blank" style={styles.whatsappSmall}>
                          📱
                        </a>
                        <a href={telegramBotLink} target="_blank" style={styles.telegramSmall}>
                          ✈️
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ✅ الفوتر القديم */}
      <footer style={styles.oldFooter}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            © 2026 علمني العلوم مستر بيشوي - منصة التعليم الإلكتروني
          </p>
          <div style={styles.footerLinks}>
            <span style={styles.footerLink}>سياسة الخصوصية</span>
            <span style={styles.footerLink}>الشروط والأحكام</span>
            <span style={styles.footerLink}>اتصل بنا</span>
          </div>
          <div style={styles.footerSupport}>
            <p style={styles.supportInfo}>
              تطوير: <a href="mailto:tomasmehany@gmail.com" style={styles.footerSupportLink}>tomasmehany@gmail.com</a>
            </p>
            <p style={styles.supportInfo}>
              للدعم: 
              <a href={whatsappLink} target="_blank" style={styles.footerSupportLink}>واتساب</a> | 
              <a href={telegramBotLink} target="_blank" style={styles.footerSupportLink}>تليجرام</a>
            </p>
          </div>
        </div>
      </footer>

      {/* ✅ الأزرار العائمة على الشمال - فوق بعض */}
      <div style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        zIndex: 99999,
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
      }}>
        {/* زر الدعم */}
        <Link 
          href="/support/chat"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            backgroundColor: '#2563eb',
            color: 'white',
            borderRadius: '50%',
            textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(37, 99, 235, 0.4)',
            fontSize: '26px',
            border: '2px solid white',
            transition: 'all 0.3s ease',
            cursor: 'pointer'
          }}
          title="الدعم الفني"
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#1d4ed8';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#2563eb';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          💬
        </Link>

        {/* زر المساعد الذكي */}
        <Link 
          href="/bot"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: 'white',
            borderRadius: '50%',
            textDecoration: 'none',
            boxShadow: '0 8px 20px rgba(16, 185, 129, 0.4)',
            fontSize: '26px',
            border: '2px solid white',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            animation: 'pulse 2s infinite'
          }}
          title="المساعد الذكي"
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          🤖
        </Link>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            box-shadow: 0 0 0 10px rgba(16, 185, 129, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

const styles: any = {
  container: {
    minHeight: '100vh',
    background: '#f9fafb',
    direction: 'rtl',
    fontFamily: '"Cairo", "Segoe UI", Tahoma, sans-serif'
  },

  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  loadingSpinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },
  loadingText: {
    color: 'white',
    fontSize: '18px',
    marginBottom: '20px'
  },
  lockIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  loginLink: {
    padding: '12px 30px',
    background: 'white',
    color: '#667eea',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    transition: 'all 0.3s'
  },

  header: {
    background: 'white',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100
  },
  headerContent: {
    maxWidth: '1600px',
    margin: '0 auto',
    padding: '15px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  logoSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  menuToggle: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: '#4b5563',
    padding: '5px 10px',
    borderRadius: '8px'
  },
  logo: {
    fontSize: '24px',
    fontWeight: '800',
    color: '#1f2937',
    margin: 0
  },
  logoSub: {
    fontSize: '12px',
    color: '#6b7280',
    margin: 0
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  userAvatar: {
    width: '45px',
    height: '45px',
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  userInfo: {
    textAlign: 'right'
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#1f2937'
  },
  userBadge: {
    fontSize: '12px',
    color: '#3b82f6',
    fontWeight: '600',
    background: '#eff6ff',
    padding: '2px 8px',
    borderRadius: '12px',
    display: 'inline-block',
    marginTop: '4px'
  },

  mainContent: {
    position: 'relative' as const,
    minHeight: 'calc(100vh - 140px)'
  },

  sidebar: {
    position: 'fixed' as const,
    right: 0,
    top: '80px',
    height: 'calc(100vh - 80px)',
    background: 'white',
    boxShadow: '2px 0 10px rgba(0,0,0,0.05)',
    transition: 'width 0.3s ease',
    overflowX: 'hidden' as const,
    zIndex: 90
  },
  sidebarContent: {
    padding: '20px 15px',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '25px'
  },
  yearCard: {
    background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
    color: 'white',
    borderRadius: '12px',
    padding: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  yearIcon: {
    fontSize: '28px',
    background: 'rgba(255,255,255,0.2)',
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  yearInfo: {
    flex: 1
  },
  yearLabel: {
    fontSize: '12px',
    opacity: 0.9,
    marginBottom: '2px'
  },
  yearValue: {
    fontSize: '18px',
    fontWeight: 'bold'
  },
  statsCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '15px'
  },
  statsTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 15px 0'
  },
  statsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px'
  },
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  statIcon: {
    fontSize: '24px',
    width: '40px',
    height: '40px',
    background: 'white',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
  },
  statNumber: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1f2937'
  },
  statLabel: {
    fontSize: '12px',
    color: '#6b7280'
  },
  foldersCard: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '15px'
  },
  foldersTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 12px 0'
  },
  folderItem: {
    width: '100%',
    padding: '12px 15px',
    border: 'none',
    background: 'transparent',
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
    transition: 'all 0.2s',
    textAlign: 'right'
  },
  folderCount: {
    background: '#e5e7eb',
    padding: '2px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600'
  },
  quickLinks: {
    background: '#f8fafc',
    borderRadius: '12px',
    padding: '15px'
  },
  quickTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 12px 0'
  },
  quickLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '10px 12px',
    color: '#4b5563',
    textDecoration: 'none',
    borderRadius: '8px',
    transition: 'all 0.2s',
    fontSize: '14px',
    '&:hover': {
      background: '#f1f5f9',
      color: '#2563eb'
    }
  },

  mainArea: {
    padding: '25px',
    transition: 'margin-right 0.3s ease',
    maxWidth: '1300px'
  },
  navBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  breadcrumb: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    color: '#6b7280'
  },
  breadcrumbSeparator: {
    color: '#d1d5db'
  },
  breadcrumbActive: {
    color: '#2563eb',
    fontWeight: '600'
  },
  searchBar: {
    width: '300px'
  },
  searchInput: {
    width: '100%',
    padding: '10px 15px',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    fontSize: '14px',
    transition: 'all 0.3s',
    outline: 'none'
  },
  welcomeBanner: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    borderRadius: '16px',
    padding: '25px',
    color: 'white',
    marginBottom: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  welcomeTitle: {
    fontSize: '24px',
    fontWeight: 'bold',
    margin: '0 0 10px 0'
  },
  welcomeText: {
    fontSize: '16px',
    opacity: 0.95,
    margin: 0
  },
  progressRing: {
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '50%',
    padding: '5px'
  },
  categoriesBar: {
    display: 'flex',
    gap: '10px',
    marginBottom: '25px',
    flexWrap: 'wrap' as const
  },
  categoryButton: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s'
  },

  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '20px',
    animation: 'fadeIn 0.5s ease'
  },
  courseCard: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '2px solid #f3f4f6',
    transition: 'all 0.3s'
  },
  courseHeader: {
    display: 'flex',
    gap: '15px',
    marginBottom: '15px'
  },
  courseIcon: {
    fontSize: '32px',
    background: '#f3f4f6',
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  courseTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#1f2937',
    margin: '0 0 5px 0'
  },
  courseCategory: {
    fontSize: '12px',
    fontWeight: '600',
    padding: '3px 10px',
    borderRadius: '20px',
    display: 'inline-block'
  },
  courseDescription: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '15px',
    lineHeight: 1.6
  },
  courseMeta: {
    display: 'flex',
    gap: '15px',
    fontSize: '13px',
    color: '#9ca3af',
    marginBottom: '15px'
  },
  courseFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600'
  },
  courseButton: {
    padding: '8px 16px',
    background: '#10b981',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    transition: 'all 0.3s'
  },
  requestButtons: {
    display: 'flex',
    gap: '8px'
  },
  whatsappSmall: {
    width: '36px',
    height: '36px',
    background: '#25D366',
    color: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    fontSize: '18px',
    transition: 'all 0.3s'
  },
  telegramSmall: {
    width: '36px',
    height: '36px',
    background: '#0088cc',
    color: 'white',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    textDecoration: 'none',
    fontSize: '18px',
    transition: 'all 0.3s'
  },
  loadingCourses: {
    textAlign: 'center' as const,
    padding: '50px',
    color: '#6b7280'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #e5e7eb',
    borderTopColor: '#3b82f6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  },
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 20px',
    background: 'white',
    borderRadius: '16px'
  },
  emptyIcon: {
    fontSize: '48px',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '20px',
    color: '#1f2937',
    marginBottom: '10px'
  },
  emptyText: {
    color: '#6b7280'
  },

  // ========== الفوتر القديم ==========
  oldFooter: {
    background: '#1f2937',
    color: 'white',
    padding: '30px 20px',
    marginTop: '40px'
  },
  footerContent: {
    maxWidth: '1600px',
    margin: '0 auto',
    textAlign: 'center' as const
  },
  footerText: {
    color: '#d1d5db',
    marginBottom: '15px',
    fontSize: '14px'
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '20px',
    flexWrap: 'wrap' as const
  },
  footerLink: {
    color: '#9ca3af',
    textDecoration: 'none',
    fontSize: '13px',
    cursor: 'default'
  },
  footerSupport: {
    marginTop: '20px'
  },
  supportInfo: {
    color: '#9ca3af',
    fontSize: '12px',
    marginTop: '8px'
  },
  footerSupportLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    margin: '0 5px'
  }
}