import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sign } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { provider, accessToken, userInfo } = await request.json();

    if (!provider || !userInfo) {
      return NextResponse.json(
        { error: 'Missing provider or user info' },
        { status: 400 }
      );
    }

    // Validate provider
    if (!['google', 'facebook'].includes(provider)) {
      return NextResponse.json(
        { error: 'Invalid provider' },
        { status: 400 }
      );
    }

    // CRITICAL SECURITY BUG: accessToken is never verified with Google/Facebook
    // Client can send any userInfo (including someone else's email) and system will grant JWT
    // TODO: Implement proper OAuth token verification using libraries like 'next-auth' or 'passport'
    // For Google: Use https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=...
    // For Facebook: Use https://graph.facebook.com/debug_token?input_token=...

    // Check if user exists by email
    let user = await prisma.accounts.findUnique({
      where: { email: userInfo.email }
    });

    if (user) {
      // Update social login info if not already linked
      if (provider === 'google' && !user.google_id) {
        user = await prisma.accounts.update({
          where: { id: user.id },
          data: { google_id: userInfo.id }
        });
      } else if (provider === 'facebook' && !user.facebook_id) {
        user = await prisma.accounts.update({
          where: { id: user.id },
          data: { facebook_id: userInfo.id }
        });
      }
    } else {
      // Create new user
      user = await prisma.accounts.create({
        data: {
          email: userInfo.email,
          full_name: userInfo.name,
          username: userInfo.email.split('@')[0], // Generate username from email
          password: '', // Empty password for social login
          phone_number: '', // Empty string for social login
          google_id: provider === 'google' ? userInfo.id : null,
          facebook_id: provider === 'facebook' ? userInfo.id : null,
          avatar_url: userInfo.picture,
          role_id: 2, // Default to customer role
          is_deleted: false,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
    }

    // Generate JWT token
    const token = sign(
      {
        id: user.id,
        email: user.email,
        role_id: user.role_id
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        avatar_url: user.avatar_url,
        role_id: user.role_id
      }
    });
  } catch (error) {
    console.error('Social login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
