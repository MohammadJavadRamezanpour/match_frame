import { AppHeader } from '@/components/header';
import { requireUser } from '@/lib/auth';
import { formatDate, formatMoney } from '@/lib/format';
import { AccountThemeRow } from '@/components/account-theme-row';
import { DeleteAccount } from '@/components/delete-account';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const { user, supabase } = await requireUser();

  const { data: payments } = await supabase
    .from('payment_history')
    .select('id, amount_cents, currency, description, created_at, status')
    .eq('user_id', user.id)
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false });

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto max-w-[680px] px-6 pb-28 pt-10 animate-fadeUp">
        <h1 className="m-0 mb-7 font-display text-[34px] font-medium">Account</h1>

        <section className="mb-4 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="m-0 mb-4 font-sans text-[17px] font-semibold">Profile</h2>
          <Row label="Email" value={user.email ?? ''} />
          <AccountThemeRow />
        </section>

        <section className="mb-4 rounded-lg border border-border bg-surface p-6 shadow-sm">
          <h2 className="m-0 mb-4 font-sans text-[17px] font-semibold">Payment history</h2>
          {(payments ?? []).length === 0 ? (
            <p className="m-0 py-2 text-[14px] text-ink-muted">No payments yet.</p>
          ) : (
            (payments ?? []).map((p: any) => (
              <div
                key={p.id}
                className="flex items-center justify-between border-b border-border py-3 last:border-0"
              >
                <div>
                  <div className="text-[15px] font-medium">{p.description ?? 'Photo test'}</div>
                  <div className="font-mono text-[12px] text-ink-subtle">{formatDate(p.created_at)}</div>
                </div>
                <span className="font-mono text-[15px] font-medium">{formatMoney(p.amount_cents, p.currency)}</span>
              </div>
            ))
          )}
        </section>

        <DeleteAccount />
      </main>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-[14px] text-ink-muted">{label}</span>
      <span className="text-[15px]">{value}</span>
    </div>
  );
}
