import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  LayoutGrid, Users, HeartHandshake, FolderKanban, ListChecks, Clock,
  CalendarDays, NotebookPen, BarChart3, Bell, Settings as SettingsIcon,
  LogOut, Search, Plus, X, Pencil, Trash2, Check, ChevronRight, ChevronDown,
  Sun, Moon, Menu, AlertTriangle, CircleCheck, CircleDot, Clock3,
  MapPin, Phone, Mail, Paperclip, ArrowLeft, Filter, Megaphone, User,
} from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";

/* ============================================================================
   ROOTLINE — NGO Field Operations Management
   Design language: a "field ledger" — hairline rules, small-caps labels,
   monospace figures — evoking the logbooks NGO field teams actually keep.
   Palette: forest teal (trust/growth), warm sand canvas, gold + coral status.
   ========================================================================== */

const THEME = {
  light: {
    canvas: "#F7F5F0", surface: "#FFFFFF", ink: "#1B2E2B", inkSoft: "#5B6B64",
    line: "#DDD6C6", primary: "#2F6E5D", primaryDeep: "#1F4A3F",
    gold: "#B9812A", coral: "#C1553C", success: "#3F7F52", railBg: "#1F4A3F",
    railInk: "#EDEAE0", chipBg: "#EFEBDD",
  },
  dark: {
    canvas: "#141B19", surface: "#1B2422", ink: "#EDEAE0", inkSoft: "#9BAFA8",
    line: "#2C3733", primary: "#4C9C82", primaryDeep: "#2F6E5D",
    gold: "#D6A34C", coral: "#E07A5F", success: "#5CAE72", railBg: "#0F1614",
    railInk: "#EDEAE0", chipBg: "#233029",
  },
};

const FONTS = `
@import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
`;

/* ---------------------------------------------------------------------------
   SEED DATA
   --------------------------------------------------------------------------- */

const USERS = [
  { id: "u1", role: "admin", name: "Amara Osei", title: "Executive Director", initials: "AO" },
  { id: "u2", role: "manager", name: "Daniel Cruz", title: "Program Manager", initials: "DC" },
  { id: "u3", role: "coordinator", name: "Priya Nair", title: "Field Coordinator", initials: "PN" },
  { id: "u4", role: "employee", name: "Tomas Weber", title: "Logistics Officer", initials: "TW" },
  { id: "u5", role: "volunteer", name: "Grace Mbeki", title: "Community Volunteer", initials: "GM" },
];

const ROLE_LABEL = {
  admin: "Administrator", manager: "Project Manager", coordinator: "Coordinator",
  employee: "Employee", volunteer: "Volunteer",
};

const seedEmployees = () => ([
  { id: "e1", name: "Tomas Weber", role: "Logistics Officer", dept: "Operations", email: "tomas.weber@rootline.org", phone: "+1 405 555 0142", status: "Active", joined: "2022-03-14", photo: "TW" },
  { id: "e2", name: "Lena Fischer", role: "Field Nurse", dept: "Health", email: "lena.fischer@rootline.org", phone: "+1 405 555 0198", status: "Active", joined: "2021-11-02", photo: "LF" },
  { id: "e3", name: "Kwame Boateng", role: "Water Engineer", dept: "WASH", email: "kwame.boateng@rootline.org", phone: "+233 24 555 0110", status: "Active", joined: "2023-01-09", photo: "KB" },
  { id: "e4", name: "Sofia Reyes", role: "Finance Officer", dept: "Finance", email: "sofia.reyes@rootline.org", phone: "+1 405 555 0177", status: "On Leave", joined: "2020-06-23", photo: "SR" },
  { id: "e5", name: "Daniel Cruz", role: "Program Manager", dept: "Programs", email: "daniel.cruz@rootline.org", phone: "+1 405 555 0133", status: "Active", joined: "2019-09-01", photo: "DC" },
  { id: "e6", name: "Priya Nair", role: "Field Coordinator", dept: "Programs", email: "priya.nair@rootline.org", phone: "+91 98 555 01144", status: "Active", joined: "2022-07-19", photo: "PN" },
  { id: "e7", name: "Omar Haddad", role: "Education Lead", dept: "Education", email: "omar.haddad@rootline.org", phone: "+962 79 555 0121", status: "Active", joined: "2023-04-11", photo: "OH" },
]);

const seedVolunteers = () => ([
  { id: "v1", name: "Grace Mbeki", skills: ["Teaching", "Translation"], availability: "Weekends", hours: 132, status: "Active", assigned: "p3", email: "grace.mbeki@mail.com", phone: "+27 71 555 0110" },
  { id: "v2", name: "Noah Bergström", skills: ["Carpentry", "Driving"], availability: "Weekdays", hours: 88, status: "Active", assigned: "p1", email: "noah.b@mail.com", phone: "+46 70 555 0199" },
  { id: "v3", name: "Aisha Rahman", skills: ["First Aid", "Counselling"], availability: "Flexible", hours: 210, status: "Active", assigned: "p2", email: "aisha.r@mail.com", phone: "+880 17 555 0143" },
  { id: "v4", name: "Marcus Lee", skills: ["Photography", "Social Media"], availability: "Weekends", hours: 54, status: "Inactive", assigned: null, email: "marcus.lee@mail.com", phone: "+1 213 555 0176" },
  { id: "v5", name: "Elena Popescu", skills: ["Logistics", "Cooking"], availability: "Weekdays", hours: 97, status: "Active", assigned: "p1", email: "elena.p@mail.com", phone: "+40 72 555 0155" },
]);

const seedProjects = () => ([
  { id: "p1", name: "Clean Water Access — Kponsu", desc: "Drilling and maintaining 6 boreholes across Kponsu district to serve ~3,200 residents.", status: "Active", coordinator: "e6", team: ["e1", "e3", "v2", "v5"], start: "2026-01-12", end: "2026-09-30", progress: 62, budget: 84000, spent: 49600 },
  { id: "p2", name: "Maternal Health Outreach", desc: "Mobile clinics and prenatal training for rural communities in the eastern province.", status: "Active", coordinator: "e5", team: ["e2", "v3"], start: "2025-11-01", end: "2026-08-15", progress: 78, budget: 61000, spent: 51200 },
  { id: "p3", name: "Literacy for All", desc: "After-school literacy program for 240 children across 5 villages.", status: "Delayed", coordinator: "e7", team: ["e6", "v1"], start: "2025-09-01", end: "2026-06-30", progress: 41, budget: 32000, spent: 21800 },
  { id: "p4", name: "Emergency Flood Relief", desc: "Distribution of shelter kits and clean water supplies following seasonal flooding.", status: "Completed", coordinator: "e5", team: ["e1", "e2"], start: "2025-07-05", end: "2025-08-20", progress: 100, budget: 45000, spent: 43250 },
  { id: "p5", name: "Youth Vocational Training", desc: "Carpentry and tailoring workshops for out-of-school youth.", status: "Planning", coordinator: "e6", team: ["e7"], start: "2026-09-01", end: "2027-03-01", progress: 5, budget: 27000, spent: 900 },
]);

const seedTasks = () => ([
  { id: "t1", project: "p1", title: "Survey borehole site #4", assignee: "e3", priority: "High", due: "2026-08-08", status: "In Progress", comments: [{ by: "e6", text: "Please confirm access with village elder first.", at: "2026-08-04" }], attachments: ["site_map_4.pdf"] },
  { id: "t2", project: "p1", title: "Order replacement pump parts", assignee: "e1", priority: "Medium", due: "2026-08-10", status: "Pending", comments: [], attachments: [] },
  { id: "t3", project: "p1", title: "Community training — pump maintenance", assignee: "v2", priority: "Medium", due: "2026-08-02", status: "Overdue", comments: [], attachments: [] },
  { id: "t4", project: "p2", title: "Restock prenatal vitamin supply", assignee: "e2", priority: "High", due: "2026-08-07", status: "In Progress", comments: [], attachments: [] },
  { id: "t5", project: "p2", title: "Schedule mobile clinic — Rango village", assignee: "v3", priority: "Low", due: "2026-08-14", status: "Pending", comments: [], attachments: [] },
  { id: "t6", project: "p3", title: "Print literacy workbooks (Batch 3)", assignee: "e7", priority: "Medium", due: "2026-08-01", status: "Overdue", comments: [], attachments: [] },
  { id: "t7", project: "p3", title: "Volunteer teacher onboarding", assignee: "v1", priority: "High", due: "2026-08-09", status: "In Progress", comments: [], attachments: [] },
  { id: "t8", project: "p1", title: "Submit Q3 water quality report", assignee: "e3", priority: "High", due: "2026-07-28", status: "Completed", comments: [], attachments: ["q3_report.pdf"] },
  { id: "t9", project: "p2", title: "Coordinate transport for clinic staff", assignee: "v3", priority: "Medium", due: "2026-08-06", status: "Completed", comments: [], attachments: [] },
]);

const seedAttendance = () => {
  const days = ["2026-08-03", "2026-08-04", "2026-08-05", "2026-08-06"];
  const out = [];
  USERS.forEach((u) => {
    days.forEach((d, i) => {
      if (d === "2026-08-06" && i === 3) return;
      out.push({ id: `${u.id}-${d}`, user: u.id, date: d, checkIn: "08:5" + (i % 3) , checkOut: i < 3 ? "17:3" + (i % 4) : null, hours: i < 3 ? 8.5 : null });
    });
  });
  return out;
};

const seedLeaves = () => ([
  { id: "l1", user: "e4", type: "Sick Leave", from: "2026-08-05", to: "2026-08-09", reason: "Recovering from minor surgery.", status: "Approved" },
  { id: "l2", user: "e2", type: "Annual Leave", from: "2026-08-18", to: "2026-08-22", reason: "Family visit.", status: "Pending" },
  { id: "l3", user: "e3", type: "Personal Leave", from: "2026-08-12", to: "2026-08-12", reason: "Local government appointment.", status: "Pending" },
  { id: "l4", user: "e1", type: "Annual Leave", from: "2026-07-14", to: "2026-07-18", reason: "Rest.", status: "Approved" },
  { id: "l5", user: "e7", type: "Sick Leave", from: "2026-07-02", to: "2026-07-03", reason: "Flu.", status: "Rejected" },
]);

