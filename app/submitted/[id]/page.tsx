import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { AppHeader } from '@/components/header';
import { requireUser } from '@/lib/auth';
import { CheckIcon, GridIcon, LockIcon, MailIcon } from '@/components/icons';

export const dynamic = 'force-dynamic';

export default async function SubmittedPage({ params }: { params: { id: string } }) {
  const { user, supabase } = await requireUser();
  const { data: test } = await supabase
    .from('photo_tests')
    .select('id, status')
    .eq('id', params.id)
    .maybeSingle();
  if (!test) notFound();
  if (test.status === 'completed') redirect(`/report/${test.id}`);
  if (test.status === 'pending_payment') redirect(`/payment/${test.id}`);

  return (
    <>
      <AppHeader email={user.email} />
      <main className="grid min-h-[78vh] place-items-center px-6 py-12 animate-fadeIn">
        <div className="w-full max-w-[480px] text-center">
          <div className="relative mx-auto mb-6 h-[84px] w-[84px]">
            <div
              className="absolute animate-halo"
              style={{
                inset: '-10px',
                borderRadius: '50%',
                background:
                  'radial-gradient(circle, color-mix(in srgb, var(--success) 30%, transparent), transparent 70%)',
                filter: 'blur(6px)',
                opacity: 0,
              }}
            />
            <div
              className="absolute inset-0 grid place-items-center rounded-full text-success"
              style={{
                background: 'color-mix(in srgb, var(--success) 16%, var(--surface))',
                border: '1px solid color-mix(in srgb, var(--success) 40%, transparent)',
              }}
            >
              <CheckIcon width={38} height={38} className="animate-pop" />
            </div>
          </div>
          <h1 className="m-0 mb-2.5 font-display text-[28px] font-semibold">
            Payment received, your photos are in the queue
          </h1>
          <p className="m-0 mb-7 text-[16px] text-ink-muted">
            A simulated audience is now reviewing your photos. Results are ready in{' '}
            <strong className="text-ink">6 to 24 hours</strong>, this gives the vote time to settle into a clear,
            reliable ranking.
          </p>

          <div className="mb-6 rounded-lg border border-border bg-surface p-2 text-left shadow-sm">
            <div className="flex items-start gap-3.5 p-4">
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                <MailIcon />
              </span>
              <div>
                <div className="mb-0.5 font-sans text-[15px] font-semibold">
                  We&rsquo;ll email you the moment it&rsquo;s ready
                </div>
                <div className="text-[14px] text-ink-muted">
                  A note goes to <span className="font-mono text-[13px]">{user.email}</span> with a link to your report.
                </div>
              </div>
            </div>
            <div className="mx-4 h-px bg-border" />
            <div className="flex items-start gap-3.5 p-4">
              <span className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                <GridIcon />
              </span>
              <div>
                <div className="mb-0.5 font-sans text-[15px] font-semibold">Or find it on your dashboard</div>
                <div className="text-[14px] text-ink-muted">
                  This test now shows as &ldquo;Processing&rdquo; there, and switches to your full report when
                  it&rsquo;s done.
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/dashboard"
              className="inline-flex h-[50px] items-center justify-center rounded-md bg-primary px-6 font-sans text-[16px] font-semibold text-primary-fg no-underline shadow-sm hover:bg-primary-hover"
            >
              Go to dashboard
            </Link>
            <Link
              href="/upload"
              className="inline-flex h-[50px] items-center justify-center rounded-md border border-border-strong bg-transparent px-6 font-sans text-[16px] font-semibold text-ink no-underline hover:bg-surface-2"
            >
              Start another test
            </Link>
          </div>
          <p className="m-0 mt-4 inline-flex items-center gap-1.5 text-[13px] text-ink-subtle">
            <LockIcon /> Your photos stay private and are deleted after your report unless you save them.
          </p>
        </div>
      </main>
    </>
  );
}
