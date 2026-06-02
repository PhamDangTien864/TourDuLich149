import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear cookies server-side with all possible attributes
  response.cookies.delete('auth_token');
  response.cookies.delete('user_role');
  
  // Also try to set cookies with expired date
  response.cookies.set('auth_token', '', { 
    expires: new Date(0),
    path: '/',
    maxAge: 0
  });
  response.cookies.set('user_role', '', { 
    expires: new Date(0),
    path: '/',
    maxAge: 0
  });
  
  return response;
}
