# Báo Cáo Tổng Hợp Dự Án Travel Website

## 1. Kiến Trúc Tổng Thể Của Dự Án

### 1.1 Công Nghệ Sử Dụng

**Frontend:**
- **Framework:** Next.js 16 với App Router
- **Language:** JavaScript/TypeScript
- **UI Components:** Lucide React (icons), TailwindCSS (styling)
- **State Management:** React Hooks (useState, useEffect), SWR (data fetching)
- **Animations:** Framer Motion

**Backend:**
- **Runtime:** Node.js với Next.js API Routes
- **Database:** MySQL (TiDB Cloud)
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Validation:** Zod schema validation
- **Password Hashing:** bcryptjs

**DevOps:**
- **Package Manager:** npm
- **Code Quality:** ESLint
- **Environment:** .env files cho configuration

### 1.2 Cấu Trúc Thư Mục

```
travel-website/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin dashboard
│   │   ├── users/               # User management
│   │   ├── tours/               # Tour management
│   │   ├── customers/           # Customer management
│   │   ├── bookings/            # Booking management
│   │   └── analytics/           # Analytics dashboard
│   ├── customer/                # Customer portal
│   │   ├── bookings/            # Booking history
│   │   ├── profile/             # Profile management
│   │   └── me/                  # Account settings
│   ├── api/                     # API routes
│   │   ├── auth/                # Authentication endpoints
│   │   ├── bookings/            # Booking operations
│   │   ├── tours/               # Tour operations
│   │   ├── users/               # User operations
│   │   └── customers/           # Customer operations
│   ├── components/              # Reusable components
│   │   ├── Header/              # Navigation header
│   │   ├── Footer/              # Site footer
│   │   ├── MultiStepBooking/    # Booking form
│   │   ├── FloatingContact/     # Chat widget
│   │   └── ChatContext/         # Chat state management
│   ├── login/                   # Login page
│   ├── register/                # Registration page
│   ├── tour/[id]/               # Tour detail page
│   └── page.js                  # Homepage
├── lib/                         # Utility libraries
│   ├── prisma.ts               # Prisma client
│   ├── middleware.ts           # Authentication middleware
│   ├── validations.ts          # Zod schemas
│   ├── auth.ts                 # JWT utilities
│   ├── booking-service.ts      # Booking business logic
│   ├── api-response.ts         # API response helpers
│   ├── errors.ts               # Error handling
│   └── cache.ts                # Caching utilities
├── prisma/                      # Database schema & migrations
│   ├── schema.prisma           # Database schema
│   ├── seed.ts                 # Database seeding
│   └── seed-simple.ts          # Simple seeding script
├── middleware.js                # Next.js middleware (route protection)
└── scripts/                     # Utility scripts
    ├── create-accounts.js      # Create test accounts
    └── update-map.js           # Update tour map URLs
```

### 1.3 Database Schema

**Các bảng chính:**

1. **accounts** - Thông tin tài khoản người dùng
   - Fields: id, username, password, full_name, email, phone_number, role_id, is_verified, is_deleted
   - Relations: bookings, customers

2. **roles** - Vai trò người dùng (Admin, Customer)

3. **tours** - Thông tin tour du lịch
   - Fields: id, title, description, location_name, price, max_slots, is_active, is_deleted
   - Relations: tour_categories, tour_images, bookings

4. **tour_categories** - Phân loại tour

5. **tour_images** - Hình ảnh tour
   - Fields: id, tour_id, image_url, is_primary

6. **bookings** - Đặt tour
   - Fields: id, tour_id, account_id, customer_id, start_date, end_date, total_amount, paid_amount, status, idempotency_key, version
   - Relations: booking_passengers, booking_payments, booking_logs

7. **booking_passengers** - Thông tin hành khách
   - Fields: id, booking_id, full_name, birth_date, gender, phone_number, is_child

8. **booking_payments** - Thanh toán
   - Fields: id, booking_id, amount, payment_method, payment_status, payment_type, transaction_id

