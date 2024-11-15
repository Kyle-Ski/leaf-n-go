import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Memory storage for server-side use cases
class CustomMemoryStorage {
  private store: { [key: string]: string } = {};

  setItem(key: string, value: string): void {
    this.store[key] = value;
  }
  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }
  removeItem(key: string): void {
    delete this.store[key];
  }
}

// Singleton supabase client for browser
let browserClient: SupabaseClient | null = null;

// Function to create a Supabase client depending on the environment
export const getSupabaseClient = (): SupabaseClient => {
  if (typeof window !== 'undefined') {
    // If in a browser, use or create a client with localStorage
    if (!browserClient) {
      browserClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storage: localStorage,
        },
      });
    }
    return browserClient;
  } else {
    // If in a server environment, create a client with memory storage
    return createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storage: new CustomMemoryStorage(),
      },
    });
  }
};
