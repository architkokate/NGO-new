/**
 * Shared, reusable primitives used across all auth pages.
 * FormField, PasswordInput, PrimaryButton, AuthCard.
 */
import { useState, useId } from 'react';
import {
  EyeIcon, EyeOffIcon, AlertCircleIcon,
  ShieldIcon, ZapIcon,
} from './Icons';

/* ──────────────────────────────────────────────────────────
   FormField — label + slot + inline error
   ────────────────────────────────────────────────────────── */
export function FormField({ id, label, error, children }) {
  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        {label}
      </label>
      {children}
      {error && (
        <p className="field-error" role="alert" aria-live="polite">
          <AlertCircleIcon />
          {error}
        </p>
      )}
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   PasswordInput — controlled input with show/hide toggle
   ────────────────────────────────────────────────────────── */
export function PasswordInput({
  id,
  name = 'password',
  autoComplete = 'current-password',
  placeholder = 'Enter your password',
  value,
  onChange,
  onBlur,
  disabled,
  hasError,
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="input-wrapper">
      <span className="input-icon" aria-hidden="true">
        {/* Lock icon inline to avoid import cycle */}
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <rect x="5" y="11" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.6" />
          <path d="M8 11V7a4 4 0 0 1 8 0v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </span>
      <input
        id={id}
        type={show ? 'text' : 'password'}
        name={name}
        autoComplete={autoComplete}
        className={`form-input has-toggle${hasError ? ' input-error' : ''}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        aria-invalid={!!hasError}
        required
      />
      <button
        type="button"
        className="password-toggle"
        onClick={() => setShow((v) => !v)}
        aria-label={show ? 'Hide password' : 'Show password'}
        tabIndex={0}
      >
        {show ? <EyeOffIcon /> : <EyeIcon />}
      </button>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   PrimaryButton — full-width saffron CTA
   ────────────────────────────────────────────────────────── */
export function PrimaryButton({ loading, disabled, loadingText, children, ...rest }) {
  return (
    <button
      type="submit"
      className="btn-primary"
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <>
          <span className="btn-spinner" aria-hidden="true" />
          {loadingText || 'Please wait…'}
        </>
      ) : (
        children
      )}
    </button>
  );
}

/* ──────────────────────────────────────────────────────────
   AuthCard — white card + optional trust badges
   ────────────────────────────────────────────────────────── */
export function AuthCard({ heading, subtext, children, showTrust = false }) {
  return (
    <div className="login-panel">
      <div className="login-card" role="main">
        <header className="card-header">
          <h2 className="card-heading">{heading}</h2>
          {subtext && <p className="card-subtext">{subtext}</p>}
        </header>

        {children}

        {showTrust && (
          <div className="trust-badges" aria-label="Security and trust information">
            <div className="trust-item">
              <ShieldIcon />
              <span>256-bit SSL</span>
            </div>
            <div className="trust-item">
              <ZapIcon />
              <span>99.9% uptime</span>
            </div>
            <div className="trust-item">
              <ShieldIcon />
              <span>GDPR compliant</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────
   Validators (shared)
   ────────────────────────────────────────────────────────── */
export function validateEmail(value) {
  if (!value.trim()) return 'Email address is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
    return 'Please enter a valid email address.';
  return '';
}

export function validatePassword(value) {
  if (!value) return 'Password is required.';
  if (value.length < 6) return 'Password must be at least 6 characters.';
  return '';
}
