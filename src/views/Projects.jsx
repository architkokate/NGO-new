import React, { useState } from "react";
import { FolderKanban, CalendarDays, Users, MapPin, ListChecks, Paperclip, Pencil, Trash2, Plus, Check } from "lucide-react";
import { Card, StatusChip, Empty, Modal, ConfirmDialog, Btn, Field, inputStyle, SearchBox, Label } from "../components/Primitives";
import FileUpload from "../components/FileUpload";
import { ToolbarRow, iconBtnStyle, DetailRow } from "../components/shared";
import { CAN } from "../services/seeds";

export default function ProjectsView({ t, data, patch, notify, pushNotification, sessionUser, employeeOf, personOf }) {
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);
  const canManage = CAN.manageProjects(sessionUser.role);

  const list = data.projects.filter((p) => (statusF === "All" || p.status === statusF) && p.name.toLowerCase().includes(q.toLowerCase()));

  const save = (proj) => {
    const isNew = !proj.id;
    patch((d) => {
      const exists = d.projects.some((p) => p.id === proj.id);
      const projects = exists ? d.projects.map((p) => (p.id === proj.id ? proj : p)) : [...d.projects, { ...proj, id: "p" + Date.now(), documents: proj.documents || [] }];
      return {
        ...d,
        projects,
        volunteers: d.volunteers.map((v) => ({ ...v, assigned: proj.team.includes(v.id) ? proj.id : v.assigned })),
      };
    });
    if (isNew) {
      pushNotification && pushNotification({ title: "Project created", body: `${proj.name} has been added.`, kind: "project" });
    }
    notify(editing?.id ? "Project updated" : "Project created");
    setEditing(null);
  };

  const remove = (id) => {
    patch((d) => ({
      ...d,
      projects: d.projects.filter((p) => p.id !== id),
      tasks: d.tasks.filter((tk) => tk.project !== id),
      volunteers: d.volunteers.map((v) => ({ ...v, assigned: v.assigned === id ? null : v.assigned })),
    }));
    notify("Project deleted");
    setConfirmDel(null);
    setDetail(null);
  };

  return (
    <div>
      <ToolbarRow t={t}>
        <SearchBox t={t} value={q} onChange={setQ} placeholder="Search projects..." />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} style={{ ...inputStyle(t), width: "auto" }}>
          {["All", "Planning", "Active", "Delayed", "Completed"].map((s) => <option key={s}>{s}</option>)}
        </select>
        {canManage && <Btn t={t} icon={Plus} onClick={() => setEditing({})} style={{ marginLeft: "auto" }}>New Project</Btn>}
      </ToolbarRow>

      {list.length === 0 ? (
        <Empty t={t} icon={FolderKanban} title="No projects found" hint="Adjust filters or create a new project." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((p) => {
            const coord = employeeOf(p.coordinator) || personOf(p.coordinator);
            const tasks = data.tasks.filter((tk) => tk.project === p.id);
            return (
              <Card key={p.id} t={t} style={{ padding: 16 }}>
                <div onClick={() => setDetail(p)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 6 }}>
                    <div style={{ fontFamily: "Fraunces", fontSize: 16, fontWeight: 600, color: t.ink }}>{p.name}</div>
                    <StatusChip status={p.status} t={t} />
                  </div>
                  <div style={{ fontSize: 13, color: t.inkSoft, marginBottom: 10 }}>{p.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 6, background: t.chipBg, borderRadius: 4, overflow: "hidden" }}>
                      <div style={{ width: `${Math.min(p.progress, 100)}%`, height: "100%", background: t.primary }} />
                    </div>
                    <span style={{ fontFamily: "IBM Plex Mono", fontSize: 12, color: t.ink }}>{p.progress}%</span>
                  </div>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 11.5, color: t.inkSoft }}>
                    <span>Coordinator: <b style={{ color: t.ink }}>{coord?.name || "—"}</b></span>
                    <span>{p.start} → {p.end}</span>
                    <span>Team: {p.team.length}</span>
                    <span>Tasks: {tasks.length}</span>
                  </div>
                </div>
                {canManage && (
                  <div style={{ display: "flex", gap: 6, justifyContent: "flex-end", marginTop: 10 }}>
                    <button onClick={() => setEditing(p)} style={iconBtnStyle(t)} title="Edit"><Pencil size={13} /></button>
                    <button onClick={() => setConfirmDel(p.id)} style={iconBtnStyle(t)} title="Delete"><Trash2 size={13} color={t.coral} /></button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {editing !== null && (
        <ProjectForm
          t={t}
          project={editing}
          employees={data.employees}
          volunteers={data.volunteers}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}
      {detail && (
        <Modal t={t} title={detail.name} wide onClose={() => setDetail(null)}>
          <div style={{ fontSize: 13.5, color: t.inkSoft, marginBottom: 14 }}>{detail.desc}</div>
          <div style={{ display: "flex", gap: 8, marginBottom: 10 }}><StatusChip status={detail.status} t={t} /></div>
          <DetailRow t={t} icon={CalendarDays} label="Timeline" value={`${detail.start} → ${detail.end}`} />
          <DetailRow t={t} icon={Users} label="Coordinator" value={(employeeOf(detail.coordinator) || personOf(detail.coordinator))?.name || "—"} />
          <DetailRow t={t} icon={MapPin} label="Budget" value={`$${(detail.spent || 0).toLocaleString()} of $${(detail.budget || 0).toLocaleString()} spent`} />
          <DetailRow t={t} icon={ListChecks} label="Progress" value={`${detail.progress}%`} />
          <div style={{ marginTop: 10 }}>
            <Label t={t}>Team members</Label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
              {detail.team.length === 0 ? (
                <span style={{ fontSize: 12, color: t.inkSoft }}>No team members yet.</span>
              ) : (
                detail.team.map((id) => {
                  const person = personOf(id);
                  return person ? <span key={id} style={{ fontSize: 12, background: t.chipBg, padding: "5px 10px", borderRadius: 14, fontWeight: 600 }}>{person.name}</span> : null;
                })
              )}
            </div>
          </div>
          {(detail.documents || []).length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Label t={t}>Documents</Label>
              {(detail.documents || []).map((d) => (
                <div key={d.name} style={{ display: "flex", gap: 6, alignItems: "center", fontSize: 12.5, color: t.ink, marginTop: 6 }}>
                  <Paperclip size={13} color={t.inkSoft} />
                  <a href={d.data} download={d.name} style={{ color: t.primary }}>{d.name}</a>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}
      {confirmDel && <ConfirmDialog t={t} text="Delete this project and all its tasks? This cannot be undone." onCancel={() => setConfirmDel(null)} onConfirm={() => remove(confirmDel)} />}
    </div>
  );
}

function ProjectForm({ t, project, employees, volunteers, onSave, onClose }) {
  const teamOptions = [...employees, ...volunteers];
  const [f, setF] = useState({
    name: "", desc: "", status: "Planning", coordinator: employees[0]?.id || "", team: [], start: "", end: "",
    progress: 0, budget: 0, spent: 0, documents: [],
    ...project,
  });
  const [err, setErr] = useState("");
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));
  const toggleTeam = (id) => upd("team", f.team.includes(id) ? f.team.filter((x) => x !== id) : [...f.team, id]);

  const submit = () => {
    if (!f.name.trim()) { setErr("Project name is required."); return; }
    if (!f.start || !f.end) { setErr("Start and end dates are required."); return; }
    if (f.end < f.start) { setErr("End date cannot be before the start date."); return; }
    if (f.progress < 0 || f.progress > 100) { setErr("Progress must be between 0 and 100."); return; }
    if (f.budget < 0 || f.spent < 0) { setErr("Budget and spend must be positive numbers."); return; }
    onSave({ ...f, name: f.name.trim(), progress: Number(f.progress), budget: Number(f.budget), spent: Number(f.spent) });
  };

  return (
    <Modal t={t} title={project?.id ? "Edit Project" : "New Project"} wide onClose={onClose}>
      <Field t={t} label="Project name"><input style={inputStyle(t)} value={f.name} onChange={(e) => upd("name", e.target.value)} /></Field>
      <Field t={t} label="Description"><textarea rows={3} style={{ ...inputStyle(t), resize: "vertical" }} value={f.desc} onChange={(e) => upd("desc", e.target.value)} /></Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field t={t} label="Start date"><input type="date" style={inputStyle(t)} value={f.start} onChange={(e) => upd("start", e.target.value)} /></Field>
        <Field t={t} label="End date"><input type="date" style={inputStyle(t)} value={f.end} onChange={(e) => upd("end", e.target.value)} /></Field>
      </div>
      <Field t={t} label="Status">
        <select style={inputStyle(t)} value={f.status} onChange={(e) => upd("status", e.target.value)}>
          <option>Planning</option><option>Active</option><option>Delayed</option><option>Completed</option>
        </select>
      </Field>
      <Field t={t} label="Coordinator">
        <select style={inputStyle(t)} value={f.coordinator} onChange={(e) => upd("coordinator", e.target.value)}>
          <option value="">Unassigned</option>
          {employees.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
        </select>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field t={t} label="Progress (%)"><input type="number" min={0} max={100} style={inputStyle(t)} value={f.progress} onChange={(e) => upd("progress", Number(e.target.value))} /></Field>
        <Field t={t} label="Budget ($)"><input type="number" min={0} style={inputStyle(t)} value={f.budget} onChange={(e) => upd("budget", Number(e.target.value))} /></Field>
      </div>
      <Field t={t} label="Spent ($)"><input type="number" min={0} style={inputStyle(t)} value={f.spent} onChange={(e) => upd("spent", Number(e.target.value))} /></Field>
      <Field t={t} label="Team members">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 140, overflowY: "auto" }}>
          {teamOptions.map((e) => (
            <button type="button" key={e.id} onClick={() => toggleTeam(e.id)} style={{ fontSize: 11.5, padding: "5px 10px", borderRadius: 14, border: `1px solid ${t.line}`, background: f.team.includes(e.id) ? t.primary : "transparent", color: f.team.includes(e.id) ? "#fff" : t.ink, cursor: "pointer" }}>
              {e.name}
            </button>
          ))}
        </div>
      </Field>
      <Field t={t} label="Attach a document (optional)">
        <FileUpload t={t} label="Upload document" onUpload={(file) => upd("documents", file ? [...f.documents, file] : f.documents)} />
      </Field>
      {err && <div style={{ color: t.coral, fontSize: 12.5, marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={submit}>Save Project</Btn>
      </div>
    </Modal>
  );
}
