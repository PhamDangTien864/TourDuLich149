import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ErrorHandler } from '@/lib/errors';
import { errorResponse } from '@/lib/api-response';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Get current user
    const currentUser = await prisma.accounts.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Toggle role: 1 (Admin) <-> 2 (User)
    const newRole = currentUser.role_id === 1 ? 2 : 1;
    
    const updatedUser = await prisma.accounts.update({
      where: { id: userId },
      data: { role_id: newRole }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User role changed to ${newRole === 1 ? 'Admin' : 'User'}`,
      user: updatedUser 
    });

  } catch (error) {
    const bookingError = ErrorHandler.handle(error);
    ErrorHandler.log(bookingError, 'TOGGLE_ROLE_ERROR');
    return errorResponse(bookingError.message, bookingError.statusCode);
  }
}
