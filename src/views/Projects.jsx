
import React, { useState } from "react";
import {
  FolderKanban,
  CalendarDays,
  Users,
  MapPin,
  ListChecks,
  Paperclip,
  Pencil,
  Trash2,
  Plus,
  Check,
  Clock3,
  Search,
} from "lucide-react";

import {
  Card,
  StatusChip,
  Empty,
  Modal,
  ConfirmDialog,
  Btn,
  Field,
  inputStyle,
  SearchBox,
  Label,
} from "../components/Primitives";

import FileUpload from "../components/FileUpload";
import { ToolbarRow, iconBtnStyle, DetailRow } from "../components/shared";
import { CAN } from "../services/seeds";

export default function ProjectsView({
  t,
  data,
  patch,
  notify,
  pushNotification,
  sessionUser,
  employeeOf,
  personOf,
}) {
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);

  // Blue is the structural accent; orange is reserved for highlights.
  const blue = t.secondary || "#4659A8";
  const blueSoft = t.secondarySoft || "#EDECF5";
  const orange = t.primary || "#E87924";
  const orangeSoft = t.accentSoft || "#FFF0DF";
  const muted = t.inkSoft || "#707382";

  const canManage = CAN.manageProjects(sessionUser.role);

  const projects = data.projects || [];
  const tasksData = data.tasks || [];
  const employees = data.employees || [];
  const volunteers = data.volunteers || [];

  const list = projects.filter(
    (p) =>
      (statusF === "All" || p.status === statusF) &&
      (p.name || "").toLowerCase().includes(q.toLowerCase())
  );

  const getProgress = (value) =>
    Math.max(0, Math.min(Number(value) || 0, 100));

  const progressColor = (status) => {
    if (status === "Delayed") return t.coral;
    if (status === "Completed") return t.success;
    return blue;
  };

  const getStatusAccent = (status) => {
    if (status === "Delayed") return t.coral;
    if (status === "Completed") return t.success;
    if (status === "Planning") return orange;
    return blue;
  };

  // Save or update a project.
  const save = (proj) => {
    const isNew = !proj.id;
    const projectId = proj.id || `p${Date.now()}`;

    const savedProject = {
      ...proj,
      id: projectId,
      team: proj.team || [],
      documents: proj.documents || [],
      progress: Number(proj.progress) || 0,
      budget: Number(proj.budget) || 0,
      spent: Number(proj.spent) || 0,
    };

    patch((d) => {
      const existingProjects = d.projects || [];
      const existingProject = existingProjects.find(
        (p) => p.id === projectId
      );

      const updatedProjects = existingProject
        ? existingProjects.map((p) =>
            p.id === projectId ? savedProject : p
          )
        : [...existingProjects, savedProject];

      const updatedVolunteers = (d.volunteers || []).map((v) => {
        const wasAssignedToThisProject =
          existingProject && v.assigned === projectId;

        if (savedProject.team.includes(v.id)) {
          return { ...v, assigned: projectId };
        }

        if (wasAssignedToThisProject) {
          return { ...v, assigned: null };
        }

        return v;
      });

      return {
        ...d,
        projects: updatedProjects,
        volunteers: updatedVolunteers,
      };
    });

    if (isNew && pushNotification) {
      pushNotification({
        title: "Project created",
        body: `${savedProject.name} has been added.`,
        kind: "project",
      });
    }

    notify(isNew ? "Project created" : "Project updated");

    if (detail?.id === projectId) {
      setDetail(savedProject);
    }

    setEditing(null);
  };

  // Delete a project and its related tasks.
  const remove = (id) => {
    patch((d) => ({
      ...d,
      projects: (d.projects || []).filter((p) => p.id !== id),
      tasks: (d.tasks || []).filter((tk) => tk.project !== id),
      volunteers: (d.volunteers || []).map((v) => ({
        ...v,
        assigned: v.assigned === id ? null : v.assigned,
      })),
    }));

    notify("Project deleted");
    setConfirmDel(null);
    setDetail(null);
  };

  const sectionLabel = {
    fontSize: 10,
    fontWeight: 750,
    letterSpacing: "0.075em",
    color: muted,
    marginBottom: 5,
  };

  const metaValue = {
    fontSize: 12.5,
    fontWeight: 600,
    color: t.ink,
    lineHeight: 1.5,
    overflowWrap: "anywhere",
  };

  const actionButton = {
    width: 34,
    height: 34,
    display: "grid",
    placeItems: "center",
    borderRadius: 9,
    border: `1px solid ${t.line}`,
    background: t.surface,
    color: muted,
    cursor: "pointer",
    transition: "background 150ms ease, border-color 150ms ease",
  };

  return (
    <div
      style={{
        width: "100%",
        minWidth: 0,
        color: t.ink,
        paddingBottom: 24,
      }}
    >
      {/* Page heading */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 22,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: blue,
              fontSize: 10.5,
              fontWeight: 750,
              letterSpacing: "0.11em",
              marginBottom: 7,
            }}
          >
            <FolderKanban size={15} />
            WORKSPACE
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 27,
              lineHeight: 1.25,
              fontWeight: 750,
              letterSpacing: "-0.04em",
              color: t.ink,
            }}
          >
            Projects
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: 13,
              lineHeight: 1.65,
              color: muted,
            }}
          >
            Track project progress, coordinate teams and manage deliverables.
          </p>
        </div>

        {canManage && (
          <Btn
            t={t}
            variant="accent"
            icon={Plus}
            onClick={() => setEditing({})}
          >
            New project
          </Btn>
        )}
      </header>

      {/* Search and filters */}
      <section
        style={{
          background: t.surface,
          border: `1px solid ${t.line}`,
          borderRadius: 13,
          padding: 14,
          marginBottom: 18,
          boxShadow: "0 2px 8px rgba(40, 45, 70, 0.025)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 10,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 700,
              color: t.ink,
            }}
          >
            <Search size={16} color={blue} />
            Find a project
          </div>

          <span
            style={{
              fontSize: 11.5,
              color: muted,
              background: blueSoft,
              padding: "5px 9px",
              borderRadius: 20,
              fontWeight: 600,
            }}
          >
            {list.length} {list.length === 1 ? "project" : "projects"}
          </span>
        </div>

        <ToolbarRow t={t}>
          <SearchBox
            t={t}
            value={q}
            onChange={setQ}
            placeholder="Search projects..."
          />

          <select
            aria-label="Filter projects by status"
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            style={{
              ...inputStyle(t),
              width: "auto",
              minWidth: 145,
              maxWidth: "100%",
            }}
          >
            {["All", "Planning", "Active", "Delayed", "Completed"].map(
              (status) => (
                <option key={status} value={status}>
                  {status === "All" ? "All statuses" : status}
                </option>
              )
            )}
          </select>

          {(q || statusF !== "All") && (
            <button
              type="button"
              onClick={() => {
                setQ("");
                setStatusF("All");
              }}
              style={{
                ...actionButton,
                width: "auto",
                padding: "0 11px",
                display: "flex",
                gap: 6,
                fontSize: 12,
              }}
            >
              Clear filters
            </button>
          )}
        </ToolbarRow>
      </section>

      {/* List heading */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 15,
              fontWeight: 750,
              color: t.ink,
            }}
          >
            Project directory
          </h2>
          <p
            style={{
              margin: "4px 0 0",
              color: muted,
              fontSize: 11.5,
            }}
          >
            Select a project to see its details and team.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            color: blue,
            fontSize: 11.5,
            fontWeight: 650,
          }}
        >
          <FolderKanban size={14} />
          {projects.length} total
        </div>
      </div>

      {/* Project cards */}
      {list.length === 0 ? (
        <Empty
          t={t}
          icon={FolderKanban}
          title="No projects found"
          hint={
            q || statusF !== "All"
              ? "Try changing your search or status filter."
              : "Create a project to start tracking work."
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 350px), 1fr))",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          {list.map((p) => {
            const coord =
              employeeOf(p.coordinator) || personOf(p.coordinator);

            const projectTasks = tasksData.filter(
              (task) => task.project === p.id
            );

            const progress = getProgress(p.progress);
            const statusColor = getStatusAccent(p.status);

            return (
              <Card
                key={p.id}
                t={t}
                style={{
                  padding: 0,
                  overflow: "hidden",
                  minWidth: 0,
                  border: `1px solid ${t.line}`,
                  borderRadius: 13,
                  boxShadow: "0 3px 12px rgba(40, 45, 70, 0.035)",
                  transition: "transform 160ms ease, box-shadow 160ms ease",
                }}
              >
                {/* Subtle status marker */}
                <div
                  style={{
                    height: 3,
                    background: statusColor,
                    opacity: p.status === "Planning" ? 0.75 : 1,
                  }}
                />

                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => setDetail(p)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setDetail(p);
                    }
                  }}
                  style={{
                    padding: "17px 17px 15px",
                    cursor: "pointer",
                    outlineOffset: -3,
                  }}
                >
                  {/* Title and status */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 7,
                        }}
                      >
                        <span
                          style={{
                            width: 29,
                            height: 29,
                            flexShrink: 0,
                            display: "grid",
                            placeItems: "center",
                            borderRadius: 8,
                            color: blue,
                            background: blueSoft,
                          }}
                        >
                          <FolderKanban size={15} />
                        </span>

                        <h3
                          style={{
                            margin: 0,
                            fontSize: 14.5,
                            lineHeight: 1.4,
                            fontWeight: 750,
                            color: t.ink,
                            overflowWrap: "anywhere",
                          }}
                        >
                          {p.name}
                        </h3>
                      </div>

                      <p
                        style={{
                          margin: 0,
                          fontSize: 12,
                          lineHeight: 1.65,
                          color: muted,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          minHeight: 39,
                        }}
                      >
                        {p.desc || "No description added yet."}
                      </p>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <StatusChip status={p.status} t={t} />
                    </div>
                  </div>

                  {/* Progress */}
                  <div
                    style={{
                      marginTop: 17,
                      padding: 12,
                      borderRadius: 10,
                      background: t.canvas,
                      border: `1px solid ${t.line}`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 10,
                        marginBottom: 9,
                      }}
                    >
                      <span
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontSize: 11.5,
                          color: muted,
                          fontWeight: 600,
                        }}
                      >
                        <Clock3 size={13} color={blue} />
                        Project progress
                      </span>

                      <span
                        style={{
                          fontFamily: "IBM Plex Mono, monospace",
                          fontSize: 12,
                          fontWeight: 700,
                          color: progress === 100 ? t.success : blue,
                        }}
                      >
                        {progress}%
                      </span>
                    </div>

                    <div
                      style={{
                        height: 6,
                        background: t.line,
                        borderRadius: 20,
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          background: progressColor(p.status),
                          borderRadius: 20,
                          transition: "width 250ms ease",
                        }}
                      />
                    </div>
                  </div>

                  {/* Project metadata */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                      gap: "15px 12px",
                      paddingTop: 16,
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={sectionLabel}>COORDINATOR</div>
                      <div style={metaValue}>
                        {coord?.name || "Unassigned"}
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={sectionLabel}>TEAM</div>
                      <div style={metaValue}>
                        <Users
                          size={13}
                          style={{
                            display: "inline",
                            verticalAlign: "-2px",
                            marginRight: 4,
                            color: blue,
                          }}
                        />
                        {(p.team || []).length} members
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={sectionLabel}>TIMELINE</div>
                      <div
                        style={{
                          ...metaValue,
                          fontSize: 11.5,
                          fontWeight: 500,
                        }}
                      >
                        {p.start || "—"} → {p.end || "—"}
                      </div>
                    </div>

                    <div style={{ minWidth: 0 }}>
                      <div style={sectionLabel}>TASKS</div>
                      <div style={metaValue}>
                        <ListChecks
                          size={13}
                          style={{
                            display: "inline",
                            verticalAlign: "-2px",
                            marginRight: 4,
                            color: blue,
                          }}
                        />
                        {projectTasks.length} tasks
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card actions */}
                {canManage && (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 10,
                      padding: "10px 15px",
                      borderTop: `1px solid ${t.line}`,
                      background: t.canvas,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: muted,
                      }}
                    >
                      Project actions
                    </span>

                    <div style={{ display: "flex", gap: 7 }}>
                      <button
                        type="button"
                        onClick={() => setEditing(p)}
                        style={{
                          ...actionButton,
                          color: blue,
                          borderColor: `${blue}45`,
                        }}
                        title="Edit project"
                        aria-label={`Edit ${p.name}`}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDel(p.id)}
                        style={{
                          ...actionButton,
                          color: t.coral,
                        }}
                        title="Delete project"
                        aria-label={`Delete ${p.name}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Create/edit form */}
      {editing !== null && (
        <ProjectForm
          t={t}
          project={editing}
          employees={employees}
          volunteers={volunteers}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Project details */}
      {detail && (
        <Modal
          t={t}
          title={detail.name}
          wide
          onClose={() => setDetail(null)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 15,
            }}
          >
            <span
              style={{
                width: 38,
                height: 38,
                display: "grid",
                placeItems: "center",
                borderRadius: 10,
                background: blueSoft,
                color: blue,
                flexShrink: 0,
              }}
            >
              <FolderKanban size={19} />
            </span>

            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 11,
                  color: muted,
                  marginBottom: 4,
                }}
              >
                PROJECT OVERVIEW
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.65,
                  color: t.ink,
                }}
              >
                {detail.desc || "No description added for this project."}
              </div>
            </div>
          </div>

          {/* Status and completion */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
              gap: 11,
              marginBottom: 15,
            }}
          >
            <div
              style={{
                padding: 13,
                border: `1px solid ${t.line}`,
                borderRadius: 10,
                background: t.surface,
              }}
            >
              <div style={sectionLabel}>CURRENT STATUS</div>
              <StatusChip status={detail.status} t={t} />
            </div>

            <div
              style={{
                padding: 13,
                border: `1px solid ${t.line}`,
                borderRadius: 10,
                background: t.surface,
              }}
            >
              <div style={sectionLabel}>COMPLETION</div>
              <div
                style={{
                  fontSize: 23,
                  lineHeight: 1.2,
                  fontWeight: 750,
                  color: progressColor(detail.status),
                }}
              >
                {getProgress(detail.progress)}%
              </div>
            </div>
          </div>

          <div
            style={{
              height: 7,
              background: t.line,
              borderRadius: 20,
              overflow: "hidden",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                width: `${getProgress(detail.progress)}%`,
                height: "100%",
                background: progressColor(detail.status),
                borderRadius: 20,
              }}
            />
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: "0.075em",
              color: muted,
              marginBottom: 9,
            }}
          >
            PROJECT INFORMATION
          </div>

          <DetailRow
            t={t}
            icon={CalendarDays}
            label="Timeline"
            value={`${detail.start || "—"} → ${detail.end || "—"}`}
          />

          <DetailRow
            t={t}
            icon={Users}
            label="Coordinator"
            value={
              (
                employeeOf(detail.coordinator) ||
                personOf(detail.coordinator)
              )?.name || "Unassigned"
            }
          />

          <DetailRow
            t={t}
            icon={MapPin}
            label="Budget"
            value={`$${(detail.spent || 0).toLocaleString()} of $${(
              detail.budget || 0
            ).toLocaleString()} spent`}
          />

          <div style={{ marginTop: 20 }}>
            <Label t={t}>
              Team members ({(detail.team || []).length})
            </Label>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 7,
                marginTop: 9,
              }}
            >
              {(detail.team || []).length === 0 ? (
                <span style={{ fontSize: 12, color: muted }}>
                  No team members assigned yet.
                </span>
              ) : (
                detail.team.map((id) => {
                  const person = personOf(id);

                  return person ? (
                    <span
                      key={id}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 12,
                        color: t.ink,
                        background: blueSoft,
                        border: `1px solid ${t.line}`,
                        padding: "7px 10px",
                        borderRadius: 8,
                      }}
                    >
                      <Users size={12} color={blue} />
                      {person.name}
                    </span>
                  ) : null;
                })
              )}
            </div>
          </div>

          {/* Attached documents */}
          {(detail.documents || []).length > 0 && (
            <div style={{ marginTop: 21 }}>
              <Label t={t}>Project documents</Label>

              <div style={{ marginTop: 8 }}>
                {detail.documents.map((document) => (
                  <div
                    key={document.name}
                    style={{
                      display: "flex",
                      gap: 10,
                      alignItems: "center",
                      padding: "11px 12px",
                      marginBottom: 7,
                      border: `1px solid ${t.line}`,
                      borderRadius: 9,
                      background: t.canvas,
                      fontSize: 12.5,
                    }}
                  >
                    <Paperclip size={15} color={blue} />

                    <a
                      href={document.data}
                      download={document.name}
                      style={{
                        color: blue,
                        textDecoration: "none",
                        overflowWrap: "anywhere",
                        fontWeight: 600,
                      }}
                    >
                      {document.name}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related task count */}
          <div style={{ marginTop: 18 }}>
            <DetailRow
              t={t}
              icon={ListChecks}
              label="Related tasks"
              value={
                tasksData.filter((task) => task.project === detail.id).length
              }
            />
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirmDel && (
        <ConfirmDialog
          t={t}
          text="Delete this project and all its tasks? This cannot be undone."
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => remove(confirmDel)}
        />
      )}
    </div>
  );
}

function ProjectForm({
  t,
  project,
  employees,
  volunteers,
  onSave,
  onClose,
}) {
  const blue = t.secondary || "#4659A8";
  const blueSoft = t.secondarySoft || "#EDECF5";
  const muted = t.inkSoft || "#707382";

  const teamOptions = [...employees, ...volunteers];

  const [f, setF] = useState({
    name: "",
    desc: "",
    status: "Planning",
    coordinator: employees[0]?.id || "",
    team: [],
    start: "",
    end: "",
    progress: 0,
    budget: 0,
    spent: 0,
    documents: [],
    ...project,
  });

  const [err, setErr] = useState("");

  const upd = (key, value) => {
    setF((previous) => ({ ...previous, [key]: value }));
    setErr("");
  };

  const toggleTeam = (id) => {
    const currentTeam = Array.isArray(f.team) ? f.team : [];

    upd(
      "team",
      currentTeam.includes(id)
        ? currentTeam.filter((memberId) => memberId !== id)
        : [...currentTeam, id]
    );
  };

  const submit = () => {
    if (!f.name.trim()) {
      setErr("Project name is required.");
      return;
    }

    if (!f.start || !f.end) {
      setErr("Start and end dates are required.");
      return;
    }

    if (f.end < f.start) {
      setErr("End date cannot be before the start date.");
      return;
    }

    if (
      !Number.isFinite(Number(f.progress)) ||
      Number(f.progress) < 0 ||
      Number(f.progress) > 100
    ) {
      setErr("Progress must be between 0 and 100.");
      return;
    }

    if (
      !Number.isFinite(Number(f.budget)) ||
      !Number.isFinite(Number(f.spent)) ||
      Number(f.budget) < 0 ||
      Number(f.spent) < 0
    ) {
      setErr("Budget and spend cannot be negative.");
      return;
    }

    if (Number(f.spent) > Number(f.budget)) {
      setErr("Spent amount cannot exceed the total budget.");
      return;
    }

    onSave({
      ...f,
      name: f.name.trim(),
      progress: Number(f.progress),
      budget: Number(f.budget),
      spent: Number(f.spent),
      team: Array.isArray(f.team) ? f.team : [],
      documents: Array.isArray(f.documents) ? f.documents : [],
    });
  };

  const fieldStyle = {
    ...inputStyle(t),
    width: "100%",
    boxSizing: "border-box",
  };

  const subsectionStyle = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 10.5,
    fontWeight: 750,
    letterSpacing: "0.085em",
    color: blue,
    marginTop: 20,
    marginBottom: 12,
    paddingBottom: 8,
    borderBottom: `1px solid ${t.line}`,
  };

  return (
    <Modal
      t={t}
      title={project?.id ? "Edit project" : "Create a project"}
      wide
      onClose={onClose}
    >
      <p
        style={{
          margin: "-4px 0 19px",
          color: muted,
          fontSize: 12.5,
          lineHeight: 1.65,
        }}
      >
        Add the project details, set a timeline and assign your team.
      </p>

      {/* Basic information */}
      <div style={subsectionStyle}>
        <FolderKanban size={14} />
        BASIC INFORMATION
      </div>

      <Field t={t} label="Project name">
        <input
          style={fieldStyle}
          value={f.name}
          onChange={(e) => upd("name", e.target.value)}
          placeholder="Enter project name"
          autoFocus
        />
      </Field>

      <Field t={t} label="Description">
        <textarea
          rows={3}
          style={{
            ...fieldStyle,
            resize: "vertical",
            lineHeight: 1.6,
          }}
          value={f.desc}
          onChange={(e) => upd("desc", e.target.value)}
          placeholder="Describe the project goals and deliverables..."
        />
      </Field>

      {/* Schedule and ownership */}
      <div style={subsectionStyle}>
        <CalendarDays size={14} />
        SCHEDULE & OWNERSHIP
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
          gap: "0 14px",
        }}
      >
        <Field t={t} label="Start date">
          <input
            type="date"
            style={fieldStyle}
            value={f.start}
            onChange={(e) => upd("start", e.target.value)}
          />
        </Field>

        <Field t={t} label="End date">
          <input
            type="date"
            min={f.start || undefined}
            style={fieldStyle}
            value={f.end}
            onChange={(e) => upd("end", e.target.value)}
          />
        </Field>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
          gap: "0 14px",
        }}
      >
        <Field t={t} label="Project status">
          <select
            style={fieldStyle}
            value={f.status}
            onChange={(e) => upd("status", e.target.value)}
          >
            <option>Planning</option>
            <option>Active</option>
            <option>Delayed</option>
            <option>Completed</option>
          </select>
        </Field>

        <Field t={t} label="Coordinator">
          <select
            style={fieldStyle}
            value={f.coordinator || ""}
            onChange={(e) => upd("coordinator", e.target.value)}
          >
            <option value="">Unassigned</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name}
              </option>
            ))}
          </select>
        </Field>
      </div>

      {/* Progress and budget */}
      <div style={subsectionStyle}>
        <ListChecks size={14} />
        PROGRESS & BUDGET
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 210px), 1fr))",
          gap: "0 14px",
        }}
      >
        <Field t={t} label="Progress (%)">
          <input
            type="number"
            min={0}
            max={100}
            style={fieldStyle}
            value={f.progress}
            onChange={(e) => upd("progress", e.target.value)}
          />
        </Field>

        <Field t={t} label="Total budget ($)">
          <input
            type="number"
            min={0}
            style={fieldStyle}
            value={f.budget}
            onChange={(e) => upd("budget", e.target.value)}
          />
        </Field>
      </div>

      <Field t={t} label="Amount spent ($)">
        <input
          type="number"
          min={0}
          style={fieldStyle}
          value={f.spent}
          onChange={(e) => upd("spent", e.target.value)}
        />
      </Field>

      {/* Team and documents */}
      <div style={subsectionStyle}>
        <Users size={14} />
        TEAM & DOCUMENTS
      </div>

      <Field t={t} label="Team members">
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            maxHeight: 175,
            overflowY: "auto",
            padding: 2,
          }}
        >
          {teamOptions.length === 0 ? (
            <span style={{ fontSize: 12, color: muted }}>
              No employees or volunteers available.
            </span>
          ) : (
            teamOptions.map((member) => {
              const selected = (f.team || []).includes(member.id);

              return (
                <button
                  type="button"
                  key={member.id}
                  onClick={() => toggleTeam(member.id)}
                  aria-pressed={selected}
                  style={{
                    fontSize: 11.5,
                    padding: "8px 11px",
                    borderRadius: 8,
                    border: `1px solid ${selected ? blue : t.line}`,
                    background: selected ? blueSoft : t.surface,
                    color: selected ? blue : t.ink,
                    fontWeight: selected ? 650 : 450,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    transition: "background 150ms ease, border-color 150ms ease",
                  }}
                >
                  {selected && <Check size={12} />}
                  {member.name}
                </button>
              );
            })
          )}
        </div>
      </Field>

      <Field t={t} label="Attach a document (optional)">
        <FileUpload
          t={t}
          label="Upload document"
          onUpload={(file) =>
            upd(
              "documents",
              file
                ? [...(f.documents || []), file]
                : f.documents || []
            )
          }
        />
      </Field>

      {/* Validation error */}
      {err && (
        <div
          role="alert"
          style={{
            color: t.coral,
            fontSize: 12.5,
            padding: "10px 12px",
            borderRadius: 8,
            border: `1px solid ${t.coral}40`,
            background: `${t.coral}12`,
            marginTop: 10,
            lineHeight: 1.5,
          }}
        >
          {err}
        </div>
      )}

      {/* Form actions */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 9,
          justifyContent: "flex-end",
          marginTop: 22,
          paddingTop: 15,
          borderTop: `1px solid ${t.line}`,
        }}
      >
        <Btn t={t} variant="ghost" onClick={onClose}>
          Cancel
        </Btn>

        <Btn t={t} variant="accent" icon={Check} onClick={submit}>
          {project?.id ? "Save changes" : "Create project"}
        </Btn>
      </div>
    </Modal>
  );
}
