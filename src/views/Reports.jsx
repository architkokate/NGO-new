import React, { useState } from "react";
import { Download } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { Card, Label, Btn } from "../components/Primitives";
import { exportToCSV } from "../services/storage";

export default function ReportsView({ t, data, personOf }) {
  const [tab, setTab] = useState("Overview");
  const tabs = ["Overview", "Projects", "Employees", "Volunteers", "Attendance", "Leave", "Tasks", "Work Logs"];

  const projStatus = ["Planning", "Active", "Delayed", "Completed"].map((s) => ({ name: s, value: data.projects.filter((p) => p.status === s).length }));
  const budgetData = data.projects.map((p) => ({ name: p.name.split(" ").slice(0, 2).join(" "), budget: p.budget, spent: p.spent }));
  const attByDate = Object.values(data.attendance.reduce((acc, a) => { acc[a.date] = acc[a.date] || { name: a.date.slice(5), count: 0 }; acc[a.date].count++; return acc; }, {}));
  const leaveByType = Object.values(data.leaves.reduce((acc, l) => { acc[l.type] = acc[l.type] || { name: l.type, value: 0 }; acc[l.type].value++; return acc; }, {}));
  const taskByStatus = ["Pending", "In Progress", "Overdue", "Completed"].map((s) => ({ name: s, count: data.tasks.filter((tk) => tk.status === s).length }));
  const pieColors = [t.primary, t.success, t.coral, t.gold];

  const exportCSV = (headers, rows, filename) => exportToCSV(headers, rows, filename);

  return (
    <div>
      <div style={{ display: "flex", gap: 6, overflowX: "auto", marginBottom: 18, paddingBottom: 2, alignItems: "center" }}>
        {tabs.map((tb) => (
          <button key={tb} onClick={() => setTab(tb)} style={{ padding: "7px 13px", borderRadius: 18, border: `1px solid ${tab === tb ? "transparent" : t.line}`, background: tab === tb ? t.primary : "transparent", color: tab === tb ? "#fff" : t.ink, fontFamily: "Inter", fontSize: 12.5, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
            {tb}
          </button>
        ))}
        <Btn t={t} variant="ghost" style={{ marginLeft: "auto" }} onClick={() => window.print()}>Print</Btn>
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
        <>
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
          <div style={{ marginTop: 12 }}>
            <Btn t={t} variant="ghost" icon={Download} onClick={() => exportCSV(["Name", "Status", "Progress", "Budget", "Spent"], data.projects.map((p) => [p.name, p.status, p.progress, p.budget, p.spent]), "projects.csv")}>Export CSV</Btn>
          </div>
        </>
      )}

      {tab === "Employees" && (
        <>
          <SimpleTable t={t} rows={data.employees} cols={[["name", "Name"], ["role", "Role"], ["dept", "Dept"], ["email", "Email"], ["status", "Status"]]} />
          <div style={{ marginTop: 12 }}>
            <Btn t={t} variant="ghost" icon={Download} onClick={() => exportCSV(["Name", "Role", "Dept", "Email", "Phone", "Status"], data.employees.map((e) => [e.name, e.role, e.dept, e.email, e.phone, e.status]), "employees.csv")}>Export CSV</Btn>
          </div>
        </>
      )}

      {tab === "Volunteers" && (
        <>
          <SimpleTable t={t} rows={data.volunteers} cols={[["name", "Name"], ["skills", "Skills"], ["availability", "Availability"], ["hours", "Hours"], ["status", "Status"]]} />
          <div style={{ marginTop: 12 }}>
            <Btn t={t} variant="ghost" icon={Download} onClick={() => exportCSV(["Name", "Skills", "Availability", "Hours", "Assigned", "Status"], data.volunteers.map((v) => [v.name, v.skills.join("; "), v.availability, v.hours, data.projects.find((p) => p.id === v.assigned)?.name || "", v.status]), "volunteers.csv")}>Export CSV</Btn>
          </div>
        </>
      )}

      {tab === "Attendance" && (
        <>
          <ReportCard t={t} title="Check-ins per day" wide>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={attByDate}><CartesianGrid stroke={t.line} vertical={false} /><XAxis dataKey="name" tick={{ fontSize: 10, fill: t.inkSoft }} /><YAxis tick={{ fontSize: 10, fill: t.inkSoft }} allowDecimals={false} /><Tooltip /><Bar dataKey="count" fill={t.primary} radius={[4, 4, 0, 0]} /></BarChart>
            </ResponsiveContainer>
          </ReportCard>
          <div style={{ marginTop: 12 }}>
            <Btn t={t} variant="ghost" icon={Download} onClick={() => exportCSV(["Date", "Member", "Check-in", "Check-out", "Hours"], data.attendance.map((a) => [a.date, personOf(a.user)?.name || a.user, a.checkIn, a.checkOut || "", a.hours || ""]), "attendance.csv")}>Export CSV</Btn>
          </div>
        </>
      )}

      {tab === "Leave" && (
        <>
          <ReportCard t={t} title="Leave requests by type" wide>
            <PieChart width={280} height={220}><Pie data={leaveByType} dataKey="value" nameKey="name" outerRadius={80}>{leaveByType.map((e, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}</Pie><Tooltip /></PieChart>
          </ReportCard>
          <div style={{ marginTop: 12 }}>
            <Btn t={t} variant="ghost" icon={Download} onClick={() => exportCSV(["Member", "Type", "From", "To", "Status"], data.leaves.map((l) => [personOf(l.user)?.name || l.user, l.type, l.from, l.to, l.status]), "leave.csv")}>Export CSV</Btn>
          </div>
        </>
      )}

      {tab === "Tasks" && (
        <>
          <SimpleTable t={t} rows={data.tasks} cols={[["title", "Task"], ["priority", "Priority"], ["status", "Status"], ["due", "Due"]]} />
          <div style={{ marginTop: 12 }}>
            <Btn t={t} variant="ghost" icon={Download} onClick={() => exportCSV(["Task", "Priority", "Status", "Due", "Assignee"], data.tasks.map((tk) => [tk.title, tk.priority, tk.status, tk.due, personOf(tk.assignee)?.name || ""]), "tasks.csv")}>Export CSV</Btn>
          </div>
        </>
      )}

      {tab === "Work Logs" && (
        <>
          <SimpleTable t={t} rows={data.worklogs} cols={[["date", "Date"], ["summary", "Summary"], ["hours", "Hours"], ["status", "Status"]]} />
          <div style={{ marginTop: 12 }}>
            <Btn t={t} variant="ghost" icon={Download} onClick={() => exportCSV(["Date", "Member", "Summary", "Hours", "Status"], data.worklogs.map((w) => [w.date, personOf(w.user)?.name || w.user, w.summary, w.hours, w.status]), "worklogs.csv")}>Export CSV</Btn>
          </div>
        </>
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
              <tr key={r.id}>{cols.map(([k]) => <td key={k} style={{ padding: "10px 14px", borderBottom: `1px solid ${t.line}`, color: t.ink }}>{Array.isArray(r[k]) ? r[k].join(", ") : r[k]}</td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
