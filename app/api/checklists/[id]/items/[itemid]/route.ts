import { NextRequest, NextResponse } from 'next/server';
import { validateAccessTokenDI } from '@/utils/auth/validateAccessToken';
import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

/**
 * Checks off a single item in a checklist
 * @param request 
 * @returns 
 */
export async function PUT(request: NextRequest) {
  try {
    const { user, error: validateError } = await validateAccessTokenDI(request, databaseService);

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
    const { data: checklist, error: checklistError } = await databaseService.validateChecklistOwnership(checklistId, userId)

    if (checklistError || !checklist) {
      return NextResponse.json(
        { success: false, error: 'Checklist not found or does not belong to the user.' },
        { status: 404 }
      );
    }

    // Update the "completed" status of the item
    const { data: updatedItem, error: itemError } = await databaseService.updateCompletedChecklistItem(completed, id, checklistId)


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
