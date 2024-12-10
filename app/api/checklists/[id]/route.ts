import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';
import { Item } from '@/types/projectTypes';

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

  // Ensure the body contains an array of items
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ error: 'Items array is required and cannot be empty' }, { status: 400 });
  }

  const items = body.items; // Array of { item_id, quantity, completed }

  // Validate each item in the array
  for (const item of items) {
    if (!item.item_id || typeof item.quantity !== 'number' || typeof item.completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Each item must have item_id, quantity (number), and completed (boolean)' },
        { status: 400 }
      );
    }
  }

  try {
    // Insert multiple items into the checklist_items table
    const expandedItems = items.flatMap((item: Item) =>
      Array.from({ length: item.quantity }).map(() => ({
        checklist_id: checklistId,
        item_id: item.item_id,
        completed: item.completed,
        quantity: 1, // Each row represents one unit
      }))
    );
    console.log("About to add ---->", expandedItems)

    // Insert all expanded rows into the checklist_items table
    const { data: insertedData, error: insertError } = await supabaseServer
      .from('checklist_items')
      .insert(expandedItems)
      .select('id, checklist_id, item_id, completed, quantity, items(*)');

    if (insertError) {
      console.error("Error adding items to checklist:", insertError);
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }

    // Return all inserted rows with details
    return NextResponse.json(insertedData, { status: 201 });
  } catch (error) {
    console.error("Unexpected error adding items:", error);
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
