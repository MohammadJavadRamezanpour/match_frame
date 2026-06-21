import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

const MIN = 2;
const MAX = 10;

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  let body: { min_age?: number; max_age?: number; photos?: string[] };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }
  const photos = Array.isArray(body.photos) ? body.photos.filter((p) => typeof p === 'string') : [];
  if (photos.length < MIN || photos.length > MAX) {
    return NextResponse.json({ error: `Add between ${MIN} and ${MAX} photos.` }, { status: 400 });
  }
  // Validate that storage paths live under the user's folder
  if (photos.some((p) => !p.startsWith(`${user.id}/`))) {
    return NextResponse.json({ error: 'invalid_photo_path' }, { status: 400 });
  }
  const min_age = clampAge(body.min_age, 21);
  const max_age = clampAge(body.max_age, 34);

  const { data: test, error: testErr } = await supabase
    .from('photo_tests')
    .insert({ user_id: user.id, min_age, max_age, status: 'pending_payment' })
    .select('id')
    .single();
  if (testErr || !test) {
    return NextResponse.json({ error: testErr?.message ?? 'failed_to_create_test' }, { status: 500 });
  }

  const photoRows = photos.map((storage_path, i) => ({
    photo_test_id: test.id,
    storage_path,
    position: i,
  }));
  const { error: photoErr } = await supabase.from('photos').insert(photoRows);
  if (photoErr) {
    // Roll back the test row to avoid orphans
    await supabase.from('photo_tests').delete().eq('id', test.id);
    return NextResponse.json({ error: photoErr.message }, { status: 500 });
  }

  return NextResponse.json({ id: test.id });
}

function clampAge(n: unknown, fallback: number) {
  const v = typeof n === 'number' && Number.isFinite(n) ? Math.round(n) : fallback;
  return Math.max(18, Math.min(80, v));
}
