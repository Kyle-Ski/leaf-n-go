import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  const referrer = req.headers.get('referer'); // Log the referrer for debugging

  if (!userId) {
    console.error('Missing x-user-id header. Referrer:', referrer);
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Fetch items belonging to the user
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
