
import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutGrid,
  Users,
  HeartHandshake,
  FolderKanban,
  ListChecks,
  Clock,
  CalendarDays,
  NotebookPen,
  BarChart3,
  Bell,
  Settings as SettingsIcon,
  Sun,
  Moon,
  Menu,
  X,
  ChevronRight,
  LogOut,
} from "lucide-react";

import { FONTS, useT } from "./theme";
import { loadData, saveData } from "./services/storage";
import { USERS, ROLE_LABEL, ROLE_NAV, CAN } from "./services/seeds";
import { Avatar } from "./components/Primitives";
import { ConfirmDialog } from "./components/Primitives";

import Dashboard from "./views/Dashboard";
import EmployeesView from "./views/Employees";
import VolunteersView from "./views/Volunteers";
import ProjectsView from "./views/Projects";
import TasksView from "./views/Tasks";
import AttendanceView from "./views/Attendance";
import LeaveView from "./views/Leave";
import WorklogView from "./views/Worklog";
import ReportsView from "./views/Reports";
import NotificationsView from "./views/Notifications";
import SettingsView from "./views/Settings";

import {
  Routes,
  Route,
  Navigate,
  useNavigate,
  useLocation,
} from "react-router-dom";

import LoginPage from "./pages/LoginPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import CreateAccountPage from "./pages/CreateAccountPage";

const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { key: "employees", label: "Employees", icon: Users },
  { key: "volunteers", label: "Volunteers", icon: HeartHandshake },
  { key: "projects", label: "Projects", icon: FolderKanban },
  { key: "tasks", label: "Tasks", icon: ListChecks },
  { key: "attendance", label: "Attendance", icon: Clock },
  { key: "leave", label: "Leave", icon: CalendarDays },
  { key: "worklog", label: "Work Log", icon: NotebookPen },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "settings", label: "Settings", icon: SettingsIcon },
];

