import { NextRequest, NextResponse } from "next/server";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  try {
    // Extract tripId from the route parameters
    const { id: tripId } = await props.params;

    const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

    if (validateError) {
      return NextResponse.json({ validateError }, { status: 401 });
    }

    if (!user) {
      return NextResponse.json({ validateError: "Unauthorized: User not found" }, { status: 401 });
    }

    const userId = user.id;

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Parse the request body
    const { ai_recommendation } = await req.json();
    if (!ai_recommendation) {
      return NextResponse.json({ error: "AI recommendation is required" }, { status: 400 });
    }

    // Validate the trip ownership and update the AI recommendation
    try {
      await databaseService.validateAndUpdateTrip(tripId, userId, { ai_recommendation });
    } catch (error) {
      if (error instanceof Error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }

    return NextResponse.json(
      { message: "AI recommendation updated successfully" },
      { status: 200 }
    );
  } catch (error: unknown) {
    // Handle unknown error types gracefully
    if (error instanceof Error) {
      console.error("Error updating AI recommendation:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    } else {
      console.error("Unexpected error during AI recommendation update:", error);
      return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const checklistId = await params.id;

  // Validate the access token
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id;

  try {
    const { name, quantity, weight, notes, item_categories } = await req.json();

    // Validate required fields
    if (!name || quantity === undefined || weight === undefined || !item_categories) {
      return NextResponse.json(
        { error: 'Name, quantity, weight, and item_categories are required fields.' },
        { status: 400 }
      );
    }

    // Find category ID by name
    let categoryId: string | null = null;

    const category = await databaseService.fetchCategoryByName(item_categories, userId);
    if (category) {
      categoryId = category.id;
    }

    // Add the item to the `items` table
    const newItem = await databaseService.createItem({
      user_id: userId,
      name,
      quantity,
      weight,
      notes: notes || null,
      category_id: categoryId, // Use resolved category ID or null
    });
    console.log("ADDED AI NEW ITEM:", newItem)

    if (!newItem) {
      console.error('Error creating item.');
      return NextResponse.json({ error: 'Failed to create item.' }, { status: 500 });
    }

    // Add the item to the `checklist_items` table
    const checklistItem = {
      checklist_id: checklistId,
      item_id: newItem.id,
      quantity,
      completed: false, // Default value for new items
    };

    const insertedChecklistItem = await databaseService.insertChecklistItemAndReturn(checklistItem);

    if (!insertedChecklistItem) {
      console.error('Error adding item to checklist.');
      return NextResponse.json({ error: 'Failed to add item to checklist.' }, { status: 500 });
    }

    function calculateChecklistCompletion(checklistItems: any[]) {
      const total = checklistItems.length;
      const completed = checklistItems.filter((item) => item.completed).length;

      return {
        total,
        completed,
      };
    }

    // Calculate updated app state structure
    const checklistItems = await databaseService.fetchChecklistItems(checklistId);
    const completion = calculateChecklistCompletion(checklistItems);

    const totalWeight = checklistItems.reduce((sum, item) => sum + item.items.weight * item.quantity, 0);

    // Construct the response to match app state
    const response = {
      checklists: {
        [checklistId]: {
          items: checklistItems,
          completion,
        },
      },
      items: [newItem],
      trips: {
        trip_checklists: {
          checklist_id: checklistId,
          completedItems: completion.completed,
          totalItems: completion.total,
          totalWeight,
        },
      },
    };

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
