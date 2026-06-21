'use client';

import { useState } from 'react';

export function DeleteAccount() {
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function doDelete() {
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/account', { method: 'DELETE' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Could not delete account.');
      window.location.href = '/';
    } catch (e: any) {
      setBusy(false);
      setErr(e.message);
    }
  }

  return (
    <section className="rounded-lg border border-danger bg-surface p-6">
      <h2 className="m-0 mb-1.5 font-sans text-[17px] font-semibold text-danger">Delete account &amp; data</h2>
      <p className="m-0 mb-4 text-[14px] text-ink-muted">
        This permanently removes your photos, reports, and account. We&rsquo;ll ask you to confirm once more.
      </p>
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="h-11 rounded-md border border-danger bg-danger-soft px-4 font-sans text-[14px] font-semibold text-danger hover:opacity-85"
        >
          Delete everything
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={doDelete}
            disabled={busy}
            className="h-11 rounded-md border border-danger bg-danger px-4 font-sans text-[14px] font-semibold text-white hover:opacity-85 disabled:opacity-60"
          >
            {busy ? 'Deleting…' : 'Yes, delete everything'}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            className="h-11 rounded-md border border-border-strong bg-transparent px-4 font-sans text-[14px] font-semibold text-ink hover:bg-surface-2"
          >
            Cancel
          </button>
        </div>
      )}
      {err && <p className="mt-3 text-[13px] text-danger">{err}</p>}
    </section>
  );
}
