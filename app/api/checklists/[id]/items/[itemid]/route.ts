import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

export async function PUT(req: NextRequest, context: { params: { id: string; itemid: string } }) {
  const { id: checklistId, itemid: itemId } = context.params;
  const userId = req.headers.get('x-user-id'); // Extract the user ID from the headers

  // Validate user ID
  if (!userId) {
    return NextResponse.json({ success: false, error: 'User ID is required.' }, { status: 400 });
  }

  try {
    const { completed } = await req.json();

    // Validate "completed" field
    if (completed === undefined) {
      return NextResponse.json({ success: false, error: '"completed" field is required.' }, { status: 400 });
    }

    // Validate checklist ownership
    const { data: checklist, error: checklistError } = await supabaseServer
      .from('checklists')
      .select('id')
      .eq('id', checklistId)
      .eq('user_id', userId)
      .single();

    if (checklistError || !checklist) {
      return NextResponse.json(
        { success: false, error: 'Checklist not found or does not belong to the user.' },
        { status: 404 }
      );
    }

    // Update the "completed" status of the item
    const { data: updatedItem, error: itemError } = await supabaseServer
      .from('checklist_items')
      .update({ completed })
      .eq('id', itemId)
      .eq('checklist_id', checklistId)
      .select('*')
      .single();

    if (itemError || !updatedItem) {
      return NextResponse.json(
        { success: false, error: 'Failed to update item status.' },
        { status: 500 }
      );
    }

    // Return the updated item in the response
    return NextResponse.json({ success: true, updatedItem }, { status: 200 });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
