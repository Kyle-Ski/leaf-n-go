import { SupabaseClient, User } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';

export async function validateAccessToken(req: NextRequest, supabase: SupabaseClient): Promise<{ user: User | null; error: string | null }> {
    // Extract the token from cookies
    const sbAccessToken = req.cookies.get('sb-access-token')?.value;
    console.log("Validating access token:", sbAccessToken)
    if (!sbAccessToken) {
        return { error: 'Authentication token is missing', user: null };
    }

    // Verify the token using the Supabase client
    const { data, error } = await supabase.auth.getUser(sbAccessToken);
    console.log("user data:", data)

    if (error) {
        return { error: 'Invalid or expired token', user: null };
    }

    const user = data?.user;

    // Check for essential user attributes
    if (!user?.id) {
        return { error: 'Invalid user: User ID is missing', user: null };
    }

    if (user.aud !== 'authenticated') {
        return { error: 'Invalid user: Audience is not authenticated', user: null };
    }

    if (user.is_anonymous) {
        return { error: 'Anonymous users are not allowed', user: null };
    }

    // Optional: Check for email confirmation
    if (!user.email_confirmed_at) {
        return { error: 'Email is not confirmed', user: null };
    }

    return { user, error: null };
}
