
import React, { useState, useMemo } from "react";
import {
  FolderKanban,
  Users,
  ListChecks,
  AlertCircle,
  Clock,
  Megaphone,
  Calendar,
  Activity,
  CheckSquare,
  Square,
  LayoutGrid,
} from "lucide-react";
import { ANNOUNCEMENTS, personIdsOf } from "../services/seeds";
import { todayStr } from "../services/storage";

// Balanced palette: orange primary, blue secondary, warm neutral backgrounds
const PALETTE = {
  // Primary brand: Orange
  orange: "#F47B20",
  orangeDeep: "#C85F13",
  orangeSoft: "#FFF0DF",
  golden: "#F3A847",

  // Secondary brand: Blue
  blue: "#4659A8",
  blueDeep: "#354681",
  blueLight: "#7382C7",
  blueSoft: "#EDECF5",

  // Backgrounds and text
  cream: "#F8F5EF",
  white: "#FFFFFF",
  text: "#343746",
  mutedText: "#707382",

  // Borders
  line: "#E6E0D6",
  lineSoft: "#F1ECE4",

  // Card backgrounds
  cardSoftTint: "#EDECF5",
  cardWarmBeige: "#FFF0DF",
  cardMissingPill: "#F9E3C6",

  // Progress bars
  progressTrack: "rgba(255,255,255,0.22)",

  // Status colours
  success: "#397653",
  danger: "#BD594B",
};

