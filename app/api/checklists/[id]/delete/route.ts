import { NextRequest, NextResponse } from "next/server";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  const { id: checklistId } = await props.params;

  if (!userId) {
    return NextResponse.json({ error: "User ID is required" }, { status: 400 });
  }

  if (!checklistId) {
    return NextResponse.json({ error: "Checklist ID is required" }, { status: 400 });
  }

  try {
    // Verify the checklist belongs to the user
    const checklist = await databaseService.fetchChecklists({ id: checklistId, user_id: userId });

    if (!checklist) {
      return NextResponse.json({ error: "Checklist not found or unauthorized" }, { status: 404 });
    }

    // Delete the checklist and associated items
    const deleteItemsResult = await databaseService.deleteChecklistItemsByChecklistId(checklistId);

    if (!deleteItemsResult) {
      console.error("Error deleting checklist items");
      return NextResponse.json(
        { error: "Failed to delete checklist items" },
        { status: 500 }
      );
    }

    const deleteChecklistResult = await databaseService.deleteChecklistById(checklistId);

    if (!deleteChecklistResult) {
      console.error("Error deleting checklist");
      return NextResponse.json({ error: "Failed to delete checklist" }, { status: 500 });
    }

    return NextResponse.json({ message: "Checklist deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }

}
