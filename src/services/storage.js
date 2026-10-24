import {
  seedEmployees,
  seedVolunteers,
  seedProjects,
  seedTasks,
  seedAttendance,
  seedLeaves,
  seedWorklogs,
  seedNotifications,
} from "./seeds";

const STORAGE_KEY = "rootline-data-v2";

/** Current local date as YYYY-MM-DD. */
export function todayStr() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

/** The most recent `n` weekdays before today, oldest first. */
export function recentWeekdays(n) {
  const out = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (out.length < n) {
    d.setDate(d.getDate() - 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) {
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      out.push(`${d.getFullYear()}-${m}-${day}`);
    }
  }
  return out.reverse();
}

export const freshData = () => ({
  employees: seedEmployees(),
  volunteers: seedVolunteers(),
  projects: seedProjects(),
  tasks: seedTasks(),
  attendance: seedAttendance(),
  leaves: seedLeaves(),
  worklogs: seedWorklogs(),
  notifications: seedNotifications(),
});

function normalizeData(parsed) {
  if (!parsed || typeof parsed !== "object") return freshData();
  // Ensure employees have gender and employmentType
  if (Array.isArray(parsed.employees)) {
    parsed.employees = parsed.employees.map((e) => ({
      ...e,
      gender: e.gender || "female",
      employmentType: e.employmentType || "permanent",
    }));
  }
  return parsed;
}

export async function loadData() {
  // Try Antigravity native storage
  try {
    if (window.storage && typeof window.storage.get === "function") {
      const res = await window.storage.get(STORAGE_KEY, false);
      if (res && res.value) {
        return normalizeData(JSON.parse(res.value));
      }
    }
  } catch (e) {
    console.warn("Native storage load failed, checking localStorage...", e);
  }

  // Try standard localStorage
  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) {
      return normalizeData(JSON.parse(local));
    }
  } catch (e) {
    console.error("localStorage load failed:", e);
  }

  // Return fresh seed data
  return freshData();
}

export async function saveData(data) {
  // Save to Antigravity native storage
  try {
    if (window.storage && typeof window.storage.set === "function") {
      await window.storage.set(STORAGE_KEY, JSON.stringify(data), false);
    }
  } catch (e) {
    console.error("Native storage save failed:", e);
  }

  // Save to standard localStorage
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("localStorage save failed:", e);
  }
}

/**
 * Convert a file to a Base64 string for persistent client-side storage.
 */
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Export data to a JSON backup file.
 */
export function exportToJSON(data, filename = "rootline-backup.json") {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", jsonString);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Export a dataset to a CSV spreadsheet.
 */
export function exportToCSV(headers, rows, filename = "export.csv") {
  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row
        .map((val) => {
          const stringVal = val === null || val === undefined ? "" : String(val);
          // Escape quotes
          const escaped = stringVal.replace(/"/g, '""');
          // Wrap in quotes if it contains commas or quotes
          return escaped.includes(",") || escaped.includes('"') || escaped.includes("\n")
            ? `"${escaped}"`
            : escaped;
        })
        .join(",")
    ),
  ].join("\r\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", filename);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}
