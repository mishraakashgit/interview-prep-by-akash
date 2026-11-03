/**
 * pillsdev brand mark: a tilted capsule, mint half with two dots, white half with a ">_" prompt.
 * Colours are the brand kit's own, so the pill looks the same in both themes; light mode adds
 * the kit's grey outline (--pill-outline) so the white half doesn't vanish on a white page.
 */
export function PillLogo({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden className="pill-logo">
      <g transform="rotate(-40 32 32)">
        <path d="M32 19H19a13 13 0 0 0 0 26h13z" fill="#34d399" />
        <path d="M32 19h13a13 13 0 0 1 0 26H32z" fill="#f6f7fb" />
        <rect x="6" y="19" width="52" height="26" rx="13" fill="none" stroke="var(--pill-outline)" strokeWidth="2" />
        <line x1="32" y1="19" x2="32" y2="45" stroke="#0e1116" strokeWidth="2.4" />
        <circle cx="17" cy="33.5" r="2.6" fill="#2ba87c" />
        <circle cx="24.5" cy="36.5" r="1.6" fill="#2ba87c" />
        {/* ">_" prompt, proportions taken from the brand kit: a narrow chevron and a low underscore. */}
        <g stroke="#0e1116" strokeWidth="1.9" fill="none" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="35.3,27.4 41,30.5 35.3,33.6" />
          <line x1="42.8" y1="36.2" x2="49.1" y2="36.2" />
        </g>
      </g>
    </svg>
  );
}

/** "pills" in the text colour, "dev" in brand mint, set in the brand's monospace. */
export function Wordmark() {
  return (
    <span className="wordmark">
      pills<em>dev</em>
    </span>
  );
}
