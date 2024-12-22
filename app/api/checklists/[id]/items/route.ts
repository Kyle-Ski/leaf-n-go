import { NextRequest, NextResponse } from 'next/server';
import { validateAccessTokenDI } from '@/utils/auth/validateAccessToken';
import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';

const databaseService = serviceContainer.resolve<DatabaseService>('supabaseService');

/**
 * Updates multiple checklist items to true
 * @param request 
 * @returns 
 */
export async function PUT(request: NextRequest) {
    try {
        // 1. Validate user
        const { user, error: validateError } = await validateAccessTokenDI(request, databaseService);
        if (validateError) {
            return NextResponse.json({ validateError }, { status: 401 });
        }
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
        }

        // 2. Parse body
        const { checklistId, itemIds } = await request.json();

        // 3. Validate input
        if (!checklistId || !Array.isArray(itemIds) || itemIds.length === 0) {
            return NextResponse.json(
                { success: false, error: 'checklistId and a non-empty array of itemIds are required.' },
                { status: 400 }
            );
        }

        // 4. Verify ownership
        const userId = user.id;
        const { data: checklist, error: checklistError } =
            await databaseService.validateChecklistOwnership(checklistId, userId);

        if (checklistError || !checklist) {
            return NextResponse.json(
                { success: false, error: 'Checklist not found or does not belong to the user.' },
                { status: 404 }
            );
        }

        // 5. Perform bulk update in a single query
        const { data: updatedItems, error: bulkError } =
            await databaseService.markItemsAsCompleted(checklistId, itemIds);

        if (bulkError) {
            return NextResponse.json(
                { success: false, error: 'Failed to update items.' },
                { status: 500 }
            );
        }

        // 6. Return updated items
        return NextResponse.json({ success: true, updatedItems }, { status: 200 });

    } catch (error) {
        console.error('Bulk update error:', error);
        return NextResponse.json(
            { success: false, error: 'An unexpected error occurred.' },
            { status: 500 }
        );
    }
}
