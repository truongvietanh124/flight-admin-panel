// src/app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers'; // <<< Import cookies từ next/headers
import admin, { adminAuth } from '@/lib/firebaseAdmin'; // <<< Import adminAuth

// --- HÀM XỬ LÝ TẠO SESSION COOKIE (KHI LOGIN) ---
export async function POST(request: Request) {
  console.log('API POST /api/auth/session called');
  try {
    const body = await request.json();
    const idToken = body.idToken; // Lấy ID token từ client gửi lên

    if (!idToken) {
      return NextResponse.json({ error: 'ID token is required.' }, { status: 400 });
    }

    // Thời hạn của session cookie (ví dụ: 5 ngày)
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds

    // Tạo session cookie từ ID token
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });
    console.log('Session cookie created successfully');

    // Thiết lập cookie trong response trả về cho client
    const options = {
      name: '__session', // Tên cookie (quan trọng!)
      value: sessionCookie,
      maxAge: expiresIn / 1000, // maxAge tính bằng giây
      httpOnly: true, // Chỉ server truy cập được, tăng bảo mật
      secure: process.env.NODE_ENV === 'production', // Chỉ gửi qua HTTPS ở production
      path: '/', // Áp dụng cho toàn bộ domain
      // sameSite: 'lax', // Giảm nguy cơ CSRF (có thể là 'strict' hoặc 'lax')
    };

    // Dùng cookies() helper từ next/headers để set cookie
    (await
          // Dùng cookies() helper từ next/headers để set cookie
          cookies()).set(options);
    console.log('Session cookie set in response');

    return NextResponse.json({ status: 'success' }, { status: 200 });

  } catch (error: any) {
    console.error('Error creating session cookie:', error);
    let errorMessage = 'Failed to create session cookie.';
    if (error.code === 'auth/id-token-expired') {
        errorMessage = 'ID token has expired.';
    } else if (error.code === 'auth/argument-error') {
         errorMessage = 'Invalid ID token.';
    }
    // Tránh trả về chi tiết lỗi nhạy cảm cho client
    return NextResponse.json({ error: errorMessage }, { status: 401 }); // Unauthorized
  }
}


// --- HÀM XỬ LÝ XÓA SESSION COOKIE (KHI LOGOUT) ---
export async function DELETE(request: Request) {
    console.log('API DELETE /api/auth/session called');
    try {
        // Xóa cookie bằng cách set maxAge = 0 hoặc hết hạn trong quá khứ
        (await
            // Xóa cookie bằng cách set maxAge = 0 hoặc hết hạn trong quá khứ
            cookies()).set({
            name: '__session',
            value: '',
            maxAge: 0,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        });
        console.log('Session cookie cleared');

        return NextResponse.json({ status: 'success' }, { status: 200 });
    } catch (error: any) {
         console.error('Error clearing session cookie:', error);
         return NextResponse.json({ error: 'Failed to clear session cookie.' }, { status: 500 });
    }
}