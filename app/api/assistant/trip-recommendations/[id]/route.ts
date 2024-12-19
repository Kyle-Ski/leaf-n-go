import { NextRequest, NextResponse } from "next/server";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";
import { UpdatedAiRecommendedItem } from "@/types/projectTypes";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

/**
 * Adds the ai's recommendations to the trip table for storage and retrieval
 * @param req 
 * @param props 
 * @returns 
 */
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

/**
 * Adds an item that was recommended by the AI to our inventory.
 * If the item doesn't exist, it will create a new category (if needed) 
 * and the item in that category. 
 * If it already exists, it will just add it to the specified checklist.
 */
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

    // Check if the item already exists for the user
    let existingItem = await databaseService.fetchItems({ name, user_id: userId });

    // If the item doesn't exist, create it with category
    if (!existingItem || existingItem.length === 0) {
      const newItem = await databaseService.createItemWithCategory(
        userId,
        { name, quantity, weight, notes: notes || null },
        item_categories // categoryName
      );
      if (!newItem) {
        console.error('Error creating item with category.');
        return NextResponse.json({ error: 'Failed to create item.' }, { status: 500 });
      }
      existingItem = [newItem];
    }

    // Add the item to the `checklist_items` table
    const checklistItem = {
      checklist_id: checklistId,
      item_id: existingItem[0].id,
      quantity,
      completed: false,
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

    // Fetch all checklist items for the given checklist ID
    const allChecklistItems = await databaseService.fetchChecklistItems({ checklist_id: checklistId });
    const completion = calculateChecklistCompletion(allChecklistItems);

    // Calculate total weight
    const totalWeight = allChecklistItems.reduce((sum, item) => sum + (item.items.weight * item.quantity), 0);

    // Construct the response to match app state and explicitly type it
    const response: UpdatedAiRecommendedItem = {
      checklists: {
        [checklistId]: {
          items: allChecklistItems.filter((item) => item.id === insertedChecklistItem.id),
          completion,
        },
      },
      items: existingItem,
      trips: {
        trip_checklists: {
          checklist_id: checklistId,
          completedItems: completion.completed,
          totalItems: completion.total,
          totalWeight,
        },
      },
    };

    // If the item was newly created with a category:
    if (existingItem && existingItem[0] && existingItem[0].category_id && existingItem[0].item_categories) {
      const category = existingItem[0].item_categories; // This should be an ItemCategory object
      const catId = category.id;
    
      response.categories = {
        [catId]: {
          id: category.id,
          name: category.name,
          description: category.description,
          user_id: category.user_id,
          created_at: category.created_at,
        },
      };
    }
 
    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
