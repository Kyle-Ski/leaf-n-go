import { NextRequest, NextResponse } from "next/server";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

// POST: Bulk upload items
export async function POST(req: NextRequest) {
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
  }

  try {
    const items = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "A non-empty array of items is required." },
        { status: 400 }
      );
    }

    const insertedItems = await databaseService.bulkInsertItems(user.id, items);

    return NextResponse.json({ insertedItems }, { status: 201 });
  } catch (error) {
    console.error("Unexpected error during bulk upload:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 }
    );
  }
}

// DELETE: Bulk delete items
export async function DELETE(req: NextRequest) {
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ error: "Unauthorized: User not found" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { itemIds } = body;

    if (!Array.isArray(itemIds) || itemIds.length === 0) {
      return NextResponse.json({ error: "itemIds must be a non-empty array" }, { status: 400 });
    }

    await databaseService.bulkDeleteItems(user.id, itemIds);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Unexpected error during bulk deletion:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
