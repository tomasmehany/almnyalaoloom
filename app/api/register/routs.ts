import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    // بيانات Supabase
    const supabaseUrl = 'https://zltizgldhzmrtdnpewmm.supabase.co'
    const supabaseKey = 'sb_publishable_2LoitJ2WOehjl5MLuQuNDQ_-gr64r_nsb_secret_BsOypEm51rv8mtbCOkxoVQ_tIibM4lW'
    
    const supabase = createClient(supabaseUrl, supabaseKey)
    
    // نجيب البيانات من الطلب
    const body = await request.json()
    const { name, phone, grade, password } = body
    
    // نتحقق من البيانات
    if (!name || !phone || !grade || !password) {
      return NextResponse.json(
        { error: 'جميع الحقول مطلوبة' },
        { status: 400 }
      )
    }
    
    // نحفظ في قاعدة البيانات
    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          name,
          phone,
          grade,
          password,
          status: 'pending'
        }
      ])
      .select()
    
    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }
    
    console.log('✅ تم حفظ الطالب:', data)
    
    return NextResponse.json({
      success: true,
      message: 'تم استلام طلبك بنجاح',
      data: data
    })
    
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    )
  }
}