'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-Context';

export default function SignOutButton() {
  const router = useRouter();
  const { setUser } = useAuth();

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', {
      method: 'POST',
    });

    // Update user state in AuthContext
    setUser(null);

    router.push('/auth');
  };

  return <button onClick={handleSignOut}>Sign Out</button>;
}
