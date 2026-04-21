import { execSync } from 'child_process';
import path from 'path';

console.log('Generating Prisma client...');

try {
  // Change to the travel-website directory
  process.chdir(path.join(__dirname, '..'));
  
  // Generate Prisma client
  execSync('npx prisma generate', { stdio: 'inherit' });
  
  console.log('✅ Prisma client generated successfully!');
} catch (error) {
  console.error('❌ Error generating Prisma client:', error.message);
  process.exit(1);
}
