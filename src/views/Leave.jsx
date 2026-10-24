import React, { useState } from "react";
import {
  CalendarDays,
  Clock3,
  AlertTriangle,
  Plus,
  Check,
  X,
  HeartPulse,
  Coffee,
  CalendarCheck,
  Baby,
  FileText,
} from "lucide-react";
import {
  Card,
  StatusChip,
  Empty,
  Modal,
  ConfirmDialog,
  Btn,
  Field,
  inputStyle,
} from "../components/Primitives";
import { ToolbarRow, StatCard } from "../components/shared";
import { CAN, personIdsOf } from "../services/seeds";
import { todayStr } from "../services/storage";
import {
  calculateEmployeeBalances,
  validateLeaveApplication,
  computeEffectiveDays,
  evaluateSandwichRule,
  calendarDaysBetween,
  LEAVE_TYPES,
  POLICY_CONFIG,
} from "../services/leavePolicy";

export default function LeaveView({
  t,
  data,
  patch,
  notify,
  pushNotification,
  sessionUser,
  employeeOf,
}) {
  const canApprove = CAN.approveLeave(sessionUser.role);
  const ownIds = personIdsOf(sessionUser);
  const [form, setForm] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  // Identify current employee profile for balance calculations
  const currentEmp =
    data.employees.find((e) => ownIds.includes(e.id)) ||
    data.employees.find((e) => e.email === sessionUser.email) ||
    data.employees[0];

  const balances = calculateEmployeeBalances(
    currentEmp,
    data.leaves,
    data.attendance || []
  );

  const list = (canApprove
    ? data.leaves
    : data.leaves.filter((l) => ownIds.includes(l.user))
  ).sort((a, b) => (a.from < b.from ? 1 : -1));

  const apply = (leave) => {
    const id = "l" + Date.now();
    const effectiveDays = computeEffectiveDays(leave);
    const newRecord = {
      ...leave,
      id,
      user: currentEmp?.id || sessionUser.id,
      duration: effectiveDays,
      status: "Pending",
    };

    patch((d) => ({
      ...d,
      leaves: [newRecord, ...d.leaves],
    }));

    pushNotification({
      title: "Leave request submitted",
      body: `${leave.type} (${effectiveDays} day${
        effectiveDays === 1 ? "" : "s"
      }) requested for ${leave.from} → ${leave.to}.`,
      kind: "leave",
    });
    notify("Leave request submitted");
    setForm(false);
  };

  const setStatus = (l, status) => {
    patch((d) => ({
      ...d,
      leaves: d.leaves.map((x) => (x.id === l.id ? { ...x, status } : x)),
    }));
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
      {/* Leave Balances Header Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 12,
          marginBottom: 12,
        }}
      >
        <StatCard
          t={t}
          label="Casual Leave (CL)"
          value={balances?.CL?.entitled ?? 7}
          remaining={`Remaining: ${balances?.CL?.balance ?? 0}`}
          icon={Coffee}
          hint="Max 3 consecutive days"
        />

        <StatCard
          t={t}
          label="Sick Leave (SL)"
          value={balances?.SL?.entitled ?? 15}
          remaining={`Remaining: ${balances?.SL?.balance ?? 0}`}
          icon={HeartPulse}
          hint="Max cap 14 days"
        />

        <StatCard
          t={t}
          label="Earned Leave (EL)"
          value={balances?.EL?.entitled ?? 15}
          remaining={`Remaining: ${balances?.EL?.balance ?? 0}`}
          icon={CalendarCheck}
          hint={
            balances?.isContract
              ? "Contract: 1 per 21 worked days"
              : `Cap ${balances?.EL?.cap || 15} days`
          }
        />

        <StatCard
          t={t}
          label="Short Leave"
          value={balances?.shortLeave?.monthlyLimit ?? 2}
          remaining={`Remaining: ${balances?.shortLeave?.remainingThisMonth ?? 0}`}
          icon={Clock3}
          hint="2 per calendar month"
        />

        {balances?.ML?.eligible && (
          <StatCard
            t={t}
            label="Maternity (ML)"
            value={`${Math.round((balances?.ML?.totalDays ?? 182) / 7)} wks`}
            remaining={`Remaining: ${Math.round((balances?.ML?.balance ?? 0) / 7)} wks`}
            icon={Baby}
            hint="Up to 26 weeks paid"
          />
        )}

        {balances?.PL?.eligible && (
          <StatCard
            t={t}
            label="Paternity (PL)"
            value={`${balances?.PL?.totalDays ?? 5} days`}
            remaining={`Remaining: ${balances?.PL?.balance ?? 0} days`}
            icon={Baby}
            hint="Avail within 90 days"
          />
        )}

        {canApprove && (
          <StatCard
            t={t}
            label="Pending Approvals"
            value={pending.length}
            icon={AlertTriangle}
            tone={t.accent}
          />
        )}
      </div>

      <ToolbarRow t={t}>
        <div style={{ fontFamily: "Fraunces", fontSize: 17, fontWeight: 600 }}>
          {canApprove ? "Leave requests" : "Your leave requests"}
        </div>
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
        <Empty
          t={t}
          icon={CalendarDays}
          title="No leave requests"
          hint="Submitted requests will appear here."
        />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {list.map((l) => {
            const p = employeeOf(l.user);
            const effDays = l.duration || computeEffectiveDays(l);
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
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 10,
                    alignItems: "flex-start",
                  }}
                >
                  <div>
                    {canApprove && (
                      <div
                        style={{
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: t.ink,
                          marginBottom: 3,
                        }}
                      >
                        {p?.name}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 4,
                        flexWrap: "wrap",
                      }}
                    >
                      <span
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          color: t.primaryDeep,
                        }}
                      >
                        {l.type}
                      </span>
                      {l.isHalfDay && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: t.accentSoft,
                            color: t.accent,
                            fontWeight: 600,
                          }}
                        >
                          ½ Day ({l.halfDaySession || "Half Day"})
                        </span>
                      )}
                      {l.hasMedicalCert && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: t.chipBg,
                            color: t.inkSoft,
                            fontWeight: 600,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 3,
                          }}
                        >
                          <FileText size={11} /> Medical Cert
                        </span>
                      )}
                      {l.isPreSanctioned === false && (
                        <span
                          style={{
                            fontSize: 11,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background: t.secondarySoft,
                            color: t.coral,
                            fontWeight: 600,
                          }}
                        >
                          Emergency / Non-Presanctioned
                        </span>
                      )}
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
                        {l.from} {l.from !== l.to ? `→ ${l.to}` : ""}
                      </span>
                      <span style={{ color: t.accent, fontWeight: 600 }}>
                        · {effDays} day{effDays === 1 ? "" : "s"}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 12.5,
                        color: t.inkSoft,
                        marginTop: 5,
                      }}
                    >
                      {l.reason}
                    </div>
                  </div>
                  <StatusChip status={l.status} t={t} />
                </div>

                {canApprove && l.status === "Pending" && (
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <Btn
                      t={t}
                      variant="subtle"
                      icon={Check}
                      onClick={() =>
                        setConfirmAction({ l, status: "Approved" })
                      }
                      style={{ fontSize: 12, padding: "5px 12px" }}
                    >
                      Approve
                    </Btn>
                    <Btn
                      t={t}
                      variant="danger"
                      icon={X}
                      onClick={() =>
                        setConfirmAction({ l, status: "Rejected" })
                      }
                      style={{ fontSize: 12, padding: "5px 12px" }}
                    >
                      Reject
                    </Btn>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {form && (
        <LeaveForm
          t={t}
          employee={currentEmp}
          balances={balances}
          existingLeaves={data.leaves}
          onSave={apply}
          onClose={() => setForm(false)}
        />
      )}

      {confirmAction && (
        <ConfirmDialog
          t={t}
          text={`${
            confirmAction.status === "Approved" ? "Approve" : "Reject"
          } this ${confirmAction.l.type} request (${confirmAction.l.from} → ${
            confirmAction.l.to
          })?`}
          onCancel={() => setConfirmAction(null)}
          onConfirm={() => setStatus(confirmAction.l, confirmAction.status)}
        />
      )}
    </div>
  );
}

function LeaveForm({ t, employee, balances, existingLeaves, onSave, onClose }) {
  const [f, setF] = useState({
    type: "Casual Leave",
    from: todayStr(),
    to: todayStr(),
    isHalfDay: false,
    halfDaySession: "First Half",
    isPreSanctioned: true,
    hasMedicalCert: false,
    childBirthDate: "",
    reason: "",
  });

  const [err, setErr] = useState("");
  const upd = (k, v) => {
    setF((s) => {
      const next = { ...s, [k]: v };
      // Auto sync 'to' date if half day or short leave
      if (k === "from" && (next.isHalfDay || next.type === "Short Leave")) {
        next.to = v;
      }
      if (k === "isHalfDay" && v) {
        next.to = next.from;
      }
      if (k === "type" && v === "Short Leave") {
        next.to = next.from;
      }
      return next;
    });
    setErr("");
  };

  const daysCount = f.isHalfDay ? 0.5 : calendarDaysBetween(f.from, f.to);
  const sandwichWarning =
    f.type === "Casual Leave" && !f.isPreSanctioned
      ? evaluateSandwichRule(f.from, f.to, false)
      : { applies: false };

  const submit = () => {
    const validationError = validateLeaveApplication(
      f,
      employee,
      balances,
      existingLeaves
    );
    if (validationError) {
      setErr(validationError);
      return;
    }
    onSave({
      ...f,
      reason: f.reason.trim(),
      duration: f.isHalfDay ? 0.5 : daysCount,
    });
  };

  return (
    <Modal t={t} title="Apply for Leave" onClose={onClose}>
      <Field t={t} label="Leave Type">
        <select
          style={inputStyle(t)}
          value={f.type}
          onChange={(e) => upd("type", e.target.value)}
        >
          {LEAVE_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </Field>

      {/* Half Day Option for CL and SL */}
      {(f.type === "Casual Leave" || f.type === "Sick Leave") && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 14,
            padding: "8px 12px",
            background: t.secondarySoft,
            borderRadius: 8,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              color: t.ink,
            }}
          >
            <input
              type="checkbox"
              checked={f.isHalfDay}
              onChange={(e) => upd("isHalfDay", e.target.checked)}
            />
            Apply for ½ Day (Half Day)
          </label>

          {f.isHalfDay && (
            <select
              style={{ ...inputStyle(t), width: "auto", padding: "4px 8px" }}
              value={f.halfDaySession}
              onChange={(e) => upd("halfDaySession", e.target.value)}
            >
              <option value="First Half">First Half</option>
              <option value="Second Half">Second Half</option>
            </select>
          )}
        </div>
      )}

      {/* Date Pickers */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: f.isHalfDay || f.type === "Short Leave" ? "1fr" : "1fr 1fr",
          gap: 12,
        }}
      >
        <Field
          t={t}
          label={f.isHalfDay || f.type === "Short Leave" ? "Date" : "From"}
        >
          <input
            type="date"
            style={inputStyle(t)}
            value={f.from}
            onChange={(e) => upd("from", e.target.value)}
          />
        </Field>

        {!f.isHalfDay && f.type !== "Short Leave" && (
          <Field t={t} label="To">
            <input
              type="date"
              style={inputStyle(t)}
              value={f.to}
              onChange={(e) => upd("to", e.target.value)}
            />
          </Field>
        )}
      </div>

      {/* Pre-sanctioned toggle for Casual Leave */}
      {f.type === "Casual Leave" && (
        <div style={{ marginBottom: 12 }}>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              cursor: "pointer",
              color: t.ink,
            }}
          >
            <input
              type="checkbox"
              checked={f.isPreSanctioned}
              onChange={(e) => upd("isPreSanctioned", e.target.checked)}
            />
            Pre-sanctioned (Prior approval obtained)
          </label>
          {!f.isPreSanctioned && (
            <div
              style={{
                fontSize: 11.5,
                color: t.coral,
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <AlertTriangle size={12} />
              Sandwich leave rule applies: Intervening weekend/holidays will be deducted as leave if not pre-approved.
            </div>
          )}
          {sandwichWarning.applies && (
            <div
              style={{
                fontSize: 11.5,
                color: t.coral,
                fontWeight: 600,
                marginTop: 4,
              }}
            >
              ⚠️ {sandwichWarning.reason} (+{sandwichWarning.extraDays} days penalty).
            </div>
          )}
        </div>
      )}

      {/* Mandatory Medical Certificate toggle if SL > 3 days */}
      {f.type === "Sick Leave" && daysCount > 3 && (
        <div
          style={{
            marginBottom: 14,
            padding: "10px 12px",
            background: t.accentSoft,
            borderRadius: 8,
            border: `1px solid ${t.line}`,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              color: t.ink,
            }}
          >
            <input
              type="checkbox"
              checked={f.hasMedicalCert}
              onChange={(e) => upd("hasMedicalCert", e.target.checked)}
            />
            Doctor's Medical Certificate Attached (Mandatory for &gt; 3 days)
          </label>
          <div style={{ fontSize: 11, color: t.inkSoft, marginTop: 4 }}>
            As per Section 5.3.5, SL exceeding 3 days requires a medical certificate issued by a registered doctor.
          </div>
        </div>
      )}

      {/* Child Birth Date for Paternity / Maternity */}
      {(f.type === "Paternity Leave" || f.type === "Maternity Leave") && (
        <Field
          t={t}
          label={
            f.type === "Paternity Leave"
              ? "Child's Date of Birth (Must be within 90 days)"
              : "Expected or Actual Delivery Date"
          }
        >
          <input
            type="date"
            style={inputStyle(t)}
            value={f.childBirthDate}
            onChange={(e) => upd("childBirthDate", e.target.value)}
          />
        </Field>
      )}

      {/* Reason Field */}
      <Field t={t} label="Reason for Absence">
        <textarea
          rows={3}
          style={{ ...inputStyle(t), resize: "vertical" }}
          value={f.reason}
          placeholder="Please state the specific reason for absence..."
          onChange={(e) => upd("reason", e.target.value)}
        />
      </Field>

      {/* Duration Summary */}
      <div
        style={{
          fontSize: 12,
          color: t.inkSoft,
          marginBottom: 12,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span>
          Total Duration: <strong>{f.isHalfDay ? "0.5 day" : `${daysCount} day${daysCount === 1 ? "" : "s"}`}</strong>
        </span>
        <span style={{ color: t.primaryDeep, fontWeight: 600 }}>
          {f.type === "Casual Leave" && `CL Balance: ${balances?.CL?.balance ?? 0} left`}
          {f.type === "Sick Leave" && `SL Balance: ${balances?.SL?.balance ?? 0} left`}
          {f.type === "Earned Leave" && `EL Balance: ${balances?.EL?.balance ?? 0} left`}
          {f.type === "Short Leave" && `${balances?.shortLeave?.remainingThisMonth ?? 0} Short Leaves left this month`}
        </span>
      </div>

      {err && (
        <div
          style={{
            color: t.coral,
            fontSize: 12.5,
            marginBottom: 12,
            padding: "8px 12px",
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
          marginTop: 16,
        }}
      >
        <Btn t={t} variant="ghost" onClick={onClose}>
          Cancel
        </Btn>
        <Btn t={t} variant="accent" icon={Check} onClick={submit}>
          Submit Request
        </Btn>
      </div>
    </Modal>
  );
}
