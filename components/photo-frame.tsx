/* Best-photo viewfinder frame — the signature element of MatchFrame.
   Used only on the rank #1 photo. */
import Image from 'next/image';

type Props = {
  src?: string | null;
  alt: string;
  size?: 'lg' | 'md' | 'sm';
  spotlight?: boolean;
};

const sizeMap = {
  lg: { w: 220, h: 272, bracket: 26, corner: 8, inset: '-18px', radius: '28px' },
  md: { w: 200, h: 248, bracket: 24, corner: 8, inset: '-14px', radius: '24px' },
  sm: { w: 104, h: 130, bracket: 16, corner: 5, inset: '-9px', radius: '18px' },
} as const;

export function PhotoFrame({ src, alt, size = 'lg', spotlight = true }: Props) {
  const s = sizeMap[size];
  return (
    <div className="relative" style={{ width: s.w, height: s.h }}>
      {spotlight && (
        <div
          className="absolute animate-halo"
          style={{
            inset: s.inset,
            borderRadius: s.radius,
            background:
              'radial-gradient(circle at 50% 38%, color-mix(in srgb, var(--spotlight) 45%, transparent), transparent 72%)',
            filter: 'blur(8px)',
            opacity: 0,
          }}
        />
      )}
      <div
        className="absolute inset-0 overflow-hidden rounded-2xl"
        style={{ background: 'linear-gradient(155deg,#c9d2dc,#8a97a8)' }}
      >
        {src ? (
          <Image src={src} alt={alt} fill className="object-cover" sizes={`${s.w}px`} />
        ) : (
          <svg viewBox="0 0 220 272" className="block h-full w-full" preserveAspectRatio="xMidYMid slice">
            <circle cx="110" cy="104" r="46" fill="rgba(255,255,255,.55)" />
            <path d="M34 272c0-48 34-80 76-80s76 32 76 80z" fill="rgba(255,255,255,.55)" />
          </svg>
        )}
      </div>
      {spotlight &&
        ([
          { top: 8, left: 8, bl: 0, br: 0, tr: 0, tl: s.corner, borders: ['L', 'T'] },
          { top: 8, right: 8, tl: 0, bl: 0, br: 0, tr: s.corner, borders: ['R', 'T'] },
          { bottom: 8, left: 8, tl: 0, tr: 0, br: 0, bl: s.corner, borders: ['L', 'B'] },
          { bottom: 8, right: 8, tl: 0, tr: 0, bl: 0, br: s.corner, borders: ['R', 'B'] },
        ] as const).map((b, i) => (
          <span
            key={i}
            className="absolute"
            style={{
              width: s.bracket,
              height: s.bracket,
              top: 'top' in b ? b.top : undefined,
              bottom: 'bottom' in b ? b.bottom : undefined,
              left: 'left' in b ? b.left : undefined,
              right: 'right' in b ? b.right : undefined,
              borderLeft: b.borders.includes('L') ? '3px solid var(--spotlight)' : undefined,
              borderRight: b.borders.includes('R') ? '3px solid var(--spotlight)' : undefined,
              borderTop: b.borders.includes('T') ? '3px solid var(--spotlight)' : undefined,
              borderBottom: b.borders.includes('B') ? '3px solid var(--spotlight)' : undefined,
              borderTopLeftRadius: b.tl || undefined,
              borderTopRightRadius: b.tr || undefined,
              borderBottomLeftRadius: b.bl || undefined,
              borderBottomRightRadius: b.br || undefined,
            }}
          />
        ))}
    </div>
  );
}

/* Plain photo (no spotlight) — used for non-rank-1 photos */
export function PhotoTile({
  src,
  alt,
  className = '',
}: {
  src?: string | null;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-xl bg-[linear-gradient(155deg,#c9d2dc,#8a97a8)] ${className}`}>
      {src ? (
        <Image src={src} alt={alt} fill className="object-cover" sizes="200px" />
      ) : (
        <svg viewBox="0 0 120 160" className="block h-full w-full" preserveAspectRatio="xMidYMid slice">
          <circle cx="60" cy="60" r="26" fill="rgba(255,255,255,.5)" />
          <path d="M18 160c0-28 19-46 42-46s42 18 42 46z" fill="rgba(255,255,255,.5)" />
        </svg>
      )}
    </div>
  );
}