const ACCENT = "#F47B20";
const ACCENT_SOFT = "rgba(244, 123, 32, 0.12)";

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t, mode, toggle } = useT();

  const [booting, setBooting] = useState(true);
  const [data, setData] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [railOpen, setRailOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const saved = await loadData();

        if (active) {
          setData(saved);
        }
      } catch (error) {
        console.error("Unable to load application data:", error);
      } finally {
        if (active) {
          setBooting(false);
        }
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setRailOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!toast) return undefined;

    const timeout = setTimeout(() => setToast(null), 2600);
    return () => clearTimeout(timeout);
  }, [toast]);

  const patch = useCallback((updater) => {
    setData((prev) => {
      if (!prev) return prev;

      const next =
        typeof updater === "function"
          ? updater(prev)
          : { ...prev, ...updater };

      Promise.resolve(saveData(next)).catch((error) => {
        console.error("Unable to save application data:", error);
      });

      return next;
    });
  }, []);

  const notify = useCallback((message) => {
    setToast(message);
  }, []);

  const pushNotification = useCallback(
    (notification) => {
      patch((current) => ({
        ...current,
        notifications: [
          {
            id: "n" + Date.now(),
            read: false,
            time: "just now",
            ...notification,
          },
          ...(current.notifications || []),
        ],
      }));
    },
    [patch]
  );

  const employeeOf = useCallback(
    (uid) =>
      USERS.find((user) => user.id === uid) ||
      (data?.employees || []).find((employee) => employee.id === uid),
    [data]
  );

  const personOf = useCallback(
    (uid) =>
      employeeOf(uid) ||
      (data?.volunteers || []).find((volunteer) => volunteer.id === uid),
    [data, employeeOf]
  );

  const handleLogin = useCallback(
    (user) => {
      setSessionUser(user);
      setView("dashboard");
      setRailOpen(false);
      navigate("/");
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    setSessionUser(null);
    setView("dashboard");
    setRailOpen(false);
    navigate("/login");
  }, [navigate]);

  if (booting || !data) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 14,
          padding: 24,
          background: t.canvas,
          fontFamily: "Inter, sans-serif",
          color: t.inkSoft,
        }}
      >
        <style>{FONTS}</style>

        <img
          src="/sevavardhini-logo.png"
          alt=""
          style={{
            width: 54,
            height: 54,
            objectFit: "contain",
            borderRadius: 12,
            background: "#FFFFFF",
            padding: 5,
          }}
        />

        <div
          style={{
            color: t.ink,
            fontFamily: "'Noto Sans Devanagari', Inter, sans-serif",
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          सेवावर्धिनी
        </div>

        <div style={{ fontSize: 13 }}>Loading your workspace...</div>

        <div
          style={{
            width: 150,
            height: 3,
            borderRadius: 99,
            background: t.line,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              width: "45%",
              height: "100%",
              borderRadius: 99,
              background: ACCENT,
              animation: "rl-loading 1.1s ease-in-out infinite alternate",
            }}
          />
        </div>

        <style>{`
          @keyframes rl-loading {
            from { transform: translateX(0); }
            to { transform: translateX(120px); }
          }
        `}</style>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <>
        <style>{`
          ${FONTS}
          * { box-sizing: border-box; }
          body { margin: 0; }
        `}</style>

        <Routes>
          <Route
            path="/login"
            element={<LoginPage onLogin={handleLogin} />}
          />
          <Route
            path="/forgot-password"
            element={<ForgotPasswordPage />}
          />
          <Route
            path="/create-account"
            element={<CreateAccountPage onLogin={handleLogin} />}
          />
          <Route
            path="*"
            element={<Navigate to="/login" replace />}
          />
        </Routes>
      </>
    );
  }

  const nav = ROLE_NAV[sessionUser.role] || ["dashboard"];
  const unread = (data.notifications || []).filter(
    (notification) => !notification.read
  ).length;

  const activeItem =
    NAV_ITEMS.find((item) => item.key === view) || NAV_ITEMS[0];

  const ctx = {
    t,
    data,
    patch,
    sessionUser,
    notify,
    pushNotification,
    employeeOf,
    personOf,
  };

  const setActiveView = (nextView) => {
    setView(nextView);
    setRailOpen(false);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        position: "relative",
        background: t.canvas,
        color: t.ink,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <style>{`
        ${FONTS}

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
        }

        button, input, select, textarea {
          font: inherit;
        }

        button {
          -webkit-tap-highlight-color: transparent;
        }

        button:focus-visible,
        a:focus-visible {
          outline: 2px solid ${ACCENT};
          outline-offset: 3px;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: ${ACCENT} !important;
          outline: none;
          box-shadow: 0 0 0 3px ${ACCENT_SOFT};
        }

        ::selection {
          background: ${ACCENT_SOFT};
        }

        ::-webkit-scrollbar {
          width: 7px;
          height: 7px;
        }

        ::-webkit-scrollbar-thumb {
          background: ${t.line};
          border-radius: 8px;
        }

        ::-webkit-scrollbar-track {
          background: transparent;
        }

        .rl-rail {
          display: none !important;
        }

        .rl-menu-btn {
          display: flex !important;
        }

        .rl-bottom-nav {
          display: flex !important;
        }

        .rl-nav-button:hover {
          background: rgba(244, 123, 32, 0.09) !important;
        }

        .rl-icon-button:hover {
          background: ${t.canvas} !important;
        }

        .rl-mobile-overlay {
          animation: rl-fade-in 0.18s ease-out;
        }

        .rl-mobile-drawer {
          animation: rl-slide-in 0.22s ease-out;
        }

        .rl-toast {
          animation: rl-toast-in 0.2s ease-out;
        }

        @keyframes rl-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes rl-slide-in {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes rl-toast-in {
          from { opacity: 0; transform: translate(-50%, 8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }

        @media (min-width: 900px) {
          .rl-rail {
            display: flex !important;
          }

          .rl-menu-btn {
            display: none !important;
          }

          .rl-bottom-nav {
            display: none !important;
          }

          .rl-main-content {
            padding: 28px 30px 36px !important;
          }

          .rl-topbar {
            padding: 15px 30px !important;
          }
        }

        @media (max-width: 480px) {
          .rl-topbar {
            padding: 12px 14px !important;
          }

          .rl-main-content {
            padding: 18px 14px 96px !important;
          }

          .rl-page-title {
            font-size: 16px !important;
          }

          .rl-user-name {
            display: none !important;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside
        className="rl-rail"
        style={{
          width: 238,
          minWidth: 238,
          minHeight: "100vh",
          height: "100vh",
          position: "sticky",
          top: 0,
          flexDirection: "column",
          padding: "22px 14px 16px",
          background: t.railBg,
          color: t.railInk,
          borderRight: `1px solid rgba(255,255,255,0.08)`,
          overflowY: "auto",
        }}
      >
        <RailContent
          nav={nav}
          view={view}
          setView={setActiveView}
          t={t}
          sessionUser={sessionUser}
          unread={unread}
          onLogout={handleLogout}
        />
      </aside>

      {/* Mobile navigation drawer */}
      {railOpen && (
        <div
          className="rl-mobile-overlay"
          onClick={() => setRailOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(19, 22, 29, 0.48)",
            backdropFilter: "blur(2px)",
          }}
        >
          <aside
            className="rl-mobile-drawer"
            onClick={(event) => event.stopPropagation()}
            style={{
              width: "min(290px, 86vw)",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "22px 14px 16px",
              overflowY: "auto",
              background: t.railBg,
              color: t.railInk,
              boxShadow: "12px 0 35px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                padding: "0 4px 8px",
              }}
            >
              <button
                onClick={() => setRailOpen(false)}
                aria-label="Close navigation"
                className="rl-icon-button"
                style={iconButtonStyle(t)}
              >
                <X size={19} />
              </button>
            </div>

            <RailContent
              nav={nav}
              view={view}
              setView={setActiveView}
              t={t}
              sessionUser={sessionUser}
              unread={unread}
              onLogout={handleLogout}
            />
          </aside>
        </div>
      )}

      {/* Main workspace */}
      <div
        style={{
          minWidth: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top bar */}
        <header
          className="rl-topbar"
          style={{
            minHeight: 68,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
            padding: "14px 22px",
            position: "sticky",
            top: 0,
            zIndex: 30,
            background: t.surface,
            borderBottom: `1px solid ${t.line}`,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              minWidth: 0,
            }}
          >
            <button
              className="rl-menu-btn rl-icon-button"
              onClick={() => setRailOpen(true)}
              aria-label="Open navigation"
              style={iconButtonStyle(t)}
            >
              <Menu size={20} />
            </button>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  color: t.inkSoft,
                  fontSize: 10.5,
                  fontWeight: 600,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  marginBottom: 3,
                }}
              >
                <span>सेवावर्धिनी</span>
                <ChevronRight size={12} />
                <span style={{ color: ACCENT }}>{activeItem.label}</span>
              </div>

              <div
                className="rl-page-title"
                style={{
                  fontFamily: "Fraunces, Georgia, serif",
                  fontSize: 20,
                  fontWeight: 600,
                  lineHeight: 1.2,
                  color: t.ink,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {activeItem.label}
              </div>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexShrink: 0,
            }}
          >
            <button
              onClick={toggle}
              title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
              aria-label="Toggle theme"
              className="rl-icon-button"
              style={iconButtonStyle(t)}
            >
              {mode === "light" ? <Moon size={17} /> : <Sun size={17} />}
            </button>

            <button
              onClick={() => setActiveView("notifications")}
              title="Notifications"
              aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
              className="rl-icon-button"
              style={{
                ...iconButtonStyle(t),
                position: "relative",
              }}
            >
              <Bell size={17} />

              {unread > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    minWidth: 17,
                    height: 17,
                    padding: "0 4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 20,
                    background: ACCENT,
                    color: "#FFFFFF",
                    border: `2px solid ${t.surface}`,
                    fontSize: 9,
                    fontWeight: 800,
                  }}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveView("settings")}
              title="Account settings"
              aria-label="Open account settings"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "3px 0 3px 5px",
                border: "none",
                background: "transparent",
                cursor: "pointer",
                color: t.ink,
              }}
            >
              <Avatar
                initials={sessionUser.initials}
                t={t}
                size={35}
              />

              <div
                className="rl-user-name"
                style={{
                  textAlign: "left",
                  maxWidth: 132,
                }}
              >
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 700,
                    maxWidth: 132,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {sessionUser.name}
                </div>

                <div
                  style={{
                    fontSize: 10.5,
                    color: t.inkSoft,
                    marginTop: 2,
                  }}
                >
                  {ROLE_LABEL[sessionUser.role] || "Member"}
                </div>
              </div>
            </button>
          </div>
        </header>

        {/* Active page */}
        <main
          className="rl-main-content"
          style={{
            flex: 1,
            minWidth: 0,
            padding: "24px 22px 36px",
            overflowX: "hidden",
          }}
        >
          {view === "dashboard" && (
            <Dashboard {...ctx} setView={setActiveView} />
          )}

          {view === "employees" &&
            CAN.manageEmployees(sessionUser.role) && (
              <EmployeesView {...ctx} />
            )}

          {view === "volunteers" &&
            CAN.manageVolunteers(sessionUser.role) && (
              <VolunteersView {...ctx} />
            )}

          {view === "projects" && <ProjectsView {...ctx} />}

          {view === "tasks" && <TasksView {...ctx} />}

          {view === "attendance" && <AttendanceView {...ctx} />}

          {view === "leave" && <LeaveView {...ctx} />}

          {view === "worklog" && <WorklogView {...ctx} />}

          {view === "reports" && CAN.viewReports(sessionUser.role) && (
            <ReportsView {...ctx} />
          )}

          {view === "notifications" && <NotificationsView {...ctx} />}

          {view === "settings" && (
            <SettingsView
              {...ctx}
              mode={mode}
              toggle={toggle}
              onLogout={handleLogout}
            />
          )}
        </main>

        {/* Mobile bottom navigation */}
        <nav
          className="rl-bottom-nav"
          aria-label="Mobile navigation"
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            alignItems: "stretch",
            justifyContent: "space-around",
            gap: 2,
            padding: "7px 4px max(7px, env(safe-area-inset-bottom))",
            background: t.surface,
            borderTop: `1px solid ${t.line}`,
            boxShadow: "0 -5px 20px rgba(25, 28, 36, 0.04)",
          }}
        >
          {nav.slice(0, 5).map((key) => {
            const item = NAV_ITEMS.find((entry) => entry.key === key);
            if (!item) return null;

            const active = view === key;
            const Icon = item.icon;

            return (
              <button
                key={key}
                onClick={() => setActiveView(key)}
                aria-current={active ? "page" : undefined}
                style={{
                  flex: 1,
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 4,
                  padding: "5px 2px",
                  border: "none",
                  borderRadius: 10,
                  background: active ? ACCENT_SOFT : "transparent",
                  color: active ? ACCENT : t.inkSoft,
                  cursor: "pointer",
                  transition: "background 0.15s ease",
                }}
              >
                <span style={{ position: "relative", display: "flex" }}>
                  <Icon size={19} strokeWidth={active ? 2.4 : 1.8} />

                  {key === "notifications" && unread > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -5,
                        right: -7,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: ACCENT,
                        border: `1.5px solid ${t.surface}`,
                      }}
                    />
                  )}
                </span>

                <span
                  style={{
                    maxWidth: "100%",
                    fontSize: 9.5,
                    fontWeight: active ? 700 : 500,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Toast notification */}
      {toast && (
        <div
          className="rl-toast"
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 82,
            transform: "translateX(-50%)",
            zIndex: 300,
            maxWidth: "calc(100vw - 32px)",
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "12px 17px",
            border: `1px solid ${t.line}`,
            borderLeft: `4px solid ${ACCENT}`,
            borderRadius: 12,
            background: t.surface,
            color: t.ink,
            fontSize: 13,
            fontWeight: 600,
            boxShadow: "0 10px 35px rgba(20, 24, 32, 0.15)",
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: ACCENT,
              flexShrink: 0,
            }}
          />
          {toast}
        </div>
      )}
    </div>
  );
}

function iconButtonStyle(t) {
  return {
    width: 37,
    height: 37,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: `1px solid ${t.line}`,
    borderRadius: 10,
    background: t.surface,
    color: t.ink,
    cursor: "pointer",
    transition: "background 0.15s ease, border-color 0.15s ease",
  };
}

function RailContent({
  nav,
  view,
  setView,
  t,
  sessionUser,
  unread,
  onLogout,
}) {
  const railInk = t.railInk;
  const [confirmSignOut, setConfirmSignOut] = React.useState(false);

  return (
    <>
      {/* Organisation identity */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 11,
          padding: "4px 8px 24px",
        }}
      >
        <img
          src="/sevavardhini-logo.png"
          alt="सेवावर्धिनी logo"
          style={{
            width: 42,
            height: 42,
            flexShrink: 0,
            objectFit: "contain",
            borderRadius: 11,
            background: "#FFFFFF",
            padding: 3,
            boxShadow: "0 3px 10px rgba(0,0,0,0.12)",
          }}
        />

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "'Noto Sans Devanagari', Inter, sans-serif",
              fontSize: 17,
              fontWeight: 750,
              color: railInk,
              letterSpacing: "0.01em",
              lineHeight: 1.25,
            }}
          >
            सेवावर्धिनी
          </div>

          <div
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.64)",
              marginTop: 4,
              lineHeight: 1.4,
            }}
          >
            एक विश्वासार्ह सहकारी
          </div>
        </div>
      </div>

      {/* Navigation section */}
      <div
        style={{
          padding: "0 10px 9px",
          color: "rgba(255,255,255,0.48)",
          fontSize: 9.5,
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        Workspace
      </div>

      <nav
        aria-label="Main navigation"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 4,
          flex: 1,
        }}
      >
        {nav.map((key) => {
          const item = NAV_ITEMS.find((entry) => entry.key === key);
          if (!item) return null;

          const active = view === key;
          const Icon = item.icon;

          return (
            <button
              key={key}
              onClick={() => setView(key)}
              aria-current={active ? "page" : undefined}
              className="rl-nav-button"
              style={{
                position: "relative",
                display: "flex",
                alignItems: "center",
                gap: 12,
                width: "100%",
                minHeight: 42,
                padding: "10px 12px",
                border: "none",
                borderRadius: 10,
                background: active ? ACCENT_SOFT : "transparent",
                color: active ? ACCENT : railInk,
                fontFamily: "Inter, sans-serif",
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                textAlign: "left",
                cursor: "pointer",
                transition: "background 0.15s ease, color 0.15s ease",
              }}
            >
              {active && (
                <span
                  style={{
                    position: "absolute",
                    left: 0,
                    top: 9,
                    bottom: 9,
                    width: 3,
                    borderRadius: 4,
                    background: ACCENT,
                  }}
                />
              )}

              <Icon
                size={17}
                strokeWidth={active ? 2.3 : 1.8}
                color={active ? ACCENT : railInk}
              />

              <span style={{ flex: 1 }}>{item.label}</span>

              {item.key === "notifications" && unread > 0 && (
                <span
                  style={{
                    minWidth: 19,
                    height: 19,
                    padding: "0 5px",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 20,
                    background: ACCENT,
                    color: "#FFFFFF",
                    fontSize: 10,
                    fontWeight: 800,
                  }}
                >
                  {unread > 99 ? "99+" : unread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Signed-in user */}
      <div
        style={{
          marginTop: 22,
          paddingTop: 15,
          borderTop: "1px solid rgba(255,255,255,0.13)",
        }}
      >
        <button
          onClick={() => setView("settings")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 7px",
            border: "none",
            borderRadius: 10,
            background: "transparent",
            color: railInk,
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <Avatar
            initials={sessionUser.initials}
            t={t}
            size={36}
            tone="rgba(255,255,255,0.14)"
          />

          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {sessionUser.name}
            </div>

            <div
              style={{
                marginTop: 4,
                fontSize: 10.5,
                color: "rgba(255,255,255,0.65)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {ROLE_LABEL[sessionUser.role] || "Member"}
            </div>
          </div>

          <SettingsIcon
            size={15}
            color="rgba(255,255,255,0.62)"
          />
        </button>

        {onLogout && (
          <button
            onClick={() => setConfirmSignOut(true)}
            className="rl-nav-button"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              marginTop: 5,
              padding: "10px 12px",
              border: "none",
              borderRadius: 9,
              background: "transparent",
              color: "rgba(255,255,255,0.72)",
              fontSize: 12,
              fontWeight: 500,
              cursor: "pointer",
              textAlign: "left",
            }}
          >
            <LogOut size={16} />
            Sign out
          </button>
        )}

        {confirmSignOut && (
          <ConfirmDialog
            t={t}
            text="Sign out of your account? You will need to sign in again to continue."
            onCancel={() => setConfirmSignOut(false)}
            onConfirm={() => {
              setConfirmSignOut(false);
              if (typeof onLogout === "function") onLogout();
            }}
          />
        )}
      </div>
    </>
  );
}
