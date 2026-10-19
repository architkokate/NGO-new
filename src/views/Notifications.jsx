import React from "react";
import { Bell, ListChecks, CalendarDays, AlertTriangle, FolderKanban, Megaphone, Trash2, CheckCheck } from "lucide-react";
import { Card, Empty, Btn } from "../components/Primitives";
import { ToolbarRow } from "../components/shared";

export default function NotificationsView({ t, data, patch, notify }) {
  const iconFor = { task: ListChecks, leave: CalendarDays, alert: AlertTriangle, project: FolderKanban, announcement: Megaphone };

  const markAllRead = () => { patch((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) })); notify("All notifications marked as read"); };
  const markRead = (id) => patch((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));
  const clearAll = () => { patch((d) => ({ ...d, notifications: [] })); notify("Notifications cleared"); };

  return (
    <div>
      <ToolbarRow t={t}>
        <div style={{ fontFamily: "Fraunces", fontSize: 17, fontWeight: 600 }}>Notifications</div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <Btn t={t} variant="ghost" icon={CheckCheck} onClick={markAllRead}>Mark all read</Btn>
          <Btn t={t} variant="danger" icon={Trash2} onClick={clearAll}>Clear all</Btn>
        </div>
      </ToolbarRow>
      {(data.notifications || []).length === 0 ? (
        <Empty t={t} icon={Bell} title="You're all caught up" hint="New notifications will show up here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {(data.notifications || []).map((n) => {
            const Icon = iconFor[n.kind] || Bell;
            return (
              <Card key={n.id} onClick={() => markRead(n.id)} t={t} style={{ padding: 13, display: "flex", gap: 12, alignItems: "flex-start", cursor: "pointer", background: n.read ? t.surface : t.primary + "0D", borderColor: n.read ? t.line : t.primary + "44" }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: t.chipBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon size={15} color={t.primary} /></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: n.read ? 600 : 700, color: t.ink }}>{n.title}</div>
                  <div style={{ fontSize: 12.5, color: t.inkSoft, marginTop: 2 }}>{n.body}</div>
                  <div style={{ fontSize: 10.5, color: t.inkSoft, marginTop: 4 }}>{n.time}</div>
                </div>
                {!n.read && <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.primary, marginTop: 4, flexShrink: 0 }} />}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
