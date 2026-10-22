import { LogoIcon, ShieldIcon, ZapIcon, StarIcon } from './Icons';
import HeroPhotoComposition from './HeroPhotoComposition';

const DEFAULT_CHIPS = [
  { icon: <ShieldIcon />, label: 'Enterprise-grade security' },
  { icon: <ZapIcon />,    label: 'Lightning fast' },
  { icon: <StarIcon />,   label: 'Trusted by thousands' },
];

/**
 * BrandPanel
 * The left half of the split-screen layout.
 * Accepts optional props to customise headline, subtext, chips, and photo hero variant per page.
 *
 * Props:
 *   headline     – JSX or string for the h1 (default: "Welcome back")
 *   subtext      – string for supporting paragraph
 *   chips        – array of { icon, label } (default: DEFAULT_CHIPS)
 *   ariaLabel    – section aria-label (default: "Welcome section")
 *   variant      – 'login' | 'forgot' | 'signup' (default: 'login')
 */
export default function BrandPanel({
  headline,
  subtext,
  chips = DEFAULT_CHIPS,
  ariaLabel = 'Welcome section',
  variant = 'login',
}) {
  return (
    <section className="brand-panel" aria-label={ariaLabel}>
      <div className="brand-content">

        {/* Logo */}
        <div className="brand-logo" role="img" aria-label="Sevavardhini company logo">
          <div className="brand-logo-mark">
            <LogoIcon />
          </div>
          <span className="brand-logo-name">
            Seva<span>vardhini</span>
          </span>
        </div>

        {/* Hero Photo Composition */}
        <div className="brand-illustration" aria-hidden="true">
          <HeroPhotoComposition variant={variant} />
        </div>

        {/* Headline */}
        {headline ?? (
          <h1 className="brand-headline">
            Welcome<br />
            <span>back</span>
          </h1>
        )}

        {/* Supporting text */}
        {subtext && (
          <p className="brand-subtext">{subtext}</p>
        )}

        {/* Feature chips */}
        {chips && chips.length > 0 && (
          <div className="brand-features" role="list" aria-label="Key features">
            {chips.map((chip) => (
              <div key={chip.label} className="brand-chip" role="listitem">
                {chip.icon}
                <span>{chip.label}</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
