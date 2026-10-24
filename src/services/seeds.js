function recentWeekdays(n) {
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

export const USERS = [
  { id: "u1", role: "admin", name: "Amara Osei", title: "Executive Director", initials: "AO", person: null },
  { id: "u2", role: "manager", name: "Daniel Cruz", title: "Program Manager", initials: "DC", person: "e5" },
  { id: "u3", role: "coordinator", name: "Priya Nair", title: "Field Coordinator", initials: "PN", person: "e6" },
  { id: "u4", role: "employee", name: "Tomas Weber", title: "Logistics Officer", initials: "TW", person: "e1" },
  { id: "u5", role: "volunteer", name: "Grace Mbeki", title: "Community Volunteer", initials: "GM", person: "v1" },
];

export const personIdsOf = (u) => [u.id, u.person].filter(Boolean);

export const ROLE_LABEL = {
  admin: "Administrator",
  manager: "Project Manager",
  coordinator: "Coordinator",
  employee: "Employee",
  volunteer: "Volunteer",
};

export const seedEmployees = () => [
  { id: "e1", name: "Tomas Weber", role: "Logistics Officer", dept: "Operations", email: "tomas.weber@rootline.org", phone: "+1 405 555 0142", status: "Active", joined: "2022-03-14", gender: "male", employmentType: "permanent", photo: "TW" },
  { id: "e2", name: "Lena Fischer", role: "Field Nurse", dept: "Health", email: "lena.fischer@rootline.org", phone: "+1 405 555 0198", status: "Active", joined: "2021-11-02", gender: "female", employmentType: "permanent", photo: "LF" },
  { id: "e3", name: "Kwame Boateng", role: "Water Engineer", dept: "WASH", email: "kwame.boateng@rootline.org", phone: "+233 24 555 0110", status: "Active", joined: "2023-01-09", gender: "male", employmentType: "contract", contractWorkingDays: 84, photo: "KB" },
  { id: "e4", name: "Sofia Reyes", role: "Finance Officer", dept: "Finance", email: "sofia.reyes@rootline.org", phone: "+1 405 555 0177", status: "On Leave", joined: "2020-06-23", gender: "female", employmentType: "permanent", photo: "SR" },
  { id: "e5", name: "Daniel Cruz", role: "Program Manager", dept: "Programs", email: "daniel.cruz@rootline.org", phone: "+1 405 555 0133", status: "Active", joined: "2019-09-01", gender: "male", employmentType: "permanent", photo: "DC" },
  { id: "e6", name: "Priya Nair", role: "Field Coordinator", dept: "Programs", email: "priya.nair@rootline.org", phone: "+91 98 555 01144", status: "Active", joined: "2022-07-19", gender: "female", employmentType: "permanent", photo: "PN" },
  { id: "e7", name: "Omar Haddad", role: "Education Lead", dept: "Education", email: "omar.haddad@rootline.org", phone: "+962 79 555 0121", status: "Active", joined: "2026-06-01", gender: "male", employmentType: "probation", photo: "OH" },
];

export const seedVolunteers = () => [
  { id: "v1", name: "Grace Mbeki", skills: ["Teaching", "Translation"], availability: "Weekends", hours: 132, status: "Active", assigned: "p3", email: "grace.mbeki@mail.com", phone: "+27 71 555 0110" },
  { id: "v2", name: "Noah Bergström", skills: ["Carpentry", "Driving"], availability: "Weekdays", hours: 88, status: "Active", assigned: "p1", email: "noah.b@mail.com", phone: "+46 70 555 0199" },
  { id: "v3", name: "Aisha Rahman", skills: ["First Aid", "Counselling"], availability: "Flexible", hours: 210, status: "Active", assigned: "p2", email: "aisha.r@mail.com", phone: "+880 17 555 0143" },
  { id: "v4", name: "Marcus Lee", skills: ["Photography", "Social Media"], availability: "Weekends", hours: 54, status: "Inactive", assigned: null, email: "marcus.lee@mail.com", phone: "+1 213 555 0176" },
  { id: "v5", name: "Elena Popescu", skills: ["Logistics", "Cooking"], availability: "Weekdays", hours: 97, status: "Active", assigned: "p1", email: "elena.p@mail.com", phone: "+40 72 555 0155" },
];

export const seedProjects = () => [
  { id: "p1", name: "Clean Water Access — Kponsu", desc: "Drilling and maintaining 6 boreholes across Kponsu district to serve ~3,200 residents.", status: "Active", coordinator: "e6", team: ["e1", "e3", "v2", "v5"], start: "2026-01-12", end: "2026-09-30", progress: 62, budget: 84000, spent: 49600, documents: [] },
  { id: "p2", name: "Maternal Health Outreach", desc: "Mobile clinics and prenatal training for rural communities in the eastern province.", status: "Active", coordinator: "e5", team: ["e2", "v3"], start: "2025-11-01", end: "2026-08-15", progress: 78, budget: 61000, spent: 51200, documents: [] },
  { id: "p3", name: "Literacy for All", desc: "After-school literacy program for 240 children across 5 villages.", status: "Delayed", coordinator: "e7", team: ["e6", "v1"], start: "2025-09-01", end: "2026-06-30", progress: 41, budget: 32000, spent: 21800, documents: [] },
  { id: "p4", name: "Emergency Flood Relief", desc: "Distribution of shelter kits and clean water supplies following seasonal flooding.", status: "Completed", coordinator: "e5", team: ["e1", "e2"], start: "2025-07-05", end: "2025-08-20", progress: 100, budget: 45000, spent: 43250, documents: [] },
  { id: "p5", name: "Youth Vocational Training", desc: "Carpentry and tailoring workshops for out-of-school youth.", status: "Planning", coordinator: "e6", team: ["e7"], start: "2026-09-01", end: "2027-03-01", progress: 5, budget: 27000, spent: 900, documents: [] },
];

export const seedTasks = () => [
  { id: "t1", project: "p1", title: "Survey borehole site #4", assignee: "e3", priority: "High", due: "2026-08-08", status: "In Progress", comments: [{ by: "e6", text: "Please confirm access with village elder first.", at: "2026-08-04" }], attachments: [] },
  { id: "t2", project: "p1", title: "Order replacement pump parts", assignee: "e1", priority: "Medium", due: "2026-08-10", status: "Pending", comments: [], attachments: [] },
  { id: "t3", project: "p1", title: "Community training — pump maintenance", assignee: "v2", priority: "Medium", due: "2026-08-02", status: "Overdue", comments: [], attachments: [] },
  { id: "t4", project: "p2", title: "Restock prenatal vitamin supply", assignee: "e2", priority: "High", due: "2026-08-07", status: "In Progress", comments: [], attachments: [] },
  { id: "t5", project: "p2", title: "Schedule mobile clinic — Rango village", assignee: "v3", priority: "Low", due: "2026-08-14", status: "Pending", comments: [], attachments: [] },
  { id: "t6", project: "p3", title: "Print literacy workbooks (Batch 3)", assignee: "e7", priority: "Medium", due: "2026-08-01", status: "Overdue", comments: [], attachments: [] },
  { id: "t7", project: "p3", title: "Volunteer teacher onboarding", assignee: "v1", priority: "High", due: "2026-08-09", status: "In Progress", comments: [], attachments: [] },
  { id: "t8", project: "p1", title: "Submit Q3 water quality report", assignee: "e3", priority: "High", due: "2026-07-28", status: "Completed", comments: [], attachments: [] },
  { id: "t9", project: "p2", title: "Coordinate transport for clinic staff", assignee: "v3", priority: "Medium", due: "2026-08-06", status: "Completed", comments: [], attachments: [] },
];

export const seedAttendance = () => {
  const days = recentWeekdays(5);
  const out = [];
  USERS.forEach((u) => {
    days.forEach((d, i) => {
      if (i === days.length - 1 && u.id === USERS[USERS.length - 1].id) return;
      out.push({
        id: `${u.id}-${d}`,
        user: u.id,
        date: d,
        checkIn: "08:5" + (i % 3),
        checkOut: i < days.length - 1 ? "17:3" + (i % 4) : null,
        hours: i < days.length - 1 ? 8.5 : null,
      });
    });
  });
  return out;
};

export const seedLeaves = () => [
  { id: "l1", user: "e4", type: "Sick Leave", from: "2026-08-05", to: "2026-08-08", duration: 4, hasMedicalCert: true, reason: "Recovering from minor surgery with doctor certificate.", status: "Approved" },
  { id: "l2", user: "e2", type: "Casual Leave", from: "2026-08-18", to: "2026-08-19", duration: 2, isPreSanctioned: true, reason: "Family event.", status: "Pending" },
  { id: "l3", user: "e3", type: "Earned Leave", from: "2026-08-12", to: "2026-08-13", duration: 2, reason: "Contract accrued earned leave for rest.", status: "Pending" },
  { id: "l4", user: "e1", type: "Earned Leave", from: "2026-07-14", to: "2026-07-18", duration: 5, reason: "Annual scheduled rest period.", status: "Approved" },
  { id: "l5", user: "e7", type: "Unpaid Leave", from: "2026-07-02", to: "2026-07-03", duration: 2, reason: "Urgent personal family matter during probation.", status: "Approved" },
  { id: "l6", user: "e6", type: "Short Leave", from: "2026-08-04", to: "2026-08-04", duration: 0.25, reason: "Emergency bank document verification.", status: "Approved" },
];

export const seedWorklogs = () => [
  { id: "w1", user: "e3", date: "2026-08-05", summary: "Surveyed site #4, met with village elder, mapped access road.", hours: 6.5, completed: "Site survey, elder consultation", pending: "Await council sign-off", files: [], status: "Reviewed" },
  { id: "w2", user: "v2", date: "2026-08-05", summary: "Assisted with pump part inventory and labeling.", hours: 4, completed: "Inventory count", pending: "None", files: [], status: "Pending Review" },
  { id: "w3", user: "e2", date: "2026-08-04", summary: "Ran prenatal check-ups for 14 patients at Rango outpost.", hours: 7, completed: "14 check-ups, supply restock request", pending: "Follow-up for 2 high-risk cases", files: [], status: "Reviewed" },
  { id: "w4", user: "v1", date: "2026-08-04", summary: "Led literacy session for 22 children, group B.", hours: 3, completed: "Session delivered, attendance logged", pending: "Grade weekly worksheets", files: [], status: "Pending Review" },
];

export const seedNotifications = () => [
  { id: "n1", title: "New task assigned", body: "\"Survey borehole site #4\" assigned to you.", time: "2h ago", read: false, kind: "task" },
  { id: "n2", title: "Leave request approved", body: "Your Earned Leave (Jul 14–18) was approved.", time: "1d ago", read: false, kind: "leave" },
  { id: "n3", title: "Task overdue", body: "\"Print literacy workbooks (Batch 3)\" is overdue.", time: "1d ago", read: true, kind: "alert" },
  { id: "n4", title: "Project updated", body: "Clean Water Access — Kponsu progress moved to 62%.", time: "2d ago", read: true, kind: "project" },
  { id: "n5", title: "Announcement", body: "All-hands field briefing this Friday, 9:00 AM.", time: "3d ago", read: true, kind: "announcement" },
];

export const ANNOUNCEMENTS = [
  { id: "a1", title: "All-hands field briefing", body: "Friday 9:00 AM at the district office — Q3 priorities and safety refresher.", by: "Amara Osei", date: "2026-08-03" },
  { id: "a2", title: "New expense policy", body: "Updated per-diem rates now in effect for all field travel. See Settings > Help.", by: "Sofia Reyes", date: "2026-07-29" },
];

export const CAN = {
  manageEmployees: (r) => ["admin", "manager"].includes(r),
  manageVolunteers: (r) => ["admin", "manager"].includes(r),
  manageProjects: (r) => ["admin", "manager"].includes(r),
  manageTasks: (r) => ["admin", "manager", "coordinator"].includes(r),
  approveLeave: (r) => ["admin", "manager"].includes(r),
  viewReports: (r) => ["admin", "manager"].includes(r),
  viewAllAttendance: (r) => ["admin", "manager", "coordinator"].includes(r),
};

export const ROLE_NAV = {
  admin: ["dashboard", "employees", "volunteers", "projects", "tasks", "attendance", "leave", "worklog", "reports", "settings"],
  manager: ["dashboard", "employees", "volunteers", "projects", "tasks", "attendance", "leave", "worklog", "reports", "settings"],
  coordinator: ["dashboard", "projects", "tasks", "attendance", "leave", "worklog", "settings"],
  employee: ["dashboard", "projects", "tasks", "attendance", "leave", "worklog", "settings"],
  volunteer: ["dashboard", "projects", "tasks", "attendance", "worklog", "settings"],
};
