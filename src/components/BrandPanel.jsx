import HeroPhotoComposition from './HeroPhotoComposition';
import sevavardhiniLogo from '../assets/sevavardhini-logo.png';

/**
 * BrandPanel
 * The left half of the split-screen layout.
 *
 * Props:
 *   headline  – JSX or string for the heading
 *   subtext   – supporting paragraph
 *   ariaLabel – section accessibility label
 *   variant   – 'login' | 'forgot' | 'signup'
 */
export default function BrandPanel({
  headline,
  subtext,
  ariaLabel = 'Welcome section',
  variant = 'login',
}) {
  return (
    <section className="brand-panel" aria-label={ariaLabel}>
      <div className="brand-content">

        {/* Logo */}
        <div className="brand-logo">
          <img
            src={sevavardhiniLogo}
            alt="Sevavardhini logo"
            className="brand-logo-image"
          />
          <div className="brand-logo-text">
            <span className="brand-logo-hindi">सेवावर्धिनी</span>
            <span className="brand-logo-tagline">एक विश्वासार्ह सहकारी</span>
          </div>
        </div>
        {/* Hero Photo Composition */}
        <div className="brand-illustration" aria-hidden="true">
          <HeroPhotoComposition variant={variant} />
        </div>

        {/* Headline */}
        {headline ?? (
          <h1 className="brand-headline">
            Welcome
            <br />
            <span>back</span>
          </h1>
        )}

        {/* Supporting text */}
        {subtext && (
          <p className="brand-subtext">{subtext}</p>
        )}

      </div>
    </section>
  );
}