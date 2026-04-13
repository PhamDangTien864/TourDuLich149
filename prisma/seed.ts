import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await hashPassword('admin123');

  // FIX: Dùng đúng tên cột 'role' thay vì 'role_id'
  await prisma.accounts.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@viettravel.vn',
      password: hashedPassword,
      full_name: 'Quản trị viên',
      phone_number: '0862640720',
      birth_date: new Date('2004-01-01'),
      role: 1, // 1 là Admin
      is_verified: true, // QUAN TRONG: Phai co true de login duoc
      is_deleted: false
    }
  });

  console.log("✅ Đã tạo tài khoản Admin: admin / admin123");
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());