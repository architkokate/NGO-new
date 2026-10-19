import React, { useState } from "react";
import { Users, FolderKanban, Mail, Phone, CalendarDays, Pencil, Trash2, Plus, Check } from "lucide-react";
import { Card, Avatar, StatusChip, Empty, Modal, ConfirmDialog, Btn, Field, inputStyle, SearchBox } from "../components/Primitives";
import FileUpload from "../components/FileUpload";
import { ToolbarRow, iconBtnStyle, DetailRow } from "../components/shared";

export default function EmployeesView({ t, data, patch, notify }) {
  const [q, setQ] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);

  const depts = ["All", ...Array.from(new Set(data.employees.map((e) => e.dept)))];
  const list = data.employees.filter((e) =>
    (filterDept === "All" || e.dept === filterDept) &&
    (e.name.toLowerCase().includes(q.toLowerCase()) || e.role.toLowerCase().includes(q.toLowerCase()))
  );

  const save = (emp) => {
    patch((d) => {
      const exists = d.employees.some((e) => e.id === emp.id);
      const employees = exists ? d.employees.map((e) => (e.id === emp.id ? emp : e)) : [...d.employees, { ...emp, id: "e" + Date.now() }];
      return { ...d, employees };
    });
    notify(editing?.id ? "Employee updated" : "Employee added");
    setEditing(null);
  };

  const remove = (id) => {
    patch((d) => ({
      ...d,
      employees: d.employees.filter((e) => e.id !== id),
      projects: d.projects.map((p) => ({ ...p, team: p.team.filter((m) => m !== id), coordinator: p.coordinator === id ? null : p.coordinator })),
      tasks: d.tasks.filter((tk) => tk.assignee !== id),
      leaves: d.leaves.filter((l) => l.user !== id),
      attendance: d.attendance.filter((a) => a.user !== id),
      worklogs: d.worklogs.filter((w) => w.user !== id),
    }));
    notify("Employee removed");
    setConfirmDel(null);
    setDetail(null);
  };

  return (
    <div>
      <ToolbarRow t={t}>
        <SearchBox t={t} value={q} onChange={setQ} placeholder="Search employees..." />
        <select value={filterDept} onChange={(e) => setFilterDept(e.target.value)} style={{ ...inputStyle(t), width: "auto" }}>
          {depts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <Btn t={t} icon={Plus} onClick={() => setEditing({})} style={{ marginLeft: "auto" }}>Add Employee</Btn>
      </ToolbarRow>

      {list.length === 0 ? (
        <Empty t={t} icon={Users} title="No employees found" hint="Try a different search or add a new employee." />
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))", gap: 12 }}>
          {list.map((e) => (
            <Card key={e.id} t={t} style={{ padding: 14 }}>
              <div onClick={() => setDetail(e)} style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, cursor: "pointer" }}>
                <Avatar initials={e.photo} src={e.photoSrc} t={t} size={38} />
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: t.ink, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{e.name}</div>
                  <div style={{ fontSize: 12, color: t.inkSoft }}>{e.role}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <StatusChip status={e.status} t={t} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditing(e)} style={iconBtnStyle(t)} title="Edit"><Pencil size={13} /></button>
                  <button onClick={() => setConfirmDel(e.id)} style={iconBtnStyle(t)} title="Delete"><Trash2 size={13} color={t.coral} /></button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== null && <EmployeeForm t={t} employee={editing} onSave={save} onClose={() => setEditing(null)} />}
      {detail && (
        <Modal t={t} title={detail.name} onClose={() => setDetail(null)}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <Avatar initials={detail.photo} src={detail.photoSrc} t={t} size={46} />
            <StatusChip status={detail.status} t={t} />
          </div>
          <DetailRow t={t} icon={Users} label="Role" value={detail.role} />
          <DetailRow t={t} icon={FolderKanban} label="Department" value={detail.dept} />
          <DetailRow t={t} icon={Mail} label="Email" value={detail.email} />
          <DetailRow t={t} icon={Phone} label="Phone" value={detail.phone} />
          <DetailRow t={t} icon={CalendarDays} label="Joined" value={detail.joined} />
        </Modal>
      )}
      {confirmDel && <ConfirmDialog t={t} text="Remove this employee? Their tasks, leave and attendance records will also be removed." onCancel={() => setConfirmDel(null)} onConfirm={() => remove(confirmDel)} />}
    </div>
  );
}

function EmployeeForm({ t, employee, onSave, onClose }) {
  const [f, setF] = useState({ name: "", role: "", dept: "", email: "", phone: "", status: "Active", joined: "", ...employee });
  const [err, setErr] = useState("");
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.name.trim() || !f.role.trim() || !f.dept.trim()) { setErr("Name, role and department are required."); return; }
    if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { setErr("Please enter a valid email address."); return; }
    if (f.phone && !/^[+0-9 ()-]{7,}$/.test(f.phone)) { setErr("Please enter a valid phone number."); return; }
    const initials = (f.name.trim().split(/\s+/).map((x) => x[0]).join("").slice(0, 2).toUpperCase());
    onSave({ ...f, name: f.name.trim(), role: f.role.trim(), dept: f.dept.trim(), photo: f.photo || initials });
  };

  return (
    <Modal t={t} title={employee?.id ? "Edit Employee" : "Add Employee"} onClose={onClose}>
      <div style={{ marginBottom: 12 }}>
        <Avatar initials={f.photo || f.name.split(" ").map((x) => x[0]).join("").slice(0, 2).toUpperCase() || "?"} src={f.photoSrc} t={t} size={48} />
      </div>
      <Field t={t} label="Full name"><input style={inputStyle(t)} value={f.name} onChange={(e) => upd("name", e.target.value)} /></Field>
      <Field t={t} label="Job role"><input style={inputStyle(t)} value={f.role} onChange={(e) => upd("role", e.target.value)} /></Field>
      <Field t={t} label="Department"><input style={inputStyle(t)} value={f.dept} onChange={(e) => upd("dept", e.target.value)} /></Field>
      <Field t={t} label="Email"><input type="email" style={inputStyle(t)} value={f.email} onChange={(e) => upd("email", e.target.value)} /></Field>
      <Field t={t} label="Phone"><input style={inputStyle(t)} value={f.phone} onChange={(e) => upd("phone", e.target.value)} /></Field>
      <Field t={t} label="Joined date"><input type="date" style={inputStyle(t)} value={f.joined} onChange={(e) => upd("joined", e.target.value)} /></Field>
      <Field t={t} label="Employment status">
        <select style={inputStyle(t)} value={f.status} onChange={(e) => upd("status", e.target.value)}>
          <option>Active</option><option>On Leave</option><option>Inactive</option>
        </select>
      </Field>
      <Field t={t} label="Profile photo (optional)">
        <FileUpload t={t} accept="image/*" label="Upload profile photo" onUpload={(file) => upd("photoSrc", file ? file.data : null)} />
      </Field>
      {err && <div style={{ color: t.coral, fontSize: 12.5, marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} icon={Check} onClick={submit}>Save</Btn>
      </div>
    </Modal>
  );
}
