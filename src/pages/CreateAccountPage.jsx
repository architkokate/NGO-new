import { useState, useId } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import BrandPanel from '../components/BrandPanel';
import {
  FormField, PasswordInput, PrimaryButton, AuthCard, validateEmail,
} from '../components/AuthShared';
import { MailIcon, ShieldIcon, ZapIcon, StarIcon } from '../components/Icons';

/* ──────────────────────────────────────────────────────────
   Password strength helpers
   ────────────────────────────────────────────────────────── */
const PWD_RULES = [
  { id: 'len',   label: 'At least 8 characters',   test: (v) => v.length >= 8 },
  { id: 'upper', label: 'One uppercase letter',     test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', label: 'One lowercase letter',     test: (v) => /[a-z]/.test(v) },
  { id: 'num',   label: 'One number',               test: (v) => /[0-9]/.test(v) },
];

function meetsAll(value) {
  return PWD_RULES.every((r) => r.test(value));
}

/* ── Password Requirements bar ── */
function PasswordRequirements({ value }) {
  if (!value) return null;
  return (
    <ul className="pwd-rules" aria-label="Password requirements">
      {PWD_RULES.map((rule) => {
        const ok = rule.test(value);
        return (
          <li key={rule.id} className={`pwd-rule ${ok ? 'pwd-rule--ok' : 'pwd-rule--fail'}`}>
            <span className="pwd-rule-dot" aria-hidden="true" />
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}

/* ──────────────────────────────────────────────────────────
   Success state
   ────────────────────────────────────────────────────────── */
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

function SuccessState() {
  const navigate = useNavigate();
  return (
    <div className="auth-success-state">
      <SuccessIcon />
      <h2 className="success-heading">Account created!</h2>
      <p className="success-subtext">
        Your account has been created successfully. You can now sign in and
        get started.
      </p>
      <button
        type="button"
        className="btn-primary btn-primary--block"
        onClick={() => navigate('/login')}
      >
        Continue to sign in
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Validators
   ────────────────────────────────────────────────────────── */
function validateName(v) {
  if (!v.trim()) return 'Full name is required.';
  if (v.trim().length < 2) return 'Name must be at least 2 characters.';
  return '';
}
function validateStrongPassword(v) {
  if (!v) return 'Password is required.';
  if (!meetsAll(v)) return 'Password does not meet all requirements.';
  return '';
}
function validateConfirm(pwd, confirm) {
  if (!confirm) return 'Please confirm your password.';
  if (pwd !== confirm) return 'Passwords do not match.';
  return '';
}

/* ──────────────────────────────────────────────────────────
   Page
   ────────────────────────────────────────────────────────── */
export default function CreateAccountPage() {
  const nameId     = useId();
  const emailId    = useId();
  const passwordId = useId();
  const confirmId  = useId();
  const termsId    = useId();

  const [name,       setName]       = useState('');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [confirm,    setConfirm]    = useState('');
  const [terms,      setTerms]      = useState(false);
  const [loading,    setLoading]    = useState(false);
  const [done,       setDone]       = useState(false);
  const [submitted,  setSubmitted]  = useState(false);

  const [nameErr,    setNameErr]    = useState('');
  const [emailErr,   setEmailErr]   = useState('');
  const [pwdErr,     setPwdErr]     = useState('');
  const [confirmErr, setConfirmErr] = useState('');
  const [termsErr,   setTermsErr]   = useState('');

  /* ── Live re-validate on change ── */
  const onNameChange    = (e) => { setName(e.target.value);    if (nameErr)    setNameErr(validateName(e.target.value)); };
  const onEmailChange   = (e) => { setEmail(e.target.value);   if (emailErr)   setEmailErr(validateEmail(e.target.value)); };
  const onPwdChange     = (e) => { setPassword(e.target.value); if (pwdErr)   setPwdErr(validateStrongPassword(e.target.value)); if (confirmErr && confirm) setConfirmErr(validateConfirm(e.target.value, confirm)); };
  const onConfirmChange = (e) => { setConfirm(e.target.value); if (confirmErr) setConfirmErr(validateConfirm(password, e.target.value)); };

  /* ── CTA disabled when required conditions not met ── */
  const ctaDisabled =
    loading ||
    !name.trim() ||
    !email.trim() ||
    !meetsAll(password) ||
    password !== confirm ||
    !terms;

  /* ── Submit ── */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const nErr = validateName(name);
    const eErr = validateEmail(email);
    const pErr = validateStrongPassword(password);
    const cErr = validateConfirm(password, confirm);
    const tErr = terms ? '' : 'You must accept the Terms of Service to continue.';

    setNameErr(nErr);
    setEmailErr(eErr);
    setPwdErr(pErr);
    setConfirmErr(cErr);
    setTermsErr(tErr);

    if (nErr || eErr || pErr || cErr || tErr) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1800));
    setLoading(false);
    setDone(true);
  };

  const brandHeadline = (
    <h1 className="brand-headline">
      Join<br />
      <span>us</span>
    </h1>
  );

  return (
    <div className="login-page">
      <BrandPanel
        variant="signup"
        headline={brandHeadline}
        subtext="Create your account and get started."
        chips={[
          { icon: <ShieldIcon />, label: 'Enterprise-grade security' },
          { icon: <ZapIcon />,    label: 'Set up in minutes' },
          { icon: <StarIcon />,   label: 'Trusted by thousands' },
        ]}
        ariaLabel="Create account section"
      />

      {done ? (
        <div className="login-panel">
          <div className="login-card" role="main">
            <SuccessState />
          </div>
        </div>
      ) : (
        <AuthCard
          heading="Create your account"
          subtext="Fill in your details to get started."
        >
          <form
            className="login-form"
            onSubmit={handleSubmit}
            noValidate
            aria-label="Create account form"
          >
            {/* ── Full Name ── */}
            <FormField id={nameId} label="Full name" error={nameErr}>
              <div className="input-wrapper">
                <span className="input-icon" aria-hidden="true">
                  {/* User icon */}
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 20c0-4 3.582-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  id={nameId}
                  type="text"
                  name="name"
                  autoComplete="name"
                  className={`form-input${nameErr ? ' input-error' : ''}`}
                  placeholder="Enter your full name"
                  value={name}
                  onChange={onNameChange}
                  onBlur={() => { if (name || submitted) setNameErr(validateName(name)); }}
                  disabled={loading}
                  aria-invalid={!!nameErr}
                  required
                />
              </div>
            </FormField>

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
                  onChange={onEmailChange}
                  onBlur={() => { if (email || submitted) setEmailErr(validateEmail(email)); }}
                  disabled={loading}
                  aria-invalid={!!emailErr}
                  required
                />
              </div>
            </FormField>

            {/* ── Password ── */}
            <FormField id={passwordId} label="Password" error={pwdErr}>
              <PasswordInput
                id={passwordId}
                name="password"
                autoComplete="new-password"
                placeholder="Create a password"
                value={password}
                onChange={onPwdChange}
                onBlur={() => { if (password || submitted) setPwdErr(validateStrongPassword(password)); }}
                disabled={loading}
                hasError={!!pwdErr}
              />
              <PasswordRequirements value={password} />
            </FormField>

            {/* ── Confirm Password ── */}
            <FormField id={confirmId} label="Confirm password" error={confirmErr}>
              <PasswordInput
                id={confirmId}
                name="confirm-password"
                autoComplete="new-password"
                placeholder="Confirm your password"
                value={confirm}
                onChange={onConfirmChange}
                onBlur={() => { if (confirm || submitted) setConfirmErr(validateConfirm(password, confirm)); }}
                disabled={loading}
                hasError={!!confirmErr}
              />
            </FormField>

            {/* ── Terms ── */}
            <div className="form-group">
              <label htmlFor={termsId} className="checkbox-label checkbox-label--terms">
                <input
                  id={termsId}
                  type="checkbox"
                  className="checkbox-input"
                  checked={terms}
                  onChange={(e) => {
                    setTerms(e.target.checked);
                    if (termsErr) setTermsErr('');
                  }}
                  disabled={loading}
                />
                <span className="checkbox-text">
                  I agree to the{' '}
                  <a href="#terms" className="signup-link terms-link"
                     onClick={(e) => e.preventDefault()}>
                    Terms of Service
                  </a>
                  {' '}and{' '}
                  <a href="#privacy" className="signup-link terms-link"
                     onClick={(e) => e.preventDefault()}>
                    Privacy Policy
                  </a>
                </span>
              </label>
              {termsErr && (
                <p className="field-error" role="alert" aria-live="polite">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style={{ width: 13, height: 13, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                    <circle cx="12" cy="16" r="0.8" fill="currentColor" />
                  </svg>
                  {termsErr}
                </p>
              )}
            </div>

            {/* ── Submit ── */}
            <PrimaryButton
              loading={loading}
              disabled={ctaDisabled}
              loadingText="Creating account…"
            >
              Create account
            </PrimaryButton>

            {/* ── Sign-in prompt ── */}
            <p className="signup-prompt">
              Already have an account?{' '}
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
