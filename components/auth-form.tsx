'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { GoogleIcon, LockIcon } from './icons';
import { Button, Input, Label } from './ui';

type Mode = 'signin' | 'signup';

export function AuthForm({ mode, next }: { mode: Mode; next?: string }) {
  const router = useRouter();
  const supabase = createClient();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignin = mode === 'signin';
  const target = next && next.startsWith('/') ? next : '/dashboard';

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = isSignin
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({
            email,
            password,
            options: { emailRedirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(target)}` },
          });
      if (error) {
        setError(error.message);
        return;
      }
      router.push(target);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(target)}` },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="flex min-h-screen flex-col animate-fadeIn">
      <header className="px-6 py-5">
        <Link href="/" className="inline-flex items-center gap-2.5 text-ink no-underline">
          <Image src="/matchframe-logo.png" alt="MatchFrame" width={32} height={32} className="rounded-[9px]" />
          <span className="font-sans text-[18px] font-semibold">MatchFrame</span>
        </Link>
      </header>
      <div className="grid flex-1 place-items-center px-6 py-6">
        <div className="w-full max-w-[400px] animate-fadeUp">
          <h1 className="m-0 mb-2 text-center font-display text-[34px] font-medium">
            {isSignin ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="m-0 mb-7 text-center text-[15px] text-ink-muted">
            {isSignin ? 'Sign in to see your photo reports.' : 'Start your first photo test in minutes.'}
          </p>
          <form
            onSubmit={submit}
            className="rounded-lg border border-border bg-surface p-7 shadow-sm"
          >
            <button
              type="button"
              onClick={google}
              className="flex h-[46px] w-full items-center justify-center gap-2.5 rounded-md border border-border-strong bg-transparent text-[15px] font-semibold text-ink hover:bg-surface-2"
            >
              <GoogleIcon /> Continue with Google
            </button>
            <div className="my-4 flex items-center gap-3 text-[13px] text-ink-subtle">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mb-4"
            />
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              required
              minLength={8}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mb-5"
            />
            {error && (
              <p className="mb-4 rounded-md bg-danger-soft px-3 py-2 text-[13px] text-danger">{error}</p>
            )}
            <Button type="submit" size="lg" loading={loading} className="w-full">
              {isSignin ? 'Sign in' : 'Create account'}
            </Button>
          </form>
          <p className="m-0 mt-5 text-center text-[14px] text-ink-muted">
            {isSignin ? 'New to MatchFrame? ' : 'Already have an account? '}
            <Link
              href={isSignin ? '/signup' : '/signin'}
              className="text-primary font-semibold no-underline"
            >
              {isSignin ? 'Create one' : 'Sign in'}
            </Link>
          </p>
          <p className="m-0 mt-5 flex items-center justify-center gap-1.5 text-center text-[13px] text-ink-subtle">
            <LockIcon /> Your photos and email are kept private and encrypted.
          </p>
        </div>
      </div>
    </div>
  );
}
