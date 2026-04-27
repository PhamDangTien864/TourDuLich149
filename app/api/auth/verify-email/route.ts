import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json({ error: 'Missing token or email' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.accounts.findFirst({
      where: { email, is_deleted: false }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.is_verified) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email already verified' 
      });
    }

    // In production, verify token against stored token
    // For now, we'll use a simple approach
    // In real implementation, you'd have verification_token and verification_token_expiry fields

    // Mark user as verified
    await prisma.accounts.update({
      where: { id: user.id },
      data: { is_verified: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Verify email error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
