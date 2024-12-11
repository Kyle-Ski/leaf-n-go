// app/api/consent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient'; // Ensure correct path

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
    const userId = req.headers.get('x-user-id');
    const referrer = req.headers.get('referer'); // For debugging

    if (!userId) {
        console.error('Missing x-user-id header. Referrer:', referrer);
        return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    try {
        const { data, error } = await supabaseServer
            .from('user_consent')
            .select('consent, privacy_policy_version')
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Supabase error code for no data
                console.log('No consent record found for user ID:', userId, 'Referrer:', referrer);
                return NextResponse.json({ error: 'Consent not found' }, { status: 404 });
            }
            console.error('Error fetching consent:', error, 'Referrer:', referrer);
            return NextResponse.json({ error: 'Failed to fetch consent preferences' }, { status: 500 });
        }

        return NextResponse.json({ consent: data.consent, privacyPolicyVersion: data.privacy_policy_version }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error fetching consent:', error, 'Referrer:', referrer);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

// POST: Save or update user consent preferences
export async function POST(req: NextRequest) {
    const userId = req.headers.get('x-user-id');
    const referrer = req.headers.get('referer'); // For debugging

    if (!userId) {
        console.error('Missing x-user-id header. Referrer:', referrer);
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
        const { data, error } = await supabaseServer
            .from('user_consent')
            .upsert([
                {
                    user_id: userId,
                    consent,
                    privacy_policy_version: privacyPolicyVersion,
                },
            ], { onConflict: 'user_id' }) // Specify the conflict target
            .select('consent, privacy_policy_version')
            .single();

        if (error) {
            console.error('Error saving consent preferences:', error, 'Referrer:', referrer);
            return NextResponse.json({ error: 'Failed to save consent preferences' }, { status: 500 });
        }

        return NextResponse.json({ success: true, consent: data.consent, privacyPolicyVersion: data.privacy_policy_version }, { status: 200 });
    } catch (error) {
        console.error('Unexpected error saving consent:', error, 'Referrer:', referrer);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
