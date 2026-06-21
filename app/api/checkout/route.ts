import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getPriceAmount, getStripe, priceId } from '@/lib/stripe';

export async function POST(request: Request) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { testId } = (await request.json().catch(() => ({}))) as { testId?: string };
  if (!testId) return NextResponse.json({ error: 'missing_test_id' }, { status: 400 });

  const { data: test } = await supabase
    .from('photo_tests')
    .select('id, status, photos(count)')
    .eq('id', testId)
    .maybeSingle();
  if (!test) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (test.status !== 'pending_payment') {
    return NextResponse.json({ error: 'already_paid' }, { status: 409 });
  }

  const count = (test.photos as any)?.[0]?.count ?? 0;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(request.url).origin;
  const { amount, currency } = await getPriceAmount();

  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    payment_method_types: ['card'],
    customer_email: user.email ?? undefined,
    success_url: `${appUrl}/submitted/${test.id}?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/payment/${test.id}`,
    line_items: [{ price: priceId(), quantity: 1 }],
    metadata: { photo_test_id: test.id, user_id: user.id },
    payment_intent_data: {
      metadata: { photo_test_id: test.id, user_id: user.id },
    },
  });

  // Record a pending payment row (use admin client to satisfy RLS rules)
  const admin = createAdminClient();
  await admin.from('payment_history').insert({
    user_id: user.id,
    photo_test_id: test.id,
    amount_cents: amount,
    currency,
    description: `Photo test · ${count} photos`,
    stripe_session_id: session.id,
    status: 'pending',
  });

  return NextResponse.json({ url: session.url });
}
