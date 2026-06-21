import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from './theme-toggle';
import { LockIcon } from './icons';

type Props = {
  email?: string | null;
  showNav?: boolean;
};

function initials(email?: string | null) {
  if (!email) return 'MF';
  const local = email.split('@')[0] ?? '';
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (local.slice(0, 2) || 'MF').toUpperCase();
}

export function AppHeader({ email, showNav = true }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-[color-mix(in_srgb,var(--bg)_86%,transparent)] backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-[1100px] items-center gap-4 px-6 py-3">
        <Link href={email ? '/dashboard' : '/'} className="flex items-center gap-2.5 text-ink no-underline">
          <Image
            src="/matchframe-logo.png"
            alt="MatchFrame"
            width={34}
            height={34}
            className="rounded-[9px]"
            priority
          />
          <span className="font-sans text-[18px] font-semibold tracking-tight">MatchFrame</span>
        </Link>
        {showNav && (
          <nav className="ml-2 flex gap-1">
            <Link
              href="/dashboard"
              className="inline-flex h-9 items-center rounded-lg px-3.5 text-[14px] font-semibold text-ink-muted no-underline hover:text-ink"
            >
              Dashboard
            </Link>
          </nav>
        )}
        <div className="flex-1" />
        <span className="hidden items-center gap-1.5 rounded-full bg-surface-2 px-2.5 py-1.5 text-[13px] font-medium text-ink-subtle sm:inline-flex">
          <LockIcon /> Private
        </span>
        <ThemeToggle />
        {email ? (
          <Link
            href="/account"
            aria-label="Account"
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-primary-soft text-[14px] font-semibold text-primary no-underline"
          >
            {initials(email)}
          </Link>
        ) : null}
      </div>
    </header>
  );
}