9. **booking_logs** - Log trạng thái booking
   - Fields: id, booking_id, status_from, status_to, action, actor_id, actor_type, notes

10. **customers** - Thông tin khách hàng
    - Fields: id, account_id, full_name, phone_number, email, birth_date, identity_card, address

11. **promotions** - Khuyến mãi
12. **reviews** - Đánh giá tour
13. **transactions** - Giao dịch

### 1.4 Authentication & Authorization Flow

```
1. User đăng nhập → POST /api/auth/login
2. Server validate credentials
3. Server generate JWT token
4. Token lưu trong:
   - localStorage (client-side)
   - Cookie (server-side middleware)
5. Middleware kiểm tra token cho protected routes:
   - /admin/* → Chỉ role_id = 1 (Admin)
   - /customer/* → Chỉ role_id = 2 (Customer)
   - /api/admin/* → Chỉ Admin
   - /api/users/* → Chỉ Admin
```

### 1.5 Booking Flow

```
1. User chọn tour → MultiStepBooking component
2. Step 1: Chọn ngày, số người lớn/trẻ em
3. Step 2: Nhập thông tin hành khách
4. Step 3: Xác nhận và thanh toán
5. POST /api/bookings:
   - Validate input (Zod)
   - Check idempotency key (tránh duplicate)
   - Reserve slots (atomic operation)
   - Create booking record
   - Create passengers
   - Create payment record
   - Send confirmation email
   - Invalidate cache
6. State machine quản lý trạng thái booking:
   PENDING → AWAITING_PAYMENT → DEPOSIT_PAID → CONFIRMED → COMPLETED
   (hoặc CANCELLED, REFUNDED)
```

---

## 2. Các Lỗi Lớn Đã Gặp Và Cách Sửa

### 2.1 Lỗi Bảo Mật (CRITICAL)

#### Lỗi 1: API Routes Không Được Bảo Vệ
**Vấn đề:**
- `/api/tours/[id]` DELETE/PATCH không có authentication
- Bất kỳ ai có thể xóa/sửa tour
- `/api/users` POST không được bảo vệ
- `/app/admin/users/[id]/toggle-role` không có authorization

**Cách sửa:**
```javascript
// Thêm requireRole middleware vào API routes
import { requireRole } from "@/lib/middleware";

export async function DELETE(req, { params }) {
  return requireRole([1])(async (request) => {
    // Chỉ admin mới được truy cập
  })(req);
}
```

**Kết quả:** API routes giờ chỉ được truy cập bởi admin đã xác thực.

#### Lỗi 2: Booking Authorization Bypass
**Vấn đề:**
```javascript
// Trước khi sửa
const userId = searchParams.get("user_id") || user.id;
```
User có thể xem booking của user khác bằng cách truyền `user_id` parameter.

**Cách sửa:**
```javascript
// Sau khi sửa
let userId;
if (user.role_id === 1 && requestedUserId) {
  // Admin có thể xem booking của bất kỳ user nào
  userId = parseInt(requestedUserId);
} else {
  // User thường chỉ xem booking của mình
  userId = user.id;
}
```

#### Lỗi 3: Toggle Role Không Có Self-Prevention
**Vấn đề:** Admin có thể thay đổi role của chính mình, dẫn đến bị khóa khỏi hệ thống.

**Cách sửa:**
```typescript
if (request.user?.id === userId) {
  return NextResponse.json({ 
    error: "Bạn không thể thay đổi vai trò của chính mình" 
  }, { status: 403 });
}
```

### 2.2 Lỗi Logic & Validation

#### Lỗi 4: Phone Validation Mâu Thuẫn
**Vấn đề:**
- `validations.ts`: Phone required cho adults, optional cho children
- `booking-service.ts`: Phone required cho TẤT CẢ hành khách

