import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supbaseClient';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const checklistId = (await params).id;
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    console.error("Missing x-user-id header in request.");
    return NextResponse.json({ error: 'User ID is required in the x-user-id header' }, { status: 400 });
  }

  if (!checklistId) {
    console.error("Missing checklist ID in request.");
    return NextResponse.json({ error: 'Checklist ID is required' }, { status: 400 });
  }

  try {
    console.log("Fetching checklist for checklist ID:", checklistId, "and user ID:", userId);

    // Fetch the checklist with its items for the user
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .select('*')
      .eq('id', checklistId)
      .eq('user_id', userId)
      .single();

    if (checklistError) {
      if (checklistError.code === 'PGRST116') {
        console.error("Permission denied error fetching checklist:", checklistError);
        return NextResponse.json({ error: 'Permission denied. You do not have access to this checklist.' }, { status: 403 });
      }
      console.error("Error fetching checklist:", checklistError);
      return NextResponse.json({ error: checklistError.message }, { status: 500 });
    }

    if (!checklist) {
      console.warn("Checklist not found for checklist ID:", checklistId);
      return NextResponse.json({ error: 'Checklist not found' }, { status: 404 });
    }

    // Fetch the checklist items for the specific checklist
    const { data: checklistItems, error: itemsError } = await supabase
      .from('checklist_items')
      .select('*, items(*)')
      .eq('checklist_id', checklistId);

    if (itemsError) {
      if (itemsError.code === 'PGRST116') {
        console.error("Permission denied error fetching checklist items:", itemsError);
        return NextResponse.json({ error: 'Permission denied. You do not have access to these checklist items.' }, { status: 403 });
      }
      console.error("Error fetching checklist items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Combine checklist with its items
    const checklistWithItems = {
      ...checklist,
      items: checklistItems || [],
    };

    return NextResponse.json(checklistWithItems, { status: 200 });
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Checklist fetching error:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
