import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

// GET: Fetch all items for the user
export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const referrer = req.headers.get('referer'); // Log the referrer for debugging

  if (!userId) {
    console.error('Missing x-user-id header. Referrer:', referrer);
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { data: items, error } = await supabaseServer
      .from('items')
      .select('*')
      .eq('user_id', userId);

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
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    const { name, quantity, weight, notes } = await req.json();

    // Validate required fields
    if (!name || quantity === undefined || weight === undefined) {
      return NextResponse.json(
        { error: 'Name, quantity, and weight are required fields.' },
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
      })
      .select('*')
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