const seedWorklogs = () => ([
  { id: "w1", user: "e3", date: "2026-08-05", summary: "Surveyed site #4, met with village elder, mapped access road.", hours: 6.5, completed: "Site survey, elder consultation", pending: "Await council sign-off", files: [], status: "Reviewed" },
  { id: "w2", user: "v2", date: "2026-08-05", summary: "Assisted with pump part inventory and labeling.", hours: 4, completed: "Inventory count", pending: "None", files: [], status: "Pending Review" },
  { id: "w3", user: "e2", date: "2026-08-04", summary: "Ran prenatal check-ups for 14 patients at Rango outpost.", hours: 7, completed: "14 check-ups, supply restock request", pending: "Follow-up for 2 high-risk cases", files: ["clinic_log_0804.pdf"], status: "Reviewed" },
  { id: "w4", user: "v1", date: "2026-08-04", summary: "Led literacy session for 22 children, group B.", hours: 3, completed: "Session delivered, attendance logged", pending: "Grade weekly worksheets", files: [], status: "Pending Review" },
]);

const seedNotifications = () => ([
  { id: "n1", title: "New task assigned", body: "\"Survey borehole site #4\" assigned to you.", time: "2h ago", read: false, kind: "task" },
  { id: "n2", title: "Leave request approved", body: "Your Annual Leave (Jul 14–18) was approved.", time: "1d ago", read: false, kind: "leave" },
  { id: "n3", title: "Task overdue", body: "\"Print literacy workbooks (Batch 3)\" is overdue.", time: "1d ago", read: true, kind: "alert" },
  { id: "n4", title: "Project updated", body: "Clean Water Access — Kponsu progress moved to 62%.", time: "2d ago", read: true, kind: "project" },
  { id: "n5", title: "Announcement", body: "All-hands field briefing this Friday, 9:00 AM.", time: "3d ago", read: true, kind: "announcement" },
]);

const ANNOUNCEMENTS = [
  { id: "a1", title: "All-hands field briefing", body: "Friday 9:00 AM at the district office — Q3 priorities and safety refresher.", by: "Amara Osei", date: "2026-08-03" },
  { id: "a2", title: "New expense policy", body: "Updated per-diem rates now in effect for all field travel. See Settings > Help.", by: "Sofia Reyes", date: "2026-07-29" },
];

/* ---------------------------------------------------------------------------
   PERMISSIONS
   --------------------------------------------------------------------------- */

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

const ROLE_NAV = {
  admin: ["dashboard", "employees", "volunteers", "projects", "tasks", "attendance", "leave", "worklog", "reports", "notifications", "settings"],
  manager: ["dashboard", "employees", "volunteers", "projects", "tasks", "attendance", "leave", "reports", "notifications", "settings"],
  coordinator: ["dashboard", "projects", "tasks", "attendance", "leave", "worklog", "notifications", "settings"],
  employee: ["dashboard", "tasks", "attendance", "leave", "worklog", "notifications", "settings"],
  volunteer: ["dashboard", "tasks", "worklog", "notifications", "settings"],
};

const CAN = {
  manageEmployees: (r) => ["admin", "manager"].includes(r),
  manageVolunteers: (r) => ["admin", "manager"].includes(r),
  manageProjects: (r) => ["admin", "manager"].includes(r),
  manageTasks: (r) => ["admin", "manager", "coordinator"].includes(r),
  approveLeave: (r) => ["admin", "manager"].includes(r),
  viewReports: (r) => ["admin", "manager"].includes(r),
  viewAllAttendance: (r) => ["admin", "manager", "coordinator"].includes(r),
};

/* ---------------------------------------------------------------------------
   STORAGE HELPERS
   --------------------------------------------------------------------------- */

const STORAGE_KEY = "rootline-data-v1";

async function loadData() {
  try {
    const res = await window.storage.get(STORAGE_KEY, false);
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) { /* no saved data yet */ }
  return null;
}
async function saveData(data) {
  try { await window.storage.set(STORAGE_KEY, JSON.stringify(data), false); }
  catch (e) { console.error("Save failed", e); }
}

function freshData() {
  return {
    employees: seedEmployees(), volunteers: seedVolunteers(), projects: seedProjects(),
    tasks: seedTasks(), attendance: seedAttendance(), leaves: seedLeaves(),
    worklogs: seedWorklogs(), notifications: seedNotifications(),
  };
}

/* ---------------------------------------------------------------------------
   SMALL UI PRIMITIVES
   --------------------------------------------------------------------------- */

function useT() {
  const [mode, setMode] = useState("light");
  const t = THEME[mode];
  return { t, mode, toggle: () => setMode((m) => (m === "light" ? "dark" : "light")) };
}

const Label = ({ children, t }) => (
  <div style={{ fontFamily: "Inter", fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: t.inkSoft, fontWeight: 600 }}>{children}</div>
);

const StatusChip = ({ status, t }) => {
  const map = {
    Active: t.success, Completed: t.success, Approved: t.success, Reviewed: t.success,
    Pending: t.gold, Planning: t.gold, "Pending Review": t.gold, "On Leave": t.gold,
    Delayed: t.coral, Overdue: t.coral, Rejected: t.coral, Inactive: t.inkSoft,
    "In Progress": t.primary,
  };
  const c = map[status] || t.inkSoft;
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: c, background: c + "1A", padding: "3px 9px", borderRadius: 20, whiteSpace: "nowrap" }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: c }} />
      {status}
    </span>
  );
};

const PriorityChip = ({ p, t }) => {
  const map = { High: t.coral, Medium: t.gold, Low: t.inkSoft };
  const c = map[p] || t.inkSoft;
  return <span style={{ fontFamily: "Inter", fontSize: 11, fontWeight: 700, color: c, letterSpacing: "0.04em" }}>{p.toUpperCase()}</span>;
};

const Card = ({ children, t, style }) => (
  <div style={{ background: t.surface, border: `1px solid ${t.line}`, borderRadius: 10, ...style }}>{children}</div>
);

const Btn = ({ children, onClick, t, variant = "primary", icon: Icon, style, type = "button", disabled }) => {
  const base = { fontFamily: "Inter", fontSize: 13.5, fontWeight: 600, padding: "9px 15px", borderRadius: 7, display: "inline-flex", alignItems: "center", gap: 7, cursor: disabled ? "not-allowed" : "pointer", border: "1px solid transparent", opacity: disabled ? 0.5 : 1, transition: "opacity .15s" };
  const variants = {
    primary: { background: t.primary, color: "#fff" },
    ghost: { background: "transparent", color: t.ink, border: `1px solid ${t.line}` },
    danger: { background: "transparent", color: t.coral, border: `1px solid ${t.coral}55` },
    subtle: { background: t.chipBg, color: t.ink },
  };
  return (
    <button type={type} disabled={disabled} onClick={onClick} style={{ ...base, ...variants[variant], ...style }}>
      {Icon && <Icon size={15} />}{children}
    </button>
  );
};

const Field = ({ label, children, t }) => (
  <label style={{ display: "block", marginBottom: 12 }}>
    <div style={{ fontFamily: "Inter", fontSize: 12, fontWeight: 600, color: t.inkSoft, marginBottom: 5 }}>{label}</div>
    {children}
  </label>
);

const inputStyle = (t) => ({ width: "100%", boxSizing: "border-box", fontFamily: "Inter", fontSize: 14, padding: "9px 11px", borderRadius: 7, border: `1px solid ${t.line}`, background: t.canvas, color: t.ink, outline: "none" });

function Modal({ title, onClose, children, t, wide }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#00000066", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: t.surface, width: "100%", maxWidth: wide ? 640 : 460, maxHeight: "88vh", overflowY: "auto", borderRadius: "16px 16px 0 0", padding: 22, animation: "slideUp .18s ease-out" }}>
        <style>{`@keyframes slideUp{from{transform:translateY(24px);opacity:0}to{transform:translateY(0);opacity:1}} @media(min-width:760px){.rl-modal-wrap{align-items:center !important} .rl-modal-card{border-radius:14px !important}}`}</style>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
          <div style={{ fontFamily: "Fraunces", fontSize: 20, fontWeight: 600, color: t.ink }}>{title}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: t.inkSoft }}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ConfirmDialog({ text, onConfirm, onCancel, t }) {
  return (
    <div onClick={onCancel} style={{ position: "fixed", inset: 0, background: "#00000066", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: t.surface, borderRadius: 12, padding: 22, maxWidth: 360, width: "100%" }}>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", marginBottom: 18 }}>
          <AlertTriangle size={20} color={t.coral} style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontFamily: "Inter", fontSize: 14.5, color: t.ink, lineHeight: 1.5 }}>{text}</div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <Btn t={t} variant="ghost" onClick={onCancel}>Cancel</Btn>
          <Btn t={t} variant="danger" onClick={onConfirm} style={{ background: t.coral, color: "#fff", border: "none" }}>Confirm</Btn>
        </div>
      </div>
    </div>
  );
}

function Empty({ icon: Icon, title, hint, t }) {
  return (
    <div style={{ textAlign: "center", padding: "48px 20px", color: t.inkSoft }}>
      <Icon size={30} style={{ opacity: 0.5, marginBottom: 10 }} />
      <div style={{ fontFamily: "Fraunces", fontSize: 17, color: t.ink, marginBottom: 4 }}>{title}</div>
      <div style={{ fontFamily: "Inter", fontSize: 13 }}>{hint}</div>
    </div>
  );
}

