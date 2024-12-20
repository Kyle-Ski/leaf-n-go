import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken } from '@/utils/auth/validateAccessToken';
import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';
import { User } from '@supabase/supabase-js';

const databaseService = serviceContainer.resolve<DatabaseService>('supabaseService');

// GET: Fetch all trip categories for the user
export async function GET(req: NextRequest) {
  const { user, error }: { user: User | null; error: string | null } = await validateAccessToken(req, databaseService.databaseClient);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
  }

  try {
    const userId = user.id;
    const { data, error: fetchError } = await databaseService.getTripCategoriesForUser(userId);

    if (fetchError) {
      console.error('Error fetching trip categories:', fetchError);
      return NextResponse.json({ error: 'Error fetching trip categories' }, { status: 500 });
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST: Add a new trip category
export async function POST(req: NextRequest) {
  const { user, error }: { user: User | null; error: string | null } = await validateAccessToken(req, databaseService.databaseClient);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }

    const userId = user.id;
    const { data, error: insertError } = await databaseService.postTripCategory(userId, name, description)

    if (insertError || !data) {
      console.error('Error creating trip category:', insertError);
      return NextResponse.json({ error: 'Error creating trip category' }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// DELETE: Delete a trip category
export async function DELETE(req: NextRequest) {
  const { user, error }: { user: User | null; error: string | null } = await validateAccessToken(req, databaseService.databaseClient);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
  }

  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const userId = user.id;
    const { data, error: deleteError } = await databaseService.deleteTripCategory(userId, id);

    if (deleteError) {
      console.error('Error deleting trip category:', deleteError);
      return NextResponse.json({ error: 'Error deleting trip category' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: 'Trip category not found or not owned by user' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Trip category deleted' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
