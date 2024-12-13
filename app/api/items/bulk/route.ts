import { supabaseServer } from '@/lib/supabaseServer';
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  try {
    const items = await req.json();

    // Validate the request body
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "A non-empty array of items is required." },
        { status: 400 }
      );
    }

    // Extract unique category IDs from the payload for validation
    const categoryIds = Array.from(
      new Set(items.map((item) => item.category_id).filter(Boolean))
    );

    // Validate the category IDs in bulk
    let validCategoryIds = new Set();
    if (categoryIds.length > 0) {
      const { data: validCategories, error: categoryError } = await supabaseServer
        .from("item_categories")
        .select("id")
        .in("id", categoryIds);

      if (categoryError) {
        console.error("Error validating categories:", categoryError);
        return NextResponse.json(
          { error: "Failed to validate category IDs." },
          { status: 500 }
        );
      }

      validCategoryIds = new Set(validCategories.map((category) => category.id));
    }

    // Map over the items and replace invalid category_ids with null
    const sanitizedItems = items.map((item) => ({
      user_id: userId,
      name: item.name,
      quantity: item.quantity,
      weight: item.weight,
      notes: item.notes || null,
      category_id: validCategoryIds.has(item.category_id) ? item.category_id : null,
    }));

    // Insert items in a single transaction
    const { data: insertedItems, error: insertError } = await supabaseServer
      .from("items")
      .insert(sanitizedItems)
      .select("*, item_categories(name)");

    if (insertError) {
      console.error("Error inserting items:", insertError);
      return NextResponse.json(
        { error: "Failed to insert items into the database." },
        { status: 500 }
      );
    }

    // Return the successfully inserted items
    return NextResponse.json({ insertedItems }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error during bulk upload:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}