function Avatar({ initials, size = 32, t, tone }) {
  return (
    <div style={{ width: size, height: size, borderRadius: "50%", background: tone || t.primary, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter", fontWeight: 700, fontSize: size * 0.36, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

const SearchBox = ({ value, onChange, t, placeholder }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8, border: `1px solid ${t.line}`, borderRadius: 8, padding: "8px 12px", background: t.surface }}>
    <Search size={15} color={t.inkSoft} />
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder || "Search..."} style={{ border: "none", outline: "none", background: "transparent", fontFamily: "Inter", fontSize: 13.5, color: t.ink, width: "100%" }} />
  </div>
);

/* ---------------------------------------------------------------------------
   APP
   --------------------------------------------------------------------------- */

export default function App() {
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
      setData(saved || freshData());
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

  const notify = (msg) => { setToast(msg); setTimeout(() => setToast(null), 2400); };

  const employeeOf = (uid) => USERS.find((u) => u.id === uid) || data?.employees.find((e) => e.id === uid);

  if (booting || !data) {
    return (
      <div style={{ minHeight: 480, display: "flex", alignItems: "center", justifyContent: "center", background: t.canvas, fontFamily: "Inter", color: t.inkSoft }}>
        <style>{FONTS}</style>
        Loading Rootline…
      </div>
    );
  }

  if (!sessionUser) {
    return <LoginScreen t={t} mode={mode} toggle={toggle} onLogin={(u) => { setSessionUser(u); setView("dashboard"); }} />;
  }

  const nav = ROLE_NAV[sessionUser.role];
  const unread = data.notifications.filter((n) => !n.read).length;

  const ctx = { t, data, patch, sessionUser, notify, employeeOf, USERS };

  return (
    <div style={{ background: t.canvas, minHeight: 640, fontFamily: "Inter", color: t.ink, display: "flex", position: "relative", overflow: "hidden", borderRadius: 12 }}>
      <style>{FONTS}{`
        * { box-sizing: border-box; }
        ::-webkit-scrollbar{width:8px;height:8px} ::-webkit-scrollbar-thumb{background:${t.line};border-radius:4px}
        input:focus, select:focus, textarea:focus { border-color: ${t.primary} !important; }
        button:focus-visible { outline: 2px solid ${t.primary}; outline-offset: 2px; }
      `}</style>

      {/* Desktop rail */}
      <div className="rl-rail" style={{ width: 216, background: t.railBg, flexShrink: 0, display: "none", flexDirection: "column", padding: "20px 14px" }}>
        <RailContent nav={nav} view={view} setView={setView} t={t} railInk={t.railInk} sessionUser={sessionUser} unread={unread} />
      </div>

      {/* Mobile drawer */}
      {railOpen && (
        <div onClick={() => setRailOpen(false)} style={{ position: "absolute", inset: 0, background: "#00000066", zIndex: 50 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ width: 216, height: "100%", background: t.railBg, padding: "20px 14px" }}>
            <RailContent nav={nav} view={view} setView={(v) => { setView(v); setRailOpen(false); }} t={t} railInk={t.railInk} sessionUser={sessionUser} unread={unread} />
          </div>
        </div>
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${t.line}`, background: t.surface }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="rl-menu-btn" onClick={() => setRailOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: t.ink, display: "flex" }}><Menu size={20} /></button>
            <div style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 600 }}>{NAV_ITEMS.find((n) => n.key === view)?.label}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button onClick={toggle} title="Toggle theme" style={{ background: "none", border: `1px solid ${t.line}`, borderRadius: 7, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.ink }}>
              {mode === "light" ? <Moon size={15} /> : <Sun size={15} />}
            </button>
            <button onClick={() => setView("notifications")} style={{ position: "relative", background: "none", border: `1px solid ${t.line}`, borderRadius: 7, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.ink }}>
              <Bell size={15} />
              {unread > 0 && <span style={{ position: "absolute", top: -3, right: -3, background: t.coral, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 10, minWidth: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>{unread}</span>}
            </button>
            <div onClick={() => setView("settings")} style={{ cursor: "pointer" }}><Avatar initials={sessionUser.initials} t={t} /></div>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 84px 20px" }}>
          {view === "dashboard" && <Dashboard {...ctx} />}
          {view === "employees" && CAN.manageEmployees(sessionUser.role) && <EmployeesView {...ctx} />}
          {view === "volunteers" && CAN.manageVolunteers(sessionUser.role) && <VolunteersView {...ctx} />}
          {view === "projects" && <ProjectsView {...ctx} />}
          {view === "tasks" && <TasksView {...ctx} setView={setView} />}
          {view === "attendance" && <AttendanceView {...ctx} />}
          {view === "leave" && <LeaveView {...ctx} />}
          {view === "worklog" && <WorklogView {...ctx} />}
          {view === "reports" && CAN.viewReports(sessionUser.role) && <ReportsView {...ctx} />}
          {view === "notifications" && <NotificationsView {...ctx} />}
          {view === "settings" && <SettingsView {...ctx} mode={mode} toggle={toggle} onLogout={() => setSessionUser(null)} />}
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
        <div style={{ position: "fixed", bottom: 76, left: "50%", transform: "translateX(-50%)", background: t.primaryDeep, color: "#fff", padding: "10px 18px", borderRadius: 20, fontSize: 13, fontWeight: 600, zIndex: 300, boxShadow: "0 4px 16px #00000033" }}>
          {toast}
        </div>
      )}

      <style>{`
        @media (min-width: 900px) {
          .rl-rail { display: flex !important; }
          .rl-menu-btn { display: none !important; }
          .rl-bottom-nav { display: none !important; }
        }
      `}</style>
    </div>
  );
}

function RailContent({ nav, view, setView, t, railInk, sessionUser, unread }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 8px 22px 8px" }}>
        <div style={{ width: 30, height: 30, borderRadius: 7, background: railInk, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <span style={{ fontFamily: "Fraunces", fontWeight: 700, fontSize: 15, color: t.railBg }}>R</span>
        </div>
        <span style={{ fontFamily: "Fraunces", fontSize: 18, fontWeight: 600, color: railInk }}>Rootline</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {nav.map((key) => {
          const item = NAV_ITEMS.find((n) => n.key === key);
          const active = view === key;
          return (
            <button key={key} onClick={() => setView(key)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 10px", borderRadius: 7, border: "none", cursor: "pointer", background: active ? "#ffffff1A" : "transparent", color: railInk, fontFamily: "Inter", fontSize: 13.5, fontWeight: active ? 700 : 500, textAlign: "left", position: "relative" }}>
              <item.icon size={16} />
              {item.label}
              {item.key === "notifications" && unread > 0 && <span style={{ marginLeft: "auto", background: "#C1553C", fontSize: 9.5, fontWeight: 700, borderRadius: 10, padding: "1px 6px" }}>{unread}</span>}
            </button>
          );
        })}
      </div>
      <div style={{ borderTop: "1px solid #ffffff22", paddingTop: 12, display: "flex", alignItems: "center", gap: 9, color: railInk }}>
        <Avatar initials={sessionUser.initials} t={t} tone="#ffffff26" />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{sessionUser.name}</div>
          <div style={{ fontSize: 11, opacity: 0.7 }}>{ROLE_LABEL[sessionUser.role]}</div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------------------
   LOGIN
   --------------------------------------------------------------------------- */

function LoginScreen({ t, mode, toggle, onLogin }) {
  const [selected, setSelected] = useState(USERS[0].id);
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  const submit = (e) => {
    e.preventDefault();
    if (pw.length < 4) { setErr("Enter your password (demo: any 4+ characters)."); return; }
    const u = USERS.find((x) => x.id === selected);
    onLogin(u);
  };

  return (
    <div style={{ minHeight: 640, background: t.canvas, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: "Inter", borderRadius: 12 }}>
      <style>{FONTS}</style>
      <div style={{ width: "100%", maxWidth: 380 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 30 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: t.primaryDeep, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontFamily: "Fraunces", fontWeight: 700, fontSize: 17, color: "#fff" }}>R</span>
            </div>
            <span style={{ fontFamily: "Fraunces", fontSize: 21, fontWeight: 600, color: t.ink }}>Rootline</span>
          </div>
          <button onClick={toggle} style={{ background: "none", border: `1px solid ${t.line}`, borderRadius: 7, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: t.ink }}>
            {mode === "light" ? <Moon size={15} /> : <Sun size={15} />}
          </button>
        </div>

        <div style={{ fontFamily: "Fraunces", fontSize: 26, fontWeight: 600, color: t.ink, lineHeight: 1.2, marginBottom: 6 }}>Sign in to the field register.</div>
        <div style={{ fontSize: 13.5, color: t.inkSoft, marginBottom: 26 }}>Demo build — choose a role to explore its dashboard and permissions.</div>

        <form onSubmit={submit}>
          <Field label="Sign in as" t={t}>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {USERS.map((u) => (
                <label key={u.id} style={{ display: "flex", alignItems: "center", gap: 10, border: `1px solid ${selected === u.id ? t.primary : t.line}`, background: selected === u.id ? t.primary + "10" : t.surface, borderRadius: 9, padding: "9px 12px", cursor: "pointer" }}>
                  <input type="radio" name="user" checked={selected === u.id} onChange={() => setSelected(u.id)} style={{ accentColor: t.primary }} />
                  <Avatar initials={u.initials} t={t} size={28} />
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: t.ink }}>{u.name}</div>
                    <div style={{ fontSize: 11.5, color: t.inkSoft }}>{ROLE_LABEL[u.role]}</div>
                  </div>
                </label>
              ))}
            </div>
          </Field>
          <Field label="Password" t={t}>
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" style={inputStyle(t)} />
          </Field>
          {err && <div style={{ color: t.coral, fontSize: 12.5, marginBottom: 12 }}>{err}</div>}
          <Btn t={t} type="submit" style={{ width: "100%", justifyContent: "center", padding: "11px 15px" }}>Sign in</Btn>
        </form>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   DASHBOARD
   --------------------------------------------------------------------------- */

function StatCard({ label, value, t, icon: Icon, tone }) {
  return (
    <Card t={t} style={{ padding: "16px 16px" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
        <Label t={t}>{label}</Label>
        <Icon size={15} color={tone || t.inkSoft} />
      </div>
      <div style={{ fontFamily: "IBM Plex Mono", fontSize: 26, fontWeight: 600, color: t.ink, marginTop: 8 }}>{value}</div>
    </Card>
  );
}

function Dashboard({ t, data, sessionUser }) {
  const { projects, tasks, employees, volunteers, attendance, leaves } = data;
  const active = projects.filter((p) => p.status === "Active").length;
  const completed = projects.filter((p) => p.status === "Completed").length;
  const delayed = projects.filter((p) => p.status === "Delayed").length;
  const pendingTasks = tasks.filter((tk) => tk.status !== "Completed").length;
  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;

  const myTasks = tasks.filter((tk) => tk.assignee === sessionUser.id);
  const todayAtt = attendance.filter((a) => a.date === "2026-08-06").length;

  const statusPie = ["Active", "Completed", "Delayed", "Planning"].map((s) => ({ name: s, value: projects.filter((p) => p.status === s).length }));
  const pieColors = [t.primary, t.success, t.coral, t.gold];

  const taskBar = ["Pending", "In Progress", "Overdue", "Completed"].map((s) => ({ name: s, count: tasks.filter((tk) => tk.status === s).length }));

  const isManager = CAN.viewReports(sessionUser.role);

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "Fraunces", fontSize: 22, fontWeight: 600, color: t.ink }}>Welcome back, {sessionUser.name.split(" ")[0]}.</div>
        <div style={{ fontSize: 13.5, color: t.inkSoft }}>Here's what's happening across the organization today.</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard t={t} label="Total Projects" value={projects.length} icon={FolderKanban} />
        <StatCard t={t} label="Active Projects" value={active} icon={CircleDot} tone={t.primary} />
        <StatCard t={t} label="Completed" value={completed} icon={CircleCheck} tone={t.success} />
        <StatCard t={t} label="Delayed" value={delayed} icon={AlertTriangle} tone={t.coral} />
        {isManager && <StatCard t={t} label="Total Employees" value={employees.length} icon={Users} />}
        {isManager && <StatCard t={t} label="Total Volunteers" value={volunteers.length} icon={HeartHandshake} />}
        <StatCard t={t} label="Pending Tasks" value={pendingTasks} icon={ListChecks} tone={t.gold} />
        <StatCard t={t} label="Leave Requests" value={pendingLeaves} icon={CalendarDays} tone={t.gold} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14, marginBottom: 20 }}>
        <Card t={t} style={{ padding: 16 }}>
          <Label t={t}>Projects by status</Label>
          <div style={{ height: 190, marginTop: 6 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusPie} dataKey="value" nameKey="name" innerRadius={40} outerRadius={68} paddingAngle={3}>
                  {statusPie.map((entry, i) => <Cell key={i} fill={pieColors[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {statusPie.map((s, i) => (
              <div key={s.name} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11.5, color: t.inkSoft }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: pieColors[i] }} /> {s.name}
              </div>
            ))}
          </div>
        </Card>

        <Card t={t} style={{ padding: 16 }}>
          <Label t={t}>Tasks by status</Label>
          <div style={{ height: 190, marginTop: 6 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskBar}>
                <CartesianGrid stroke={t.line} vertical={false} />
                <XAxis dataKey="name" tick={{ fontFamily: "Inter", fontSize: 10.5, fill: t.inkSoft }} axisLine={{ stroke: t.line }} tickLine={false} />
                <YAxis tick={{ fontFamily: "Inter", fontSize: 10.5, fill: t.inkSoft }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip contentStyle={{ fontFamily: "Inter", fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill={t.primary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        <Card t={t} style={{ padding: 16 }}>
          <Label t={t}>Your tasks</Label>
          <div style={{ marginTop: 10 }}>
            {myTasks.length === 0 ? <Empty t={t} icon={ListChecks} title="No tasks yet" hint="Assigned tasks will appear here." /> :
              myTasks.slice(0, 5).map((tk) => (
                <div key={tk.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: `1px solid ${t.line}` }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: t.ink, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{tk.title}</div>
                    <div style={{ fontSize: 11, color: t.inkSoft }}>Due {tk.due}</div>
                  </div>
                  <StatusChip status={tk.status} t={t} />
                </div>
              ))}
          </div>
        </Card>

        <Card t={t} style={{ padding: 16 }}>
          <Label t={t}>Announcements & recent activity</Label>
          <div style={{ marginTop: 10 }}>
            {ANNOUNCEMENTS.map((a) => (
              <div key={a.id} style={{ display: "flex", gap: 10, padding: "9px 0", borderBottom: `1px solid ${t.line}` }}>
                <Megaphone size={15} color={t.gold} style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>{a.title}</div>
                  <div style={{ fontSize: 12, color: t.inkSoft }}>{a.body}</div>
                  <div style={{ fontSize: 10.5, color: t.inkSoft, marginTop: 2 }}>{a.by} · {a.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   EMPLOYEES
   --------------------------------------------------------------------------- */

function EmployeesView({ t, data, patch, notify }) {
  const [q, setQ] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);

  const depts = ["All", ...Array.from(new Set(data.employees.map((e) => e.dept)))];
  const list = data.employees.filter((e) =>
    (filterDept === "All" || e.dept === filterDept) &&
    (e.name.toLowerCase().includes(q.toLowerCase()) || e.role.toLowerCase().includes(q.toLowerCase()))
  );

  const save = (emp) => {
    patch((d) => {
      const exists = d.employees.some((e) => e.id === emp.id);
      const employees = exists ? d.employees.map((e) => (e.id === emp.id ? emp : e)) : [...d.employees, { ...emp, id: "e" + Date.now() }];
      return { ...d, employees };
    });
    notify(editing?.id ? "Employee updated" : "Employee added");
    setEditing(null);
  };
  const remove = (id) => {
    patch((d) => ({ ...d, employees: d.employees.filter((e) => e.id !== id) }));
    notify("Employee removed");
    setConfirmDel(null);
    setDetail(null);
  };

  return (
    <div>
      <ToolbarRow t={t}>
        <SearchBox t={t} value={q} onChange={setQ} placeholder="Search employees..." />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ ...inputStyle(t), width: "auto" }}>
          {depts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <Btn t={t} icon={Plus} onClick={() => setEditing({})} style={{ marginLeft: "auto" }}>Add Employee</Btn>
      </ToolbarRow>

      {list.length === 0 ? <Empty t={t} icon={Users} title="No employees found" hint="Try a different search or add a new employee." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
          {list.map((e) => (
            <Card key={e.id} t={t} style={{ padding: 14, cursor: "pointer" }}>
              <div onClick={() => setDetail(e)} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10 }}>
                <Avatar initials={e.photo} t={t} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: t.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: t.inkSoft }}>{e.role}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StatusChip status={e.status} t={t} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditing(e)} style={iconBtnStyle(t)}><Pencil size={13} /></button>
                  <button onClick={() => setConfirmDel(e.id)} style={iconBtnStyle(t)}><Trash2 size={13} color={t.coral} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== null && <EmployeeForm t={t} employee={editing} onSave={save} onClose={() => setEditing(null)} />}
      {detail && (
        <Modal t={t} title={detail.name} onClose={() => setDetail(null)}>
          <DetailRow t={t} icon={Users} label="Role" value={detail.role} />
          <DetailRow t={t} icon={FolderKanban} label="Department" value={detail.dept} />
          <DetailRow t={t} icon={Mail} label="Email" value={detail.email} />
          <DetailRow t={t} icon={Phone} label="Phone" value={detail.phone} />
          <DetailRow t={t} icon={CalendarDays} label="Joined" value={detail.joined} />
          <div style={{ marginTop: 8 }}><StatusChip status={detail.status} t={t} /></div>
        </Modal>
      )}
      {confirmDel && <ConfirmDialog t={t} text="Remove this employee? This cannot be undone." onCancel={() => setConfirmDel(null)} onConfirm={() => remove(confirmDel)} />}
    </div>
  );
}

function DetailRow({ t, icon: Icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${t.line}` }}>
      <Icon size={15} color={t.inkSoft} />
      <div>
        <div style={{ fontSize: 10.5, color: t.inkSoft, textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</div>
        <div style={{ fontSize: 13.5, color: t.ink, fontWeight: 500 }}>{value}</div>
      </div>
    </div>
  );
}

function EmployeeForm({ t, employee, onSave, onClose }) {
  const [f, setF] = useState({ name: "", role: "", dept: "", email: "", phone: "", status: "Active", joined: "", photo: "", ...employee });
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <Modal t={t} title={employee?.id ? "Edit Employee" : "Add Employee"} onClose={onClose}>
      <Field t={t} label="Full name"><input style={inputStyle(t)} value={f.name} onChange={(e) => upd("name", e.target.value)} /></Field>
      <Field t={t} label="Job role"><input style={inputStyle(t)} value={f.role} onChange={(e) => upd("role", e.target.value)} /></Field>
      <Field t={t} label="Department"><input style={inputStyle(t)} value={f.dept} onChange={(e) => upd("dept", e.target.value)} /></Field>
      <Field t={t} label="Email"><input style={inputStyle(t)} value={f.email} onChange={(e) => upd("email", e.target.value)} /></Field>
      <Field t={t} label="Phone"><input style={inputStyle(t)} value={f.phone} onChange={(e) => upd("phone", e.target.value)} /></Field>
      <Field t={t} label="Employment status">
        <select style={inputStyle(t)} value={f.status} onChange={(e) => upd("status", e.target.value)}>
          <option>Active</option><option>On Leave</option><option>Inactive</option>
        </select>
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={() => f.name && f.role ? onSave({ ...f, photo: f.photo || f.name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase() }) : null}>Save</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   VOLUNTEERS
   --------------------------------------------------------------------------- */

function VolunteersView({ t, data, patch, notify }) {
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);

  const list = data.volunteers.filter((v) => v.name.toLowerCase().includes(q.toLowerCase()) || v.skills.join(" ").toLowerCase().includes(q.toLowerCase()));

  const save = (vol) => {
    patch((d) => {
      const exists = d.volunteers.some((v) => v.id === vol.id);
      const volunteers = exists ? d.volunteers.map((v) => (v.id === vol.id ? vol : v)) : [...d.volunteers, { ...vol, id: "v" + Date.now() }];
      return { ...d, volunteers };
    });
    notify(editing?.id ? "Volunteer updated" : "Volunteer registered");
    setEditing(null);
  };
  const remove = (id) => { patch((d) => ({ ...d, volunteers: d.volunteers.filter((v) => v.id !== id) })); notify("Volunteer removed"); setConfirmDel(null); };

  return (
    <div>
      <ToolbarRow t={t}>
        <SearchBox t={t} value={q} onChange={setQ} placeholder="Search volunteers or skills..." />
        <Btn t={t} icon={Plus} onClick={() => setEditing({})} style={{ marginLeft: "auto" }}>Register Volunteer</Btn>
      </ToolbarRow>

      {list.length === 0 ? <Empty t={t} icon={HeartHandshake} title="No volunteers found" hint="Register a volunteer to get started." /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
          {list.map((v) => {
            const proj = data.projects.find((p) => p.id === v.assigned);
            return (
              <Card key={v.id} t={t} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Avatar initials={v.name.split(" ").map((x) => x[0]).join("")} t={t} size={36} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: t.ink }}>{v.name}</div>
                      <div style={{ fontSize: 11.5, color: t.inkSoft }}>{v.availability}</div>
                    </div>
                  </div>
                  <StatusChip status={v.status} t={t} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "10px 0" }}>
                  {v.skills.map((s) => <span key={s} style={{ fontSize: 10.5, background: t.chipBg, color: t.ink, padding: "3px 8px", borderRadius: 12, fontWeight: 600 }}>{s}</span>)}
                </div>
                <div style={{ fontSize: 11.5, color: t.inkSoft, marginBottom: 8 }}>
                  {proj ? `Assigned: ${proj.name}` : "Unassigned"} · <span style={{ fontFamily: "IBM Plex Mono" }}>{v.hours}h</span> logged
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => setEditing(v)} style={iconBtnStyle(t)}><Pencil size={13} /></button>
                  <button onClick={() => setConfirmDel(v.id)} style={iconBtnStyle(t)}><Trash2 size={13} color={t.coral} /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editing !== null && <VolunteerForm t={t} volunteer={editing} projects={data.projects} onSave={save} onClose={() => setEditing(null)} />}
      {confirmDel && <ConfirmDialog t={t} text="Remove this volunteer record?" onCancel={() => setConfirmDel(null)} onConfirm={() => remove(confirmDel)} />}
    </div>
  );
}

function VolunteerForm({ t, volunteer, projects, onSave, onClose }) {
  const [f, setF] = useState({ name: "", skills: [], availability: "Flexible", hours: 0, status: "Active", assigned: null, email: "", phone: "", ...volunteer });
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <Modal t={t} title={volunteer?.id ? "Edit Volunteer" : "Register Volunteer"} onClose={onClose}>
      <Field t={t} label="Full name"><input style={inputStyle(t)} value={f.name} onChange={(e) => upd("name", e.target.value)} /></Field>
      <Field t={t} label="Skills (comma separated)"><input style={inputStyle(t)} value={f.skills.join(", ")} onChange={(e) => upd("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></Field>
      <Field t={t} label="Availability">
        <select style={inputStyle(t)} value={f.availability} onChange={(e) => upd("availability", e.target.value)}>
          <option>Weekdays</option><option>Weekends</option><option>Flexible</option>
        </select>
      </Field>
      <Field t={t} label="Assigned project">
        <select style={inputStyle(t)} value={f.assigned || ""} onChange={(e) => upd("assigned", e.target.value || null)}>
          <option value="">Unassigned</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field t={t} label="Email"><input style={inputStyle(t)} value={f.email} onChange={(e) => upd("email", e.target.value)} /></Field>
      <Field t={t} label="Phone"><input style={inputStyle(t)} value={f.phone} onChange={(e) => upd("phone", e.target.value)} /></Field>
      <Field t={t} label="Status">
        <select style={inputStyle(t)} value={f.status} onChange={(e) => upd("status", e.target.value)}>
          <option>Active</option><option>Inactive</option>
        </select>
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={() => f.name && onSave(f)}>Save</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   PROJECTS
   --------------------------------------------------------------------------- */

function ToolbarRow({ children, t }) {
  return <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 16 }}>{children}</div>;
}
const iconBtnStyle = (t) => ({ background: t.chipBg, border: "none", borderRadius: 6, width: 26, height: 26, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" });

function ProjectsView({ t, data, patch, notify, sessionUser, employeeOf }) {
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);
  const canManage = CAN.manageProjects(sessionUser.role);

  const list = data.projects.filter((p) => (statusF === "All" || p.status === statusF) && p.name.toLowerCase().includes(q.toLowerCase()));

  const save = (proj) => {
    patch((d) => {
      const exists = d.projects.some((p) => p.id === proj.id);
      const projects = exists ? d.projects.map((p) => (p.id === proj.id ? proj : p)) : [...d.projects, { ...proj, id: "p" + Date.now() }];
      return { ...d, projects };
    });
    notify(editing?.id ? "Project updated" : "Project created");
    setEditing(null);
  };
  const remove = (id) => { patch((d) => ({ ...d, projects: d.projects.filter((p) => p.id !== id), tasks: d.tasks.filter((tk) => tk.project !== id) })); notify("Project deleted"); setConfirmDel(null); setDetail(null); };

  return (
    <div>
      <ToolbarRow t={t}>
        <SearchBox t={t} value={q} onChange={setQ} placeholder="Search projects..." />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} style={{ ...inputStyle(t), width: "auto" }}>
          {["All", "Planning", "Active", "Delayed", "Completed"].map((s) => <option key={s}>{s}</option>)}
        </select>
        {canManage && <Btn t={t} icon={Plus} onClick={() => setEditing({})} style={{ marginLeft: "auto" }}>New Project</Btn>}
      </ToolbarRow>

      {list.length === 0 ? <Empty t={t} icon={FolderKanban} title="No projects found" hint="Adjust filters or create a new project." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((p) => {
            const coord = employeeOf(p.coordinator);
            return (
              <Card key={p.id} t={t} style={{ padding: 16, cursor: "pointer" }}>
                <div onClick={() => setDetail(p)}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontFamily: "Fraunces", fontSize: 16, fontWeight: 600, color: t.ink }}>{p.name}</div>
                    <StatusChip status={p.status} t={t} />
                  </div>
                  <div style={{ fontSize: 13, color: t.inkSoft, marginBottom: 10 }}>{p.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 6, background: t.chipBg, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${p.progress}%`, height: "100%", background: t.primary }} />
                    </div>
                    <span style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: t.ink }}>{p.progress}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11.5, color: t.inkSoft }}>
                    <span>Coordinator: <b style={{ color: t.ink }}>{coord?.name}</b></span>
                    <span>{p.start} → {p.end}</span>
                    <span>Team: {p.team.length}</span>
                  </div>
                </div>
                {canManage && (
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 10 }}>
                    <button onClick={() => setEditing(p)} style={iconBtnStyle(t)}><Pencil size={13} /></button>
                    <button onClick={() => setConfirmDel(p.id)} style={iconBtnStyle(t)}><Trash2 size={13} color={t.coral} /></button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {editing !== null && <ProjectForm t={t} project={editing} employees={data.employees} onSave={save} onClose={() => setEditing(null)} />}
      {detail && (
        <Modal t={t} title={detail.name} wide onClose={() => setDetail(null)}>
          <div style={{ fontSize: 13.5, color: t.inkSoft, marginBottom: 14 }}>{detail.desc}</div>
          <DetailRow t={t} icon={CalendarDays} label="Timeline" value={`${detail.start} → ${detail.end}`} />
          <DetailRow t={t} icon={Users} label="Coordinator" value={employeeOf(detail.coordinator)?.name} />
          <DetailRow t={t} icon={MapPin} label="Budget" value={`$${detail.spent.toLocaleString()} of $${detail.budget.toLocaleString()} spent`} />
          <div style={{ marginTop: 10 }}>
            <Label t={t}>Team members</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {detail.team.map((id) => {
                const person = employeeOf(id) || data.volunteers.find((v) => v.id === id);
                return person ? <span key={id} style={{ fontSize: 12, background: t.chipBg, padding: "5px 10px", borderRadius: 14, fontWeight: 600 }}>{person.name}</span> : null;
              })}
            </div>
          </div>
        </Modal>
      )}
      {confirmDel && <ConfirmDialog t={t} text="Delete this project and all its tasks? This cannot be undone." onCancel={() => setConfirmDel(null)} onConfirm={() => remove(confirmDel)} />}
    </div>
  );
}

function ProjectForm({ t, project, employees, onSave, onClose }) {
  const [f, setF] = useState({ name: "", desc: "", status: "Planning", coordinator: employees[0]?.id, team: [], start: "", end: "", progress: 0, budget: 0, spent: 0, ...project });
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleTeam = (id) => upd("team", f.team.includes(id) ? f.team.filter((x) => x !== id) : [...f.team, id]);
  return (
    <Modal t={t} title={project?.id ? "Edit Project" : "New Project"} wide onClose={onClose}>
      <Field t={t} label="Project name"><input style={inputStyle(t)} value={f.name} onChange={(e) => upd("name", e.target.value)} /></Field>
      <Field t={t} label="Description"><textarea rows={3} style={{ ...inputStyle(t), resize: "vertical" }} value={f.desc} onChange={(e) => upd("desc", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field t={t} label="Start date"><input type="date" style={inputStyle(t)} value={f.start} onChange={(e) => upd("start", e.target.value)} /></Field>
        <Field t={t} label="End date"><input type="date" style={inputStyle(t)} value={f.end} onChange={(e) => upd("end", e.target.value)} /></Field>
      </div>
      <Field t={t} label="Status">
        <select style={inputStyle(t)} value={f.status} onChange={(e) => upd("status", e.target.value)}>
          <option>Planning</option><option>Active</option><option>Delayed</option><option>Completed</option>
        </select>
      </Field>
      <Field t={t} label="Coordinator">
        <select style={inputStyle(t)} value={f.coordinator} onChange={(e) => upd("coordinator", e.target.value)}>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </Field>
      <Field t={t} label="Progress (%)"><input type="number" min={0} max={100} style={inputStyle(t)} value={f.progress} onChange={(e) => upd("progress", Number(e.target.value))} /></Field>
      <Field t={t} label="Team members">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {employees.map((e) => (
            <button type="button" key={e.id} onClick={() => toggleTeam(e.id)} style={{ fontSize: 11.5, padding: "5px 10px", borderRadius: 14, border: `1px solid ${t.line}`, background: f.team.includes(e.id) ? t.primary : "transparent", color: f.team.includes(e.id) ? "#fff" : t.ink, cursor: "pointer" }}>{e.name}</button>
          ))}
        </div>
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={() => f.name && onSave(f)}>Save Project</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   TASKS
   --------------------------------------------------------------------------- */

function TasksView({ t, data, patch, notify, sessionUser, employeeOf }) {
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);
  const canManage = CAN.manageTasks(sessionUser.role);
  const scoped = canManage ? data.tasks : data.tasks.filter((tk) => tk.assignee === sessionUser.id);

  const list = scoped.filter((tk) => (statusF === "All" || tk.status === statusF) && tk.title.toLowerCase().includes(q.toLowerCase()));

  const save = (task) => {
    patch((d) => {
      const exists = d.tasks.some((x) => x.id === task.id);
      const tasks = exists ? d.tasks.map((x) => (x.id === task.id ? task : x)) : [...d.tasks, { ...task, id: "t" + Date.now(), comments: [], attachments: [] }];
      return { ...d, tasks };
    });
    notify(editing?.id ? "Task updated" : "Task created");
    setEditing(null);
  };
  const remove = (id) => { patch((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) })); notify("Task removed"); setConfirmDel(null); setDetail(null); };
  const quickStatus = (task, status) => { patch((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === task.id ? { ...x, status } : x)) })); notify(`Marked "${task.title}" as ${status}`); };
  const addComment = (task, text) => {
    patch((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === task.id ? { ...x, comments: [...x.comments, { by: sessionUser.id, text, at: "today" }] } : x)) }));
    setDetail((dt) => dt && { ...dt, comments: [...dt.comments, { by: sessionUser.id, text, at: "today" }] });
  };

  const groups = ["Overdue", "In Progress", "Pending", "Completed"];

  return (
    <div>
      <ToolbarRow t={t}>
        <SearchBox t={t} value={q} onChange={setQ} placeholder="Search tasks..." />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} style={{ ...inputStyle(t), width: "auto" }}>
          {["All", ...groups].map((s) => <option key={s}>{s}</option>)}
        </select>
        {canManage && <Btn t={t} icon={Plus} onClick={() => setEditing({})} style={{ marginLeft: "auto" }}>New Task</Btn>}
      </ToolbarRow>

      {list.length === 0 ? <Empty t={t} icon={ListChecks} title="No tasks found" hint="Nothing matches these filters." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((tk) => {
            const proj = data.projects.find((p) => p.id === tk.project);
            const person = employeeOf(tk.assignee);
            return (
              <Card key={tk.id} t={t} style={{ padding: 13 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div onClick={() => setDetail(tk)} style={{ cursor: "pointer", minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3 }}>
                      <PriorityChip p={tk.priority} t={t} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>{tk.title}</div>
                    </div>
                    <div style={{ fontSize: 11.5, color: t.inkSoft }}>{proj?.name} · {person?.name} · Due {tk.due}</div>
                  </div>
                  <StatusChip status={tk.status} t={t} />
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap" }}>
                  {tk.status !== "Completed" && <Btn t={t} variant="subtle" onClick={() => quickStatus(tk, "Completed")} icon={Check} style={{ padding: "5px 10px", fontSize: 12 }}>Mark complete</Btn>}
                  {tk.status === "Pending" && <Btn t={t} variant="subtle" onClick={() => quickStatus(tk, "In Progress")} style={{ padding: "5px 10px", fontSize: 12 }}>Start</Btn>}
                  {canManage && <button onClick={() => setEditing(tk)} style={iconBtnStyle(t)}><Pencil size={13} /></button>}
                  {canManage && <button onClick={() => setConfirmDel(tk.id)} style={iconBtnStyle(t)}><Trash2 size={13} color={t.coral} /></button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editing !== null && <TaskForm t={t} task={editing} projects={data.projects} employees={data.employees} volunteers={data.volunteers} onSave={save} onClose={() => setEditing(null)} />}
      {detail && (
        <Modal t={t} title={detail.title} onClose={() => setDetail(null)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><PriorityChip p={detail.priority} t={t} /><StatusChip status={detail.status} t={t} /></div>
          <DetailRow t={t} icon={FolderKanban} label="Project" value={data.projects.find((p) => p.id === detail.project)?.name} />
          <DetailRow t={t} icon={Users} label="Assignee" value={employeeOf(detail.assignee)?.name} />
          <DetailRow t={t} icon={CalendarDays} label="Due date" value={detail.due} />
          {detail.attachments.length > 0 && (
            <div style={{ marginTop: 10 }}>
              <Label t={t}>Attachments</Label>
              {detail.attachments.map((a) => <div key={a} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12.5, color: t.ink, marginTop: 6 }}><Paperclip size={13} />{a}</div>)}
            </div>
          )}
          <div style={{ marginTop: 12 }}>
            <Label t={t}>Comments</Label>
            {detail.comments.map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Avatar initials={employeeOf(c.by)?.name.split(" ").map((x) => x[0]).join("") || "?"} t={t} size={24} />
                <div style={{ fontSize: 12.5, color: t.ink, background: t.chipBg, padding: "6px 10px", borderRadius: 8, flex: 1 }}>{c.text}</div>
              </div>
            ))}
            <CommentBox t={t} onAdd={(text) => addComment(detail, text)} />
          </div>
        </Modal>
      )}
      {confirmDel && <ConfirmDialog t={t} text="Delete this task?" onCancel={() => setConfirmDel(null)} onConfirm={() => remove(confirmDel)} />}
    </div>
  );
}

function CommentBox({ t, onAdd }) {
  const [v, setV] = useState("");
  return (
    <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
      <input style={inputStyle(t)} placeholder="Add a comment..." value={v} onChange={(e) => setV(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); } }} />
      <Btn t={t} onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); } }}>Post</Btn>
    </div>
  );
}

function TaskForm({ t, task, projects, employees, volunteers, onSave, onClose }) {
  const assignees = [...employees, ...volunteers];
  const [f, setF] = useState({ title: "", project: projects[0]?.id, assignee: assignees[0]?.id, priority: "Medium", due: "", status: "Pending", comments: [], attachments: [], ...task });
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <Modal t={t} title={task?.id ? "Edit Task" : "New Task"} onClose={onClose}>
      <Field t={t} label="Task title"><input style={inputStyle(t)} value={f.title} onChange={(e) => upd("title", e.target.value)} /></Field>
      <Field t={t} label="Project">
        <select style={inputStyle(t)} value={f.project} onChange={(e) => upd("project", e.target.value)}>{projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select>
      </Field>
      <Field t={t} label="Assignee">
        <select style={inputStyle(t)} value={f.assignee} onChange={(e) => upd("assignee", e.target.value)}>{assignees.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}</select>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field t={t} label="Priority">
          <select style={inputStyle(t)} value={f.priority} onChange={(e) => upd("priority", e.target.value)}><option>High</option><option>Medium</option><option>Low</option></select>
        </Field>
        <Field t={t} label="Deadline"><input type="date" style={inputStyle(t)} value={f.due} onChange={(e) => upd("due", e.target.value)} /></Field>
      </div>
      <Field t={t} label="Status">
        <select style={inputStyle(t)} value={f.status} onChange={(e) => upd("status", e.target.value)}><option>Pending</option><option>In Progress</option><option>Overdue</option><option>Completed</option></select>
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={() => f.title && onSave(f)}>Save Task</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   ATTENDANCE
   --------------------------------------------------------------------------- */

function AttendanceView({ t, data, patch, notify, sessionUser, employeeOf }) {
  const canViewAll = CAN.viewAllAttendance(sessionUser.role);
  const today = "2026-08-06";
  const myToday = data.attendance.find((a) => a.user === sessionUser.id && a.date === today);

  const checkIn = () => { patch((d) => ({ ...d, attendance: [...d.attendance, { id: sessionUser.id + "-" + today, user: sessionUser.id, date: today, checkIn: "09:0" + Math.floor(Math.random() * 5), checkOut: null, hours: null }] })); notify("Checked in"); };
  const checkOut = () => { patch((d) => ({ ...d, attendance: d.attendance.map((a) => (a.id === myToday.id ? { ...a, checkOut: "17:3" + Math.floor(Math.random() * 5), hours: 8.5 } : a)) })); notify("Checked out"); };

  const myRecords = data.attendance.filter((a) => a.user === sessionUser.id).sort((x, y) => (x.date < y.date ? 1 : -1));
  const allToday = data.attendance.filter((a) => a.date === today);
  const totalHoursThisWeek = myRecords.reduce((s, r) => s + (r.hours || 0), 0);

  return (
    <div>
      <Card t={t} style={{ padding: 18, marginBottom: 18, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
        <div>
          <Label t={t}>Today · {today}</Label>
          <div style={{ fontFamily: "Fraunces", fontSize: 19, fontWeight: 600, marginTop: 4 }}>
            {myToday ? (myToday.checkOut ? "Shift complete" : "Checked in — on shift") : "Not checked in yet"}
          </div>
          {myToday && <div style={{ fontSize: 12.5, color: t.inkSoft, marginTop: 2 }}>In {myToday.checkIn}{myToday.checkOut ? ` · Out ${myToday.checkOut}` : ""}</div>}
        </div>
        {!myToday && <Btn t={t} icon={Clock} onClick={checkIn}>Check In</Btn>}
        {myToday && !myToday.checkOut && <Btn t={t} variant="danger" icon={Clock} onClick={checkOut} style={{ background: t.coral, color: "#fff", border: "none" }}>Check Out</Btn>}
        {myToday && myToday.checkOut && <StatusChip status="Completed" t={t} />}
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        <StatCard t={t} label="Hours (recent)" value={totalHoursThisWeek.toFixed(1)} icon={Clock3} />
        <StatCard t={t} label="Days recorded" value={myRecords.length} icon={CalendarDays} />
        {canViewAll && <StatCard t={t} label="Checked in today" value={allToday.length} icon={Users} tone={t.primary} />}
      </div>

      <Label t={t}>Your attendance history</Label>
      <div style={{ marginTop: 10, marginBottom: 24 }}>
        {myRecords.map((r) => (
          <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${t.line}` }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.checkOut ? t.success : t.gold, flexShrink: 0 }} />
            <div style={{ fontFamily: "IBM Plex Mono", fontSize: 12.5, color: t.ink, width: 92 }}>{r.date}</div>
            <div style={{ fontSize: 12.5, color: t.inkSoft, flex: 1 }}>{r.checkIn} — {r.checkOut || "—"}</div>
            <div style={{ fontFamily: "IBM Plex Mono", fontSize: 12.5, color: t.ink }}>{r.hours ? `${r.hours}h` : "—"}</div>
          </div>
        ))}
      </div>

      {canViewAll && (
        <>
          <Label t={t}>Team — today</Label>
          <div style={{ marginTop: 10 }}>
            {allToday.map((r) => {
              const p = employeeOf(r.user);
              return (
                <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: `1px solid ${t.line}` }}>
                  <Avatar initials={p?.initials || p?.photo || "?"} t={t} size={26} />
                  <div style={{ fontSize: 13, color: t.ink, flex: 1 }}>{p?.name}</div>
                  <div style={{ fontSize: 12, color: t.inkSoft }}>{r.checkIn} — {r.checkOut || "on shift"}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   LEAVE
   --------------------------------------------------------------------------- */

function LeaveView({ t, data, patch, notify, sessionUser, employeeOf }) {
  const canApprove = CAN.approveLeave(sessionUser.role);
  const [form, setForm] = useState(false);
  const list = canApprove ? data.leaves : data.leaves.filter((l) => l.user === sessionUser.id);
  const balance = 18; // demo static annual allowance

  const usedDays = data.leaves.filter((l) => l.user === sessionUser.id && l.status === "Approved").reduce((s, l) => s + (new Date(l.to) - new Date(l.from)) / 86400000 + 1, 0);

  const apply = (leave) => {
    patch((d) => ({ ...d, leaves: [{ ...leave, id: "l" + Date.now(), user: sessionUser.id, status: "Pending" }, ...d.leaves] }));
    notify("Leave request submitted");
    setForm(false);
  };
  const setStatus = (id, status) => { patch((d) => ({ ...d, leaves: d.leaves.map((l) => (l.id === id ? { ...l, status } : l)) })); notify(`Request ${status.toLowerCase()}`); };

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
        <StatCard t={t} label="Annual balance" value={balance - usedDays} icon={CalendarDays} />
        <StatCard t={t} label="Days used" value={usedDays} icon={Clock3} />
        <StatCard t={t} label="Pending requests" value={data.leaves.filter((l) => l.status === "Pending").length} icon={AlertTriangle} tone={t.gold} />
      </div>

      <ToolbarRow t={t}>
        <div style={{ fontFamily: "Fraunces", fontSize: 17, fontWeight: 600 }}>{canApprove ? "All requests" : "Your requests"}</div>
        <Btn t={t} icon={Plus} onClick={() => setForm(true)} style={{ marginLeft: "auto" }}>Apply for Leave</Btn>
      </ToolbarRow>

      {list.length === 0 ? <Empty t={t} icon={CalendarDays} title="No leave requests" hint="Submitted requests will appear here." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((l) => {
            const p = employeeOf(l.user);
            return (
              <Card key={l.id} t={t} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div>
                    {canApprove && <div style={{ fontSize: 12.5, fontWeight: 700, color: t.ink, marginBottom: 3 }}>{p?.name}</div>}
                    <div style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>{l.type}</div>
                    <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 2 }}>{l.from} → {l.to}</div>
                    <div style={{ fontSize: 12.5, color: t.inkSoft, marginTop: 5 }}>{l.reason}</div>
                  </div>
                  <StatusChip status={l.status} t={t} />
                </div>
                {canApprove && l.status === "Pending" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <Btn t={t} variant="subtle" icon={Check} onClick={() => setStatus(l.id, "Approved")} style={{ fontSize: 12, padding: "5px 10px" }}>Approve</Btn>
                    <Btn t={t} variant="danger" icon={X} onClick={() => setStatus(l.id, "Rejected")} style={{ fontSize: 12, padding: "5px 10px" }}>Reject</Btn>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {form && <LeaveForm t={t} onSave={apply} onClose={() => setForm(false)} />}
    </div>
  );
}

function LeaveForm({ t, onSave, onClose }) {
  const [f, setF] = useState({ type: "Annual Leave", from: "", to: "", reason: "" });
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <Modal t={t} title="Apply for Leave" onClose={onClose}>
      <Field t={t} label="Leave type">
        <select style={inputStyle(t)} value={f.type} onChange={(e) => upd("type", e.target.value)}><option>Annual Leave</option><option>Sick Leave</option><option>Personal Leave</option><option>Unpaid Leave</option></select>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field t={t} label="From"><input type="date" style={inputStyle(t)} value={f.from} onChange={(e) => upd("from", e.target.value)} /></Field>
        <Field t={t} label="To"><input type="date" style={inputStyle(t)} value={f.to} onChange={(e) => upd("to", e.target.value)} /></Field>
      </div>
      <Field t={t} label="Reason"><textarea rows={3} style={{ ...inputStyle(t), resize: "vertical" }} value={f.reason} onChange={(e) => upd("reason", e.target.value)} /></Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={() => f.from && f.to && onSave(f)}>Submit Request</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   WORK LOG
   --------------------------------------------------------------------------- */

function WorklogView({ t, data, patch, notify, sessionUser, employeeOf }) {
  const canReview = CAN.manageTasks(sessionUser.role);
  const [form, setForm] = useState(false);
  const list = (canReview ? data.worklogs : data.worklogs.filter((w) => w.user === sessionUser.id)).sort((a, b) => (a.date < b.date ? 1 : -1));

  const add = (log) => { patch((d) => ({ ...d, worklogs: [{ ...log, id: "w" + Date.now(), user: sessionUser.id, status: "Pending Review", files: [] }, ...d.worklogs] })); notify("Work log submitted"); setForm(false); };
  const review = (id) => { patch((d) => ({ ...d, worklogs: d.worklogs.map((w) => (w.id === id ? { ...w, status: "Reviewed" } : w)) })); notify("Marked as reviewed"); };

  return (
    <div>
      <ToolbarRow t={t}>
        <div style={{ fontFamily: "Fraunces", fontSize: 17, fontWeight: 600 }}>{canReview ? "Team work logs" : "Your daily logs"}</div>
        <Btn t={t} icon={Plus} onClick={() => setForm(true)} style={{ marginLeft: "auto" }}>Log Today's Work</Btn>
      </ToolbarRow>

      {list.length === 0 ? <Empty t={t} icon={NotebookPen} title="No entries yet" hint="Daily work summaries will appear here." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {list.map((w, i) => {
            const p = employeeOf(w.user);
            return (
              <div key={w.id} style={{ display: "flex", gap: 14, position: "relative", paddingBottom: 18 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{ width: 9, height: 9, borderRadius: "50%", background: w.status === "Reviewed" ? t.success : t.gold, marginTop: 4 }} />
                  {i < list.length - 1 && <div style={{ width: 1, flex: 1, background: t.line, marginTop: 4 }} />}
                </div>
                <Card t={t} style={{ padding: 14, flex: 1, marginBottom: 4 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      {canReview && <div style={{ fontSize: 12, fontWeight: 700, color: t.ink }}>{p?.name}</div>}
                      <div style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: t.inkSoft }}>{w.date} · {w.hours}h</div>
                    </div>
                    <StatusChip status={w.status} t={t} />
                  </div>
                  <div style={{ fontSize: 13, color: t.ink, margin: "8px 0" }}>{w.summary}</div>
                  <div style={{ fontSize: 12, color: t.inkSoft }}><b style={{ color: t.ink }}>Completed:</b> {w.completed}</div>
                  <div style={{ fontSize: 12, color: t.inkSoft }}><b style={{ color: t.ink }}>Pending:</b> {w.pending}</div>
                  {w.files.length > 0 && <div style={{ display: "flex", gap: 6, marginTop: 6 }}>{w.files.map((f) => <span key={f} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: t.inkSoft }}><Paperclip size={11} />{f}</span>)}</div>}
                  {canReview && w.status !== "Reviewed" && <Btn t={t} variant="subtle" icon={Check} onClick={() => review(w.id)} style={{ marginTop: 10, fontSize: 12, padding: "5px 10px" }}>Mark reviewed</Btn>}
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {form && <WorklogForm t={t} onSave={add} onClose={() => setForm(false)} />}
    </div>
  );
}

function WorklogForm({ t, onSave, onClose }) {
  const [f, setF] = useState({ date: "2026-08-06", summary: "", hours: "", completed: "", pending: "" });
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));
  return (
    <Modal t={t} title="Log Today's Work" onClose={onClose}>
      <Field t={t} label="Date"><input type="date" style={inputStyle(t)} value={f.date} onChange={(e) => upd("date", e.target.value)} /></Field>
      <Field t={t} label="Work summary"><textarea rows={3} style={{ ...inputStyle(t), resize: "vertical" }} value={f.summary} onChange={(e) => upd("summary", e.target.value)} /></Field>
      <Field t={t} label="Hours worked"><input type="number" step="0.5" style={inputStyle(t)} value={f.hours} onChange={(e) => upd("hours", e.target.value)} /></Field>
      <Field t={t} label="Tasks completed"><input style={inputStyle(t)} value={f.completed} onChange={(e) => upd("completed", e.target.value)} /></Field>
      <Field t={t} label="Pending work"><input style={inputStyle(t)} value={f.pending} onChange={(e) => upd("pending", e.target.value)} /></Field>
      <Field t={t} label="Attach supporting file (optional)">
        <div style={{ border: `1px dashed ${t.line}`, borderRadius: 8, padding: "14px", textAlign: "center", color: t.inkSoft, fontSize: 12.5 }}>
          <Paperclip size={16} style={{ marginBottom: 4 }} /><br />Drop a file or click to attach
        </div>
      </Field>
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={() => f.summary && f.hours && onSave({ ...f, hours: Number(f.hours) })}>Submit Log</Btn>
      </div>
    </Modal>
  );
}

/* ---------------------------------------------------------------------------
   REPORTS
   --------------------------------------------------------------------------- */

function ReportsView({ t, data }) {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Projects", "Employees", "Attendance", "Leave", "Tasks"];

  const projStatus = ["Planning", "Active", "Delayed", "Completed"].map((s) => ({ name: s, value: data.projects.filter((p) => p.status === s).length }));
  const budgetData = data.projects.map((p) => ({ name: p.name.split(" ").slice(0, 2).join(" "), budget: p.budget, spent: p.spent }));
  const attByDate = Object.values(data.attendance.reduce((acc, a) => { acc[a.date] = acc[a.date] || { name: a.date.slice(5), count: 0 }; acc[a.date].count++; return acc; }, {}));
  const leaveByType = Object.values(data.leaves.reduce((acc, l) => { acc[l.type] = acc[l.type] || { name: l.type, value: 0 }; acc[l.type].value++; return acc; }, {}));
  const taskByStatus = ["Pending", "In Progress", "Overdue", "Completed"].map((s) => ({ name: s, count: data.tasks.filter((tk) => tk.status === s).length }));
  const pieColors = [t.primary, t.success, t.coral, t.gold];

  return (
    <div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 18, paddingBottom: 2 }}>
        {tabs.map((tb) => (
          <button key={tb} onClick={() => setTab(tb)} style={{ padding: "7px 13px", borderRadius: 18, border: `1px solid ${tab === tb ? "transparent" : t.line}`, background: tab === tb ? t.primary : "transparent", color: tab === tb ? "#fff" : t.ink, fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>{tb}</button>
        ))}
        <Btn t={t} variant="ghost" style={{ marginLeft: "auto" }} onClick={() => window.print()}>Print / Export</Btn>
      </div>

      {tab === "Overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
          <ReportCard t={t} title="Projects by status">
            <PieChart width={220} height={180}><Pie data={projStatus} dataKey="value" nameKey="name" outerRadius={68}>{projStatus.map((e, i) => <Cell key={i} fill={pieColors[i]} />)}</Pie><Tooltip /></PieChart>
          </ReportCard>
          <ReportCard t={t} title="Tasks by status">
            <BarChart width={220} height={180} data={taskByStatus}><CartesianGrid stroke={t.line} vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 9, fill: t.inkSoft }} /><YAxis tick={{ fontSize: 9, fill: t.inkSoft }} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill={t.primary} radius={[3, 3, 0, 0]} /></BarChart>
          </ReportCard>
          <ReportCard t={t} title="Attendance trend">
            <LineChart width={220} height={180} data={attByDate}><CartesianGrid stroke={t.line} vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 9, fill: t.inkSoft }} /><YAxis tick={{ fontSize: 9, fill: t.inkSoft }} allowDecimals={false} /><Tooltip /><Line type="monotone" dataKey="count" stroke={t.primary} strokeWidth={2} /></LineChart>
          </ReportCard>
        </div>
      )}

      {tab === "Projects" && (
        <ReportCard t={t} title="Budget vs. spend by project" wide>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={budgetData} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid stroke={t.line} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: t.inkSoft }} />
              <YAxis type="category" dataKey="name" width={130} tick={{ fontSize: 10.5, fill: t.inkSoft }} />
              <Tooltip /><Bar dataKey="budget" fill={t.chipBg} radius={[0, 3, 3, 0]} /><Bar dataKey="spent" fill={t.primary} radius={[0, 3, 3, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ReportCard>
      )}

      {tab === "Employees" && (
        <SimpleTable t={t} rows={data.employees} cols={[["name", "Name"], ["role", "Role"], ["dept", "Dept"], ["status", "Status"]]} />
      )}
      {tab === "Attendance" && (
        <ReportCard t={t} title="Check-ins per day" wide>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={attByDate}><CartesianGrid stroke={t.line} vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 10, fill: t.inkSoft }} /><YAxis tick={{ fontSize: 10, fill: t.inkSoft }} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill={t.primary} radius={[4, 4, 0, 0]} /></BarChart>
          </ResponsiveContainer>
        </ReportCard>
      )}
      {tab === "Leave" && (
        <ReportCard t={t} title="Leave requests by type" wide>
          <PieChart width={280} height={220}><Pie data={leaveByType} dataKey="value" nameKey="name" outerRadius={80}>{leaveByType.map((e, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie><Tooltip /></PieChart>
        </ReportCard>
      )}
      {tab === "Tasks" && (
        <SimpleTable t={t} rows={data.tasks} cols={[["title", "Task"], ["priority", "Priority"], ["status", "Status"], ["due", "Due"]]} />
      )}
    </div>
  );
}

function ReportCard({ t, title, children, wide }) {
  return (
    <Card t={t} style={{ padding: 16, gridColumn: wide ? "1 / -1" : undefined }}>
      <Label t={t}>{title}</Label>
      <div style={{ marginTop: 10, display: "flex", justifyContent: "center" }}>{children}</div>
    </Card>
  );
}

function SimpleTable({ t, rows, cols }) {
  return (
    <Card t={t} style={{ overflow: "hidden" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "Inter", fontSize: 13 }}>
          <thead>
            <tr>{cols.map(([k, label]) => <th key={k} style={{ textAlign: "left", padding: "10px 14px", borderBottom: `1px solid ${t.line}`, color: t.inkSoft, fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>{cols.map(([k]) => <td key={k} style={{ padding: "10px 14px", borderBottom: `1px solid ${t.line}`, color: t.ink }}>{r[k]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

/* ---------------------------------------------------------------------------
   NOTIFICATIONS
   --------------------------------------------------------------------------- */

function NotificationsView({ t, data, patch }) {
  const iconFor = { task: ListChecks, leave: CalendarDays, alert: AlertTriangle, project: FolderKanban, announcement: Megaphone };
  const markAllRead = () => patch((d) => ({ ...d, notifications: d.notifications.map((n) => ({ ...n, read: true })) }));
  const markRead = (id) => patch((d) => ({ ...d, notifications: d.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) }));

  return (
    <div>
      <ToolbarRow t={t}>
        <div style={{ fontFamily: "Fraunces", fontSize: 17, fontWeight: 600 }}>Notifications</div>
        <Btn t={t} variant="ghost" onClick={markAllRead} style={{ marginLeft: "auto" }}>Mark all as read</Btn>
      </ToolbarRow>
      {data.notifications.length === 0 ? <Empty t={t} icon={Bell} title="You're all caught up" hint="New notifications will show up here." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {data.notifications.map((n) => {
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

/* ---------------------------------------------------------------------------
   SETTINGS
   --------------------------------------------------------------------------- */

function SettingsView({ t, mode, toggle, sessionUser, onLogout, notify }) {
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [notifPrefs, setNotifPrefs] = useState({ tasks: true, leave: true, attendance: false, announcements: true });
  const [confirmLogout, setConfirmLogout] = useState(false);

  const changePw = (e) => {
    e.preventDefault();
    if (!pw.current || pw.next.length < 4 || pw.next !== pw.confirm) { notify("Check your password fields"); return; }
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

      <SettingsSection t={t} title="Profile">
        <Field t={t} label="Full name"><input style={inputStyle(t)} defaultValue={sessionUser.name} /></Field>
        <Field t={t} label="Title"><input style={inputStyle(t)} defaultValue={sessionUser.title} /></Field>
        <Btn t={t} icon={Check} onClick={() => notify("Profile saved")}>Save Changes</Btn>
      </SettingsSection>

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

      <SettingsSection t={t} title="Appearance">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 13.5, color: t.ink }}>Theme</div>
          <Btn t={t} variant="subtle" icon={mode === "light" ? Moon : Sun} onClick={toggle}>{mode === "light" ? "Switch to dark" : "Switch to light"}</Btn>
        </div>
      </SettingsSection>

      <SettingsSection t={t} title="About & Support">
        <div style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.6 }}>
          Rootline NGO Management — v1.0.0 (demo build).<br />
          For help, contact your organization administrator or visit the internal support desk.
        </div>
      </SettingsSection>

      <Btn t={t} variant="danger" icon={LogOut} onClick={() => setConfirmLogout(true)} style={{ border: `1px solid ${t.coral}55` }}>Log Out</Btn>
      {confirmLogout && <ConfirmDialog t={t} text="Log out of Rootline?" onCancel={() => setConfirmLogout(false)} onConfirm={onLogout} />}
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
