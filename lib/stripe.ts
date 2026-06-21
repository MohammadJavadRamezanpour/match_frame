import Stripe from 'stripe';

let _stripe: Stripe | null = null;

export function getStripe() {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error('STRIPE_SECRET_KEY is not set');
    _stripe = new Stripe(key, { apiVersion: '2024-09-30.acacia' });
  }
  return _stripe;
}

export function priceId() {
  const id = process.env.STRIPE_PRICE_ID;
  if (!id) throw new Error('STRIPE_PRICE_ID is not set');
  return id;
}

// Cache the resolved Price so the payment page doesn't fetch it on every render.
let _priceCache: { amount: number; currency: string; expires: number } | null = null;

export async function getPriceAmount(): Promise<{ amount: number; currency: string }> {
  const now = Date.now();
  if (_priceCache && _priceCache.expires > now) {
    return { amount: _priceCache.amount, currency: _priceCache.currency };
  }
  const price = await getStripe().prices.retrieve(priceId());
  if (price.unit_amount == null) {
    throw new Error(`Stripe price ${priceId()} has no unit_amount`);
  }
  _priceCache = {
    amount: price.unit_amount,
    currency: price.currency,
    expires: now + 5 * 60 * 1000, // 5 min
  };
  return { amount: price.unit_amount, currency: price.currency };
}
