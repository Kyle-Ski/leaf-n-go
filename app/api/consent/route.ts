import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer'; // Ensure correct path
import { validateAccessTokenDI } from '@/utils/auth/validateAccessToken';
import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

// Define the structure of consent categories
export type ConsentCategories = {
    cookies: {
        essential: boolean;
        functional: boolean;
        analytics: boolean;
    };
    localStorage: boolean;
    aiDataUsage: boolean;
};

// GET: Fetch user consent preferences
export async function GET(req: NextRequest) {
    const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

    if (validateError) {
        return NextResponse.json({ validateError }, { status: 401 });
    }

    if (!user) {
        return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
    }

    const userId = user.id

    const referrer = req.headers.get('referer'); // For debugging

    if (!userId) {
        console.error('Missing user id. Referrer:', referrer);
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const consentRecord = await databaseService.getUserConsent(userId);

        if (!consentRecord) {
            console.log('No consent record found for user ID:', userId, 'Referrer:', referrer);
            return NextResponse.json({ error: 'Consent not found' }, { status: 404 });
        }

        return NextResponse.json(
            { consent: consentRecord.consent, privacyPolicyVersion: consentRecord.privacyPolicyVersion },
            { status: 200 }
        );
    } catch (error) {
        console.error('Unexpected error fetching consent:', error, 'Referrer:', referrer);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }

}

// POST: Save or update user consent preferences
export async function POST(req: NextRequest) {
    const { user, error: validateError } = await validateAccessTokenDI(req, databaseService);

    if (validateError) {
        return NextResponse.json({ validateError }, { status: 401 });
    }

    if (!user) {
        return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
    }

    const userId = user.id

    const referrer = req.headers.get('referer'); // For debugging

    if (!userId) {
        console.error('Missing user id. Referrer:', referrer);
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const body = await req.json();
        const { consent, privacyPolicyVersion } = body;

        // Validate consent and privacyPolicyVersion
        if (
            typeof consent !== 'object' ||
            !consent ||
            typeof privacyPolicyVersion !== 'string'
        ) {
            console.error('Invalid consent data received. Referrer:', referrer);
            return NextResponse.json({ error: 'Invalid consent data' }, { status: 400 });
        }

        // Further validate the structure of consent
        const isValidConsent =
            consent.cookies &&
            typeof consent.cookies.essential === 'boolean' &&
            typeof consent.cookies.functional === 'boolean' &&
            typeof consent.cookies.analytics === 'boolean' &&
            typeof consent.localStorage === 'boolean' &&
            typeof consent.aiDataUsage === 'boolean';

        if (!isValidConsent) {
            console.error('Invalid consent structure. Referrer:', referrer);
            return NextResponse.json({ error: 'Invalid consent structure' }, { status: 400 });
        }

        // Upsert the consent data
        const { data } = await databaseService.updateUserConsent(userId, consent, privacyPolicyVersion)

        return NextResponse.json({ success: true, consent: data, privacyPolicyVersion: data.privacy_policy_version }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error saving consent:', error, 'Referrer:', referrer);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