**Cách sửa:**
```typescript
// booking-service.ts
if (!passenger.is_child) {
  if (!passenger.phone_number || !/^[0-9]{10,11}$/.test(passenger.phone_number)) {
    errors.push('Người lớn phải có số điện thoại (10-11 số)');
  }
} else if (passenger.phone_number && !/^[0-9]{10,11}$/.test(passenger.phone_number)) {
  // Nếu có phone cho children, vẫn phải validate format
  errors.push('Số điện thoại phải từ 10-11 số');
}
```

#### Lỗi 5: Password Validation Không Nhất Quán
**Vấn đề:**
- `validations.ts`: Yêu cầu 8 ký tự với uppercase, lowercase, number
- `api/users/route.js`: Chỉ yêu cầu 6 ký tự

**Cách sửa:**
```javascript
// api/users/route.js
if (password.length < 8) {
  return NextResponse.json({ error: "Mật khẩu phải có ít nhất 8 ký tự" }, { status: 400 });
}

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
if (!passwordRegex.test(password)) {
  return NextResponse.json({ error: "Mật khẩu phải có chữ hoa, chữ thường và số" }, { status: 400 });
}
```

#### Lỗi 6: Tour Link Sai Trong Booking History
**Vấn đề:**
```javascript
// Trước khi sửa
href={`/tour/${booking.id}`}  // booking.id là ID của booking, không phải tour
```

**Cách sửa:**
```javascript
// Sau khi sửa
href={`/tour/${booking.tour_id}`}  // Dùng tour_id đúng
```

### 2.3 Lỗi React Hooks

#### Lỗi 7: set-state-in-effect
**Vấn đề:** Gọi `setState` đồng bộ trong `useEffect` gây ESLint error.

**Cách sửa:** Sử dụng lazy initialization
```javascript
// Trước khi sửa
const [userId, setUserId] = useState(null);
useEffect(() => {
  const userData = localStorage.getItem('user_data');
  setUserId(user.id); // ❌ set-state-in-effect
}, []);

// Sau khi sửa
const [userId, setUserId] = useState(() => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem('user_data');
  if (userData) {
    const user = JSON.parse(userData);
    return user.id;
  }
  return null;
}); // ✅ Lazy initialization
```

**Các file đã sửa:**
- `app/components/ChatContext.tsx`
- `app/components/FloatingContact.js`
- `app/components/MultiStepBooking.js`
- `app/customer/bookings/page.js`
- `app/customer/me/page.js`
- `app/customer/profile/page.js`

### 2.4 Lỗi Database & API

#### Lỗi 8: Release Slot Logic Sai
**Vấn đề:** Khi cleanup expired reservations, không release slots từ departure_schedules vì thiếu scheduleId.

**Cách sửa:**
```typescript
// Trước khi sửa
await this.releaseSlot(
  booking.tour_id,
  null,  // ❌ scheduleId null
  booking.total_passengers ?? 0,
  tx
);

// Sau khi sửa
// Slots được quản lý ở tour level qua max_slots
// Không cần release specific schedule slots
// Tour's max_slots sẽ tự động available cho booking mới
```

#### Lỗi 9: API Route Structure Sai
**Vấn đề:** Client component gọi `/admin/users/${userId}` (server component route) thay vì API route.

**Cách sửa:** Tạo API route mới `/api/admin/users/[id]/route.ts` với đầy đủ CRUD operations và authentication.

### 2.5 Lỗi Bảo Mật Khác

