'use client';

import { useState } from 'react';
import { Button } from './ui';
import { LockIcon } from './icons';

export function CheckoutButton({ testId, total }: { testId: string; total: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function go() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ testId }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Could not start checkout.');
      }
      const { url } = await res.json();
      if (!url) throw new Error('Checkout URL missing');
      window.location.href = url;
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Button size="lg" loading={loading} onClick={go} className="w-full">
        <LockIcon /> Pay {total} securely
      </Button>
      {error && <p className="mt-3 rounded-md bg-danger-soft px-3 py-2 text-[13px] text-danger">{error}</p>}
    </>
  );
}
