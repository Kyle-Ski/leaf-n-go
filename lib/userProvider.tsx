"use client";

import { createContext, useContext, useEffect, useState, ComponentType } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supbaseClient";

type UserContextType = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  logout: () => void;
  updateSession: (session: Session | null) => void;
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
      setLoading(true);
      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Error fetching session:", error);
          setUser(null);
          setSession(null);
        } else if (data.session) {
          setUser(data.session.user);
          setSession(data.session);
        } else {
          setUser(null);
          setSession(null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
        setSession(null);
      }
      setLoading(false);
    };

    handleSession();

    // Subscribe to session changes
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setUser(session.user);
        setSession(session);
      } else {
        setUser(null);
        setSession(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Redirect to /auth only if user is not authenticated, and they aren't on a public page
  useEffect(() => {
    const publicPaths = ["/auth", "/about", "/404"];
    if (!loading && user === null && !publicPaths.includes(pathname ?? "")) {
      console.log("Redirecting to /auth due to unauthorized access."); // Dev-only debug
      router.replace("/auth");
    }
  }, [loading, user, pathname, router]);

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setSession(null);
      router.replace("/auth");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const updateSession = (session: Session | null) => {
    setUser(session?.user ?? null);
    setSession(session);
  };

  return (
    <UserContext.Provider value={{ user, session, loading, logout, updateSession }}>
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
        console.log("User not authenticated, redirecting to /auth"); // Dev-only debug
        router.replace("/auth");
      }
    }, [loading, user, router]);

    if (loading) {
      return <div>Loading...</div>;
    }

    return user ? <Component {...props} /> : null;
  };
}
