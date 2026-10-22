import React, { useState, useEffect, useCallback } from "react";
import {
  LayoutGrid, Users, HeartHandshake, FolderKanban, ListChecks, Clock,
  CalendarDays, NotebookPen, BarChart3, Bell, Settings as SettingsIcon,
  LogOut, Sun, Moon, Menu,
} from "lucide-react";
import { THEME, FONTS, useT } from "./theme";
import { loadData, saveData } from "./services/storage";
import { USERS, ROLE_LABEL, ROLE_NAV, CAN } from "./services/seeds";
import { Avatar, Btn, Field, inputStyle, ConfirmDialog } from "./components/Primitives";

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

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
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

export default function App() {
  const navigate = useNavigate();
  const { t, mode, toggle } = useT();
  const [booting, setBooting] = useState(true);
  const [data, setData] = useState(null);
  const [sessionUser, setSessionUser] = useState(null);
  const [view, setView] = useState("dashboard");
  const [railOpen, setRailOpen] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    (async () => {
      const saved = await loadData();
      setData(saved);
      setBooting(false);
    })();
  }, []);

  const patch = useCallback((updater) => {
    setData((prev) => {
      const next = typeof updater === "function" ? updater(prev) : { ...prev, ...updater };
      saveData(next);
      return next;
    });
  }, []);

  const notify = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2400);
  };

  const pushNotification = (n) => {
    patch((d) => ({
      ...d,
      notifications: [{ id: "n" + Date.now(), read: false, time: "just now", ...n }, ...(d.notifications || [])],
    }));
  };

  const employeeOf = (uid) => USERS.find((u) => u.id === uid) || data?.employees.find((e) => e.id === uid);
  const personOf = (uid) => employeeOf(uid) || data?.volunteers.find((v) => v.id === uid);

  const handleLogin = (u) => {
    setSessionUser(u);
    setView("dashboard");
    navigate("/");
  };

  if (booting || !data) {
    return (
      <div
        style={{
          minHeight: 480,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: t.canvas,
          fontFamily: "Inter",
          color: t.inkSoft,
        }}
      >
        <style>{FONTS}</style>
        Loading सेवावर्धिनी…
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/create-account" element={<CreateAccountPage onLogin={handleLogin} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const nav = ROLE_NAV[sessionUser.role];
  const unread = (data.notifications || []).filter((n) => !n.read).length;

  const ctx = { t, data, patch, sessionUser, notify, pushNotification, employeeOf, personOf };

  return (
    <div
      style={{
        background: t.canvas,
        minHeight: "100vh",
        fontFamily: "Inter",
        color: t.ink,
        display: "flex",
        position: "relative",
      }}
    >
      <style>{`
        ${FONTS}
        * { box-sizing: border-box; }
        body { margin: 0; }
        ::-webkit-scrollbar{width:8px;height:8px} ::-webkit-scrollbar-thumb{background:${t.line};border-radius:4px}
        input:focus, select:focus, textarea:focus { border-color: ${t.primary} !important; }
        button:focus-visible { outline: 2px solid ${t.primary}; outline-offset: 2px; }
        @media (min-width: 900px) {
          .rl-rail { display: flex !important; }
          .rl-menu-btn { display: none !important; }
          .rl-bottom-nav { display: none !important; }
        }
      `}</style>

      {/* Desktop rail */}
      <div className="rl-rail" style={{ width: 216, background: t.railBg, flexShrink: 0, display: "none", flexDirection: "column", padding: "20px 14px", minHeight: "100vh" }}>
        <RailContent nav={nav} view={view} setView={setView} t={t} sessionUser={sessionUser} unread={unread} />
      </div>

      {/* Mobile drawer */}
      {railOpen && (
        <div onClick={() => setRailOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0, 0, 0, 0.4)", zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 216, height: "100%", background: t.railBg, padding: "20px 14px", overflowY: "auto" }}>
            <RailContent nav={nav} view={view} setView={(v) => { setView(v); setRailOpen(false); }} t={t} sessionUser={sessionUser} unread={unread} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${t.line}`, background: t.surface, position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="rl-menu-btn" onClick={() => setRailOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: t.ink, display: "flex", padding: 4 }}>
              <Menu size={20} />
            </button>
            <div style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 600 }}>{NAV_ITEMS.find((n) => n.key === view)?.label}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={toggle} title="Toggle theme" style={{ background: "none", border: `1px solid ${t.line}`, borderRadius: 7, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.ink }}>
              {mode === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button onClick={() => setView("notifications")} title="Notifications" style={{ position: "relative", background: "none", border: `1px solid ${t.line}`, borderRadius: 7, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.ink }}>
              <Bell size={15} />
              {unread > 0 && <span style={{ position: "absolute", top: -3, right: -3, background: t.coral, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10, minWidth: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
            </button>
            <div onClick={() => setView("settings")} style={{ cursor: "pointer" }}>
              <Avatar initials={sessionUser.initials} t={t} size={32} />
            </div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 84px 20px" }}>
          {view === "dashboard" && <Dashboard {...ctx} setView={setView} />}
          {view === "employees" && CAN.manageEmployees(sessionUser.role) && <EmployeesView {...ctx} />}
          {view === "volunteers" && CAN.manageVolunteers(sessionUser.role) && <VolunteersView {...ctx} />}
          {view === "projects" && <ProjectsView {...ctx} />}
          {view === "tasks" && <TasksView {...ctx} />}
          {view === "attendance" && <AttendanceView {...ctx} />}
          {view === "leave" && <LeaveView {...ctx} />}
          {view === "worklog" && <WorklogView {...ctx} />}
          {view === "reports" && CAN.viewReports(sessionUser.role) && <ReportsView {...ctx} />}
          {view === "notifications" && <NotificationsView {...ctx} />}
          {view === "settings" && <SettingsView {...ctx} mode={mode} toggle={toggle} onLogout={() => { setSessionUser(null); navigate("/login"); }} />}
        </div>

        {/* Mobile bottom nav */}
        <div className="rl-bottom-nav" style={{ display: "flex", position: "fixed", bottom: 0, left: 0, right: 0, background: t.surface, borderTop: `1px solid ${t.line}`, justifyContent: "space-around", padding: "8px 4px", zIndex: 40 }}>
          {nav.slice(0, 5).map((key) => {
            const item = NAV_ITEMS.find((n) => n.key === key);
            const active = view === key;
            return (
              <button key={key} onClick={() => setView(key)} style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, color: active ? t.primary : t.inkSoft, padding: "4px 8px" }}>
                <item.icon size={19} />
                <span style={{ fontSize: 9.5, fontWeight: 600 }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {toast && (
        <div style={{ position: "fixed", bottom: 76, left: "50%", transform: "translateX(-50%)", background: t.primaryDeep, color: "#fff", padding: "10px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, zIndex: 300, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}>
          {toast}
        </div>
      )}
    </div>
  );
}

function RailContent({ nav, view, setView, t, sessionUser, unread }) {
  const railInk = t.railInk;
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 8px 20px 8px" }}>
        <img
          src="/sevavardhini-logo.png"
          alt="सेवावर्धिनी"
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            objectFit: "contain",
            background: "#FFFFFF",
            padding: 2,
            boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
            flexShrink: 0,
          }}
        />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontFamily: "'Noto Sans Devanagari', 'Inter', sans-serif", fontSize: 16.5, fontWeight: 700, color: railInk, letterSpacing: "0.01em", lineHeight: 1.15 }}>
            सेवावर्धिनी
          </div>
          <div style={{ fontSize: 9.5, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            एक विश्वासार्ह सहकारी
          </div>
        </div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 3, flex: 1 }}>
        {nav.map((key) => {
          const item = NAV_ITEMS.find((n) => n.key === key);
          const active = view === key;
          return (
            <button
              key={key}
              onClick={() => setView(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "9px 12px",
                borderRadius: 8,
                border: "none",
                cursor: "pointer",
                background: active ? "rgba(244, 123, 32, 0.2)" : "transparent",
                color: active ? "#F47B20" : railInk,
                fontFamily: "Inter",
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                textAlign: "left",
                position: "relative",
                transition: "all 0.15s ease",
              }}
            >
              <item.icon size={16} color={active ? "#F47B20" : railInk} />
              {item.label}
              {item.key === "notifications" && unread > 0 && (
                <span style={{ marginLeft: "auto", background: "#F47B20", color: "#FFFFFF", fontSize: 9.5, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>{unread}</span>
              )}
            </button>
          );
        })}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,0.13)", paddingTop: 12, display: "flex", alignItems: "center", gap: 9, color: railInk }}>
        <Avatar initials={sessionUser.initials} t={t} size={32} tone="rgba(255,255,255,0.15)" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sessionUser.name}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{ROLE_LABEL[sessionUser.role]}</div>
        </div>
      </div>
    </>
  );
}
