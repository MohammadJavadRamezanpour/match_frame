'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { LockIcon, PlusIcon, UploadIcon, XIcon } from './icons';
import { Button } from './ui';

type LocalPhoto = {
  id: string;             // client uuid
  file: File;
  previewUrl: string;
  storagePath?: string;   // filled after upload
  uploading: boolean;
  error?: string;
};

const AUDIENCES = [
  { id: 'w2129', label: 'Women, 21-29', min: 21, max: 29 },
  { id: 'w2534', label: 'Women, 25-34', min: 25, max: 34 },
  { id: 'w3039', label: 'Women, 30-39', min: 30, max: 39 },
  { id: 'w3545', label: 'Women, 35-45', min: 35, max: 45 },
];

const MAX_PHOTOS = 10;
const MIN_PHOTOS = 2;
const MAX_BYTES = 10 * 1024 * 1024;

export function UploadFlow({ userId }: { userId: string }) {
  const supabase = createClient();
  const router = useRouter();
  const [photos, setPhotos] = useState<LocalPhoto[]>([]);
  const [audience, setAudience] = useState(AUDIENCES[1]);
  const [submitting, setSubmitting] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const dragSource = useRef<number | null>(null);

  function pickFiles() {
    inputRef.current?.click();
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);
    const remaining = MAX_PHOTOS - photos.length;
    if (remaining <= 0) return;
    const accepted = files.slice(0, remaining);
    for (const file of accepted) {
      if (!/^image\/(jpe?g|png)$/.test(file.type)) {
        setGlobalError('Only JPG or PNG photos are supported.');
        continue;
      }
      if (file.size > MAX_BYTES) {
        setGlobalError('Each photo must be 10 MB or smaller.');
        continue;
      }
      const localId = crypto.randomUUID();
      const previewUrl = URL.createObjectURL(file);
      setPhotos((cur) => [...cur, { id: localId, file, previewUrl, uploading: true }]);
      uploadOne(localId, file).catch((err) => {
        setPhotos((cur) =>
          cur.map((p) => (p.id === localId ? { ...p, uploading: false, error: err.message } : p)),
        );
      });
    }
  }

  async function uploadOne(localId: string, file: File) {
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const path = `${userId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('photos').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
    if (error) throw new Error(error.message);
    setPhotos((cur) =>
      cur.map((p) => (p.id === localId ? { ...p, uploading: false, storagePath: path } : p)),
    );
  }

  function removePhoto(localId: string) {
    setPhotos((cur) => {
      const target = cur.find((p) => p.id === localId);
      if (target?.storagePath) {
        // best-effort remove from storage
        supabase.storage.from('photos').remove([target.storagePath]).catch(() => {});
      }
      if (target) URL.revokeObjectURL(target.previewUrl);
      return cur.filter((p) => p.id !== localId);
    });
  }

  function onDragStart(i: number) {
    dragSource.current = i;
  }
  function onDragOver(e: React.DragEvent) {
    e.preventDefault();
  }
  function onDrop(target: number) {
    const src = dragSource.current;
    dragSource.current = null;
    if (src === null || src === target) return;
    setPhotos((cur) => {
      const next = [...cur];
      const [moved] = next.splice(src, 1);
      next.splice(target, 0, moved);
      return next;
    });
  }

  async function submit() {
    setGlobalError(null);
    if (photos.length < MIN_PHOTOS) {
      setGlobalError(`Add at least ${MIN_PHOTOS} photos to continue.`);
      return;
    }
    if (photos.some((p) => !p.storagePath)) {
      setGlobalError('Wait for all photos to finish uploading.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/photo-tests', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          min_age: audience.min,
          max_age: audience.max,
          photos: photos.map((p) => p.storagePath),
        }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        throw new Error(j.error ?? 'Could not create the photo test.');
      }
      const { id } = await res.json();
      router.push(`/payment/${id}`);
    } catch (err: any) {
      setGlobalError(err.message);
      setSubmitting(false);
    }
  }

  const ready = photos.length >= MIN_PHOTOS && photos.every((p) => p.storagePath) && !submitting;

  return (
    <main className="mx-auto max-w-[760px] px-6 pb-32 pt-10 animate-fadeUp">
      <p className="m-0 mb-2 text-[13px] font-semibold uppercase tracking-[0.1em] text-ink-subtle">New photo test</p>
      <h1 className="m-0 mb-7 font-display text-[34px] font-medium">Add your photos</h1>

      <button
        type="button"
        onClick={pickFiles}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
        className="mb-3.5 block w-full rounded-lg border-2 border-dashed border-border-strong bg-surface px-6 py-9 text-center hover:border-primary"
      >
        <div className="mx-auto mb-3.5 grid h-[52px] w-[52px] place-items-center rounded-xl bg-primary-soft text-primary">
          <UploadIcon />
        </div>
        <p className="m-0 mb-1 text-[16px] font-semibold">Drag photos here, or tap to browse</p>
        <p className="m-0 text-[13px] text-ink-subtle">2-10 photos · JPG or PNG · up to 10 MB each</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            if (inputRef.current) inputRef.current.value = '';
          }}
        />
      </button>
      <p className="mb-5 text-center text-[13px] text-ink-subtle">
        {photos.length} of {MAX_PHOTOS} added · drag a photo to reorder
      </p>

      <div className="mb-9 grid grid-cols-[repeat(auto-fill,minmax(120px,1fr))] gap-3.5">
        {photos.map((p, i) => (
          <div
            key={p.id}
            draggable
            onDragStart={() => onDragStart(i)}
            onDragOver={onDragOver}
            onDrop={() => onDrop(i)}
            className="group relative aspect-[3/4] cursor-grab overflow-hidden rounded-xl bg-surface-2 shadow-sm active:cursor-grabbing"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.previewUrl} alt={`Photo ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" />
            <span className="absolute left-2 top-2 rounded-full bg-black/45 px-2 py-0.5 font-mono text-[11px] font-medium text-white">
              {i === 0 ? 'Lead' : `#${i + 1}`}
            </span>
            <button
              type="button"
              aria-label="Remove photo"
              onClick={() => removePhoto(p.id)}
              className="absolute right-1.5 top-1.5 grid h-[26px] w-[26px] place-items-center rounded-full border-0 bg-black/50 text-white"
            >
              <XIcon />
            </button>
            {p.uploading && (
              <span className="absolute inset-0 grid place-items-center bg-black/40 text-[11px] font-medium text-white">
                Uploading…
              </span>
            )}
            {p.error && (
              <span className="absolute inset-x-0 bottom-0 bg-danger-soft px-2 py-1 text-[11px] font-medium text-danger">
                {p.error}
              </span>
            )}
          </div>
        ))}
        {photos.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={pickFiles}
            className="grid aspect-[3/4] place-items-center rounded-xl border-2 border-dashed border-border-strong bg-transparent text-ink-subtle hover:border-primary hover:text-primary"
          >
            <PlusIcon width={26} height={26} />
          </button>
        )}
      </div>

      <h2 className="m-0 mb-1.5 font-sans text-[20px] font-semibold">Which women should vote?</h2>
      <p className="m-0 mb-4 text-[14px] text-ink-muted">
        We&rsquo;ll simulate an audience of women in the age range you want to meet.
      </p>
      <div className="mb-10 flex flex-wrap gap-2.5">
        {AUDIENCES.map((a) => {
          const selected = a.id === audience.id;
          return (
            <button
              key={a.id}
              type="button"
              onClick={() => setAudience(a)}
              className="rounded-md px-4 py-2.5 text-[14px] font-semibold"
              style={{
                border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-strong)'}`,
                background: selected ? 'var(--primary-soft)' : 'var(--surface)',
                color: selected ? 'var(--primary)' : 'var(--ink-muted)',
              }}
            >
              {a.label}
            </button>
          );
        })}
      </div>

      {globalError && (
        <p className="mb-3 rounded-md bg-danger-soft px-3 py-2 text-[13px] text-danger">{globalError}</p>
      )}

      <div
        className="sticky bottom-0 flex items-center gap-3 py-4"
        style={{ background: 'linear-gradient(to top, var(--bg) 70%, transparent)' }}
      >
        <p className="m-0 flex flex-1 items-center gap-1.5 text-[13px] text-ink-subtle">
          <LockIcon /> Photos are deleted after your report unless you save them.
        </p>
        <Button size="lg" onClick={submit} disabled={!ready} loading={submitting}>
          Continue to payment →
        </Button>
      </div>
    </main>
  );
}
