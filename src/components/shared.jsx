import React from "react";
import { Card, Label } from "../components/Primitives";

export const ToolbarRow = ({ children }) => (
  <div
    style={{
      display: "flex",
      flexWrap: "wrap",
      gap: 10,
      alignItems: "center",
      marginBottom: 16,
    }}
  >
    {children}
  </div>
);

export const iconBtnStyle = (t) => ({
  background: t.chipBg,
  border: "none",
  borderRadius: 6,
  width: 26,
  height: 26,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
});

export function DetailRow({ t, icon: Icon, label, value }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${t.line}`,
      }}
    >
      <Icon size={15} color={t.inkSoft} />
      <div>
        <div style={{ fontSize: 10.5, color: t.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {label}
        </div>
        <div style={{ fontSize: 13.5, color: t.ink, fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

export function StatCard({ label, value, t, icon: Icon, tone }) {
  return (
    <Card t={t} style={{ padding: "16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Label t={t}>{label}</Label>
        <Icon size={15} color={tone || t.inkSoft} />
      </div>
      <div
        style={{
          fontFamily: "IBM Plex Mono",
          fontSize: 26,
          fontWeight: 600,
          color: t.ink,
          marginTop: 8,
        }}
      >
        {value}
      </div>
    </Card>
  );
}
