import { NextResponse } from 'next/server';

export function middleware(request) {
  // Lấy thông tin từ Cookie (được set lúc đăng nhập)
  const token = request.cookies.get('auth_token')?.value;
  const userRole = request.cookies.get('user_role')?.value;
  const path = request.nextUrl.pathname;

  // 1. Bảo vệ các Route dành cho Admin (Bắt buộc phải là role_id = 1)
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole !== '1') {
      // Nếu có token nhưng không phải Admin, đuổi về trang chủ
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. Bảo vệ các Route dành cho Khách hàng (Bắt buộc đăng nhập & không phải Admin)
  if (path.startsWith('/customer') || path.startsWith('/booking')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (userRole === '1') {
      // Admin không nên vào trang mua hàng/lịch sử của khách
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 3. Chặn người dùng đã đăng nhập quay lại trang Login / Register
  if (path === '/login' || path === '/register') {
    if (token) {
      if (userRole === '1') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else {
        return NextResponse.redirect(new URL('/', request.url));
      }
    }
  }

  // Nếu hợp lệ hết thì cho đi tiếp
  return NextResponse.next();
}

// Chỉ áp dụng middleware cho các đường dẫn cần bảo vệ
export const config = {
  matcher: [
    '/admin/:path*', 
    '/customer/:path*', 
    '/booking/:path*', 
    '/login', 
    '/register'
  ],
};