
import React, { useState } from "react";
import {
  HeartHandshake,
  Pencil,
  Trash2,
  Plus,
  Check,
  Mail,
  Phone,
  FolderKanban,
  Search,
  Clock3,
  Users,
  UserCheck,
  UserX,
  CalendarDays,
  X,
} from "lucide-react";

import {
  Card,
  Avatar,
  StatusChip,
  Empty,
  Modal,
  ConfirmDialog,
  Btn,
  Field,
  inputStyle,
  SearchBox,
} from "../components/Primitives";

import { DetailRow } from "../components/shared";

export default function VolunteersView({ t, data, patch, notify }) {
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);

  const volunteers = data?.volunteers || [];
  const projects = data?.projects || [];

  // Blue is the main secondary colour; orange is reserved for highlights.
  const blue = t.secondary || "#4659A8";
  const blueSoft = t.secondarySoft || "#EDECF5";
  const orange = t.accent || "#E87924";
  const subtle = t.inkSoft || "#707382";

  const activeCount = volunteers.filter(
    (v) => v.status === "Active"
  ).length;

  const inactiveCount = volunteers.filter(
    (v) => v.status === "Inactive"
  ).length;

  const list = volunteers.filter((v) => {
    const name = (v.name || "").toLowerCase();
    const skills = Array.isArray(v.skills)
      ? v.skills.join(" ").toLowerCase()
      : "";

    const queryMatch =
      name.includes(q.toLowerCase()) ||
      skills.includes(q.toLowerCase());

    const statusMatch =
      statusF === "All" || v.status === statusF;

    return queryMatch && statusMatch;
  });

  const getInitials = (name = "") =>
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?";

  const getProject = (projectId) =>
    projects.find((p) => p.id === projectId);

  const save = (vol) => {
    patch((d) => {
      const currentVolunteers = d.volunteers || [];
      const currentProjects = d.projects || [];

      const exists = currentVolunteers.some(
        (v) => v.id === vol.id
      );

      const savedVolunteer = exists
        ? vol
        : {
            ...vol,
            id: "v" + Date.now(),
            hours: Number(vol.hours) || 0,
          };

      const updatedVolunteers = exists
        ? currentVolunteers.map((v) =>
            v.id === vol.id ? savedVolunteer : v
          )
        : [...currentVolunteers, savedVolunteer];

      // Keep project team assignments in sync.
      const previousVolunteer = currentVolunteers.find(
        (v) => v.id === vol.id
      );

      const previousProject = previousVolunteer?.assigned || null;
      const nextProject = vol.assigned || null;

      const updatedProjects =
        previousProject !== nextProject
          ? currentProjects.map((project) => {
              let team = Array.isArray(project.team)
                ? project.team
                : [];

              if (project.id === previousProject) {
                team = team.filter((id) => id !== vol.id);
              }

              if (
                project.id === nextProject &&
                !team.includes(vol.id)
              ) {
                team = [...team, vol.id];
              }

              return { ...project, team };
            })
          : currentProjects;

      return {
        ...d,
        volunteers: updatedVolunteers,
        projects: updatedProjects,
      };
    });

    notify(editing?.id ? "Volunteer updated" : "Volunteer registered");
    setEditing(null);
  };

  const remove = (id) => {
    patch((d) => ({
      ...d,
      volunteers: (d.volunteers || []).filter((v) => v.id !== id),

      projects: (d.projects || []).map((p) => ({
        ...p,
        team: (p.team || []).filter((memberId) => memberId !== id),
      })),

      tasks: (d.tasks || []).filter(
        (task) => task.assignee !== id
      ),

      worklogs: (d.worklogs || []).filter(
        (worklog) => worklog.user !== id
      ),
    }));

    notify("Volunteer removed");
    setConfirmDel(null);
    setDetail(null);
  };

  const resetFilters = () => {
    setQ("");
    setStatusF("All");
  };

  const statCardStyle = {
    background: t.surface,
    border: `1px solid ${t.line}`,
    borderRadius: 12,
    padding: "16px 17px",
    minWidth: 0,
  };

  const iconBoxStyle = {
    width: 38,
    height: 38,
    borderRadius: 10,
    background: blueSoft,
    color: blue,
    display: "grid",
    placeItems: "center",
    flexShrink: 0,
  };

  const sectionLabelStyle = {
    color: subtle,
    fontSize: 12,
    fontWeight: 500,
    lineHeight: 1.5,
  };

  const cardButtonStyle = {
    width: 34,
    height: 34,
    display: "grid",
    placeItems: "center",
    borderRadius: 8,
    border: `1px solid ${t.line}`,
    background: t.surface,
    color: blue,
    cursor: "pointer",
    flexShrink: 0,
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
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
          marginBottom: 23,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: blue,
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: "0.1em",
              marginBottom: 7,
            }}
          >
            <HeartHandshake size={15} />
            PEOPLE &amp; COMMUNITY
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 27,
              lineHeight: 1.25,
              fontWeight: 720,
              letterSpacing: "-0.035em",
              color: t.ink,
            }}
          >
            Volunteers
          </h1>

          <p
            style={{
              margin: "7px 0 0",
              fontSize: 13.5,
              lineHeight: 1.6,
              color: subtle,
            }}
          >
            Manage volunteer profiles, skills and project assignments.
          </p>
        </div>

        <Btn
          t={t}
          variant="accent"
          icon={Plus}
          onClick={() => setEditing({})}
        >
          Register volunteer
        </Btn>
      </header>

      {/* Summary cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
          marginBottom: 22,
        }}
      >
        <div style={statCardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span style={sectionLabelStyle}>Total volunteers</span>
            <div style={iconBoxStyle}>
              <Users size={18} />
            </div>
          </div>

          <div
            style={{
              fontSize: 27,
              fontWeight: 720,
              letterSpacing: "-0.04em",
              marginTop: 10,
              color: t.ink,
            }}
          >
            {volunteers.length}
          </div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span style={sectionLabelStyle}>Active</span>
            <div
              style={{
                ...iconBoxStyle,
                background: `${t.success}18`,
                color: t.success,
              }}
            >
              <UserCheck size={18} />
            </div>
          </div>

          <div
            style={{
              fontSize: 27,
              fontWeight: 720,
              letterSpacing: "-0.04em",
              marginTop: 10,
              color: t.ink,
            }}
          >
            {activeCount}
          </div>
        </div>

        <div style={statCardStyle}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 10,
            }}
          >
            <span style={sectionLabelStyle}>Inactive</span>
            <div
              style={{
                ...iconBoxStyle,
                background: t.canvas,
                color: subtle,
              }}
            >
              <UserX size={18} />
            </div>
          </div>

          <div
            style={{
              fontSize: 27,
              fontWeight: 720,
              letterSpacing: "-0.04em",
              marginTop: 10,
              color: t.ink,
            }}
          >
            {inactiveCount}
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <section
        style={{
          background: t.surface,
          border: `1px solid ${t.line}`,
          borderRadius: 12,
          padding: 15,
          marginBottom: 19,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              color: t.ink,
              fontSize: 13,
              fontWeight: 650,
            }}
          >
            <Search size={16} color={blue} />
            Find volunteers
          </div>

          <span style={{ fontSize: 12, color: subtle }}>
            {list.length} {list.length === 1 ? "result" : "results"}
          </span>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
            marginTop: 13,
          }}
        >
          <div style={{ flex: "1 1 260px", minWidth: 0 }}>
            <SearchBox
              t={t}
              value={q}
              onChange={setQ}
              placeholder="Search by name or skill..."
            />
          </div>

          <select
            aria-label="Filter volunteers by status"
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            style={{
              ...inputStyle(t),
              width: "auto",
              minWidth: 145,
              maxWidth: "100%",
              boxSizing: "border-box",
            }}
          >
            <option value="All">All statuses</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>

          {(q || statusF !== "All") && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 11px",
                border: `1px solid ${t.line}`,
                borderRadius: 8,
                background: t.canvas,
                color: t.inkSoft,
                fontSize: 12,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              <X size={14} />
              Clear
            </button>
          )}
        </div>
      </section>

      {/* Volunteer directory */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 12,
        }}
      >
        <h2
          style={{
            fontSize: 15,
            fontWeight: 700,
            margin: 0,
            color: t.ink,
          }}
        >
          Volunteer directory
        </h2>

        <span style={{ fontSize: 12, color: subtle }}>
          Select a profile to view details
        </span>
      </div>

      {list.length === 0 ? (
        <Empty
          t={t}
          icon={HeartHandshake}
          title="No volunteers found"
          hint={
            q || statusF !== "All"
              ? "Try changing your search or status filter."
              : "Register a volunteer to get started."
          }
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fill, minmax(min(100%, 285px), 1fr))",
            gap: 14,
            alignItems: "stretch",
          }}
        >
          {list.map((v) => {
            const project = getProject(v.assigned);
            const skills = Array.isArray(v.skills) ? v.skills : [];
            const hours = Number(v.hours) || 0;

            return (
              <Card
                key={v.id}
                t={t}
                style={{
                  padding: 0,
                  overflow: "hidden",
                  minWidth: 0,
                  borderColor: t.line,
                  transition: "border-color 160ms ease",
                }}
              >
                {/* Subtle blue strip, with occasional orange highlights */}
                <div
                  style={{
                    height: 3,
                    background: v.status === "Active" ? blue : t.line,
                  }}
                />

                <div style={{ padding: 17 }}>
                  {/* Identity */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 11,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setDetail(v)}
                      aria-label={`View ${v.name}'s profile`}
                      style={{
                        padding: 0,
                        border: 0,
                        background: "transparent",
                        cursor: "pointer",
                        flexShrink: 0,
                      }}
                    >
                      <Avatar
                        initials={getInitials(v.name)}
                        t={t}
                        size={43}
                      />
                    </button>

                    <div
                      style={{
                        flex: 1,
                        minWidth: 0,
                        paddingTop: 1,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setDetail(v)}
                        style={{
                          display: "block",
                          padding: 0,
                          border: 0,
                          background: "transparent",
                          color: t.ink,
                          fontSize: 14,
                          fontWeight: 700,
                          lineHeight: 1.4,
                          textAlign: "left",
                          cursor: "pointer",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {v.name}
                      </button>

                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 12,
                          color: subtle,
                          lineHeight: 1.4,
                        }}
                      >
                        {v.availability || "Availability not set"}
                      </div>
                    </div>

                    <div style={{ flexShrink: 0 }}>
                      <StatusChip status={v.status} t={t} />
                    </div>
                  </div>

                  {/* Skills */}
                  <div style={{ marginTop: 19, minHeight: 62 }}>
                    <div
                      style={{
                        fontSize: 10.5,
                        color: subtle,
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.07em",
                        marginBottom: 8,
                      }}
                    >
                      Skills
                    </div>

                    {skills.length > 0 ? (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          alignItems: "flex-start",
                          gap: 6,
                        }}
                      >
                        {skills.slice(0, 4).map((skill, index) => (
                          <span
                            key={`${skill}-${index}`}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              maxWidth: "100%",
                              fontSize: 11,
                              lineHeight: 1.4,
                              background: blueSoft,
                              color: blue,
                              padding: "5px 9px",
                              borderRadius: 6,
                              overflowWrap: "anywhere",
                            }}
                          >
                            {skill}
                          </span>
                        ))}

                        {skills.length > 4 && (
                          <span
                            style={{
                              fontSize: 11,
                              color: subtle,
                              padding: "5px 2px",
                            }}
                          >
                            +{skills.length - 4} more
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: subtle }}>
                        No skills added
                      </span>
                    )}
                  </div>

                  {/* Project assignment */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 9,
                      padding: "12px 0",
                      marginTop: 8,
                      borderTop: `1px solid ${t.line}`,
                      borderBottom: `1px solid ${t.line}`,
                    }}
                  >
                    <FolderKanban
                      size={15}
                      color={blue}
                      style={{ marginTop: 2, flexShrink: 0 }}
                    />

                    <div style={{ minWidth: 0 }}>
                      <div style={sectionLabelStyle}>
                        Assigned project
                      </div>

                      <div
                        style={{
                          marginTop: 3,
                          fontSize: 12.5,
                          fontWeight: 600,
                          color: t.ink,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {project?.name || "Not assigned"}
                      </div>
                    </div>
                  </div>

                  {/* Card footer */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      paddingTop: 13,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                        color: subtle,
                        fontSize: 12,
                      }}
                    >
                      <Clock3 size={15} color={orange} />
                      <span>
                        <strong style={{ color: t.ink }}>{hours}h</strong>
                        {" "}logged
                      </span>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setDetail(v)}
                        aria-label={`View ${v.name}`}
                        title="View details"
                        style={cardButtonStyle}
                      >
                        <Search size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditing(v)}
                        aria-label={`Edit ${v.name}`}
                        title="Edit volunteer"
                        style={{
                          ...cardButtonStyle,
                          color: blue,
                          background: blueSoft,
                        }}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        onClick={() => setConfirmDel(v.id)}
                        aria-label={`Remove ${v.name}`}
                        title="Remove volunteer"
                        style={{
                          ...cardButtonStyle,
                          color: t.coral,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add / edit volunteer */}
      {editing !== null && (
        <VolunteerForm
          t={t}
          volunteer={editing}
          projects={projects}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Volunteer details */}
      {detail && (
        <Modal
          t={t}
          title="Volunteer profile"
          onClose={() => setDetail(null)}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 13,
              padding: 15,
              marginBottom: 17,
              border: `1px solid ${t.line}`,
              borderRadius: 11,
              background: t.canvas,
            }}
          >
            <Avatar
              initials={getInitials(detail.name)}
              t={t}
              size={48}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 700,
                  color: t.ink,
                  overflowWrap: "anywhere",
                }}
              >
                {detail.name}
              </div>

              <div
                style={{
                  fontSize: 12,
                  color: subtle,
                  marginTop: 4,
                }}
              >
                {detail.availability || "Availability not set"}
              </div>
            </div>

            <StatusChip status={detail.status} t={t} />
          </div>

          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: subtle,
              textTransform: "uppercase",
              letterSpacing: "0.07em",
              marginBottom: 7,
            }}
          >
            Volunteer information
          </div>

          <DetailRow
            t={t}
            icon={HeartHandshake}
            label="Skills"
            value={
              Array.isArray(detail.skills) && detail.skills.length
                ? detail.skills.join(", ")
                : "No skills added"
            }
          />

          <DetailRow
            t={t}
            icon={CalendarDays}
            label="Availability"
            value={detail.availability || "Not specified"}
          />

          <DetailRow
            t={t}
            icon={FolderKanban}
            label="Assigned project"
            value={getProject(detail.assigned)?.name || "Not assigned"}
          />

          <DetailRow
            t={t}
            icon={Mail}
            label="Email"
            value={detail.email || "Not provided"}
          />

          <DetailRow
            t={t}
            icon={Phone}
            label="Phone"
            value={detail.phone || "Not provided"}
          />

          <DetailRow
            t={t}
            icon={Clock3}
            label="Hours logged"
            value={`${Number(detail.hours) || 0} hours`}
          />

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 20,
              paddingTop: 14,
              borderTop: `1px solid ${t.line}`,
            }}
          >
            <Btn
              t={t}
              variant="ghost"
              onClick={() => setDetail(null)}
            >
              Close
            </Btn>

            <Btn
              t={t}
              variant="accent"
              icon={Pencil}
              onClick={() => {
                const selected = detail;
                setDetail(null);
                setEditing(selected);
              }}
            >
              Edit profile
            </Btn>
          </div>
        </Modal>
      )}

      {/* Delete confirmation */}
      {confirmDel && (
        <ConfirmDialog
          t={t}
          text="Remove this volunteer record? They will be unassigned from projects and tasks."
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => remove(confirmDel)}
        />
      )}
    </div>
  );
}

