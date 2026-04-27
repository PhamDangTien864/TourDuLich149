import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const user = await prisma.accounts.findFirst({
      where: { 
        id: userId,
        is_deleted: false 
      },
      select: {
        id: true,
        full_name: true,
        phone_number: true,
        email: true,
        birth_date: true,
        username: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Also get customer details if exists
    const customer = await prisma.customers.findFirst({
      where: { 
        phone_number: user.phone_number,
        is_deleted: false 
      }
    });

    return NextResponse.json({
      ...user,
      identity_card: customer?.identity_card || '',
      address: customer?.address || ''
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);
    const body = await request.json();
    
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Update accounts table
    const updatedAccount = await prisma.accounts.update({
      where: { id: userId },
      data: {
        full_name: body.full_name,
        phone_number: body.phone_number,
        email: body.email,
        birth_date: body.birth_date ? new Date(body.birth_date) : undefined
      }
    });

    // Update or create customer record
    const existingCustomer = await prisma.customers.findFirst({
      where: { phone_number: body.phone_number, is_deleted: false }
    });

    if (existingCustomer) {
      await prisma.customers.update({
        where: { id: existingCustomer.id },
        data: {
          full_name: body.full_name,
          phone_number: body.phone_number,
          email: body.email,
          birth_date: body.birth_date ? new Date(body.birth_date) : undefined,
          identity_card: body.identity_card,
          address: body.address
        }
      });
    } else {
      await prisma.customers.create({
        data: {
          full_name: body.full_name,
          phone_number: body.phone_number,
          email: body.email,
          birth_date: body.birth_date ? new Date(body.birth_date) : undefined,
          identity_card: body.identity_card || null,
          address: body.address,
          is_male: true,
          is_deleted: false
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = parseInt(id);

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    // Soft delete customer
    await prisma.customers.update({
      where: { id: userId },
      data: { is_deleted: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
