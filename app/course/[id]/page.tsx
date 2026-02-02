'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import Link from 'next/link'

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [activeLesson, setActiveLesson] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)

  // جلب بيانات المستخدم
  useEffect(() => {
    const userData = localStorage.getItem('currentUser')
    if (userData) {
      try {
        setUser(JSON.parse(userData))
      } catch (error) {
        console.error('❌ خطأ في تحويل بيانات المستخدم:', error)
        router.push('/login')
      }
    } else {
      router.push('/login')
    }
  }, [router])

  // ⭐⭐ دالة جديدة لجلب الدروس - معدلة ⭐⭐
  const fetchLessons = async (courseId: string) => {
    try {
      console.log('🔍 جلب دروس الكورس:', courseId)
      
      // ⭐⭐ التعديل هنا: جلب الدروس من courses/{courseId}/lessons ⭐⭐
      const lessonsQuery = query(
        collection(db, "courses", courseId, "lessons"),
        orderBy("order", "asc")
      )
      
      const lessonsSnap = await getDocs(lessonsQuery)
      const lessonsData: any[] = []

      lessonsSnap.forEach((doc) => {
        lessonsData.push({
          id: doc.id,
          ...doc.data()
        })
      })

      console.log('📚 عدد الدروس:', lessonsData.length)
      setLessons(lessonsData)

      if (lessonsData.length > 0) {
        setActiveLesson(0)
      }
    } catch (error) {
      console.error('❌ خطأ في جلب الدروس:', error)
      setLessons([])
    }
  }

  // جلب بيانات الكورس والتحقق من الصلاحيات
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!user || !params.id) return

      try {
        setLoading(true)
        console.log('🔍 جلب بيانات الكورس:', params.id)

        // 1. جلب بيانات الكورس
        const courseRef = doc(db, "courses", params.id as string)
        const courseSnap = await getDoc(courseRef)

        if (!courseSnap.exists()) {
          console.log('❌ الكورس غير موجود')
          router.push('/dashboard')
          return
        }

        const courseData = {
          id: courseSnap.id,
          ...courseSnap.data()
        }
        setCourse(courseData)
        console.log('✅ بيانات الكورس:', courseData)

        // 2. التحقق من صلاحية الوصول للكورس
        const accessQuery = query(
          collection(db, "student_courses"),
          where("studentId", "==", user.id || user.userId || user.uid || 'unknown'),
          where("courseId", "==", params.id),
          where("isActive", "==", true)
        )

        const accessSnap = await getDocs(accessQuery)
        
        if (accessSnap.empty) {
          console.log('⚠️ ليس لديك صلاحية للوصول لهذا الكورس')
          setHasAccess(false)
        } else {
          console.log('✅ لديك صلاحية للوصول للكورس')
          setHasAccess(true)

          // ⭐⭐ التعديل هنا: استدعاء الدالة الجديدة ⭐⭐
          fetchLessons(params.id as string)
        }

      } catch (error) {
        console.error('❌ خطأ في جلب بيانات الكورس:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchCourseData()
    }
  }, [params.id, user, router])

  const handleMarkCompleted = async (lessonId: string) => {
    if (!user) return

    try {
      console.log('✅ تم إكمال الدرس:', lessonId)
      alert('✅ تم تسجيل إكمال الدرس')
      
    } catch (error) {
      console.error('❌ خطأ في تسجيل الإكمال:', error)
    }
  }

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loader}>⏳</div>
        <p style={styles.loadingText}>جاري تحميل الكورس...</p>
      </div>
    )
  }

  if (!course) {
    return (
      <div style={styles.errorContainer}>
        <div style={styles.errorIcon}>❌</div>
        <h2 style={styles.errorTitle}>الكورس غير موجود</h2>
        <p style={styles.errorText}>الكورس الذي تبحث عنه غير موجود أو تم حذفه</p>
        <Link href="/platform" style={styles.backLink}>
          ← العودة للمنصة
        </Link>
      </div>
    )
  }

  if (!hasAccess) {
    return (
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerContent}>
            <Link href="/platform" style={styles.backButton}>
              ← العودة للمنصة
            </Link>
            <h1 style={styles.title}>🎓 علمني العلوم مستر بيشوي</h1>
          </div>
        </header>

        <main style={styles.main}>
          <div style={styles.accessDenied}>
            <div style={styles.lockIcon}>🔒</div>
            <h2 style={styles.accessTitle}>الكورس مقفل</h2>
            <p style={styles.accessText}>
              ليس لديك صلاحية للوصول لكورس <strong>{course.title}</strong>
            </p>
            <p style={styles.accessSubtext}>
              يجب تفعيل الكورس أولاً عن طريق الدعم
            </p>
            
            <div style={styles.contactInfo}>
              <h3 style={styles.contactTitle}>للتفعيل والتواصل:</h3>
              <div style={styles.contactDetails}>
                <p>👤 <strong>الدعم الفني</strong></p>
                <p>📞 <strong>01012345678</strong></p>
                <p>💬 <strong>تليجرام: @your_bot</strong></p>
              </div>
            </div>

            <div style={styles.actionButtons}>
              <Link href="/platform" style={styles.browseButton}>
                ← العودة للكورسات
              </Link>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <Link href="/platform" style={styles.backButton}>
            ← العودة للمنصة
          </Link>
          <h1 style={styles.title}>🎓 علمني العلوم مستر بيشوي</h1>
        </div>
      </header>

      <main style={styles.main}>
        <div style={styles.courseHeader}>
          <div style={styles.courseInfo}>
            <h1 style={styles.courseTitle}>{course.title}</h1>
            <p style={styles.courseDescription}>{course.description || 'لا يوجد وصف'}</p>
            <div style={styles.courseMeta}>
              {course.grade && (
                <span style={styles.metaItem}>📚 {course.grade}</span>
              )}
              <span style={styles.metaItem}>📖 {lessons.length} درس</span>
              <span style={styles.metaItem}>✅ مفتوح</span>
            </div>
          </div>
        </div>

        {lessons.length === 0 && (
          <div style={styles.emptyLessons}>
            <div style={styles.emptyIcon}>📚</div>
            <h3 style={styles.emptyTitle}>لا توجد دروس بعد</h3>
            <p style={styles.emptyText}>
              لم يتم إضافة دروس لهذا الكورس بعد. سيتم إضافتها قريباً.
            </p>
            <p style={styles.emptySubtext}>
              تواصل مع الدعم لمزيد من المعلومات
            </p>
          </div>
        )}

        {lessons.length > 0 && (
          <div style={styles.content}>
            <div style={styles.videoSection}>
              <div style={styles.videoPlayer}>
                {activeLesson !== null && lessons[activeLesson]?.videoUrl ? (
                  <iframe
                    src={lessons[activeLesson].videoUrl}
                    style={styles.videoIframe}
                    title={lessons[activeLesson].title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <div style={styles.videoPlaceholder}>
                    <div style={styles.placeholderIcon}>🎬</div>
                    <p style={styles.placeholderText}>
                      {activeLesson !== null ? 'لا يوجد فيديو لهذا الدرس' : 'اختر درساً لعرضه'}
                    </p>
                  </div>
                )}
                
                {activeLesson !== null && (
                  <div style={styles.currentLessonInfo}>
                    <h2 style={styles.currentLessonTitle}>
                      {lessons[activeLesson]?.title}
                    </h2>
                    {lessons[activeLesson]?.description && (
                      <p style={styles.currentLessonDesc}>
                        {lessons[activeLesson].description}
                      </p>
                    )}
                    <div style={styles.lessonMeta}>
                      {lessons[activeLesson]?.duration && (
                        <span style={styles.lessonDuration}>⏱️ {lessons[activeLesson].duration}</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {activeLesson !== null && (
                <div style={styles.actionsBar}>
                  {lessons[activeLesson]?.assignmentLink && (
                    <a 
                      href={lessons[activeLesson].assignmentLink}
                      target="_blank"
                      style={styles.actionButton}
                    >
                      📝 الواجب
                    </a>
                  )}
                  
                  {lessons[activeLesson]?.examLink && (
                    <a 
                      href={lessons[activeLesson].examLink}
                      target="_blank"
                      style={styles.actionButton}
                    >
                      📊 الامتحان
                    </a>
                  )}
                  
                  <button 
                    onClick={() => handleMarkCompleted(lessons[activeLesson].id)}
                    style={styles.completeButton}
                  >
                    ✅ تمت المشاهدة
                  </button>
                </div>
              )}
            </div>

            <div style={styles.lessonsSection}>
              <h2 style={styles.lessonsTitle}>📖 قائمة الدروس ({lessons.length})</h2>
              
              <div style={styles.lessonsList}>
                {lessons.map((lesson, index) => (
                  <div 
                    key={lesson.id}
                    onClick={() => setActiveLesson(index)}
                    style={{
                      ...styles.lessonItem,
                      background: activeLesson === index ? '#f0f9ff' : 'white',
                      borderColor: activeLesson === index ? '#3b82f6' : '#e5e7eb',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={styles.lessonHeader}>
                      <div style={styles.lessonNumber}>الدرس {index + 1}</div>
                      <div style={styles.lessonStatus}>
                        {lesson.isCompleted ? (
                          <span style={styles.completedBadgeSmall}>✅ تم</span>
                        ) : (
                          <span style={styles.pendingBadge}>⏳ جديد</span>
                        )}
                      </div>
                    </div>
                    
                    <h3 style={styles.lessonItemTitle}>{lesson.title}</h3>
                    
                    {lesson.description && (
                      <p style={styles.lessonDesc}>{lesson.description}</p>
                    )}
                    
                    <div style={styles.lessonFooter}>
                      {lesson.duration && (
                        <span style={styles.lessonDurationSmall}>⏱️ {lesson.duration}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div style={styles.supportSection}>
                <h3 style={styles.supportTitle}>💬 لديك سؤال؟</h3>
                <p style={styles.supportText}>
                  تواصل مع الدعم الفني عبر تليجرام للإجابة على أسئلتك
                </p>
                <a 
                  href="https://t.me/your_bot" 
                  target="_blank" 
                  style={styles.supportButton}
                >
                  تواصل مع الدعم
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            © 2024 علمني العلوم مستر بيشوي - منصة التعليم الإلكتروني
          </p>
          <p style={styles.footerText}>
            للدعم الفني: 01012345678
          </p>
        </div>
      </footer>
    </div>
  )
}

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
  loader: {
    fontSize: '3rem',
    marginBottom: '20px'
  },
  loadingText: {
    color: 'white',
    fontSize: '18px'
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    background: '#f8fafc'
  },
  errorIcon: {
    fontSize: '4rem',
    color: '#ef4444',
    marginBottom: '20px'
  },
  errorTitle: {
    fontSize: '28px',
    color: '#1f2937',
    marginBottom: '10px'
  },
  errorText: {
    color: '#6b7280',
    marginBottom: '30px'
  },
  backLink: {
    padding: '12px 24px',
    background: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const
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
    alignItems: 'center',
    padding: '20px 0'
  },
  backButton: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '16px',
    marginLeft: '20px'
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    margin: 0
  },
  main: {
    maxWidth: '1400px',
    margin: '30px auto',
    padding: '0 20px'
  },
  accessDenied: {
    background: 'white',
    borderRadius: '12px',
    padding: '50px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    maxWidth: '600px',
    margin: '0 auto'
  },
  lockIcon: {
    fontSize: '4rem',
    color: '#ef4444',
    marginBottom: '20px'
  },
  accessTitle: {
    fontSize: '28px',
    color: '#1f2937',
    marginBottom: '15px'
  },
  accessText: {
    fontSize: '18px',
    color: '#4b5563',
    marginBottom: '10px'
  },
  accessSubtext: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '30px'
  },
  contactInfo: {
    background: '#f8fafc',
    padding: '25px',
    borderRadius: '10px',
    marginBottom: '30px',
    textAlign: 'right' as const
  },
  contactTitle: {
    fontSize: '18px',
    color: '#1f2937',
    marginBottom: '15px'
  },
  contactDetails: {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '2'
  },
  actionButtons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px'
  },
  browseButton: {
    padding: '15px',
    background: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '16px'
  },
  courseHeader: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  courseInfo: {
    marginBottom: '20px'
  },
  courseTitle: {
    fontSize: '32px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: '15px'
  },
  courseDescription: {
    fontSize: '18px',
    color: '#6b7280',
    marginBottom: '20px',
    lineHeight: 1.6
  },
  courseMeta: {
    display: 'flex',
    gap: '15px',
    flexWrap: 'wrap' as const
  },
  metaItem: {
    background: '#f3f4f6',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    color: '#4b5563'
  },
  emptyLessons: {
    background: 'white',
    borderRadius: '12px',
    padding: '50px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  emptyIcon: {
    fontSize: '4rem',
    color: '#9ca3af',
    marginBottom: '20px'
  },
  emptyTitle: {
    fontSize: '24px',
    color: '#1f2937',
    marginBottom: '15px'
  },
  emptyText: {
    fontSize: '16px',
    color: '#6b7280',
    marginBottom: '10px'
  },
  emptySubtext: {
    fontSize: '14px',
    color: '#9ca3af',
    fontStyle: 'italic' as const
  },
  content: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '30px'
  },
  videoSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '25px'
  },
  videoPlayer: {
    background: 'white',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  videoIframe: {
    width: '100%',
    height: '450px',
    border: 'none'
  },
  videoPlaceholder: {
    width: '100%',
    height: '450px',
    background: '#1f2937',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white'
  },
  placeholderIcon: {
    fontSize: '4rem',
    marginBottom: '20px'
  },
  placeholderText: {
    fontSize: '20px',
    fontWeight: '600' as const
  },
  currentLessonInfo: {
    padding: '20px',
    borderTop: '1px solid #e5e7eb'
  },
  currentLessonTitle: {
    fontSize: '22px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: '10px'
  },
  currentLessonDesc: {
    color: '#6b7280',
    marginBottom: '15px',
    lineHeight: 1.6
  },
  lessonMeta: {
    display: 'flex',
    gap: '15px'
  },
  lessonDuration: {
    color: '#6b7280',
    fontSize: '14px'
  },
  actionsBar: {
    display: 'flex',
    gap: '15px',
    background: 'white',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  actionButton: {
    flex: 1,
    padding: '15px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    textDecoration: 'none',
    textAlign: 'center' as const
  },
  completeButton: {
    padding: '15px 25px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    cursor: 'pointer'
  },
  lessonsSection: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '25px'
  },
  lessonsTitle: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: '15px'
  },
  lessonsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    maxHeight: '500px',
    overflowY: 'auto' as const
  },
  lessonItem: {
    background: 'white',
    border: '2px solid',
    borderRadius: '10px',
    padding: '20px',
    transition: 'all 0.3s'
  },
  lessonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  lessonNumber: {
    background: '#3b82f6',
    color: 'white',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold' as const
  },
  lessonStatus: {
    fontSize: '12px'
  },
  completedBadgeSmall: {
    background: '#d1fae5',
    color: '#065f46',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: '600' as const
  },
  pendingBadge: {
    background: '#fef3c7',
    color: '#92400e',
    padding: '4px 12px',
    borderRadius: '20px',
    fontWeight: '600' as const
  },
  lessonItemTitle: {
    fontSize: '18px',
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: '10px'
  },
  lessonDesc: {
    color: '#6b7280',
    fontSize: '14px',
    marginBottom: '15px',
    lineHeight: 1.5
  },
  lessonFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  lessonDurationSmall: {
    color: '#6b7280',
    fontSize: '12px'
  },
  supportSection: {
    background: 'white',
    padding: '25px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  supportTitle: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: '10px'
  },
  supportText: {
    color: '#6b7280',
    marginBottom: '20px'
  },
  supportButton: {
    display: 'block',
    padding: '15px',
    background: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '16px'
  },
  footer: {
    background: '#1f2937',
    marginTop: '50px'
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px',
    textAlign: 'center' as const
  },
  footerText: {
    color: '#d1d5db',
    margin: '10px 0'
  }
}