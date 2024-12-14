import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { Item } from '@/types/projectTypes';
import { validateAccessTokenDI } from '@/utils/auth/validateAccessToken';
import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const checklistId = await params.id;
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id


  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  if (!checklistId) {
    console.error("Missing checklist ID in request.");
    return NextResponse.json({ error: 'Checklist ID is required' }, { status: 400 });
  }

  try {
    // Fetch the checklist with its items for the user
    const checklist = await databaseService.getChecklistByIdForUser(checklistId, userId);

    if (!checklist) {
      console.warn("Checklist not found or permission denied for checklist ID:", checklistId);
      return NextResponse.json({ error: 'Checklist not found or permission denied.' }, { status: 404 });
    }

    // Fetch the checklist items for the specific checklist
    const checklistItems = await databaseService.getChecklistItemsWithDetails(checklistId);

    if (!checklistItems) {
      console.warn("Checklist items not found for checklist ID:", checklistId);
      return NextResponse.json({ error: 'Checklist items not found.' }, { status: 404 });
    }

    // Combine checklist with its items
    const checklistWithItems = {
      ...checklist,
      items: checklistItems,
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
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
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
    // Expand items based on quantity
    const expandedItems = items.flatMap((item: Item) =>
      Array.from({ length: item.quantity }).map(() => ({
        checklist_id: checklistId,
        item_id: item.item_id,
        completed: item.completed,
        quantity: 1, // Each row represents one unit
      }))
    );

    // Insert all expanded rows into the checklist_items table
    const insertedData = await databaseService.insertChecklistItemsAndReturn(expandedItems);

    if (!insertedData) {
      console.error("Error adding items to checklist.");
      return NextResponse.json({ error: 'Failed to add items to checklist' }, { status: 500 });
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
  const checklistId = await params.id;
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  const { item_id } = await req.json();

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  if (!item_id) {
    return NextResponse.json({ error: 'Item ID is required' }, { status: 400 });
  }

  try {
    await databaseService.deleteChecklistItemsByChecklistId(checklistId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error removing item:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
