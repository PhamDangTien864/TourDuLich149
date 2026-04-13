import { NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth';

/**
 * Next.js 16 Middleware
 * Chúc nang: Kiêm soát quyen Admin (1) và Nhan vien (2)
 */
export async function proxy(request) {
  const token = request.cookies.get('auth_token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Giai ma token de lay thong tin nguoi dung
  let user = null;
  if (token) {
    try {
      user = verifyToken(token);
    } catch (err) {
      // Neu token loi hoac het han -> Xoa cookie va coi nhu chua login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // 2. Danh sach cac khu vuc bao ve
  const adminPaths = ['/admin'];
  const employeePaths = ['/employee'];
  const protectedPaths = [...adminPaths, ...employeePaths, '/booking', '/history', '/payment'];

  const isProtected = protectedPaths.some(path => pathname.startsWith(path));

  // 3. Logic chan nguoi la
  if (isProtected) {
    // Neu chua dang nhap -> Sut ngay ve trang Login
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Neu vao khu vuc Admin ma Role khong phai la 1 (Admin) -> Da ve trang chu
    if (pathname.startsWith('/admin') && user.role !== 1) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Neu vao khu vuc Nhan vien ma khong phai Nhan vien (2) hoac Admin (1) -> Da ve trang chu
    if (pathname.startsWith('/employee') && user.role !== 2 && user.role !== 1) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 4. Neu da login roi ma dinh vao Login/Register -> Cho ve trang chu luon
  if ((pathname === '/login' || pathname === '/register') && user) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

// Cau hinh cac Route ma Middleware se canh gac
export const config = {
  matcher: [
    '/admin/:path*', 
    '/employee/:path*', 
    '/booking/:path*', 
    '/history', 
    '/payment/:path*',
    '/login', 
    '/register'
  ],
};
