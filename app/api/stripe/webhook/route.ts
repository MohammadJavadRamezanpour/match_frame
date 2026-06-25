import { NextResponse } from 'next/server';
import { waitUntil } from '@vercel/functions';
import { getStripe } from '@/lib/stripe';
import { createAdminClient } from '@/lib/supabase/admin';
import { processTest } from '@/lib/process-test';
import type Stripe from 'stripe';

export const runtime = 'nodejs';
// We need the raw body for signature verification — opt out of body parsing.
export const dynamic = 'force-dynamic';
// Allow the analysis pipeline (kept alive by waitUntil) up to 5 minutes.
export const maxDuration = 300;

export async function POST(request: Request) {
  const sig = request.headers.get('stripe-signature');
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!sig || !secret) {
    return NextResponse.json({ error: 'missing_signature' }, { status: 400 });
  }
  const raw = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(raw, sig, secret);
  } catch (err: any) {
    return NextResponse.json({ error: `invalid_signature: ${err.message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  try {
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      const testId = session.metadata?.photo_test_id;
      if (!testId) return NextResponse.json({ received: true });

      await admin
        .from('payment_history')
        .update({
          status: 'succeeded',
          stripe_payment_intent_id: typeof session.payment_intent === 'string' ? session.payment_intent : null,
        })
        .eq('stripe_session_id', session.id);

      await admin
        .from('photo_tests')
        .update({ status: 'queued', updated_at: new Date().toISOString() })
        .eq('id', testId)
        .eq('status', 'pending_payment');

      // Run the analysis in the same invocation but after the Stripe response.
      // waitUntil keeps the function alive (up to maxDuration) so processing
      // continues even after we return 200.
      waitUntil(
        processTest(testId).catch((err) =>
          console.error('processTest failed', err),
        ),
      );
    } else if (event.type === 'checkout.session.expired' || event.type === 'payment_intent.payment_failed') {
      const obj: any = event.data.object;
      if (obj?.metadata?.photo_test_id) {
        await admin
          .from('payment_history')
          .update({ status: 'failed' })
          .or(`stripe_session_id.eq.${obj.id},stripe_payment_intent_id.eq.${obj.id}`);
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
