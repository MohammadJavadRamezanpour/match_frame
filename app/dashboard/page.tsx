import Link from 'next/link';
import { AppHeader } from '@/components/header';
import { requireUser } from '@/lib/auth';
import { formatDate, gradient } from '@/lib/format';
import { PlusIcon } from '@/components/icons';

export const dynamic = 'force-dynamic';

type DashboardRow = {
  id: string;
  status: 'pending_payment' | 'queued' | 'processing' | 'completed' | 'failed';
  created_at: string;
  photo_count: number;
};

const statusMap = {
  completed: {
    label: 'Completed',
    bg: 'var(--primary-soft)',
    fg: 'var(--primary)',
    dot: 'var(--primary)',
    actionLabel: 'View report',
    btnBg: 'var(--primary)',
    btnFg: 'var(--primary-fg)',
    btnBorder: 'var(--primary)',
    hrefBase: '/report/',
  },
  processing: {
    label: 'Processing',
    bg: 'var(--surface-2)',
    fg: 'var(--ink-muted)',
    dot: 'var(--spotlight)',
    actionLabel: 'View status',
    btnBg: 'transparent',
    btnFg: 'var(--ink)',
    btnBorder: 'var(--border-strong)',
    hrefBase: '/submitted/',
  },
  queued: {
    label: 'Queued',
    bg: 'var(--surface-2)',
    fg: 'var(--ink-muted)',
    dot: 'var(--spotlight)',
    actionLabel: 'View status',
    btnBg: 'transparent',
    btnFg: 'var(--ink)',
    btnBorder: 'var(--border-strong)',
    hrefBase: '/submitted/',
  },
  pending_payment: {
    label: 'Payment pending',
    bg: 'var(--surface-2)',
    fg: 'var(--ink-muted)',
    dot: 'var(--spotlight)',
    actionLabel: 'Complete payment',
    btnBg: 'transparent',
    btnFg: 'var(--ink)',
    btnBorder: 'var(--border-strong)',
    hrefBase: '/payment/',
  },
  failed: {
    label: 'Needs retry',
    bg: 'var(--danger-soft)',
    fg: 'var(--danger)',
    dot: 'var(--danger)',
    actionLabel: 'Try again',
    btnBg: 'transparent',
    btnFg: 'var(--ink)',
    btnBorder: 'var(--border-strong)',
    hrefBase: '/upload',
  },
} as const;

export default async function DashboardPage() {
  const { user, supabase } = await requireUser();

  const { data: tests } = await supabase
    .from('photo_tests')
    .select('id, status, created_at, photos(count)')
    .order('created_at', { ascending: false });

  const rows: DashboardRow[] = (tests ?? []).map((t: any) => ({
    id: t.id,
    status: t.status,
    created_at: t.created_at,
    photo_count: Array.isArray(t.photos) ? t.photos[0]?.count ?? 0 : 0,
  }));

  return (
    <>
      <AppHeader email={user.email} />
      <main className="mx-auto max-w-[1100px] px-6 pb-24 pt-10 animate-fadeUp">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="m-0 mb-1.5 font-display text-[36px] font-medium">Your photo tests</h1>
            <p className="m-0 text-[16px] text-ink-muted">Pick up a report, or start a fresh analysis.</p>
          </div>
          <Link
            href="/upload"
            className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 text-[16px] font-semibold text-primary-fg no-underline shadow-sm hover:bg-primary-hover"
          >
            <PlusIcon /> New photo test
          </Link>
        </div>

        {rows.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((r, i) => {
              const m = statusMap[r.status];
              return (
                <article
                  key={r.id}
                  className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-5 shadow-sm animate-fadeUp"
                  style={{ animationDelay: `${i * 70}ms` }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="m-0 mb-1 font-sans text-[18px] font-semibold">Photo test</h3>
                      <p className="m-0 font-mono text-[13px] text-ink-subtle">
                        {formatDate(r.created_at)} · {r.photo_count} {r.photo_count === 1 ? 'photo' : 'photos'}
                      </p>
                    </div>
                    <span
                      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[12px] font-semibold"
                      style={{ background: m.bg, color: m.fg }}
                    >
                      <span className="h-2 w-2 rounded-full" style={{ background: m.dot }} />
                      {m.label}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    {[0, 1, 2].map((g) => (
                      <div
                        key={g}
                        className="aspect-[3/4] flex-1 rounded-md"
                        style={{ background: gradient(g + i) }}
                      />
                    ))}
                  </div>
                  <Link
                    href={m.hrefBase === '/upload' ? '/upload' : `${m.hrefBase}${r.id}`}
                    className="inline-flex h-[42px] items-center justify-center rounded-md text-[14px] font-semibold no-underline hover:opacity-90"
                    style={{
                      border: `1px solid ${m.btnBorder}`,
                      background: m.btnBg,
                      color: m.btnFg,
                    }}
                  >
                    {m.actionLabel}
                  </Link>
                </article>
              );
            })}
          </div>
        )}
      </main>
    </>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
      <h2 className="m-0 mb-2 font-display text-[24px] font-medium">No photo tests yet</h2>
      <p className="m-0 mb-6 text-ink-muted">
        Build your first one in under a minute. Your photos stay private and are deleted after your report.
      </p>
      <Link
        href="/upload"
        className="inline-flex h-12 items-center gap-2 rounded-md bg-primary px-5 text-[15px] font-semibold text-primary-fg no-underline shadow-sm hover:bg-primary-hover"
      >
        <PlusIcon /> Start your first test
      </Link>
    </div>
  );
}
