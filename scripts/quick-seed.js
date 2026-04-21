import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth';

const prisma = new PrismaClient();

async function quickSeed() {
  try {
    console.log('Creating admin user quickly...');
    
    // Hash password
    const hashedPassword = await hashPassword('admin123');
    
    // Create admin user
    const admin = await prisma.accounts.upsert({
      where: { username: 'admin' },
      update: { 
        password: hashedPassword,
        is_deleted: false,
        full_name: 'Admin User',
        phone_number: '0123456789',
        role_id: 1
      },
      create: {
        username: 'admin',
        password: hashedPassword,
        full_name: 'Admin User',
        phone_number: '0123456789',
        birth_date: new Date('1990-01-01'),
        role_id: 1,
        is_deleted: false
      }
    });
    
    console.log('✅ Admin user created successfully!');
    console.log(`Username: admin`);
    console.log(`Password: admin123`);
    console.log(`User ID: ${admin.id}`);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

quickSeed();
