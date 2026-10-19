import React, { useState } from "react";
import { LogOut, Sun, Moon, Check, Database } from "lucide-react";
import { Card, Label, Avatar, Btn, Field, inputStyle, ConfirmDialog } from "../components/Primitives";
import { ROLE_LABEL } from "../services/seeds";
import { exportToJSON } from "../services/storage";

export default function SettingsView({ t, mode, toggle, sessionUser, onLogout, notify, data }) {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [notifPrefs, setNotifPrefs] = useState({ tasks: true, leave: true, attendance: false, announcements: true });
  const [confirmLogout, setConfirmLogout] = useState(false);

  const changePw = (e) => {
    e.preventDefault();
    if (!pw.current) { notify("Enter your current password"); return; }
    if (pw.next.length < 4) { notify("New password must be at least 4 characters"); return; }
    if (pw.next !== pw.confirm) { notify("New passwords do not match"); return; }
    notify("Password updated");
    setPw({ current: "", next: "", confirm: "" });
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <Card t={t} style={{ padding: 18, marginBottom: 16, display: "flex", gap: 14, alignItems: "center" }}>
        <Avatar initials={sessionUser.initials} t={t} size={52} />
        <div>
          <div style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 600 }}>{sessionUser.name}</div>
          <div style={{ fontSize: 12.5, color: t.inkSoft }}>{sessionUser.title} · {ROLE_LABEL[sessionUser.role]}</div>
        </div>
      </Card>

      <SettingsSection t={t} title="Change Password">
        <form onSubmit={changePw}>
          <Field t={t} label="Current password"><input type="password" style={inputStyle(t)} value={pw.current} onChange={(e) => setPw((s) => ({ ...s, current: e.target.value }))} /></Field>
          <Field t={t} label="New password"><input type="password" style={inputStyle(t)} value={pw.next} onChange={(e) => setPw((s) => ({ ...s, next: e.target.value }))} /></Field>
          <Field t={t} label="Confirm new password"><input type="password" style={inputStyle(t)} value={pw.confirm} onChange={(e) => setPw((s) => ({ ...s, confirm: e.target.value }))} /></Field>
          <Btn t={t} type="submit" icon={Check}>Update Password</Btn>
        </form>
      </SettingsSection>

      <SettingsSection t={t} title="Notification Preferences">
        {Object.entries(notifPrefs).map(([k, v]) => (
          <label key={k} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${t.line}`, fontSize: 13.5, color: t.ink, textTransform: "capitalize", cursor: "pointer" }}>
            {k}
            <input type="checkbox" checked={v} onChange={() => setNotifPrefs((s) => ({ ...s, [k]: !s[k] }))} style={{ accentColor: t.primary, width: 17, height: 17 }} />
          </label>
        ))}
      </SettingsSection>

      <SettingsSection t={t} title="Data Backup">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.5 }}>
            Download a JSON snapshot of all projects, people, tasks and records.
          </div>
          <Btn t={t} variant="ghost" icon={Database} onClick={() => { exportToJSON(data); notify("Backup downloaded"); }}>Export Backup</Btn>
        </div>
      </SettingsSection>

      <SettingsSection t={t} title="Appearance">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13.5, color: t.ink }}>Theme</div>
          <Btn t={t} variant="subtle" icon={mode === "light" ? Moon : Sun} onClick={toggle}>{mode === "light" ? "Switch to dark" : "Switch to light"}</Btn>
        </div>
      </SettingsSection>

      <SettingsSection t={t} title="About & Support">
        <div style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.6 }}>
          सेवावर्धिनी NGO Management — v1.0.0 (demo build).<br />
          For help, contact your organization administrator or visit the internal support desk.
        </div>
      </SettingsSection>

      <Btn t={t} variant="danger" icon={LogOut} onClick={() => setConfirmLogout(true)} style={{ border: `1px solid ${t.coral}55` }}>Log Out</Btn>
      {confirmLogout && <ConfirmDialog t={t} text="Log out of सेवावर्धिनी?" onCancel={() => setConfirmLogout(false)} onConfirm={onLogout} />}
    </div>
  );
}

function SettingsSection({ t, title, children }) {
  return (
    <div style={{ marginBottom: 18 }}>
      <Label t={t}>{title}</Label>
      <Card t={t} style={{ padding: 16, marginTop: 8 }}>{children}</Card>
    </div>
  );
}
