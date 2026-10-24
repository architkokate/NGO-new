
import React, { useMemo, useState } from "react";
import {
  Download,
  Printer,
  FileBarChart2,
  FolderKanban,
  Users,
  CalendarDays,
  ClipboardList,
  Clock3,
  Wallet,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { Card, Label, Btn } from "../components/Primitives";
import { exportToCSV } from "../services/storage";

const REPORT_TABS = [
  "Overview",
  "Projects",
  "Employees",
  "Volunteers",
  "Attendance",
  "Leave",
  "Tasks",
  "Work Logs",
];

export default function ReportsView({ t, data = {}, personOf = () => null }) {
  const [tab, setTab] = useState("Overview");

  const projects = data.projects || [];
  const employees = data.employees || [];
  const volunteers = data.volunteers || [];
  const attendance = data.attendance || [];
  const leaves = data.leaves || [];
  const tasks = data.tasks || [];
  const worklogs = data.worklogs || [];

  const pieColors = [t.primary, t.success, t.coral, t.accent];

  const projStatus = useMemo(
    () =>
      ["Planning", "Active", "Delayed", "Completed"].map((status) => ({
        name: status,
        value: projects.filter((p) => p.status === status).length,
      })),
    [projects]
  );

  const budgetData = useMemo(
    () =>
      projects.map((p) => ({
        name: (p.name || "Untitled").split(" ").slice(0, 3).join(" "),
        budget: Number(p.budget) || 0,
        spent: Number(p.spent) || 0,
      })),
    [projects]
  );

  const attByDate = useMemo(() => {
    const grouped = attendance.reduce((acc, a) => {
      const date = a.date || "Unknown";

      if (!acc[date]) {
        acc[date] = { name: date === "Unknown" ? date : date.slice(5), date, count: 0 };
      }

      acc[date].count += 1;
      return acc;
    }, {});

    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [attendance]);

  const leaveByType = useMemo(() => {
    const grouped = leaves.reduce((acc, leave) => {
      const type = leave.type || "Unspecified";

      if (!acc[type]) {
        acc[type] = { name: type, value: 0 };
      }

      acc[type].value += 1;
      return acc;
    }, {});

    return Object.values(grouped);
  }, [leaves]);

  const taskByStatus = ["Pending", "In Progress", "Overdue", "Completed"].map(
    (status) => ({
      name: status,
      count: tasks.filter((task) => task.status === status).length,
    })
  );

  const exportCSV = (headers, rows, filename) => {
    exportToCSV(headers, rows, filename);
  };

  const getPersonName = (id) => personOf(id)?.name || id || "—";

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  const sectionData = {
    Projects: projects.length,
    Employees: employees.length,
    Volunteers: volunteers.length,
    Attendance: attendance.length,
    Leave: leaves.length,
    Tasks: tasks.length,
    "Work Logs": worklogs.length,
  };

  return (
    <div style={{ display: "grid", gap: 20, minWidth: 0 }}>
      {/* Report navigation */}
      <div
        className="reports-no-print"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 7,
          overflowX: "auto",
          paddingBottom: 5,
          borderBottom: `1px solid ${t.line}`,
        }}
      >
        {REPORT_TABS.map((item) => {
          const active = tab === item;

          return (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              style={{
                flexShrink: 0,
                padding: "9px 14px",
                borderRadius: 7,
                border: `1px solid ${active ? t.primary : t.line}`,
                borderBottom: active
                  ? `3px solid ${t.accent}`
                  : `1px solid ${t.line}`,
                background: active ? t.primary : t.surface,
                color: active ? "#FFFFFF" : t.inkSoft,
                fontFamily: "Inter, sans-serif",
                fontSize: 12.5,
                fontWeight: active ? 700 : 500,
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background 0.2s ease",
              }}
            >
              {item}
              {item !== "Overview" && (
                <span
                  style={{
                    marginLeft: 6,
                    fontSize: 10,
                    opacity: active ? 0.85 : 0.7,
                  }}
                >
                  {sectionData[item]}
                </span>
              )}
            </button>
          );
        })}

        <div style={{ flex: 1, minWidth: 4 }} />

        <Btn t={t} variant="ghost" onClick={handlePrint}>
          <Printer size={14} />
          Print
        </Btn>
      </div>

      {/* Overview */}
      {tab === "Overview" && (
        <div style={{ display: "grid", gap: 18 }}>
          <ReportHeading
            t={t}
            title="Reports overview"
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
              gap: 12,
            }}
          >
            <SummaryCard
              t={t}
              icon={FolderKanban}
              label="Total projects"
              value={projects.length}
            />
            <SummaryCard
              t={t}
              icon={Users}
              label="Employees"
              value={employees.length}
            />
            <SummaryCard
              t={t}
              icon={CalendarDays}
              label="Attendance records"
              value={attendance.length}
            />
            <SummaryCard
              t={t}
              icon={ClipboardList}
              label="Total tasks"
              value={tasks.length}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 300px), 1fr))",
              gap: 16,
            }}
          >
            <ReportCard t={t} title="Projects by status">
              {projects.length ? (
                <>
                  <ResponsiveContainer width="100%" height={220}>
                    <PieChart>
                      <Pie
                        data={projStatus.filter((item) => item.value > 0)}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={48}
                        outerRadius={78}
                        paddingAngle={3}
                      >
                        {projStatus
                          .filter((item) => item.value > 0)
                          .map((item) => (
                            <Cell
                              key={item.name}
                              fill={
                                pieColors[
                                  projStatus.findIndex((p) => p.name === item.name)
                                ]
                              }
                            />
                          ))}
                      </Pie>
                      <Tooltip content={<ReportTooltip t={t} />} />
                    </PieChart>
                  </ResponsiveContainer>
                  <ChartLegend t={t} items={projStatus} colors={pieColors} />
                </>
              ) : (
                <ChartEmpty t={t} />
              )}
            </ReportCard>

            <ReportCard t={t} title="Tasks by status">
              {tasks.length ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={taskByStatus}
                    margin={{ top: 8, right: 8, left: -20, bottom: 8 }}
                  >
                    <CartesianGrid
                      stroke={t.line}
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: t.inkSoft }}
                      axisLine={{ stroke: t.line }}
                      tickLine={false}
                      interval={0}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: t.inkSoft }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ReportTooltip t={t} />} />
                    <Bar
                      dataKey="count"
                      name="Tasks"
                      fill={t.primary}
                      radius={[5, 5, 0, 0]}
                      maxBarSize={42}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmpty t={t} />
              )}
            </ReportCard>

            <ReportCard t={t} title="Attendance trend" wide>
              {attByDate.length ? (
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart
                    data={attByDate}
                    margin={{ top: 12, right: 12, left: -20, bottom: 4 }}
                  >
                    <CartesianGrid
                      stroke={t.line}
                      strokeDasharray="3 3"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 10, fill: t.inkSoft }}
                      axisLine={{ stroke: t.line }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 10, fill: t.inkSoft }}
                      allowDecimals={false}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<ReportTooltip t={t} />} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      name="Check-ins"
                      stroke={t.primary}
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: t.accent, strokeWidth: 0 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <ChartEmpty t={t} />
              )}
            </ReportCard>
          </div>
        </div>
      )}

      {/* Projects */}
      {tab === "Projects" && (
        <div style={{ display: "grid", gap: 16 }}>
          <ReportHeading
            t={t}
            title="Project reports"
          />

          <ReportCard t={t} title="Budget vs. spend by project" wide>
            {budgetData.length ? (
              <ResponsiveContainer width="100%" height={Math.max(260, budgetData.length * 55)}>
                <BarChart
                  data={budgetData}
                  layout="vertical"
                  margin={{ top: 8, right: 18, left: 12, bottom: 8 }}
                >
                  <CartesianGrid
                    stroke={t.line}
                    strokeDasharray="3 3"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 10, fill: t.inkSoft }}
                    axisLine={{ stroke: t.line }}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    width={105}
                    tick={{ fontSize: 11, fill: t.inkSoft }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ReportTooltip t={t} />} />
                  <Bar
                    dataKey="budget"
                    name="Budget"
                    fill={t.chipBg}
                    radius={[0, 4, 4, 0]}
                    maxBarSize={18}
                  />
                  <Bar
                    dataKey="spent"
                    name="Spent"
                    fill={t.primary}
                    radius={[0, 4, 4, 0]}
                    maxBarSize={18}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty t={t} />
            )}
          </ReportCard>

          <ExportRow t={t}>
            <Btn
              t={t}
              variant="accent"
              onClick={() =>
                exportCSV(
                  ["Name", "Status", "Progress", "Budget", "Spent"],
                  projects.map((p) => [
                    p.name,
                    p.status,
                    p.progress,
                    p.budget,
                    p.spent,
                  ]),
                  "projects.csv"
                )
              }
            >
              <Download size={14} />
              Export projects CSV
            </Btn>
          </ExportRow>
        </div>
      )}

      {/* Employees */}
      {tab === "Employees" && (
        <ReportSection
          t={t}
          title="Employee report"
          icon={Users}
          rows={employees}
          cols={[
            ["name", "Name"],
            ["role", "Role"],
            ["dept", "Department"],
            ["email", "Email"],
            ["status", "Status"],
          ]}
          onExport={() =>
            exportCSV(
              ["Name", "Role", "Department", "Email", "Phone", "Status"],
              employees.map((e) => [
                e.name,
                e.role,
                e.dept,
                e.email,
                e.phone,
                e.status,
              ]),
              "employees.csv"
            )
          }
        />
      )}

      {/* Volunteers */}
      {tab === "Volunteers" && (
        <ReportSection
          t={t}
          title="Volunteer report"
          icon={Users}
          rows={volunteers}
          cols={[
            ["name", "Name"],
            ["skills", "Skills"],
            ["availability", "Availability"],
            ["hours", "Hours"],
            ["status", "Status"],
          ]}
          onExport={() =>
            exportCSV(
              ["Name", "Skills", "Availability", "Hours", "Assigned Project", "Status"],
              volunteers.map((v) => [
                v.name,
                Array.isArray(v.skills) ? v.skills.join("; ") : v.skills || "",
                v.availability,
                v.hours,
                projects.find((p) => p.id === v.assigned)?.name || "",
                v.status,
              ]),
              "volunteers.csv"
            )
          }
        />
      )}

      {/* Attendance */}
      {tab === "Attendance" && (
        <div style={{ display: "grid", gap: 16 }}>
          <ReportHeading
            t={t}
            title="Attendance report"
          />

          <ReportCard t={t} title="Check-ins per day" wide>
            {attByDate.length ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart
                  data={attByDate}
                  margin={{ top: 8, right: 12, left: -18, bottom: 5 }}
                >
                  <CartesianGrid
                    stroke={t.line}
                    strokeDasharray="3 3"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: t.inkSoft }}
                    axisLine={{ stroke: t.line }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fill: t.inkSoft }}
                    allowDecimals={false}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ReportTooltip t={t} />} />
                  <Bar
                    dataKey="count"
                    name="Check-ins"
                    fill={t.primary}
                    radius={[5, 5, 0, 0]}
                    maxBarSize={38}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ChartEmpty t={t} />
            )}
          </ReportCard>

          <ExportRow t={t}>
            <Btn
              t={t}
              variant="accent"
              onClick={() =>
                exportCSV(
                  ["Date", "Member", "Check-in", "Check-out", "Hours"],
                  attendance.map((a) => [
                    a.date,
                    getPersonName(a.user),
                    a.checkIn,
                    a.checkOut || "",
                    a.hours ?? "",
                  ]),
                  "attendance.csv"
                )
              }
            >
              <Download size={14} />
              Export attendance CSV
            </Btn>
          </ExportRow>
        </div>
      )}

      {/* Leave */}
      {tab === "Leave" && (
        <div style={{ display: "grid", gap: 16 }}>
          <ReportHeading
            t={t}
            title="Leave report"
          />

          <ReportCard t={t} title="Leave requests by type" wide>
            {leaves.length ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 280px), 1fr))",
                  alignItems: "center",
                  gap: 16,
                }}
              >
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={leaveByType}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={55}
                      outerRadius={88}
                      paddingAngle={3}
                    >
                      {leaveByType.map((item, index) => (
                        <Cell
                          key={item.name}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<ReportTooltip t={t} />} />
                  </PieChart>
                </ResponsiveContainer>

                <ChartLegend
                  t={t}
                  items={leaveByType}
                  colors={pieColors}
                />
              </div>
            ) : (
              <ChartEmpty t={t} />
            )}
          </ReportCard>

          <ExportRow t={t}>
            <Btn
              t={t}
              variant="accent"
              onClick={() =>
                exportCSV(
                  ["Member", "Type", "From", "To", "Status"],
                  leaves.map((l) => [
                    getPersonName(l.user),
                    l.type,
                    l.from,
                    l.to,
                    l.status,
                  ]),
                  "leave.csv"
                )
              }
            >
              <Download size={14} />
              Export leave CSV
            </Btn>
          </ExportRow>
        </div>
      )}

      {/* Tasks */}
      {tab === "Tasks" && (
        <ReportSection
          t={t}
          title="Task report"
          icon={ClipboardList}
          rows={tasks}
          cols={[
            ["title", "Task"],
            ["priority", "Priority"],
            ["status", "Status"],
            ["due", "Due date"],
          ]}
          onExport={() =>
            exportCSV(
              ["Task", "Priority", "Status", "Due", "Assignee"],
              tasks.map((task) => [
                task.title,
                task.priority,
                task.status,
                task.due,
                getPersonName(task.assignee),
              ]),
              "tasks.csv"
            )
          }
        />
      )}

      {/* Work Logs */}
      {tab === "Work Logs" && (
        <ReportSection
          t={t}
          title="Work log report"
          icon={Clock3}
          rows={worklogs}
          cols={[
            ["date", "Date"],
            ["summary", "Summary"],
            ["hours", "Hours"],
            ["status", "Status"],
          ]}
          onExport={() =>
            exportCSV(
              ["Date", "Member", "Summary", "Hours", "Status"],
              worklogs.map((w) => [
                w.date,
                getPersonName(w.user),
                w.summary,
                w.hours,
                w.status,
              ]),
              "worklogs.csv"
            )
          }
        />
      )}
    </div>
  );
}

