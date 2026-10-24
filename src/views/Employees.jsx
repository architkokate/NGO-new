
import React, { useState } from "react";
import {
  Users,
  FolderKanban,
  Mail,
  Phone,
  CalendarDays,
  Pencil,
  Trash2,
  Check,
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
import FileUpload from "../components/FileUpload";
import { ToolbarRow, iconBtnStyle, DetailRow } from "../components/shared";

export default function EmployeesView({ t, data, patch, notify }) {
  const [q, setQ] = useState("");
  const [filterDept, setFilterDept] = useState("All");
  const [editing, setEditing] = useState(null);
  const [confirmDel, setConfirmDel] = useState(null);
  const [detail, setDetail] = useState(null);

  const depts = [
    "All",
    ...Array.from(new Set(data.employees.map((e) => e.dept))),
  ];

  const list = data.employees.filter(
    (e) =>
      (filterDept === "All" || e.dept === filterDept) &&
      (e.name.toLowerCase().includes(q.toLowerCase()) ||
        e.role.toLowerCase().includes(q.toLowerCase()))
  );

  const save = (emp) => {
    patch((d) => {
      const exists = d.employees.some((e) => e.id === emp.id);

      const employees = exists
        ? d.employees.map((e) => (e.id === emp.id ? emp : e))
        : [...d.employees, { ...emp, id: "e" + Date.now() }];

      return { ...d, employees };
    });

    notify(editing?.id ? "Employee updated" : "Employee added");
    setEditing(null);
  };

  const remove = (id) => {
    patch((d) => ({
      ...d,
      employees: d.employees.filter((e) => e.id !== id),
      projects: d.projects.map((p) => ({
        ...p,
        team: p.team.filter((m) => m !== id),
        coordinator: p.coordinator === id ? null : p.coordinator,
      })),
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
        <SearchBox
          t={t}
          value={q}
          onChange={setQ}
          placeholder="Search employees..."
        />

        <select
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          style={{
            ...inputStyle(t),
            width: "auto",
            borderColor: t.line,
          }}
        >
          {depts.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </ToolbarRow>

      {list.length === 0 ? (
        <Empty
          t={t}
          icon={Users}
          title="No employees found"
          hint="Try a different search or add a new employee."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {list.map((e) => (
            <Card
              key={e.id}
              t={t}
              style={{
                padding: "14px 18px",
                borderLeft: `3px solid ${
                  e.status === "Active"
                    ? t.success
                    : e.status === "On Leave"
                    ? t.accent
                    : t.line
                }`,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
                flexWrap: "wrap",
                transition: "box-shadow 150ms ease, background 150ms ease",
              }}
            >
              {/* Left Column: Avatar + Name + Role + Employment Type */}
              <div
                onClick={() => setDetail(e)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  cursor: "pointer",
                  minWidth: 230,
                  flex: "1 1 240px",
                }}
              >
                <Avatar
                  initials={e.photo}
                  src={e.photoSrc}
                  t={t}
                  size={42}
                />

                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 14.5,
                      color: t.ink,
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      flexWrap: "wrap",
                    }}
                  >
                    <span>{e.name}</span>
                    <span
                      style={{
                        fontSize: 10.5,
                        fontWeight: 600,
                        padding: "2px 7px",
                        borderRadius: 4,
                        background: t.chipBg,
                        color: t.inkSoft,
                        textTransform: "capitalize",
                      }}
                    >
                      {e.employmentType || "Permanent"}
                    </span>
                  </div>

                  <div style={{ fontSize: 12.5, color: t.inkSoft, marginTop: 3 }}>
                    {e.role} {e.dept ? `· ${e.dept}` : ""}
                  </div>
                </div>
              </div>

              {/* Middle Column: Contact Info (Email, Phone, Joined Date) */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  flexWrap: "wrap",
                  fontSize: 12,
                  color: t.inkSoft,
                  flex: "2 1 280px",
                }}
              >
                {e.email && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Mail size={13} color={t.primary} />
                    <span>{e.email}</span>
                  </div>
                )}
                {e.phone && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <Phone size={13} color={t.primary} />
                    <span>{e.phone}</span>
                  </div>
                )}
                {e.joined && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <CalendarDays size={13} color={t.primary} />
                    <span>Joined {e.joined}</span>
                  </div>
                )}
              </div>

              {/* Right Column: Status Chip + Actions */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  flexShrink: 0,
                }}
              >
                <StatusChip status={e.status} t={t} />

                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={() => setEditing(e)}
                    style={{
                      ...iconBtnStyle(t),
                      color: t.secondary,
                      borderColor: t.line,
                      background: t.secondarySoft,
                    }}
                    title="Edit employee"
                    aria-label={`Edit ${e.name}`}
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => setConfirmDel(e.id)}
                    style={{
                      ...iconBtnStyle(t),
                      color: t.coral,
                      borderColor: t.line,
                      background: t.surface,
                    }}
                    title="Delete employee"
                    aria-label={`Delete ${e.name}`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing !== null && (
        <EmployeeForm
          t={t}
          employee={editing}
          onSave={save}
          onClose={() => setEditing(null)}
        />
      )}

      {detail && (
        <Modal
          t={t}
          title={detail.name}
          onClose={() => setDetail(null)}
        >
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              marginBottom: 16,
              padding: 14,
              borderRadius: 12,
              background: t.secondarySoft,
            }}
          >
            <Avatar
              initials={detail.photo}
              src={detail.photoSrc}
              t={t}
              size={48}
            />

            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  color: t.ink,
                  fontWeight: 700,
                  marginBottom: 4,
                }}
              >
                {detail.name}
              </div>
              <div style={{ color: t.inkSoft, fontSize: 12 }}>
                {detail.role}
              </div>
            </div>

            <StatusChip status={detail.status} t={t} />
          </div>

          <DetailRow
            t={t}
            icon={Users}
            label="Role"
            value={detail.role}
          />
          <DetailRow
            t={t}
            icon={FolderKanban}
            label="Department"
            value={detail.dept}
          />
          <DetailRow
            t={t}
            icon={Mail}
            label="Email"
            value={detail.email}
          />
          <DetailRow
            t={t}
            icon={Phone}
            label="Phone"
            value={detail.phone}
          />
          <DetailRow
            t={t}
            icon={CalendarDays}
            label="Joined"
            value={detail.joined}
          />
          <DetailRow
            t={t}
            icon={Users}
            label="Employment Type"
            value={detail.employmentType ? detail.employmentType.charAt(0).toUpperCase() + detail.employmentType.slice(1) : "Permanent"}
          />
          <DetailRow
            t={t}
            icon={Users}
            label="Gender"
            value={detail.gender ? detail.gender.charAt(0).toUpperCase() + detail.gender.slice(1) : "Unspecified"}
          />
        </Modal>
      )}

      {confirmDel && (
        <ConfirmDialog
          t={t}
          text="Remove this employee? Their tasks, leave and attendance records will also be removed."
          onCancel={() => setConfirmDel(null)}
          onConfirm={() => remove(confirmDel)}
        />
      )}
    </div>
  );
}

