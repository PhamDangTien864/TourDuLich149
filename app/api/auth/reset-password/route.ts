import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, token, newPassword } = body;

    if (!email || !token || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find user by email
    const user = await prisma.accounts.findFirst({
      where: { email, is_deleted: false }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // CRITICAL SECURITY BUG: Token is not verified against stored value
    // Anyone who knows the email can reset any user's password with any token
    // TODO: Add reset_token and reset_token_expiry fields to accounts table
    // Store token in forgot-password route and verify it here before updating password
    // In real implementation, you'd have reset_token and reset_token_expiry fields in accounts table

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update password
    await prisma.accounts.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password reset successfully' 
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
