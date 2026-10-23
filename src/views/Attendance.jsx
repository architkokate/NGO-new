import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  CalendarDays,
  Calendar as CalendarIcon,
  Hourglass,
  ArrowUpRight,
  History,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { todayStr } from "../services/storage";

// Color palette adhering strictly to Rootline theme

const THEME = {
  light: {
    canvas: "#F8F5EF",
    surface: "#FFFFFF",
    ink: "#343746",
    inkSoft: "#707382",
    line: "#E6E0D6",

    primary: "#4659A8",
    primaryDeep: "#354681",

    gold: "#B87520",
    coral: "#BD594B",
    success: "#397653",

    railBg: "#354681",
    railInk: "#FFFFFF",
    chipBg: "#EDECF5",

    accent: "#E89A3C",
    accentSoft: "#FFF0DC",
  },

  dark: {
    canvas: "#202331",
    surface: "#2A2E3D",
    ink: "#F5F2EC",
    inkSoft: "#B9BBC7",
    line: "#414556",

    primary: "#9AA8EB",
    primaryDeep: "#4659A8",

    gold: "#F0C477",
    coral: "#E58A7D",
    success: "#80C69A",

    railBg: "#191D2D",
    railInk: "#F5F2EC",
    chipBg: "#34384A",

    accent: "#F0B66E",
    accentSoft: "#493A2D",
  },
};


function nowTime() {
  const d = new Date();
  return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
}

function computeHours(checkIn, checkOut) {
  if (!checkIn || !checkOut) return null;
  const [h1, m1] = checkIn.split(":").map(Number);
  const [h2, m2] = checkOut.split(":").map(Number);
  const mins = (h2 - h1) * 60 + (m2 - m1);
  if (mins <= 0) return null;
  return Math.round((mins / 60) * 10) / 10;
}

