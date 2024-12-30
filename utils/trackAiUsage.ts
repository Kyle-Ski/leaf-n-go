import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

interface TokenUsageDetails {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
}

export async function trackAiUsage(userId: string) {
    try {
        const { data, error } = await databaseService.trackAiUsage(userId)

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

export async function trackTokenUsage(
    userId: string,
    tokenUsage: TokenUsageDetails,
    databaseService: DatabaseService
): Promise<void> {
    try {
        const { data: existingUsage, error: fetchError } = await databaseService.getAiUsageForUser(userId);

        if (fetchError) {
            console.error('Error fetching user AI usage:', fetchError);
            return;
        }

        // If no record exists, create one
        if (!existingUsage) {
            const { error: insertError } = await databaseService.createAiUsageRecord(userId, tokenUsage.totalTokens);

            if (insertError) {
                console.error('Error inserting user AI usage:', insertError);
            }
            return;
        }

        // Update existing record
        const { error: updateError } = await databaseService.updateAiUsage(
            existingUsage.tokens_used + tokenUsage.totalTokens,
            existingUsage.usage_count + 1,
            userId
        );

        if (updateError) {
            console.error('Error updating user AI usage:', updateError);
        }
    } catch (error) {
        console.error('Error tracking token usage:', error);
    }
}

// Function to check if user has enough tokens
export async function checkTokenAvailability(
    userId: string,
    requestedTokens: number,
    databaseService: DatabaseService
): Promise<boolean> {
    try {
        const { data: usage, error } = await databaseService.getAiUsageForUser(userId);

        if (error) {
            console.error('Error checking token availability:', error);
            return false;
        }

        if (!usage) return true; // New users always have available tokens

        const tokenLimit = usage.monthly_token_limit || 1000000; // Default to 1M tokens
        const resetDate = new Date(usage.reset_date);
        const now = new Date();

        // If we're past the reset date, user has full token limit available
        if (resetDate < now) {
            return true;
        }

        return (usage.tokens_used + requestedTokens) <= tokenLimit;
    } catch (error) {
        console.error('Error checking token availability:', error);
        return false;
    }
}