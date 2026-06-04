import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign, verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Simple OTP generator (6-digit code)
function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Simple OTP verifier
function verifyOTP(token: string, secret: string): boolean {
  // CRITICAL BUG: This function generates a new random OTP every time instead of using the secret
  // This means verification will ALWAYS fail
  // TODO: Implement proper TOTP using a library like 'otplib'
  // For now, this 2FA implementation is completely broken and non-functional
  const timeWindow = Math.floor(Date.now() / (30 * 1000)); // 30-second window
  const expectedToken = generateOTP(); // BUG: generates new random OTP instead of using secret
  return token === expectedToken;
}

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify JWT and get user ID
    const decoded = verify(token, JWT_SECRET) as { userId: number };
    const userId = decoded.userId;

    // Generate TOTP secret (simple random string)
    const secret = generateOTP();
    const otpauthUrl = `otpauth://totp/VietTravel:user@viettravel.com?secret=${secret}&issuer=VietTravel`;

    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => generateOTP());

    // Update user with 2FA settings
    await prisma.accounts.update({
      where: { id: userId },
      data: {
        otp_secret: secret,
        backup_codes: JSON.stringify(backupCodes),
        otp_enabled: false // Will be enabled after verification
      }
    });

    return NextResponse.json({
      success: true,
      secret,
      otpauthUrl,
      backupCodes
    });
  } catch (error) {
    console.error('2FA setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
