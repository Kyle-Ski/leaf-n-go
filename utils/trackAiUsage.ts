import { supabaseServer } from '@/lib/supbaseClient';

export async function trackAiUsage(userId: string) {
    try {
        const { data, error } = await supabaseServer.rpc('increment_usage_count', {
            user_id: userId,
            increment_by: 1, // Optional, defaults to 1
        });

        if (error) {
            console.error("Error tracking AI usage:", error);
            throw error;
        }

        return data;
    } catch (err) {
        console.error("Unexpected error tracking AI usage:", err);
        throw err;
    }
}
