"use client";

import { createContext, useContext, useEffect, useState, ComponentType } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";

// Mock data for development mode
const mockUser: User = {
  id: "8e59f4e4-12c1-4a3a-9b36-df1e21e3d6bf",
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

const isAuthenticated = true; // Toggle this to simulate authenticated or unauthenticated state in development

type UserContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => void;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

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
        try {
          const response = await fetch("/api/auth/session");
          if (response.ok) {
            const data: Session = await response.json();
            setUser(data?.user ?? null);
            setSession(data ?? null);
          }
        } catch (error) {
          console.error("Error fetching session:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    handleSession();
  }, []);

  // Redirect to /auth only if user is not authenticated, and they aren't on a public page
  useEffect(() => {
    const publicPaths = ["/auth", "/about", "/404"];
    if (!loading && user === null && !publicPaths.includes(pathname ?? "")) {
      router.replace("/auth");
    }
  }, [loading, user, pathname, router]);

  const logout = async () => {
    try {
      const response = await fetch("/api/auth/signout", {
        method: "POST",
      });

      if (response.ok) {
        setUser(null);
        setSession(null);
        router.replace("/auth");
      } else {
        throw new Error("Failed to log out");
      }
    } catch (error) {
      console.error("Error logging out:", error);
    }
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