/* -------------------- Reusable components -------------------- */

function ReportHeading({ t, title, subtitle }) {
  return (
    <div style={{ display: "grid", gap: 5 }}>
      <h2
        style={{
          margin: 0,
          color: t.primaryDeep,
          fontFamily: "Fraunces, Georgia, serif",
          fontSize: 25,
          fontWeight: 600,
          letterSpacing: "-0.5px",
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            margin: 0,
            color: t.inkSoft,
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

function SummaryCard({ t, icon: Icon, label, value }) {
  return (
    <Card t={t} style={{ padding: 15, borderTop: `3px solid ${t.accent}` }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 35,
            height: 35,
            flexShrink: 0,
            display: "grid",
            placeItems: "center",
            borderRadius: 9,
            background: t.chipBg,
            color: t.primary,
          }}
        >
          <Icon size={17} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: t.inkSoft,
              fontSize: 11,
              lineHeight: 1.4,
            }}
          >
            {label}
          </div>
          <div
            style={{
              marginTop: 3,
              color: t.ink,
              fontSize: 24,
              fontWeight: 700,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {value}
          </div>
        </div>
      </div>
    </Card>
  );
}

function ReportCard({ t, title, children, wide }) {
  return (
    <Card
      t={t}
      style={{
        minWidth: 0,
        padding: 18,
        gridColumn: wide ? "1 / -1" : undefined,
        borderTop: `1px solid ${t.line}`,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 9,
          marginBottom: 12,
        }}
      >
        <span
          style={{
            width: 4,
            height: 18,
            flexShrink: 0,
            borderRadius: 4,
            background: t.accent,
          }}
        />
        <div
          style={{
            color: t.ink,
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          {title}
        </div>
      </div>
      <div style={{ width: "100%", minWidth: 0 }}>{children}</div>
    </Card>
  );
}

function ChartLegend({ t, items, colors }) {
  return (
    <div style={{ display: "grid", gap: 11, padding: "4px 8px 12px" }}>
      {items.map((item, index) => (
        <div
          key={item.name}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            fontSize: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 9,
                height: 9,
                borderRadius: 3,
                flexShrink: 0,
                background: colors[index % colors.length],
              }}
            />
            <span style={{ color: t.inkSoft }}>{item.name}</span>
          </div>
          <strong style={{ color: t.ink }}>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ChartEmpty({ t }) {
  return (
    <div
      style={{
        minHeight: 210,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 10,
        color: t.inkSoft,
        textAlign: "center",
      }}
    >
      <FileBarChart2 size={28} strokeWidth={1.5} />
      <div style={{ fontSize: 13, fontWeight: 600, color: t.ink }}>
        No data to display yet
      </div>
      <div style={{ fontSize: 12 }}>
        Data will appear here once records are available.
      </div>
    </div>
  );
}

function ReportTooltip({ t, active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      style={{
        padding: "10px 12px",
        border: `1px solid ${t.line}`,
        borderRadius: 8,
        background: t.surface,
        boxShadow: "0 4px 14px rgba(30, 35, 55, 0.10)",
      }}
    >
      {label && (
        <div
          style={{
            marginBottom: 6,
            color: t.ink,
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          {label}
        </div>
      )}
      {payload.map((item, index) => (
        <div
          key={`${item.name}-${index}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 7,
            marginTop: 4,
            color: t.inkSoft,
            fontSize: 12,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 2,
              background: item.color || t.primary,
            }}
          />
          {item.name}:{" "}
          <strong style={{ color: t.ink }}>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

function ExportRow({ t, children }) {
  return (
    <div
      className="reports-no-print"
      style={{
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "center",
        gap: 10,
      }}
    >
      {children}
    </div>
  );
}

function ReportSection({
  t,
  title,
  subtitle,
  icon: Icon,
  rows,
  cols,
  onExport,
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <ReportHeading t={t} title={title} subtitle={subtitle} />

      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <Icon size={17} color={t.primary} />
        <span style={{ fontSize: 12, color: t.inkSoft }}>
          {rows.length} {rows.length === 1 ? "record" : "records"}
        </span>
      </div>

      <SimpleTable t={t} rows={rows} cols={cols} />

      <ExportRow t={t}>
        <Btn t={t} variant="accent" onClick={onExport}>
          <Download size={14} />
          Export CSV
        </Btn>
      </ExportRow>
    </div>
  );
}

function SimpleTable({ t, rows = [], cols }) {
  return (
    <Card t={t} style={{ padding: 0, overflow: "hidden", minWidth: 0 }}>
      <div style={{ overflowX: "auto", width: "100%" }}>
        <table
          style={{
            width: "100%",
            minWidth: 520,
            borderCollapse: "collapse",
            fontFamily: "Inter, sans-serif",
            fontSize: 12.5,
          }}
        >
          <thead>
            <tr style={{ background: t.chipBg }}>
              {cols.map(([key, label]) => (
                <th
                  key={key}
                  style={{
                    textAlign: "left",
                    padding: "12px 15px",
                    borderBottom: `1px solid ${t.line}`,
                    color: t.inkSoft,
                    fontSize: 10.5,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.055em",
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={cols.length}
                  style={{
                    padding: "36px 16px",
                    textAlign: "center",
                    color: t.inkSoft,
                  }}
                >
                  No records available for this report yet.
                </td>
              </tr>
            ) : (
              rows.map((row, index) => (
                <tr
                  key={row.id ?? `${row.name ?? row.title ?? "row"}-${index}`}
                  style={{
                    background: index % 2 === 0 ? t.surface : t.canvas,
                  }}
                >
                  {cols.map(([key]) => {
                    const value = row[key];
                    const displayValue = Array.isArray(value)
                      ? value.join(", ")
                      : value === null || value === undefined || value === ""
                        ? "—"
                        : String(value);

                    return (
                      <td
                        key={key}
                        style={{
                          padding: "12px 15px",
                          borderBottom: `1px solid ${t.line}`,
                          color: t.ink,
                          lineHeight: 1.5,
                          maxWidth: 260,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {displayValue}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
