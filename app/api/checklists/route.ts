import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    console.log("Fetching checklists for user ID:", userId);

    // Fetch checklists for the user
    const { data: checklists, error: checklistError } = await supabaseServer
      .from('checklists')
      .select('*')
      .eq('user_id', userId);

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
    if (checklistIds.length === 0) {
      return NextResponse.json(checklists, { status: 200 });
    }

    const { data: checklistItems, error: itemsError } = await supabaseServer
      .from('checklist_items')
      .select('*, items(*)')
      .in('checklist_id', checklistIds);

    if (itemsError) {
      console.error("Error fetching checklist items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Map checklist items to their corresponding checklists and calculate completion
    const checklistsWithItems = checklists.map((checklist) => {
      const itemsForChecklist = checklistItems
        ? checklistItems.filter((item) => item.checklist_id === checklist.id)
        : [];

      // Calculate completed and total items
      const totalItems = itemsForChecklist.length;
      const completedItems = itemsForChecklist.filter((item) => item.completed).length;

      return {
        ...checklist,
        items: itemsForChecklist,
        completion: {
          completed: completedItems,
          total: totalItems,
        },
      };
    });

    return NextResponse.json(checklistsWithItems, { status: 200 });
  } catch (error) {
    console.warn("Checklists error:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { userId, title, category, items } = body;

  if (!userId || !title || !category) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    // Create a new checklist
    const { data: newChecklist, error: checklistError } = await supabaseServer
      .from('checklists')
      .insert([{ title, category, user_id: userId }])
      .select()
      .single();

    if (checklistError) {
      throw checklistError;
    }

    // Add items to the checklist (if provided)
    if (items && items.length > 0) {
      const checklistItems = items.map((item: { id: string; quantity: number }) => ({
        checklist_id: newChecklist.id,
        item_id: item.id,
        completed: false,
        quantity: item.quantity,
      }));

      const { error: itemsError } = await supabaseServer
        .from('checklist_items')
        .insert(checklistItems);

      if (itemsError) {
        throw itemsError;
      }
    }

    return NextResponse.json(newChecklist, { status: 201 });
  } catch (error) {
    console.error('Error creating checklist:', error);
    return NextResponse.json({ error: 'Failed to create checklist' }, { status: 500 });
  }
}
