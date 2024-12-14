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
    if (error || !data.user) {
        return { error: 'Invalid or expired token', user: null };
    }

    // Return the user data if the token is valid
    return { error: null, user: data.user };
}
