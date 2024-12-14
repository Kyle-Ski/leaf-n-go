import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { validateAccessToken } from '@/utils/auth/validateAccessToken';

// GET: Fetch all items for the user
export async function GET(req: NextRequest) {
  // Validate the access token
  const { user, error } = await validateAccessToken(req, supabaseServer);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
  } 
  
  const referrer = req.headers.get('referer'); // Log the referrer for debugging

  const userId = user.id

  try {
    const { data: items, error } = await supabaseServer
      .from('items')
      .select('*')
      .eq('user_id', userId)
      .select("*, item_categories(name)")

    if (error) {
      console.error('Error fetching items:', error, 'Referrer:', referrer);
      return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }

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
  const { user, error } = await validateAccessToken(req, supabaseServer);

  if (error) {
    return NextResponse.json({ error }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  try {
    const { name, quantity, weight, notes, category_id } = await req.json();

    // Validate required fields
    if (!name || quantity === undefined || weight === undefined) {
      return NextResponse.json(
        { error: 'Name, quantity, and weight are required fields.' },
        { status: 400 }
      );
    }

    // If category_id is provided, optionally validate it exists
    let validCategory = true;
    if (category_id) {
      const { data: categoryData, error: categoryError } = await supabaseServer
        .from('item_categories')
        .select('id')
        .eq('id', category_id)
        .single();

      if (categoryError || !categoryData) {
        validCategory = false;
      }
    }

    if (!validCategory) {
      return NextResponse.json(
        { error: 'Invalid category_id provided.' },
        { status: 400 }
      );
    }

    const { data: newItem, error } = await supabaseServer
      .from('items')
      .insert({
        user_id: userId,
        name,
        quantity,
        weight,
        notes: notes || null,
        category_id: category_id || null
      })
      .select('*, item_categories(name)')
      .single();

    if (error) {
      console.error('Error creating item:', error);
      return NextResponse.json({ error: 'Failed to create item.' }, { status: 500 });
    }

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error('Unexpected error creating item:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}