import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // 1. Create basic tour categories (existing table)
  console.log('Creating tour categories...');
  const categories = await Promise.all([
    prisma.tour_categories.upsert({
      where: { id: 1 },
      update: {},
      create: {
        category_name: 'Bien',
        note: 'Cac tour di bien'
      }
    }),
    prisma.tour_categories.upsert({
      where: { id: 2 },
      update: {},
      create: {
        category_name: 'Nui',
        note: 'Cac tour leo nui'
      }
    }),
    prisma.tour_categories.upsert({
      where: { id: 3 },
      update: {},
      create: {
        category_name: 'Thanh pho',
        note: 'Cac tour thanh pho'
      }
    })
  ]);

  // 2. Create sample tours (existing table)
  console.log('Creating sample tours...');
  const tours = await Promise.all([
    prisma.tours.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: 'Tour Da Nang 3N2D',
        location_name: 'Da Nang',
        price: BigInt(2999000),
        category_id: categories[0].id,
        description: 'Tour tham quan Da Nang, Hoi An, My Son trong 3 ngay 2 dem',
        sub_title: 'Bien dep Da Nang',
        is_active: true,
        is_deleted: false
      }
    }),
    prisma.tours.upsert({
      where: { id: 2 },
      update: {},
      create: {
        title: 'Tour Phu Quoc 4N3D',
        location_name: 'Phu Quoc',
        price: BigInt(4999000),
        category_id: categories[0].id,
        description: 'Du lich Phu Quoc dao ngoc trong 4 ngay 3 dem',
        sub_title: 'Dao ngoc Phu Quoc',
        is_active: true,
        is_deleted: false
      }
    }),
    prisma.tours.upsert({
      where: { id: 3 },
      update: {},
      create: {
        title: 'Tour Ha Noi 2N1D',
        location_name: 'Ha Noi',
        price: BigInt(1999000),
        category_id: categories[2].id,
        description: 'Tour tham quan Ha Noi co kin trong 2 ngay 1 dem',
        sub_title: 'Thu do Ha Noi',
        is_active: true,
        is_deleted: false
      }
    })
  ]);

  // 3. Create admin user
  console.log('Creating admin user...');
  const hashedAdminPassword = await hashPassword('admin123');
  
  const adminUser = await prisma.accounts.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@viettravel.vn',
      password: hashedAdminPassword,
      full_name: 'Admin User',
      phone_number: '0123456789',
      birth_date: new Date('1990-01-01'),
      role_id: 1, // Admin role
      is_deleted: false
    }
  });

  console.log('Basic database seeding completed!');
  console.log('Created tours:', tours.map(t => ({ id: t.id, title: t.title, price: t.price })));
  console.log('Admin login: username=admin, password=admin123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
