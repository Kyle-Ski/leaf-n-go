import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supbaseClient";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const itemId = url.pathname.split("/").pop(); // Extract the item ID from the URL

  if (!itemId) {
    return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
  }

  try {
    const { data: item, error } = await supabaseServer
      .from("items")
      // Include category name
      .select("*, item_categories(name)")
      .eq("id", itemId)
      .single();

    if (error || !item) {
      return NextResponse.json({ error: "Item not found." }, { status: 404 });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const url = new URL(req.url);
  const itemId = url.pathname.split("/").pop(); // Extract the item ID from the URL

  if (!itemId) {
    return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, quantity, weight, notes, category_id } = body;

    if (!name || quantity === undefined || weight === undefined) {
      return NextResponse.json(
        { error: "Name, quantity, and weight are required fields." },
        { status: 400 }
      );
    }

    // Update the item including category_id if provided
    const updateData: Record<string, unknown> = { name, quantity, weight, notes };
    if (category_id !== undefined) {
      updateData.category_id = category_id || null;
    }

    const { data: updatedItem, error } = await supabaseServer
      .from("items")
      .update(updateData)
      .eq("id", itemId)
      .select("*, item_categories(name)")
      .single();


    if (error || !updatedItem) {
      return NextResponse.json({ error: "Failed to update item." }, { status: 500 });
    }

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const url = new URL(req.url);
  const itemId = url.pathname.split("/").pop(); // Extract the item ID from the URL

  if (!itemId) {
    return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
  }

  try {
    const { data: deletedItem, error } = await supabaseServer
      .from("items")
      .delete()
      .eq("id", itemId)
      .select("*")
      .single();

    if (error || !deletedItem) {
      return NextResponse.json({ error: "Failed to delete item." }, { status: 500 });
    }

    return NextResponse.json({ message: "Item deleted successfully." }, { status: 200 });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
