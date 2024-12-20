import { NextRequest, NextResponse } from 'next/server';
import { ChecklistItem, Item } from '@/types/projectTypes';
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
    await databaseService.removeChecklistItem(checklistId, item_id);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error removing item:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const checklistId = await params.id;

  // Validate access token
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id;

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  if (!checklistId) {
    return NextResponse.json({ error: 'Checklist ID is required' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { title, category, items } = body;

    if (!title || !category || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Missing or invalid fields' }, { status: 400 });
    }

    // Validate checklist ownership
    const { data: checklistData, error: ownershipError } = await databaseService.validateChecklistOwnership(
      checklistId,
      userId
    );

    if (ownershipError || !checklistData) {
      return NextResponse.json({ error: 'You do not own this checklist or it does not exist' }, { status: 403 });
    }

    // Update the checklist's title and category
    const { error: checklistUpdateError } = await databaseService.updateChecklist(title, category, checklistId, userId);

    if (checklistUpdateError) {
      throw new Error('Failed to update checklist');
    }

    // Delete existing checklist items for this checklist
    await databaseService.deleteChecklistItemsByChecklistId(checklistId);

    // Insert updated items into the checklist
    const formattedItems = items.map((item: { item_id: string; quantity: number; completed: boolean }) => ({
      checklist_id: checklistId,
      item_id: item.item_id,
      quantity: item.quantity,
      completed: item.completed || false,
    }));

    const insertedItems = await databaseService.insertChecklistItemsAndReturn(formattedItems);

    // Calculate completion stats
    const total = insertedItems.length;

    const completed = insertedItems.filter((item) => item.completed).length;

    const totalWeight = insertedItems.reduce((sum, item) => {
      // Ensure item.items exists and is either an array or an object
      const itemWeight = Array.isArray(item.items)
        ? item.items.reduce((itemSum: number, subItem: any) => itemSum + (subItem.weight || 0), 0)
        : (0); // Fallback if item.items is a single object

      return sum + itemWeight * item.quantity;
    }, 0);

    const currentWeight = insertedItems
      .filter((item) => item.completed)
      .reduce((sum, item) => {
        // Ensure item.items exists and is either an array or an object
        const itemWeight = Array.isArray(item.items)
          ? item.items.reduce((itemSum: number, subItem: any) => itemSum + (subItem.weight || 0), 0)
          : (0); // Fallback if item.items is a single object

        return sum + itemWeight * item.quantity;
      }, 0);

    const completion = {
      completed,
      total,
      totalWeight,
      currentWeight,
    };

    return NextResponse.json(
      {
        id: checklistId,
        title,
        category,
        user_id: userId,
        created_at: new Date().toISOString(),
        items: insertedItems,
        completion,
      },
      { status: 200 }
    );
  } catch (error) {
    const timestamp = new Date().toISOString();
    console.error(`[${timestamp}] Checklist updating error:`, error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}