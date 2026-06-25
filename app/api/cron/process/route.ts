import { NextResponse } from 'next/server';
import { processTest } from '@/lib/process-test';

export const runtime = 'nodejs';
export const maxDuration = 300;

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
  const result = await processTest(body.testId);
  return NextResponse.json(result, { status: 'ok' in result && result.ok ? 200 : 500 });
}

export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const result = await processTest();
  return NextResponse.json(result, { status: 'ok' in result && result.ok ? 200 : 500 });
}
