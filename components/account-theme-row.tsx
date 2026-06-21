'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function AccountThemeRow() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const current = mounted ? resolvedTheme ?? theme ?? 'light' : 'light';
  return (
    <div className="flex items-center justify-between border-b border-border py-2.5 last:border-0">
      <span className="text-[14px] text-ink-muted">Appearance</span>
      <button
        type="button"
        onClick={() => setTheme(current === 'dark' ? 'light' : 'dark')}
        className="inline-flex items-center gap-2 rounded-md border border-border-strong bg-bg px-3 py-1.5 font-sans text-[13px] font-semibold text-ink"
      >
        {mounted ? (current === 'dark' ? 'Dark' : 'Light') : 'Light'}
      </button>
    </div>
  );
}