function VolunteerForm({ t, volunteer, projects, onSave, onClose }) {
  const [f, setF] = useState({
    name: "",
    skills: [],
    availability: "Flexible",
    hours: 0,
    status: "Active",
    assigned: null,
    email: "",
    phone: "",
    ...volunteer,
  });

  const [err, setErr] = useState("");

  const upd = (key, value) => {
    setF((previous) => ({ ...previous, [key]: value }));
    setErr("");
  };

  const submit = () => {
    if (!f.name.trim()) {
      setErr("Please enter the volunteer's full name.");
      return;
    }

    if (
      f.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())
    ) {
      setErr("Please enter a valid email address.");
      return;
    }

    if (
      f.phone &&
      !/^[+\d\s()-]{7,20}$/.test(f.phone.trim())
    ) {
      setErr("Please enter a valid phone number.");
      return;
    }

    onSave({
      ...f,
      name: f.name.trim(),
      email: (f.email || "").trim(),
      phone: (f.phone || "").trim(),
      skills:
        Array.isArray(f.skills) && f.skills.length
          ? f.skills
          : ["General"],
      hours: Number(f.hours) || 0,
      assigned: f.assigned || null,
    });
  };

  const skillsValue = Array.isArray(f.skills)
    ? f.skills.join(", ")
    : "";

  const fieldStyle = {
    ...inputStyle(t),
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <Modal
      t={t}
      title={volunteer?.id ? "Edit volunteer" : "Register volunteer"}
      onClose={onClose}
    >
      <p
        style={{
          margin: "-4px 0 19px",
          color: t.inkSoft,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        Add the volunteer's contact details, skills and availability.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: "0 14px",
        }}
      >
        <Field t={t} label="Full name">
          <input
            autoFocus
            style={fieldStyle}
            value={f.name}
            placeholder="Enter full name"
            onChange={(e) => upd("name", e.target.value)}
          />
        </Field>

        <Field t={t} label="Email address">
          <input
            type="email"
            style={fieldStyle}
            value={f.email || ""}
            placeholder="name@example.com"
            onChange={(e) => upd("email", e.target.value)}
          />
        </Field>

        <Field t={t} label="Phone number">
          <input
            type="tel"
            style={fieldStyle}
            value={f.phone || ""}
            placeholder="Enter phone number"
            onChange={(e) => upd("phone", e.target.value)}
          />
        </Field>

        <Field t={t} label="Availability">
          <select
            style={fieldStyle}
            value={f.availability || "Flexible"}
            onChange={(e) => upd("availability", e.target.value)}
          >
            <option value="Flexible">Flexible</option>
            <option value="Weekdays">Weekdays</option>
            <option value="Weekends">Weekends</option>
          </select>
        </Field>

        <div style={{ gridColumn: "1 / -1" }}>
          <Field t={t} label="Skills (comma separated)">
            <input
              style={fieldStyle}
              value={skillsValue}
              placeholder="e.g. Teaching, Design, Fundraising"
              onChange={(e) =>
                upd(
                  "skills",
                  e.target.value
                    .split(",")
                    .map((skill) => skill.trim())
                    .filter(Boolean)
                )
              }
            />
          </Field>
        </div>

        <Field t={t} label="Assigned project">
          <select
            style={fieldStyle}
            value={f.assigned || ""}
            onChange={(e) => upd("assigned", e.target.value || null)}
          >
            <option value="">Not assigned</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>

        <Field t={t} label="Status">
          <select
            style={fieldStyle}
            value={f.status || "Active"}
            onChange={(e) => upd("status", e.target.value)}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </Field>
      </div>

      {err && (
        <div
          role="alert"
          style={{
            padding: "10px 12px",
            marginTop: 8,
            borderRadius: 8,
            border: `1px solid ${t.coral}55`,
            background: `${t.coral}12`,
            color: t.coral,
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          {err}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          flexWrap: "wrap",
          gap: 9,
          marginTop: 20,
          paddingTop: 15,
          borderTop: `1px solid ${t.line}`,
        }}
      >
        <Btn t={t} variant="ghost" onClick={onClose}>
          Cancel
        </Btn>

        <Btn t={t} variant="accent" icon={Check} onClick={submit}>
          {volunteer?.id ? "Save changes" : "Register volunteer"}
        </Btn>
      </div>
    </Modal>
  );
}
