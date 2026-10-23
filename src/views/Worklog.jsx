
import React, { useState } from "react";
import {
  NotebookPen,
  Plus,
  Check,
  Pencil,
  Paperclip,
  Clock3,
  CalendarDays,
  FolderKanban,
  ListChecks,
  CircleDashed,
} from "lucide-react";

import {
  Card,
  StatusChip,
  Empty,
  Modal,
  Btn,
  Field,
  inputStyle,
} from "../components/Primitives";

import FileUpload from "../components/FileUpload";
import { ToolbarRow } from "../components/shared";
import { CAN, personIdsOf } from "../services/seeds";
import { todayStr } from "../services/storage";

export default function WorklogView({
  t,
  data,
  patch,
  notify,
  sessionUser,
  employeeOf,
}) {
  const canReview = CAN.manageTasks(sessionUser.role);
  const ownIds = personIdsOf(sessionUser);
  const [form, setForm] = useState(null);

  const accent = t.accent || "#E89A3C";
  const subtle = t.inkSoft || "#707382";

  // Copy before sorting so the original application data is not mutated.
  const list = (canReview
    ? data.worklogs
    : data.worklogs.filter((w) => ownIds.includes(w.user))
  )
    .slice()
    .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  const totalHours = list.reduce(
    (sum, log) => sum + (Number(log.hours) || 0),
    0
  );

  const pendingCount = list.filter(
    (log) => log.status !== "Reviewed"
  ).length;

  const reviewedCount = list.filter(
    (log) => log.status === "Reviewed"
  ).length;

  const save = (log) => {
    if (log.id) {
      patch((d) => ({
        ...d,
        worklogs: d.worklogs.map((w) =>
          w.id === log.id ? { ...w, ...log } : w
        ),
      }));
      notify("Work log updated");
    } else {
      patch((d) => ({
        ...d,
        worklogs: [
          {
            ...log,
            id: "w" + Date.now(),
            user: sessionUser.id,
            status: "Pending Review",
            files: log.files || [],
          },
          ...d.worklogs,
        ],
      }));
      notify("Work log submitted");
    }

    setForm(null);
  };

  const review = (id) => {
    patch((d) => ({
      ...d,
      worklogs: d.worklogs.map((w) =>
        w.id === id ? { ...w, status: "Reviewed" } : w
      ),
    }));

    notify("Marked as reviewed");
  };

  const statCardStyle = {
    background: t.surface,
    border: `1px solid ${t.line}`,
    borderRadius: 12,
    padding: "16px 18px",
    minWidth: 0,
  };

  const statLabelStyle = {
    fontSize: 12,
    color: subtle,
    marginBottom: 10,
  };

  const statValueStyle = {
    fontSize: 25,
    lineHeight: 1.2,
    fontWeight: 750,
    letterSpacing: "-0.04em",
    color: t.ink,
  };

  return (
    <div
      style={{
        width: "100%",
        color: t.ink,
        boxSizing: "border-box",
      }}
    >
      {/* Page heading */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 20,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: accent,
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: accent,
              }}
            />
            {canReview ? "TEAM ACTIVITY" : "MY ACTIVITY"}
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 27,
              lineHeight: 1.25,
              fontWeight: 750,
              letterSpacing: "-0.035em",
              color: t.ink,
            }}
          >
            Work logs
          </h1>

          <p
            style={{
              color: subtle,
              fontSize: 14,
              lineHeight: 1.6,
              margin: "7px 0 0",
              maxWidth: 550,
            }}
          >
            {canReview
              ? "Review submitted work and keep track of your team's progress."
              : "Record your daily progress, completed tasks and hours worked."}
          </p>
        </div>

        <Btn
          t={t}
          variant="accent"
          icon={Plus}
          onClick={() =>
            setForm({
              date: todayStr(),
              summary: "",
              hours: "",
              completed: "",
              pending: "",
              project: "",
              task: "",
              files: [],
            })
          }
          style={{ flexShrink: 0 }}
        >
          Log work
        </Btn>
      </header>

      {/* Summary statistics */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(155px, 1fr))",
          gap: 12,
          marginBottom: 26,
        }}
      >
        <div style={statCardStyle}>
          <div style={statLabelStyle}>Total hours</div>
          <div style={statValueStyle}>
            {Number(totalHours.toFixed(2))}
            <span
              style={{
                fontSize: 13,
                fontWeight: 550,
                letterSpacing: 0,
                color: subtle,
                marginLeft: 5,
              }}
            >
              hrs
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: subtle,
              fontSize: 11,
              marginTop: 8,
            }}
          >
            <Clock3 size={13} />
            Across {list.length} {list.length === 1 ? "entry" : "entries"}
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Awaiting review</div>
          <div style={statValueStyle}>{pendingCount}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: subtle,
              fontSize: 11,
              marginTop: 8,
            }}
          >
            <CircleDashed size={13} color={accent} />
            Pending confirmation
          </div>
        </div>

        <div style={statCardStyle}>
          <div style={statLabelStyle}>Reviewed entries</div>
          <div style={statValueStyle}>{reviewedCount}</div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: subtle,
              fontSize: 11,
              marginTop: 8,
            }}
          >
            <Check size={13} color={t.success || "#397653"} />
            Review completed
          </div>
        </div>
      </div>

      {/* Log list heading */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
          marginBottom: 13,
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 17,
              fontWeight: 700,
              color: t.ink,
              letterSpacing: "-0.02em",
            }}
          >
            {canReview ? "Submitted work" : "Your entries"}
          </h2>

          <p
            style={{
              margin: "4px 0 0",
              color: subtle,
              fontSize: 12,
            }}
          >
            {list.length} {list.length === 1 ? "work log" : "work logs"}
            {" · "}Newest first
          </p>
        </div>
      </div>

      {/* Work log entries */}
      {list.length === 0 ? (
        <Card t={t} style={{ padding: 0 }}>
          <Empty
            t={t}
            icon={NotebookPen}
            title="No work logs yet"
            hint={
              canReview
                ? "Submitted team work logs will appear here."
                : "Create your first work log to record your daily progress."
            }
          />
        </Card>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 14,
          }}
        >
          {list.map((w) => {
            const person = employeeOf(w.user);
            const project = data.projects.find(
              (p) => p.id === w.project
            );

            const canEdit = ownIds.includes(w.user) || canReview;
            const isReviewed = w.status === "Reviewed";

            return (
              <Card
                key={w.id}
                t={t}
                style={{
                  padding: 0,
                  overflow: "hidden",
                  borderColor: t.line,
                  borderLeft: `3px solid ${
                    isReviewed ? t.success || "#397653" : accent
                  }`,
                }}
              >
                <div style={{ padding: "19px 21px" }}>
                  {/* Entry header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <div style={{ flex: "1 1 250px", minWidth: 0 }}>
                      {canReview && (
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: 700,
                            color: t.ink,
                            marginBottom: 7,
                          }}
                        >
                          {person?.name || "Unknown team member"}
                        </div>
                      )}

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          flexWrap: "wrap",
                          marginBottom: 8,
                        }}
                      >
                        <CalendarDays size={15} color={accent} />

                        <span
                          style={{
                            fontSize: 12,
                            fontWeight: 650,
                            color: t.ink,
                          }}
                        >
                          {w.date || "No date"}
                        </span>

                        <span style={{ color: t.line }}>·</span>

                        <Clock3 size={14} color={subtle} />

                        <span
                          style={{
                            fontSize: 12,
                            color: subtle,
                          }}
                        >
                          {Number(w.hours) || 0}{" "}
                          {(Number(w.hours) || 0) === 1 ? "hour" : "hours"}
                        </span>

                        {project && (
                          <>
                            <span style={{ color: t.line }}>·</span>
                            <FolderKanban size={14} color={subtle} />
                            <span
                              style={{
                                fontSize: 12,
                                color: subtle,
                              }}
                            >
                              {project.name}
                            </span>
                          </>
                        )}
                      </div>

                      <h3
                        style={{
                          margin: 0,
                          fontSize: 15,
                          lineHeight: 1.55,
                          fontWeight: 650,
                          color: t.ink,
                          overflowWrap: "anywhere",
                        }}
                      >
                        {w.summary || "Work summary not provided"}
                      </h3>
                    </div>

                    <StatusChip status={w.status} t={t} />
                  </div>

                  {/* Work details */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 240px), 1fr))",
                      gap: 12,
                      marginTop: 18,
                    }}
                  >
                    <div
                      style={{
                        padding: "13px 15px",
                        borderRadius: 9,
                        background: t.canvas,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          marginBottom: 7,
                          fontSize: 11,
                          fontWeight: 750,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: t.success || "#397653",
                        }}
                      >
                        <Check size={14} />
                        Completed
                      </div>

                      <p
                        style={{
                          margin: 0,
                          color: t.ink,
                          fontSize: 12.5,
                          lineHeight: 1.65,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {w.completed || "No completed tasks specified."}
                      </p>
                    </div>

                    <div
                      style={{
                        padding: "13px 15px",
                        borderRadius: 9,
                        background: t.canvas,
                        minWidth: 0,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 7,
                          marginBottom: 7,
                          fontSize: 11,
                          fontWeight: 750,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: accent,
                        }}
                      >
                        <NotebookPen size={14} />
                        Still pending
                      </div>

                      <p
                        style={{
                          margin: 0,
                          color: t.ink,
                          fontSize: 12.5,
                          lineHeight: 1.65,
                          whiteSpace: "pre-wrap",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {w.pending || "No pending work specified."}
                      </p>
                    </div>
                  </div>

                  {/* Attachments */}
                  {w.files && w.files.length > 0 && (
                    <div style={{ marginTop: 16 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: subtle,
                          marginBottom: 8,
                        }}
                      >
                        ATTACHMENTS
                      </div>

                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {w.files.map((file, index) => (
                          <a
                            key={`${file.name}-${index}`}
                            href={file.data}
                            download={file.name}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 7,
                              maxWidth: "100%",
                              padding: "7px 10px",
                              border: `1px solid ${t.line}`,
                              borderRadius: 7,
                              color: t.primary,
                              fontSize: 12,
                              textDecoration: "none",
                              overflowWrap: "anywhere",
                            }}
                          >
                            <Paperclip size={13} />
                            <span>{file.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  {canEdit && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        flexWrap: "wrap",
                        gap: 8,
                        borderTop: `1px solid ${t.line}`,
                        marginTop: 18,
                        paddingTop: 14,
                      }}
                    >
                      <Btn
                        t={t}
                        variant="secondary"
                        icon={Pencil}
                        onClick={() => setForm(w)}
                        style={{ fontSize: 12, padding: "7px 11px" }}
                      >
                        Edit entry
                      </Btn>

                      {canReview && !isReviewed && (
                        <Btn
                          t={t}
                          variant="accent"
                          icon={Check}
                          onClick={() => review(w.id)}
                          style={{ fontSize: 12, padding: "7px 11px" }}
                        >
                          Mark reviewed
                        </Btn>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {form && (
        <WorklogForm
          t={t}
          log={form}
          projects={data.projects}
          tasks={data.tasks}
          onSave={save}
          onClose={() => setForm(null)}
        />
      )}
    </div>
  );
}

function WorklogForm({ t, log, projects, tasks, onSave, onClose }) {
  const [f, setF] = useState({
    files: [],
    ...log,
  });

  const [err, setErr] = useState("");
  const accent = t.accent || "#E89A3C";

  const upd = (key, value) =>
    setF((previous) => ({ ...previous, [key]: value }));

  const submit = () => {
    if (!f.date) {
      setErr("Please select a date.");
      return;
    }

    if (!f.summary?.trim()) {
      setErr("A work summary is required.");
      return;
    }

    const hours = Number(f.hours);

    if (
      f.hours === "" ||
      f.hours === undefined ||
      Number.isNaN(hours) ||
      hours <= 0 ||
      hours > 24
    ) {
      setErr("Enter valid hours worked (more than 0 and up to 24).");
      return;
    }

    onSave({
      ...f,
      summary: f.summary.trim(),
      completed: (f.completed || "").trim(),
      pending: (f.pending || "").trim(),
      hours,
      files: f.files || [],
    });
  };

  const tasksForProject = tasks.filter(
    (task) => task.project === f.project
  );

  const fieldStyle = {
    ...inputStyle(t),
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <Modal
      t={t}
      title={log.id ? "Edit work log" : "Log work"}
      onClose={onClose}
    >
      <div
        style={{
          color: t.inkSoft,
          fontSize: 12.5,
          lineHeight: 1.6,
          marginBottom: 18,
        }}
      >
        Record what you worked on, the time spent, and anything that still
        needs attention.
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))",
          gap: 12,
        }}
      >
        <Field t={t} label="Work date">
          <input
            type="date"
            style={fieldStyle}
            value={f.date || ""}
            onChange={(e) => upd("date", e.target.value)}
          />
        </Field>

        <Field t={t} label="Hours worked">
          <input
            type="number"
            step="0.5"
            min="0.5"
            max="24"
            placeholder="e.g. 3.5"
            style={fieldStyle}
            value={f.hours ?? ""}
            onChange={(e) => upd("hours", e.target.value)}
          />
        </Field>
      </div>

      <Field t={t} label="Work summary">
        <textarea
          rows={3}
          placeholder="Briefly describe the work you focused on..."
          style={{
            ...fieldStyle,
            resize: "vertical",
            minHeight: 84,
            lineHeight: 1.55,
          }}
          value={f.summary || ""}
          onChange={(e) => upd("summary", e.target.value)}
        />
      </Field>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
          gap: 12,
        }}
      >
        <Field t={t} label="Related project">
          <select
            style={fieldStyle}
            value={f.project || ""}
            onChange={(e) => {
              upd("project", e.target.value);
              upd("task", "");
            }}
          >
            <option value="">No project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>

        <Field t={t} label="Related task">
          <select
            style={fieldStyle}
            value={f.task || ""}
            onChange={(e) => upd("task", e.target.value)}
            disabled={!f.project}
          >
            <option value="">No task</option>
            {tasksForProject.map((task) => (
              <option key={task.id} value={task.id}>
                {task.title}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <Field t={t} label="Completed work">
        <textarea
          rows={2}
          placeholder="What did you finish today?"
          style={{
            ...fieldStyle,
            resize: "vertical",
            lineHeight: 1.55,
          }}
          value={f.completed || ""}
          onChange={(e) => upd("completed", e.target.value)}
        />
      </Field>

      <Field t={t} label="Pending work">
        <textarea
          rows={2}
          placeholder="What remains to be done?"
          style={{
            ...fieldStyle,
            resize: "vertical",
            lineHeight: 1.55,
          }}
          value={f.pending || ""}
          onChange={(e) => upd("pending", e.target.value)}
        />
      </Field>

      <Field t={t} label="Supporting files (optional)">
        <FileUpload
          t={t}
          label="Upload file"
          onUpload={(file) => {
            if (file) {
              upd("files", [...(f.files || []), file]);
            }
          }}
        />
        {f.files?.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 7,
              marginTop: 10,
            }}
          >
            {f.files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 10px",
                  border: `1px solid ${t.line}`,
                  borderRadius: 7,
                  fontSize: 12,
                  color: t.ink,
                  overflowWrap: "anywhere",
                }}
              >
                <Paperclip size={14} color={accent} />
                <span>{file.name}</span>
              </div>
            ))}
          </div>
        )}
      </Field>

      {err && (
        <div
          role="alert"
          style={{
            color: t.coral || "#BD594B",
            background: t.canvas,
            border: `1px solid ${t.line}`,
            borderRadius: 8,
            padding: "10px 12px",
            fontSize: 12.5,
            marginTop: 12,
          }}
        >
          {err}
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 8,
          flexWrap: "wrap",
          borderTop: `1px solid ${t.line}`,
          marginTop: 20,
          paddingTop: 16,
        }}
      >
        <Btn t={t} variant="secondary" onClick={onClose}>
          Cancel
        </Btn>

        <Btn t={t} variant="accent" icon={Check} onClick={submit}>
          {log.id ? "Save changes" : "Submit log"}
        </Btn>
      </div>
    </Modal>
  );
}
