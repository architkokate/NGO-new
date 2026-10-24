import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import BrandPanel from '../components/BrandPanel';
import { FormField, PrimaryButton, AuthCard, validateEmail } from '../components/AuthShared';
import { MailIcon, ShieldIcon, StarIcon } from '../components/Icons';

/* ── Success icon ───────────────────────────────────────── */
function SuccessIcon() {
  return (
    <div className="success-icon-wrap" aria-hidden="true">
      <div className="success-icon-ring success-icon-ring--outer" />
      <div className="success-icon-ring success-icon-ring--inner" />
      <div className="success-icon-core">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"
             width="28" height="28">
          <path d="M8 17L13 22L24 10" stroke="white" strokeWidth="2.5"
                strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}

/* ── Success State ──────────────────────────────────────── */
function SuccessState({ email }) {
  return (
    <div className="auth-success-state">
      <SuccessIcon />
      <h2 className="success-heading">Check your inbox</h2>
      <p className="success-subtext">
        If an account exists with{' '}
        <strong className="success-email">{email}</strong>, we've sent you
        a link to reset your password. Check your spam folder if you don't
        see it within a few minutes.
      </p>
      <Link to="/login" className="btn-primary btn-primary--block">
        Back to sign in
      </Link>
      <p className="signup-prompt" style={{ marginTop: '12px' }}>
        Didn't receive it?{' '}
        <button
          type="button"
          className="signup-link btn-link"
          onClick={() => window.location.reload()}
        >
          Try again
        </button>
      </p>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────── */
export default function ForgotPasswordPage() {
  const emailId = useId();

  const [email,    setEmail]    = useState('');
  const [emailErr, setEmailErr] = useState('');
  const [loading,  setLoading]  = useState(false);
  const [done,     setDone]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleBlur = () => {
    if (email || submitted) setEmailErr(validateEmail(email));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);
    const err = validateEmail(email);
    setEmailErr(err);
    if (err) {
      document.getElementById(emailId)?.focus();
      return;
    }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setLoading(false);
    setDone(true);
  };

  const brandHeadline = (
    <h1 className="brand-headline">
      Let's get<br />
      <span>you back in.</span>
    </h1>
  );

  return (
    <div className="login-page">
      <BrandPanel
        variant="forgot"
        headline={brandHeadline}
        subtext="Forgot your password? No worries. Enter your email and we'll help you get back into your account."
        
        ariaLabel="Forgot password section"
      />

      {done ? (
        /* ── Success card ── */
        <div className="login-panel">
          <div className="login-card" role="main">
            <SuccessState email={email} />
          </div>
        </div>
      ) : (
        /* ── Form card ── */
        <AuthCard
          heading="Forgot your password?"
          subtext="Enter the email address associated with your account and we'll send you a password reset link."
        >
          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Forgot password form"
          >
            {/* ── Email ── */}
            <FormField id={emailId} label="Email address" error={emailErr}>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  <MailIcon />
                </span>
                <input
                  id={emailId}
                  type="email"
                  name="email"
                  autoComplete="email"
                  className={`form-input${emailErr ? ' input-error' : ''}`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailErr) setEmailErr(validateEmail(e.target.value));
                  }}
                  onBlur={handleBlur}
                  disabled={loading}
                  aria-invalid={!!emailErr}
                  required
                />
              </div>
            </FormField>

            {/* ── Submit ── */}
            <PrimaryButton loading={loading} loadingText="Sending link…">
              Send reset link
            </PrimaryButton>

            {/* ── Back to login ── */}
            <p className="signup-prompt">
              Remember your password?{' '}
              <Link to="/login" className="signup-link">
                Sign in
              </Link>
            </p>
          </form>
        </AuthCard>
      )}
    </div>
  );
}
