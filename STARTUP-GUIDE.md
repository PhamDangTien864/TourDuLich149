# 🚀 Hướng Dẫn Chạy Dự Án Travel Website

## 📋 Yêu Cầu Hệ Thống
- Node.js 18+ 
- MySQL 8.0+
- Git

## 🔧 Bước 1: Cài Đặt Dependencies
```bash
cd travel-website
npm install
```

## 🗄️ Bước 2: Cấu Hình Database

### 2.1 Tạo Database
```sql
CREATE DATABASE travel_db;
```

### 2.2 Cấu Hình Environment Variables
Tạo file `.env` trong thư mục `travel-website` với nội dung:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/travel_db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-here"

# Base URL
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# Resend Email Service
RESEND_API_KEY="your-resend-api-key"

# Node Environment
NODE_ENV="development"

# Payment Information
NEXT_PUBLIC_BANK_ID="vcb"
NEXT_PUBLIC_BANK_ACCOUNT="0912345678"
```

**Lưu ý:** Thay `username:password` bằng thông tin MySQL của bạn.

## 🔌 Bước 3: Generate Prisma Client
```bash
npm run db:generate
```

## 📊 Bước 4: Push Database Schema
```bash
npm run db:push
```

## 🌱 Bước 5: Seed Data (Tùy chọn)
```bash
npm run seed
```

## 🚀 Bước 6: Khởi Động Server
```bash
npm run dev
```

Truy cập: http://localhost:3000

## 🛠️ Các Lệnh Nữa
```bash
# Build cho production
npm run build

# Start production server
npm start

# Check linting
npm run lint

# Database migration
npm run db:migrate
```

## 🔍 Kiểm Tra Hoạt Động

### 1. API Endpoints
- `GET /api/tours` - Lấy danh sách tours
- `POST /api/tours` - Tạo tour mới
- `GET /api/reviews?tour_id=1` - Lấy đánh giá tour
- `POST /api/reviews` - Tạo đánh giá mới
- `POST /api/bookings` - Đặt tour

### 2. Authentication
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/register` - Đăng ký

### 3. Frontend Pages
- `/` - Trang chủ
- `/search` - Tìm kiếm tour
- `/tour/[id]` - Chi tiết tour
- `/login` - Đăng nhập
- `/register` - Đăng ký

## 🐛 Lỗi Thường Gặp

### 1. Prisma Client Not Found
```bash
npm run db:generate
```

### 2. Database Connection Error
- Kiểm tra MySQL đang chạy
- Kiểm tra DATABASE_URL trong `.env`
- Đảm bảo database đã được tạo

### 3. JWT Errors
- Kiểm tra JWT_SECRET trong `.env`
- Đảm bảo JWT_SECRET không rỗng

### 4. TypeScript Errors
- Chạy `npm run db:generate` để generate types
- Xóa file `types/prisma.d.ts` nếu tồn tại

## 📁 Cấu Trúc Project
```
travel-website/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   ├── components/         # React Components
│   └── pages/            # Pages
├── lib/                   # Utility libraries
├── prisma/               # Database schema
├── public/               # Static files
└── types/               # TypeScript definitions
```

## 🎯 Tips
1. Luôn chạy `npm run db:generate` sau khi thay đổi `prisma/schema.prisma`
2. Sử dụng `npm run db:push` cho development
3. Sử dụng `npm run db:migrate` cho production
4. Kiểm tra console.log trong terminal để debug API
5. Sử dụng browser DevTools để inspect network requests

## 🆘 Hỗ Trợ
Nếu gặp lỗi:
1. Kiểm tra terminal output
2. Kiểm tra browser console
3. Xem file `README-IMPROVEMENTS.md` để biết các thay đổi
4. Kiểm tra environment variables

**Chúc bạn chạy dự án thành công!** 🎉
