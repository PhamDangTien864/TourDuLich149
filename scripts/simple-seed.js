import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function simpleSeed() {
  try {
    console.log('🌱 Starting simple seeding...');
    
    // 1. Create admin role first
    console.log('Creating admin role...');
    const adminRole = await prisma.roles.upsert({
      where: { role_name: 'admin' },
      update: {},
      create: {
        role_name: 'admin',
        description: 'Quan tri vien he thong'
      }
    });
    
    // 2. Create admin user
    console.log('Creating admin user...');
    const hashedPassword = await hashPassword('admin123');
    
    const admin = await prisma.accounts.upsert({
      where: { username: 'admin' },
      update: { 
        password: hashedPassword,
        is_deleted: false 
      },
      create: {
        username: 'admin',
        password: hashedPassword,
        full_name: 'Admin User',
        phone_number: '0123456789',
        birth_date: new Date('1990-01-01'),
        role_id: adminRole.id,
        is_deleted: false
      }
    });
    
    // 3. Create a test tour category
    console.log('Creating tour category...');
    await prisma.tour_categories.upsert({
      where: { id: 1 },
      update: {},
      create: {
        category_name: 'Tour Bien',
        note: 'Cac tour dep bien'
      }
    });
    
    // 4. Create a test tour
    console.log('Creating test tour...');
    await prisma.tours.upsert({
      where: { id: 1 },
      update: {},
      create: {
        title: 'Tour Da Nang 3N2D',
        location_name: 'Da Nang',
        price: BigInt('2990000'),
        category_id: 1,
        description: 'Tour khám phá Đà Nẵng trong 3 ngày 2 đêm',
        sub_title: 'Trải nghiệm tuyệt vời',
        is_active: true,
        is_deleted: false
      }
    });
    
    console.log('✅ Seeding completed successfully!');
    console.log('📋 Login credentials:');
    console.log('   Username: admin');
    console.log('   Password: admin123');
    console.log(`🆔 Admin User ID: ${admin.id}`);
    
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

simpleSeed();