#### Lỗi 10: Hardcoded JWT Secret
**Vấn đề:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'viet-travel-seceret';
```
Fallback secret hardcoded trong code - rủi ro bảo mật cao.

**Cách sửa:**
```typescript
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
```

---

## 3. Các Thuật Toán Chính Đã Dùng

### 3.1 Booking State Machine

**Mô tả:** Quản lý lifecycle của booking với các trạng thái và transitions được định nghĩa rõ ràng.

**Thuật toán:**
```typescript
export class BookingStateMachine {
  static transitions: Record<BookingStatus, BookingStatus[]> = {
    [BookingStatus.PENDING]: [BookingStatus.AWAITING_PAYMENT, BookingStatus.CANCELLED],
    [BookingStatus.AWAITING_PAYMENT]: [BookingStatus.DEPOSIT_PAID, BookingStatus.CANCELLED],
    [BookingStatus.DEPOSIT_PAID]: [BookingStatus.CONFIRMED, BookingStatus.CANCELLED],
    [BookingStatus.CONFIRMED]: [BookingStatus.COMPLETED, BookingStatus.CANCELLED],
    [BookingStatus.COMPLETED]: [BookingStatus.REFUNDED],
    [BookingStatus.CANCELLED]: [BookingStatus.REFUNDED],
    [BookingStatus.REFUNDED]: []
  };

  static canTransition(from: BookingStatus, to: BookingStatus): boolean {
    return this.transitions[from]?.includes(to) || false;
  }

  static async transition(
    bookingId: number,
    toStatus: BookingStatus,
    actorId?: number,
    actorType: ActorType = ActorType.SYSTEM,
    notes?: string,
    currentVersion?: number
  ): Promise<{ success: boolean; error?: string; newVersion?: number }> {
    // 1. Check optimistic locking
    if (currentVersion !== undefined && booking.version !== currentVersion) {
      return { success: false, error: 'Booking đã được sửa bởi người khác' };
    }

    // 2. Validate transition
    if (!this.canTransition(booking.status as BookingStatus, toStatus)) {
      return { success: false, error: 'Không thể chuyển trạng thái' };
    }

    // 3. Update with version increment
    const updatedBooking = await prisma.bookings.update({
      where: { id: bookingId },
      data: { 
        status: toStatus,
        version: { increment: 1 }
      }
    });

    // 4. Log the transition
    await prisma.booking_logs.create({
      data: {
        booking_id: bookingId,
        status_from: booking.status,
        status_to: toStatus,
        action: `status_change_${toStatus}`,
        actor_id: actorId,
        actor_type: actorType,
        notes: notes
      }
    });

    return { success: true, newVersion: updatedBooking.version };
  }
}
```

**Ứng dụng:** Đảm bảo booking chỉ chuyển trạng thái theo logic business, tránh invalid states.

### 3.2 Slot Reservation with Atomic Operations

**Mô tả:** Đặt chỗ tour với database-level locking để tránh race conditions.

**Thuật toán:**
```typescript
export class SlotReservationService {
  private static RESERVATION_TIMEOUT = 15 * 60 * 1000; // 15 minutes

