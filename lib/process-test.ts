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

type ProcessResult =
  | { ok: true; id: string }
  | { ok: true; picked: null }
  | { ok: false; error: string };

export async function processTest(targetId?: string): Promise<ProcessResult> {
  const admin = createAdminClient();

  // Pick the specific test if provided, otherwise the oldest queued one.
  const query = admin.from('photo_tests').select('*').limit(1);
  const { data: test } = targetId
    ? await query.eq('id', targetId).maybeSingle()
    : await query.eq('status', 'queued').order('created_at', { ascending: true }).maybeSingle();
  if (!test) return { ok: true, picked: null };

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

    const photoReportRows = ranking.map((r) => ({
      photo_id: r.photo_id,
      rank: r.rank,
      badge: r.badge,
      lead_photo_reason: r.lead_photo_reason,
      final_rank_description: r.final_rank_description,
      vote_count: r.votes,
    }));
    await admin.from('photo_reports').upsert(photoReportRows, { onConflict: 'photo_id' });

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

    await admin
      .from('photo_tests')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', test.id);

    const { data: profile } = await admin
      .from('profiles')
      .select('email')
      .eq('id', test.user_id)
      .maybeSingle();
    if (profile?.email) {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
      const { subject, html, text } = reportReadyEmail({
        reportUrl: `${appUrl}/report/${test.id}`,
        firstBadge: ranking[0]?.badge ?? 'Best Main Profile Photo',
      });
      try {
        await resend().emails.send({ from: fromAddress(), to: profile.email, subject, html, text });
      } catch (err) {
        console.error('Resend send failed', err);
      }
    }

    return { ok: true, id: test.id };
  } catch (err: any) {
    console.error('process error', err);
    await admin
      .from('photo_tests')
      .update({ status: 'failed', updated_at: new Date().toISOString() })
      .eq('id', test.id);
    return { ok: false, error: err.message };
  }
}
