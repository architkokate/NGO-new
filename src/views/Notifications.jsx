
import React from "react";
import {
  Bell,
  ListChecks,
  CalendarDays,
  AlertTriangle,
  FolderKanban,
  Megaphone,
  Trash2,
  CheckCheck,
  Circle,
  Inbox,
} from "lucide-react";
import { Card, Empty, Btn } from "../components/Primitives";
import { ToolbarRow } from "../components/shared";

export default function NotificationsView({ t, data, patch, notify }) {
  const notifications = data.notifications || [];

  const iconFor = {
    task: ListChecks,
    leave: CalendarDays,
    alert: AlertTriangle,
    project: FolderKanban,
    announcement: Megaphone,
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    if (unreadCount === 0) return;

    patch((d) => ({
      ...d,
      notifications: (d.notifications || []).map((n) => ({
        ...n,
        read: true,
      })),
    }));

    notify("All notifications marked as read");
  };

  const markRead = (id) => {
    const item = notifications.find((n) => n.id === id);
    if (!item || item.read) return;

    patch((d) => ({
      ...d,
      notifications: (d.notifications || []).map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    }));
  };

  const clearAll = () => {
    if (notifications.length === 0) return;

    patch((d) => ({ ...d, notifications: [] }));
    notify("Notifications cleared");
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto" }}>
      {/* Page heading */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 14,
          marginBottom: 22,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <h2
              style={{
                margin: 0,
                fontFamily: "Fraunces, serif",
                fontSize: 25,
                fontWeight: 600,
                color: t.primaryDeep,
                letterSpacing: "-0.5px",
              }}
            >
              Notifications
            </h2>

            {unreadCount > 0 && (
              <span
                style={{
                  background: t.accentSoft,
                  color: t.primaryDeep,
                  borderRadius: 20,
                  padding: "4px 9px",
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
              >
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn
            t={t}
            variant="ghost"
            icon={CheckCheck}
            onClick={markAllRead}
            disabled={unreadCount === 0}
          >
            Mark all read
          </Btn>

          <Btn
            t={t}
            variant="danger"
            icon={Trash2}
            onClick={clearAll}
            disabled={notifications.length === 0}
          >
            Clear all
          </Btn>
        </div>
      </div>

      {/* Notification list */}
      {notifications.length === 0 ? (
        <Card t={t} style={{ padding: "42px 20px", textAlign: "center" }}>
          <div
            style={{
              width: 48,
              height: 48,
              margin: "0 auto 14px",
              borderRadius: 12,
              background: t.chipBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Inbox size={23} color={t.primary} />
          </div>

          <div
            style={{
              color: t.primaryDeep,
              fontSize: 16,
              fontWeight: 700,
            }}
          >
            You're all caught up
          </div>

          <p
            style={{
              color: t.inkSoft,
              fontSize: 13,
              margin: "6px 0 0",
            }}
          >
            New updates will appear here when there's something to share.
          </p>
        </Card>
      ) : (
        <Card t={t} style={{ padding: 0, overflow: "hidden" }}>
          {/* List heading */}
          <div
            style={{
              padding: "13px 18px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: `1px solid ${t.line}`,
              background: t.surface,
            }}
          >
            <span
              style={{
                color: t.primaryDeep,
                fontSize: 12.5,
                fontWeight: 700,
              }}
            >
              Recent activity
            </span>

            <span style={{ color: t.inkSoft, fontSize: 11.5 }}>
              {notifications.length}{" "}
              {notifications.length === 1 ? "notification" : "notifications"}
            </span>
          </div>

          {notifications.map((n, index) => {
            const Icon = iconFor[n.kind] || Bell;

            return (
              <div
                key={n.id}
                role="button"
                tabIndex={0}
                onClick={() => markRead(n.id)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    markRead(n.id);
                  }
                }}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 13,
                  padding: "17px 18px",
                  borderBottom:
                    index < notifications.length - 1
                      ? `1px solid ${t.line}`
                      : "none",
                  background: n.read ? t.surface : t.accentSoft,
                  cursor: n.read ? "default" : "pointer",
                  transition: "background 0.15s ease",
                  position: "relative",
                  outline: "none",
                }}
              >
                {/* Unread indicator */}
                <div
                  style={{
                    width: 3,
                    alignSelf: "stretch",
                    minHeight: 34,
                    borderRadius: 4,
                    background: n.read ? "transparent" : t.accent,
                    flexShrink: 0,
                  }}
                />

                {/* Icon */}
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: 9,
                    background: n.read ? t.chipBg : t.surface,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  <Icon
                    size={16}
                    color={n.read ? t.primary : t.primaryDeep}
                    strokeWidth={1.8}
                  />
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 10,
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        fontSize: 13.5,
                        fontWeight: n.read ? 500 : 700,
                        color: t.ink,
                        lineHeight: 1.45,
                      }}
                    >
                      {n.title}
                    </span>

                    {!n.read && (
                      <span
                        style={{
                          color: t.primaryDeep,
                          fontSize: 10.5,
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        NEW
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: 12.5,
                      color: t.inkSoft,
                      marginTop: 4,
                      lineHeight: 1.6,
                      overflowWrap: "anywhere",
                    }}
                  >
                    {n.body}
                  </div>

                  {n.time && (
                    <div
                      style={{
                        fontSize: 11,
                        color: t.inkSoft,
                        marginTop: 8,
                      }}
                    >
                      {n.time}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
