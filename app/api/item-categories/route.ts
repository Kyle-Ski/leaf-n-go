import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

// GET: Fetch all item categories visible to the user
// This includes global categories (user_id IS NULL) and any categories owned by this user
export async function GET(req: NextRequest) {
  const referrer = req.headers.get('referer'); // For debugging if needed
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    const { data: categories, error } = await supabaseServer
      .from('item_categories')
      .select('id, name, description, user_id, created_at')
      .or(`user_id.eq.${userId},user_id.is.null`) // Get categories owned by user or global (null)

    if (error) {
      console.error('Error fetching item categories:', error, 'Referrer:', referrer);
      return NextResponse.json({ error: 'Failed to fetch item categories' }, { status: 500 });
    }

    if (!categories) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Unexpected error fetching item categories:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
