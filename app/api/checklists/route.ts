import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    // Fetch checklists for the user
    const { data: checklists, error: checklistError } = await supabaseServer
      .from('checklists')
      .select('*')
      .eq('user_id', userId);

    if (checklistError) {
      console.error("Error fetching checklists:", checklistError);
      return NextResponse.json({ error: checklistError.message }, { status: 500 });
    }

    if (!checklists || checklists.length === 0) {
      console.log("No checklists found for user.");
      return NextResponse.json([], { status: 200 });
    }

    // Fetch checklist items and join them with checklists
    const checklistIds = checklists.map((checklist) => checklist.id);
    if (checklistIds.length === 0) {
      return NextResponse.json(checklists, { status: 200 });
    }

    const { data: checklistItems, error: itemsError } = await supabaseServer
      .from('checklist_items')
      .select('*, items(*)')
      .in('checklist_id', checklistIds);

    if (itemsError) {
      console.error("Error fetching checklist items:", itemsError);
      return NextResponse.json({ error: itemsError.message }, { status: 500 });
    }

    // Map checklist items to their corresponding checklists and calculate completion
    const checklistsWithItems = checklists.map((checklist) => {
      const itemsForChecklist = checklistItems
        ? checklistItems.filter((item) => item.checklist_id === checklist.id)
        : [];

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
    quantity: number;
  }

  interface ChecklistItem {
    checklist_id: string;
    item_id: string;
    completed: boolean;
    quantity: number;
  }

  const body = await req.json();
  const { userId, title, category, items }: { userId: string; title: string; category: string; items: ItemInput[] } = body;

  if (!userId || !title || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Create a new checklist and return it directly
    const { data: newChecklist, error: checklistError } = await supabaseServer
      .from("checklists")
      .insert([{ title, category, user_id: userId }])
      .select()
      .single();

    if (checklistError) {
      throw checklistError;
    }

    let checklistItems: ChecklistItem[] = [];
    let inventoryItems: InventoryItem[] = []; // Declare inventoryItems in a broader scope

    if (items && items.length > 0) {
      // Fetch user's inventory in one query
      const itemIds = items.map((item: ItemInput) => item.id);
      const { data, error: inventoryError } = await supabaseServer
        .from("items")
        .select("id, quantity")
        .in("id", itemIds)
        .eq("user_id", userId);

      if (inventoryError) {
        throw inventoryError;
      }

      if (!data || data.length === 0) {
        return NextResponse.json(
          { error: "No items found in user inventory" },
          { status: 400 }
        );
      }

      inventoryItems = data; // Assign fetched inventory data to inventoryItems

      // Map inventory items by ID for quick lookup
      const inventoryMap = new Map<string, number>(
        inventoryItems.map((item: InventoryItem) => [item.id, item.quantity])
      );

      // Prepare checklist items
      checklistItems = items.map(({ id: itemId, quantity }: ItemInput) => {
        const availableQuantity = inventoryMap.get(itemId) || 0;
        if (quantity > availableQuantity) {
          throw new Error(`Insufficient quantity for item ${itemId}`);
        }

        return {
          checklist_id: newChecklist.id,
          item_id: itemId,
          completed: false,
          quantity,
        };
      });

      // Batch insert checklist items
      const { error: itemsError } = await supabaseServer
        .from("checklist_items")
        .insert(checklistItems);

      if (itemsError) {
        throw itemsError;
      }
    }

    // Calculate completion stats directly
    const totalItems = checklistItems.length;
    const completedItems = checklistItems.filter((item: ChecklistItem) => item.completed).length;

    // Build the checklistWithItems object
    const checklistWithItems = {
      ...newChecklist,
      items: checklistItems.map((item: ChecklistItem) => ({
        ...item,
        items: inventoryItems.find((invItem: InventoryItem) => invItem.id === item.item_id),
      })),
      completion: {
        completed: completedItems,
        total: totalItems,
      },
    };

    return NextResponse.json(checklistWithItems, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist:", error);
    return NextResponse.json({ error: "Failed to create checklist" }, { status: 500 });
  }
}
