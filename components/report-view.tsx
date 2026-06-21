'use client';

import Link from 'next/link';
import { useState } from 'react';
import { PhotoFrame, PhotoTile } from './photo-frame';
import { StarIcon, CheckIcon, MailIcon } from './icons';

type RankedPhoto = {
  id: string;
  n: number;
  url: string | null;
  rank: number;
  badge: string;
  lead_reason: string | null;
  description: string;
  votes: number;
  gradient: string;
};

type Explanations = {
  overall: string;
  first: string;
  second: string;
  third: string;
};

type Props = {
  date: string;
  minAge: number;
  maxAge: number;
  photoCount: number;
  totalVotes: number;
  best: RankedPhoto;
  ranked: RankedPhoto[];
  top3: RankedPhoto[];
  explanations: Explanations;
  recommendations: string[];
  testId: string;
};

function badgeTone(badge: string) {
  const b = badge.toLowerCase();
  if (b.includes('best') || b.includes('main profile')) return 'gold';
  if (b.includes('strong') || b.includes('supporting')) return 'primary';
  return 'neutral';
}

const toneStyle: Record<'gold' | 'primary' | 'neutral', { bg: string; fg: string }> = {
  gold: { bg: 'var(--spotlight-soft)', fg: 'var(--spotlight-fg)' },
  primary: { bg: 'var(--primary-soft)', fg: 'var(--primary)' },
  neutral: { bg: 'var(--surface-2)', fg: 'var(--ink-muted)' },
};

