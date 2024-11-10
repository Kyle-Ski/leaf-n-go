"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supbaseClient";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";

type UserContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

const mockUser: User = {
  id: "mock-user-id",
  email: "devuser@example.com",
  email_confirmed_at: new Date().toISOString(),
  aud: "authenticated",
  role: "authenticated",
  app_metadata: {},
  user_metadata: {},
  identities: [],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockSession: Session = {
  access_token: "mock-access-token",
  token_type: "bearer",
  expires_in: 3600,
  refresh_token: "mock-refresh-token",
  user: mockUser,
};

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setSession(session);
      setLoading(false);

      // Optionally, redirect new users to `/welcome` if desired
      if (session?.user && !loading) {
        router.push("/welcome");
      }
    };

    if (process.env.NODE_ENV === "development") {
      // In development, use mock data
      setUser(mockUser);
      setSession(mockSession);
      setLoading(false);

      // Optionally, redirect to `/welcome` in development
      router.push("/welcome");
    } else {
      handleSession();

      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setSession(session);
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, [router]);

  return (
    <UserContext.Provider value={{ user, session, loading }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
