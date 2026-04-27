import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Fetch user by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const user = await prisma.accounts.findUnique({
      where: { 
        id: userId,
        is_deleted: false 
      }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("GET_USER_ERROR:", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const userId = parseInt(resolvedParams.id);
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }

    const body = await req.json();
    const { full_name, email, phone_number, birth_date, role_id, is_verified } = body;

    // Get current user
    const currentUser = await prisma.accounts.findUnique({
      where: { id: userId }
    });

    if (!currentUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Update user with new data
    const updatedUser = await prisma.accounts.update({
      where: { id: userId },
      data: {
        full_name: full_name || currentUser.full_name,
        email: email || currentUser.email,
        phone_number: phone_number || currentUser.phone_number,
        birth_date: birth_date ? new Date(birth_date) : currentUser.birth_date,
        role_id: role_id !== undefined ? role_id : currentUser.role_id,
        is_verified: is_verified !== undefined ? is_verified : currentUser.is_verified
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: "User updated successfully",
      user: updatedUser 
    });

  } catch (error) {
    console.error("PATCH_USER_ERROR:", error);
    return NextResponse.json({ 
      error: "Failed to update user" 
    }, { status: 500 });
  }
}