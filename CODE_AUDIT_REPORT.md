# BÁO CÁO AUDIT MÃ NGUỒN - VIETTRAVEL LUXURY

**Ngày audit:** 20/01/2025  
**Người thực hiện:** Senior Full-Stack Software Engineer  
**Phạm vi:** Toàn bộ dự án travel-website

---

## TÓM TẮT THI CÔNG

Đánh giá tổng quan: **CẢNH BÁO - Cần cải thiện đáng kể**

| Tiêu chí | Đánh giá | Mô tả |
|----------|----------|-------|
| **Kiến trúc** | Khá | Kiến trúc Next.js App Router tốt, nhưng cần cải thiện phân tầng |
| **Bảo mật** | Yếu | Nhiều lỗ hổng bảo mật nghiêm trọng cần xử lý ngay |
| **Hiệu năng** | Trung bình | Cần tối ưu hóa query và cache phân tán |
| **Chất lượng code** | Trung bình | Technical debt cao, inconsistent TypeScript adoption |
| **Tài liệu** | Yếu | Thiếu tài liệu kỹ thuật và API documentation |

---

## 1. KIẾN TRÚC HỆ THỐNG

### 1.1 Tech Stack

**Frontend:**
- Next.js 16 với App Router
- React 19
- TailwindCSS
- Framer Motion (animations)
- Lucide React (icons)
- SWR (data fetching)

**Backend:**
- Next.js API Routes
- Prisma ORM
- MySQL Database
- JWT Authentication
- VNPay Payment Gateway

**Validation & Utilities:**
- Zod (schema validation)
- bcryptjs (password hashing)
- jsonwebtoken (JWT tokens)
- Resend (email service)

### 1.2 Cấu trúc thư mục

```
travel-website/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── components/        # Reusable components
│   ├── customer/          # Customer pages
│   └── ...
├── lib/                   # Business logic & utilities
│   ├── services/          # Service layer
│   ├── hooks/             # Custom React hooks
│   ├── config/            # Configuration files
│   └── ...
├── prisma/                # Database schema & migrations
└── public/                # Static assets
```

**Đánh giá:** Cấu trúc thư mục hợp lý, tuân theo conventions của Next.js App Router.

### 1.3 Database Schema

**Các bảng chính:**
- `accounts` - User accounts (admin & customer)
- `tours` - Tour information
- `tour_images` - Tour images
- `tour_categories` - Tour categories
- `bookings` - Booking records
- `booking_passengers` - Passenger details
- `booking_payments` - Payment records
- `booking_logs` - Booking state transition logs
- `customers` - Customer information
- `reviews` - Tour reviews
- `departure_schedules` - Tour departure schedules

**Đánh giá:** Schema được thiết kế tốt với các quan hệ rõ ràng. Có sử dụng soft delete (`is_deleted`) và versioning cho bookings.

---

## 2. PHÂN TÍCH CHỨC NĂNG

### 2.1 Authentication & Authorization

**Files chính:**
- `lib/auth.ts` - JWT token generation & verification
- `lib/middleware.ts` - Authentication middleware for API routes
- `middleware.js` - Next.js middleware for route protection
- `lib/services/auth-service.ts` - Authentication business logic

**Flow:**
1. User đăng nhập → JWT token được tạo
2. Token được lưu trong cookie (`auth_token`) và localStorage
3. Middleware kiểm tra cookie để bảo vệ routes
4. API routes sử dụng `requireAuth` hoặc `requireRole` middleware

**Vấn đề phát hiện:**
- ❌ `middleware.js` chỉ kiểm tra sự tồn tại của token, KHÔNG verify JWT signature
- ❌ Role-based authorization dựa trên cookie `user_role` (có thể bị spoofed)
- ❌ Một số API routes thiếu authentication middleware

### 2.2 Booking System

**Files chính:**
- `lib/booking-service.ts` - Booking state machine & business logic
- `app/api/bookings/route.js` - Booking API endpoints
- `app/components/MultiStepBooking.js` - Booking UI component

**State Machine:**
```
PENDING → AWAITING_PAYMENT → DEPOSIT_PAID → CONFIRMED → COMPLETED
   ↓           ↓                ↓              ↓
CANCELLED ← CANCELLED ← CANCELLED ← CANCELLED
   ↓
REFUNDED
```

