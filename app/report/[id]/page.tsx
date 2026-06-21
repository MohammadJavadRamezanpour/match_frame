import { notFound } from 'next/navigation';
import Link from 'next/link';
import { AppHeader } from '@/components/header';
import { requireUser } from '@/lib/auth';
import { formatDate, gradient } from '@/lib/format';
import { signMany } from '@/lib/storage';
import { ReportView } from '@/components/report-view';

export const dynamic = 'force-dynamic';

export default async function ReportPage({ params }: { params: { id: string } }) {
  const { user, supabase } = await requireUser();

  const { data: test } = await supabase
    .from('photo_tests')
    .select('id, status, min_age, max_age, completed_at, created_at')
    .eq('id', params.id)
    .maybeSingle();
  if (!test) notFound();

  if (test.status !== 'completed') {
    return (
      <>
        <AppHeader email={user.email} />
        <main className="mx-auto max-w-[680px] px-6 pb-24 pt-12 text-center animate-fadeUp">
          <h1 className="m-0 mb-3 font-display text-[28px] font-medium">Your report isn&rsquo;t ready yet</h1>
          <p className="m-0 mb-6 text-ink-muted">
            We&rsquo;ll email you the moment it&rsquo;s done. You can come back here any time.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex h-12 items-center rounded-md border border-border-strong px-5 font-semibold text-ink no-underline hover:bg-surface-2"
          >
            Back to dashboard
          </Link>
        </main>
      </>
    );
  }

  const [{ data: photos }, { data: summary }, { data: nextSteps }] = await Promise.all([
    supabase
      .from('photos')
      .select('id, storage_path, position, photo_reports(rank, badge, lead_photo_reason, final_rank_description, vote_count)')
      .eq('photo_test_id', test.id),
    supabase
      .from('photo_test_reports')
      .select('id, overall_description, first_rank_explanation, second_rank_explanation, third_rank_explanation')
      .eq('photo_test_id', test.id)
      .maybeSingle(),
    supabase
      .from('next_steps')
      .select('text, position, photo_test_report_id')
      .order('position', { ascending: true }),
  ]);

  const totalVotes = (photos ?? []).reduce(
    (sum: number, p: any) => sum + (p.photo_reports?.vote_count ?? 0),
    0,
  ) || 100;

  const photoMap = new Map<string, string>(await signMany(supabase, (photos ?? []).map((p: any) => p.storage_path)));

  const ranked = (photos ?? [])
    .map((p: any, i: number) => ({
      id: p.id,
      n: p.position + 1,
      url: photoMap.get(p.storage_path) ?? null,
      rank: p.photo_reports?.rank ?? 999,
      badge: p.photo_reports?.badge ?? 'Photo',
      lead_reason: p.photo_reports?.lead_photo_reason ?? null,
      description: p.photo_reports?.final_rank_description ?? '',
      votes: p.photo_reports?.vote_count ?? 0,
      gradient: gradient(i),
    }))
    .sort((a, b) => a.rank - b.rank);

  const best = ranked[0];
  const top3 = ranked.slice(0, 3);
  const recs = (nextSteps ?? [])
    .filter((s: any) => s.photo_test_report_id === summary?.id)
    .map((s: any) => s.text);

  return (
    <>
      <AppHeader email={user.email} />
      <ReportView
        date={formatDate(test.completed_at ?? test.created_at)}
        minAge={test.min_age}
        maxAge={test.max_age}
        photoCount={ranked.length}
        totalVotes={totalVotes}
        best={best}
        ranked={ranked}
        top3={top3}
        explanations={{
          overall:
            summary?.overall_description ??
            'Your photos read as warm and genuine. The audience responded most to images where your face is clearly lit and you look relaxed.',
          first: summary?.first_rank_explanation ?? '',
          second: summary?.second_rank_explanation ?? '',
          third: summary?.third_rank_explanation ?? '',
        }}
        recommendations={recs.length > 0 ? recs : ['Lead with the top-ranked photo.', 'Move farther-away shots to the end of your profile.']}
        testId={test.id}
      />
    </>
  );
}
