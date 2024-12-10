import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supbaseClient';

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
  
  const { userId, darkMode, emailNotifications, pushNotifications, weight_unit } = body;

  if (!userId) {
    return NextResponse.json({ error: 'Missing user ID' }, { status: 400 });
  }

  const { error } = await supabaseServer
    .from('user_settings')
    .upsert(
      {
        user_id: userId,
        dark_mode: darkMode,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        weight_unit: weight_unit,
      },
      { onConflict: 'user_id' }
    );

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: 'User settings saved successfully' });
}
