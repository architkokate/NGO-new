// Leave Policy Rules Engine & Calculations
// Implements Sevavardhini Leave Policy

export const PUBLIC_HOLIDAYS_2026 = [
  "2026-01-26", // Republic Day
  "2026-03-03", // Maha Shivratri
  "2026-03-25", // Holi
  "2026-04-14", // Ambedkar Jayanti
  "2026-05-01", // Maharashtra Day / Labour Day
  "2026-08-15", // Independence Day
  "2026-09-04", // Ganesh Chaturthi
  "2026-10-02", // Gandhi Jayanti
  "2026-10-20", // Dussehra
  "2026-11-08", // Diwali
  "2026-12-25", // Christmas
];

export const LEAVE_TYPES = [
  "Casual Leave",
  "Sick Leave",
  "Earned Leave",
  "Short Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Unpaid Leave",
];

export const POLICY_CONFIG = {
  SL_ANNUAL: 15,           // Sick leave: 15/year
  CL_ANNUAL: 7,            // Casual leave: 7/year
  EL_ANNUAL_PERMANENT: 15, // Earned leave for permanent: 15/year
  SHORT_LEAVE_MONTHLY: 2,  // Short leave: 2/month
  MATERNITY_WEEKS: 26,     // Maternity leave: 26 weeks (182 days)
  PATERNITY_DAYS: 5,       // Paternity leave: 5 days
  PROBATION_MONTHS: 6,     // Probation period: 6 months
  SL_ACCUMULATION_CAP: 14, // Max SL accumulation: 14 days
  EL_ACCUMULATION_CAP_TIER1: 15, // Max EL accumulation if tenure < 2 years: 15 days
  EL_ACCUMULATION_CAP_TIER2: 30, // Max EL accumulation if tenure >= 2 years: 30 days
  CL_ACCUMULATION_CAP: 0,  // CL accumulation: Nil (lapses at year end)
  NO_ENCASHMENT: true,     // No encashment for any kind of leave
};

/** Parse YYYY-MM-DD into a localized midnight Date object */
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/** Check if a date string is Saturday (6) or Sunday (0) */
export function isWeekend(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return false;
  const day = d.getDay();
  return day === 0 || day === 6;
}

/** Check if a date string is a public holiday */
export function isHoliday(dateStr) {
  return PUBLIC_HOLIDAYS_2026.includes(dateStr);
}

