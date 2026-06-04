import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth';

export const runtime = 'nodejs';

export function middleware(request) {
  // Lấy thông tin từ Cookie (được set lúc đăng nhập)
  const token = request.cookies.get('auth_token')?.value;
  const path = request.nextUrl.pathname;

  // Verify JWT token và lấy user info
  let decoded = null;
  if (token) {
    decoded = verifyToken(token);
  }

  // Normalize role_id field (handle both 'role' and 'role_id' for compatibility)
  const roleId = decoded?.role_id || decoded?.role;

  // 1. Bảo vệ các Route dành cho Admin (Bắt buộc phải là role_id = 1)
  if (path.startsWith('/admin')) {
    if (!token || !decoded) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (roleId !== 1) {
      // Nếu có token nhưng không phải Admin, đuổi về trang chủ
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 2. Bảo vệ các Route dành cho Khách hàng (Bắt buộc đăng nhập & không phải Admin)
  if (path.startsWith('/customer') || path.startsWith('/booking')) {
    if (!token || !decoded) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (roleId === 1) {
      // Admin không nên vào trang mua hàng/lịch sử của khách
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  // 3. Bảo vệ API routes nhạy cảm - Admin API
  if (path.startsWith('/api/admin')) {
    if (!token || !decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (roleId !== 1) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // 4. Bảo vệ API routes nhạy cảm - User management
  if (path.startsWith('/api/users')) {
    if (!token || !decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (roleId !== 1) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // 5. Bảo vệ API routes nhạy cảm - Tour management (DELETE, PATCH)
  if (path.startsWith('/api/tours') && (path.includes('/delete') || request.method === 'DELETE' || request.method === 'PATCH')) {
    if (!token || !decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (roleId !== 1) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  }

  // 6. Chặn người dùng đã đăng nhập quay lại trang Login / Register
  if (path === '/login' || path === '/register') {
    if (token && decoded) {
      if (roleId === 1) {
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
    '/api/admin/:path*',
    '/api/users/:path*',
    '/login',
    '/register'
  ],
};