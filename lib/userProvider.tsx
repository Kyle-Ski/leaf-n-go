"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supbaseClient";
import { useRouter } from "next/navigation";
import { Session, User } from "@supabase/supabase-js";

type UserContextType = {
  user: User | null;
  session: Session | null;
  profile: { onboarded: boolean } | null;
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

const mockProfile = { onboarded: false }; // Set onboarded to false for testing

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<{ onboarded: boolean } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async (userId: string) => {
      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("onboarded")
        .eq("id", userId)
        .single();

      if (error) {
        console.error("Error fetching user profile:", error);
      } else {
        setProfile(userProfile);
      }
    };

    if (process.env.NODE_ENV === "development") {
      // In development, use mock user, session, and profile data
      setUser(mockUser);
      setSession(mockSession);
      setProfile(mockProfile);
      setLoading(false);

      // Redirect new users (who haven't completed onboarding) to /welcome
      if (!mockProfile.onboarded) {
        router.push("/welcome");
      }
    } else {
      // Production: Use real session handling with Supabase auth
      const getSession = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setSession(session);
        setLoading(false);

        if (session?.user) {
          await fetchUserProfile(session.user.id);
          if (profile && !profile.onboarded) {
            router.push("/welcome");
          }
        }
      };

      getSession();

      const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
        setUser(session?.user ?? null);
        setSession(session);
        if (session?.user) fetchUserProfile(session.user.id);
      });

      return () => {
        listener.subscription.unsubscribe();
      };
    }
  }, [router, profile?.onboarded]);

  return (
    <UserContext.Provider value={{ user, session, profile, loading }}>
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
