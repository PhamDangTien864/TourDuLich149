import { NextResponse } from 'next/server';

export function middleware(request) {
  const userRole = request.cookies.get('user_role')?.value;
  const url = request.nextUrl.clone();

  // 1. Nếu cố tình vào trang /admin mà không phải là Admin (role != 1)
  if (url.pathname.startsWith('/admin')) {
    if (userRole !== '1') {
      url.pathname = '/login'; // Đá bay về trang Login
      return NextResponse.redirect(url);
    }
  }

  // 2. Nếu đã đăng nhập rồi mà còn vào trang /login thì cho ra trang chủ luôn
  if (url.pathname === '/login' && userRole) {
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Chỉ áp dụng bảo vệ cho các đường dẫn này
export const config = {
  matcher: ['/admin/:path*', '/login'],
};