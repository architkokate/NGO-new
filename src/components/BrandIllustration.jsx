/**
 * BrandIllustration
 * A warm, minimal SVG illustration using only Saffron + Golden palette.
 * Responsive via viewBox — scales to parent container.
 */
export default function BrandIllustration() {
  return (
    <svg
      viewBox="0 0 440 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {/* ── Background soft blob ── */}
      <ellipse cx="220" cy="175" rx="195" ry="125" fill="#FFF3E6" />

      {/* ── Layered circles (abstract accent) ── */}
      <circle cx="340" cy="80" r="56" fill="#F9B233" opacity="0.18" />
      <circle cx="340" cy="80" r="36" fill="#F9B233" opacity="0.22" />
      <circle cx="340" cy="80" r="18" fill="#F9B233" opacity="0.55" />

      <circle cx="96" cy="240" r="44" fill="#F47B20" opacity="0.12" />
      <circle cx="96" cy="240" r="26" fill="#F47B20" opacity="0.18" />
      <circle cx="96" cy="240" r="12" fill="#F47B20" opacity="0.45" />

      {/* ── Main dashboard card (center) ── */}
      <rect x="100" y="90" width="240" height="155" rx="18" fill="white"
            filter="url(#card-shadow)" />

      {/* Card top bar */}
      <rect x="100" y="90" width="240" height="44" rx="18" fill="#F47B20" />
      <rect x="100" y="112" width="240" height="22" fill="#F47B20" />

      {/* Top bar dots */}
      <circle cx="123" cy="112" r="6" fill="rgba(255,255,255,0.5)" />
      <circle cx="143" cy="112" r="6" fill="rgba(255,255,255,0.5)" />
      <circle cx="163" cy="112" r="6" fill="rgba(255,255,255,0.8)" />

      {/* Top bar title text block */}
      <rect x="186" y="107" width="80" height="10" rx="5" fill="rgba(255,255,255,0.6)" />

      {/* Progress bar section */}
      <rect x="122" y="150" width="196" height="8" rx="4" fill="#F5EDE0" />
      <rect x="122" y="150" width="130" height="8" rx="4" fill="#F47B20" />

      <rect x="122" y="168" width="196" height="8" rx="4" fill="#F5EDE0" />
      <rect x="122" y="168" width="176" height="8" rx="4" fill="#F9B233" />

      <rect x="122" y="186" width="196" height="8" rx="4" fill="#F5EDE0" />
      <rect x="122" y="186" width="90" height="8" rx="4" fill="#F47B20" opacity="0.6" />

      {/* Stat pills */}
      <rect x="122" y="208" width="56" height="22" rx="8" fill="#FFF3E6" />
      <rect x="186" y="208" width="56" height="22" rx="8" fill="#FFF3E6" />
      <rect x="250" y="208" width="56" height="22" rx="8" fill="#F9B233" opacity="0.25" />

      <rect x="130" y="215" width="40" height="8" rx="4" fill="#F47B20" />
      <rect x="194" y="215" width="40" height="8" rx="4" fill="#F9B233" />
      <rect x="258" y="215" width="40" height="8" rx="4" fill="#F9B233" />

      {/* ── Floating mini card top-left ── */}
      <rect x="46" y="110" width="78" height="62" rx="12" fill="white"
            filter="url(#mini-shadow)" />
      <rect x="58" y="122" width="28" height="28" rx="8" fill="#F9B233" opacity="0.25" />
      <circle cx="72" cy="136" r="8" fill="#F9B233" />
      <rect x="94" y="122" width="20" height="7" rx="3.5" fill="#292524" opacity="0.15" />
      <rect x="94" y="133" width="14" height="5" rx="2.5" fill="#6B625A" opacity="0.2" />
      <rect x="58" y="155" width="54" height="6" rx="3" fill="#F47B20" opacity="0.4" />

      {/* ── Floating notification badge top-right ── */}
      <rect x="318" y="150" width="88" height="42" rx="12" fill="white"
            filter="url(#mini-shadow)" />
      <circle cx="334" cy="171" r="9" fill="#F47B20" opacity="0.15" />
      <circle cx="334" cy="171" r="5" fill="#F47B20" />
      <rect x="348" y="164" width="46" height="6" rx="3" fill="#292524" opacity="0.18" />
      <rect x="348" y="174" width="32" height="5" rx="2.5" fill="#6B625A" opacity="0.2" />

      {/* ── Floating chart card bottom-right ── */}
      <rect x="316" y="210" width="88" height="52" rx="12" fill="white"
            filter="url(#mini-shadow)" />
      {/* Mini bar chart */}
      <rect x="328" y="244" width="10" height="8" rx="2" fill="#F9B233" />
      <rect x="341" y="238" width="10" height="14" rx="2" fill="#F47B20" />
      <rect x="354" y="233" width="10" height="19" rx="2" fill="#F9B233" />
      <rect x="367" y="240" width="10" height="12" rx="2" fill="#F47B20" opacity="0.55" />
      <rect x="380" y="235" width="10" height="17" rx="2" fill="#F9B233" opacity="0.7" />
      <rect x="328" y="222" width="40" height="6" rx="3" fill="#292524" opacity="0.15" />

      {/* ── Decorative dashes ── */}
      <circle cx="200" cy="68" r="4" fill="#F9B233" opacity="0.55" />
      <circle cx="220" cy="60" r="3" fill="#F47B20" opacity="0.4" />
      <circle cx="240" cy="65" r="5" fill="#F9B233" opacity="0.4" />

      <circle cx="60" cy="185" r="3.5" fill="#F47B20" opacity="0.35" />
      <circle cx="378" cy="110" r="3" fill="#F9B233" opacity="0.5" />
      <circle cx="390" cy="125" r="4.5" fill="#F47B20" opacity="0.2" />

      {/* ── Definitions ── */}
      <defs>
        <filter id="card-shadow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="6" stdDeviation="14" floodColor="#29252420" />
        </filter>
        <filter id="mini-shadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="4" stdDeviation="8" floodColor="#29252418" />
        </filter>
      </defs>
    </svg>
  );
}