**Đánh giá:** State machine được thiết kế tốt với optimistic locking (version field).

### 2.3 Payment Integration

**Files chính:**
- `lib/vnpay.ts` - VNPay integration
- `app/api/payment/create/route.ts` - Payment creation
- `app/api/payments/[paymentId]/status/route.ts` - Payment status update

**Đánh giá:** VNPay integration được implement đúng spec, nhưng:
- ❌ Payment status update không verify ownership
- ❌ Config sử dụng fallback empty strings cho sensitive values

### 2.4 Tour Management

**Files chính:**
- `lib/services/tour-service.ts` - Tour business logic
- `app/api/tours/route.ts` - Tour API endpoints
- `app/tour/[id]/page.js` - Tour detail page

**Đánh giá:** 
- ✅ Có implement cache với TTL
- ✅ Có Vietnamese accent-insensitive search
- ⚠️ Search query sử dụng REPLACE chains rất dài (có thể chậm)

---

## 3. CÁC LỖI TÌM THẤY (BUGS & ISSUES)

### 3.1 LỖI BẢO MẬT (CRITICAL)

#### 🔴 BUG-001: Middleware không verify JWT token

**File:** `middleware.js` (lines 5-17)

**Mô tả:**
```javascript
const token = request.cookies.get('auth_token')?.value;
const userRole = request.cookies.get('user_role')?.value;

if (path.startsWith('/admin')) {
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (userRole !== '1') {  // ❌ Chỉ kiểm tra cookie, không verify token
    return NextResponse.redirect(new URL('/', request.url));
  }
}
```

**Vấn đề:** 
- Token chỉ được kiểm tra sự tồn tại, không verify signature
- `user_role` cookie có thể bị client spoofed
- Attacker có thể set cookie `user_role=1` để truy cập admin routes

**Khuyến nghị:**
```javascript
import { verifyToken } from '@/lib/auth';

const token = request.cookies.get('auth_token')?.value;
if (!token) {
  return NextResponse.redirect(new URL('/login', request.url));
}

const decoded = verifyToken(token);
if (!decoded || decoded.role_id !== 1) {
  return NextResponse.redirect(new URL('/', request.url));
}
```

**Mức độ nghiêm trọng:** 🔴 CRITICAL

---

#### 🔴 BUG-002: Payment status update không verify ownership

**File:** `app/api/payments/[paymentId]/status/route.ts` (lines 5-41)

**Mô tả:**
```typescript
export async function POST(req: NextRequest, { params }) {
  const user = await authenticate(req);
  // ❌ Không kiểm tra payment có thuộc về user không
  const result = await PaymentService.updatePaymentStatus(
    paymentId,
    status as PaymentStatus,
    transactionId
  );
}
```

**Vấn đề:** User có thể update status của payment của user khác.

**Khuyến nghị:**
```typescript
const payment = await prisma.booking_payments.findUnique({
  where: { id: paymentId },
  include: { bookings: true }
});

if (!payment || payment.bookings.account_id !== user.id) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
}
```

**Mức độ nghiêm trọng:** 🔴 CRITICAL

---

#### 🔴 BUG-003: VNPay config sử dụng fallback empty strings

**File:** `lib/vnpay.ts` (lines 3-8)

**Mô tả:**
```typescript
const VNPayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE || '',  // ❌ Fallback rỗng
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET || '',  // ❌ Fallback rỗng
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/...',
  vnp_ReturnUrl: process.env.VNPAY_RETURN_URL || `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,
};
```

**Vấn đề:** Nếu environment variables không được set, config sẽ sử dụng empty strings → payment sẽ fail silently.

**Khuyến nghị:**
```typescript
if (!process.env.VNPAY_TMN_CODE || !process.env.VNPAY_HASH_SECRET) {
  throw new Error('VNPay configuration is missing required environment variables');
}

