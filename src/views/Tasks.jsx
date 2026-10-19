import React, { useState } from "react";
import { ListChecks, Paperclip, FolderKanban, Users, CalendarDays, Pencil, Trash2, Plus, Check } from "lucide-react";
import { Card, StatusChip, PriorityChip, Empty, Modal, ConfirmDialog, Btn, Field, inputStyle, SearchBox, Label, Avatar } from "../components/Primitives";
import FileUpload from "../components/FileUpload";
import { ToolbarRow, iconBtnStyle, DetailRow } from "../components/shared";
import { CAN, personIdsOf } from "../services/seeds";
import { todayStr } from "../services/storage";

const isOverdueTask = (tk, today) => tk.status !== "Completed" && tk.status !== "Overdue" && tk.due && tk.due < today;

export default function TasksView({ t, data, patch, notify, pushNotification, sessionUser, personOf }) {
  const today = todayStr();
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);
  const canManage = CAN.manageTasks(sessionUser.role);
  const ownIds = personIdsOf(sessionUser);
  const scoped = canManage ? data.tasks : data.tasks.filter((tk) => ownIds.includes(tk.assignee));

  const list = scoped.filter((tk) => {
    if (statusF === "Overdue (auto)") return isOverdueTask(tk, today);
    if (statusF !== "All" && tk.status !== statusF) return false;
    return tk.title.toLowerCase().includes(q.toLowerCase());
  });

  const save = (task) => {
    const isNew = !task.id;
    const prevAssignee = data.tasks.find((x) => x.id === task.id)?.assignee;
    patch((d) => {
      const exists = d.tasks.some((x) => x.id === task.id);
      const tasks = exists ? d.tasks.map((x) => (x.id === task.id ? task : x)) : [...d.tasks, { ...task, id: "t" + Date.now(), comments: [], attachments: [] }];
      return { ...d, tasks };
    });
    if (isNew && task.assignee && !ownIds.includes(task.assignee)) {
      pushNotification({ title: "New task assigned", body: `"${task.title}" assigned to ${personOf(task.assignee)?.name}.`, kind: "task" });
    } else if (prevAssignee && task.assignee !== prevAssignee && !ownIds.includes(task.assignee)) {
      pushNotification({ title: "Task reassigned", body: `"${task.title}" reassigned to ${personOf(task.assignee)?.name}.`, kind: "task" });
    }
    notify(editing?.id ? "Task updated" : "Task created");
    setEditing(null);
  };

  const remove = (id) => { patch((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== id) })); notify("Task removed"); setConfirmDel(null); setDetail(null); };

  const quickStatus = (task, status) => {
    patch((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === task.id ? { ...x, status } : x)) }));
    if (status === "Completed" && !ownIds.includes(task.assignee)) {
      pushNotification({ title: "Task completed", body: `"${task.title}" was marked complete.`, kind: "task" });
    }
    notify(`Marked "${task.title}" as ${status}`);
  };

  const addComment = (task, text) => {
    const comment = { by: sessionUser.id, text, at: today };
    patch((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === task.id ? { ...x, comments: [...x.comments, comment] } : x)) }));
    setDetail((dt) => dt && { ...dt, comments: [...dt.comments, comment] });
  };

  const addAttachment = (task, file) => {
    if (!file) return;
    patch((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === task.id ? { ...x, attachments: [...x.attachments, file] } : x)) }));
    setDetail((dt) => dt && { ...dt, attachments: [...dt.attachments, file] });
    notify("File attached");
  };

  const groups = ["Overdue", "Overdue (auto)", "In Progress", "Pending", "Completed"];

  return (
    <div>
      <ToolbarRow t={t}>
        <SearchBox t={t} value={q} onChange={setQ} placeholder="Search tasks..." />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} style={{ ...inputStyle(t), width: "auto" }}>
          {["All", ...groups].map((s) => <option key={s}>{s}</option>)}
        </select>
        {canManage && <Btn t={t} icon={Plus} onClick={() => setEditing({})} style={{ marginLeft: "auto" }}>New Task</Btn>}
      </ToolbarRow>

      {list.length === 0 ? (
        <Empty t={t} icon={ListChecks} title="No tasks found" hint="Nothing matches these filters." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((tk) => {
            const proj = data.projects.find((p) => p.id === tk.project);
            const person = personOf(tk.assignee);
            const autoOverdue = isOverdueTask(tk, today);
            return (
              <Card key={tk.id} t={t} style={{ padding: 13, borderColor: autoOverdue ? t.coral + "44" : t.line }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div onClick={() => setDetail(tk)} style={{ cursor: "pointer", minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 3, flexWrap: "wrap" }}>
                      <PriorityChip p={tk.priority} t={t} />
                      <div style={{ fontSize: 14, fontWeight: 700, color: t.ink }}>{tk.title}</div>
                      {autoOverdue && <StatusChip status="Overdue" t={t} />}
                    </div>
                    <div style={{ fontSize: 11.5, color: t.inkSoft }}>{proj?.name || "No project"} · {person?.name || "Unassigned"} · Due {tk.due}</div>
                  </div>
                  <StatusChip status={tk.status} t={t} />
                </div>
                <div style={{ display: "flex", gap: 6, marginTop: 10, flexWrap: "wrap", alignItems: "center" }}>
                  {tk.status !== "Completed" && <Btn t={t} variant="subtle" onClick={() => quickStatus(tk, "Completed")} icon={Check} style={{ padding: "5px 10px", fontSize: 12 }}>Mark complete</Btn>}
                  {tk.status === "Pending" && <Btn t={t} variant="subtle" onClick={() => quickStatus(tk, "In Progress")} style={{ padding: "5px 10px", fontSize: 12 }}>Start</Btn>}
                  {canManage && <button onClick={() => setEditing(tk)} style={iconBtnStyle(t)} title="Edit"><Pencil size={13} /></button>}
                  {canManage && <button onClick={() => setConfirmDel(tk.id)} style={iconBtnStyle(t)} title="Delete"><Trash2 size={13} color={t.coral} /></button>}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editing !== null && (
        <TaskForm
          t={t}
          task={editing}
          projects={data.projects}
          employees={data.employees}
          volunteers={data.volunteers}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {detail && (
        <Modal t={t} title={detail.title} onClose={() => setDetail(null)}>
          <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
            <PriorityChip p={detail.priority} t={t} />
            <StatusChip status={detail.status} t={t} />
            {isOverdueTask(detail, today) && <StatusChip status="Overdue" t={t} />}
          </div>
          <DetailRow t={t} icon={FolderKanban} label="Project" value={data.projects.find((p) => p.id === detail.project)?.name || "—"} />
          <DetailRow t={t} icon={Users} label="Assignee" value={personOf(detail.assignee)?.name || "—"} />
          <DetailRow t={t} icon={CalendarDays} label="Due date" value={detail.due} />
          <div style={{ marginTop: 12 }}>
            <Label t={t}>Attachments</Label>
            {(detail.attachments || []).map((a) => (
              <div key={a.name} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12.5, color: t.ink, marginTop: 6 }}>
                <Paperclip size={13} color={t.inkSoft} />
                <a href={a.data} download={a.name} style={{ color: t.primary }}>{a.name}</a>
              </div>
            ))}
            <div style={{ marginTop: 8 }}>
              <FileUpload t={t} label="Attach file" onUpload={(file) => addAttachment(detail, file)} />
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <Label t={t}>Comments</Label>
            {(detail.comments || []).map((c, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <Avatar initials={personOf(c.by)?.name.split(" ").map((x) => x[0]).join("").slice(0, 2) || "?"} t={t} size={24} />
                <div style={{ fontSize: 12.5, color: t.ink, background: t.chipBg, padding: "6px 10px", borderRadius: 8, flex: 1 }}>
                  <div style={{ fontSize: 10.5, color: t.inkSoft, fontWeight: 700 }}>{personOf(c.by)?.name || "Unknown"} · {c.at}</div>
                  <div style={{ marginTop: 2 }}>{c.text}</div>
                </div>
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
      <input
        style={inputStyle(t)}
        placeholder="Add a comment..."
        value={v}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter" && v.trim()) { onAdd(v.trim()); setV(""); } }}
      />
      <Btn t={t} onClick={() => { if (v.trim()) { onAdd(v.trim()); setV(""); } }}>Post</Btn>
    </div>
  );
}

function TaskForm({ t, task, projects, employees, volunteers, onSave, onClose }) {
  const assignees = [...employees, ...volunteers];
  const [f, setF] = useState({
    title: "", project: projects[0]?.id || "", assignee: assignees[0]?.id || "", priority: "Medium", due: "",
    status: "Pending", comments: [], attachments: [],
    ...task,
  });
  const [err, setErr] = useState("");
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.title.trim()) { setErr("Task title is required."); return; }
    if (!f.project) { setErr("Please choose a project."); return; }
    if (!f.due) { setErr("A due date is required."); return; }
    onSave({ ...f, title: f.title.trim() });
  };

  return (
    <Modal t={t} title={task?.id ? "Edit Task" : "New Task"} onClose={onClose}>
      <Field t={t} label="Task title"><input style={inputStyle(t)} value={f.title} onChange={(e) => upd("title", e.target.value)} /></Field>
      <Field t={t} label="Project">
        <select style={inputStyle(t)} value={f.project} onChange={(e) => upd("project", e.target.value)}>
          <option value="">Select project...</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field t={t} label="Assignee">
        <select style={inputStyle(t)} value={f.assignee} onChange={(e) => upd("assignee", e.target.value)}>
          <option value="">Unassigned</option>
          {assignees.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
        </select>
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
      {err && <div style={{ color: t.coral, fontSize: 12.5, marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={submit}>Save Task</Btn>
      </div>
    </Modal>
  );
}
