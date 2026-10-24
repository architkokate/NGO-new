import React from "react";
import { X, AlertTriangle, Search } from "lucide-react";

export const Label = ({ children, t }) => (
  <div
    style={{
      fontFamily: "Inter",
      fontSize: 11,
      letterSpacing: "0.12em",
      textTransform: "uppercase",
      color: t.inkSoft,
      fontWeight: 600,
    }}
  >
    {children}
  </div>
);

export const StatusChip = ({ status, t }) => {
  const map = {
    Active: t.success,
    Completed: t.success,
    Approved: t.success,
    Reviewed: t.success,
    Pending: t.gold,
    Planning: t.gold,
    "Pending Review": t.gold,
    "On Leave": t.gold,
    Delayed: t.coral,
    Overdue: t.coral,
    Rejected: t.coral,
    Inactive: t.inkSoft,
    "In Progress": t.primary,
  };
  const c = map[status] || t.inkSoft;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontFamily: "Inter",
        fontSize: 12,
        fontWeight: 600,
        color: c,
        background: c + "1A",
        padding: "3px 9px",
        borderRadius: 20,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
      {status}
    </span>
  );
};

export const PriorityChip = ({ p, t }) => {
  const map = { High: t.coral, Medium: t.gold, Low: t.inkSoft };
  const c = map[p] || t.inkSoft;
  return (
    <span
      style={{
        fontFamily: "Inter",
        fontSize: 11,
        fontWeight: 700,
        color: c,
        letterSpacing: "0.04em",
      }}
    >
      {p.toUpperCase()}
    </span>
  );
};

export const Card = ({ children, t, style }) => (
  <div
    style={{
      background: t.surface,
      border: `1px solid ${t.line}`,
      borderRadius: 10,
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.02)",
      ...style,
    }}
  >
    {children}
  </div>
);

export const Btn = ({
  children,
  onClick,
  t,
  variant = "primary",
  icon: Icon,
  style,
  type = "button",
  disabled,
}) => {
  const base = {
    fontFamily: "Inter",
    fontSize: 13.5,
    fontWeight: 600,
    padding: "9px 15px",
    borderRadius: 7,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    cursor: disabled ? "not-allowed" : "pointer",
    border: "1px solid transparent",
    opacity: disabled ? 0.5 : 1,
    transition: "all 0.15s ease",
    userSelect: "none",
  };
  const variants = {
    primary: { background: t.primary, color: "#fff" },
    ghost: { background: "transparent", color: t.ink, border: `1px solid ${t.line}` },
    danger: { background: "transparent", color: t.coral, border: `1px solid ${t.coral}55` },
    subtle: { background: t.chipBg, color: t.ink },
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {Icon && <Icon size={15} />}
      {children}
    </button>
  );
};

export const Field = ({ label, children, t }) => (
  <label style={{ display: "block", marginBottom: 12 }}>
    <div
      style={{
        fontFamily: "Inter",
        fontSize: 12,
        fontWeight: 600,
        color: t.inkSoft,
        marginBottom: 5,
      }}
    >
      {label}
    </div>
    {children}
  </label>
);

export const inputStyle = (t) => ({
  width: "100%",
  boxSizing: "border-box",
  fontFamily: "Inter",
  fontSize: 14,
  padding: "9px 11px",
  borderRadius: 7,
  border: `1px solid ${t.line}`,
  background: t.canvas,
  color: t.ink,
  outline: "none",
  transition: "border-color 0.15s ease",
});

export function Modal({ title, onClose, children, t, wide }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        zIndex: 100,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.surface,
          width: "100%",
          maxWidth: wide ? 640 : 460,
          maxHeight: "88vh",
          overflowY: "auto",
          borderRadius: "16px 16px 0 0",
          padding: 22,
          boxShadow: "0 -4px 20px rgba(0, 0, 0, 0.1)",
          animation: "slideUp 0.18s ease-out",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 18,
          }}
        >
          <div style={{ fontFamily: "Fraunces", fontSize: 20, fontWeight: 600, color: t.ink }}>
            {title}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: t.inkSoft,
              padding: 4,
            }}
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({ text, onConfirm, onCancel, t }) {
  return (
    <div
      onClick={onCancel}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.45)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(2px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.surface,
          borderRadius: 12,
          padding: 22,
          maxWidth: 360,
          width: "100%",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.15)",
        }}
      >
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18 }}>
          <AlertTriangle
            size={20}
            color={t.coral}
            style={{ flexShrink: 0, marginTop: 2 }}
          />
          <div style={{ fontFamily: "Inter", fontSize: 14.5, color: t.ink, lineHeight: 1.5 }}>
            {text}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn t={t} variant="ghost" onClick={onCancel}>
            Cancel
          </Btn>
          <Btn
            t={t}
            variant="danger"
            onClick={onConfirm}
            style={{ background: t.coral, color: "#fff", border: "none" }}
          >
            Confirm
          </Btn>
        </div>
      </div>
    </div>
  );
}

export function Empty({ icon: Icon, title, hint, t }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: t.inkSoft }}>
      <Icon size={30} style={{ opacity: 0.5, marginBottom: 10 }} />
      <div style={{ fontFamily: "Fraunces", fontSize: 17, color: t.ink, marginBottom: 4 }}>
        {title}
      </div>
      <div style={{ fontFamily: "Inter", fontSize: 13 }}>{hint}</div>
    </div>
  );
}

export function Avatar({ initials, src, size = 32, t, tone }) {
  if (src && src.startsWith("data:")) {
    return (
      <img
        src={src}
        alt={initials}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          flexShrink: 0,
          border: `1px solid ${t.line}`,
        }}
      />
    );
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: tone || t.primary,
        color: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter",
        fontWeight: 700,
        fontSize: size * 0.36,
        flexShrink: 0,
      }}
    >
      {initials}
    </div>
  );
}

export const SearchBox = ({ value, onChange, t, placeholder }) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 8,
      border: `1px solid ${t.line}`,
      borderRadius: 8,
      padding: "8px 12px",
      background: t.surface,
      flex: 1,
    }}
  >
    <Search size={15} color={t.inkSoft} />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder || "Search..."}
      style={{
        border: "none",
        outline: "none",
        background: "transparent",
        fontFamily: "Inter",
        fontSize: 13.5,
        color: t.ink,
        width: "100%",
      }}
    />
  </div>
);
