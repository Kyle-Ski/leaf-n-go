import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const checklistId = await params.id;
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
    // Fetch the checklist with its items for the user
    const { data: checklist, error: checklistError } = await supabaseServer
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
    const { data: checklistItems, error: itemsError } = await supabaseServer
      .from('checklist_items')
      // Include items along with their associated category name
      .select('*, items(*, item_categories(name))')
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

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const checklistId = await params.id;
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    console.error("Missing x-user-id header in request.");
    return NextResponse.json({ error: 'User ID is required in the x-user-id header' }, { status: 400 });
  }

  const body = await req.json();
  const { item_id, quantity, completed } = body;

  if (!item_id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  try {
    // Insert the item into the checklist_items table
    const { data: insertedData, error: insertError } = await supabaseServer
      .from('checklist_items')
      .insert({ checklist_id: checklistId, item_id, quantity, completed })
      .select('id, checklist_id, item_id, completed, quantity, items(*)')
      .single();

    if (insertError) {
      console.error("Error adding item to checklist:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Return the full inserted item with details
    return NextResponse.json(insertedData, { status: 201 });
  } catch (error) {
    console.error("Unexpected error adding item:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const checklistId = await params.id; // No need for `await` here
  const userId = req.headers.get('x-user-id');
  const { item_id } = await req.json();

  if (!userId) {
    console.error("Missing x-user-id header in request.");
    return NextResponse.json({ error: 'User ID is required in the x-user-id header' }, { status: 400 });
  }

  if (!item_id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  try {
    const { error } = await supabaseServer
      .from('checklist_items')
      .delete()
      .eq('checklist_id', checklistId)
      .eq('id', item_id);

    if (error) {
      console.error("Error removing item from checklist:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error removing item:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
