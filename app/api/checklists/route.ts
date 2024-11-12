import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supbaseClient';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Fetch checklists for the user
    const { data: checklists, error: checklistError } = await supabase
      .from('checklists')
      .select('*')
      .eq('user_id', userId);

    console.log("checklists", checklists);
    if (checklistError) {
      return NextResponse.json({ error: checklistError.message }, { status: 500 });
    }

    if (!checklists || checklists.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    // Fetch checklist items and join them with checklists
    const checklistIds = checklists.map((checklist) => checklist.id);
    if (checklistIds.length === 0) {
      return NextResponse.json(checklists, { status: 200 });
    }

    const { data: checklistItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*, items(*)')
      .in('checklist_id', checklistIds);

    console.log("checklist items:", checklistItems);
    if (itemsError) {
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
    console.warn("Checklists error:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