/** Calendar days between two date strings inclusive */
export function calendarDaysBetween(fromStr, toStr) {
  if (!fromStr || !toStr) return 0;
  const from = parseDate(fromStr);
  const to = parseDate(toStr);
  const diffTime = to - from;
  if (diffTime < 0) return 0;
  return Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

/** Format date object to YYYY-MM-DD */
export function formatDate(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Check if an employee is currently on probation (first 6 months from joined date) */
export function isEmployeeOnProbation(employee, referenceDate = new Date()) {
  if (!employee?.joined) return false;
  if (employee.employmentType === "probation") return true;
  if (employee.employmentType === "contract") return false;

  const joined = parseDate(employee.joined);
  const probationEnd = new Date(joined);
  probationEnd.setMonth(probationEnd.getMonth() + POLICY_CONFIG.PROBATION_MONTHS);
  return referenceDate < probationEnd;
}

/** Calculate years of service completed */
export function getYearsOfService(employee, referenceDate = new Date()) {
  if (!employee?.joined) return 0;
  const joined = parseDate(employee.joined);
  const diffTime = referenceDate - joined;
  return Math.max(0, diffTime / (1000 * 60 * 60 * 24 * 365.25));
}

/** Calculate pro-rata entitlement for regular employees joining mid-year */
export function getProRataQuota(annualQuota, joinedDateStr, currentYear = new Date().getFullYear()) {
  if (!joinedDateStr) return annualQuota;
  const joined = parseDate(joinedDateStr);
  if (joined.getFullYear() < currentYear) {
    return annualQuota;
  }
  // Joined in current year
  const startOfYear = new Date(currentYear, 0, 1);
  const endOfYear = new Date(currentYear, 11, 31);
  const totalDaysInYear = (endOfYear - startOfYear) / (1000 * 60 * 60 * 24) + 1;
  const daysActive = Math.max(0, (endOfYear - joined) / (1000 * 60 * 60 * 24) + 1);

  const raw = (daysActive / totalDaysInYear) * annualQuota;
  return Math.round(raw * 2) / 2; // round to nearest 0.5
}

/**
 * Check Sandwich Leave rule for Casual Leave (Section 5.8):
 * If CL is taken between two holidays/weekends without prior approval,
 * the intervening holidays/weekends are treated as leave.
 */
export function evaluateSandwichRule(fromStr, toStr, isPreSanctioned = true) {
  if (isPreSanctioned) {
    return { applies: false, extraDays: 0, reason: "" };
  }

  const from = parseDate(fromStr);
  const to = parseDate(toStr);
  if (!from || !to) return { applies: false, extraDays: 0, reason: "" };

  const dayBefore = new Date(from);
  dayBefore.setDate(dayBefore.getDate() - 1);
  const dayBeforeStr = formatDate(dayBefore);

  const dayAfter = new Date(to);
  dayAfter.setDate(dayAfter.getDate() + 1);
  const dayAfterStr = formatDate(dayAfter);

  const prevIsOff = isWeekend(dayBeforeStr) || isHoliday(dayBeforeStr);
  const nextIsOff = isWeekend(dayAfterStr) || isHoliday(dayAfterStr);

  if (prevIsOff && nextIsOff) {
    // Both ends touch weekly-off or holiday without pre-approval
    return {
      applies: true,
      extraDays: 2, // intervening or adjacent off-days penalized
      reason: "CL borders holidays without pre-approval (Sandwich Rule applied).",
    };
  }

  return { applies: false, extraDays: 0, reason: "" };
}

/**
 * Calculate effective leave days for a request
 */
export function computeEffectiveDays(leave) {
  if (leave.isHalfDay) return 0.5;
  const baseDays = calendarDaysBetween(leave.from, leave.to);
  const sandwich = leave.type === "Casual Leave" ? evaluateSandwichRule(leave.from, leave.to, leave.isPreSanctioned !== false) : { applies: false, extraDays: 0 };
  return baseDays + (sandwich.applies ? sandwich.extraDays : 0);
}

/**
 * Calculate all leave balances for a given employee
 */
export function calculateEmployeeBalances(employee, leaves = [], attendance = []) {
  if (!employee) return null;

  const currentYear = new Date().getFullYear();
  const currentMonth = `${currentYear}-${String(new Date().getMonth() + 1).padStart(2, "0")}`;
  const isProbation = isEmployeeOnProbation(employee);
  const yearsWorked = getYearsOfService(employee);
  const isContract = employee.employmentType === "contract";

  // Filter approved leaves for this employee in current year
  const empApprovedLeaves = leaves.filter((l) => {
    if (l.user !== employee.id && l.user !== employee.person) return false;
    if (l.status !== "Approved") return false;
    const leaveYear = l.from ? parseInt(l.from.slice(0, 4), 10) : currentYear;
    return leaveYear === currentYear;
  });

  // 1. Casual Leave (CL) - 7 days pro rata, zero accumulation
  const clEntitled = isProbation ? 0 : getProRataQuota(POLICY_CONFIG.CL_ANNUAL, employee.joined, currentYear);
  const clUsed = empApprovedLeaves
    .filter((l) => l.type === "Casual Leave")
    .reduce((sum, l) => sum + (l.duration || computeEffectiveDays(l)), 0);

  // 2. Sick Leave (SL) - 15 days pro rata, max 14 days accumulation
  const slEntitled = isProbation ? 0 : getProRataQuota(POLICY_CONFIG.SL_ANNUAL, employee.joined, currentYear);
  const slUsed = empApprovedLeaves
    .filter((l) => l.type === "Sick Leave")
    .reduce((sum, l) => sum + (l.duration || computeEffectiveDays(l)), 0);

  // 3. Earned Leave (EL)
  let elEntitled = 0;
  if (isContract) {
    // 1 EL for every 21 working days (Attendance records)
    const empAttendance = attendance.filter((a) => (a.user === employee.id || a.user === employee.person) && a.checkIn);
    const workedDays = empAttendance.length || (employee.contractWorkingDays || 21);
    elEntitled = Math.floor(workedDays / 21);
  } else if (!isProbation) {
    // 15 days per calendar year (pro rata for mid-year joiners)
    elEntitled = getProRataQuota(POLICY_CONFIG.EL_ANNUAL_PERMANENT, employee.joined, currentYear);
  }
  const elUsed = empApprovedLeaves
    .filter((l) => l.type === "Earned Leave")
    .reduce((sum, l) => sum + (l.duration || computeEffectiveDays(l)), 0);

  // 4. Short Leave - 2 per month
  const shortLeavesThisMonth = leaves.filter((l) => {
    if (l.user !== employee.id && l.user !== employee.person) return false;
    if (l.status === "Rejected") return false;
    if (l.type !== "Short Leave") return false;
    return l.from && l.from.startsWith(currentMonth);
  }).length;

  // 5. Maternity Leave - 26 weeks (182 days)
  const isFemale = employee.gender?.toLowerCase() === "female";
  const joinedDate = employee.joined ? parseDate(employee.joined) : new Date();
  const daysOnRolls = Math.max(0, Math.round((new Date() - joinedDate) / (1000 * 60 * 60 * 24)));
  const mlEligible = isFemale && daysOnRolls >= 80;
  const mlUsed = empApprovedLeaves
    .filter((l) => l.type === "Maternity Leave")
    .reduce((sum, l) => sum + (l.duration || computeEffectiveDays(l)), 0);

  // 6. Paternity Leave - 5 days
  const isMale = employee.gender?.toLowerCase() === "male";
  const plEligible = isMale && !isProbation;
  const plUsed = empApprovedLeaves
    .filter((l) => l.type === "Paternity Leave")
    .reduce((sum, l) => sum + (l.duration || computeEffectiveDays(l)), 0);

  // Accumulation Caps (Section 7)
  const elCap = yearsWorked >= 2 ? POLICY_CONFIG.EL_ACCUMULATION_CAP_TIER2 : POLICY_CONFIG.EL_ACCUMULATION_CAP_TIER1;

  return {
    isProbation,
    isContract,
    yearsWorked: Math.round(yearsWorked * 10) / 10,
    noEncashment: true,
    CL: {
      entitled: clEntitled,
      used: clUsed,
      balance: Math.max(0, clEntitled - clUsed),
      cap: POLICY_CONFIG.CL_ACCUMULATION_CAP, // 0 (Nil)
    },
    SL: {
      entitled: slEntitled,
      used: slUsed,
      balance: Math.max(0, slEntitled - slUsed),
      cap: POLICY_CONFIG.SL_ACCUMULATION_CAP, // 14 days
    },
    EL: {
      entitled: elEntitled,
      used: elUsed,
      balance: Math.max(0, elEntitled - elUsed),
      cap: elCap, // 15 or 30 days
    },
    shortLeave: {
      monthlyLimit: POLICY_CONFIG.SHORT_LEAVE_MONTHLY,
      usedThisMonth: shortLeavesThisMonth,
      remainingThisMonth: Math.max(0, POLICY_CONFIG.SHORT_LEAVE_MONTHLY - shortLeavesThisMonth),
    },
    ML: {
      eligible: mlEligible,
      daysOnRolls,
      totalDays: POLICY_CONFIG.MATERNITY_WEEKS * 7, // 182 days
      used: mlUsed,
      balance: Math.max(0, POLICY_CONFIG.MATERNITY_WEEKS * 7 - mlUsed),
    },
    PL: {
      eligible: plEligible,
      totalDays: POLICY_CONFIG.PATERNITY_DAYS, // 5 days
      used: plUsed,
      balance: Math.max(0, POLICY_CONFIG.PATERNITY_DAYS - plUsed),
    },
  };
}

/**
 * Validate a leave application against policy rules
 */
export function validateLeaveApplication(f, employee, balances, existingLeaves = []) {
  if (!f.from || !f.to) {
    return "Start and end dates are required.";
  }
  if (f.to < f.from) {
    return "End date cannot be earlier than start date.";
  }
  if (!f.reason || !f.reason.trim()) {
    return "A specific reason for absence is required.";
  }

  const duration = f.isHalfDay ? 0.5 : calendarDaysBetween(f.from, f.to);

  // 1. Probation Rule (Section 5.4)
  if (balances.isProbation && f.type !== "Unpaid Leave") {
    return "Employees on probation (first 6 months) are not eligible for paid leave. Please apply for Unpaid Leave (subject to CEO/GM approval).";
  }

  // 2. Casual Leave (CL) Rules (Section 5.2)
  if (f.type === "Casual Leave") {
    if (duration > 3) {
      return "Casual Leave cannot exceed 3 consecutive days at a time.";
    }
    if (duration > balances.CL.balance) {
      return `Insufficient Casual Leave balance. You only have ${balances.CL.balance} CL remaining.`;
    }
  }

  // 3. Earned Leave (EL) Rules (Section 5.1)
  if (f.type === "Earned Leave") {
    if (f.isHalfDay || duration < 1) {
      return "Earned Leave (EL) must be availed for a minimum of 1 full day.";
    }
    if (duration > balances.EL.balance) {
      return `Insufficient Earned Leave balance. You only have ${balances.EL.balance} EL remaining.`;
    }
  }

  // 4. Sick Leave (SL) Rules (Section 5.3)
  if (f.type === "Sick Leave") {
    if (duration > 3 && !f.hasMedicalCert && !f.medicalCertificate) {
      return "For Sick Leave exceeding 3 days, a medical certificate issued by a registered doctor is mandatory.";
    }
    if (duration > balances.SL.balance) {
      return `Insufficient Sick Leave balance. You only have ${balances.SL.balance} SL remaining.`;
    }
  }

  // 5. Short Leave Rules (Section 5.5)
  if (f.type === "Short Leave") {
    if (balances.shortLeave.remainingThisMonth <= 0) {
      return "You have already used your quota of 2 Short Leaves for this calendar month.";
    }
    if (f.from !== f.to) {
      return "Short Leave is for a few hours on a single day. Start and end date must match.";
    }
  }

  // 6. Maternity Leave (ML) Rules (Section 5.6)
  if (f.type === "Maternity Leave") {
    if (!balances.ML.eligible) {
      return "Maternity Leave is eligible only for female regular employees who have completed at least 80 days on rolls.";
    }
    if (duration > balances.ML.balance) {
      return `Maternity leave requested exceeds remaining entitlement (${balances.ML.balance} days).`;
    }
  }

  // 7. Paternity Leave (PL) Rules (Section 5.7)
  if (f.type === "Paternity Leave") {
    if (!balances.PL.eligible) {
      return "Paternity leave is eligible only for regular male employees who have completed probation.";
    }
    if (duration > 5) {
      return "Paternity leave is strictly limited to 5 days and must be taken in one continuous spell.";
    }
    if (f.childBirthDate) {
      const birth = parseDate(f.childBirthDate);
      const leaveStart = parseDate(f.from);
      const daysSinceBirth = (leaveStart - birth) / (1000 * 60 * 60 * 24);
      if (daysSinceBirth > 90 || daysSinceBirth < 0) {
        return "Paternity leave must be availed within 90 days from the child's date of birth.";
      }
    }
  }

  // 8. Combination Rule (Section 5.3.6): SL, CL, and EL shall not be combined
  const conflictingAdjacent = existingLeaves.find((l) => {
    if (l.user !== employee.id && l.user !== employee.person) return false;
    if (l.status === "Rejected") return false;
    if (l.id === f.id) return false;
    const isAdjacentType = ["Casual Leave", "Sick Leave", "Earned Leave"].includes(l.type) && ["Casual Leave", "Sick Leave", "Earned Leave"].includes(f.type) && l.type !== f.type;
    if (!isAdjacentType) return false;

    // Check if dates are immediately adjacent
    const lTo = parseDate(l.to);
    const fFrom = parseDate(f.from);
    const dayGap = Math.abs((fFrom - lTo) / (1000 * 60 * 60 * 24));
    return dayGap <= 1;
  });

  if (conflictingAdjacent && !f.ceoExemption) {
    return `Policy Notice: ${f.type} cannot be combined directly with adjacent ${conflictingAdjacent.type} without CEO/GM special approval.`;
  }

  return null; // Valid
}