const VNPayConfig = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE!,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET!,
  // ...
};
```

**Mức độ nghiêm trọng:** 🔴 CRITICAL

---

#### 🟡 BUG-004: CSRF protection không được implement

**File:** `lib/csrf.ts` (toàn bộ file chỉ là comments)

**Mô tả:** File `csrf.ts` chỉ chứa comments hướng dẫn, không có implementation thực tế.

**Vấn đề:** Application không có CSRF protection, dễ bị CSRF attacks.

**Khuyến nghị:** Implement CSRF token validation cho tất cả mutation requests (POST, PUT, DELETE, PATCH).

**Mức độ nghiêm trọng:** 🟡 HIGH

---

#### 🟡 BUG-005: Rate limiting không được áp dụng

**File:** `lib/rate-limit.ts` (in-memory implementation)

**Mô tả:** Rate limiting được implement nhưng không được áp dụng trong API routes.

**Vấn đề:** 
- In-memory rate limiting không hoạt động trong distributed environment
- Không được apply trong bất kỳ API route nào

**Khuyến nghị:**
1. Implement Redis-based rate limiting cho production
2. Apply rate limiting middleware cho tất cả API routes
3. Tăng giới hạn cho authenticated users

**Mức độ nghiêm trọng:** 🟡 HIGH

---

### 3.2 LỖI LOGIC (HIGH)

#### 🟡 BUG-006: cleanupExpiredReservations reference non-existent field

**File:** `lib/booking-service.ts` (lines 330-364)

**Mô tả:**
```typescript
static async cleanupExpiredReservations(): Promise<void> {
  // ...
  // Note: departure_schedule_id field doesn't exist in schema
  // Slots are managed at tour level via max_slots, not schedule level
  // ❌ Code vẫn có logic release slot nhưng không hoạt động đúng
}
```

**Vấn đề:** Logic cleanup không hoạt động đúng vì schema không có `departure_schedule_id`.

**Khuyến nghị:** Review và implement đúng logic dựa trên schema hiện tại.

**Mức độ nghiêm trọng:** 🟡 HIGH

---

#### 🟡 BUG-007: Idempotency key generation không cryptographically secure

**File:** `app/api/bookings/route.js` (line 26)

**Mô tả:**
```javascript
const idempotencyKey = body.idempotencyKey || 
  `booking_${Date.now()}_${Math.random().toString(36).substring(7)}`;
// ❌ Math.random() không cryptographically secure
```

**Vấn đề:** `Math.random()` không an toàn cho security-sensitive operations.

**Khuyến nghị:**
```javascript
import crypto from 'crypto';

const idempotencyKey = body.idempotencyKey || 
  `booking_${Date.now()}_${crypto.randomBytes(16).toString('hex')}`;
