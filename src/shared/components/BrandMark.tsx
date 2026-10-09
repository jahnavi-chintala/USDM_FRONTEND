import { useId } from 'react';

/** The iDigitise hexagon mark: a protocol page with a verified badge. Decorative. */
export function BrandMark({ size = 40 }: { size?: number }) {
  // Several marks can be on one page; each needs its own gradient id.
  const gradient = `brand-gradient-${useId().replace(/:/g, '')}`;
  return (
    <svg width={size} height={size} viewBox="0 0 72 74" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6F63FF" />
          <stop offset=".55" stopColor="#1D86FF" />
          <stop offset="1" stopColor="#14CBDE" />
        </linearGradient>
      </defs>
      <path
        d="M36 4 64 20v34L36 70 8 54V20z"
        fill="none"
        stroke={`url(#${gradient})`}
        strokeWidth="4.5"
        strokeLinejoin="round"
      />
      <path d="M26 20h15l8 8v23a3 3 0 0 1-3 3H26a3 3 0 0 1-3-3V23a3 3 0 0 1 3-3z" fill="#FFFFFF" />
      <path d="M41 20v5a3 3 0 0 0 3 3h5z" fill="#AFC8FF" />
      <rect x="27" y="31" width="9" height="2.6" rx="1.3" fill="#07125E" />
      <rect x="27" y="37" width="7" height="2.6" rx="1.3" fill="#07125E" />
      <rect x="27" y="43" width="8" height="2.6" rx="1.3" fill="#07125E" />
      <rect x="39" y="31" width="3" height="3" rx=".8" fill="#1D86FF" />
      <rect x="44" y="31" width="3" height="3" rx=".8" fill="#14CBDE" />
      <rect x="39" y="37" width="3" height="3" rx=".8" fill="#14CBDE" />
      <rect x="44" y="37" width="3" height="3" rx=".8" fill="#1D86FF" />
      <rect x="39" y="43" width="3" height="3" rx=".8" fill="#1D86FF" />
      <rect x="44" y="43" width="3" height="3" rx=".8" fill="#14CBDE" />
      <circle cx="52" cy="54" r="7.5" fill="#07125E" />
      <circle cx="52" cy="54" r="6" fill={`url(#${gradient})`} />
      <path
        d="M48.8 54.2l2.2 2.2 4.2-4.4"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
