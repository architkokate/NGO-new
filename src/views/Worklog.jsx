import React, { useState } from "react";
import { NotebookPen, Plus, Check, Pencil, Paperclip } from "lucide-react";
import { Card, StatusChip, Empty, Modal, Btn, Field, inputStyle } from "../components/Primitives";
import FileUpload from "../components/FileUpload";
import { ToolbarRow } from "../components/shared";
import { CAN, personIdsOf } from "../services/seeds";
import { todayStr } from "../services/storage";

export default function WorklogView({ t, data, patch, notify, sessionUser, employeeOf }) {
  const canReview = CAN.manageTasks(sessionUser.role);
  const ownIds = personIdsOf(sessionUser);
  const [form, setForm] = useState(null);
  const list = (canReview ? data.worklogs : data.worklogs.filter((w) => ownIds.includes(w.user))).sort((a, b) => (a.date < b.date ? 1 : -1));

  const save = (log) => {
    if (log.id) {
      patch((d) => ({ ...d, worklogs: d.worklogs.map((w) => (w.id === log.id ? log : w)) }));
      notify("Work log updated");
    } else {
      patch((d) => ({ ...d, worklogs: [{ ...log, id: "w" + Date.now(), user: sessionUser.id, status: "Pending Review", files: [] }, ...d.worklogs] }));
      notify("Work log submitted");
    }
    setForm(null);
  };

  const review = (id) => { patch((d) => ({ ...d, worklogs: d.worklogs.map((w) => (w.id === id ? { ...w, status: "Reviewed" } : w)) })); notify("Marked as reviewed"); };

  return (
    <div>
      <ToolbarRow t={t}>
        <div style={{ fontFamily: "Fraunces", fontSize: 17, fontWeight: 600 }}>{canReview ? "Team work logs" : "Your daily logs"}</div>
        <Btn t={t} icon={Plus} onClick={() => setForm({ date: todayStr(), summary: "", hours: "", completed: "", pending: "", project: "", task: "" })} style={{ marginLeft: "auto" }}>Log Work</Btn>
      </ToolbarRow>

      {list.length === 0 ? (
        <Empty t={t} icon={NotebookPen} title="No entries yet" hint="Daily work summaries will appear here." />
      ) : (
        <div>
          {list.map((w, i) => {
            const p = employeeOf(w.user);
            const proj = data.projects.find((x) => x.id === w.project);
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
                      <div style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: t.inkSoft }}>{w.date} · {w.hours}h{proj ? ` · ${proj.name}` : ""}</div>
                    </div>
                    <StatusChip status={w.status} t={t} />
                  </div>
                  <div style={{ fontSize: 13, color: t.ink, margin: "8px 0" }}>{w.summary}</div>
                  <div style={{ fontSize: 12, color: t.inkSoft }}><b style={{ color: t.ink }}>Completed:</b> {w.completed}</div>
                  <div style={{ fontSize: 12, color: t.inkSoft }}><b style={{ color: t.ink }}>Pending:</b> {w.pending}</div>
                  {w.files && w.files.length > 0 && (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
                      {w.files.map((f) => (
                        <a key={f.name} href={f.data} download={f.name} style={{ fontSize: 11, display: "flex", alignItems: "center", gap: 4, color: t.primary }}>
                          <Paperclip size={11} />{f.name}
                        </a>
                      ))}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
                    {(ownIds.includes(w.user) || canReview) && <Btn t={t} variant="ghost" icon={Pencil} onClick={() => setForm(w)} style={{ fontSize: 12, padding: "5px 10px" }}>Edit</Btn>}
                    {canReview && w.status !== "Reviewed" && <Btn t={t} variant="subtle" icon={Check} onClick={() => review(w.id)} style={{ fontSize: 12, padding: "5px 10px" }}>Mark reviewed</Btn>}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      {form && <WorklogForm t={t} log={form} projects={data.projects} tasks={data.tasks} onSave={save} onClose={() => setForm(null)} />}
    </div>
  );
}

function WorklogForm({ t, log, projects, tasks, onSave, onClose }) {
  const [f, setF] = useState({ ...log });
  const [err, setErr] = useState("");
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.summary.trim()) { setErr("A work summary is required."); return; }
    const hours = Number(f.hours);
    if (!f.hours || isNaN(hours) || hours <= 0 || hours > 24) { setErr("Enter valid hours worked (0–24)."); return; }
    onSave({ ...f, summary: f.summary.trim(), hours });
  };

  const tasksForProject = tasks.filter((tk) => tk.project === f.project);

  return (
    <Modal t={t} title={log.id ? "Edit Work Log" : "Log Work"} onClose={onClose}>
      <Field t={t} label="Date"><input type="date" style={inputStyle(t)} value={f.date} onChange={(e) => upd("date", e.target.value)} /></Field>
      <Field t={t} label="Work summary"><textarea rows={3} style={{ ...inputStyle(t), resize: "vertical" }} value={f.summary} onChange={(e) => upd("summary", e.target.value)} /></Field>
      <Field t={t} label="Hours worked"><input type="number" step="0.5" min={0} max={24} style={inputStyle(t)} value={f.hours} onChange={(e) => upd("hours", e.target.value)} /></Field>
      <Field t={t} label="Tasks completed"><input style={inputStyle(t)} value={f.completed} onChange={(e) => upd("completed", e.target.value)} /></Field>
      <Field t={t} label="Pending work"><input style={inputStyle(t)} value={f.pending} onChange={(e) => upd("pending", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field t={t} label="Related project">
          <select style={inputStyle(t)} value={f.project || ""} onChange={(e) => { upd("project", e.target.value || ""); upd("task", ""); }}>
            <option value="">None</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </Field>
        <Field t={t} label="Related task">
          <select style={inputStyle(t)} value={f.task || ""} onChange={(e) => upd("task", e.target.value || "")} disabled={!f.project}>
            <option value="">None</option>
            {tasksForProject.map((tk) => <option key={tk.id} value={tk.id}>{tk.title}</option>)}
          </select>
        </Field>
      </div>
      <Field t={t} label="Attach supporting file (optional)">
        <FileUpload t={t} label="Upload file" onUpload={(file) => upd("files", file ? [...(f.files || []), file] : f.files || [])} />
      </Field>
      {err && <div style={{ color: t.coral, fontSize: 12.5, marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={submit}>{log.id ? "Save Changes" : "Submit Log"}</Btn>
      </div>
    </Modal>
  );
}