function EmployeeForm({ t, employee, onSave, onClose }) {
  const [f, setF] = useState({
    name: "",
    role: "",
    dept: "",
    email: "",
    phone: "",
    status: "Active",
    joined: "",
    ...employee,
  });

  const [err, setErr] = useState("");

  const upd = (k, v) => {
    setF((s) => ({ ...s, [k]: v }));
    setErr("");
  };

  const submit = () => {
    if (!f.name.trim() || !f.role.trim() || !f.dept.trim()) {
      setErr("Name, role and department are required.");
      return;
    }

    if (
      f.email &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)
    ) {
      setErr("Please enter a valid email address.");
      return;
    }

    if (f.phone && !/^[+0-9 ()-]{7,}$/.test(f.phone)) {
      setErr("Please enter a valid phone number.");
      return;
    }

    const initials = f.name
      .trim()
      .split(/\s+/)
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    onSave({
      ...f,
      name: f.name.trim(),
      role: f.role.trim(),
      dept: f.dept.trim(),
      photo: f.photo || initials,
    });
  };

  const initials =
    f.photo ||
    f.name
      .split(" ")
      .map((x) => x[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ||
    "?";

  return (
    <Modal
      t={t}
      title={employee?.id ? "Edit Employee" : "Add Employee"}
      onClose={onClose}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          padding: 14,
          borderRadius: 12,
          background: t.secondarySoft,
        }}
      >
        <Avatar
          initials={initials}
          src={f.photoSrc}
          t={t}
          size={48}
        />

        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: t.ink }}>
            Employee profile
          </div>
          <div style={{ fontSize: 12, color: t.inkSoft }}>
            Add details to keep your team directory updated.
          </div>
        </div>
      </div>

      <Field t={t} label="Full name">
        <input
          style={inputStyle(t)}
          value={f.name}
          onChange={(e) => upd("name", e.target.value)}
        />
      </Field>

      <Field t={t} label="Job role">
        <input
          style={inputStyle(t)}
          value={f.role}
          onChange={(e) => upd("role", e.target.value)}
        />
      </Field>

      <Field t={t} label="Department">
        <input
          style={inputStyle(t)}
          value={f.dept}
          onChange={(e) => upd("dept", e.target.value)}
        />
      </Field>

      <Field t={t} label="Email">
        <input
          type="email"
          style={inputStyle(t)}
          value={f.email}
          onChange={(e) => upd("email", e.target.value)}
        />
      </Field>

      <Field t={t} label="Phone">
        <input
          type="tel"
          style={inputStyle(t)}
          value={f.phone}
          onChange={(e) => upd("phone", e.target.value)}
        />
      </Field>

      <Field t={t} label="Joined date">
        <input
          type="date"
          style={inputStyle(t)}
          value={f.joined}
          onChange={(e) => upd("joined", e.target.value)}
        />
      </Field>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field t={t} label="Employment Type">
          <select
            style={inputStyle(t)}
            value={f.employmentType || "permanent"}
            onChange={(e) => upd("employmentType", e.target.value)}
          >
            <option value="permanent">Permanent</option>
            <option value="contract">Contract (1 EL / 21 days)</option>
            <option value="probation">Probation (6 months)</option>
          </select>
        </Field>

        <Field t={t} label="Gender">
          <select
            style={inputStyle(t)}
            value={f.gender || "female"}
            onChange={(e) => upd("gender", e.target.value)}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <Field t={t} label="Employment status">
        <select
          style={inputStyle(t)}
          value={f.status}
          onChange={(e) => upd("status", e.target.value)}
        >
          <option>Active</option>
          <option>On Leave</option>
          <option>Inactive</option>
        </select>
      </Field>

      <Field t={t} label="Profile photo (optional)">
        <FileUpload
          t={t}
          accept="image/*"
          label="Upload profile photo"
          onUpload={(file) => upd("photoSrc", file ? file.data : null)}
        />
      </Field>

      {err && (
        <div
          style={{
            color: t.coral,
            fontSize: 12.5,
            marginBottom: 12,
            padding: "9px 11px",
            background: t.accentSoft,
            borderRadius: 8,
          }}
        >
          {err}
        </div>
      )}

      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "flex-end",
          marginTop: 18,
          paddingTop: 14,
          borderTop: `1px solid ${t.line}`,
        }}
      >
        <Btn t={t} variant="ghost" onClick={onClose}>
          Cancel
        </Btn>

        <Btn t={t} variant="accent" icon={Check} onClick={submit}>
          Save
        </Btn>
      </div>
    </Modal>
  );
}
