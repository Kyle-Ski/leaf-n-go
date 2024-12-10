import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';
import { UserSettings } from '@/types/projectTypes';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('userId');

  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

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

export async function POST(request: Request) {
  const body = await request.json();
  
  // Destructure userId and gather the rest of the fields
  const { userId, dark_mode, email_notifications, push_notifications, weight_unit } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

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