'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { 
  collection, getDocs, updateDoc, doc, addDoc, 
  deleteDoc, query, where 
} from 'firebase/firestore'
import Link from 'next/link'

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('students')
  
  const tabs = [
    { id: 'dashboard', name: 'لوحة التحكم', icon: '🏠' },
    { id: 'students', name: 'الطلاب', icon: '👨‍🎓' },
    { id: 'courses', name: 'الكورسات', icon: '📚' },
    { id: 'open-course', name: 'فتح كورس', icon: '🎓' },
    { id: 'videos', name: 'الفيديوهات', icon: '🎬' },
    { id: 'settings', name: 'الإعدادات', icon: '⚙️' }
  ]
  
  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>👨‍💼 لوحة تحكم الأدمن</h1>
        <p style={styles.subtitle}>علمني العلوم مستر بيشوي</p>
      </header>

      <div style={styles.tabsContainer}>
        <div style={styles.tabs}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...styles.tabButton,
                background: activeTab === tab.id ? '#3b82f6' : 'white',
                color: activeTab === tab.id ? 'white' : '#4b5563'
              }}
            >
              <span style={styles.tabIcon}>{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </div>
        
        <div style={styles.adminActions}>
          <Link href="/platform" style={styles.backButton}>
            ← عرض المنصة
          </Link>
          <Link href="/admin/open-course" style={styles.specialButton}>
            🎓 فتح كورس لطالب
          </Link>
        </div>
      </div>

      <div style={styles.content}>
        {activeTab === 'dashboard' && (
          <div style={styles.tabContent}>
            <h2 style={styles.tabTitle}>🏠 لوحة التحكم الرئيسية</h2>
            <div style={styles.statsGrid}>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>طلاب مفعلين</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>كورسات</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>0</div>
                <div style={styles.statLabel}>دروس</div>
              </div>
              <div style={styles.statCard}>
                <div style={styles.statNumber}>0 ج.م</div>
                <div style={styles.statLabel}>إجمالي الإيرادات</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'students' && <StudentsTab />}
        {activeTab === 'courses' && <CoursesTab />}
        {activeTab === 'open-course' && <OpenCourseTab />}
        {activeTab === 'videos' && <VideosTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>
    </div>
  )
}

function StudentsTab() {
  const [students, setStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  const fetchStudents = async () => {
    try {
      setLoading(true)
      console.log('🔍 جاري جلب الطلاب...')
      
      const querySnapshot = await getDocs(collection(db, "users"))
      const studentsList: any[] = []
      
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        console.log('📄 طالب:', data.name)
        
        studentsList.push({
          id: doc.id,
          name: data.name || 'غير معروف',
          phone: data.phone || 'بدون رقم',
          grade: data.grade || 'غير محدد',
          status: data.status || 'pending'
        })
      })
      
      console.log('📊 عدد الطلاب:', studentsList.length)
      setStudents(studentsList)
      setMessage(`✅ تم تحميل ${studentsList.length} طالب`)
    } catch (error) {
      console.error('❌ خطأ:', error)
      setMessage('❌ حدث خطأ في جلب البيانات')
    } finally {
      setLoading(false)
    }
  }

  const activateStudent = async (studentId: string, studentName: string) => {
    try {
      const studentRef = doc(db, "users", studentId)
      await updateDoc(studentRef, { status: 'active' })
      setMessage(`✅ تم تفعيل حساب ${studentName}`)
      fetchStudents()
    } catch (error) {
      setMessage('❌ حدث خطأ في التفعيل')
    }
  }

  const rejectStudent = async (studentId: string, studentName: string) => {
    try {
      const studentRef = doc(db, "users", studentId)
      await updateDoc(studentRef, { status: 'rejected' })
      setMessage(`❌ تم رفض حساب ${studentName}`)
      fetchStudents()
    } catch (error) {
      setMessage('❌ حدث خطأ في الرفض')
    }
  }

  useEffect(() => {
    fetchStudents()
  }, [])

  const pendingStudents = students.filter(s => s.status === 'pending')
  const activeStudents = students.filter(s => s.status === 'active')

  return (
    <div style={styles.tabContent}>
      <div style={styles.tabHeader}>
        <h2 style={styles.tabTitle}>👨‍🎓 إدارة الطلاب</h2>
        <button onClick={fetchStudents} style={styles.refreshButton}>
          🔄 تحديث
        </button>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          background: message.startsWith('✅') ? '#d4fae5' : '#fee2e2',
          color: message.startsWith('✅') ? '#065f46' : '#991b1b'
        }}>
          {message}
        </div>
      )}

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{pendingStudents.length}</div>
          <div style={styles.statLabel}>طلبات معلقة</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{activeStudents.length}</div>
          <div style={styles.statLabel}>طلاب مفعلين</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statNumber}>{students.length}</div>
          <div style={styles.statLabel}>إجمالي الطلاب</div>
        </div>
      </div>

      <h3 style={styles.sectionTitle}>⏳ طلبات التسجيل المعلقة</h3>
      {loading ? (
        <p style={styles.loadingText}>جاري تحميل البيانات...</p>
      ) : pendingStudents.length === 0 ? (
        <p style={styles.emptyText}>لا توجد طلبات معلقة</p>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>الاسم</th>
                <th style={styles.th}>رقم الهاتف</th>
                <th style={styles.th}>الصف</th>
                <th style={styles.th}>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              {pendingStudents.map(student => (
                <tr key={student.id} style={styles.tr}>
                  <td style={styles.td}>{student.name}</td>
                  <td style={styles.td}>{student.phone}</td>
                  <td style={styles.td}>{student.grade}</td>
                  <td style={styles.td}>
                    <div style={styles.actions}>
                      <button onClick={() => activateStudent(student.id, student.name)} style={styles.activateBtn}>
                        ✅ قبول
                      </button>
                      <button onClick={() => rejectStudent(student.id, student.name)} style={styles.rejectBtn}>
                        ❌ رفض
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

function CoursesTab() {
  const [courses, setCourses] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [newCourse, setNewCourse] = useState({
    title: '',
    description: '',
    grade: '1-prep',
    price: 100,
    isActive: true
  })
  const [editingCourse, setEditingCourse] = useState<any>(null)

  const fetchCourses = async () => {
    try {
      setLoading(true)
      const querySnapshot = await getDocs(collection(db, "courses"))
      const coursesList: any[] = []
      
      querySnapshot.forEach((doc) => {
        coursesList.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      setCourses(coursesList)
      setMessage(`✅ تم تحميل ${coursesList.length} كورس`)
    } catch (error) {
      console.error('❌ خطأ في جلب الكورسات:', error)
      setMessage('❌ حدث خطأ في جلب الكورسات')
    } finally {
      setLoading(false)
    }
  }

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newCourse.title.trim()) {
      setMessage('❌ عنوان الكورس مطلوب')
      return
    }

    try {
      console.log('🚀 محاولة إضافة كورس جديد...')
      
      // إضافة الكورس إلى Firestore
      await addDoc(collection(db, "courses"), {
        title: newCourse.title,
        description: newCourse.description,
        grade: newCourse.grade,
        price: Number(newCourse.price),
        isActive: newCourse.isActive,
        createdAt: new Date().toISOString(),
        lessons: 0,
        studentsEnrolled: 0
      })
      
      console.log('✅ كورس مضاف بنجاح!')
      setMessage(`✅ تم إضافة كورس "${newCourse.title}" بنجاح`)
      
      // تفريغ الحقول
      setNewCourse({ title: '', description: '', grade: '1-prep', price: 100, isActive: true })
      
      // تحديث القائمة
      fetchCourses()
      
    } catch (error: any) {
      console.error('❌ خطأ في إضافة الكورس:', error)
      
      let errorMsg = '❌ حدث خطأ في إضافة الكورس'
      if (error.code === 'permission-denied') {
        errorMsg = '❌ ليس لديك صلاحية للإضافة. تحقق من صلاحيات Firebase'
      }
      
      setMessage(errorMsg)
    }
  }

  const handleEditCourse = (course: any) => {
    setEditingCourse(course)
    setNewCourse({
      title: course.title,
      description: course.description || '',
      grade: course.grade || '1-prep',
      price: course.price || 100,
      isActive: course.isActive !== false
    })
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse || !newCourse.title.trim()) return

    try {
      await updateDoc(doc(db, "courses", editingCourse.id), {
        title: newCourse.title,
        description: newCourse.description,
        grade: newCourse.grade,
        price: Number(newCourse.price),
        isActive: newCourse.isActive,
        updatedAt: new Date().toISOString()
      })
      
      setMessage(`✅ تم تحديث كورس "${newCourse.title}"`)
      setEditingCourse(null)
      setNewCourse({ title: '', description: '', grade: '1-prep', price: 100, isActive: true })
      fetchCourses()
      
    } catch (error) {
      setMessage('❌ حدث خطأ في تحديث الكورس')
    }
  }

  const deleteCourse = async (courseId: string, courseTitle: string) => {
    if (!confirm(`هل أنت متأكد من حذف كورس "${courseTitle}"؟`)) return
    
    try {
      await deleteDoc(doc(db, "courses", courseId))
      setMessage(`✅ تم حذف كورس "${courseTitle}"`)
      fetchCourses()
    } catch (error) {
      setMessage('❌ حدث خطأ في حذف الكورس')
    }
  }

  const toggleCourseStatus = async (courseId: string, courseTitle: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, "courses", courseId), {
        isActive: !currentStatus
      })
      
      setMessage(`✅ تم ${!currentStatus ? 'تفعيل' : 'إيقاف'} كورس "${courseTitle}"`)
      fetchCourses()
    } catch (error) {
      setMessage('❌ حدث خطأ في تغيير حالة الكورس')
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  return (
    <div style={styles.tabContent}>
      <div style={styles.tabHeader}>
        <h2 style={styles.tabTitle}>📚 إدارة الكورسات</h2>
        <button onClick={fetchCourses} style={styles.refreshButton}>
          🔄 تحديث القائمة
        </button>
      </div>

      {message && (
        <div style={{
          ...styles.message,
          background: message.startsWith('✅') ? '#d4fae5' : '#fee2e2',
          color: message.startsWith('✅') ? '#065f46' : '#991b1b'
        }}>
          {message}
        </div>
      )}

      <div style={styles.formSection}>
        <h3 style={styles.sectionTitle}>
          {editingCourse ? '✏️ تعديل كورس' : '➕ إضافة كورس جديد'}
        </h3>
        <form onSubmit={editingCourse ? handleUpdateCourse : handleAddCourse} style={styles.form}>
          <div style={styles.formRow}>
            <input
              type="text"
              placeholder="عنوان الكورس *"
              value={newCourse.title}
              onChange={(e) => setNewCourse({...newCourse, title: e.target.value})}
              style={styles.input}
              required
            />
            <select
              value={newCourse.grade}
              onChange={(e) => setNewCourse({...newCourse, grade: e.target.value})}
              style={styles.input}
            >
              <option value="1-prep">أولى إعدادي</option>
              <option value="2-prep">ثانية إعدادي</option>
              <option value="3-prep">ثالثة إعدادي</option>
            </select>
          </div>
          
          <div style={styles.formRow}>
            <textarea
              placeholder="وصف الكورس"
              value={newCourse.description}
              onChange={(e) => setNewCourse({...newCourse, description: e.target.value})}
              style={styles.textarea}
              rows={3}
            />
          </div>
          
          <div style={styles.formRow}>
            <input
              type="number"
              placeholder="السعر (جنيه)"
              value={newCourse.price}
              onChange={(e) => setNewCourse({...newCourse, price: parseInt(e.target.value) || 0})}
              style={styles.input}
              min="0"
            />
            <div style={styles.checkboxGroup}>
              <input
                type="checkbox"
                checked={newCourse.isActive}
                onChange={(e) => setNewCourse({...newCourse, isActive: e.target.checked})}
                style={styles.checkbox}
                id="isActive"
              />
              <label htmlFor="isActive" style={styles.checkboxLabel}>
                كورس نشط
              </label>
            </div>
          </div>
          
          <div style={styles.formRow}>
            {editingCourse ? (
              <>
                <button type="submit" style={styles.updateButton}>
                  ✅ تحديث الكورس
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setEditingCourse(null)
                    setNewCourse({ title: '', description: '', grade: '1-prep', price: 100, isActive: true })
                  }}
                  style={styles.cancelButton}
                >
                  ❌ إلغاء التعديل
                </button>
              </>
            ) : (
              <button type="submit" style={styles.addButton} disabled={!newCourse.title.trim()}>
                ✅ إضافة الكورس
              </button>
            )}
          </div>
        </form>
      </div>

      <div style={styles.listSection}>
        <h3 style={styles.sectionTitle}>📖 الكورسات ({courses.length})</h3>
        {loading ? (
          <p style={styles.loadingText}>جاري تحميل الكورسات...</p>
        ) : courses.length === 0 ? (
          <p style={styles.emptyText}>لا توجد كورسات بعد. أضف كورساً جديداً!</p>
        ) : (
          <div style={styles.coursesGrid}>
            {courses.map(course => (
              <div key={course.id} style={styles.courseCard}>
                <div style={styles.courseHeader}>
                  <div>
                    <h4 style={styles.courseCardTitle}>{course.title}</h4>
                    <div style={styles.courseBadges}>
                      <span style={{
                        ...styles.statusBadge,
                        background: course.isActive ? '#d1fae5' : '#fee2e2',
                        color: course.isActive ? '#065f46' : '#991b1b'
                      }}>
                        {course.isActive ? '✅ نشط' : '❌ غير نشط'}
                      </span>
                      <span style={styles.gradeBadge}>
                        {course.grade === '1-prep' ? 'أولى إعدادي' : 
                         course.grade === '2-prep' ? 'ثانية إعدادي' : 'ثالثة إعدادي'}
                      </span>
                    </div>
                  </div>
                  <div style={styles.coursePrice}>
                    {course.price || 0} ج.م
                  </div>
                </div>
                
                {course.description && (
                  <p style={styles.courseCardDesc}>{course.description}</p>
                )}
                
                <div style={styles.courseCardInfo}>
                  <span>📅 {new Date(course.createdAt).toLocaleDateString('ar-EG')}</span>
                  <span>👥 {course.studentsEnrolled || 0} طالب</span>
                </div>
                
                <div style={styles.courseCardActions}>
                  <button 
                    onClick={() => handleEditCourse(course)}
                    style={styles.editButton}
                  >
                    ✏️ تعديل
                  </button>
                  <button 
                    onClick={() => toggleCourseStatus(course.id, course.title, course.isActive)}
                    style={course.isActive ? styles.deactivateButton : styles.activateButton}
                  >
                    {course.isActive ? '⏸️ إيقاف' : '▶️ تفعيل'}
                  </button>
                  <Link href={`/admin/course/${course.id}/lessons`} style={styles.lessonsButton}>
                    📝 الدروس
                  </Link>
                  <button 
                    onClick={() => deleteCourse(course.id, course.title)}
                    style={styles.deleteButton}
                  >
                    🗑️ حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function OpenCourseTab() {
  return (
    <div style={styles.tabContent}>
      <h2 style={styles.tabTitle}>🎓 فتح كورس للطلاب</h2>
      
      <div style={styles.redirectCard}>
        <div style={styles.redirectIcon}>🚀</div>
        <div>
          <h3 style={styles.redirectTitle}>صفحة فتح الكورس</h3>
          <p style={styles.redirectText}>
            هذه الصفحة تحتوي على أدوات متقدمة لفتح الكورسات للطلاب بشكل فردي أو جماعي.
          </p>
          <Link href="/admin/open-course" style={styles.redirectButton}>
            الذهاب لصفحة فتح الكورس المتقدمة →
          </Link>
        </div>
      </div>
      
      <div style={styles.quickActions}>
        <h3 style={styles.quickTitle}>إجراءات سريعة:</h3>
        <div style={styles.quickGrid}>
          <div style={styles.quickCard}>
            <div style={styles.quickIcon}>👨‍🎓</div>
            <h4>فتح كورس لطالب</h4>
            <p>اختر طالباً وكورساً لفتحه</p>
          </div>
          
          <div style={styles.quickCard}>
            <div style={styles.quickIcon}>📦</div>
            <h4>فتح جماعي</h4>
            <p>فتح كورس لكل الطلاب</p>
          </div>
          
          <div style={styles.quickCard}>
            <div style={styles.quickIcon}>📊</div>
            <h4>تقارير الفتح</h4>
            <p>عرض الكورسات المفتوحة</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function VideosTab() {
  return (
    <div style={styles.tabContent}>
      <h2 style={styles.tabTitle}>🎬 إدارة الفيديوهات</h2>
      <p>هنا يمكنك إضافة الدروس والفيديوهات للكورسات</p>
      
      <div style={styles.videosSection}>
        <div style={styles.videoCard}>
          <h3>📹 إدارة الفيديوهات الكاملة</h3>
          <p>لإضافة وتعديل وحذف الدروس والفيديوهات بشكل متقدم</p>
          <Link href="/admin/videos" style={styles.linkButton}>
            الذهاب لصفحة الفيديوهات الكاملة →
          </Link>
        </div>
        
        <div style={styles.videoCard}>
          <h3>🎥 إضافة فيديو سريع</h3>
          <p>إضافة فيديو جديد لأي كورس</p>
          <button style={styles.quickAddButton}>
            ➕ إضافة فيديو جديد
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsTab() {
  const [settings, setSettings] = useState({
    platformName: 'علمني العلوم مستر بيشوي',
    adminName: 'الدعم الفني',
    supportPhone: '0123456789',
    whatsappLink: 'https://wa.me/20123456789'
  })

  return (
    <div style={styles.tabContent}>
      <h2 style={styles.tabTitle}>⚙️ إعدادات المنصة</h2>
      
      <div style={styles.settingsForm}>
        <div style={styles.settingItem}>
          <label style={styles.settingLabel}>اسم المنصة</label>
          <input
            type="text"
            value={settings.platformName}
            onChange={(e) => setSettings({...settings, platformName: e.target.value})}
            style={styles.settingInput}
          />
        </div>
        
        <div style={styles.settingItem}>
          <label style={styles.settingLabel}>اسم الأدمن</label>
          <input
            type="text"
            value={settings.adminName}
            onChange={(e) => setSettings({...settings, adminName: e.target.value})}
            style={styles.settingInput}
          />
        </div>
        
        <div style={styles.settingItem}>
          <label style={styles.settingLabel}>رقم الدعم</label>
          <input
            type="tel"
            value={settings.supportPhone}
            onChange={(e) => setSettings({...settings, supportPhone: e.target.value})}
            style={styles.settingInput}
          />
        </div>
        
        <div style={styles.settingItem}>
          <label style={styles.settingLabel}>رابط واتساب</label>
          <input
            type="url"
            value={settings.whatsappLink}
            onChange={(e) => setSettings({...settings, whatsappLink: e.target.value})}
            style={styles.settingInput}
          />
        </div>
        
        <button style={styles.saveButton}>
          💾 حفظ الإعدادات
        </button>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#f8fafc',
    fontFamily: 'Arial, sans-serif',
    direction: 'rtl' as const
  },
  header: {
    background: 'linear-gradient(to right, #1e3a8a, #3b82f6)',
    color: 'white',
    padding: '25px',
    textAlign: 'center' as const,
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '32px',
    marginBottom: '10px',
    fontWeight: 'bold' as const
  },
  subtitle: {
    fontSize: '18px',
    opacity: 0.9
  },
  tabsContainer: {
    background: 'white',
    padding: '15px 25px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
    borderBottom: '1px solid #e5e7eb'
  },
  tabs: {
    display: 'flex',
    gap: '10px',
    overflowX: 'auto' as const
  },
  tabButton: {
    padding: '12px 20px',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    whiteSpace: 'nowrap' as const,
    transition: 'all 0.3s',
    minWidth: '120px',
    justifyContent: 'center'
  },
  tabIcon: {
    fontSize: '18px'
  },
  adminActions: {
    display: 'flex',
    gap: '15px',
    alignItems: 'center'
  },
  backButton: {
    padding: '10px 20px',
    background: '#e5e7eb',
    color: '#4b5563',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '14px'
  },
  specialButton: {
    padding: '10px 20px',
    background: '#10b981',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '14px'
  },
  content: {
    maxWidth: '1400px',
    margin: '30px auto',
    padding: '0 25px'
  },
  tabContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  tabHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },
  tabTitle: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: '20px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '20px',
    marginBottom: '30px'
  },
  statCard: {
    background: '#f0f9ff',
    borderRadius: '10px',
    padding: '20px',
    textAlign: 'center' as const,
    border: '2px solid #bae6fd'
  },
  statNumber: {
    fontSize: '32px',
    fontWeight: 'bold' as const,
    color: '#0369a1',
    marginBottom: '10px'
  },
  statLabel: {
    color: '#0c4a6e',
    fontSize: '14px'
  },
  refreshButton: {
    padding: '8px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600' as const
  },
  message: {
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '25px',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    fontSize: '16px'
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#374151',
    marginBottom: '20px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e5e7eb'
  },
  loadingText: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6b7280'
  },
  emptyText: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#9ca3af',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  tableContainer: {
    overflowX: 'auto' as const
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    background: 'white',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  th: {
    background: '#f3f4f6',
    padding: '15px',
    textAlign: 'right' as const,
    borderBottom: '2px solid #e5e7eb',
    color: '#374151',
    fontWeight: '600' as const
  },
  tr: {
    borderBottom: '1px solid #e5e7eb'
  },
  td: {
    padding: '15px',
    textAlign: 'right' as const,
    color: '#4b5563'
  },
  actions: {
    display: 'flex',
    gap: '10px'
  },
  activateBtn: {
    padding: '8px 16px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600' as const
  },
  rejectBtn: {
    padding: '8px 16px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600' as const
  },
  formSection: {
    background: '#f9fafb',
    borderRadius: '10px',
    padding: '25px',
    marginBottom: '30px',
    border: '1px solid #e5e7eb'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    alignItems: 'center'
  },
  input: {
    padding: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    background: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6'
    }
  },
  textarea: {
    padding: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    background: 'white',
    resize: 'vertical' as const,
    minHeight: '100px',
    gridColumn: 'span 2',
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6'
    }
  },
  checkboxGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  checkbox: {
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  checkboxLabel: {
    fontSize: '16px',
    color: '#374151',
    cursor: 'pointer'
  },
  addButton: {
    padding: '14px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'background 0.3s',
    gridColumn: 'span 2',
    '&:hover:not(:disabled)': {
      background: '#059669'
    },
    '&:disabled': {
      background: '#9ca3af',
      cursor: 'not-allowed'
    }
  },
  updateButton: {
    padding: '14px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    '&:hover': {
      background: '#2563eb'
    }
  },
  cancelButton: {
    padding: '14px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    '&:hover': {
      background: '#dc2626'
    }
  },
  listSection: {
    marginTop: '30px'
  },
  coursesGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '25px'
  },
  courseCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '25px',
    transition: 'all 0.3s',
    '&:hover': {
      boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
      borderColor: '#3b82f6'
    }
  },
  courseHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '15px'
  },
  courseCardTitle: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    margin: '0 0 10px 0'
  },
  courseBadges: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const
  },
  statusBadge: {
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600' as const
  },
  gradeBadge: {
    background: '#f3f4f6',
    color: '#4b5563',
    padding: '4px 12px',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: '600' as const
  },
  coursePrice: {
    background: '#f0f9ff',
    color: '#0369a1',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '18px',
    fontWeight: 'bold' as const
  },
  courseCardDesc: {
    color: '#6b7280',
    fontSize: '15px',
    marginBottom: '20px',
    lineHeight: '1.5'
  },
  courseCardInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    fontSize: '14px',
    color: '#4b5563'
  },
  courseCardActions: {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap' as const
  },
  editButton: {
    padding: '8px 16px',
    background: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      background: '#e5e7eb'
    }
  },
  activateButton: {
    padding: '8px 16px',
    background: '#d1fae5',
    color: '#065f46',
    border: '1px solid #a7f3d0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      background: '#a7f3d0'
    }
  },
  deactivateButton: {
    padding: '8px 16px',
    background: '#fee2e2',
    color: '#991b1b',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      background: '#fecaca'
    }
  },
  lessonsButton: {
    padding: '8px 16px',
    background: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    textDecoration: 'none',
    textAlign: 'center' as const,
    '&:hover': {
      background: '#2563eb'
    }
  },
  deleteButton: {
    padding: '8px 16px',
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      background: '#fecaca'
    }
  },
  redirectCard: {
    background: 'linear-gradient(to right, #f0f9ff, #dbeafe)',
    borderRadius: '12px',
    padding: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '25px',
    marginBottom: '30px'
  },
  redirectIcon: {
    fontSize: '48px'
  },
  redirectTitle: {
    fontSize: '24px',
    fontWeight: 'bold' as const,
    color: '#1e40af',
    marginBottom: '10px'
  },
  redirectText: {
    fontSize: '16px',
    color: '#374151',
    marginBottom: '20px'
  },
  redirectButton: {
    padding: '12px 24px',
    background: '#1e40af',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold' as const,
    fontSize: '16px',
    display: 'inline-block'
  },
  quickActions: {
    marginTop: '40px'
  },
  quickTitle: {
    fontSize: '20px',
    fontWeight: '600' as const,
    color: '#1f2937',
    marginBottom: '20px'
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '20px'
  },
  quickCard: {
    background: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    padding: '25px',
    textAlign: 'center' as const,
    transition: 'all 0.3s',
    '&:hover': {
      borderColor: '#3b82f6',
      transform: 'translateY(-5px)'
    }
  },
  quickIcon: {
    fontSize: '40px',
    marginBottom: '15px'
  },
  videosSection: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '25px',
    marginTop: '30px'
  },
  videoCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center' as const
  },
  linkButton: {
    display: 'inline-block',
    padding: '12px 24px',
    background: '#3b82f6',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    marginTop: '20px'
  },
  quickAddButton: {
    padding: '12px 24px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600' as const,
    marginTop: '20px'
  },
  settingsForm: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '25px',
    maxWidth: '600px'
  },
  settingItem: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px'
  },
  settingLabel: {
    fontWeight: '600' as const,
    color: '#374151',
    fontSize: '16px'
  },
  settingInput: {
    padding: '14px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    background: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6'
    }
  },
  saveButton: {
    padding: '16px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    marginTop: '20px',
    '&:hover': {
      background: '#059669'
    }
  }
}