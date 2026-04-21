import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Simple test response
    return NextResponse.json({ 
      success: true, 
      message: "Login test API working!",
      received: body 
    });
    
  } catch (error: unknown) {
    console.error("LOGIN_TEST_ERROR:", error);
    return NextResponse.json({ error: "Test API error" }, { status: 500 });
  }
}
