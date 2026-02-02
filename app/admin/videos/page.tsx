'use client'
import { useState, useEffect } from 'react'
import { db } from '@/lib/firebase'
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore'
import Link from 'next/link'

export default function VideosAdminPage() {
  const [courses, setCourses] = useState<any[]>([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')
  
  const [newLesson, setNewLesson] = useState({
    title: '',
    description: '',
    videoUrl: '',
    order: 0,
    assignmentLink: '',
    examLink: ''
  })

  // ⭐⭐ كود التعديل الجديد ⭐⭐
  const [editingLesson, setEditingLesson] = useState<any>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    videoUrl: '',
    order: 0,
    assignmentLink: '',
    examLink: ''
  })

  // جلب الكورسات
  const fetchCourses = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "courses"))
      const coursesList: any[] = []
      
      querySnapshot.forEach((doc) => {
        coursesList.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      setCourses(coursesList)
      if (coursesList.length > 0 && !selectedCourse) {
        setSelectedCourse(coursesList[0].id)
      }
    } catch (error) {
      console.error('Error fetching courses:', error)
      setMessage('❌ حدث خطأ في جلب الكورسات')
    }
  }

  // جلب دروس الكورس المحدد
  const fetchLessons = async (courseId: string) => {
    if (!courseId) return
    
    try {
      setLoading(true)
      const lessonsRef = collection(db, "courses", courseId, "lessons")
      const querySnapshot = await getDocs(lessonsRef)
      const lessonsList: any[] = []
      
      querySnapshot.forEach((doc) => {
        lessonsList.push({
          id: doc.id,
          ...doc.data()
        })
      })
      
      // ترتيب الدروس حسب الرقم
      lessonsList.sort((a, b) => a.order - b.order)
      setLessons(lessonsList)
      setMessage(`✅ تم تحميل ${lessonsList.length} درس`)
    } catch (error) {
      console.error('Error fetching lessons:', error)
      setMessage('❌ حدث خطأ في جلب الدروس')
    } finally {
      setLoading(false)
    }
  }

  // إضافة درس جديد
  const handleAddLesson = async () => {
    if (!selectedCourse || !newLesson.title || !newLesson.videoUrl) {
      setMessage('❌ العنوان ورابط الفيديو مطلوبان')
      return
    }

    try {
      const lessonsRef = collection(db, "courses", selectedCourse, "lessons")
      
      await addDoc(lessonsRef, {
        ...newLesson,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      
      setMessage('✅ تم إضافة الدرس بنجاح')
      setNewLesson({
        title: '',
        description: '',
        videoUrl: '',
        order: lessons.length + 1,
        assignmentLink: '',
        examLink: ''
      })
      
      fetchLessons(selectedCourse)
    } catch (error) {
      console.error('Error adding lesson:', error)
      setMessage('❌ حدث خطأ في إضافة الدرس')
    }
  }

  // ⭐⭐ دالة فتح نموذج التعديل ⭐⭐
  const handleEditClick = (lesson: any) => {
    setEditingLesson(lesson)
    setEditForm({
      title: lesson.title || '',
      description: lesson.description || '',
      videoUrl: lesson.videoUrl || '',
      order: lesson.order || 0,
      assignmentLink: lesson.assignmentLink || '',
      examLink: lesson.examLink || ''
    })
  }

  // ⭐⭐ دالة حفظ التعديلات ⭐⭐
  const handleSaveEdit = async () => {
    if (!selectedCourse || !editingLesson) return
    
    try {
      const lessonRef = doc(db, "courses", selectedCourse, "lessons", editingLesson.id)
      
      await updateDoc(lessonRef, {
        ...editForm,
        updatedAt: new Date().toISOString()
      })
      
      setMessage('✅ تم تحديث الدرس بنجاح')
      setEditingLesson(null)
      fetchLessons(selectedCourse)
    } catch (error) {
      console.error('Error updating lesson:', error)
      setMessage('❌ حدث خطأ في تحديث الدرس')
    }
  }

  // حذف درس
  const handleDeleteLesson = async (lessonId: string, lessonTitle: string) => {
    if (!confirm(`هل تريد حذف الدرس "${lessonTitle}"؟`)) return
    
    try {
      const lessonRef = doc(db, "courses", selectedCourse, "lessons", lessonId)
      await deleteDoc(lessonRef)
      
      setMessage(`✅ تم حذف الدرس "${lessonTitle}"`)
      fetchLessons(selectedCourse)
    } catch (error) {
      console.error('Error deleting lesson:', error)
      setMessage('❌ حدث خطأ في حذف الدرس')
    }
  }

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    if (selectedCourse) {
      fetchLessons(selectedCourse)
    }
  }, [selectedCourse])

  const selectedCourseData = courses.find(c => c.id === selectedCourse)

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>🎬 إدارة الفيديوهات والدروس</h1>
          <p style={styles.subtitle}>علمني العلوم مستر بيشوي - إدارة: توماس مهني</p>
        </div>
      </header>

      <div style={styles.main}>
        {message && (
          <div style={{
            ...styles.message,
            background: message.startsWith('✅') ? '#d4fae5' : '#fee2e2',
            color: message.startsWith('✅') ? '#065f46' : '#991b1b'
          }}>
            {message}
          </div>
        )}

        <div style={styles.navigation}>
          <Link href="/admin" style={styles.navLink}>
            ← العودة للطلاب
          </Link>
          <span style={styles.navSeparator}>|</span>
          <Link href="/after-login" style={styles.navLink}>
            ← الصفحة الرئيسية
          </Link>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>📚 اختيار الكورس</h2>
          <div style={styles.courseSelector}>
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              style={styles.select}
            >
              <option value="">اختر كورس</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.title} - {course.grade}
                </option>
              ))}
            </select>
            
            {selectedCourseData && (
              <div style={styles.courseInfo}>
                <h3 style={styles.courseName}>{selectedCourseData.title}</h3>
                <p style={styles.courseDetails}>
                  الصف: {selectedCourseData.grade} | 
                  السعر: {selectedCourseData.price} جنيه
                </p>
              </div>
            )}
          </div>
        </div>

        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>➕ إضافة درس جديد</h2>
          <div style={styles.form}>
            <div style={styles.formRow}>
              <input
                type="text"
                placeholder="عنوان الدرس *"
                value={newLesson.title}
                onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                style={styles.input}
              />
              <input
                type="number"
                placeholder="ترتيب الدرس"
                value={newLesson.order}
                onChange={(e) => setNewLesson({...newLesson, order: parseInt(e.target.value)})}
                style={styles.input}
              />
            </div>
            
            <div style={styles.formRow}>
              <input
                type="text"
                placeholder="رابط الفيديو (YouTube أو Vimeo) *"
                value={newLesson.videoUrl}
                onChange={(e) => setNewLesson({...newLesson, videoUrl: e.target.value})}
                style={styles.input}
              />
            </div>
            
            <div style={styles.formRow}>
              <textarea
                placeholder="وصف الدرس"
                value={newLesson.description}
                onChange={(e) => setNewLesson({...newLesson, description: e.target.value})}
                style={styles.textarea}
                rows={3}
              />
            </div>
            
            <div style={styles.formRow}>
              <input
                type="text"
                placeholder="رابط الواجب (اختياري)"
                value={newLesson.assignmentLink}
                onChange={(e) => setNewLesson({...newLesson, assignmentLink: e.target.value})}
                style={styles.input}
              />
              <input
                type="text"
                placeholder="رابط الامتحان (اختياري)"
                value={newLesson.examLink}
                onChange={(e) => setNewLesson({...newLesson, examLink: e.target.value})}
                style={styles.input}
              />
            </div>
            
            <button 
              onClick={handleAddLesson}
              style={styles.addButton}
              disabled={!selectedCourse || !newLesson.title || !newLesson.videoUrl}
            >
              ✅ إضافة الدرس
            </button>
          </div>
        </div>

        {/* ⭐⭐ نموذج التعديل ⭐⭐ */}
        {editingLesson && (
          <div style={styles.editModal}>
            <div style={styles.editModalContent}>
              <h3 style={styles.editModalTitle}>✏️ تعديل الدرس: {editingLesson.title}</h3>
              
              <div style={styles.formRow}>
                <input
                  type="text"
                  placeholder="عنوان الدرس"
                  value={editForm.title}
                  onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                  style={styles.input}
                />
                <input
                  type="number"
                  placeholder="ترتيب الدرس"
                  value={editForm.order}
                  onChange={(e) => setEditForm({...editForm, order: parseInt(e.target.value)})}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formRow}>
                <input
                  type="text"
                  placeholder="رابط الفيديو"
                  value={editForm.videoUrl}
                  onChange={(e) => setEditForm({...editForm, videoUrl: e.target.value})}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.formRow}>
                <textarea
                  placeholder="وصف الدرس"
                  value={editForm.description}
                  onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                  style={styles.textarea}
                  rows={3}
                />
              </div>
              
              <div style={styles.formRow}>
                <input
                  type="text"
                  placeholder="رابط الواجب"
                  value={editForm.assignmentLink}
                  onChange={(e) => setEditForm({...editForm, assignmentLink: e.target.value})}
                  style={styles.input}
                />
                <input
                  type="text"
                  placeholder="رابط الامتحان"
                  value={editForm.examLink}
                  onChange={(e) => setEditForm({...editForm, examLink: e.target.value})}
                  style={styles.input}
                />
              </div>
              
              <div style={styles.editModalButtons}>
                <button onClick={handleSaveEdit} style={styles.saveButton}>
                  💾 حفظ التعديلات
                </button>
                <button onClick={() => setEditingLesson(null)} style={styles.cancelButton}>
                  ❌ إلغاء
                </button>
              </div>
            </div>
          </div>
        )}

        <div style={styles.section}>
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              📖 الدروس ({lessons.length})
              {selectedCourseData && ` - ${selectedCourseData.title}`}
            </h2>
            <button 
              onClick={() => selectedCourse && fetchLessons(selectedCourse)}
              style={styles.refreshButton}
            >
              🔄 تحديث
            </button>
          </div>

          {loading ? (
            <div style={styles.loading}>
              ⏳ جاري تحميل الدروس...
            </div>
          ) : lessons.length === 0 ? (
            <div style={styles.empty}>
              📭 لا توجد دروس في هذا الكورس بعد
            </div>
          ) : (
            <div style={styles.lessonsGrid}>
              {lessons.map(lesson => (
                <div key={lesson.id} style={styles.lessonCard}>
                  <div style={styles.lessonHeader}>
                    <div style={styles.lessonNumber}>الدرس {lesson.order}</div>
                    <button
                      onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                      style={styles.deleteButton}
                    >
                      🗑️ حذف
                    </button>
                  </div>
                  
                  <h3 style={styles.lessonTitle}>{lesson.title}</h3>
                  
                  {lesson.description && (
                    <p style={styles.lessonDescription}>{lesson.description}</p>
                  )}
                  
                  <div style={styles.lessonLinks}>
                    <div style={styles.linkItem}>
                      <span style={styles.linkLabel}>🎬 الفيديو:</span>
                      <a 
                        href={lesson.videoUrl} 
                        target="_blank" 
                        style={styles.linkUrl}
                      >
                        {lesson.videoUrl.substring(0, 30)}...
                      </a>
                    </div>
                    
                    {lesson.assignmentLink && (
                      <div style={styles.linkItem}>
                        <span style={styles.linkLabel}>📝 الواجب:</span>
                        <a 
                          href={lesson.assignmentLink} 
                          target="_blank" 
                          style={styles.linkUrl}
                        >
                          رابط الواجب
                        </a>
                      </div>
                    )}
                    
                    {lesson.examLink && (
                      <div style={styles.linkItem}>
                        <span style={styles.linkLabel}>📊 الامتحان:</span>
                        <a 
                          href={lesson.examLink} 
                          target="_blank" 
                          style={styles.linkUrl}
                        >
                          رابط الامتحان
                        </a>
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.lessonFooter}>
                    <span style={styles.lessonDate}>
                      أضيف في: {new Date(lesson.createdAt).toLocaleDateString('ar-EG')}
                    </span>
                    {/* ⭐⭐ زر التعديل المعدل ⭐⭐ */}
                    <button 
                      style={styles.editButton}
                      onClick={() => handleEditClick(lesson)}
                    >
                      ✏️ تعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={styles.instructions}>
          <h3 style={styles.instructionsTitle}>📋 تعليمات إضافة الفيديوهات:</h3>
          <ol style={styles.instructionsList}>
            <li>اختر الكورس من القائمة المنسدلة</li>
            <li>أدخل عنوان الدرس ورقم الترتيب</li>
            <li>أدخل رابط الفيديو (يجب أن يكون من YouTube أو Vimeo)</li>
            <li>يمكنك إضافة روابط للواجبات والامتحانات (اختياري)</li>
            <li>اضغط "إضافة الدرس" لحفظه في قاعدة البيانات</li>
            <li>لتعديل درس: اضغط زر "✏️ تعديل" بجانب الدرس</li>
          </ol>
        </div>
      </div>

      <footer style={styles.footer}>
        <p>© 2024 علمني العلوم مستر بيشوي - نظام إدارة المحتوى</p>
        <p>للدعم الفني: 0123456789 (توماس مهني)</p>
      </footer>
    </div>
  )
}

// الأنماط
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
    padding: '30px 20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    textAlign: 'center' as const
  },
  title: {
    fontSize: '32px',
    marginBottom: '10px',
    fontWeight: 'bold' as const
  },
  subtitle: {
    fontSize: '16px',
    opacity: 0.9
  },
  main: {
    maxWidth: '1200px',
    margin: '30px auto',
    padding: '0 20px'
  },
  message: {
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '25px',
    textAlign: 'center' as const,
    fontWeight: 'bold' as const,
    fontSize: '16px'
  },
  navigation: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '20px',
    marginBottom: '30px',
    padding: '15px',
    background: 'white',
    borderRadius: '10px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
  },
  navLink: {
    color: '#3b82f6',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '15px'
  },
  navSeparator: {
    color: '#9ca3af'
  },
  section: {
    background: 'white',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '30px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: '20px',
    borderBottom: '2px solid #e5e7eb',
    paddingBottom: '10px'
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  courseSelector: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  select: {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    background: 'white'
  },
  courseInfo: {
    background: '#f0f9ff',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #bae6fd'
  },
  courseName: {
    margin: '0 0 10px 0',
    color: '#0369a1',
    fontSize: '20px'
  },
  courseDetails: {
    margin: 0,
    color: '#0c4a6e',
    fontSize: '14px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '20px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '15px'
  },
  input: {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    background: '#f9fafb'
  },
  textarea: {
    padding: '12px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '16px',
    background: '#f9fafb',
    resize: 'vertical' as const,
    minHeight: '80px',
    gridColumn: 'span 2'
  },
  addButton: {
    padding: '15px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '18px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    transition: 'background 0.3s',
    '&:disabled': {
      background: '#9ca3af',
      cursor: 'not-allowed'
    },
    '&:hover:not(:disabled)': {
      background: '#059669'
    }
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
  loading: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#6b7280',
    fontSize: '18px'
  },
  empty: {
    textAlign: 'center' as const,
    padding: '40px',
    color: '#9ca3af',
    fontSize: '16px',
    background: '#f9fafb',
    borderRadius: '8px'
  },
  lessonsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
    gap: '25px'
  },
  lessonCard: {
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    padding: '20px',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 10px 20px rgba(0,0,0,0.1)'
    }
  },
  lessonHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px'
  },
  lessonNumber: {
    background: '#3b82f6',
    color: 'white',
    padding: '5px 15px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: 'bold' as const
  },
  deleteButton: {
    background: '#fee2e2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px'
  },
  lessonTitle: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: '10px'
  },
  lessonDescription: {
    color: '#6b7280',
    fontSize: '15px',
    lineHeight: 1.6,
    marginBottom: '20px'
  },
  lessonLinks: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '10px',
    marginBottom: '20px'
  },
  linkItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  linkLabel: {
    color: '#4b5563',
    fontWeight: '600' as const,
    minWidth: '80px'
  },
  linkUrl: {
    color: '#2563eb',
    textDecoration: 'none',
    fontSize: '14px',
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  lessonFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #e5e7eb',
    paddingTop: '15px'
  },
  lessonDate: {
    color: '#9ca3af',
    fontSize: '13px'
  },
  editButton: {
    background: '#f3f4f6',
    color: '#4b5563',
    border: '1px solid #d1d5db',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    '&:hover': {
      background: '#e5e7eb'
    }
  },
  // ⭐⭐ أنماط نموذج التعديل ⭐⭐
  editModal: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  editModalContent: {
    background: 'white',
    borderRadius: '12px',
    padding: '30px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflowY: 'auto' as const
  },
  editModalTitle: {
    fontSize: '22px',
    fontWeight: 'bold' as const,
    color: '#1f2937',
    marginBottom: '25px',
    textAlign: 'center' as const
  },
  editModalButtons: {
    display: 'flex',
    gap: '15px',
    marginTop: '25px'
  },
  saveButton: {
    flex: 1,
    padding: '15px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer'
  },
  cancelButton: {
    flex: 1,
    padding: '15px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: 'bold' as const,
    cursor: 'pointer'
  },
  instructions: {
    background: '#f0f9ff',
    border: '1px solid #bae6fd',
    borderRadius: '12px',
    padding: '25px',
    marginBottom: '30px'
  },
  instructionsTitle: {
    fontSize: '20px',
    fontWeight: 'bold' as const,
    color: '#0369a1',
    marginBottom: '15px'
  },
  instructionsList: {
    margin: 0,
    paddingRight: '20px',
    color: '#0c4a6e',
    fontSize: '15px',
    lineHeight: 2
  },
  footer: {
    background: '#1f2937',
    color: 'white',
    textAlign: 'center' as const,
    padding: '25px',
    marginTop: '50px'
  }
}