import { NextRequest, NextResponse } from 'next/server';
import serviceContainer from "@/di/containers/serviceContainer";
import { DatabaseService } from "@/di/services/databaseService";
import { validateAccessTokenDI } from '@/utils/auth/validateAccessToken';

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const checklistId = await params.id;

    const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

    if (validateError) {
        return NextResponse.json({ validateError }, { status: 401 });
    }

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
    }

    const userId = user.id;

    const { item_ids } = await req.json();

    if (!userId) {
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!item_ids || !Array.isArray(item_ids) || item_ids.length === 0) {
        return NextResponse.json({ error: 'Item IDs are required and must be an array' }, { status: 400 });
    }

    try {
        // Call the bulk removal method from the database service
        await databaseService.bulkRemoveChecklistItems(checklistId, item_ids);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Unexpected error removing items:", error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
