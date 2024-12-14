import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabaseServer';
import { UserSettings } from '@/types/projectTypes';
import { validateAccessToken } from '@/utils/auth/validateAccessToken';

export async function GET(request: NextRequest) {
  // Validate the access token
  const { error: validateError, user } = await validateAccessToken(request, supabaseServer);

  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  const { data, error } = await supabaseServer
    .from('user_settings')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(request: NextRequest) {
  // Validate the access token
  const { error: validateError, user } = await validateAccessToken(request, supabaseServer);
  
  if (validateError) {
    return NextResponse.json({ validateError }, { status: 401 });
  }

  if (!user) {
    return NextResponse.json({ validateError: 'Unauthorized: User not found' }, { status: 401 });
  }

  const userId = user.id

  const body = await request.json();

  // Destructure userId and gather the rest of the fields
  const { dark_mode, email_notifications, push_notifications, weight_unit } = body;

  // Construct updatedFields with only defined values
  const updatedFields: Partial<UserSettings> = {
    ...(dark_mode !== undefined && { dark_mode }),
    ...(email_notifications !== undefined && { email_notifications }),
    ...(push_notifications !== undefined && { push_notifications }),
    ...(weight_unit !== undefined && { weight_unit }),
  };

  // If no fields to update, return early
  if (Object.keys(updatedFields).length === 0) {
    return NextResponse.json({ message: 'No settings to update' }, { status: 200 });
  }

  // Perform the update operation
  const { error } = await supabaseServer
    .from('user_settings')
    .update(updatedFields)
    .eq('user_id', userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'User settings updated successfully' }, { status: 200 });
}