export default function Dashboard({
  t,
  data,
  patch,
  notify,
  sessionUser,
  setView,
}) {
  const {
    projects = [],
    tasks = [],
    employees = [],
    volunteers = [],
    attendance = [],
    leaves = [],
  } = data || {};

  const today = todayStr();

  const [viewMode, setViewMode] = useState("all");

  // Organisation overview
  const totalProjects = projects.length;
  const activeProjects = projects.filter(
    (p) => p.status === "Active"
  ).length;
  const delayedProjects = projects.filter(
    (p) => p.status === "Delayed"
  ).length;
  const completedProjects = projects.filter(
    (p) => p.status === "Completed"
  ).length;
  const planningProjects = projects.filter(
    (p) => p.status === "Planning"
  ).length;

  const totalPeople = employees.length + volunteers.length;
  const employeesCount = employees.length;
  const volunteersCount = volunteers.length;

  const pendingTasks = tasks.filter(
    (tk) => tk.status !== "Completed"
  ).length;
  const pendingLeaves = leaves.filter(
    (l) => l.status === "Pending"
  ).length;
  const needsAttentionCount = delayedProjects + pendingLeaves;

  const todayAtt = attendance.filter(
    (a) => a.date === today
  ).length;

  // Workspace calculations
  const userPersonIds = useMemo(
    () => personIdsOf(sessionUser),
    [sessionUser]
  );

  const myTasks = useMemo(
    () => tasks.filter((tk) => userPersonIds.includes(tk.assignee)),
    [tasks, userPersonIds]
  );

  const openTasks = useMemo(
    () => myTasks.filter((tk) => tk.status !== "Completed"),
    [myTasks]
  );

  const overdueTasks = useMemo(
    () =>
      myTasks.filter(
        (tk) =>
          tk.status === "Overdue" ||
          (tk.due && tk.due < today && tk.status !== "Completed")
      ),
    [myTasks, today]
  );

  const displayTasks = useMemo(
    () => (myTasks.length > 0 ? myTasks : tasks).slice(0, 4),
    [myTasks, tasks]
  );

  // Task completion toggle
  const toggleTask = (taskId) => {
    if (!patch) return;

    patch((d) => ({
      ...d,
      tasks: (d.tasks || []).map((tk) =>
        tk.id === taskId
          ? {
              ...tk,
              status:
                tk.status === "Completed" ? "In Progress" : "Completed",
            }
          : tk
      ),
    }));

    if (notify) notify("Task status updated");
  };

  const getDueTag = (task) => {
    if (task.status === "Completed") {
      return { text: "Completed", color: PALETTE.success };
    }

    if (
      task.status === "Overdue" ||
      (task.due && task.due < today)
    ) {
      return { text: "Overdue", color: PALETTE.danger };
    }

    if (task.due === today) {
      return { text: "Due today", color: PALETTE.orangeDeep };
    }

    return {
      text: `Due ${task.due || "this week"}`,
      color: PALETTE.mutedText,
    };
  };

  const buttonStyle = (active) => ({
    background: active ? PALETTE.white : "transparent",
    color: active ? PALETTE.blueDeep : PALETTE.mutedText,
    border: "none",
    borderRadius: 6,
    padding: "7px 12px",
    fontSize: 12,
    fontWeight: 600,
    cursor: "pointer",
    boxShadow: active ? "0 1px 3px rgba(53,70,129,0.10)" : "none",
    transition: "background 0.15s ease, color 0.15s ease",
    whiteSpace: "nowrap",
  });

  const StatCard = ({ icon: Icon, label, value, detail, iconColor }) => (
    <div className="dash-card">
      <div className="dash-stat-icon" style={{ color: iconColor || PALETTE.blue }}>
        <Icon size={19} strokeWidth={1.9} />
      </div>

      <div className="dash-stat-label">{label}</div>
      <div className="dash-stat-value">{value}</div>

      {detail && <div className="dash-stat-detail">{detail}</div>}
    </div>
  );

  const ProgressRow = ({ label, count, color }) => {
    const percentage = totalProjects
      ? Math.round((count / totalProjects) * 100)
      : 0;

    return (
      <div>
        <div className="dash-progress-heading">
          <span>{label}</span>
          <span className="dash-progress-number">
            {count} ({percentage}%)
          </span>
        </div>

        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${percentage}%`,
              background: color,
            }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-page">
      <style>{`
        .dashboard-page {
          width: 100%;
          max-width: 960px;
          margin: 0 auto;
          padding: 4px 0 32px;
          color: ${PALETTE.text};
          font-family: Inter, sans-serif;
          box-sizing: border-box;
        }

        .dashboard-page * {
          box-sizing: border-box;
        }

        .dash-card {
          min-width: 0;
          background: ${PALETTE.white};
          border: 1px solid ${PALETTE.line};
          border-radius: 12px;
          padding: 20px;
          transition: border-color 0.16s ease, box-shadow 0.16s ease;
        }

        .dash-card:hover {
          border-color: #DDD4C6;
          box-shadow: 0 4px 14px rgba(52,55,70,0.035);
        }

        .dash-row-3 {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 14px;
        }

        .dash-row-asym {
          display: grid;
          grid-template-columns: 1.8fr 1fr;
          gap: 14px;
          margin-bottom: 24px;
        }

        .dash-row-main-2 {
          display: grid;
          grid-template-columns: 1.55fr 1fr;
          gap: 14px;
          margin-bottom: 24px;
        }

        .dash-section-label {
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          font-weight: 600;
          color: ${PALETTE.mutedText};
          margin-bottom: 5px;
        }

        .dash-section-title {
          font-size: 24px;
          line-height: 1.3;
          font-weight: 700;
          letter-spacing: -0.025em;
          color: ${PALETTE.blueDeep};
          margin: 0;
        }

        .dash-section-subtitle {
          font-size: 13.5px;
          color: ${PALETTE.mutedText};
          line-height: 1.5;
          margin-top: 4px;
        }

        .dash-stat-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: ${PALETTE.blueSoft};
        }

        .dash-stat-label {
          font-size: 11px;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          font-weight: 600;
          color: ${PALETTE.mutedText};
          margin-top: 13px;
          margin-bottom: 6px;
        }

        .dash-stat-value {
          font-size: 28px;
          font-weight: 700;
          line-height: 1.15;
          letter-spacing: -0.03em;
          color: ${PALETTE.blueDeep};
        }

        .dash-stat-detail {
          font-size: 12px;
          color: ${PALETTE.mutedText};
          margin-top: 5px;
          line-height: 1.5;
        }

        .dash-link {
          background: none;
          border: none;
          color: ${PALETTE.blueDeep};
          font-family: Inter, sans-serif;
          font-size: 12.5px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 0;
          transition: color 0.15s ease;
        }

        .dash-link:hover {
          color: ${PALETTE.orangeDeep};
        }

        .dash-link:focus-visible,
        .dash-view-button:focus-visible,
        .dash-icon-button:focus-visible,
        .dash-task-toggle:focus-visible {
          outline: 2px solid ${PALETTE.orange};
          outline-offset: 3px;
        }

        .dash-task-item,
        .dash-update-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 13px 0;
          border-bottom: 1px solid ${PALETTE.lineSoft};
        }

        .dash-task-item:last-child,
        .dash-update-item:last-child {
          border-bottom: none;
        }

        .dash-task-toggle {
          flex-shrink: 0;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          display: flex;
          margin-top: 2px;
        }

        .dash-view-switcher {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          background: ${PALETTE.blueSoft};
          padding: 4px;
          border-radius: 9px;
        }

        .dash-view-button {
          border: none;
          border-radius: 6px;
          padding: 7px 12px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.15s ease, color 0.15s ease;
        }

        .dash-icon-button {
          background: ${PALETTE.white};
          border: 1px solid ${PALETTE.line};
          border-radius: 8px;
          width: 34px;
          height: 34px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: ${PALETTE.blueDeep};
          transition: background 0.15s ease, border-color 0.15s ease;
        }

        .dash-icon-button:hover {
          background: ${PALETTE.orangeSoft};
          border-color: #F2D1B2;
        }

        .progress-bar-track {
          width: 100%;
          height: 7px;
          background: ${PALETTE.progressTrack};
          border-radius: 999px;
          overflow: hidden;
          margin-top: 7px;
        }

        .progress-bar-fill {
          height: 100%;
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        .dash-progress-heading {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          font-size: 12.5px;
          font-weight: 500;
        }

        .dash-progress-number {
          font-weight: 700;
          white-space: nowrap;
        }

        .dash-caption {
          font-size: 11.5px;
          line-height: 1.5;
          color: ${PALETTE.mutedText};
          opacity: 0.85;
        }

        @media (max-width: 768px) {
          .dashboard-page {
            padding: 4px 0 24px;
          }

          .dash-row-3 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dash-row-asym,
          .dash-row-main-2 {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 520px) {
          .dash-row-3 {
            grid-template-columns: 1fr;
          }

          .dash-card {
            padding: 17px;
          }

          .dash-section-title {
            font-size: 21px;
          }

          .dash-view-switcher {
            width: 100%;
          }

          .dash-view-button {
            flex: 1;
            padding: 8px 7px;
            font-size: 11px;
          }

          .dash-header-controls {
            align-items: flex-start !important;
            flex-direction: column;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dashboard-page *,
          .dashboard-page *::before,
          .dashboard-page *::after {
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>

      {/* View switcher */}
      <div
        className="dash-header-controls"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <div className="dash-view-switcher">
          {[
            { id: "all", label: "Overview & Workspace" },
            { id: "org", label: "Organisation" },
            { id: "workspace", label: "Workspace" },
          ].map((option) => (
            <button
              key={option.id}
              className="dash-view-button"
              onClick={() => setViewMode(option.id)}
              style={buttonStyle(viewMode === option.id)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          className="dash-icon-button"
          onClick={() =>
            setViewMode((mode) =>
              mode === "all"
                ? "workspace"
                : mode === "workspace"
                ? "org"
                : "all"
            )
          }
          title="Toggle view mode"
          aria-label="Toggle dashboard view"
        >
          <LayoutGrid size={16} />
        </button>
      </div>

      {/* Organisation overview */}
      {(viewMode === "all" || viewMode === "org") && (
        <section style={{ marginBottom: viewMode === "all" ? 36 : 0 }}>
          <div style={{ marginBottom: 18 }}>
            <div className="dash-section-label">
              Administration / Overview
            </div>

            <h1 className="dash-section-title">
              Organisation at a glance
            </h1>

            <div className="dash-section-subtitle">
              A quick overview of your people, work and operations.
            </div>
          </div>

          {/* Summary cards */}
          <div className="dash-row-3">
            <StatCard
              icon={FolderKanban}
              label="Total projects"
              value={totalProjects}
              detail={`${activeProjects} active · ${delayedProjects} delayed`}
              iconColor={PALETTE.blue}
            />

            <StatCard
              icon={Users}
              label="People"
              value={totalPeople}
              detail={`${employeesCount} employees · ${volunteersCount} volunteers`}
              iconColor={PALETTE.orangeDeep}
            />

            <StatCard
              icon={ListChecks}
              label="Tasks pending"
              value={pendingTasks}
              detail="Across assigned work"
              iconColor={PALETTE.blue}
            />
          </div>

          {/* Attention and attendance */}
          <div className="dash-row-asym">
            <div
              style={{
                background: PALETTE.orangeSoft,
                border: "1px solid #F3DEC7",
                borderRadius: 12,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 150,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span className="dash-section-label" style={{ margin: 0 }}>
                  Needs attention
                </span>
                <AlertCircle size={17} color={PALETTE.orangeDeep} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: 23,
                    fontWeight: 700,
                    color: PALETTE.blueDeep,
                    marginTop: 10,
                    marginBottom: 4,
                  }}
                >
                  {needsAttentionCount} items
                </div>

                <div style={{ fontSize: 12.5, color: PALETTE.mutedText }}>
                  {delayedProjects} delayed projects · {pendingLeaves} leave requests
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: 12 }}>
                <button
                  onClick={() => setView && setView("leave")}
                  className="dash-link"
                  style={{ color: PALETTE.orangeDeep }}
                >
                  Review →
                </button>
              </div>
            </div>

            <div
              style={{
                background: PALETTE.blueDeep,
                color: PALETTE.white,
                borderRadius: 12,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 150,
              }}
            >
              <div>
                <Clock size={17} color={PALETTE.golden} />

                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "rgba(255,255,255,0.76)",
                    marginTop: 10,
                    marginBottom: 4,
                  }}
                >
                  Attendance today
                </div>

                <div
                  style={{
                    fontSize: 29,
                    fontWeight: 700,
                    color: PALETTE.white,
                    lineHeight: 1.2,
                  }}
                >
                  {todayAtt}
                </div>
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: "rgba(255,255,255,0.75)",
                  marginTop: 12,
                }}
              >
                Checked in
              </div>
            </div>
          </div>

          <div className="dash-caption">
            Figures are calculated from the records currently available in the dashboard.
          </div>
        </section>
      )}

      {viewMode === "all" && (
        <div
          style={{
            height: 1,
            background: PALETTE.line,
            margin: "30px 0",
          }}
        />
      )}

      {/* Workspace overview */}
      {(viewMode === "all" || viewMode === "workspace") && (
        <section>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div>
              <div className="dash-section-label">Your workspace</div>

              <h2 className="dash-section-title">
                Work overview
              </h2>

              <div className="dash-section-subtitle">
                Your tasks, projects and what&apos;s happening.
              </div>
            </div>

            <div
              style={{
                width: 36,
                height: 36,
                flexShrink: 0,
                borderRadius: 10,
                background: PALETTE.orangeSoft,
                color: PALETTE.orangeDeep,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LayoutGrid size={17} />
            </div>
          </div>

          {/* Workspace statistics */}
          <div className="dash-row-3">
            <StatCard
              icon={ListChecks}
              label="Open tasks"
              value={openTasks.length}
              iconColor={PALETTE.orangeDeep}
            />

            <StatCard
              icon={FolderKanban}
              label="Active projects"
              value={activeProjects}
              iconColor={PALETTE.blue}
            />

            <div
              style={{
                background: PALETTE.orangeSoft,
                border: "1px solid #F3DEC7",
                borderRadius: 12,
                padding: 20,
              }}
            >
              <div
                className="dash-stat-icon"
                style={{
                  background: "#FBE0C4",
                  color: PALETTE.orangeDeep,
                }}
              >
                <Clock size={19} />
              </div>

              <div className="dash-stat-label">Overdue tasks</div>

              <div
                className="dash-stat-value"
                style={{ color: PALETTE.orangeDeep }}
              >
                {overdueTasks.length}
              </div>

              <div className="dash-stat-detail">
                Tasks that need follow-up
              </div>
            </div>
          </div>

          {/* Tasks, updates and project status */}
          <div className="dash-row-main-2">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Your tasks */}
              <div className="dash-card">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    gap: 12,
                    marginBottom: 8,
                  }}
                >
                  <div style={{ fontSize: 16.5, fontWeight: 700, color: PALETTE.blueDeep }}>
                    Your tasks
                  </div>

                  <button
                    onClick={() => setView && setView("tasks")}
                    className="dash-link"
                  >
                    View all →
                  </button>
                </div>

                {displayTasks.length === 0 ? (
                  <div
                    style={{
                      fontSize: 13,
                      color: PALETTE.mutedText,
                      padding: "14px 0",
                    }}
                  >
                    No tasks assigned yet.
                  </div>
                ) : (
                  displayTasks.map((tk) => {
                    const due = getDueTag(tk);
                    const isDone = tk.status === "Completed";

                    return (
                      <div key={tk.id} className="dash-task-item">
                        <button
                          className="dash-task-toggle"
                          onClick={() => toggleTask(tk.id)}
                          aria-label={
                            isDone
                              ? `Mark ${tk.title} as incomplete`
                              : `Mark ${tk.title} as completed`
                          }
                          title={isDone ? "Mark incomplete" : "Mark completed"}
                        >
                          {isDone ? (
                            <CheckSquare
                              size={17}
                              color={PALETTE.success}
                            />
                          ) : (
                            <Square
                              size={17}
                              color={PALETTE.mutedText}
                            />
                          )}
                        </button>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 13.5,
                              fontWeight: 600,
                              color: isDone
                                ? PALETTE.mutedText
                                : PALETTE.text,
                              textDecoration: isDone
                                ? "line-through"
                                : "none",
                              overflowWrap: "anywhere",
                            }}
                          >
                            {tk.title}
                          </div>

                          <div
                            style={{
                              fontSize: 11.5,
                              color: due.color,
                              marginTop: 3,
                            }}
                          >
                            {due.text}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Latest updates */}
              <div className="dash-card">
                <div
                  style={{
                    fontSize: 16.5,
                    fontWeight: 700,
                    color: PALETTE.blueDeep,
                    marginBottom: 8,
                  }}
                >
                  Latest updates
                </div>

                {ANNOUNCEMENTS.map((announcement, index) => {
                  const IconComponent =
                    index % 2 === 0 ? Megaphone : Calendar;

                  return (
                    <div key={announcement.id} className="dash-update-item">
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          flexShrink: 0,
                          borderRadius: 9,
                          background:
                            index % 2 === 0
                              ? PALETTE.orangeSoft
                              : PALETTE.blueSoft,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color:
                            index % 2 === 0
                              ? PALETTE.orangeDeep
                              : PALETTE.blue,
                        }}
                      >
                        <IconComponent size={16} />
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: 13.5,
                            fontWeight: 600,
                            color: PALETTE.text,
                          }}
                        >
                          {announcement.title}
                        </div>

                        <div
                          style={{
                            fontSize: 12,
                            color: PALETTE.mutedText,
                            marginTop: 3,
                          }}
                        >
                          Organisation news · {announcement.date}
                        </div>
                      </div>
                    </div>
                  );
                })}

                <div style={{ marginTop: 12 }}>
                  <button
                    onClick={() => setView && setView("notifications")}
                    className="dash-link"
                  >
                    All announcements →
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Project pulse */}
              <div
                style={{
                  background: PALETTE.blueDeep,
                  color: PALETTE.white,
                  borderRadius: 12,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 250,
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: PALETTE.white,
                    }}
                  >
                    Project pulse
                  </div>

                  <div
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.72)",
                      marginTop: 3,
                      marginBottom: 20,
                    }}
                  >
                    Projects by current status
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 17 }}>
                    <ProgressRow
                      label="Active"
                      count={activeProjects}
                      color={PALETTE.orange}
                    />

                    <ProgressRow
                      label="Completed"
                      count={completedProjects}
                      color="#FFFFFF"
                    />

                    <ProgressRow
                      label="Planning"
                      count={planningProjects}
                      color={PALETTE.golden}
                    />
                  </div>
                </div>

                <div style={{ marginTop: 24 }}>
                  <button
                    onClick={() => setView && setView("projects")}
                    style={{
                      background: "none",
                      border: "none",
                      color: PALETTE.white,
                      fontSize: 12.5,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      padding: 0,
                    }}
                  >
                    Open projects →
                  </button>
                </div>
              </div>

              {/* Recent activity */}
              <div
                style={{
                  background: PALETTE.blueSoft,
                  border: "1px solid #E2E1EF",
                  borderRadius: 12,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 165,
                }}
              >
                <div>
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      background: PALETTE.white,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: PALETTE.blue,
                    }}
                  >
                    <Activity size={18} />
                  </div>

                  <div
                    style={{
                      fontSize: 16.5,
                      fontWeight: 700,
                      color: PALETTE.blueDeep,
                      marginTop: 12,
                      marginBottom: 4,
                    }}
                  >
                    Recent activity
                  </div>

                  <div
                    style={{
                      fontSize: 12.5,
                      color: PALETTE.mutedText,
                      lineHeight: 1.5,
                    }}
                  >
                    See recent updates to your tasks and projects.
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <button
                    onClick={() => setView && setView("notifications")}
                    className="dash-link"
                  >
                    View activity →
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="dash-caption">
            Workspace figures are calculated from the available project and task records.
          </div>
        </section>
      )}
    </div>
  );
}
