import React, { useState, useMemo } from "react";
import {
  FolderKanban,
  Users,
  ListChecks,
  AlertCircle,
  Clock,
  ArrowRight,
  Megaphone,
  Calendar,
  Activity,
  CheckSquare,
  Square,
  LayoutGrid,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { ANNOUNCEMENTS, personIdsOf } from "../services/seeds";
import { todayStr } from "../services/storage";

// Color palette preserving current theme
const PALETTE = {
  saffron: "#F47B20",
  golden: "#F9B233",
  deepCharcoal: "#292524",
  cream: "#FFF9F2",
  white: "#FFFFFF",
  mutedText: "#6B625A",
  line: "#E8DFD3",
  lineSoft: "#F2EBE1",
  softTintCard: "#EEF0F8", // Soft tint for Needs Attention & Recent Activity
  warmBeigeCard: "#F2E8DC", // Warm beige tint for Overdue Tasks
  progressTrack: "rgba(255, 255, 255, 0.15)",
  progressBar: "rgba(255, 255, 255, 0.85)",
};

export default function Dashboard({ t, data, patch, notify, sessionUser, setView }) {
  const {
    projects = [],
    tasks = [],
    employees = [],
    volunteers = [],
    attendance = [],
    leaves = [],
    notifications = [],
  } = data || {};

  const today = todayStr();

  // Mode: "all" (both stacked), "org" (Organisation at a glance), "workspace" (Work overview)
  const [viewMode, setViewMode] = useState("all");

  // Calculations for Image 1: Organisation at a glance
  const totalProjects = projects.length;
  const activeProjects = projects.filter((p) => p.status === "Active").length;
  const delayedProjects = projects.filter((p) => p.status === "Delayed").length;
  const completedProjects = projects.filter((p) => p.status === "Completed").length;
  const planningProjects = projects.filter((p) => p.status === "Planning").length;

  const totalPeople = employees.length + volunteers.length;
  const employeesCount = employees.length;
  const volunteersCount = volunteers.length;

  const pendingTasks = tasks.filter((tk) => tk.status !== "Completed").length;
  const pendingLeaves = leaves.filter((l) => l.status === "Pending").length;
  const needsAttentionCount = delayedProjects + pendingLeaves;

  const todayAtt = attendance.filter((a) => a.date === today).length;

  // Calculations for Image 2: Work overview (Workspace)
  const userPersonIds = useMemo(() => personIdsOf(sessionUser), [sessionUser]);
  const myTasks = useMemo(() => {
    return tasks.filter((tk) => userPersonIds.includes(tk.assignee));
  }, [tasks, userPersonIds]);

  const openTasks = useMemo(() => {
    return myTasks.filter((tk) => tk.status !== "Completed");
  }, [myTasks]);

  const overdueTasks = useMemo(() => {
    return myTasks.filter(
      (tk) => tk.status === "Overdue" || (tk.due && tk.due < today && tk.status !== "Completed")
    );
  }, [myTasks, today]);

  // Tasks to display in "Your tasks" list
  const displayTasks = useMemo(() => {
    return (myTasks.length > 0 ? myTasks : tasks).slice(0, 4);
  }, [myTasks, tasks]);

  // Task completion toggle
  const toggleTask = (taskId) => {
    if (!patch) return;
    patch((d) => ({
      ...d,
      tasks: (d.tasks || []).map((tk) =>
        tk.id === taskId
          ? {
              ...tk,
              status: tk.status === "Completed" ? "In Progress" : "Completed",
            }
          : tk
      ),
    }));
    notify && notify("Task status updated");
  };

  // Helper to format due tag
  const getDueTag = (task) => {
    if (task.status === "Completed") {
      return { text: "Completed", color: PALETTE.golden };
    }
    if (task.status === "Overdue" || (task.due && task.due < today)) {
      return { text: "Overdue", color: "#C1553C" };
    }
    if (task.due === today) {
      return { text: "Due today", color: PALETTE.saffron };
    }
    return { text: `Due ${task.due || "this week"}`, color: PALETTE.mutedText };
  };

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "4px 0 32px 0" }}>
      <style>{`
        .dash-card {
          background: ${PALETTE.white};
          border: 1px solid ${PALETTE.line};
          border-radius: 12px;
          padding: 20px;
          box-sizing: border-box;
          transition: transform 0.12s ease, box-shadow 0.12s ease;
        }
        .dash-row-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
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
        .dash-link {
          background: none;
          border: none;
          color: ${PALETTE.deepCharcoal};
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 0;
          transition: color 0.15s ease;
        }
        .dash-link:hover {
          color: ${PALETTE.saffron};
        }
        .dash-task-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 13px 0;
          border-bottom: 1px solid ${PALETTE.lineSoft};
          transition: background 0.12s ease;
        }
        .dash-task-item:last-child {
          border-bottom: none;
        }
        .dash-update-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 13px 0;
          border-bottom: 1px solid ${PALETTE.lineSoft};
        }
        .dash-update-item:last-child {
          border-bottom: none;
        }
        .progress-bar-track {
          width: 100%;
          height: 6px;
          background: ${PALETTE.progressTrack};
          border-radius: 4px;
          overflow: hidden;
          margin-top: 5px;
        }
        .progress-bar-fill {
          height: 100%;
          border-radius: 4px;
          transition: width 0.3s ease;
        }
        @media (max-width: 768px) {
          .dash-row-3 {
            grid-template-columns: 1fr;
          }
          .dash-row-asym,
          .dash-row-main-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* View Switcher Controls (Header Bar) */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 6, background: PALETTE.cardSoftTint || "#F2EBE1", padding: 3, borderRadius: 8 }}>
          <button
            onClick={() => setViewMode("all")}
            style={{
              background: viewMode === "all" ? PALETTE.white : "transparent",
              color: viewMode === "all" ? PALETTE.deepCharcoal : PALETTE.mutedText,
              border: "none",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: viewMode === "all" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Overview & Workspace
          </button>
          <button
            onClick={() => setViewMode("org")}
            style={{
              background: viewMode === "org" ? PALETTE.white : "transparent",
              color: viewMode === "org" ? PALETTE.deepCharcoal : PALETTE.mutedText,
              border: "none",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: viewMode === "org" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Organisation
          </button>
          <button
            onClick={() => setViewMode("workspace")}
            style={{
              background: viewMode === "workspace" ? PALETTE.white : "transparent",
              color: viewMode === "workspace" ? PALETTE.deepCharcoal : PALETTE.mutedText,
              border: "none",
              borderRadius: 6,
              padding: "5px 12px",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              boxShadow: viewMode === "workspace" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Workspace
          </button>
        </div>

        <button
          onClick={() => setViewMode((m) => (m === "all" ? "workspace" : m === "workspace" ? "org" : "all"))}
          style={{
            background: PALETTE.white,
            border: `1px solid ${PALETTE.line}`,
            borderRadius: 8,
            width: 32,
            height: 32,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: PALETTE.deepCharcoal,
          }}
          title="Toggle view mode"
        >
          <LayoutGrid size={16} />
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECTION 1: ADMINISTRATION / OVERVIEW — Organisation at a glance (Image 1) */}
      {/* ========================================================================= */}
      {(viewMode === "all" || viewMode === "org") && (
        <div style={{ marginBottom: viewMode === "all" ? 36 : 0 }}>
          {/* Header */}
          <div style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 11,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontWeight: 600,
                color: PALETTE.mutedText,
                marginBottom: 4,
              }}
            >
              ADMINISTRATION / OVERVIEW
            </div>
            <h1
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 24,
                fontWeight: 700,
                color: PALETTE.deepCharcoal,
                margin: 0,
                letterSpacing: "-0.01em",
              }}
            >
              Organisation at a glance
            </h1>
            <div style={{ fontSize: 13.5, color: PALETTE.mutedText, marginTop: 4 }}>
              A quick overview of your people, work and operations.
            </div>
          </div>

          {/* Row 1: 3 Stat Cards */}
          <div className="dash-row-3">
            {/* Total Projects */}
            <div className="dash-card">
              <FolderKanban size={18} color={PALETTE.deepCharcoal} style={{ opacity: 0.8 }} />
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: PALETTE.mutedText,
                  marginTop: 12,
                  marginBottom: 6,
                }}
              >
                TOTAL PROJECTS
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: PALETTE.deepCharcoal,
                  lineHeight: 1.1,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {totalProjects}
              </div>
              <div style={{ fontSize: 12, color: PALETTE.mutedText, marginTop: 4 }}>
                {activeProjects} active · {delayedProjects} delayed
              </div>
            </div>

            {/* People */}
            <div className="dash-card">
              <Users size={18} color={PALETTE.deepCharcoal} style={{ opacity: 0.8 }} />
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: PALETTE.mutedText,
                  marginTop: 12,
                  marginBottom: 6,
                }}
              >
                PEOPLE
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: PALETTE.deepCharcoal,
                  lineHeight: 1.1,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {totalPeople}
              </div>
              <div style={{ fontSize: 12, color: PALETTE.mutedText, marginTop: 4 }}>
                {employeesCount} employees · {volunteersCount} volunteers
              </div>
            </div>

            {/* Tasks Pending */}
            <div className="dash-card">
              <ListChecks size={18} color={PALETTE.golden} />
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: PALETTE.mutedText,
                  marginTop: 12,
                  marginBottom: 6,
                }}
              >
                TASKS PENDING
              </div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  color: PALETTE.deepCharcoal,
                  lineHeight: 1.1,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {pendingTasks}
              </div>
              <div style={{ fontSize: 12, color: PALETTE.mutedText, marginTop: 4 }}>
                Across assigned work
              </div>
            </div>
          </div>

          {/* Row 2: Needs Attention (Soft Lavender/Tint) + Attendance Today (Dark Charcoal) */}
          <div className="dash-row-asym">
            {/* Needs Attention */}
            <div
              style={{
                background: PALETTE.softTintCard,
                borderRadius: 12,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 138,
                boxSizing: "border-box",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "#4A5568",
                  }}
                >
                  NEEDS ATTENTION
                </span>
                <AlertCircle size={16} color="#4A5568" />
              </div>

              <div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 22,
                    fontWeight: 700,
                    color: PALETTE.deepCharcoal,
                    marginTop: 8,
                    marginBottom: 4,
                  }}
                >
                  {needsAttentionCount} items
                </div>
                <div style={{ fontSize: 12.5, color: PALETTE.mutedText }}>
                  {delayedProjects} delayed project · {pendingLeaves} leave requests
                </div>
              </div>

              <div style={{ textAlign: "right", marginTop: 10 }}>
                <button
                  onClick={() => setView && setView("leave")}
                  className="dash-link"
                  style={{ color: "#4A5568" }}
                >
                  Review →
                </button>
              </div>
            </div>

            {/* Attendance Today */}
            <div
              style={{
                background: PALETTE.deepCharcoal,
                color: PALETTE.white,
                borderRadius: 12,
                padding: "20px 22px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 138,
                boxSizing: "border-box",
              }}
            >
              <div>
                <Clock size={16} color="rgba(255, 255, 255, 0.8)" />
                <div
                  style={{
                    fontSize: 11,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "rgba(255, 255, 255, 0.75)",
                    marginTop: 10,
                    marginBottom: 4,
                  }}
                >
                  ATTENDANCE TODAY
                </div>
                <div
                  style={{
                    fontFamily: "Inter, sans-serif",
                    fontSize: 28,
                    fontWeight: 700,
                    color: PALETTE.white,
                    lineHeight: 1.1,
                  }}
                >
                  {todayAtt}
                </div>
              </div>

              <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.7)" }}>
                Checked in
              </div>
            </div>
          </div>

          {/* Section 1 Caption */}
          <div style={{ fontSize: 11.5, color: PALETTE.mutedText, opacity: 0.8 }}>
            Concept only. Example values illustrate the layout; the live dashboard should calculate all figures from actual records.
          </div>
        </div>
      )}

      {/* Divider between sections if both shown */}
      {viewMode === "all" && (
        <div style={{ height: 1, background: PALETTE.line, margin: "28px 0" }} />
      )}

      {/* ========================================================================= */}
      {/* SECTION 2: YOUR WORKSPACE — Work overview (Image 2)                       */}
      {/* ========================================================================= */}
      {(viewMode === "all" || viewMode === "workspace") && (
        <div>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 18 }}>
            <div>
              <div
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: PALETTE.mutedText,
                  marginBottom: 4,
                }}
              >
                YOUR WORKSPACE
              </div>
              <h1
                style={{
                  fontFamily: "Inter, sans-serif",
                  fontSize: 24,
                  fontWeight: 700,
                  color: PALETTE.deepCharcoal,
                  margin: 0,
                  letterSpacing: "-0.01em",
                }}
              >
                Work overview
              </h1>
              <div style={{ fontSize: 13.5, color: PALETTE.mutedText, marginTop: 4 }}>
                Your tasks, projects and what&apos;s happening.
              </div>
            </div>

            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: PALETTE.deepCharcoal,
                color: PALETTE.white,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LayoutGrid size={16} />
            </div>
          </div>

          {/* Row 1: 3 Cards (Open tasks, Active projects, Overdue tasks) */}
          <div className="dash-row-3">
            {/* Open tasks */}
            <div className="dash-card">
              <ListChecks size={18} color={PALETTE.deepCharcoal} style={{ opacity: 0.8 }} />
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: PALETTE.deepCharcoal,
                  marginTop: 10,
                  marginBottom: 2,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {openTasks.length}
              </div>
              <div style={{ fontSize: 12.5, color: PALETTE.mutedText }}>
                Open tasks
              </div>
            </div>

            {/* Active projects */}
            <div className="dash-card">
              <FolderKanban size={18} color={PALETTE.deepCharcoal} style={{ opacity: 0.8 }} />
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: PALETTE.deepCharcoal,
                  marginTop: 10,
                  marginBottom: 2,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {activeProjects}
              </div>
              <div style={{ fontSize: 12.5, color: PALETTE.mutedText }}>
                Active projects
              </div>
            </div>

            {/* Overdue tasks (Warm Beige Tint) */}
            <div
              style={{
                background: PALETTE.warmBeigeCard,
                borderRadius: 12,
                padding: "20px",
                boxSizing: "border-box",
              }}
            >
              <Clock size={18} color={PALETTE.deepCharcoal} style={{ opacity: 0.75 }} />
              <div
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: PALETTE.deepCharcoal,
                  marginTop: 10,
                  marginBottom: 2,
                  fontFamily: "Inter, sans-serif",
                }}
              >
                {overdueTasks.length}
              </div>
              <div style={{ fontSize: 12.5, color: PALETTE.mutedText }}>
                Overdue tasks
              </div>
            </div>
          </div>

          {/* Row 2: 2 Columns Layout (~60% Left / ~40% Right) */}
          <div className="dash-row-main-2">
            {/* Left Column: Your tasks + Latest updates */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Your tasks Card */}
              <div className="dash-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 16.5, fontWeight: 700, color: PALETTE.deepCharcoal }}>
                    Your tasks
                  </div>
                  <button
                    onClick={() => setView && setView("tasks")}
                    className="dash-link"
                  >
                    View all →
                  </button>
                </div>

                <div>
                  {displayTasks.length === 0 ? (
                    <div style={{ fontSize: 13, color: PALETTE.mutedText, padding: "14px 0" }}>
                      No tasks assigned yet.
                    </div>
                  ) : (
                    displayTasks.map((tk) => {
                      const due = getDueTag(tk);
                      const isDone = tk.status === "Completed";
                      return (
                        <div key={tk.id} className="dash-task-item">
                          <button
                            onClick={() => toggleTask(tk.id)}
                            style={{
                              background: "none",
                              border: "none",
                              cursor: "pointer",
                              padding: 0,
                              color: isDone ? PALETTE.golden : PALETTE.mutedText,
                              display: "flex",
                              marginTop: 2,
                            }}
                          >
                            {isDone ? (
                              <CheckSquare size={17} color={PALETTE.golden} />
                            ) : (
                              <Square size={17} color={PALETTE.mutedText} />
                            )}
                          </button>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div
                              style={{
                                fontSize: 13.5,
                                fontWeight: 600,
                                color: isDone ? PALETTE.mutedText : PALETTE.deepCharcoal,
                                textDecoration: isDone ? "line-through" : "none",
                              }}
                            >
                              {tk.title}
                            </div>
                            <div style={{ fontSize: 11.5, color: due.color, marginTop: 2 }}>
                              {due.text}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Latest updates Card */}
              <div className="dash-card">
                <div style={{ fontSize: 16.5, fontWeight: 700, color: PALETTE.deepCharcoal, marginBottom: 12 }}>
                  Latest updates
                </div>

                <div>
                  {ANNOUNCEMENTS.map((a, idx) => {
                    const IconComp = idx % 2 === 0 ? Megaphone : Calendar;
                    return (
                      <div key={a.id} className="dash-update-item">
                        <IconComp size={16} color={PALETTE.deepCharcoal} style={{ flexShrink: 0, marginTop: 2 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 13.5, fontWeight: 600, color: PALETTE.deepCharcoal }}>
                            {a.title}
                          </div>
                          <div style={{ fontSize: 12, color: PALETTE.mutedText, marginTop: 2 }}>
                            Organisation news · {a.date}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div style={{ marginTop: 14 }}>
                  <button
                    onClick={() => setView && setView("notifications")}
                    className="dash-link"
                  >
                    All announcements →
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Project pulse + Recent activity */}
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Project pulse Card (Dark Charcoal) */}
              <div
                style={{
                  background: PALETTE.deepCharcoal,
                  color: PALETTE.white,
                  borderRadius: 12,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 240,
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: PALETTE.white }}>
                    Project pulse
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.7)", marginTop: 2, marginBottom: 18 }}>
                    Projects by current status
                  </div>

                  {/* Status Progress Bars */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {/* Active */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500 }}>
                        <span>Active</span>
                        <span style={{ fontWeight: 700 }}>{activeProjects}</span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${totalProjects ? (activeProjects / totalProjects) * 100 : 0}%`,
                            background: PALETTE.progressBar,
                          }}
                        />
                      </div>
                    </div>

                    {/* Completed */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500 }}>
                        <span>Completed</span>
                        <span style={{ fontWeight: 700 }}>{completedProjects}</span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${totalProjects ? (completedProjects / totalProjects) * 100 : 0}%`,
                            background: "rgba(255, 255, 255, 0.75)",
                          }}
                        />
                      </div>
                    </div>

                    {/* Planning */}
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 500 }}>
                        <span>Planning</span>
                        <span style={{ fontWeight: 700 }}>{planningProjects}</span>
                      </div>
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{
                            width: `${totalProjects ? (planningProjects / totalProjects) * 100 : 0}%`,
                            background: "rgba(249, 178, 51, 0.8)",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: 22 }}>
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
                      gap: 4,
                      padding: 0,
                    }}
                  >
                    Open projects →
                  </button>
                </div>
              </div>

              {/* Recent activity Card (Soft Lavender/Tint) */}
              <div
                style={{
                  background: PALETTE.softTintCard,
                  borderRadius: 12,
                  padding: "20px 22px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  minHeight: 160,
                  boxSizing: "border-box",
                }}
              >
                <div>
                  <Activity size={18} color="#4A5568" />
                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 16.5,
                      fontWeight: 700,
                      color: PALETTE.deepCharcoal,
                      marginTop: 10,
                      marginBottom: 4,
                    }}
                  >
                    Recent activity
                  </div>
                  <div style={{ fontSize: 12.5, color: PALETTE.mutedText, lineHeight: 1.45 }}>
                    See recent updates to your tasks and projects.
                  </div>
                </div>

                <div style={{ marginTop: 14 }}>
                  <button
                    onClick={() => setView && setView("notifications")}
                    className="dash-link"
                    style={{ color: "#4A5568" }}
                  >
                    View activity →
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2 Caption */}
          <div style={{ fontSize: 11.5, color: PALETTE.mutedText, opacity: 0.8 }}>
            Illustrative redesign — figures and tasks are examples, not verified live data.
          </div>
        </div>
      )}
    </div>
  );
}
