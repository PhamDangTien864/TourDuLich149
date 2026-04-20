import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await hashPassword('Admin12345');
  const customerPassword = await hashPassword('Customer123');

  // 1. Tạo roles trước
  await prisma.roles.upsert({
    where: { role_name: 'admin' },
    update: {},
    create: {
      role_name: 'admin',
      description: 'Quản trị viên toàn quyền'
    }
  });

  await prisma.roles.upsert({
    where: { role_name: 'customer' },
    update: {},
    create: {
      role_name: 'customer',
      description: 'Khách hàng'
    }
  });

  // 2. Tạo tài khoản Admin (role_id = 1)
  await prisma.accounts.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@viettravel.vn',
      password: adminPassword,
      full_name: 'Quán trá viên',
      phone_number: '0862640720',
      birth_date: new Date('2004-01-01'),
      role_id: 1, // 1 là Admin
      is_verified: true, // QUAN TRONG: Phai co true de login duoc
      is_deleted: false
    }
  });

  // 3. Tạo customer account mẫu (role_id = 2)
  await prisma.accounts.upsert({
    where: { username: 'customer' },
    update: {},
    create: {
      username: 'customer',
      email: 'customer@viettravel.vn',
      password: customerPassword,
      full_name: 'Khách hàng mẫu',
      phone_number: '0862640721',
      birth_date: new Date('2004-01-01'),
      role_id: 2, // 2 là Customer
      is_verified: true,
      is_deleted: false
    }
  });

  console.log("✅ Đã tạo tài khoản Admin: admin / Admin12345");
  console.log("✅ Đã tạo tài khoản Customer: customer / Customer123");
  console.log("✅ Đã tạo roles: admin, customer");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());