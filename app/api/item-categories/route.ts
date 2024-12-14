import { NextRequest, NextResponse } from 'next/server';
import { validateAccessTokenDI } from '@/utils/auth/validateAccessToken';
import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

// GET: Fetch all item categories visible to the user
// This includes global categories (user_id IS NULL) and any categories owned by this user
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
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  try {
    const categories = await databaseService.fetchItemCategories(userId);

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Unexpected error fetching item categories:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }

}