function formatTime12(timeStr) {
  if (!timeStr) return "—";
  const parts = timeStr.split(":");
  if (parts.length < 2) return timeStr;
  const h = parseInt(parts[0], 10);
  const m = parts[1];
  if (isNaN(h)) return timeStr;
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function formatDateShort(dStr) {
  if (!dStr) return "";
  const [y, m, d] = dStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  return `${dateObj.getDate()} ${dateObj.toLocaleDateString("en-US", { month: "short" })}`;
}

function formatFullDate(dStr) {
  if (!dStr) return "";
  const [y, m, d] = dStr.split("-").map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

function getMonthName(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1, 1);
  return d.toLocaleDateString("en-US", { month: "long" });
}

function shiftMonth(monthStr, delta) {
  const [y, m] = monthStr.split("-").map(Number);
  const d = new Date(y, m - 1 + delta, 1);
  const nextY = d.getFullYear();
  const nextM = String(d.getMonth() + 1).padStart(2, "0");
  return `${nextY}-${nextM}`;
}

function monthGrid(monthStr) {
  const [y, m] = monthStr.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const cells = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

function getWeekDays(anchorDateStr) {
  const [y, m, d] = anchorDateStr.split("-").map(Number);
  const anchor = new Date(y, m - 1, d);
  const dow = anchor.getDay(); // 0 is Sun, 1 is Mon...
  const distanceToMon = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() + distanceToMon);

  const days = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  for (let i = 0; i < 7; i++) {
    const day = new Date(monday);
    day.setDate(monday.getDate() + i);
    const yr = day.getFullYear();
    const mo = String(day.getMonth() + 1).padStart(2, "0");
    const da = String(day.getDate()).padStart(2, "0");
    days.push({
      dateStr: `${yr}-${mo}-${da}`,
      dayNum: day.getDate(),
      dayLabel: dayNames[i],
    });
  }
  return days;
}

export default function AttendanceView({ t, data, patch, notify, sessionUser }) {
    const PALETTE = {
    white: "#FFFFFF",
    cream: t.canvas,
    saffron: t.primary,
    golden: t.accent,
    deepCharcoal: t.primaryDeep,
    mutedText: t.inkSoft,
    line: t.line,
    lineSoft: t.line,
    cardSoftTint: t.chipBg,
    cardWarmBeige: t.accentSoft,
    cardMissingPill: t.accentSoft,
    dotGreen: t.success,
  };
  const today = todayStr();
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => today.slice(0, 7));
  const [resolveTarget, setResolveTarget] = useState(null);
  const [resolveCheckOutTime, setResolveCheckOutTime] = useState("17:30");
  const [resolveError, setResolveError] = useState("");

  // Authenticated user's personal attendance records sorted newest to oldest
  const myRecords = useMemo(() => {
    return (data.attendance || [])
      .filter((a) => a.user === sessionUser.id)
      .sort((a, b) => (a.date < b.date ? 1 : -1));
  }, [data.attendance, sessionUser.id]);

  const myToday = myRecords.find((a) => a.date === today);

  // Live elapsed timer for active shift
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  useEffect(() => {
    if (!myToday || myToday.checkOut) {
      setElapsedSeconds(0);
      return;
    }
    const update = () => {
      if (!myToday.checkIn) return;
      const [h, m] = myToday.checkIn.split(":").map(Number);
      const inDate = new Date();
      inDate.setHours(h, m, 0, 0);
      const now = new Date();
      const diff = Math.max(0, Math.floor((now.getTime() - inDate.getTime()) / 1000));
      setElapsedSeconds(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [myToday?.checkIn, myToday?.checkOut]);

  const elapsedHours = Math.floor(elapsedSeconds / 3600);
  const elapsedMins = Math.floor((elapsedSeconds % 3600) / 60);
  const elapsedSecs = elapsedSeconds % 60;

  // Monthly statistics
  const currentMonthStr = today.slice(0, 7);
  const thisMonthRecords = useMemo(() => {
    return myRecords.filter((r) => r.date.startsWith(currentMonthStr));
  }, [myRecords, currentMonthStr]);

  const thisMonthHours = useMemo(() => {
    return thisMonthRecords.reduce((sum, r) => sum + (r.hours || 0), 0);
  }, [thisMonthRecords]);

  const thisMonthDaysCount = useMemo(() => {
    return new Set(thisMonthRecords.map((r) => r.date)).size;
  }, [thisMonthRecords]);

  // Last working day record before today
  const lastWorkingRecord = useMemo(() => {
    return myRecords.find((r) => r.date < today);
  }, [myRecords, today]);

  // Determine current week days
  // If the last working record is in the previous week, user can see that week or today's week
  const weekDays = useMemo(() => {
    const anchor = (myToday ? today : (lastWorkingRecord?.date || today));
    return getWeekDays(anchor);
  }, [today, myToday, lastWorkingRecord]);

  // Map of date string to record
  const recordsMap = useMemo(() => {
    const map = {};
    myRecords.forEach((r) => {
      map[r.date] = r;
    });
    return map;
  }, [myRecords]);

  // Check In handler
  const handleCheckIn = () => {
    if (myToday) {
      notify("You are already checked in for today.");
      return;
    }
    const inTime = nowTime();
    const newRecord = {
      id: `${sessionUser.id}-${today}`,
      user: sessionUser.id,
      date: today,
      checkIn: inTime,
      checkOut: null,
      hours: null,
    };
    patch((d) => ({
      ...d,
      attendance: [...(d.attendance || []), newRecord],
    }));
    notify(`Checked in at ${formatTime12(inTime)}`);
  };

  // Check Out handler
  const handleCheckOut = () => {
    if (!myToday) {
      notify("You have not checked in yet today.");
      return;
    }
    if (myToday.checkOut) {
      notify("You have already checked out today.");
      return;
    }
    const outTime = nowTime();
    const hours = computeHours(myToday.checkIn, outTime);
    if (!hours || hours <= 0) {
      notify("Check-out time must be after check-in time.");
      return;
    }
    patch((d) => ({
      ...d,
      attendance: (d.attendance || []).map((a) =>
        a.id === myToday.id ? { ...a, checkOut: outTime, hours } : a
      ),
    }));
    notify(`Checked out at ${formatTime12(outTime)} (${hours}h recorded)`);
  };

  // Submit missing check-out resolution
  const submitResolveCheckOut = () => {
    if (!resolveTarget) return;
    if (!resolveCheckOutTime) {
      setResolveError("Please select a check-out time.");
      return;
    }
    const hours = computeHours(resolveTarget.checkIn, resolveCheckOutTime);
    if (!hours || hours <= 0) {
      setResolveError(`Check-out must be after check-in time (${formatTime12(resolveTarget.checkIn)}).`);
      return;
    }
    patch((d) => ({
      ...d,
      attendance: (d.attendance || []).map((a) =>
        a.id === resolveTarget.id
          ? { ...a, checkOut: resolveCheckOutTime, hours }
          : a
      ),
    }));
    notify(`Recorded check-out for ${formatFullDate(resolveTarget.date)}`);
    setResolveTarget(null);
    setResolveError("");
  };

  // Full calendar grid when toggled
  const calendarCells = useMemo(() => monthGrid(calendarMonth), [calendarMonth]);

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "8px 0 32px 0" }}>
      <style>{`
        .layout-grid-row-1 {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .layout-grid-row-2 {
          display: grid;
          grid-template-columns: 1fr 1.7fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        .week-pill-card {
          border-radius: 10px;
          padding: 10px 0;
          text-align: center;
          transition: transform 0.12s ease;
        }
        .btn-checkin {
          background-color: ${PALETTE.white};
          color: ${PALETTE.deepCharcoal};
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-checkin:hover {
          background-color: ${PALETTE.cream};
          transform: translateY(-1px);
        }
        .btn-checkout-saffron {
          background-color: ${PALETTE.saffron};
          color: #FFFFFF;
          border: none;
          border-radius: 8px;
          padding: 8px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .btn-checkout-saffron:hover {
          background-color: #E06F18;
          transform: translateY(-1px);
        }
        .btn-link-action {
          background: none;
          border: none;
          color: ${PALETTE.deepCharcoal};
          font-family: 'Inter', sans-serif;
          font-size: 12.5px;
          font-weight: 500;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 0;
        }
        .btn-link-action:hover {
          color: ${PALETTE.saffron};
        }
        @media (max-width: 640px) {
          .layout-grid-row-1,
          .layout-grid-row-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Top subtle subtitle */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: PALETTE.mutedText, fontFamily: "Inter, sans-serif" }}>
          A little progress, one day at a time.
        </div>
      </div>

      {/* Row 1: Today's Workday (Dark) + Days Recorded (Light Soft Tint) */}
      <div className="layout-grid-row-1">
        {/* Today's Workday */}
        <div
          style={{
            background: PALETTE.deepCharcoal,
            borderRadius: 14,
            padding: "20px 22px",
            color: PALETTE.white,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 154,
            boxSizing: "border-box",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span
                style={{
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  fontWeight: 600,
                  color: "rgba(255, 255, 255, 0.7)",
                }}
              >
                TODAY'S WORKDAY
              </span>
              <Clock size={16} color="rgba(255, 255, 255, 0.7)" />
            </div>

            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 22,
                fontWeight: 700,
                color: PALETTE.white,
                marginTop: 12,
                marginBottom: 4,
                letterSpacing: "-0.01em",
              }}
            >
              {myToday ? (myToday.checkOut ? "Shift complete" : "Checked in") : "Not checked in"}
            </div>

            <div style={{ fontSize: 13, color: "rgba(255, 255, 255, 0.75)" }}>
              {myToday
                ? (myToday.checkOut
                  ? `${myToday.hours || 0} h recorded today (${formatTime12(myToday.checkIn)} – ${formatTime12(myToday.checkOut)})`
                  : `Shift started at ${formatTime12(myToday.checkIn)} · ${String(elapsedHours).padStart(2, "0")}:${String(elapsedMins).padStart(2, "0")}:${String(elapsedSecs).padStart(2, "0")} elapsed`)
                : "Your workday hasn't started yet."}
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            {!myToday && (
              <button onClick={handleCheckIn} className="btn-checkin">
                <Clock size={14} color={PALETTE.deepCharcoal} />
                Check in
              </button>
            )}

            {myToday && !myToday.checkOut && (
              <button onClick={handleCheckOut} className="btn-checkout-saffron">
                <LogOut size={14} />
                Check out
              </button>
            )}

            {myToday && myToday.checkOut && (
              <div style={{ fontSize: 12, color: PALETTE.golden, display: "flex", alignItems: "center", gap: 5 }}>
                <CheckCircle2 size={13} />
                Shift logged for today
              </div>
            )}
          </div>
        </div>

        {/* Days Recorded */}
        <div
          style={{
            background: PALETTE.cardSoftTint,
            borderRadius: 14,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 154,
            boxSizing: "border-box",
          }}
        >
          <div>
            <CalendarDays size={18} color={PALETTE.deepCharcoal} style={{ opacity: 0.8 }} />
          </div>

          <div>
            <div style={{ fontSize: 12.5, color: PALETTE.mutedText }}>
              Days recorded
            </div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 28,
                fontWeight: 700,
                color: PALETTE.deepCharcoal,
                margin: "2px 0 2px 0",
                lineHeight: 1.1,
              }}
            >
              {thisMonthDaysCount}
            </div>
            <div style={{ fontSize: 12, color: PALETTE.mutedText }}>
              This month
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Hours Worked (Warm Beige) + Last Working Day (White) */}
      <div className="layout-grid-row-2">
        {/* Hours Worked */}
        <div
          style={{
            background: PALETTE.cardWarmBeige,
            borderRadius: 14,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 130,
            boxSizing: "border-box",
          }}
        >
          <div>
            <Hourglass size={18} color={PALETTE.deepCharcoal} style={{ opacity: 0.75 }} />
          </div>

          <div>
            <div style={{ fontSize: 12.5, color: PALETTE.mutedText }}>
              Hours worked
            </div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 26,
                fontWeight: 700,
                color: PALETTE.deepCharcoal,
                marginTop: 4,
                lineHeight: 1.1,
              }}
            >
              {thisMonthHours.toFixed(1)} h
            </div>
          </div>
        </div>

        {/* Last Working Day */}
        <div
          style={{
            background: PALETTE.white,
            border: `1px solid ${PALETTE.line}`,
            borderRadius: 14,
            padding: "20px 22px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: 130,
            boxSizing: "border-box",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12.5, color: PALETTE.mutedText }}>
              Last working day
            </span>
            <ArrowUpRight size={16} color={PALETTE.deepCharcoal} />
          </div>

          <div>
            <div
              style={{
                fontFamily: "Inter, sans-serif",
                fontSize: 17,
                fontWeight: 700,
                color: "#354681",
                margin: "4px 0 4px 0",
              }}
            >
              {lastWorkingRecord ? formatFullDate(lastWorkingRecord.date) : "No prior working day"}
            </div>

            {lastWorkingRecord && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: PALETTE.mutedText }}>
                  {formatTime12(lastWorkingRecord.checkIn)} · {lastWorkingRecord.checkOut ? `${formatTime12(lastWorkingRecord.checkOut)} (${lastWorkingRecord.hours} h)` : "Checkout missing"}
                </span>

                {!lastWorkingRecord.checkOut && (
                  <button
                    onClick={() => {
                      setResolveTarget(lastWorkingRecord);
                      setResolveCheckOutTime("17:30");
                      setResolveError("");
                    }}
                    style={{
                      background: "none",
                      border: "none",
                      color: PALETTE.saffron,
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: "pointer",
                      padding: "0 2px",
                      textDecoration: "underline",
                    }}
                  >
                    Resolve
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Row 3: Month at a glance (Week Strip + Full Calendar Toggle) */}
      <div
        style={{
          background: PALETTE.white,
          border: `1px solid ${PALETTE.line}`,
          borderRadius: 14,
          padding: "20px 22px",
          marginBottom: 14,
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 16.5,
              fontWeight: 700,
              color: PALETTE.deepCharcoal,
            }}
          >
            {getMonthName(today.slice(0, 7))} at a glance
          </div>

          <button
            onClick={() => setShowFullCalendar((prev) => !prev)}
            className="btn-link-action"
          >
            {showFullCalendar ? "View week view ↗" : "View calendar ↗"}
          </button>
        </div>

        {/* 7-Day Week Strip */}
        {!showFullCalendar ? (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: 8,
                textAlign: "center",
              }}
            >
              {weekDays.map((wDay) => {
                const rec = recordsMap[wDay.dateStr];
                const isToday = wDay.dateStr === today;
                const isMissing = rec && !rec.checkOut && !isToday;
                const isCompleted = rec && rec.checkOut;

                // Color configuration matching the screenshot:
                // Today: Dark charcoal pill
                // Missing: Warm peach/golden pill
                // Completed: Soft sage/cream pill
                // Neutral: Soft sage/cream pill
                let pillBg = PALETTE.cardSoftTint;
                let pillColor = "#354681";
                let dotColor = null;

                if (isToday) {
  pillBg = "#354681";
  pillColor = PALETTE.white;
  dotColor = "#E89A3C";
} else if (isMissing) {
  pillBg = PALETTE.cardMissingPill;
  pillColor = "#354681";
  dotColor = PALETTE.golden;
} else if (isCompleted) {
  pillBg = PALETTE.cardSoftTint;
  pillColor = "#354681";
  dotColor = PALETTE.dotGreen;
}

                return (
                  <div key={wDay.dateStr} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{ fontSize: 11.5, color: PALETTE.mutedText, marginBottom: 8 }}>
                      {wDay.dayLabel}
                    </div>

                    <div
                      className="week-pill-card"
                      style={{
                        width: "100%",
                        background: pillBg,
                        color: pillColor,
                      }}
                    >
                      <div style={{ fontSize: 13.5, fontWeight: isToday ? 700 : 600 }}>
                        {wDay.dayNum}
                      </div>
                    </div>

                    <div style={{ height: 10, marginTop: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {dotColor && (
                        <div
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: "50%",
                            background: dotColor,
                          }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* Full Monthly Calendar Expansion */
          <div style={{ paddingTop: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13.5, fontWeight: 600, color: PALETTE.deepCharcoal }}>
                {getMonthName(calendarMonth)} {calendarMonth.split("-")[0]}
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button
                  onClick={() => setCalendarMonth((m) => shiftMonth(m, -1))}
                  style={{ background: "none", border: `1px solid ${PALETTE.line}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setCalendarMonth((m) => shiftMonth(m, 1))}
                  style={{ background: "none", border: `1px solid ${PALETTE.line}`, borderRadius: 6, padding: "3px 8px", cursor: "pointer" }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, textAlign: "center", marginBottom: 6 }}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d, i) => (
                <div key={i} style={{ fontSize: 10.5, fontWeight: 600, color: PALETTE.mutedText }}>
                  {d}
                </div>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
              {calendarCells.map((d, i) => {
                if (d === null) return <div key={i} />;
                const dStr = `${calendarMonth}-${String(d).padStart(2, "0")}`;
                const rec = recordsMap[dStr];
                const isToday = dStr === today;
                return (
                  <div
                    key={i}
                    style={{
                      aspectRatio: 1,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 6,
                      background: isToday ? PALETTE.deepCharcoal : rec ? (rec.checkOut ? PALETTE.cardSoftTint : PALETTE.cardMissingPill) : "transparent",
                      color: isToday ? PALETTE.white : PALETTE.deepCharcoal,
                      fontSize: 11,
                      fontWeight: isToday ? 700 : 500,
                    }}
                  >
                    {d}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Row 4: Recent Attendance List */}
      <div
        style={{
          background: PALETTE.white,
          border: `1px solid ${PALETTE.line}`,
          borderRadius: 14,
          padding: "20px 22px",
          boxSizing: "border-box",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div
            style={{
              fontFamily: "Inter, sans-serif",
              fontSize: 16.5,
              fontWeight: 700,
              color: PALETTE.deepCharcoal,
            }}
          >
            Recent attendance
          </div>
          <History size={16} color={PALETTE.deepCharcoal} />
        </div>

        {myRecords.length === 0 ? (
          <div style={{ fontSize: 13, color: PALETTE.mutedText, padding: "16px 0", textAlign: "center" }}>
            No recent attendance records found.
          </div>
        ) : (
          <div>
            {myRecords.slice(0, 5).map((r, idx) => {
              const isMissing = !r.checkOut && r.date < today;
              return (
                <div
                  key={r.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "13px 0",
                    borderBottom: idx < Math.min(myRecords.length, 5) - 1 ? `1px solid ${PALETTE.lineSoft}` : "none",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: PALETTE.deepCharcoal }}>
                      {formatDateShort(r.date)}
                    </div>
                    <div style={{ fontSize: 12, color: isMissing ? PALETTE.saffron : PALETTE.mutedText, marginTop: 2 }}>
                      {isMissing ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <span>{r.checkIn} — Checkout missing</span>
                          <button
                            onClick={() => {
                              setResolveTarget(r);
                              setResolveCheckOutTime("17:30");
                              setResolveError("");
                            }}
                            style={{
                              background: "none",
                              border: "none",
                              color: PALETTE.saffron,
                              fontWeight: 600,
                              fontSize: 11.5,
                              cursor: "pointer",
                              textDecoration: "underline",
                              padding: 0,
                            }}
                          >
                            Resolve
                          </button>
                        </span>
                      ) : (
                        `${r.checkIn} — ${r.checkOut || "on shift"}`
                      )}
                    </div>
                  </div>

                  <div
                    style={{
                      fontFamily: "Inter, sans-serif",
                      fontSize: 13.5,
                      fontWeight: 600,
                      color: PALETTE.deepCharcoal,
                    }}
                  >
                    {r.hours ? `${r.hours} h` : (r.date === today ? "Active" : "—")}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom illustrative caption */}
      <div style={{ fontSize: 11.5, color: PALETTE.mutedText, marginTop: 18, textAlign: "left", opacity: 0.8 }}>
        Illustrative layout · Use actual logged-in user's records and calculate values from saved attendance data.
      </div>

      {/* Resolve Missing Check-Out Modal */}
      {resolveTarget && (
        <div
          onClick={() => setResolveTarget(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(41, 37, 36, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: PALETTE.white,
              borderRadius: 14,
              border: `1px solid ${PALETTE.line}`,
              boxShadow: "0 12px 36px rgba(41,37,36,0.2)",
              width: "100%",
              maxWidth: 400,
              padding: "24px",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: "Inter, sans-serif", fontSize: 17, fontWeight: 700, color: PALETTE.deepCharcoal }}>
                Resolve missing check-out
              </div>
              <button
                onClick={() => setResolveTarget(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: PALETTE.mutedText, padding: 4 }}
              >
                <X size={17} />
              </button>
            </div>

            <div style={{ fontSize: 13, color: PALETTE.mutedText, marginBottom: 16 }}>
              Record check-out time for <b>{formatFullDate(resolveTarget.date)}</b>.
            </div>

            <div
              style={{
                background: PALETTE.cream,
                borderRadius: 8,
                border: `1px solid ${PALETTE.lineSoft}`,
                padding: "10px 12px",
                marginBottom: 16,
              }}
            >
              <div style={{ fontSize: 11.5, color: PALETTE.mutedText }}>Check-In Timestamp</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: PALETTE.deepCharcoal, marginTop: 2 }}>
                {formatTime12(resolveTarget.checkIn)} ({resolveTarget.checkIn})
              </div>
            </div>

            <label style={{ display: "block", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: PALETTE.deepCharcoal, marginBottom: 6 }}>
                Departure Time (Check-Out)
              </div>
              <input
                type="time"
                value={resolveCheckOutTime}
                onChange={(e) => setResolveCheckOutTime(e.target.value)}
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "9px 12px",
                  borderRadius: 8,
                  border: `1px solid ${PALETTE.line}`,
                  background: PALETTE.white,
                  fontFamily: "Inter, sans-serif",
                  fontSize: 14,
                  color: PALETTE.deepCharcoal,
                }}
              />
            </label>

            {resolveCheckOutTime && (
              <div style={{ fontSize: 12, color: PALETTE.mutedText, marginBottom: 14 }}>
                Calculated duration:{" "}
                <b style={{ color: PALETTE.saffron }}>
                  {computeHours(resolveTarget.checkIn, resolveCheckOutTime) || 0} h
                </b>
              </div>
            )}

            {resolveError && (
              <div style={{ fontSize: 12, color: "#C1553C", marginBottom: 14 }}>
                {resolveError}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 18 }}>
              <button
                onClick={() => setResolveTarget(null)}
                style={{
                  background: "transparent",
                  border: `1px solid ${PALETTE.line}`,
                  borderRadius: 8,
                  padding: "8px 14px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "pointer",
                  color: PALETTE.deepCharcoal,
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitResolveCheckOut}
                style={{
                  background: PALETTE.saffron,
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 16px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: "#FFFFFF",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
