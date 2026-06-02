// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require('@prisma/client');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

async function createAccounts() {
  try {
    console.log('🔄 Creating accounts...');

    // Create roles first if they don't exist
    console.log('🔄 Creating roles...');
    const adminRole = await prisma.roles.upsert({
      where: { role_name: 'admin' },
      update: {},
      create: {
        role_name: 'admin',
        description: 'Quản trị viên toàn quyền'
      }
    });

    const customerRole = await prisma.roles.upsert({
      where: { role_name: 'customer' },
      update: {},
      create: {
        role_name: 'customer',
        description: 'Khách hàng'
      }
    });

    console.log(`✅ Roles created: admin (id: ${adminRole.id}), customer (id: ${customerRole.id})`);

    // Hash passwords
    const adminPassword = await hashPassword('Admin12345');
    const customerPassword = await hashPassword('Kh001abc');

    // Create admin account
    const admin = await prisma.accounts.upsert({
      where: { username: 'admin' },
      update: {
        password: adminPassword,
        full_name: 'Admin User',
        phone_number: '0862640720',
        birth_date: new Date('2004-01-01'),
        role_id: 1,
        is_verified: true,
        is_deleted: false
      },
      create: {
        username: 'admin',
        email: 'admin@viettravel.vn',
        password: adminPassword,
        full_name: 'Admin User',
        phone_number: '0862640720',
        birth_date: new Date('2004-01-01'),
        role_id: 1,
        is_verified: true,
        is_deleted: false
      }
    });

    console.log('✅ Admin account created/updated:');
    console.log('   Username: admin');
    console.log('   Password: Admin12345');
    console.log(`   User ID: ${admin.id}`);

    // Create customer account
    const customer = await prisma.accounts.upsert({
      where: { username: 'khachhang1' },
      update: {
        password: customerPassword,
        full_name: 'Khách hàng 1',
        phone_number: '0862640721',
        birth_date: new Date('2004-01-01'),
        role_id: 2,
        is_verified: true,
        is_deleted: false
      },
      create: {
        username: 'khachhang1',
        email: 'khachhang1@viettravel.vn',
        password: customerPassword,
        full_name: 'Khách hàng 1',
        phone_number: '0862640721',
        birth_date: new Date('2004-01-01'),
        role_id: 2,
        is_verified: true,
        is_deleted: false
      }
    });

    console.log('✅ Customer account created/updated:');
    console.log('   Username: khachhang1');
    console.log('   Password: Kh001abc');
    console.log(`   User ID: ${customer.id}`);

    console.log('\n✅ All accounts created successfully!');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAccounts();
