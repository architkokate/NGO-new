import React, { useState } from "react";
import { HeartHandshake, Pencil, Trash2, Plus, Check, Mail, Phone, FolderKanban } from "lucide-react";
import { Card, Avatar, StatusChip, Empty, Modal, ConfirmDialog, Btn, Field, inputStyle, SearchBox } from "../components/Primitives";
import { ToolbarRow, iconBtnStyle, DetailRow } from "../components/shared";

export default function VolunteersView({ t, data, patch, notify }) {
  const [q, setQ] = useState("");
  const [statusF, setStatusF] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);

  const list = data.volunteers.filter((v) =>
    (statusF === "All" || v.status === statusF) &&
    (v.name.toLowerCase().includes(q.toLowerCase()) || v.skills.join(" ").toLowerCase().includes(q.toLowerCase()))
  );

  const save = (vol) => {
    patch((d) => {
      const exists = d.volunteers.some((v) => v.id === vol.id);
      const volunteers = exists ? d.volunteers.map((v) => (v.id === vol.id ? vol : v)) : [...d.volunteers, { ...vol, id: "v" + Date.now(), hours: vol.hours || 0 }];
      return { ...d, volunteers };
    });
    notify(editing?.id ? "Volunteer updated" : "Volunteer registered");
    setEditing(null);
  };

  const remove = (id) => {
    patch((d) => ({
      ...d,
      volunteers: d.volunteers.filter((v) => v.id !== id),
      projects: d.projects.map((p) => ({ ...p, team: p.team.filter((m) => m !== id) })),
      tasks: d.tasks.filter((tk) => tk.assignee !== id),
      worklogs: d.worklogs.filter((w) => w.user !== id),
    }));
    notify("Volunteer removed");
    setConfirmDel(null);
    setDetail(null);
  };

  return (
    <div>
      <ToolbarRow t={t}>
        <SearchBox t={t} value={q} onChange={setQ} placeholder="Search volunteers or skills..." />
        <select value={statusF} onChange={(e) => setStatusF(e.target.value)} style={{ ...inputStyle(t), width: "auto" }}>
          <option>All</option><option>Active</option><option>Inactive</option>
        </select>
        <Btn t={t} icon={Plus} onClick={() => setEditing({})} style={{ marginLeft: "auto" }}>Register Volunteer</Btn>
      </ToolbarRow>

      {list.length === 0 ? (
        <Empty t={t} icon={HeartHandshake} title="No volunteers found" hint="Register a volunteer to get started." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: 12 }}>
          {list.map((v) => {
            const proj = data.projects.find((p) => p.id === v.assigned);
            return (
              <Card key={v.id} t={t} style={{ padding: 14 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div onClick={() => setDetail(v)} style={{ display: "flex", gap: 10, cursor: "pointer" }}>
                    <Avatar initials={v.name.split(" ").map((x) => x[0]).join("")} t={t} size={36} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: t.ink }}>{v.name}</div>
                      <div style={{ fontSize: 11.5, color: t.inkSoft }}>{v.availability}</div>
                    </div>
                  </div>
                  <StatusChip status={v.status} t={t} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 5, margin: "10px 0" }}>
                  {v.skills.map((s) => <span key={s} style={{ fontSize: 10.5, background: t.chipBg, color: t.ink, padding: "3px 8px", borderRadius: 12, fontWeight: 600 }}>{s}</span>)}
                </div>
                <div style={{ fontSize: 11.5, color: t.inkSoft, marginBottom: 8 }}>
                  {proj ? `Assigned: ${proj.name}` : "Unassigned"} · <span style={{ fontFamily: "IBM Plex Mono" }}>{v.hours}h</span> logged
                </div>
                <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button onClick={() => setEditing(v)} style={iconBtnStyle(t)} title="Edit"><Pencil size={13} /></button>
                  <button onClick={() => setConfirmDel(v.id)} style={iconBtnStyle(t)} title="Delete"><Trash2 size={13} color={t.coral} /></button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {editing !== null && <VolunteerForm t={t} volunteer={editing} projects={data.projects} onSave={save} onClose={() => setEditing(null)} />}
      {detail && (
        <Modal t={t} title={detail.name} onClose={() => setDetail(null)}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <Avatar initials={detail.name.split(" ").map((x) => x[0]).join("")} t={t} size={46} />
            <StatusChip status={detail.status} t={t} />
          </div>
          <DetailRow t={t} icon={HeartHandshake} label="Skills" value={detail.skills.join(", ")} />
          <DetailRow t={t} icon={FolderKanban} label="Availability" value={detail.availability} />
          <DetailRow t={t} icon={FolderKanban} label="Assigned project" value={data.projects.find((p) => p.id === detail.assigned)?.name || "Unassigned"} />
          <DetailRow t={t} icon={Mail} label="Email" value={detail.email} />
          <DetailRow t={t} icon={Phone} label="Phone" value={detail.phone} />
          <DetailRow t={t} icon={HeartHandshake} label="Hours logged" value={`${detail.hours}h`} />
        </Modal>
      )}
      {confirmDel && <ConfirmDialog t={t} text="Remove this volunteer record? They will be unassigned from projects and tasks." onCancel={() => setConfirmDel(null)} onConfirm={() => remove(confirmDel)} />}
    </div>
  );
}

function VolunteerForm({ t, volunteer, projects, onSave, onClose }) {
  const [f, setF] = useState({ name: "", skills: [], availability: "Flexible", hours: 0, status: "Active", assigned: null, email: "", phone: "", ...volunteer });
  const [err, setErr] = useState("");
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.name.trim()) { setErr("Name is required."); return; }
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { setErr("Please enter a valid email address."); return; }
    onSave({ ...f, name: f.name.trim(), skills: f.skills.length ? f.skills : ["General"] });
  };

  return (
    <Modal t={t} title={volunteer?.id ? "Edit Volunteer" : "Register Volunteer"} onClose={onClose}>
      <Field t={t} label="Full name"><input style={inputStyle(t)} value={f.name} onChange={(e) => upd("name", e.target.value)} /></Field>
      <Field t={t} label="Skills (comma separated)"><input style={inputStyle(t)} value={f.skills.join(", ")} onChange={(e) => upd("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))} /></Field>
      <Field t={t} label="Availability">
        <select style={inputStyle(t)} value={f.availability} onChange={(e) => upd("availability", e.target.value)}>
          <option>Weekdays</option><option>Weekends</option><option>Flexible</option>
        </select>
      </Field>
      <Field t={t} label="Assigned project">
        <select style={inputStyle(t)} value={f.assigned || ""} onChange={(e) => upd("assigned", e.target.value || null)}>
          <option value="">Unassigned</option>
          {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </Field>
      <Field t={t} label="Email"><input type="email" style={inputStyle(t)} value={f.email} onChange={(e) => upd("email", e.target.value)} /></Field>
      <Field t={t} label="Phone"><input style={inputStyle(t)} value={f.phone} onChange={(e) => upd("phone", e.target.value)} /></Field>
      <Field t={t} label="Status">
        <select style={inputStyle(t)} value={f.status} onChange={(e) => upd("status", e.target.value)}>
          <option>Active</option><option>Inactive</option>
        </select>
      </Field>
      {err && <div style={{ color: t.coral, fontSize: 12.5, marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={submit}>Save</Btn>
      </div>
    </Modal>
  );
}
