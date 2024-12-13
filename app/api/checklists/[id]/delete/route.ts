import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const userId = req.headers.get("x-user-id");
  const { id: checklistId } = await props.params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  if (!checklistId) {
    return NextResponse.json({ error: "Checklist ID is required" }, { status: 400 });
  }

  try {
    // Verify the checklist belongs to the user
    const { data: checklist, error: fetchError } = await supabaseServer
      .from("checklists")
      .select("id")
      .eq("id", checklistId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !checklist) {
      return NextResponse.json({ error: "Checklist not found or unauthorized" }, { status: 404 });
    }

    // Delete the checklist and associated items
    const { error: deleteItemsError } = await supabaseServer
      .from("checklist_items")
      .delete()
      .eq("checklist_id", checklistId);

    if (deleteItemsError) {
      console.error("Error deleting checklist items:", deleteItemsError);
      return NextResponse.json(
        { error: "Failed to delete checklist items" },
        { status: 500 }
      );
    }

    const { error: deleteChecklistError } = await supabaseServer
      .from("checklists")
      .delete()
      .eq("id", checklistId);

    if (deleteChecklistError) {
      console.error("Error deleting checklist:", deleteChecklistError);
      return NextResponse.json({ error: "Failed to delete checklist" }, { status: 500 });
    }

    return NextResponse.json({ message: "Checklist deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}
