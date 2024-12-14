import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { validateAccessToken } from '@/utils/auth/validateAccessToken';

export async function PUT(request: NextRequest) {
  try {
    const { error: validateError, user } = await validateAccessToken(request, supabaseServer);

    if (validateError) {
      return NextResponse.json({ validateError }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
    }

    const userId = user.id

    // Parse the request body
    const { checklistId, itemId, completed, id } = await request.json();
    // Validate required fields
    if (!checklistId || !itemId || !id) {
      return NextResponse.json({ success: false, error: 'Checklist ID and Item ID are required.' }, { status: 400 });
    }

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
      .eq('id', id) // Use 'item_id' if that's the correct column
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
