// hooks/useAiUsage.ts
import { useState, useEffect } from 'react';

interface AiUsage {
  tokens_used: number;
  monthly_token_limit: number;
  usage_count: number;
  last_used: string | null;
  reset_date: string | null;
  plan_type: string;
}

export function useAiUsage() {
  const [usage, setUsage] = useState<AiUsage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUsage() {
      try {
        const response = await fetch('/api/ai-usage', {
          credentials: 'include', // Important for cookies/session
        });

        if (!response.ok) {
          throw new Error('Failed to fetch AI usage');
        }

        const data = await response.json();
        setUsage(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    }

    fetchUsage();
  }, []);

  // Function to manually refresh the usage data
  const refreshUsage = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ai-usage', {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch AI usage');
      }

      const data = await response.json();
      setUsage(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };

  return { usage, isLoading, error, refreshUsage };
}