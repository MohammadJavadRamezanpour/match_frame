import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggle } from '@/components/theme-toggle';
import { LockIcon, StarIcon, InfoIcon } from '@/components/icons';

const steps = [
  {
    num: '1',
    title: 'Upload your photos',
    body: 'Add 2-10 of your real photos. They stay private and are never shown to real people.',
  },
  {
    num: '2',
    title: 'Pick the women who vote',
    body: 'Choose the age range of women you want to meet, we simulate an audience of women like them.',
  },
  {
    num: '3',
    title: 'Get your ranking',
    body: 'See which photo to lead with, with a clear, kind reason for every placement.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen animate-fadeIn">
      <header className="mx-auto flex max-w-[1140px] items-center gap-4 px-6 py-5">
        <div className="flex items-center gap-2.5">
          <Image src="/matchframe-logo.png" alt="MatchFrame" width={36} height={36} className="rounded-[10px]" />
          <span className="font-sans text-[19px] font-semibold tracking-tight">MatchFrame</span>
        </div>
        <div className="flex-1" />
        <ThemeToggle />
        <Link
          href="/signin"
          className="hidden h-[42px] items-center rounded-md px-4 text-[15px] font-semibold text-ink-muted no-underline hover:text-ink sm:inline-flex"
        >
          Sign in
        </Link>
        <Link
          href="/signup"
          className="inline-flex h-[42px] items-center rounded-md bg-primary px-5 text-[15px] font-semibold text-primary-fg no-underline shadow-sm hover:bg-primary-hover"
        >
          Get started
        </Link>
      </header>

      {/* Hero */}
      <section className="mx-auto grid max-w-[1140px] grid-cols-1 items-center gap-12 px-6 pb-10 pt-14 lg:grid-cols-2">
        <div>
          <h1 className="m-0 mb-5 font-display text-[clamp(38px,5.4vw,60px)] font-semibold leading-[1.06] tracking-tight">
            Let women pick<br />
            your <span className="text-primary">best</span> photo.
          </h1>
          <p className="mb-8 max-w-[520px] text-[19px] text-ink-muted">
            Upload your dating photos and an audience of simulated women tells you, calmly and clearly, which one to
            lead with, and why.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/signup"
              className="inline-flex h-[52px] items-center rounded-md bg-primary px-6 text-[16px] font-semibold text-primary-fg no-underline shadow-sm hover:bg-primary-hover"
            >
              Start your photo test
            </Link>
            <Link
              href="/report/sample"
              className="inline-flex h-[52px] items-center rounded-md border border-border-strong bg-surface px-6 text-[16px] font-semibold text-ink no-underline hover:bg-surface-2"
            >
              See a sample report
            </Link>
          </div>
          <p className="mt-5 flex flex-wrap items-center gap-3.5 text-[13px] text-ink-subtle">
            <span className="inline-flex items-center gap-1.5">
              <LockIcon /> Your photos stay private
            </span>
            <span>·</span>
            <span>No subscription</span>
            <span>·</span>
            <span>Results in minutes</span>
          </p>
        </div>

        {/* Report mockup */}
        <div className="relative">
          <div
            className="pointer-events-none absolute"
            style={{
              inset: '6% 8% 12% 8%',
              borderRadius: '30px',
              background:
                'radial-gradient(circle at 60% 35%, color-mix(in srgb, var(--primary) 26%, transparent), transparent 70%)',
              filter: 'blur(34px)',
            }}
          />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-md">
            <div className="flex items-center gap-1.5 border-b border-border px-3.5 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-[#E0655A]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#E5B23C]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#54B06B]" />
              <span className="ml-2 font-mono text-[11px] text-ink-subtle">matchframe.app/report</span>
            </div>
            <div className="p-5">
              <p className="m-0 mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
                Your report
              </p>
              <h3 className="m-0 mb-4 font-display text-[19px] font-semibold">The photo to lead with</h3>
              <div className="flex items-center gap-4">
                <MiniSpotlightPhoto />
                <div>
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-spotlight-soft px-2.5 py-1 text-[11px] font-semibold text-spotlight-fg">
                    <StarIcon width={11} height={11} /> Best photo
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-[30px] font-semibold text-spotlight-fg">87%</span>
                    <span className="font-mono text-[12px] text-ink-subtle">87 / 100</span>
                  </div>
                  <p className="m-0 mt-1.5 text-[13px] text-ink-muted">
                    Natural light, genuine smile, eyes clearly visible.
                  </p>
                </div>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <MiniRank rank="#2" pct="79%" />
                <MiniRank rank="#3" pct="71%" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-[1100px] px-6 py-12">
        <p className="m-0 mb-7 text-center text-[13px] font-semibold uppercase tracking-[0.12em] text-ink-subtle">
          How it works
        </p>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.num} className="rounded-lg border border-border bg-surface p-7 shadow-sm">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-md bg-primary-soft font-mono text-[16px] font-semibold text-primary">
                {s.num}
              </div>
              <h3 className="m-0 mb-2 font-sans text-[19px] font-semibold">{s.title}</h3>
              <p className="m-0 text-[15px] text-ink-muted">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Sample spotlight */}
      <section className="mx-auto max-w-[1100px] px-6 pb-12 pt-8">
        <div className="grid grid-cols-1 items-center gap-10 rounded-2xl border border-border bg-surface p-[clamp(24px,5vw,52px)] shadow-md md:grid-cols-2">
          <div>
            <p className="m-0 mb-3.5 text-[13px] font-semibold uppercase tracking-[0.12em] text-spotlight">
              The signature moment
            </p>
            <h2 className="m-0 mb-4 font-display text-[32px] font-medium leading-[1.1]">
              One photo gets the spotlight.
            </h2>
            <p className="m-0 mb-5 text-[16px] text-ink-muted">
              We never shout that a photo is &ldquo;bad.&rdquo; Your strongest image is framed in gold; the rest are
              ranked gently, with a reason for every placement.
            </p>
            <Link
              href="/report/sample"
              className="inline-flex h-[46px] items-center rounded-md border border-border-strong bg-transparent px-5 text-[15px] font-semibold text-ink no-underline hover:bg-surface-2"
            >
              View the full sample report →
            </Link>
          </div>
          <div className="grid place-items-center">
            <BigSpotlightPhoto />
          </div>
        </div>
      </section>

      {/* AI honesty */}
      <section className="mx-auto max-w-[1100px] px-6 pb-14">
        <div className="flex flex-wrap items-start gap-5 rounded-2xl bg-primary-soft p-[clamp(24px,4vw,40px)]">
          <div className="grid h-[46px] w-[46px] flex-shrink-0 place-items-center rounded-xl bg-surface text-primary">
            <InfoIcon />
          </div>
          <div className="min-w-[240px] flex-1">
            <h3 className="m-0 mb-2 font-sans text-[20px] font-semibold text-ink">
              The voters are AI, and we say so plainly.
            </h3>
            <p className="m-0 text-[16px] text-ink-muted">
              Every reaction comes from AI-simulated women modelled on the audience you choose, not real people seeing
              your face. It&rsquo;s a fast, private rehearsal before you post anywhere real.
            </p>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-[1100px] px-6 pb-20 text-center">
        <h2 className="m-0 mb-4 font-display text-[34px] font-medium leading-[1.1]">Better photos. Better matches.</h2>
        <Link
          href="/signup"
          className="inline-flex h-[52px] items-center rounded-md bg-primary px-7 text-[16px] font-semibold text-primary-fg no-underline shadow-sm hover:bg-primary-hover"
        >
          Start your photo test
        </Link>
      </section>

      <footer className="border-t border-border px-6 py-6 text-center text-[13px] text-ink-subtle">
        © 2026 MatchFrame · Private by design
      </footer>
    </div>
  );
}

