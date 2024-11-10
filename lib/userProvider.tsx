"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supbaseClient";
import { useRouter, usePathname } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { NextPage } from "next";
import { ComponentType } from "react";

type UserContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

// Mock data for development mode
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

// Toggle this to simulate an authenticated or unauthenticated state in development
const isAuthenticated = true; // Change to `false` to simulate an unauthenticated user

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleSession = async () => {
      if (process.env.NODE_ENV === "development") {
        // Use mock data in development based on the `isAuthenticated` flag
        setUser(isAuthenticated ? mockUser : null);
        setSession(isAuthenticated ? mockSession : null);
        setLoading(false);
      } else {
        // In production, use Supabase session
        const {
          data: { session },
        } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setSession(session);
        setLoading(false);
      }
    };

    handleSession();

    if (process.env.NODE_ENV !== "development") {
      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setSession(session);
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, [router]);

  // Redirect to /auth only if user is not authenticated, and they aren't on a public page
  useEffect(() => {
    const publicPaths = ["/auth", "/about", "/404"];
    if (!loading && user === null && !publicPaths.includes(pathname ?? "")) {
      router.replace("/auth");
    }
  }, [loading, user, pathname, router]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.replace("/auth");
  };

  return (
    <UserContext.Provider value={{ user, session, loading, logout }}>
      {!loading ? children : null}
    </UserContext.Provider>
  );
};

export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export function withAuth<T extends object>(Component: ComponentType<T>): ComponentType<T> {
  return function AuthenticatedComponent(props: T) {
    const { user, loading } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace("/auth");
      }
    }, [loading, user, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return user ? <Component {...props} /> : null;
  };
}