  static async reserveSlot(
    tourId: number,
    scheduleId: number | null,
    passengersCount: number,
    accountId: number,
    tx?: any
  ): Promise<{ success: boolean; error?: string }> {
    // 1. Check tour exists and is active
    const tour = await prismaClient.tours.findUnique({
      where: { id: tourId, is_active: true, is_deleted: false },
      select: { max_slots: true }
    });

    if (!tour) {
      return { success: false, error: 'Tour không tồn tại hoặc không hoạt động' };
    }

    // 2. Check schedule availability with row-level locking
    if (scheduleId) {
      const schedule = await prismaClient.departure_schedules.findUnique({
        where: { id: scheduleId, is_active: true }
      });

      if (!schedule) {
        return { success: false, error: 'Lịch khởi hành không tồn tại' };
      }

      if (schedule.available_slots < passengersCount) {
        return { success: false, error: 'Không đủ chỗ trống' };
      }

      // 3. Atomic slot reservation with decrement
      await prismaClient.departure_schedules.update({
        where: { id: scheduleId },
        data: {
          available_slots: {
            decrement: passengersCount
          }
        }
      });
    }

    // 4. Check for duplicate pending bookings (within 15 minutes)
    const existingBooking = await prismaClient.bookings.findFirst({
      where: {
        tour_id: tourId,
        account_id: accountId,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.AWAITING_PAYMENT, BookingStatus.DEPOSIT_PAID]
        },
        created_at: {
          gte: new Date(Date.now() - this.RESERVATION_TIMEOUT)
        }
      }
    });

    if (existingBooking) {
      return { success: false, error: 'Bạn đã có booking đang chờ xử lý cho tour này' };
    }

    return { success: true };
  }
}
```

**Ứng dụng:** Tránh overbooking khi nhiều user đặt tour cùng lúc.

### 3.3 Idempotency Key Pattern

**Mô tả:** Ngăn chặn duplicate booking submissions.

**Thuật toán:**
```javascript
export async function POST(req) {
  const idempotencyKey = req.headers.get('idempotency-key');
  
  // Check if booking with this key already exists
  const existingBooking = await prisma.bookings.findUnique({
    where: { idempotency_key: idempotencyKey }
  });

  if (existingBooking) {
    // Return existing booking instead of creating new one
    return successResponse(existingBooking, 'Booking đã tồn tại');
  }

  // Create new booking with idempotency key
  const booking = await prisma.bookings.create({
    data: {
      ...bookingData,
      idempotency_key: idempotencyKey
    }
  });

  return successResponse(booking, 'Đặt tour thành công');
}
```

**Ứng dụng:** Tránh duplicate booking khi user nhấn submit nhiều lần.

### 3.4 Passenger Validation Algorithm

**Mô tả:** Validate thông tin hành khách với age-based rules.

**Thuật toán:**
```typescript
export class PassengerValidationService {
  static validatePassenger(passenger: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 1. Validate basic fields
    if (!passenger.full_name || passenger.full_name.trim().length < 2) {
      errors.push('Họ tên hành khách phải từ 2 ký tự');
    }

    if (!passenger.birth_date || !Date.parse(passenger.birth_date)) {
      errors.push('Ngày sinh không hợp lệ');
    }

    if (!passenger.gender || !['Nam', 'Nữ', 'Khác'].includes(passenger.gender)) {
      errors.push('Giới tính không hợp lệ (Nam/Nữ/Khác)');
    }

    // 2. Phone validation (required for adults, optional for children)
    if (!passenger.is_child) {
      if (!passenger.phone_number || !/^[0-9]{10,11}$/.test(passenger.phone_number)) {
        errors.push('Người lớn phải có số điện thoại (10-11 số)');
      }
    } else if (passenger.phone_number && !/^[0-9]{10,11}$/.test(passenger.phone_number)) {
      errors.push('Số điện thoại phải từ 10-11 số');
    }

    // 3. Calculate age
    const birthDate = new Date(passenger.birth_date);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }

    // 4. Validate age vs is_child flag
    if (passenger.is_child && age >= 12) {
      errors.push('Hành khách được đánh dấu là trẻ em nhưng tuổi >= 12');
    }

    if (!passenger.is_child && age < 12) {
      errors.push('Hành khách được đánh dấu là người lớn nhưng tuổi < 12');
    }

    return { valid: errors.length === 0, errors };
  }
}
```

**Ứng dụng:** Đảm bảo thông tin hành khách hợp lệ và nhất quán.

### 3.5 Duplicate Booking Detection

**Mô tả:** Kiểm tra xem user đã đặt tour trong khoảng thời gian trùng nhau chưa.

**Thuật toán:**
```typescript
static async checkDuplicateBooking(
  tourId: number,
  accountId: number,
  startDate: Date,
  endDate: Date
): Promise<boolean> {
  const existingBooking = await prisma.bookings.findFirst({
    where: {
      tour_id: tourId,
      account_id: accountId,
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.REFUNDED]
      },
      OR: [
        // Case 1: New booking starts during existing booking
        {
          AND: [
            { start_date: { lte: startDate } },
            { end_date: { gte: startDate } }
          ]
        },
        // Case 2: New booking ends during existing booking
        {
          AND: [
            { start_date: { lte: endDate } },
            { end_date: { gte: endDate } }
          ]
        },
        // Case 3: New booking completely contains existing booking
        {
          AND: [
            { start_date: { gte: startDate } },
            { end_date: { lte: endDate } }
          ]
        }
      ]
    }
  });

  return !!existingBooking;
}
```

**Ứng dụng:** Tránh user đặt cùng tour vào các ngày trùng nhau.

### 3.6 Payment Calculation Algorithm

**Mô tả:** Tính toán số tiền deposit và remaining balance.

**Thuật toán:**
```typescript
export class PaymentService {
  static calculateDepositAmount(totalAmount: number, depositPercent: number = 30): number {
    return Math.floor(totalAmount * (depositPercent / 100));
  }

