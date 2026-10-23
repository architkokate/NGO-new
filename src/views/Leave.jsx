import React, { useState } from "react";
import { CalendarDays, Clock3, AlertTriangle, Plus, Check, X } from "lucide-react";
import { Card, StatusChip, Empty, Modal, ConfirmDialog, Btn, Field, inputStyle } from "../components/Primitives";
import { ToolbarRow, StatCard } from "../components/shared";
import { CAN, personIdsOf } from "../services/seeds";

const ANNUAL_ALLOWANCE = 18;

function daysBetween(from, to) {
  return Math.round((new Date(to) - new Date(from)) / 86400000) + 1;
}

export default function LeaveView({ t, data, patch, notify, pushNotification, sessionUser, employeeOf }) {
  const canApprove = CAN.approveLeave(sessionUser.role);
  const ownIds = personIdsOf(sessionUser);
  const [form, setForm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const list = (canApprove ? data.leaves : data.leaves.filter((l) => ownIds.includes(l.user))).sort((a, b) => (a.from < b.from ? 1 : -1));

  const usedDays = data.leaves.filter((l) => ownIds.includes(l.user) && l.status === "Approved").reduce((s, l) => s + daysBetween(l.from, l.to), 0);

  const apply = (leave) => {
    const id = "l" + Date.now();
    patch((d) => ({ ...d, leaves: [{ ...leave, id, user: sessionUser.id, status: "Pending" }, ...d.leaves] }));
    pushNotification({ title: "Leave request submitted", body: `${leave.type} requested for ${leave.from} → ${leave.to}.`, kind: "leave" });
    notify("Leave request submitted");
    setForm(false);
  };

  const setStatus = (l, status) => {
    patch((d) => ({ ...d, leaves: d.leaves.map((x) => (x.id === l.id ? { ...x, status } : x)) }));
    if (!ownIds.includes(l.user)) {
      pushNotification({
        title: `Leave request ${status.toLowerCase()}`,
        body: `${employeeOf(l.user)?.name || "A colleague"}'s ${l.type} was ${status.toLowerCase()}.`,
        kind: "leave",
      });
    }
    notify(`Request ${status.toLowerCase()}`);
    setConfirmAction(null);
  };

  const pending = data.leaves.filter((l) => l.status === "Pending");

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 18 }}>
       <StatCard
  t={t}
  label="Annual balance"
  value={Math.max(ANNUAL_ALLOWANCE - usedDays, 0)}
  icon={CalendarDays}
/>

<StatCard
  t={t}
  label="Days used"
  value={usedDays}
  icon={Clock3}
/>

<StatCard
  t={t}
  label="Pending requests"
  value={pending.length}
  icon={AlertTriangle}
  tone={t.accent}
/>
      </div>

      <ToolbarRow t={t}>
        <div style={{ fontFamily: "Fraunces", fontSize: 17, fontWeight: 600 }}>{canApprove ? "All requests" : "Your requests"}</div>
        <Btn
  t={t}
  variant="accent"
  icon={Plus}
  onClick={() => setForm(true)}
  style={{ marginLeft: "auto" }}
>
  Apply for Leave
</Btn>
      </ToolbarRow>

      {list.length === 0 ? (
        <Empty t={t} icon={CalendarDays} title="No leave requests" hint="Submitted requests will appear here." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((l) => {
            const p = employeeOf(l.user);
            return (
              <Card
  key={l.id}
  t={t}
  style={{
    padding: 16,
    borderLeft: `3px solid ${
      l.status === "Pending"
        ? t.accent
        : l.status === "Approved"
        ? t.success
        : t.coral
    }`,
  }}
>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                  <div>
                    {canApprove && <div style={{ fontSize: 12.5, fontWeight: 700, color: t.ink, marginBottom: 3 }}>{p?.name}</div>}
                    <div
  style={{
    fontSize: 14,
    fontWeight: 700,
    color: t.primaryDeep,
    marginBottom: 3,
  }}
>
  {l.type}
</div>
                    <div
  style={{
    display: "flex",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    fontSize: 12,
    color: t.inkSoft,
    marginTop: 4,
  }}
>
  <CalendarDays size={13} color={t.primary} />
  <span>
    {l.from} → {l.to}
  </span>
  <span style={{ color: t.accent, fontWeight: 600 }}>
    · {daysBetween(l.from, l.to)} day{daysBetween(l.from, l.to) === 1 ? "" : "s"}
  </span>
</div>
                    <div style={{ fontSize: 12.5, color: t.inkSoft, marginTop: 5 }}>{l.reason}</div>
                  </div>
                  <StatusChip status={l.status} t={t} />
                </div>
                {canApprove && l.status === "Pending" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <Btn t={t} variant="subtle" icon={Check} onClick={() => setConfirmAction({ l, status: "Approved" })} style={{ fontSize: 12, padding: "5px 10px" }}>Approve</Btn>
                    <Btn t={t} variant="danger" icon={X} onClick={() => setConfirmAction({ l, status: "Rejected" })} style={{ fontSize: 12, padding: "5px 10px" }}>Reject</Btn>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {form && <LeaveForm t={t} balance={Math.max(ANNUAL_ALLOWANCE - usedDays, 0)} onSave={apply} onClose={() => setForm(false)} />}
      {confirmAction && (
        <ConfirmDialog
          t={t}
          text={`${confirmAction.status === "Approved" ? "Approve" : "Reject"} this ${confirmAction.l.type} request (${confirmAction.l.from} → ${confirmAction.l.to})?`}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => setStatus(confirmAction.l, confirmAction.status)}
        />
      )}
    </div>
  );
}

function LeaveForm({ t, balance, onSave, onClose }) {
  const [f, setF] = useState({ type: "Annual Leave", from: "", to: "", reason: "" });
  const [err, setErr] = useState("");
  const upd = (k, v) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.from || !f.to) { setErr("Start and end dates are required."); return; }
    if (f.to < f.from) { setErr("End date cannot be before the start date."); return; }
    const days = daysBetween(f.from, f.to);
    if (f.type === "Annual Leave" && days > balance) { setErr(`You only have ${balance} annual leave days remaining.`); return; }
    if (!f.reason.trim()) { setErr("A reason is required."); return; }
    onSave({ ...f, reason: f.reason.trim() });
  };

  return (
    <Modal t={t} title="Apply for Leave" onClose={onClose}>
      <Field t={t} label="Leave type">
        <select style={inputStyle(t)} value={f.type} onChange={(e) => upd("type", e.target.value)}>
          <option>Annual Leave</option><option>Sick Leave</option><option>Personal Leave</option><option>Unpaid Leave</option>
        </select>
      </Field>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field t={t} label="From"><input type="date" style={inputStyle(t)} value={f.from} onChange={(e) => upd("from", e.target.value)} /></Field>
        <Field t={t} label="To"><input type="date" style={inputStyle(t)} value={f.to} onChange={(e) => upd("to", e.target.value)} /></Field>
      </div>
      <Field t={t} label="Reason"><textarea rows={3} style={{ ...inputStyle(t), resize: "vertical" }} value={f.reason} onChange={(e) => upd("reason", e.target.value)} /></Field>
      {err && <div style={{ color: t.coral, fontSize: 12.5, marginBottom: 12 }}>{err}</div>}
      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
        <Btn t={t} variant="ghost" onClick={onClose}>Cancel</Btn>
        <Btn t={t} variant="accent" icon={Check} onClick={submit}>
  Submit Request
</Btn>
      </div>
    </Modal>
  );
}
