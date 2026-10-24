
import React, { useMemo, useState } from "react";
import {
  ListChecks,
  Paperclip,
  FolderKanban,
  Users,
  CalendarDays,
  Pencil,
  Trash2,
  Plus,
  Check,
  Search,
  Clock3,
  CircleAlert,
  CheckCircle2,
  MessageSquare,
  Eye,
  X,
  ClipboardList,
} from "lucide-react";

import {
  Card,
  StatusChip,
  PriorityChip,
  Empty,
  Modal,
  ConfirmDialog,
  Btn,
  Field,
  inputStyle,
  SearchBox,
  Label,
  Avatar,
} from "../components/Primitives";

import FileUpload from "../components/FileUpload";
import { ToolbarRow, iconBtnStyle, DetailRow } from "../components/shared";
import { CAN, personIdsOf } from "../services/seeds";
import { todayStr } from "../services/storage";

const ACCENT_FALLBACK = "#E89A3C";

const isOverdueTask = (task, today) =>
  task.status !== "Completed" &&
  task.due &&
  task.due < today;

const getTaskStatus = (task, today) =>
  isOverdueTask(task, today) ? "Overdue" : task.status;

export default function TasksView({
  t,
  data,
  patch,
  notify,
  pushNotification,
  sessionUser,
  personOf,
}) {
  const today = todayStr();

  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [priorityF, setPriorityF] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [confirmComplete, setConfirmComplete] = useState(null);
  const [detail, setDetail] = useState(null);

  const tasks = data.tasks || [];
  const projects = data.projects || [];
  const employees = data.employees || [];
  const volunteers = data.volunteers || [];

  const canManage = CAN.manageTasks(sessionUser.role);
  const ownIds = personIdsOf(sessionUser);
  const accent = t.accent || ACCENT_FALLBACK;

  const scoped = canManage
    ? tasks
    : tasks.filter((task) => ownIds.includes(task.assignee));

  const stats = useMemo(
    () => ({
      total: scoped.length,
      pending: scoped.filter(
        (task) => getTaskStatus(task, today) === "Pending"
      ).length,
      progress: scoped.filter(
        (task) => getTaskStatus(task, today) === "In Progress"
      ).length,
      overdue: scoped.filter(
        (task) => isOverdueTask(task, today) || task.status === "Overdue"
      ).length,
      completed: scoped.filter(
        (task) => task.status === "Completed"
      ).length,
    }),
    [scoped, today]
  );

  const list = scoped.filter((task) => {
    const status = getTaskStatus(task, today);
    const query = q.trim().toLowerCase();

    const matchesSearch =
      !query ||
      task.title?.toLowerCase().includes(query) ||
      projects
        .find((project) => project.id === task.project)
        ?.name?.toLowerCase()
        .includes(query) ||
      personOf(task.assignee)?.name?.toLowerCase().includes(query);

    const matchesStatus =
      statusF === "All" ||
      (statusF === "Overdue" &&
        (status === "Overdue" || task.status === "Overdue")) ||
      status === statusF;

    const matchesPriority =
      priorityF === "All" || task.priority === priorityF;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const save = (task) => {
    const isNew = !task.id;
    const previous = tasks.find((item) => item.id === task.id);
    const previousAssignee = previous?.assignee;

    const savedTask = {
      ...task,
      title: task.title.trim(),
      comments: task.comments || [],
      attachments: task.attachments || [],
      id: task.id || `t${Date.now()}`,
    };

    patch((current) => {
      const exists = current.tasks.some(
        (item) => item.id === savedTask.id
      );

      return {
        ...current,
        tasks: exists
          ? current.tasks.map((item) =>
              item.id === savedTask.id ? savedTask : item
            )
          : [...current.tasks, savedTask],
      };
    });

    if (
      isNew &&
      savedTask.assignee &&
      !ownIds.includes(savedTask.assignee)
    ) {
      pushNotification({
        title: "New task assigned",
        body: `"${savedTask.title}" assigned to ${
          personOf(savedTask.assignee)?.name || "a team member"
        }.`,
        kind: "task",
      });
    } else if (
      previousAssignee &&
      savedTask.assignee !== previousAssignee &&
      !ownIds.includes(savedTask.assignee)
    ) {
      pushNotification({
        title: "Task reassigned",
        body: `"${savedTask.title}" has been reassigned to ${
          personOf(savedTask.assignee)?.name || "a team member"
        }.`,
        kind: "task",
      });
    }

    notify(isNew ? "Task created" : "Task updated");
    setEditing(null);
    setDetail(null);
  };

  const remove = (id) => {
    patch((current) => ({
      ...current,
      tasks: current.tasks.filter((task) => task.id !== id),
    }));

    notify("Task removed");
    setConfirmDel(null);
    setDetail(null);
  };

  const quickStatus = (task, status) => {
    patch((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === task.id ? { ...item, status } : item
      ),
    }));

    if (detail?.id === task.id) {
      setDetail((current) => ({ ...current, status }));
    }

    if (
      status === "Completed" &&
      !ownIds.includes(task.assignee)
    ) {
      pushNotification({
        title: "Task completed",
        body: `"${task.title}" was marked complete.`,
        kind: "task",
      });
    }

    notify(`Task marked as ${status}`);
  };

  const addComment = (task, text) => {
    const comment = {
      by: sessionUser.id,
      text,
      at: today,
    };

    patch((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === task.id
          ? {
              ...item,
              comments: [...(item.comments || []), comment],
            }
          : item
      ),
    }));

    setDetail((current) =>
      current?.id === task.id
        ? {
            ...current,
            comments: [...(current.comments || []), comment],
          }
        : current
    );
  };

  const addAttachment = (task, file) => {
    if (!file) return;

    patch((current) => ({
      ...current,
      tasks: current.tasks.map((item) =>
        item.id === task.id
          ? {
              ...item,
              attachments: [...(item.attachments || []), file],
            }
          : item
      ),
    }));

    setDetail((current) =>
      current?.id === task.id
        ? {
            ...current,
            attachments: [...(current.attachments || []), file],
          }
        : current
    );

    notify("File attached");
  };

  const resetFilters = () => {
    setQ("");
    setStatusF("All");
    setPriorityF("All");
  };

  const hasFilters =
    q.trim() !== "" ||
    statusF !== "All" ||
    priorityF !== "All";

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
        color: t.ink,
        boxSizing: "border-box",
      }}
    >
      {/* Page heading */}
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 18,
          flexWrap: "wrap",
          marginBottom: 24,
        }}
      >
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: accent,
              fontSize: 11,
              fontWeight: 750,
              letterSpacing: "0.11em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                width: 7,
                height: 7,
                background: accent,
                borderRadius: "50%",
              }}
            />
            WORK MANAGEMENT
          </div>

          <h1
            style={{
              fontSize: 27,
              lineHeight: 1.25,
              letterSpacing: "-0.035em",
              fontWeight: 720,
              margin: 0,
              color: t.ink,
            }}
          >
            Tasks
          </h1>
        </div>

        {canManage && (
          <Btn
            t={t}
            variant="accent"
            icon={Plus}
            onClick={() => setEditing({})}
          >
            New task
          </Btn>
        )}
      </header>

      {/* Compact task summary */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <TaskStat
          t={t}
          accent={accent}
          label="Total tasks"
          value={stats.total}
          icon={ClipboardList}
          active={statusF === "All"}
          onClick={() => setStatusF("All")}
        />

        <TaskStat
          t={t}
          accent={accent}
          label="Pending"
          value={stats.pending}
          icon={Clock3}
          active={statusF === "Pending"}
          onClick={() => setStatusF("Pending")}
        />

        <TaskStat
          t={t}
          accent={accent}
          label="In progress"
          value={stats.progress}
          icon={ListChecks}
          active={statusF === "In Progress"}
          onClick={() => setStatusF("In Progress")}
        />

        <TaskStat
          t={t}
          accent={accent}
          label="Overdue"
          value={stats.overdue}
          icon={CircleAlert}
          active={statusF === "Overdue"}
          onClick={() => setStatusF("Overdue")}
          alert={stats.overdue > 0}
        />

        <TaskStat
          t={t}
          accent={accent}
          label="Completed"
          value={stats.completed}
          icon={CheckCircle2}
          active={statusF === "Completed"}
          onClick={() => setStatusF("Completed")}
        />
      </div>

      {/* Search and filtering */}
      <section
        style={{
          background: t.surface,
          border: `1px solid ${t.line}`,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <div
            style={{
              flex: "2 1 240px",
              minWidth: 0,
            }}
          >
            <SearchBox
              t={t}
              value={q}
              onChange={setQ}
              placeholder="Search tasks, projects or assignees..."
            />
          </div>

          <select
            aria-label="Filter by status"
            value={statusF}
            onChange={(e) => setStatusF(e.target.value)}
            style={{
              ...inputStyle(t),
              flex: "1 1 150px",
              width: "auto",
              minWidth: 130,
              boxSizing: "border-box",
            }}
          >
            {[
              "All",
              "Pending",
              "In Progress",
              "Completed",
              "Overdue",
            ].map((status) => (
              <option key={status} value={status}>
                {status === "All" ? "All statuses" : status}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by priority"
            value={priorityF}
            onChange={(e) => setPriorityF(e.target.value)}
            style={{
              ...inputStyle(t),
              flex: "1 1 130px",
              width: "auto",
              minWidth: 120,
              boxSizing: "border-box",
            }}
          >
            {["All", "High", "Medium", "Low"].map((priority) => (
              <option key={priority} value={priority}>
                {priority === "All" ? "All priorities" : `${priority} priority`}
              </option>
            ))}
          </select>

          {hasFilters && (
            <button
              type="button"
              onClick={resetFilters}
              style={{
                border: "none",
                background: "transparent",
                color: accent,
                fontSize: 12,
                fontWeight: 650,
                cursor: "pointer",
                padding: "8px 2px",
                whiteSpace: "nowrap",
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 10,
            flexWrap: "wrap",
            marginTop: 13,
            fontSize: 12,
            color: t.inkSoft,
          }}
        >
          <span>
            Showing <strong style={{ color: t.ink }}>{list.length}</strong>{" "}
            of {scoped.length} tasks
          </span>

          {canManage && (
            <span>Tasks across all assigned team members</span>
          )}
        </div>
      </section>

      {/* Task list */}
      {list.length === 0 ? (
        <div
          style={{
            background: t.surface,
            border: `1px solid ${t.line}`,
            borderRadius: 12,
            padding: "36px 20px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              margin: "0 auto 14px",
              background: t.accentSoft || "#FFF0DC",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Search size={21} color={accent} />
          </div>

          <div
            style={{
              fontSize: 15,
              fontWeight: 700,
              color: t.ink,
            }}
          >
            {hasFilters ? "No matching tasks" : "No tasks yet"}
          </div>

          <p
            style={{
              fontSize: 13,
              lineHeight: 1.6,
              color: t.inkSoft,
              margin: "7px 0 15px",
            }}
          >
            {hasFilters
              ? "Try adjusting your search or filters."
              : canManage
                ? "Create a task to get your team started."
                : "Your assigned tasks will appear here."}
          </p>

          {hasFilters ? (
            <Btn t={t} variant="secondary" onClick={resetFilters}>
              Clear filters
            </Btn>
          ) : canManage ? (
            <Btn
              t={t}
              variant="accent"
              icon={Plus}
              onClick={() => setEditing({})}
            >
              Create first task
            </Btn>
          ) : null}
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          {list.map((task) => {
            const project = projects.find(
              (item) => item.id === task.project
            );
            const assignee = personOf(task.assignee);
            const overdue =
              isOverdueTask(task, today) ||
              task.status === "Overdue";

            return (
              <article
                key={task.id}
                style={{
                  background: t.surface,
                  border: `1px solid ${
                    overdue ? `${t.coral}66` : t.line
                  }`,
                  borderLeft: `3px solid ${
                    overdue
                      ? t.coral
                      : task.status === "Completed"
                        ? t.success
                        : task.status === "In Progress"
                          ? accent
                          : t.line
                  }`,
                  borderRadius: 11,
                  padding: "16px 18px",
                  transition: "border-color 150ms ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "space-between",
                    gap: 14,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setDetail(task)}
                    style={{
                      display: "block",
                      flex: "1 1 260px",
                      minWidth: 0,
                      border: "none",
                      background: "transparent",
                      textAlign: "left",
                      padding: 0,
                      cursor: "pointer",
                      color: t.ink,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        marginBottom: 7,
                      }}
                    >
                      <PriorityChip p={task.priority} t={t} />

                      {overdue && task.status !== "Completed" && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 750,
                            letterSpacing: "0.035em",
                            color: t.coral,
                            background: `${t.coral}15`,
                            borderRadius: 5,
                            padding: "4px 7px",
                          }}
                        >
                          OVERDUE
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        fontSize: 15,
                        lineHeight: 1.4,
                        fontWeight: 700,
                        overflowWrap: "anywhere",
                      }}
                    >
                      {task.title}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "7px 14px",
                        fontSize: 12,
                        color: t.inkSoft,
                        marginTop: 9,
                      }}
                    >
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <FolderKanban size={13} />
                        {project?.name || "No project"}
                      </span>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                        }}
                      >
                        <Users size={13} />
                        {assignee?.name || "Unassigned"}
                      </span>

                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 5,
                          color: overdue ? t.coral : t.inkSoft,
                        }}
                      >
                        <CalendarDays size={13} />
                        {task.due || "No deadline"}
                      </span>

                      {(task.comments || []).length > 0 && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <MessageSquare size={13} />
                          {task.comments.length}
                        </span>
                      )}

                      {(task.attachments || []).length > 0 && (
                        <span
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 5,
                          }}
                        >
                          <Paperclip size={13} />
                          {task.attachments.length}
                        </span>
                      )}
                    </div>
                  </button>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <StatusChip
                      status={getTaskStatus(task, today)}
                      t={t}
                    />

                    <button
                      type="button"
                      title="View task details"
                      aria-label={`View ${task.title}`}
                      onClick={() => setDetail(task)}
                      style={iconBtnStyle(t)}
                    >
                      <Eye size={15} />
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    borderTop: `1px solid ${t.line}`,
                    marginTop: 14,
                    paddingTop: 12,
                    display: "flex",
                    alignItems: "center",
                    gap: 7,
                    flexWrap: "wrap",
                  }}
                >
                  {task.status !== "Completed" && (
                    <>
                      {task.status === "Pending" && (
                        <Btn
                          t={t}
                          variant="accent"
                          onClick={() => quickStatus(task, "In Progress")}
                        >
                          Start task
                        </Btn>
                      )}

                      <Btn
                        t={t}
                        variant={
                          task.status === "In Progress"
                            ? "accent"
                            : "secondary"
                        }
                        icon={Check}
                        onClick={() => setConfirmComplete(task)}
                      >
                        Mark complete
                      </Btn>
                    </>
                  )}

                  {task.status === "Completed" && (
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        color: t.success,
                        fontSize: 12,
                        fontWeight: 650,
                      }}
                    >
                      <CheckCircle2 size={15} />
                      Task completed
                    </span>
                  )}

                  <div style={{ flex: 1 }} />

                  {canManage && (
                    <>
                      <button
                        type="button"
                        title="Edit task"
                        aria-label={`Edit ${task.title}`}
                        onClick={() => setEditing(task)}
                        style={iconBtnStyle(t)}
                      >
                        <Pencil size={14} />
                      </button>

                      <button
                        type="button"
                        title="Delete task"
                        aria-label={`Delete ${task.title}`}
                        onClick={() => setConfirmDel(task.id)}
                        style={{
                          ...iconBtnStyle(t),
                          color: t.coral,
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                    </>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Create / edit task */}
      {editing !== null && (
        <TaskForm
          t={t}
          task={editing}
          projects={projects}
          employees={employees}
          volunteers={volunteers}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}

      {/* Task details */}
      {detail && (
        <TaskDetail
          t={t}
          task={detail}
          today={today}
          data={data}
          personOf={personOf}
          sessionUser={sessionUser}
          onClose={() => setDetail(null)}
          onComment={addComment}
          onAttachment={addAttachment}
        />
      )}

      {confirmDel && (
        <ConfirmDialog
          t={t}
          text="Delete this task? This action cannot be undone."
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => remove(confirmDel)}
        />
      )}

      {confirmComplete && (
        <ConfirmDialog
          t={t}
          text={`Mark "${confirmComplete.title}" as complete? This cannot be undone.`}
          onCancel={() => setConfirmComplete(null)}
          onConfirm={() => {
            quickStatus(confirmComplete, "Completed");
            setConfirmComplete(null);
          }}
        />
      )}
    </div>
  );
}

function TaskStat({
  t,
  accent,
  label,
  value,
  icon: Icon,
  active,
  onClick,
  alert,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      style={{
        minWidth: 0,
        textAlign: "left",
        background: t.surface,
        border: `1px solid ${active ? accent : t.line}`,
        borderRadius: 11,
        padding: "15px 16px",
        cursor: "pointer",
        color: t.ink,
        boxShadow: active
          ? `inset 0 0 0 1px ${accent}25`
          : "none",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 8,
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: t.inkSoft,
            fontWeight: 550,
          }}
        >
          {label}
        </span>

        <Icon
          size={17}
          color={alert && value > 0 ? t.coral : accent}
        />
      </div>

      <div
        style={{
          fontSize: 26,
          fontWeight: 750,
          letterSpacing: "-0.04em",
          lineHeight: 1.25,
          marginTop: 10,
          color: alert && value > 0 ? t.coral : t.ink,
        }}
      >
        {value}
      </div>
    </button>
  );
}

function TaskDetail({
  t,
  task,
  today,
  data,
  personOf,
  sessionUser,
  onClose,
  onComment,
  onAttachment,
}) {
  const [comment, setComment] = useState("");

  const project = (data.projects || []).find(
    (item) => item.id === task.project
  );

  const attachments = task.attachments || [];
  const comments = task.comments || [];
  const accent = t.accent || ACCENT_FALLBACK;

  const submitComment = () => {
    const value = comment.trim();
    if (!value) return;

    onComment(task, value);
    setComment("");
  };

  return (
    <Modal t={t} title={task.title} onClose={onClose}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 8,
          marginBottom: 18,
        }}
      >
        <PriorityChip p={task.priority} t={t} />
        <StatusChip status={getTaskStatus(task, today)} t={t} />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))",
          gap: 10,
          marginBottom: 20,
        }}
      >
        <DetailRow
          t={t}
          icon={FolderKanban}
          label="Project"
          value={project?.name || "No project"}
        />

        <DetailRow
          t={t}
          icon={Users}
          label="Assignee"
          value={personOf(task.assignee)?.name || "Unassigned"}
        />

        <DetailRow
          t={t}
          icon={CalendarDays}
          label="Due date"
          value={task.due || "Not set"}
        />
      </div>

      <section
        style={{
          borderTop: `1px solid ${t.line}`,
          paddingTop: 16,
          marginTop: 8,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            color: t.ink,
            marginBottom: 12,
          }}
        >
          <Paperclip size={16} color={accent} />
          Attachments
          <span
            style={{
              fontSize: 11,
              color: t.inkSoft,
              fontWeight: 500,
            }}
          >
            ({attachments.length})
          </span>
        </div>

        {attachments.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: t.inkSoft,
              margin: "0 0 12px",
            }}
          >
            No files attached yet.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 8,
              marginBottom: 12,
            }}
          >
            {attachments.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: t.canvas,
                  border: `1px solid ${t.line}`,
                  borderRadius: 8,
                  minWidth: 0,
                }}
              >
                <Paperclip size={15} color={accent} />

                <a
                  href={file.data}
                  download={file.name}
                  style={{
                    color: t.primary,
                    fontSize: 12,
                    textDecoration: "none",
                    overflowWrap: "anywhere",
                    flex: 1,
                  }}
                >
                  {file.name}
                </a>
              </div>
            ))}
          </div>
        )}

        <FileUpload
          t={t}
          label="Attach a file"
          onUpload={(file) => onAttachment(task, file)}
        />
      </section>

      <section
        style={{
          borderTop: `1px solid ${t.line}`,
          paddingTop: 16,
          marginTop: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 700,
            color: t.ink,
            marginBottom: 14,
          }}
        >
          <MessageSquare size={16} color={accent} />
          Discussion
          <span
            style={{
              fontSize: 11,
              color: t.inkSoft,
              fontWeight: 500,
            }}
          >
            ({comments.length})
          </span>
        </div>

        {comments.length === 0 ? (
          <p
            style={{
              fontSize: 12,
              color: t.inkSoft,
              margin: "0 0 12px",
            }}
          >
            No comments yet. Start the discussion.
          </p>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 12,
              marginBottom: 16,
              maxHeight: 260,
              overflowY: "auto",
              paddingRight: 3,
            }}
          >
            {comments.map((item, index) => {
              const author = personOf(item.by);
              const initials =
                author?.name
                  ?.split(" ")
                  .map((part) => part[0])
                  .join("")
                  .slice(0, 2) || "?";

              return (
                <div
                  key={`${item.at}-${index}`}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 9,
                  }}
                >
                  <Avatar
                    initials={initials}
                    t={t}
                    size={30}
                  />

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: t.canvas,
                      border: `1px solid ${t.line}`,
                      padding: "10px 12px",
                      borderRadius: "3px 10px 10px 10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                        flexWrap: "wrap",
                        fontSize: 11,
                        color: t.inkSoft,
                      }}
                    >
                      <strong style={{ color: t.ink }}>
                        {author?.name || "Unknown"}
                      </strong>
                      <span>{item.at}</span>
                    </div>

                    <div
                      style={{
                        fontSize: 12.5,
                        lineHeight: 1.6,
                        color: t.ink,
                        marginTop: 5,
                        whiteSpace: "pre-wrap",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {item.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          <textarea
            aria-label="Write a comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => {
              if (
                e.key === "Enter" &&
                !e.shiftKey
              ) {
                e.preventDefault();
                submitComment();
              }
            }}
            placeholder="Write a comment..."
            rows={2}
            style={{
              ...inputStyle(t),
              flex: 1,
              minWidth: 0,
              resize: "vertical",
              boxSizing: "border-box",
            }}
          />

          <Btn
            t={t}
            variant="accent"
            disabled={!comment.trim()}
            onClick={submitComment}
          >
            Post
          </Btn>
        </div>

        <p
          style={{
            fontSize: 10.5,
            color: t.inkSoft,
            margin: "6px 0 0",
          }}
        >
          Press Enter to post or Shift + Enter for a new line.
        </p>
      </section>
    </Modal>
  );
}

