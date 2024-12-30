// app/api/ai-usage/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateAccessTokenDI } from '@/utils/auth/validateAccessToken';
import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';

const databaseService = serviceContainer.resolve<DatabaseService>('supabaseService');

export async function GET(req: NextRequest) {
    try {
        const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

        if (validateError) {
            return NextResponse.json({ error: validateError }, { status: 401 });
        }

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized: User not found' }, { status: 401 });
        }

        const { data: usage, error } = await databaseService.getAiUsageForUser(user.id);

        if (error) {
            console.error('Error fetching AI usage:', error);
            return NextResponse.json({ error: 'Failed to fetch AI usage' }, { status: 500 });
        }

        // If no usage record exists yet, return default values
        if (!usage) {
            return NextResponse.json({
                tokens_used: 0,
                monthly_token_limit: 1000000,
                usage_count: 0,
                last_used: null,
                reset_date: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth() + 1,
                    1
                ).toISOString()
            });
        }

        return NextResponse.json(usage);
    } catch (error) {
        console.error('Error in AI usage API:', error);
        return NextResponse.json(
            { error: 'An error occurred while fetching AI usage' },
            { status: 500 }
        );
    }
}