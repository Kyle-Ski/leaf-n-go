import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

export async function GET(req: NextRequest) {
  const userId = req.headers.get('x-user-id');

  if (!userId) {
    return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
  }

  try {
    console.log("Fetching checklists for user ID:", userId);

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
  const body = await req.json();
  const { userId, title, category, items } = body;

  if (!userId || !title || !category) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  try {
    // Create a new checklist
    const { data: newChecklist, error: checklistError } = await supabaseServer
      .from("checklists")
      .insert([{ title, category, user_id: userId }])
      .select()
      .single();

    if (checklistError) {
      throw checklistError;
    }

    // Validate and process items
    if (items && items.length > 0) {
      // Fetch user's inventory to validate quantities
      const itemIds = items.map((item: { id: string }) => item.id);
      const { data: inventoryItems, error: inventoryError } = await supabaseServer
        .from("items")
        .select("id, quantity")
        .in("id", itemIds)
        .eq("user_id", userId);

      if (inventoryError) {
        throw inventoryError;
      }

      if (!inventoryItems || inventoryItems.length === 0) {
        return NextResponse.json(
          { error: "No items found in user inventory" },
          { status: 400 }
        );
      }

      // Map inventory items by ID for quick lookup
      const inventoryMap = new Map(
        inventoryItems.map((item) => [item.id, item.quantity])
      );

      // Prepare checklist items
      const checklistItems = [];
      for (const { id: itemId, quantity } of items) {
        const availableQuantity = inventoryMap.get(itemId) || 0;
        if (quantity > availableQuantity) {
          return NextResponse.json(
            { error: `Insufficient quantity for item ${itemId}` },
            { status: 400 }
          );
        }

        // Add multiple entries for the same item based on the requested quantity
        for (let i = 0; i < quantity; i++) {
          checklistItems.push({
            checklist_id: newChecklist.id,
            item_id: itemId,
            completed: false,
            quantity: 1, // Each entry represents a single unit
          });
        }
      }

      const { error: itemsError } = await supabaseServer
        .from("checklist_items")
        .insert(checklistItems);

      if (itemsError) {
        throw itemsError;
      }
    }

    return NextResponse.json(newChecklist, { status: 201 });
  } catch (error) {
    console.error("Error creating checklist:", error);
    return NextResponse.json({ error: "Failed to create checklist" }, { status: 500 });
  }
}