function MiniSpotlightPhoto() {
  return (
    <div className="relative h-[130px] w-[104px] flex-shrink-0">
      <div
        className="pointer-events-none absolute"
        style={{
          inset: '-9px',
          borderRadius: '18px',
          background:
            'radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--spotlight) 48%, transparent), transparent 72%)',
          filter: 'blur(5px)',
        }}
      />
      <div
        className="absolute inset-0 overflow-hidden rounded-[11px]"
        style={{ background: 'linear-gradient(155deg,#c9d2dc,#8a97a8)' }}
      >
        <svg viewBox="0 0 104 130" className="block h-full w-full">
          <circle cx="52" cy="50" r="22" fill="rgba(255,255,255,.55)" />
          <path d="M16 130c0-22 16-37 36-37s36 15 36 37z" fill="rgba(255,255,255,.55)" />
        </svg>
      </div>
      <Corner top="5px" left="5px" sides="LT" radius="5px" size={16} thick="2.5px" />
      <Corner top="5px" right="5px" sides="RT" radius="5px" size={16} thick="2.5px" />
      <Corner bottom="5px" left="5px" sides="LB" radius="5px" size={16} thick="2.5px" />
      <Corner bottom="5px" right="5px" sides="RB" radius="5px" size={16} thick="2.5px" />
    </div>
  );
}

