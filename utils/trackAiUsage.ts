import serviceContainer from '@/di/containers/serviceContainer';
import { DatabaseService } from '@/di/services/databaseService';

const databaseService = serviceContainer.resolve<DatabaseService>("supabaseService");

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
