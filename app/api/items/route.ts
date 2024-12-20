import { NextRequest, NextResponse } from 'next/server';
import { validateAccessToken } from '@/utils/auth/validateAccessToken';
import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';
import { User } from '@supabase/supabase-js';

const databaseService = serviceContainer.resolve<DatabaseService>('supabaseService');

// GET: Fetch all items for the user
export async function GET(req: NextRequest) {
  // Resolve the SupabaseService from the container

  // Use its `supabase` client in validateAccessToken
  const { user, error }: { user: User | null; error: string | null } = await validateAccessToken(req, databaseService.databaseClient);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
  }

  const referrer = req.headers.get('referer'); // Log the referrer for debugging
  const userId = user.id;

  try {
    // Resolve the SupabaseService instance from the container
    const supabaseService = serviceContainer.resolve<DatabaseService>('supabaseService');

    // Use the service to fetch items
    const items = await supabaseService.fetchItems({ user_id: userId });

    if (!items || items.length === 0) {
      console.log('No items found for user ID:', userId, 'Referrer:', referrer);
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(items, { status: 200 });
  } catch (error) {
    console.error('Unexpected error fetching items:', error, 'Referrer:', referrer);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST: Add a new item for the user
export async function POST(req: NextRequest) {
  // Validate the access token
  const { user, error } = await validateAccessToken(req, databaseService.databaseClient);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id;

  try {
    const { name, quantity, weight, notes, category_id, new_category_name } = await req.json();

    // Validate required fields
    if (!name || quantity === undefined || weight === undefined) {
      return NextResponse.json(
        { error: 'Name, quantity, and weight are required fields.' },
        { status: 400 }
      );
    }

    let newItem;
    if (new_category_name && !category_id) {
      // User wants to create a new category and item
      newItem = await databaseService.createItemWithCategory(
        userId,
        { name, quantity, weight, notes: notes || null },
        new_category_name
      );
    } else {
      // Validate category if provided
      let validCategory = true;
      if (category_id) {
        try {
          await databaseService.fetchCategoryById(category_id);
        } catch {
          validCategory = false;
        }
      }

      if (!validCategory) {
        return NextResponse.json(
          { error: 'Invalid category_id provided.' },
          { status: 400 }
        );
      }

      // Create item with existing category or no category
      newItem = await databaseService.createItem({
        user_id: userId,
        name,
        quantity,
        weight,
        notes: notes || null,
        category_id: category_id || null,
      });
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating item:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
