import { NextRequest, NextResponse } from 'next/server';
import { getUserFromSession } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabaseClientFactory';

export async function GET(req: NextRequest) {
  const supabase = getSupabaseClient();
  const userId = await getUserFromSession(req);

  if (!userId) {
    console.error("Unauthorized access attempt.");
    return NextResponse.json({ error: 'Unauthorized access' }, { status: 401 });
  }

  try {
    console.log("Fetching checklists for user ID:", userId);

    // Fetch checklists for the user
    const { data: checklists, error: checklistError } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId);

    console.log("Checklists fetched:", checklists);
    if (checklistError) {
      console.error("Error fetching checklists:", checklistError);
      return NextResponse.json({ error: checklistError.message }, { status: 500 });
    }

    if (!checklists || checklists.length === 0) {
      console.log("No checklists found for user.");
      return NextResponse.json([], { status: 200 });
    }

    // Fetch checklist items and join them with checklists
    const checklistIds = checklists.map((checklist) => checklist.id);
    console.log("Checklist IDs:", checklistIds);
    if (checklistIds.length === 0) {
      return NextResponse.json(checklists, { status: 200 });
    }

    const { data: checklistItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*, items(*)')
      .in('checklist_id', checklistIds);

    console.log("Checklist items fetched:", checklistItems);
    if (itemsError) {
      console.error("Error fetching checklist items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Map checklist items to their corresponding checklists
    const checklistsWithItems = checklists.map((checklist) => {
      return {
        ...checklist,
        items: checklistItems
          ? checklistItems.filter((item) => item.checklist_id === checklist.id)
          : [],
      };
    });

    return NextResponse.json(checklistsWithItems, { status: 200 });
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] Checklists fetching error:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
