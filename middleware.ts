// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export const config = {
  runtime: 'nodejs',
  matcher: [ '/admin/:path*', '/login' ],
};

export async function middleware(request: NextRequest) {
  const sessionCookie = request.cookies.get('__session')?.value || '';
  const pathname = request.nextUrl.pathname;

  console.log(`Middleware (Node.js): Path=${pathname}, HasSessionCookie=${!!sessionCookie}`);

  if (pathname.startsWith('/admin')) {
    if (!sessionCookie) {
      console.log('Middleware: No session cookie, redirecting to /login');
      return NextResponse.redirect(new URL('/login', request.url));
    }
    try {
      const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
      console.log('Middleware: Session cookie verified for UID:', decodedToken.uid);

      // --- KIỂM TRA ADMIN CLAIM ---
      if (decodedToken.admin === true) { // Kiểm tra xem claim 'admin' có giá trị true không
        console.log('Middleware: User is Admin. Access granted.');
        // Là admin, cho phép đi tiếp
        return NextResponse.next();
      } else {
        // Không phải admin hoặc không có claim 'admin'
        console.log('Middleware: User is NOT Admin. Redirecting to /login');
        // Chuyển hướng về login và xóa cookie (vì họ không có quyền vào admin)
        const response = NextResponse.redirect(new URL('/login', request.url));
        response.cookies.set({ name: '__session', value: '', maxAge: 0 });
        return response;
        // Hoặc chuyển hướng đến trang /unauthorized nếu muốn có trang báo lỗi riêng
        // return NextResponse.redirect(new URL('/unauthorized', request.url));
      }
      // ---------------------------

    } catch (error) {
      console.error('Middleware: Invalid session cookie:', error);
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.set({ name: '__session', value: '', maxAge: 0 });
      return response;
    }
  }

  // Chuyển hướng người dùng đã đăng nhập khỏi trang login (logic này vẫn giữ nguyên)
  if (pathname === '/login') {
    if (sessionCookie) {
      try {
        await adminAuth.verifySessionCookie(sessionCookie, false);
        console.log('Middleware: User already logged in, redirecting from /login to /admin');
        return NextResponse.redirect(new URL('/admin/flights/create', request.url));
      } catch (error) {
         console.log('Middleware: Invalid session cookie on /login, clearing cookie');
         const response = NextResponse.next();
         response.cookies.set({ name: '__session', value: '', maxAge: 0 });
         return response;
      }
    }
  }

  return NextResponse.next();
}