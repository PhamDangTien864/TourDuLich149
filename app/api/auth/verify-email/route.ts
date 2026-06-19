import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Missing user id' }, { status: 400 });
    }

    // Find user by id
    const user = await prisma.accounts.findFirst({
      where: { id: parseInt(id), is_deleted: false }
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

    // CRITICAL SECURITY BUG: Token is not verified against stored value
    // Anyone who knows the email can verify any user's account with any token
    // TODO: Add verification_token and verification_token_expiry fields to accounts table
    // Store token in register route and verify it here before marking as verified
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