export function ReportView({
  date,
  minAge,
  maxAge,
  photoCount,
  totalVotes,
  best,
  ranked,
  top3,
  explanations,
  recommendations,
  testId,
}: Props) {
  const bestPct = Math.round((best.votes / totalVotes) * 100);

  return (
    <main className="mx-auto max-w-[880px] px-6 pb-28 pt-10">
      <div className="animate-fadeUp">
        <p className="m-0 mb-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">
          Your report · {date}
        </p>
        <h1 className="m-0 mb-2 font-display text-[38px] font-medium">Here&rsquo;s the photo to lead with</h1>
        <p className="m-0 mb-9 max-w-[60ch] text-[17px] text-ink-muted">
          {totalVotes} AI-simulated women (ages {minAge}-{maxAge}) reacted to your {photoCount} photos. One stood out
          clearly as your strongest first impression.
        </p>
      </div>

      {/* Best photo */}
      <section
        className="mb-10 grid grid-cols-1 items-center gap-9 rounded-2xl border border-border bg-surface p-[clamp(24px,4vw,40px)] shadow-md animate-fadeUp md:grid-cols-[minmax(200px,260px)_1fr]"
        style={{ animationDelay: '90ms' }}
      >
        <div className="grid place-items-center">
          <PhotoFrame src={best.url} alt={`Photo ${best.n} — your strongest`} size="lg" />
        </div>
        <div>
          <span className="mb-3.5 inline-flex items-center gap-1.5 rounded-full bg-spotlight-soft px-3 py-1.5 font-sans text-[13px] font-semibold text-spotlight-fg">
            <StarIcon /> #1 · {best.badge}
          </span>
          <div className="mb-3 flex items-baseline gap-3.5">
            <span className="font-mono text-[40px] font-semibold text-spotlight-fg">{bestPct}%</span>
            <span className="font-mono text-[14px] text-ink-subtle">
              {best.votes} / {totalVotes} chose it first
            </span>
          </div>
          <p className="m-0 font-sans text-[17px] text-ink-muted">{best.lead_reason ?? best.description}</p>
        </div>
      </section>

      {/* Final ranking */}
      <section className="mb-10 animate-fadeUp" style={{ animationDelay: '140ms' }}>
        <h2 className="m-0 mb-4 font-sans text-[22px] font-semibold">Final ranking</h2>
        <div className="flex flex-col gap-2.5">
          {ranked.map((r, i) => {
            const pct = Math.round((r.votes / totalVotes) * 100);
            const tone = badgeTone(r.badge);
            return (
              <div
                key={r.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-surface px-4 py-3 shadow-sm animate-fadeUp"
                style={{ animationDelay: `${i * 70 + 200}ms` }}
              >
                <span className="w-7 flex-shrink-0 font-mono text-[15px] font-semibold text-ink-subtle">
                  #{i + 1}
                </span>
                <div className="h-[60px] w-[46px] flex-shrink-0 overflow-hidden rounded-md" style={{ background: r.gradient }}>
                  <PhotoTile src={r.url} alt={`Photo ${r.n}`} className="h-full w-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2.5">
                    <span className="text-[15px] font-semibold">Photo {r.n}</span>
                    <span
                      className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold"
                      style={{ background: toneStyle[tone].bg, color: toneStyle[tone].fg }}
                    >
                      {r.badge}
                    </span>
                  </div>
                  <p className="m-0 text-[13px] text-ink-subtle">{r.description}</p>
                </div>
                <div className="flex-shrink-0 text-right">
                  <div className="font-mono text-[17px] font-semibold text-ink">{pct}%</div>
                  <div className="font-mono text-[11px] text-ink-subtle">{r.votes} votes</div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Top 3 */}
      <section className="mb-10 animate-fadeUp" style={{ animationDelay: '180ms' }}>
        <h2 className="m-0 mb-4 font-sans text-[22px] font-semibold">Your top three, explained</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {top3.map((t, i) => {
            const tone = badgeTone(t.badge);
            const longText = [explanations.first, explanations.second, explanations.third][i] || t.description;
            const placement = i === 0 ? 'Use as your main photo' : i === 1 ? 'Use as photo #2' : 'Use as photo #3 or #4';
            return (
              <div
                key={t.id}
                className="flex flex-col gap-3.5 rounded-lg border border-border bg-surface p-5 shadow-sm"
              >
                <div className="relative aspect-[4/3] overflow-hidden rounded-xl" style={{ background: t.gradient }}>
                  <PhotoTile src={t.url} alt={`Photo ${t.n}`} className="h-full w-full" />
                  <span
                    className="absolute left-2.5 top-2.5 inline-flex rounded-full px-2.5 py-0.5 font-sans text-[11px] font-semibold"
                    style={{ background: toneStyle[tone].bg, color: toneStyle[tone].fg }}
                  >
                    #{i + 1}
                  </span>
                </div>
                <div>
                  <div className="mb-1 font-sans text-[14px] font-semibold text-primary">{placement}</div>
                  <p className="m-0 text-[14px] text-ink-muted">{longText}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Overall */}
      <section
        className="mb-7 rounded-2xl bg-surface-2 p-[clamp(22px,4vw,32px)] animate-fadeUp"
        style={{ animationDelay: '220ms' }}
      >
        <h2 className="m-0 mb-3 font-display text-[24px] font-medium">About your set overall</h2>
        <p className="m-0 text-[16px] text-ink-muted">{explanations.overall}</p>
      </section>

      {/* Recommendations */}
      <section className="mb-11 animate-fadeUp" style={{ animationDelay: '260ms' }}>
        <h2 className="m-0 mb-4 font-sans text-[22px] font-semibold">A few simple next steps</h2>
        <div className="flex flex-col gap-2.5">
          {recommendations.map((r, i) => (
            <div
              key={i}
              className="flex items-start gap-3.5 rounded-xl border border-border bg-surface px-4 py-4 shadow-sm"
            >
              <span className="grid h-[26px] w-[26px] flex-shrink-0 place-items-center rounded-md bg-primary-soft text-primary">
                <CheckIcon />
              </span>
              <p className="m-0 text-[15px] text-ink">{r}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <EmailCta testId={testId} />
    </main>
  );
}

function EmailCta({ testId }: { testId: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);
  async function send() {
    setState('sending');
    setMsg(null);
    try {
      const res = await fetch(`/api/reports/${testId}/email`, { method: 'POST' });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? 'Could not send the email.');
      setState('sent');
    } catch (e: any) {
      setState('error');
      setMsg(e.message);
    }
  }
  return (
    <div className="flex flex-wrap gap-3 animate-fadeUp" style={{ animationDelay: '300ms' }}>
      <button
        type="button"
        onClick={send}
        disabled={state === 'sending' || state === 'sent'}
        className="inline-flex h-[50px] items-center gap-2 rounded-md bg-primary px-6 font-sans text-[16px] font-semibold text-primary-fg shadow-sm hover:bg-primary-hover disabled:opacity-60"
      >
        <MailIcon />
        {state === 'sent' ? 'Sent — check your inbox' : state === 'sending' ? 'Sending…' : 'Email me this report'}
      </button>
      <Link
        href="/dashboard"
        className="inline-flex h-[50px] items-center justify-center rounded-md border border-border-strong bg-transparent px-6 font-sans text-[16px] font-semibold text-ink no-underline hover:bg-surface-2"
      >
        Back to dashboard
      </Link>
      {msg && <p className="basis-full text-[13px] text-danger">{msg}</p>}
    </div>
  );
}
