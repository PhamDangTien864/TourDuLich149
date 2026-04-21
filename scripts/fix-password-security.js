import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Hash password function (copied from lib/auth.ts)
async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

async function fixPasswordSecurity() {
  try {
    console.log('🔒 Fixing password security...');
    
    // Get all users with plain text passwords
    const users = await prisma.accounts.findMany({
      where: {
        is_deleted: false
      },
      select: {
        id: true,
        username: true,
        password: true
      }
    });

    console.log(`Found ${users.length} users to update...`);

    for (const user of users) {
      // Check if password is already hashed (bcrypt hashes start with $2b$)
      if (!user.password.startsWith('$2b$')) {
        console.log(`Updating password for user: ${user.username}`);
        
        // Hash plain text password
        const hashedPassword = await hashPassword(user.password);
        
        // Update user with hashed password
        await prisma.accounts.update({
          where: { id: user.id },
          data: { password: hashedPassword }
        });
        
        console.log(`✅ Updated password for ${user.username}`);
      } else {
        console.log(`⚠️  Password already hashed for ${user.username}`);
      }
    }

    console.log('✅ Password security fix completed!');
    console.log('📋 Test credentials:');
    console.log('   Username: admin, Password: admin123');
    console.log('   Username: huyen, Password: huyen123');
    
  } catch (error) {
    console.error('❌ Error fixing passwords:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixPasswordSecurity();
