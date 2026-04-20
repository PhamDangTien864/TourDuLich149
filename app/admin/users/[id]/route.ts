import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // SỬA: Đổi thành Promise
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    // Soft delete: set is_deleted = true
    const deletedUser = await prisma.accounts.update({
      where: { id: userId },
      data: { is_deleted: true }
    });

    return NextResponse.json({ 
      success: true, 
      message: "User deleted successfully",
      user: deletedUser 
    });

  } catch (error) {
    console.error("DELETE_USER_ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to delete user" 
    }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } // SỬA: Đổi thành Promise
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
      data: { role: newRole }
    });

    return NextResponse.json({ 
      success: true, 
      message: `User role changed to ${newRole === 1 ? 'Admin' : 'User'}`,
      user: updatedUser 
    });

  } catch (error) {
    console.error("PATCH_USER_ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to update user role" 
    }, { status: 500 });
  }
}