```

**Mức độ nghiêm trọng:** 🟡 HIGH

---

#### 🟡 BUG-008: Payment amount validation cho phép rounding differences

**File:** `app/api/payment/create/route.ts` (lines 79-83)

**Mô tả:**
```typescript
const isAmountValid = validAmounts.some(validAmount => 
  Math.abs(amount - validAmount) < 100  // ❌ Cho phép sai số 100 VND
);
```

**Vấn đề:** Cho phép sai số 100 VND có thể bị exploited.

**Khuyến nghị:** Sử dụng exact matching hoặc giảm tolerance xuống mức hợp lý hơn (1-5 VND).

**Mức độ nghiêm trọng:** 🟡 MEDIUM

---

### 3.3 LỖI HIỆU NĂNG (MEDIUM)

#### 🟢 PERF-001: Vietnamese accent search sử dụng REPLACE chains dài

**File:** `lib/services/tour-service.ts` (lines 135-209)

**Mô tả:** Search query sử dụng 40+ REPLACE operations cho mỗi field, rất dài và có thể chậm.

**Vấn đề:** Query rất dài, khó maintain, có thể gây performance issue với large datasets.

**Khuyến nghị:**
1. Sử dụng MySQL collation `utf8mb4_unicode_ci` hoặc `utf8mb4_general_ci`
2. Hoặc implement full-text search với Elasticsearch/Meilisearch
3. Hoặc pre-normalize data (store both accented and non-accented versions)

**Mức độ nghiêm trọng:** 🟢 MEDIUM

---

#### 🟢 PERF-002: Cache implementation in-memory only

**File:** `lib/cache.ts` (toàn bộ file)

**Mô tả:** Cache sử dụng `Map` in-memory, không hoạt động trong distributed environment.

**Vấn đề:** 
- Không hoạt động với multiple server instances
- Cache bị mất khi server restart
- Không scalable

**Khuyến nghị:** Implement Redis hoặc Memcached cho production.

**Mức độ nghiêm trọng:** 🟢 MEDIUM

---

#### 🟢 PERF-003: Potential N+1 query issues

**File:** `lib/services/tour-service.ts` (lines 298-318)

**Mô tả:** Code cố gắng tránh N+1 với groupBy, nhưng vẫn có potential issues với complex queries.

**Khuyến nghị:** Review và optimize queries, sử dụng Prisma's `include` với `select` để limit fields.

**Mức độ nghiêm trọng:** 🟢 MEDIUM

---

### 3.4 TECHNICAL DEBT (LOW)

#### 🔴 DEBT-001: Inconsistent TypeScript adoption

**Mô tả:** Project sử dụng mix của `.js`, `.ts`, `.tsx` files.

**Vấn đề:** 
- Không có type safety cho `.js` files
- Difficult to refactor safely
- Inconsistent codebase

**Khuyến nghị:** Migrate tất cả files sang TypeScript.

**Mức độ nghiêm trọng:** 🔴 HIGH

---

#### 🟡 DEBT-002: Extensive use of 'any' type

**Mô tả:** Nhiều files sử dụng `any` type (ví dụ: `lib/booking-service.ts` line 123, 240, 425).

**Vấn đề:** Mất lợi ích của TypeScript, dễ gây runtime errors.

**Khuyến nghị:** Define proper interfaces and types.

**Mức độ nghiêm trọng:** 🟡 MEDIUM

---

#### 🟡 DEBT-003: ESLint config disables TypeScript strict rules

**File:** `eslint.config.mjs` (lines 21-22)

**Mô tả:**
```javascript
'@typescript-eslint/no-explicit-any': 'off',
'@typescript-eslint/no-unused-vars': 'off',
```

**Vấn đề:** Disabled important TypeScript linting rules.

**Khuyến nghị:** Enable strict rules và fix violations.

**Mức độ nghiêm trọng:** 🟡 MEDIUM

---

#### 🟡 DEBT-004: No centralized error logging/monitoring

**Mô tả:** Errors chỉ được log ra console, không có centralized logging solution.

**Vấn đề:** 
- Difficult to debug production issues
- No error tracking/alerting
- No analytics on error rates

**Khuyến nghị:** Implement Sentry, LogRocket, hoặc similar solution.

**Mức độ nghiêm trọng:** 🟡 MEDIUM

---

#### 🟢 DEBT-005: Duplicate validation logic

**Mô tả:** Validation logic được duplicate giữa client-side (React components) và server-side (Zod schemas).

**Vấn đề:** Difficult to maintain,容易不一致.

**Khuyến nghị:** Generate client-side validation schemas from Zod schemas (ví dụ: sử dụng zod-to-json-schema).

**Mức độ nghiêm trọng:** 🟢 LOW

---

#### 🟢 DEBT-006: No input sanitization for XSS

**Mô tả:** Không có input sanitization cho user-generated content (reviews, comments, etc.).

**Vấn đề:** Potential XSS vulnerabilities.

**Khuyến nghị:** Implement DOMPurify hoặc similar sanitization library.

**Mức độ nghiêm trọng:** 🟢 LOW

---

#### 🟢 DEBT-007: Inconsistent API response formats

**Mô tả:** API responses có inconsistent formats (some return `{ success, data }`, others return direct objects).

**Vấn đề:** Difficult for frontend to handle consistently.

**Khuyến nghị:** Standardize API response format across all endpoints.

**Mức độ nghiêm trọng:** 🟢 LOW

---

## 4. KHUYẾN NGHỊ CẢI THIỆN

### 4.1 Ưu tiên CAO (Nên xử lý ngay)

1. **Fix middleware JWT verification** (BUG-001)
   - Verify JWT signature trong middleware.js
   - Sử dụng lib/middleware.ts thay vì middleware.js

2. **Add payment ownership verification** (BUG-002)
   - Verify payment belongs to user trước khi update status

3. **Fix VNPay config validation** (BUG-003)
   - Throw error nếu environment variables missing

4. **Implement CSRF protection** (BUG-004)
   - Add CSRF tokens cho tất cả forms
   - Validate CSRF tokens trong API routes

5. **Migrate to full TypeScript** (DEBT-001)
   - Convert tất cả .js files sang .ts
   - Enable strict TypeScript rules

### 4.2 Ưu tiên TRUNG BÌNH (Nên xử lý trong 1-2 tuần)

6. **Implement distributed rate limiting** (BUG-005)
   - Setup Redis cho rate limiting
   - Apply rate limiting middleware cho API routes

7. **Fix cleanupExpiredReservations logic** (BUG-006)
   - Implement đúng logic dựa trên schema hiện tại

8. **Use cryptographically secure random** (BUG-007)
   - Replace Math.random() với crypto.randomBytes()

9. **Implement Redis cache** (PERF-002)
   - Migrate từ in-memory cache sang Redis

10. **Add centralized error monitoring** (DEBT-004)
    - Setup Sentry hoặc similar

### 4.3 Ưu tiên THẤP (Có thể xử lý sau)

11. **Optimize Vietnamese search** (PERF-001)
    - Implement full-text search solution

12. **Remove 'any' types** (DEBT-002)
    - Define proper interfaces

13. **Enable ESLint strict rules** (DEBT-003)
    - Fix all lint violations

14. **Add input sanitization** (DEBT-006)
    - Implement DOMPurify

15. **Standardize API responses** (DEBT-007)
    - Create consistent response format

---

## 5. TÓM TẮT

### 5.1 Điểm mạnh

✅ Kiến trúc Next.js App Router hiện đại  
✅ State machine cho bookings được thiết kế tốt  
✅ Có validation với Zod  
✅ Có caching layer  
✅ Database schema được thiết kế tốt với các quan hệ rõ ràng  
✅ Code được tổ chức thành layers (services, middleware, utilities)  

### 5.2 Điểm yếu cần cải thiện

❌ Bảo mật: Nhiều lỗ hổng nghiêm trọng (JWT verification, CSRF, rate limiting)  
❌ TypeScript adoption không hoàn toàn  
❌ Cache không scalable (in-memory only)  
❌ Thiếu centralized error monitoring  
❌ Code quality: Nhiều 'any' types, ESLint rules disabled  

### 5.3 Đánh giá tổng quan

Dự án có nền tảng tốt với kiến trúc hiện đại và thiết kế database hợp lý. Tuy nhiên, có **nhiều lỗ hổng bảo mật nghiêm trọng** cần được xử lý ngay lập tức trước khi deploy production. Technical debt cũng khá cao với inconsistent TypeScript adoption và disabled linting rules.

**Khuyến nghị:** Ưu tiên xử lý các lỗ hổng bảo mật (Section 4.1) trước khi tiếp tục phát triển features mới.

---

## 6. PHỤ LỤC

### 6.1 Files đã audit

**Configuration:**
- package.json
- next.config.ts
- tailwind.config.js
- postcss.config.js
- eslint.config.mjs
- prisma/schema.prisma

**Core Libraries:**
- lib/prisma.ts
- lib/middleware.ts
- middleware.js
- lib/auth.ts
- lib/validations.ts
- lib/booking-service.ts
- lib/errors.ts
- lib/api-response.ts
- lib/cache.ts
- lib/vnpay.ts
- lib/config/booking.ts
- lib/rate-limit.ts
- lib/csrf.ts
- lib/api-validation.ts

**Services:**
- lib/services/auth-service.ts
- lib/services/tour-service.ts

**API Routes:**
- app/api/auth/login/route.ts
- app/api/auth/register/route.ts
- app/api/bookings/route.js
- app/api/tours/route.ts
- app/api/tours/[id]/route.js
- app/api/admin/users/[id]/route.ts
- app/api/users/route.js
- app/api/payment/create/route.ts
- app/api/payments/[paymentId]/status/route.ts

**Components:**
- app/components/MultiStepBooking.js
- app/components/Header.js
- app/components/FloatingContact.tsx

**Pages:**
- app/layout.js
- app/page.js
- app/admin/page.js
- app/customer/bookings/page.js
- app/admin/bookings/BookingsClient.js
- app/login/page.js
- app/register/page.js
- app/tour/[id]/page.js

### 6.2 Environment Variables cần thiết

```
DATABASE_URL=
JWT_SECRET=
NEXT_PUBLIC_BASE_URL=
VNPAY_TMN_CODE=
VNPAY_HASH_SECRET=
VNPAY_URL=
VNPAY_RETURN_URL=
RESEND_API_KEY=
GOOGLE_SITE_VERIFICATION=
```

---

**Kết thúc báo cáo**
