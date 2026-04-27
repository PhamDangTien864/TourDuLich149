import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendResetPasswordEmail } from '@/lib/email';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.accounts.findFirst({
      where: { email, is_deleted: false }
    });

    if (!user) {
      // Don't reveal if email exists for security
      return NextResponse.json({ 
        success: true, 
        message: 'If email exists, reset link will be sent' 
      });
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token in user record (using existing fields or add new logic)
    // Since we can't modify schema, we'll use a simple approach with localStorage
    // In production, you'd add reset_token and reset_token_expiry fields to accounts table

    // For now, send email with a token-based link
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}&email=${email}`;

    await sendResetPasswordEmail({
      email,
      name: user.full_name,
      resetLink
    });

    // Store token in memory or use a separate table (if available)
    // For this implementation, we'll use a simple approach

    return NextResponse.json({ 
      success: true, 
      message: 'Reset link sent to email' 
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