function BigSpotlightPhoto() {
  return (
    <div className="relative h-[248px] w-[200px]">
      <div
        className="pointer-events-none absolute"
        style={{
          inset: '-14px',
          borderRadius: '24px',
          background:
            'radial-gradient(circle at 50% 40%, color-mix(in srgb, var(--spotlight) 40%, transparent), transparent 70%)',
          filter: 'blur(6px)',
        }}
      />
      <div
        className="absolute inset-0 overflow-hidden rounded-2xl"
        style={{ background: 'linear-gradient(155deg,#c9d2dc,#8a97a8)' }}
      >
        <svg viewBox="0 0 200 248" className="block h-full w-full">
          <circle cx="100" cy="96" r="42" fill="rgba(255,255,255,.55)" />
          <path d="M30 248c0-44 31-74 70-74s70 30 70 74z" fill="rgba(255,255,255,.55)" />
        </svg>
      </div>
      <Corner top="8px" left="8px" sides="LT" radius="8px" size={24} thick="3px" />
      <Corner top="8px" right="8px" sides="RT" radius="8px" size={24} thick="3px" />
      <Corner bottom="8px" left="8px" sides="LB" radius="8px" size={24} thick="3px" />
      <Corner bottom="8px" right="8px" sides="RB" radius="8px" size={24} thick="3px" />
      <span
        className="absolute left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-spotlight px-3 py-1 font-sans text-[12px] font-semibold text-[#3a2a08] shadow-sm"
        style={{ top: '-12px', whiteSpace: 'nowrap' }}
      >
        <StarIcon width={12} height={12} /> Best photo
      </span>
    </div>
  );
}

function Corner({
  top,
  bottom,
  left,
  right,
  sides,
  radius,
  size,
  thick,
}: {
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  sides: 'LT' | 'RT' | 'LB' | 'RB';
  radius: string;
  size: number;
  thick: string;
}) {
  const styles: React.CSSProperties = { width: size, height: size, top, bottom, left, right };
  if (sides.includes('L')) styles.borderLeft = `${thick} solid var(--spotlight)`;
  if (sides.includes('R')) styles.borderRight = `${thick} solid var(--spotlight)`;
  if (sides.includes('T')) styles.borderTop = `${thick} solid var(--spotlight)`;
  if (sides.includes('B')) styles.borderBottom = `${thick} solid var(--spotlight)`;
  if (sides === 'LT') styles.borderTopLeftRadius = radius;
  if (sides === 'RT') styles.borderTopRightRadius = radius;
  if (sides === 'LB') styles.borderBottomLeftRadius = radius;
  if (sides === 'RB') styles.borderBottomRightRadius = radius;
  return <span className="absolute" style={styles} />;
}

function MiniRank({ rank, pct }: { rank: string; pct: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-md border border-border px-3 py-2">
      <span className="font-mono text-[12px] font-semibold text-ink-subtle">{rank}</span>
      <div
        className="h-7 w-[22px] rounded-[5px]"
        style={{ background: 'linear-gradient(155deg,#d2c9d8,#a08aa8)' }}
      />
      <span className="flex-1 text-[13px] font-medium">Strong supporting photo</span>
      <span className="font-mono text-[13px] font-semibold">{pct}</span>
    </div>
  );
}
