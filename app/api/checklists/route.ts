import { NextRequest, NextResponse } from 'next/server';
import { validateAccessTokenDI } from '@/utils/auth/validateAccessToken';
import { DatabaseService } from '@/di/services/databaseService';
import serviceContainer from '@/di/containers/serviceContainer';

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

export async function GET(req: NextRequest) {
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

  try {
    // Fetch checklists for the user
    const checklists = await databaseService.fetchChecklists({ user_id: userId });

    if (!checklists || checklists.length === 0) {
      console.log("No checklists found for user.");
      return NextResponse.json([], { status: 200 });
    }

    // Fetch checklist items and join them with checklists
    const checklistIds = checklists.map((checklist) => checklist.id);
    if (checklistIds.length === 0) {
      return NextResponse.json(checklists, { status: 200 });
    }

    const checklistItems = await databaseService.fetchChecklistItemsByChecklistIds(checklistIds);

    // Map checklist items to their corresponding checklists and calculate completion
    const checklistsWithItems = checklists.map((checklist) => {
      const itemsForChecklist = checklistItems.filter((item) => item.checklist_id === checklist.id);

      // Calculate completed and total items
      const totalItems = itemsForChecklist.length;
      const completedItems = itemsForChecklist.filter((item) => item.completed).length;

      return {
        ...checklist,
        items: itemsForChecklist,
        completion: {
          completed: completedItems,
          total: totalItems,
        },
      };
    });

    return NextResponse.json(checklistsWithItems, { status: 200 });
  } catch (error) {
    console.warn("Checklists error:", error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }

}

export async function POST(req: NextRequest) {
  interface ItemInput {
    id: string;
    quantity: number;
  }

  interface InventoryItem {
    id: string;
    name: string;
    notes?: string;
    weight?: number;
    user_id: string;
    quantity: number;
    category_id?: string;
    item_categories?: {
      name: string;
    };
  }

  interface ChecklistItem {
    checklist_id: string;
    item_id: string;
    completed: boolean;
    items: InventoryItem;
  }
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  const body = await req.json();
  const { title, category, items }: { userId: string; title: string; category: string; items: ItemInput[] } = body;

  if (!userId || !title || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Create a new checklist
    const newChecklist = await databaseService.createChecklist({ title, category, user_id: userId });

    let inventoryItems: InventoryItem[] = [];
    let expandedChecklistItems: ChecklistItem[] = [];

    if (items && items.length > 0) {
      // Fetch user's inventory in one query
      const itemIds = items.map((item: ItemInput) => item.id);
      inventoryItems = await databaseService.fetchInventoryItemsByIds(userId, itemIds);

      if (!inventoryItems || inventoryItems.length === 0) {
        return NextResponse.json(
          { error: "No items found in user inventory" },
          { status: 400 }
        );
      }

      // inventoryItems = inventoryData;

      // Map inventory items by ID for quick lookup
      const inventoryMap = new Map<string, InventoryItem>(
        inventoryItems.map((item: InventoryItem) => [item.id, item])
      );

      // Expand the items array based on the quantity
      expandedChecklistItems = items.flatMap(({ id: itemId, quantity }: ItemInput) => {
        const inventoryItem = inventoryMap.get(itemId);
        if (!inventoryItem) {
          throw new Error(`Item ${itemId} not found in inventory`);
        }

        if (quantity > inventoryItem.quantity) {
          throw new Error(`Insufficient quantity for item ${itemId}`);
        }

        return Array.from({ length: quantity }, () => ({
          checklist_id: newChecklist.id,
          item_id: itemId,
          completed: false,
          items: inventoryItem,
        }));
      });

      // Batch insert checklist items
      const insertedItems = await databaseService.insertChecklistItems(
        expandedChecklistItems.map(({ checklist_id, item_id, completed }) => ({
          checklist_id,
          item_id,
          completed,
        }))
      );

      // Map the inserted IDs back to the expandedChecklistItems
      if (insertedItems) {
        expandedChecklistItems = insertedItems.map((insertedItem) => {
          const matchingItem = expandedChecklistItems.find(
            (item) =>
              item.checklist_id === insertedItem.checklist_id &&
              item.item_id === insertedItem.item_id
          );

          if (!matchingItem) {
            throw new Error(
              `Inserted item does not match any existing item: ${insertedItem.id}`
            );
          }

          return {
            ...matchingItem,
            id: insertedItem.id, // Assign the ID from the `checklist_items` table
            checklist_id: insertedItem.checklist_id, // Ensure checklist_id is assigned correctly
            item_id: insertedItem.item_id, // Ensure item_id is assigned correctly
          };
        });
      }

    }

    // Calculate completion stats
    const totalItems = expandedChecklistItems.length;
    const totalWeight = expandedChecklistItems.reduce(
      (sum, item) => sum + (item.items.weight || 0),
      0
    );

    const checklistWithItems = {
      ...newChecklist,
      items: expandedChecklistItems,
      completion: {
        completed: 0,
        total: totalItems,
        totalWeight,
        currentWeight: 0, // No items are completed initially
      },
    };

    return NextResponse.json(checklistWithItems, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist:", error);
    return NextResponse.json({ error: "Failed to create checklist" }, { status: 500 });
  }
}
