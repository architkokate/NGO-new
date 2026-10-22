import { useState, useId } from 'react';
import { Link } from 'react-router-dom';
import { MailIcon } from './Icons';
import {
  FormField,
  PasswordInput,
  PrimaryButton,
  AuthCard,
  validateEmail,
  validatePassword,
} from './AuthShared';
import { USERS, ROLE_LABEL } from '../services/seeds';

/* ── Main: LoginForm ─────────────────────────────────────── */
export default function LoginForm({ onLogin }) {
  const emailId    = useId();
  const passwordId = useId();
  const rememberId = useId();

  const [email,       setEmail]       = useState('');
  const [password,    setPassword]    = useState('');
  const [remember,    setRemember]    = useState(false);
  const [emailErr,    setEmailErr]    = useState('');
  const [passwordErr, setPasswordErr] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);

  const handleEmailBlur = () => {
    if (email || submitted) setEmailErr(validateEmail(email));
  };
  const handlePasswordBlur = () => {
    if (password || submitted) setPasswordErr(validatePassword(password));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitted(true);

    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailErr(eErr);
    setPasswordErr(pErr);

    if (eErr || pErr) {
      if (eErr) document.getElementById(emailId)?.focus();
      else      document.getElementById(passwordId)?.focus();
      return;
    }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);

    if (onLogin) {
      const lower = email.toLowerCase().trim();
      let matched = USERS.find((u) => {
        if (u.id.toLowerCase() === lower) return true;
        if (u.name.toLowerCase().includes(lower)) return true;
        return false;
      });
      if (!matched) {
        if (lower.includes('admin') || lower.includes('director')) matched = USERS[0];
        else if (lower.includes('manager') || lower.includes('cruz')) matched = USERS[1];
        else if (lower.includes('coord') || lower.includes('priya') || lower.includes('nair')) matched = USERS[2];
        else if (lower.includes('tomas') || lower.includes('weber') || lower.includes('emp')) matched = USERS[3];
        else if (lower.includes('grace') || lower.includes('mbeki') || lower.includes('vol')) matched = USERS[4];
        else matched = USERS[0];
      }
      onLogin(matched);
    } else {
      alert(`✅ Signed in as ${email}`);
    }
  };

  return (
    <AuthCard
      heading="Sign in to your account"
      subtext="Enter your details to continue."
      showTrust
    >
      <form
        className="login-form"
        onSubmit={handleSubmit}
        noValidate
        aria-label="Login form"
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
              onBlur={handleEmailBlur}
              disabled={loading}
              aria-invalid={!!emailErr}
              required
            />
          </div>
        </FormField>

        {/* ── Password ── */}
        <FormField id={passwordId} label="Password" error={passwordErr}>
          <PasswordInput
            id={passwordId}
            name="password"
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (passwordErr) setPasswordErr(validatePassword(e.target.value));
            }}
            onBlur={handlePasswordBlur}
            disabled={loading}
            hasError={!!passwordErr}
          />
        </FormField>

        {/* ── Remember me + Forgot password ── */}
        <div className="form-row">
          <label htmlFor={rememberId} className="checkbox-label">
            <input
              id={rememberId}
              type="checkbox"
              className="checkbox-input"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              disabled={loading}
            />
            <span className="checkbox-text">Remember me</span>
          </label>

          <Link to="/forgot-password" className="forgot-link">
            Forgot password?
          </Link>
        </div>

        {/* ── Submit ── */}
        <PrimaryButton loading={loading} loadingText="Signing in…">
          Sign In
        </PrimaryButton>

        {/* ── Sign-up prompt ── */}
        <p className="signup-prompt">
          Don't have an account?{' '}
          <Link to="/create-account" className="signup-link">
            Create account
          </Link>
        </p>

        {/* ── Quick Demo Sign-in ── */}
        <div style={{ marginTop: 22, paddingTop: 16, borderTop: '1px solid #F5EDE0' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#9B9089', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10, textAlign: 'center' }}>
            Quick Demo Sign-In
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
            {USERS.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => {
                  setEmail(u.role + '@sevavardhini.org');
                  setPassword('demo1234');
                  if (onLogin) onLogin(u);
                }}
                style={{
                  background: '#FFF9F2',
                  border: '1px solid #E8DDD4',
                  borderRadius: 20,
                  padding: '4px 10px',
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: '#292524',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#F47B20';
                  e.currentTarget.style.color = '#F47B20';
                  e.currentTarget.style.background = '#FFF3E6';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E8DDD4';
                  e.currentTarget.style.color = '#292524';
                  e.currentTarget.style.background = '#FFF9F2';
                }}
                title={`One-click demo sign in as ${u.name} (${ROLE_LABEL[u.role]})`}
              >
                {ROLE_LABEL[u.role] || u.name}
              </button>
            ))}
          </div>
        </div>
      </form>
    </AuthCard>
  );
}
