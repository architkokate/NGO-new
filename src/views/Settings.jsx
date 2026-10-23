
import React, { useState } from "react";
import {
  Sun,
  Moon,
  Database,
  ShieldCheck,
  Bell,
  Palette,
  Eye,
  EyeOff,
  Download,
  Mail,
  Phone,
  Globe,
  LockKeyhole,
  LogOut,
  CheckCircle2,
  Settings2,
} from "lucide-react";

import { Avatar, Btn, inputStyle } from "../components/Primitives";
import { ROLE_LABEL } from "../services/seeds";
import { exportToJSON } from "../services/storage";

// Replace these with the organisation's verified details.
const ORGANISATION = {
  name: "सेवावर्धिनी",
  englishName: "Sevavardhini",
  description: "NGO Management System",
  email: "",
  phone: "",
  website: "",
};

const ACCENT = "#E89A3C";
const ACCENT_DARK = "#F0B66E";

export default function SettingsView({
  t,
  mode,
  toggle,
  sessionUser,
  onLogout,
  notify,
  data,
}) {
  const [pw, setPw] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const [notifPrefs, setNotifPrefs] = useState({
    tasks: true,
    leave: true,
    attendance: false,
    announcements: true,
  });

  const accent = mode === "dark" ? ACCENT_DARK : ACCENT;
  const subtle = t.inkSoft || "#707382";

  const sectionStyle = {
    background: t.surface,
    border: `1px solid ${t.line}`,
    borderRadius: 12,
    overflow: "hidden",
    minWidth: 0,
  };

  const sectionHeaderStyle = {
    padding: "17px 20px 15px",
    borderBottom: `1px solid ${t.line}`,
  };

  const headingStyle = {
    display: "flex",
    alignItems: "center",
    gap: 9,
    margin: 0,
    fontSize: 15,
    fontWeight: 700,
    color: t.ink,
  };

  const descriptionStyle = {
    color: subtle,
    fontSize: 13,
    lineHeight: 1.55,
    margin: "5px 0 0",
  };

  const dividerStyle = {
    border: 0,
    borderTop: `1px solid ${t.line}`,
    margin: 0,
  };

  const rowStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "16px 20px",
    flexWrap: "wrap",
  };

  const inputBoxStyle = {
    ...inputStyle(t),
    width: "100%",
    boxSizing: "border-box",
  };

  const updatePreference = (key) => {
    setNotifPrefs((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
  };

  const changePw = (e) => {
    e.preventDefault();

    if (!pw.current.trim()) {
      notify("Enter your current password.");
      return;
    }

    if (pw.next.length < 4) {
      notify("New password must be at least 4 characters.");
      return;
    }

    if (pw.next !== pw.confirm) {
      notify("New passwords do not match.");
      return;
    }

    // This validates the form only. Connect your authentication
    // service here to actually update the user's password.
    notify(
      "Password details validated. Authentication integration is required to save the change."
    );
  };

  const handleBackup = () => {
    if (!data) {
      notify("No application data is available to export.");
      return;
    }

    try {
      exportToJSON(data);
      notify("Backup export started.");
    } catch (error) {
      console.error("Backup export failed:", error);
      notify("Unable to export the backup. Please try again.");
    }
  };

  const recordCount = (key) =>
    Array.isArray(data?.[key]) ? data[key].length : 0;

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1280,
        margin: "0 auto",
        padding: "4px 0 0",
        boxSizing: "border-box",
        color: t.ink,
      }}
    >
      {/* Page heading */}
      <header style={{ marginBottom: 24 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 7,
            color: accent,
            fontSize: 11,
            fontWeight: 750,
            letterSpacing: "0.1em",
          }}
        >
          <Settings2 size={14} />
          ACCOUNT & PREFERENCES
        </div>

        <h1
          style={{
            fontSize: 27,
            lineHeight: 1.25,
            fontWeight: 720,
            letterSpacing: "-0.035em",
            margin: 0,
            color: t.ink,
          }}
        >
          Settings
        </h1>

        <p style={{ ...descriptionStyle, marginTop: 7 }}>
          Manage your security, workspace preferences and account.
        </p>
      </header>

      {/* Account summary */}
      <section style={{ ...sectionStyle, marginBottom: 22 }}>
        <div style={rowStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              minWidth: 0,
            }}
          >
            <Avatar
              t={t}
              initials={(sessionUser?.name || "U")
                .split(" ")
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
              size={48}
            />

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  overflowWrap: "anywhere",
                }}
              >
                {sessionUser?.name || "Account"}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: subtle,
                  marginTop: 4,
                  overflowWrap: "anywhere",
                }}
              >
                {sessionUser?.email || "Signed-in user"}
              </div>

              <span
                style={{
                  display: "inline-block",
                  marginTop: 8,
                  padding: "4px 9px",
                  borderRadius: 5,
                  background: t.chipBg,
                  color: t.ink,
                  fontSize: 11,
                  fontWeight: 650,
                }}
              >
                {ROLE_LABEL?.[sessionUser?.role] ||
                  sessionUser?.role ||
                  "Member"}
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              color: t.success || "#397653",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <CheckCircle2 size={16} />
            Active session
          </div>
        </div>
      </section>

      {/* Main settings layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 420px), 1fr))",
          gap: 22,
          alignItems: "start",
        }}
      >
        {/* Left column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Security */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={headingStyle}>
                <LockKeyhole size={17} color={accent} />
                Security
              </h2>
              <p style={descriptionStyle}>
                Keep your account credentials secure.
              </p>
            </div>

            <form onSubmit={changePw} style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 15,
                }}
              >
                {[
                  {
                    key: "current",
                    label: "Current password",
                    placeholder: "Enter current password",
                    autoComplete: "current-password",
                  },
                  {
                    key: "next",
                    label: "New password",
                    placeholder: "Enter new password",
                    autoComplete: "new-password",
                  },
                  {
                    key: "confirm",
                    label: "Confirm new password",
                    placeholder: "Re-enter new password",
                    autoComplete: "new-password",
                  },
                ].map((field) => (
                  <div key={field.key}>
                    <label
                      htmlFor={`password-${field.key}`}
                      style={{
                        display: "block",
                        color: t.ink,
                        fontSize: 13,
                        fontWeight: 600,
                        marginBottom: 7,
                      }}
                    >
                      {field.label}
                    </label>

                    <div style={{ position: "relative" }}>
                      <input
                        id={`password-${field.key}`}
                        type={showPasswords ? "text" : "password"}
                        autoComplete={field.autoComplete}
                        placeholder={field.placeholder}
                        value={pw[field.key]}
                        onChange={(e) =>
                          setPw((previous) => ({
                            ...previous,
                            [field.key]: e.target.value,
                          }))
                        }
                        style={{
                          ...inputBoxStyle,
                          paddingRight: 44,
                        }}
                      />

                      <button
                        type="button"
                        aria-label={
                          showPasswords ? "Hide passwords" : "Show passwords"
                        }
                        onClick={() =>
                          setShowPasswords((previous) => !previous)
                        }
                        style={{
                          position: "absolute",
                          right: 10,
                          top: "50%",
                          transform: "translateY(-50%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          border: 0,
                          background: "transparent",
                          color: subtle,
                          cursor: "pointer",
                          padding: 5,
                        }}
                      >
                        {showPasswords ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: 18 }}>
                <Btn t={t} variant="accent" onClick={changePw}>
                  Update password
                </Btn>
              </div>
            </form>
          </section>

          {/* Appearance */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={headingStyle}>
                <Palette size={17} color={accent} />
                Appearance
              </h2>
              <p style={descriptionStyle}>
                Choose the theme that feels comfortable for your workspace.
              </p>
            </div>

            <div style={rowStyle}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  minWidth: 0,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    border: `1px solid ${t.line}`,
                    background: t.canvas,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  {mode === "dark" ? (
                    <Moon size={19} color={accent} />
                  ) : (
                    <Sun size={19} color={accent} />
                  )}
                </div>

                <div>
                  <div style={{ fontSize: 14, fontWeight: 650 }}>
                    {mode === "dark" ? "Dark theme" : "Light theme"}
                  </div>
                  <p style={{ ...descriptionStyle, marginTop: 4 }}>
                    {mode === "dark"
                      ? "A softer look for low-light environments."
                      : "A bright, warm workspace."}
                  </p>
                </div>
              </div>

              <Btn t={t} variant="accent" onClick={toggle}>
                {mode === "dark" ? (
                  <>
                    <Sun size={15} />
                    Light mode
                  </>
                ) : (
                  <>
                    <Moon size={15} />
                    Dark mode
                  </>
                )}
              </Btn>
            </div>
          </section>

          {/* Sign out */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={headingStyle}>
                <LogOut size={17} color={accent} />
                Sign out
              </h2>
              <p style={descriptionStyle}>
                End your current session on this device.
              </p>
            </div>

            <div style={rowStyle}>
              <p
                style={{
                  color: subtle,
                  fontSize: 13,
                  lineHeight: 1.55,
                  margin: 0,
                  flex: "1 1 200px",
                }}
              >
                You will need to sign in again to access your account.
              </p>

              <button
                type="button"
                onClick={() => setConfirmLogout(true)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  border: `1px solid ${t.coral || "#BD594B"}`,
                  borderRadius: 8,
                  padding: "10px 15px",
                  background: "transparent",
                  color: t.coral || "#BD594B",
                  fontSize: 13,
                  fontWeight: 650,
                  cursor: "pointer",
                }}
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          </section>
        </div>

        {/* Right column */}
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Notifications */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={headingStyle}>
                <Bell size={17} color={accent} />
                Notifications
              </h2>
              <p style={descriptionStyle}>
                Choose which updates you want to receive.
              </p>
            </div>

            {[
              {
                key: "tasks",
                label: "Task updates",
                description: "Assignments and status changes",
              },
              {
                key: "leave",
                label: "Leave requests",
                description: "Applications and approval decisions",
              },
              {
                key: "attendance",
                label: "Attendance",
                description: "Attendance-related updates",
              },
              {
                key: "announcements",
                label: "Announcements",
                description: "Important organisation notices",
              },
            ].map((item, index, items) => (
              <React.Fragment key={item.key}>
                <div style={rowStyle}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 650 }}>
                      {item.label}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: subtle,
                        marginTop: 4,
                        lineHeight: 1.5,
                      }}
                    >
                      {item.description}
                    </div>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={notifPrefs[item.key]}
                    aria-label={item.label}
                    onClick={() => updatePreference(item.key)}
                    style={{
                      width: 42,
                      height: 24,
                      borderRadius: 20,
                      padding: 3,
                      border: "none",
                      background: notifPrefs[item.key] ? accent : t.line,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: notifPrefs[item.key]
                        ? "flex-end"
                        : "flex-start",
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 18,
                        height: 18,
                        borderRadius: "50%",
                        background: "#FFFFFF",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                      }}
                    />
                  </button>
                </div>

                {index < items.length - 1 && <hr style={dividerStyle} />}
              </React.Fragment>
            ))}

            <div
              style={{
                margin: "0 20px 18px",
                padding: "10px 12px",
                borderRadius: 8,
                background: t.canvas,
                color: subtle,
                fontSize: 11.5,
                lineHeight: 1.5,
              }}
            >
              These preferences are currently stored for this page session.
              Saving them permanently requires preference storage.
            </div>
          </section>

          {/* Data backup */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={headingStyle}>
                <Database size={17} color={accent} />
                Data &amp; privacy
              </h2>
              <p style={descriptionStyle}>
                Export a copy of the data available in this workspace.
              </p>
            </div>

            <div style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: t.canvas,
                    border: `1px solid ${t.line}`,
                    display: "grid",
                    placeItems: "center",
                    flexShrink: 0,
                  }}
                >
                  <Download size={18} color={accent} />
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 650 }}>
                    Export data backup
                  </div>
                  <p style={{ ...descriptionStyle, marginTop: 5 }}>
                    Download the available application data as a JSON file.
                    Store the exported file securely.
                  </p>
                </div>
              </div>

              <div style={{ marginTop: 18 }}>
                <Btn t={t} variant="accent" onClick={handleBackup}>
                  <Database size={15} />
                  Export backup
                </Btn>
              </div>
            </div>

            <hr style={dividerStyle} />

            <div style={{ padding: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 650 }}>
                Included in your backup
              </div>

              <p style={{ ...descriptionStyle, marginTop: 5 }}>
                The export contains the application data supplied to this
                Settings page, depending on what is stored in your system.
              </p>
            </div>
          </section>

          {/* Organisation contact details */}
          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h2 style={headingStyle}>
                <ShieldCheck size={17} color={accent} />
                Organisation
              </h2>
              <p style={descriptionStyle}>
                Organisation identity and contact information.
              </p>
            </div>

            <div style={{ padding: 20 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 13,
                  marginBottom: 20,
                }}
              >
                <div
                  aria-label={`${ORGANISATION.englishName} logo`}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 11,
                    background: t.accentSoft || "#FFF0DC",
                    border: `1px solid ${t.line}`,
                    color: t.primaryDeep || "#354681",
                    display: "grid",
                    placeItems: "center",
                    fontSize: 25,
                    fontWeight: 750,
                    flexShrink: 0,
                  }}
                >
                  स
                </div>

                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 750 }}>
                    {ORGANISATION.name}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: subtle,
                      marginTop: 3,
                    }}
                  >
                    {ORGANISATION.description}
                  </div>
                </div>
              </div>

              {ORGANISATION.email && (
                <ContactLink
                  icon={Mail}
                  label={ORGANISATION.email}
                  href={`mailto:${ORGANISATION.email}`}
                  t={t}
                />
              )}

              {ORGANISATION.phone && (
                <ContactLink
                  icon={Phone}
                  label={ORGANISATION.phone}
                  href={`tel:${ORGANISATION.phone}`}
                  t={t}
                />
              )}

              {ORGANISATION.website && (
                <ContactLink
                  icon={Globe}
                  label={ORGANISATION.website.replace(/^https?:\/\//, "")}
                  href={ORGANISATION.website}
                  t={t}
                  external
                />
              )}

              {!ORGANISATION.email &&
                !ORGANISATION.phone &&
                !ORGANISATION.website && (
                  <p
                    style={{
                      margin: 0,
                      color: subtle,
                      fontSize: 12,
                      lineHeight: 1.6,
                    }}
                  >
                    Official contact details can be added to the
                    ORGANISATION object at the top of this file.
                  </p>
                )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer
        style={{
          marginTop: 30,
          borderTop: `1px solid ${t.line}`,
          padding: "22px 2px 12px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 24,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 220,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 10,
                background: t.accentSoft || "#FFF0DC",
                color: t.primaryDeep || "#354681",
                display: "grid",
                placeItems: "center",
                fontSize: 23,
                fontWeight: 750,
                flexShrink: 0,
              }}
            >
              स
            </div>

            <div>
              <div style={{ fontSize: 15, fontWeight: 750 }}>
                {ORGANISATION.name}
              </div>
              <div
                style={{
                  color: subtle,
                  fontSize: 12,
                  marginTop: 3,
                }}
              >
                {ORGANISATION.description}
              </div>
            </div>
          </div>

          <div style={{ minWidth: 180 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 10,
              }}
            >
              Contact
            </div>

            {ORGANISATION.email && (
              <ContactLink
                icon={Mail}
                label={ORGANISATION.email}
                href={`mailto:${ORGANISATION.email}`}
                t={t}
              />
            )}

            {ORGANISATION.phone && (
              <ContactLink
                icon={Phone}
                label={ORGANISATION.phone}
                href={`tel:${ORGANISATION.phone}`}
                t={t}
              />
            )}

            {ORGANISATION.website && (
              <ContactLink
                icon={Globe}
                label="Official website"
                href={ORGANISATION.website}
                t={t}
                external
              />
            )}

            {!ORGANISATION.email &&
              !ORGANISATION.phone &&
              !ORGANISATION.website && (
                <span style={{ color: subtle, fontSize: 12 }}>
                  Contact details not configured
                </span>
              )}
          </div>
        </div>

        <div
          style={{
            borderTop: `1px solid ${t.line}`,
            marginTop: 20,
            paddingTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 12,
            flexWrap: "wrap",
            fontSize: 11,
            color: subtle,
          }}
        >
          <span>
            © {new Date().getFullYear()} {ORGANISATION.englishName}
          </span>
          <span>Management workspace</span>
        </div>
      </footer>

      {/* Self-contained logout confirmation */}
      {confirmLogout && (
        <div
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) {
              setConfirmLogout(false);
            }
          }}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(20, 22, 30, 0.48)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="logout-dialog-title"
            style={{
              width: "100%",
              maxWidth: 390,
              background: t.surface,
              border: `1px solid ${t.line}`,
              borderRadius: 14,
              padding: 24,
              boxShadow: "0 18px 55px rgba(0,0,0,0.18)",
              color: t.ink,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                display: "grid",
                placeItems: "center",
                borderRadius: 10,
                background: t.accentSoft || "#FFF0DC",
                color: accent,
                marginBottom: 14,
              }}
            >
              <LogOut size={20} />
            </div>

            <h2
              id="logout-dialog-title"
              style={{
                fontSize: 18,
                margin: 0,
                fontWeight: 750,
              }}
            >
              Sign out?
            </h2>

            <p style={{ ...descriptionStyle, marginTop: 8 }}>
              You will need to sign in again to access your account.
            </p>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 9,
                marginTop: 24,
                flexWrap: "wrap",
              }}
            >
              <button
                type="button"
                onClick={() => setConfirmLogout(false)}
                style={{
                  border: `1px solid ${t.line}`,
                  borderRadius: 8,
                  background: "transparent",
                  color: t.ink,
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => {
                  setConfirmLogout(false);
                  if (typeof onLogout === "function") {
                    onLogout();
                  }
                }}
                style={{
                  border: "none",
                  borderRadius: 8,
                  background: accent,
                  color: "#FFFFFF",
                  padding: "10px 14px",
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ContactLink({ icon: Icon, label, href, t, external = false }) {
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noreferrer" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 9,
        color: t.inkSoft || "#707382",
        fontSize: 12,
        lineHeight: 1.5,
        textDecoration: "none",
        overflowWrap: "anywhere",
        marginTop: 10,
      }}
    >
      <Icon size={15} style={{ flexShrink: 0 }} />
      {label}
    </a>
  );
}
