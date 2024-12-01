// context/AuthContext.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  Dispatch,
  SetStateAction,
} from 'react';
import { User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  logout: () => Promise<void>;
}

const AuthContextValue = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: User | null;
}) => {
  const [user, setUser] = useState<User | null>(initialUser);

  const logout = async () => {
    try {
      // Call the signout API route
      await fetch('/api/auth/signout', {
        method: 'POST',
      });

      // Update the user state
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <AuthContextValue.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContextValue.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContextValue);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
