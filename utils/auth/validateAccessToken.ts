import { SupabaseClient, User } from '@supabase/supabase-js';
import { NextRequest } from 'next/server';
import { DatabaseService } from '@/di/services/databaseService';

export async function validateAccessToken(
  req: NextRequest,
  supabase: SupabaseClient
): Promise<{ user: User | null; error: string | null }> {
  try {
    const sbAccessToken = req.cookies.get('sb-access-token')?.value;

    if (!sbAccessToken) {
      return { error: 'Authentication token is missing', user: null };
    }

    const { data, error } = await supabase.auth.getUser(sbAccessToken);

    if (error) {
      return { error: 'Invalid or expired token', user: null };
    }

    const user = data?.user;

    const validationError = validateUser(user);
    if (validationError) {
      return { error: validationError, user: null };
    }

    return { user, error: null };
  } catch (err) {
    console.error('Unexpected error during access token validation:', err);
    return { error: 'Unexpected error during authentication', user: null };
  }
}

function validateUser(user: User | null): string | null {
  if (!user) {
    return 'Invalid user: User object is null';
  }

  if (!user.id) {
    return 'Invalid user: User ID is missing';
  }

  if (user.aud !== 'authenticated') {
    return 'Invalid user: Audience is not authenticated';
  }

  if (user.is_anonymous) {
    return 'Anonymous users are not allowed';
  }

  if (!user.email_confirmed_at) {
    return 'Email is not confirmed';
  }

  return null;
}


export async function validateAccessTokenDI(
  req: NextRequest,
  databaseService: DatabaseService
): Promise<{ user: User | null; error: string | null }> {
  try {
    const sbAccessToken = req.cookies.get('sb-access-token')?.value;

    if (!sbAccessToken) {
      return { error: 'Authentication token is missing', user: null };
    }

    // Use DatabaseService to validate the access token
    const { user, error } = await databaseService.getUserByToken(sbAccessToken);

    if (error) {
      return { error: 'Invalid or expired token', user: null };
    }

    const validationError = validateUserDI(user);
    if (validationError) {
      return { error: validationError, user: null };
    }

    return { user, error: null };
  } catch (err) {
    console.error('Unexpected error during access token validation:', err);
    return { error: 'Unexpected error during authentication', user: null };
  }
}

function validateUserDI(user: User | null): string | null {
  if (!user) {
    return 'Invalid user: User object is null';
  }

  if (!user.id) {
    return 'Invalid user: User ID is missing';
  }

  if (user.aud !== 'authenticated') {
    return 'Invalid user: Audience is not authenticated';
  }

  if (user.is_anonymous) {
    return 'Anonymous users are not allowed';
  }

  if (!user.email_confirmed_at) {
    return 'Email is not confirmed';
  }

  return null;
}