function TaskForm({
  t,
  task,
  projects,
  employees,
  volunteers,
  onSave,
  onClose,
}) {
  const assignees = [...employees, ...volunteers];

  const [f, setF] = useState({
    title: "",
    project: projects[0]?.id || "",
    assignee: "",
    priority: "Medium",
    due: "",
    status: "Pending",
    comments: [],
    attachments: [],
    ...task,
  });

  const [err, setErr] = useState("");
  const accent = t.accent || ACCENT_FALLBACK;

  const upd = (key, value) => {
    setF((previous) => ({ ...previous, [key]: value }));
    setErr("");
  };

  const submit = (e) => {
    e.preventDefault();

    if (!f.title.trim()) {
      setErr("Please enter a task title.");
      return;
    }

    if (!f.project) {
      setErr("Please select a project.");
      return;
    }

    if (!f.due) {
      setErr("Please set a deadline.");
      return;
    }

    onSave({
      ...f,
      title: f.title.trim(),
    });
  };

  const fieldStyle = {
    ...inputStyle(t),
    width: "100%",
    boxSizing: "border-box",
  };

  return (
    <Modal
      t={t}
      title={task?.id ? "Edit task" : "Create a task"}
      onClose={onClose}
    >
      <form onSubmit={submit}>
        <p
          style={{
            fontSize: 13,
            color: t.inkSoft,
            lineHeight: 1.6,
            margin: "0 0 20px",
          }}
        >
          Add the task details, assign responsibility and set a deadline.
        </p>

        <Field t={t} label="Task title">
          <input
            autoFocus
            style={fieldStyle}
            placeholder="e.g. Prepare project documentation"
            value={f.title}
            onChange={(e) => upd("title", e.target.value)}
          />
        </Field>

        <Field t={t} label="Project">
          <select
            style={fieldStyle}
            value={f.project}
            onChange={(e) => upd("project", e.target.value)}
          >
            <option value="">Select a project</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </Field>

        <Field t={t} label="Assignee">
          <select
            style={fieldStyle}
            value={f.assignee || ""}
            onChange={(e) => upd("assignee", e.target.value)}
          >
            <option value="">Unassigned</option>
            {assignees.map((person) => (
              <option key={person.id} value={person.id}>
                {person.name}
              </option>
            ))}
          </select>
        </Field>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          <Field t={t} label="Priority">
            <select
              style={fieldStyle}
              value={f.priority}
              onChange={(e) => upd("priority", e.target.value)}
            >
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </Field>

          <Field t={t} label="Deadline">
            <input
              type="date"
              style={fieldStyle}
              value={f.due || ""}
              onChange={(e) => upd("due", e.target.value)}
            />
          </Field>
        </div>

        <Field t={t} label="Status">
          <select
            style={fieldStyle}
            value={f.status}
            onChange={(e) => upd("status", e.target.value)}
          >
            <option>Pending</option>
            <option>In Progress</option>
            <option>Completed</option>
            <option>Overdue</option>
          </select>
        </Field>

        {err && (
          <div
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 7,
              color: t.coral,
              fontSize: 12.5,
              marginTop: 10,
            }}
          >
            <X size={14} />
            {err}
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
            flexWrap: "wrap",
            marginTop: 24,
            paddingTop: 16,
            borderTop: `1px solid ${t.line}`,
          }}
        >
          <Btn
            t={t}
            variant="secondary"
            onClick={onClose}
          >
            Cancel
          </Btn>

          <Btn
            t={t}
            variant="accent"
            icon={Check}
            type="submit"
          >
            {task?.id ? "Save changes" : "Create task"}
          </Btn>
        </div>
      </form>
    </Modal>
  );
}
