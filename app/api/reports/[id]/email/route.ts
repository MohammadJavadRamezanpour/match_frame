import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { resend, fromAddress } from '@/lib/resend';
import { reportReadyEmail } from '@/lib/email-templates';

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  if (params.id === 'sample') {
    return NextResponse.json({ error: 'sample_report_cannot_be_emailed' }, { status: 400 });
  }
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: 'unauthenticated' }, { status: 401 });

  const { data: test } = await supabase
    .from('photo_tests')
    .select('id, status')
    .eq('id', params.id)
    .maybeSingle();
  if (!test) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (test.status !== 'completed') return NextResponse.json({ error: 'not_ready' }, { status: 409 });

  const { data: firstReport } = await supabase
    .from('photos')
    .select('photo_reports(badge, rank)')
    .eq('photo_test_id', test.id);
  const badge =
    (firstReport ?? [])
      .map((r: any) => r.photo_reports)
      .filter(Boolean)
      .sort((a: any, b: any) => a.rank - b.rank)[0]?.badge ?? 'Best Main Profile Photo';

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? new URL(_request.url).origin;
  const { subject, html, text } = reportReadyEmail({
    reportUrl: `${appUrl}/report/${test.id}`,
    firstBadge: badge,
  });

  try {
    await resend().emails.send({ from: fromAddress(), to: user.email, subject, html, text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'send_failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
