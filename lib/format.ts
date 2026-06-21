export function formatDate(d: string | Date | null | undefined) {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d) : d;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatMoney(amount: number, currency: string = 'USD') {
  // Stripe amounts for most currencies are in the smallest unit (e.g. cents).
  // The few zero-decimal currencies (JPY, KRW, etc.) are already whole units.
  const zeroDecimal = new Set(['BIF', 'CLP', 'DJF', 'GNF', 'JPY', 'KMF', 'KRW', 'MGA', 'PYG', 'RWF', 'UGX', 'VND', 'VUV', 'XAF', 'XOF', 'XPF']);
  const code = currency.toUpperCase();
  const value = zeroDecimal.has(code) ? amount : amount / 100;
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: code }).format(value);
  } catch {
    return `${value.toFixed(zeroDecimal.has(code) ? 0 : 2)} ${code}`;
  }
}

// Back-compat: account page still calls formatUSD on payment_history rows.
export function formatUSD(cents: number) {
  return formatMoney(cents, 'USD');
}

// 6 stable gradient slots used as photo placeholders before storage URLs resolve.
export const PLACEHOLDER_GRADIENTS = [
  'linear-gradient(155deg,#c9d2dc,#8a97a8)',
  'linear-gradient(155deg,#d8cdc2,#a8978a)',
  'linear-gradient(155deg,#cdd6ce,#94a89a)',
  'linear-gradient(155deg,#d2c9d8,#a08aa8)',
  'linear-gradient(155deg,#dcd3c9,#b8a890)',
  'linear-gradient(155deg,#c9d8d6,#8aa8a4)',
];

export function gradient(i: number) {
  return PLACEHOLDER_GRADIENTS[i % PLACEHOLDER_GRADIENTS.length];
}
