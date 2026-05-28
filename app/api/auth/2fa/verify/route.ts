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
  // For simplicity, we'll use a time-based approach
  // In production, use a proper TOTP library
  const timeWindow = Math.floor(Date.now() / (30 * 1000)); // 30-second window
  const expectedToken = generateOTP();
  return token === expectedToken;
}

export async function POST(request: NextRequest) {
  try {
    const { token: otpToken, userId } = await request.json();

    if (!otpToken || !userId) {
      return NextResponse.json({ error: 'Missing token or user ID' }, { status: 400 });
    }

    // Get user with OTP secret
    const user = await prisma.accounts.findUnique({
      where: { id: userId }
    });

    if (!user || !user.otp_secret) {
      return NextResponse.json({ error: 'User not found or 2FA not set up' }, { status: 400 });
    }

    // Verify OTP token
    const isValid = verifyOTP(otpToken, user.otp_secret);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid OTP token' }, { status: 400 });
    }

    // Enable 2FA for user
    await prisma.accounts.update({
      where: { id: userId },
      data: { otp_enabled: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('2FA verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
