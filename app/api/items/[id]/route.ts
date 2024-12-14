import { NextRequest, NextResponse } from "next/server";
import { validateAccessTokenDI } from "@/utils/auth/validateAccessToken";
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";

const databaseService = serviceContainer.resolve<DatabaseService>('supabaseService');

export async function GET(req: NextRequest) {

  const { error: validateError, user } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const url = new URL(req.url);
  const itemId = url.pathname.split("/").pop(); // Extract the item ID from the URL

  if (!itemId) {
    return NextResponse.json({ error: "Item ID is required." }, { status: 400 });
  }

  try {
    const item = await databaseService.fetchItemWithCategoryById(itemId);
    return NextResponse.json(item, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error fetching item:', error.message);
      return NextResponse.json(
        { error: error.message || 'An unexpected error occurred.' },
        { status: error.message === 'Item not found.' ? 404 : 500 }
      );
    } else {
      // Handle unexpected error types gracefully
      console.error('Unexpected error:', error);
      return NextResponse.json(
        { error: 'An unexpected error occurred.' },
        { status: 500 }
      );
    }
  }
}

export async function PUT(req: NextRequest) {
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const url = new URL(req.url);
  const itemId = url.pathname.split('/').pop(); // Extract the item ID from the URL

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
  }

  try {
    const body = await req.json();
    const { name, quantity, weight, notes, category_id } = body;

    if (!name || quantity === undefined || weight === undefined) {
      return NextResponse.json(
        { error: 'Name, quantity, and weight are required fields.' },
        { status: 400 }
      );
    }

    // Use the database service to update the item
    const updatedItem = await databaseService.updateItem(itemId, {
      name,
      quantity,
      weight,
      notes,
      category_id,
    });

    return NextResponse.json(updatedItem, { status: 200 });
  } catch (error) {
    console.error('Error updating item:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const url = new URL(req.url);
  const itemId = url.pathname.split('/').pop(); // Extract the item ID from the URL

  if (!itemId) {
    return NextResponse.json({ error: 'Item ID is required.' }, { status: 400 });
  }

  try {
    // Use the database service to delete the item
    await databaseService.deleteItem(itemId);

    return NextResponse.json({ message: 'Item deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting item:', error);
    return NextResponse.json({ error: 'An unexpected error occurred.' }, { status: 500 });
  }
}