  static async updatePaymentStatus(
    paymentId: number,
    status: PaymentStatus,
    transactionId?: string
  ): Promise<{ success: boolean; error?: string }> {
    const payment = await prisma.booking_payments.findUnique({
      where: { id: paymentId },
      include: { bookings: true }
    });

    if (!payment) {
      return { success: false, error: 'Payment không tồn tại' };
    }

    // Update payment status
    await prisma.booking_payments.update({
      where: { id: paymentId },
      data: {
        payment_status: status,
        ...(transactionId && { transaction_id: transactionId }),
        ...(status === PaymentStatus.COMPLETED && { paid_at: new Date() })
      }
    });

    // Update booking status based on payment
    if (status === PaymentStatus.COMPLETED) {
      let newBookingStatus: BookingStatus;
      
      if (payment.payment_type === PaymentType.DEPOSIT) {
        newBookingStatus = BookingStatus.DEPOSIT_PAID;
      } else if (payment.payment_type === PaymentType.REMAINING) {
        newBookingStatus = BookingStatus.CONFIRMED;
      } else {
        newBookingStatus = BookingStatus.CONFIRMED;
      }

      await BookingStateMachine.transition(
        payment.booking_id,
        newBookingStatus,
        undefined,
        ActorType.SYSTEM,
        `Payment ${payment.payment_type} completed`
      );

      // Update booking paid amount
      const currentPaid = payment.bookings.paid_amount || BigInt(0);
      await prisma.bookings.update({
        where: { id: payment.booking_id },
        data: {
          paid_amount: currentPaid + payment.amount,
          is_confirmed: newBookingStatus === BookingStatus.CONFIRMED
        }
      });
    }

    return { success: true };
  }
}
```

**Ứng dụng:** Tự động cập nhật trạng thái booking khi thanh toán thành công.

### 3.7 Cache Invalidation Strategy

**Mô tả:** Quản lý cache để tối ưu performance.

**Thuật toán:**
```typescript
import { cache } from '@/lib/cache';

// Invalidate cache after booking creation
await prisma.bookings.create({
  data: bookingData
});

cache.invalidate('tours');
cache.invalidate('bookings');
cache.invalidate(`booking_${bookingId}`);
```

**Ứng dụng:** Đảm bảo data consistency sau khi CRUD operations.

---

## 4. Tổng Kết

Dự án Travel Website là một hệ thống đặt tour du lịch hoàn chỉnh với:
- **Architecture:** Next.js App Router với separation of concerns rõ ràng
- **Security:** JWT authentication, role-based access control, API route protection
- **Data Integrity:** State machine, atomic operations, optimistic locking
- **User Experience:** Multi-step booking, real-time validation, error handling
- **Scalability:** Prisma ORM, caching strategy, idempotency pattern

Các thuật toán chính được implement đảm bảo:
- Không overbooking (slot reservation)
- Không duplicate booking (idempotency key)
- Trạng thái booking nhất quán (state machine)
- Data validation chặt chẽ (Zod schemas)
- Performance tối ưu (caching, database indexing)

Dự án đã qua nhiều vòng review và fix bug, hiện tại đã đạt được mức độ ổn định cao và sẵn sàng cho production deployment.
