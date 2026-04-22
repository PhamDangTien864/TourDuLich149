# 🚀 VietTravel Luxury - Travel Booking Website

A modern travel booking website built with Next.js, featuring tour management, booking system, and user authentication.

## 📋 Features

- **Tour Management**: Browse, search, and book tours
- **User Authentication**: Secure login/register with JWT
- **Booking System**: Complete booking flow with payment integration
- **Review System**: User reviews and ratings for tours
- **Admin Panel**: Manage tours, users, and bookings
- **Location Data**: Vietnamese administrative divisions (34 provinces, 696 districts, 3321 wards)
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS

## 🔧 System Requirements

- Node.js 18+
- MySQL 8.0+
- Git

## 🚀 Getting Started

### Step 1: Install Dependencies

```bash
cd travel-website
npm install
```

### Step 2: Configure Database

#### 2.1 Create Database

```sql
CREATE DATABASE travel_booking_db;
```

Or use the provided SQL file:

```bash
mysql -u root -p < viettravel.sql
```

#### 2.2 Environment Variables

Create a `.env` file in the project root:

```env
# Database
DATABASE_URL="mysql://username:password@localhost:3306/travel_booking_db"

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

**Note**: Replace `username:password` with your MySQL credentials.

### Step 3: Generate Prisma Client

```bash
npm run db:generate
```

### Step 4: Push Database Schema

```bash
npm run db:push
```

### Step 5: Seed Data (Optional)

```bash
node scripts/quick-seed.js
```

### Step 6: Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛠️ Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Start production server
npm run lint         # Run ESLint

# Database
npm run db:generate  # Generate Prisma client
npm run db:push      # Push schema to database
npm run db:migrate   # Run database migrations
npm run seed         # Seed database with sample data
```

## 📁 Project Structure

```
travel-website/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin panel
│   ├── api/               # API routes
│   ├── components/        # React components
│   ├── customer/          # Customer pages
│   └── globals.css        # Global styles
├── lib/                   # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── cache.ts          # Caching system
│   ├── logger.ts         # Logging system
│   ├── middleware.ts     # Next.js middleware
│   └── prisma.ts         # Prisma client
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seed
├── public/               # Static files
├── scripts/              # Utility scripts
└── types/                # TypeScript definitions
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/verify` - Email verification

### Tours
- `GET /api/tours` - List all tours (with pagination)
- `POST /api/tours` - Create new tour (admin)
- `GET /api/tours/[id]` - Get tour details
- `PATCH /api/tours/[id]` - Update tour (admin)
- `DELETE /api/tours/[id]` - Delete tour (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - List bookings (admin)
- `POST /api/bookings/confirms` - Confirm booking

### Reviews
- `GET /api/reviews` - Get tour reviews
- `POST /api/reviews` - Submit review

### Users
- `GET /api/users` - List users (admin)
- `GET /api/customers/[id]` - Get customer profile
- `PATCH /api/customers/[id]` - Update customer profile
- `POST /api/customers/change-password` - Change password

## 🎨 Frontend Pages

### Public
- `/` - Home page
- `/tour/[id]` - Tour details
- `/search` - Search tours
- `/booking` - Booking page
- `/payment` - Payment page

### Authentication
- `/login` - Login page
- `/register` - Registration page

### Customer
- `/customer/me` - Customer profile
- `/history` - Booking history

### Admin
- `/admin` - Admin dashboard
- `/admin/tours` - Manage tours
- `/admin/users` - Manage users
- `/admin/bookings` - Manage bookings
- `/admin/analytics` - Analytics dashboard

## 🔒 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Authentication**: HTTP-only cookies for session management
- **Input Validation**: Zod schemas for all API inputs
- **Role-Based Access**: Admin and customer roles
- **SQL Injection Prevention**: Prisma ORM with parameterized queries

## ⚡ Performance Optimizations

- **In-Memory Caching**: Reduces database load by ~80%
- **Database Query Optimization**: Proper selects and indexing
- **Pagination**: Efficient data loading for large datasets
- **Image Optimization**: Next.js Image component

## 📊 Logging & Monitoring

- **Structured Logging**: Request tracking and performance monitoring
- **Error Tracking**: Context-aware error logging
- **API Monitoring**: Request/response logging for all endpoints

## 🐛 Troubleshooting

### Prisma Client Not Found
```bash
npm run db:generate
```

### Database Connection Error
- Check MySQL is running
- Verify DATABASE_URL in `.env`
- Ensure database exists

### JWT Errors
- Check JWT_SECRET in `.env`
- Ensure JWT_SECRET is not empty

### TypeScript Errors
- Run `npm run db:generate` to generate types
- Check Prisma schema is up to date

## 🎯 Development Guidelines

### Logging
```typescript
import { logger } from '@/lib/logger';

logger.info('User action', { userId, action }, userId, requestId);
logger.error('API Error', { error, endpoint }, userId, requestId);
```

### Caching
```typescript
import { cache, CACHE_KEYS } from '@/lib/cache';

const cached = cache.get(CACHE_KEYS.TOURS);
cache.set(CACHE_KEYS.TOURS, data, 5 * 60 * 1000);
cache.invalidatePattern(CACHE_KEYS.TOURS);
```

### Error Handling
```typescript
try {
  // API logic
} catch (error) {
  logger.apiError('POST', '/api/endpoint', error, userId);
  return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
}
```

## 📦 Dependencies

- **Next.js** 16.2.1 - React framework
- **Prisma** 6.1.0 - Database ORM
- **TypeScript** 5 - Type safety
- **Tailwind CSS** 4.2.2 - Styling
- **Zod** 4.3.6 - Validation
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication

## 🚀 Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 📝 License

This project is private and proprietary.

## 🆘 Support

For issues or questions:
1. Check terminal output
2. Check browser console
3. Verify environment variables
4. Review database connection

**Built with ❤️ using Next.js and Prisma**
