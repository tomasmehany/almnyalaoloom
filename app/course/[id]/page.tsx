'use client'
import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import Link from 'next/link'

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)
  const [activeLesson, setActiveLesson] = useState<number | null>(null)
  const [user, setUser] = useState<any>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [player, setPlayer] = useState<any>(null)
  const [isPlayerReady, setIsPlayerReady] = useState(false)
  
  const videoContainerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  // 🔗 روابط الدعم الفني
  const SUPPORT_LINKS = {
    whatsapp: "https://wa.me/message/UKASWZCU5BNLN1",
    telegram: "https://t.me/AskMrBishoy_bot"
  }

  // 🎬 دالة لتحويل رابط YouTube مع حماية كاملة
  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return '';
    
    try {
      url = url.trim();
      
      let videoId = '';
      
      if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      } 
      else if (url.includes('youtube.com/watch') && url.includes('v=')) {
        const urlObj = new URL(url);
        videoId = urlObj.searchParams.get('v') || '';
      }
      else if (url.includes('youtube.com/embed/')) {
        videoId = url.split('embed/')[1]?.split('?')[0] || '';
      }
      
      if (videoId) {
        // 🔒 إعدادات حماية كاملة
        return `https://www.youtube-nocookie.com/embed/${videoId}?` + new URLSearchParams({
          rel: '0',
          modestbranding: '1',      // ⬅️ إخفاء شعار YouTube
          controls: '0',            // ⬅️ إخفاء كل controls (زر النسخ هيختفي)
          disablekb: '1',
          fs: '0',
          showinfo: '0',
          iv_load_policy: '3',
          playsinline: '1',
          enablejsapi: '1',
          origin: window.location.origin,
          autoplay: '0',
          mute: '0'
        }).toString();
      }
      
      return url;
    } catch (error) {
      console.error('خطأ في تحويل رابط اليوتيوب:', error);
      return url;
    }
  };

  // التحقق من صحة رابط الفيديو
  const isValidVideoUrl = (url: string) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  // تنسيق الوقت
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // استخراج videoId من الرابط
  const extractVideoId = (url: string) => {
    try {
      if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1]?.split('?')[0];
      } 
      else if (url.includes('youtube.com/watch') && url.includes('v=')) {
        const urlObj = new URL(url);
        return urlObj.searchParams.get('v');
      }
      return null;
    } catch {
      return null;
    }
  };

  // ⏯️ دالة التشغيل/الإيقاف
  const togglePlayPause = () => {
    if (!player) return;
    
    try {
      if (isPlaying) {
        player.pauseVideo();
      } else {
        player.playVideo();
      }
      setIsPlaying(!isPlaying);
    } catch (error) {
      console.error('❌ خطأ في التشغيل/الإيقاف:', error);
    }
  };

  // 🔇 التحكم في الصوت
  const toggleMute = () => {
    if (!player) return;
    
    try {
      if (isMuted) {
        player.unMute();
      } else {
        player.mute();
      }
      setIsMuted(!isMuted);
    } catch (error) {
      console.error('❌ خطأ في التحكم بالصوت:', error);
    }
  };

  // 🚀 تغيير سرعة التشغيل
  const changePlaybackRate = (speed: number) => {
    if (!player) return;
    
    try {
      player.setPlaybackRate(speed);
      setPlaybackRate(speed);
    } catch (error) {
      console.error('❌ خطأ في تغيير السرعة:', error);
    }
  };

  // ⏩ تقدم 10 ثواني
  const seekForward = () => {
    if (!player) return;
    
    try {
      const newTime = Math.min(currentTime + 10, duration);
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (error) {
      console.error('❌ خطأ في التقدم:', error);
    }
  };

  // ⏪ تأخر 10 ثواني
  const seekBackward = () => {
    if (!player) return;
    
    try {
      const newTime = Math.max(currentTime - 10, 0);
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (error) {
      console.error('❌ خطأ في التأخر:', error);
    }
  };

  // 📍 الانتقال لوقت محدد
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!player) return;
    
    try {
      const newTime = parseFloat(e.target.value);
      player.seekTo(newTime, true);
      setCurrentTime(newTime);
    } catch (error) {
      console.error('❌ خطأ في الانتقال:', error);
    }
  };

  // 🖥️ تكبير الشاشة
  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return;
    
    if (!document.fullscreenElement) {
      videoContainerRef.current.requestFullscreen()
        .then(() => {})
        .catch(err => console.log('خطأ في التكبير:', err));
    } else {
      document.exitFullscreen()
        .catch(err => console.log('خطأ في التصغير:', err));
    }
  };

  // ⏳ إخفاء شريط التحكم بعد 3 ثواني
  const resetControlsTimeout = () => {
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    
    setShowControls(true);
    
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  // تحميل YouTube API
  useEffect(() => {
    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        setIsPlayerReady(true);
        return;
      }
      
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      
      window.onYouTubeIframeAPIReady = () => {
        console.log('✅ YouTube API جاهزة');
        setIsPlayerReady(true);
      };
    };
    
    loadYouTubeAPI();
  }, []);

  // تهيئة الـ Player عندما يكون الدرس متاحًا
  useEffect(() => {
    if (!isPlayerReady || activeLesson === null || !lessons[activeLesson]?.videoUrl) return;
    
    const videoId = extractVideoId(lessons[activeLesson].videoUrl);
    if (!videoId || !playerContainerRef.current) return;
    
    // تنظيف الـ player القديم
    if (player && player.destroy) {
      player.destroy();
    }
    
    // إنشاء player جديد
    const newPlayer = new window.YT.Player(playerContainerRef.current, {
      videoId: videoId,
      playerVars: {
        'autoplay': 0,
        'controls': 0,
        'disablekb': 1,
        'fs': 0,
        'modestbranding': 1,
        'rel': 0,
        'showinfo': 0,
        'iv_load_policy': 3,
        'playsinline': 1,
        'origin': window.location.origin
      },
      events: {
        'onReady': (event: any) => {
          console.log('✅ Player جاهز');
          setPlayer(event.target);
          const total = event.target.getDuration();
          setDuration(total);
          
          // بدء تحديث الوقت
          startTimeUpdates(event.target);
        },
        'onStateChange': (event: any) => {
          setIsPlaying(event.data === 1);
        },
        'onPlaybackRateChange': (event: any) => {
          setPlaybackRate(event.target.getPlaybackRate());
        }
      }
    });
    
    setPlayer(newPlayer);
    
    return () => {
      if (newPlayer && newPlayer.destroy) {
        newPlayer.destroy();
      }
    };
  }, [isPlayerReady, activeLesson, lessons]);

  // تحديث الوقت باستمرار
  const startTimeUpdates = (playerInstance: any) => {
    const interval = setInterval(() => {
      if (playerInstance && playerInstance.getCurrentTime) {
        try {
          const time = playerInstance.getCurrentTime();
          setCurrentTime(time);
        } catch (error) {
          console.error('خطأ في تحديث الوقت:', error);
          clearInterval(interval);
        }
      }
    }, 500);
    
    return () => clearInterval(interval);
  };

  // تنظيف timeout
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

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

  // جلب الدروس
  const fetchLessons = async (courseId: string) => {
    try {
      console.log('🔍 جلب دروس الكورس:', courseId)
      
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
              يجب تفعيل الكورس أولاً عن طريق الدعم الفني
            </p>
            
            <div style={styles.contactSection}>
              <h3 style={styles.contactTitle}>💬 للتفعيل أو المساعدة:</h3>
              <div style={styles.contactButtons}>
                <a 
                  href={SUPPORT_LINKS.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.whatsappButton}
                >
                  <span style={styles.buttonIcon}>💬</span>
                  تواصل على واتساب
                </a>
                
                <a 
                  href={SUPPORT_LINKS.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.telegramButton}
                >
                  <span style={styles.buttonIcon}>📱</span>
                  تواصل على تليجرام
                </a>
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
            
            <div style={styles.contactSection}>
              <div style={styles.contactButtons}>
                <a 
                  href={SUPPORT_LINKS.whatsapp} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.whatsappButton}
                >
                  <span style={styles.buttonIcon}>💬</span>
                  واتساب الدعم
                </a>
                
                <a 
                  href={SUPPORT_LINKS.telegram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={styles.telegramButton}
                >
                  <span style={styles.buttonIcon}>📱</span>
                  تليجرام الدعم
                </a>
              </div>
            </div>
          </div>
        )}

        {lessons.length > 0 && (
          <div style={styles.content}>
            <div style={styles.videoSection}>
              <div style={styles.videoPlayer}>
                {activeLesson !== null && lessons[activeLesson]?.videoUrl && isValidVideoUrl(lessons[activeLesson].videoUrl) ? (
                  <div 
                    ref={videoContainerRef}
                    style={{
                      ...styles.videoContainer,
                      position: 'relative',
                      background: '#000'
                    }}
                    onMouseMove={resetControlsTimeout}
                    onMouseLeave={() => {
                      if (controlsTimeoutRef.current) {
                        clearTimeout(controlsTimeoutRef.current);
                      }
                      controlsTimeoutRef.current = setTimeout(() => {
                        setShowControls(false);
                      }, 1000);
                    }}
                  >
                    <div style={styles.videoWrapper}>
                      {/* YouTube Player Container */}
                      <div 
                        ref={playerContainerRef}
                        style={{
                          width: '100%',
                          height: '100%'
                        }}
                      />
                      
                      {/* 🔒 Overlay يغطي الفيديو بالكامل */}
                      <div
                        style={styles.protectionOverlay}
                        onClick={togglePlayPause}
                        onContextMenu={(e) => {
                          e.preventDefault();
                          alert('ممنوع النسخ');
                          return false;
                        }}
                      />
                      
                      {/* 🎛️ Custom Controls */}
                      {showControls && (
                        <div style={styles.customControls}>
                          {/* شريط التقدم - أحمر زي YouTube */}
                          <div style={styles.progressBarContainer}>
                            <input
                              type="range"
                              min="0"
                              max={duration || 100}
                              value={currentTime}
                              onChange={handleSeek}
                              style={{
                                ...styles.progressBar,
                                '--progress': `${duration > 0 ? (currentTime / duration) * 100 : 0}%`
                              } as React.CSSProperties}
                            />
                            <div style={styles.timeDisplay}>
                              <span style={styles.timeText}>{formatTime(currentTime)}</span>
                              <span style={styles.timeSeparator}>/</span>
                              <span style={styles.timeText}>{formatTime(duration)}</span>
                            </div>
                          </div>
                          
                          <div style={styles.controlsRow}>
                            <div style={styles.controlsLeft}>
                              {/* زر التشغيل/الإيقاف */}
                              <button 
                                style={styles.controlButton}
                                onClick={togglePlayPause}
                              >
                                {isPlaying ? '⏸️' : '▶️'}
                              </button>
                              
                              {/* زر التأخر 10 ثواني */}
                              <button 
                                style={styles.seekButton}
                                onClick={seekBackward}
                                title="رجوع 10 ثواني"
                              >
                                ⏪ 10s
                              </button>
                              
                              {/* التحكم في الصوت */}
                              <button 
                                style={styles.controlButton}
                                onClick={toggleMute}
                              >
                                {isMuted ? '🔇' : '🔊'}
                              </button>
                              
                              {/* زر التقدم 10 ثواني */}
                              <button 
                                style={styles.seekButton}
                                onClick={seekForward}
                                title="تقديم 10 ثواني"
                              >
                                10s ⏩
                              </button>
                              
                              {/* سرعة التشغيل */}
                              <div style={styles.speedControl}>
                                <span style={styles.speedLabel}>السرعة:</span>
                                <select 
                                  style={styles.speedSelect}
                                  value={playbackRate}
                                  onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
                                >
                                  <option value="0.5">0.5x</option>
                                  <option value="0.75">0.75x</option>
                                  <option value="1">1x</option>
                                  <option value="1.25">1.25x</option>
                                  <option value="1.5">1.5x</option>
                                  <option value="1.75">1.75x</option>
                                  <option value="2">2x</option>
                                </select>
                              </div>
                            </div>
                            
                            <div style={styles.controlsRight}>
                              {/* عرض السرعة الحالية */}
                              <div style={styles.currentSpeed}>
                                {playbackRate}x
                              </div>
                              
                              {/* زر تكبير الشاشة */}
                              <button 
                                style={styles.fullscreenButton}
                                onClick={toggleFullscreen}
                              >
                                ⛶
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div style={styles.videoPlaceholder}>
                    <div style={styles.placeholderIcon}>🎬</div>
                    <p style={styles.placeholderText}>
                      {activeLesson !== null && lessons[activeLesson]?.videoUrl 
                        ? 'رابط الفيديو غير صالح' 
                        : 'اختر درساً لعرضه'
                      }
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
                      <span style={styles.currentSpeedBadge}>
                        السرعة: {playbackRate}x
                      </span>
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
                      rel="noopener noreferrer"
                      style={styles.actionButton}
                    >
                      📝 الواجب
                    </a>
                  )}
                  
                  {lessons[activeLesson]?.examLink && (
                    <a 
                      href={lessons[activeLesson].examLink}
                      target="_blank"
                      rel="noopener noreferrer"
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

              {/* قسم تواصل مع الدعم */}
              <div style={styles.supportSection}>
                <h3 style={styles.supportTitle}>💬 لديك سؤال أو تحتاج مساعدة؟</h3>
                <p style={styles.supportText}>
                  تواصل مع الدعم عن طريق احد الطرق التالية
                </p>
                
                <div style={styles.supportButtons}>
                  <a 
                    href={SUPPORT_LINKS.whatsapp} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.whatsappSupportButton}
                  >
                    <span style={styles.supportIcon}>💬</span>
                    تواصل على واتساب
                  </a>
                  
                  <a 
                    href={SUPPORT_LINKS.telegram} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={styles.telegramSupportButton}
                  >
                    <span style={styles.supportIcon}>📱</span>
                    تواصل على تليجرام
                  </a>
                </div>
                
                <p style={styles.supportNote}>
                  في حال تواصلت مع الدعم سوف يتم الرد عليك في اقرب فرصة
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <p style={styles.footerText}>
            © {new Date().getFullYear()} علمني العلوم مستر بيشوي - منصة التعليم الإلكتروني
          </p>
          <div style={styles.footerLinks}>
            <a href={SUPPORT_LINKS.whatsapp} target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              💬 واتساب الدعم
            </a>
            <span style={styles.footerSeparator}>|</span>
            <a href={SUPPORT_LINKS.telegram} target="_blank" rel="noopener noreferrer" style={styles.footerLink}>
              📱 تليجرام الدعم
            </a>
          </div>
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
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
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
    padding: '0 20px',
    position: 'sticky' as const,
    top: 0,
    zIndex: 100
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
  contactSection: {
    background: '#f8fafc',
    padding: '25px',
    borderRadius: '10px',
    marginBottom: '30px'
  },
  contactTitle: {
    fontSize: '18px',
    color: '#1f2937',
    marginBottom: '15px',
    textAlign: 'center' as const
  },
  contactButtons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    maxWidth: '300px',
    margin: '0 auto'
  },
  whatsappButton: {
    padding: '15px',
    background: '#25D366',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    '&:hover': {
      background: '#128C7E',
      transform: 'translateY(-2px)'
    }
  },
  telegramButton: {
    padding: '15px',
    background: '#0088cc',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    '&:hover': {
      background: '#006699',
      transform: 'translateY(-2px)'
    }
  },
  buttonIcon: {
    fontSize: '20px'
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
    fontStyle: 'italic' as const,
    marginBottom: '30px'
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
  videoContainer: {
    width: '100%',
    height: '450px',
    overflow: 'hidden'
  },
  videoWrapper: {
    position: 'relative',
    width: '100%',
    height: '100%',
    overflow: 'hidden'
  },
  videoIframe: {
    border: 'none',
    pointerEvents: 'auto' as const
  },
  protectionOverlay: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    cursor: 'pointer',
    background: 'transparent',
    zIndex: 2
  },
  customControls: {
    position: 'absolute' as const,
    bottom: '0',
    left: '0',
    right: '0',
    background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
    padding: '20px',
    zIndex: 3
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: '15px'
  },
  progressBar: {
    width: '100%',
    height: '6px',
    WebkitAppearance: 'none' as const,
    appearance: 'none' as const,
    background: 'linear-gradient(to right, #ff0000 0%, #ff0000 var(--progress, 0%), rgba(255,255,255,0.2) var(--progress, 0%), rgba(255,255,255,0.2) 100%)',
    borderRadius: '3px',
    outline: 'none',
    cursor: 'pointer',
    direction: 'ltr' as const, // ⬅️ هذا هو التعديل الوحيد
    
    '&::-webkit-slider-thumb': {
      WebkitAppearance: 'none' as const,
      appearance: 'none' as const,
      height: '16px',
      width: '16px',
      borderRadius: '50%',
      background: '#ff0000',
      cursor: 'pointer',
      border: '3px solid white',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    },
    '&::-moz-range-thumb': {
      height: '16px',
      width: '16px',
      borderRadius: '50%',
      background: '#ff0000',
      cursor: 'pointer',
      border: '3px solid white',
      boxShadow: '0 0 10px rgba(0,0,0,0.5)'
    }
  },
  timeDisplay: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    color: 'white',
    fontSize: '13px',
    fontFamily: 'monospace',
    fontWeight: 'bold' as const,
    marginTop: '8px',
    direction: 'ltr' as const
  },
  timeText: {
    fontSize: '13px',
    fontFamily: 'monospace',
    fontWeight: 'bold' as const,
    background: 'rgba(0,0,0,0.6)',
    padding: '2px 6px',
    borderRadius: '3px'
  },
  timeSeparator: {
    color: '#aaa',
    margin: '0 5px',
    fontSize: '13px'
  },
  controlsRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  controlsLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  controlsRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  controlButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    padding: '8px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    minWidth: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s',
    '&:hover': {
      background: 'rgba(255,255,255,0.3)'
    }
  },
  seekButton: {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    color: 'white',
    padding: '6px 10px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.3s',
    '&:hover': {
      background: 'rgba(255,255,255,0.1)'
    }
  },
  speedControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'rgba(0,0,0,0.5)',
    padding: '4px 8px',
    borderRadius: '4px'
  },
  speedLabel: {
    color: 'white',
    fontSize: '12px',
    fontWeight: 'bold' as const
  },
  speedSelect: {
    background: 'rgba(0,0,0,0.7)',
    color: 'white',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '4px',
    padding: '6px 10px',
    fontSize: '13px',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    minWidth: '80px',
    '&:focus': {
      outline: 'none',
      borderColor: '#3b82f6'
    },
    '& option': {
      background: '#1f2937',
      color: 'white',
      padding: '8px',
      fontSize: '13px'
    }
  },
  currentSpeed: {
    color: 'white',
    fontSize: '14px',
    background: 'rgba(59, 130, 246, 0.8)',
    padding: '4px 8px',
    borderRadius: '4px',
    fontWeight: 'bold' as const,
    minWidth: '40px',
    textAlign: 'center' as const
  },
  currentSpeedBadge: {
    background: '#10b981',
    color: 'white',
    padding: '3px 8px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600' as const
  },
  fullscreenButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    color: 'white',
    padding: '8px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'all 0.3s',
    '&:hover': {
      background: 'rgba(255,255,255,0.3)'
    }
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
    fontWeight: '600' as const,
    marginBottom: '10px'
  },
  currentLessonInfo: {
    padding: '20px',
    borderTop: '1px solid #e5e7eb',
    background: 'white'
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
    gap: '15px',
    alignItems: 'center',
    flexWrap: 'wrap' as const
  },
  lessonDuration: {
    color: '#6b7280',
    fontSize: '14px',
    background: '#f3f4f6',
    padding: '4px 8px',
    borderRadius: '4px'
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
    textAlign: 'center' as const,
    transition: 'all 0.3s',
    '&:hover': {
      background: '#2563eb',
      transform: 'translateY(-2px)'
    }
  },
  completeButton: {
    padding: '15px 25px',
    background: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600' as const,
    cursor: 'pointer',
    transition: 'all 0.3s',
    '&:hover': {
      background: '#059669',
      transform: 'translateY(-2px)'
    }
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
    overflowY: 'auto' as const,
    paddingRight: '10px'
  },
  lessonItem: {
    background: 'white',
    border: '2px solid',
    borderRadius: '10px',
    padding: '20px',
    transition: 'all 0.3s',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }
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
    fontSize: '12px',
    background: '#f3f4f6',
    padding: '2px 8px',
    borderRadius: '4px'
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
  supportButtons: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '15px',
    marginBottom: '20px'
  },
  whatsappSupportButton: {
    padding: '15px',
    background: '#25D366',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    '&:hover': {
      background: '#128C7E',
      transform: 'translateY(-2px)'
    }
  },
  telegramSupportButton: {
    padding: '15px',
    background: '#0088cc',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: '600' as const,
    fontSize: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    transition: 'all 0.3s',
    '&:hover': {
      background: '#006699',
      transform: 'translateY(-2px)'
    }
  },
  supportIcon: {
    fontSize: '20px'
  },
  supportNote: {
    fontSize: '14px',
    color: '#9ca3af',
    fontStyle: 'italic' as const
  },
  footer: {
    background: '#1f2937',
    marginTop: '50px',
    padding: '30px 0'
  },
  footerContent: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 20px',
    textAlign: 'center' as const
  },
  footerText: {
    color: '#d1d5db',
    margin: '10px 0',
    fontSize: '14px'
  },
  footerLinks: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '15px',
    marginTop: '15px'
  },
  footerLink: {
    color: '#60a5fa',
    textDecoration: 'none',
    fontSize: '14px',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  footerSeparator: {
    color: '#6b7280'
  }
}