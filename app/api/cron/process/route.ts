import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { signMany } from '@/lib/storage';
import {
  analysePhotos,
  runVotingRounds,
  aggregateRanking,
  generateReportText,
} from '@/lib/ai-analysis';
import { resend, fromAddress } from '@/lib/resend';
import { reportReadyEmail } from '@/lib/email-templates';

export const runtime = 'nodejs';
export const maxDuration = 300; // allow up to 5 min on Vercel

function authorized(request: Request) {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const auth = request.headers.get('authorization') ?? '';
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  const provided =
    request.headers.get('x-cron-secret') ||
    bearer ||
    new URL(request.url).searchParams.get('secret') ||
    '';
  return provided === expected;
}

export async function POST(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const body = (await request.json().catch(() => ({}))) as { testId?: string };
  return runOne(body.testId);
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  return runOne();
}

async function runOne(targetId?: string) {
  const admin = createAdminClient();
  // Pick the oldest queued test if no specific id given.
  const query = admin.from('photo_tests').select('*').limit(1);
  const { data: test } = targetId
    ? await query.eq('id', targetId).maybeSingle()
    : await query.eq('status', 'queued').order('created_at', { ascending: true }).maybeSingle();
  if (!test) return NextResponse.json({ ok: true, picked: null });

  // Mark as processing (idempotent)
  await admin
    .from('photo_tests')
    .update({ status: 'processing', updated_at: new Date().toISOString() })
    .eq('id', test.id);

  try {
    const { data: photoRows } = await admin
      .from('photos')
      .select('id, storage_path, position')
      .eq('photo_test_id', test.id)
      .order('position', { ascending: true });

    if (!photoRows || photoRows.length < 2) throw new Error('Not enough photos to process.');

    const urlMap = await signMany(admin, photoRows.map((p) => p.storage_path));
    const photoInputs = photoRows
      .map((p) => ({ id: p.id, url: urlMap.get(p.storage_path) ?? '' }))
      .filter((p) => p.url);

    const findings = await analysePhotos(photoInputs);
    const votes = await runVotingRounds(photoInputs, findings, test.min_age, test.max_age);
    const ranking = aggregateRanking(photoInputs, votes, findings);
    const reportText = await generateReportText(photoInputs, ranking, findings);

    // Write photo_reports (one row per photo)
    const photoReportRows = ranking.map((r) => ({
      photo_id: r.photo_id,
      rank: r.rank,
      badge: r.badge,
      lead_photo_reason: r.lead_photo_reason,
      final_rank_description: r.final_rank_description,
      vote_count: r.votes,
    }));
    await admin.from('photo_reports').upsert(photoReportRows, { onConflict: 'photo_id' });

    // photo_test_report
    const { data: trReport } = await admin
      .from('photo_test_reports')
      .upsert(
        {
          photo_test_id: test.id,
          overall_description: reportText.overall_description,
          first_rank_explanation: reportText.first_rank_explanation,
          second_rank_explanation: reportText.second_rank_explanation,
          third_rank_explanation: reportText.third_rank_explanation,
        },
        { onConflict: 'photo_test_id' },
      )
      .select('id')
      .single();

    if (trReport) {
      await admin.from('next_steps').delete().eq('photo_test_report_id', trReport.id);
      const stepRows = reportText.next_steps.slice(0, 6).map((text, i) => ({
        photo_test_report_id: trReport.id,
        text,
        position: i,
      }));
      if (stepRows.length > 0) await admin.from('next_steps').insert(stepRows);
    }

    // Persist a synthetic Vote row per persona vote (so the votes table is populated).
    // We attach votes to a single shared "system" voter row by-vote — to keep the schema
    // honest we don't create real Voter rows per persona here; the voters table is reserved
    // for future curated personas. Skip if Vote insert is undesired.
    // (Intentionally left as a no-op for now.)

    await admin
      .from('photo_tests')
      .update({ status: 'completed', completed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', test.id);

    // Email the user
    const { data: profile } = await admin.from('profiles').select('email').eq('id', test.user_id).maybeSingle();
    if (profile?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
      const { subject, html, text } = reportReadyEmail({
        reportUrl: `${appUrl}/report/${test.id}`,
        firstBadge: ranking[0]?.badge ?? 'Best Main Profile Photo',
      });
      try {
        await resend().emails.send({ from: fromAddress(), to: profile.email, subject, html, text });
      } catch (err) {
        // Email failures shouldn't fail the run; log only.
        console.error('Resend send failed', err);
      }
    }

    return NextResponse.json({ ok: true, id: test.id });
  } catch (err: any) {
    console.error('process error', err);
    await admin
      .from('photo_tests')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', test.id);
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
