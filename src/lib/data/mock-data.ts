export type Role = "student" | "teacher" | "hod" | "admin" | "parent";

export const COLLEGE = {
  name: "Smart Attendance System",
  short: "Smart Attendance",
  city: "Campus Portal",
  term: "Semester V · AY 2026-27",
};

export const CURRENT_USER: Record<Role, { name: string; sub: string; initials: string }> = {
  student: { name: "Ananya Deshpande", sub: "CSE · Roll SVIT21CS042", initials: "AD" },
  teacher: { name: "Prof. Anil Kulkarni", sub: "Dept. of Computer Science & MCA", initials: "AK" },
  hod: { name: "Dr. Kavita Nair", sub: "Dean of Academics & HOD CSE/MCA", initials: "KN" },
  admin: { name: "Dr. Meenakshi Rao", sub: "Registrar · Administration", initials: "MR" },
  parent: { name: "Sudhir Deshpande", sub: "Parent of Ananya Deshpande", initials: "SD" },
};

export type SubjectRow = {
  code: string;
  name: string;
  faculty: string;
  attended: number;
  total: number;
};

export const SUBJECTS: SubjectRow[] = [
  { code: "CS501", name: "Design & Analysis of Algorithms", faculty: "Prof. Rajeev Iyer", attended: 38, total: 42 },
  { code: "CS502", name: "Database Management Systems", faculty: "Dr. Kavita Nair", attended: 31, total: 40 },
  { code: "CS503", name: "Computer Networks", faculty: "Prof. Anil Kulkarni", attended: 26, total: 38 },
  { code: "CS504", name: "Operating Systems", faculty: "Dr. Shweta Bhosale", attended: 35, total: 39 },
  { code: "CS505", name: "Software Engineering", faculty: "Prof. Nitin Gokhale", attended: 29, total: 33 },
  { code: "HS511", name: "Professional Ethics", faculty: "Dr. Farida Sheikh", attended: 18, total: 24 },
  { code: "CS506", name: "Machine Learning Lab", faculty: "Dr. Kavita Nair", attended: 21, total: 22 },
];

export const pct = (a: number, t: number) => Math.round((a / t) * 1000) / 10;

export const OVERALL = (() => {
  const a = SUBJECTS.reduce((s, x) => s + x.attended, 0);
  const t = SUBJECTS.reduce((s, x) => s + x.total, 0);
  return { attended: a, total: t, percent: pct(a, t) };
})();

export type DayStatus = "present" | "absent" | "leave" | "holiday" | "none";

// Deterministic 16-week heatmap (Mon-Sat)
export const CALENDAR: { date: string; status: DayStatus }[] = (() => {
  const out: { date: string; status: DayStatus }[] = [];
  const start = new Date(Date.UTC(2026, 3, 6));
  for (let i = 0; i < 112; i++) {
    const d = new Date(start.getTime() + i * 86400000);
    const dow = d.getUTCDay();
    let status: DayStatus = "present";
    if (dow === 0) status = "holiday";
    else {
      const seed = (i * 37 + d.getUTCDate() * 13) % 23;
      if (seed < 3) status = "absent";
      else if (seed === 5 || seed === 11) status = "leave";
      else if (seed === 7 && dow === 6) status = "holiday";
    }
    if (i > 100) status = "none";
    out.push({ date: d.toISOString().slice(0, 10), status });
  }
  return out;
})();

export const UPCOMING = [
  { time: "09:00", subject: "Computer Networks", room: "LH-204", faculty: "Prof. Anil Kulkarni", state: "Live" },
  { time: "10:00", subject: "Database Management Systems", room: "LH-201", faculty: "Dr. Kavita Nair", state: "Next" },
  { time: "11:15", subject: "Machine Learning Lab", room: "Lab C-3", faculty: "Dr. Kavita Nair", state: "" },
  { time: "14:00", subject: "Software Engineering", room: "LH-108", faculty: "Prof. Nitin Gokhale", state: "" },
];

export type StudentRow = {
  roll: string;
  name: string;
  present: boolean;
  percent: number;
};

export const CLASS_ROSTER: StudentRow[] = [
  { roll: "SVIT21CS001", name: "Aarav Kulkarni", present: true, percent: 91 },
  { roll: "SVIT21CS007", name: "Ishita Mahajan", present: true, percent: 88 },
  { roll: "SVIT21CS012", name: "Rohan Bhatt", present: false, percent: 64 },
  { roll: "SVIT21CS018", name: "Sneha Pillai", present: true, percent: 95 },
  { roll: "SVIT21CS023", name: "Kabir Sethi", present: true, percent: 79 },
  { roll: "SVIT21CS029", name: "Meera Joshi", present: false, percent: 58 },
  { roll: "SVIT21CS034", name: "Aditya Rane", present: true, percent: 83 },
  { roll: "SVIT21CS042", name: "Ananya Deshpande", present: true, percent: 82 },
  { roll: "SVIT21CS047", name: "Zoya Qureshi", present: true, percent: 90 },
  { roll: "SVIT21CS051", name: "Harsh Vardhan", present: false, percent: 71 },
  { roll: "SVIT21CS056", name: "Divya Ramanathan", present: true, percent: 97 },
  { roll: "SVIT21CS063", name: "Yash Chandorkar", present: true, percent: 74 },
];

export const LOW_ATTENDANCE = [
  { roll: "SVIT21CS029", name: "Meera Joshi", dept: "Computer Science", percent: 58, contact: "+91 98220 41123" },
  { roll: "SVIT21ME014", name: "Pranav Salunkhe", dept: "Mechanical", percent: 61, contact: "+91 90112 88450" },
  { roll: "SVIT21CS012", name: "Rohan Bhatt", dept: "Computer Science", percent: 64, contact: "+91 98905 22781" },
  { roll: "SVIT21EC033", name: "Sanya Kapoor", dept: "Electronics", percent: 66, contact: "+91 87675 90210" },
  { roll: "SVIT21CV009", name: "Tejas Wagh", dept: "Civil", percent: 68, contact: "+91 93712 40098" },
];

export const DEPARTMENTS = [
  { code: "CSE", name: "Computer Science & Engineering", hod: "Dr. Kavita Nair", teachers: 34, students: 612, avg: 84.2 },
  { code: "ECE", name: "Electronics & Communication", hod: "Dr. Sanjay Deshmukh", teachers: 26, students: 448, avg: 81.6 },
  { code: "MECH", name: "Mechanical Engineering", hod: "Prof. Vikram Patil", teachers: 29, students: 503, avg: 78.9 },
  { code: "CIVIL", name: "Civil Engineering", hod: "Dr. Rekha Sawant", teachers: 21, students: 366, avg: 80.4 },
  { code: "IT", name: "Information Technology", hod: "Dr. Aparna Ghosh", teachers: 23, students: 391, avg: 85.7 },
  { code: "AIML", name: "Artificial Intelligence & ML", hod: "Dr. Neeraj Tandon", teachers: 15, students: 208, avg: 88.1 },
];

export const TREND = [
  { month: "Jan", cse: 86, ece: 82, mech: 77, overall: 82 },
  { month: "Feb", cse: 84, ece: 80, mech: 79, overall: 81 },
  { month: "Mar", cse: 88, ece: 83, mech: 76, overall: 83 },
  { month: "Apr", cse: 81, ece: 79, mech: 74, overall: 78 },
  { month: "May", cse: 85, ece: 84, mech: 80, overall: 83 },
  { month: "Jun", cse: 89, ece: 86, mech: 82, overall: 86 },
  { month: "Jul", cse: 87, ece: 85, mech: 81, overall: 85 },
  { month: "Aug", cse: 84, ece: 82, mech: 79, overall: 82 },
];

export const WEEKDAY_BARS = [
  { day: "Mon", present: 542, absent: 70 },
  { day: "Tue", present: 566, absent: 46 },
  { day: "Wed", present: 521, absent: 91 },
  { day: "Thu", present: 549, absent: 63 },
  { day: "Fri", present: 498, absent: 114 },
  { day: "Sat", present: 431, absent: 181 },
];

export const LEADERBOARD = [
  { rank: 1, name: "Divya Ramanathan", dept: "CSE", percent: 97.4, streak: 41, badge: "Perfect Term" },
  { rank: 2, name: "Sneha Pillai", dept: "CSE", percent: 95.2, streak: 33, badge: "Early Bird" },
  { rank: 3, name: "Ritika Sinha", dept: "AIML", percent: 94.8, streak: 29, badge: "Consistent" },
  { rank: 4, name: "Aarav Kulkarni", dept: "CSE", percent: 91.0, streak: 24, badge: "Consistent" },
  { rank: 5, name: "Zoya Qureshi", dept: "IT", percent: 90.3, streak: 22, badge: "" },
  { rank: 6, name: "Nikhil Barve", dept: "ECE", percent: 89.6, streak: 19, badge: "" },
  { rank: 7, name: "Ishita Mahajan", dept: "CSE", percent: 88.1, streak: 17, badge: "" },
  { rank: 8, name: "Aditya Rane", dept: "MECH", percent: 83.4, streak: 12, badge: "" },
];

export const NOTIFICATIONS = [
  { id: 1, title: "Attendance below 75% in Computer Networks", body: "Current 68.4%. Two more absences will trigger a detention notice.", time: "12 min ago", tone: "risk" as const, unread: true },
  { id: 2, title: "QR session opened — DBMS, LH-201", body: "Dr. Kavita Nair opened a 5-minute scan window.", time: "48 min ago", tone: "accent" as const, unread: true },
  { id: 3, title: "Leave approved — 14 Aug", body: "Medical leave approved by Dept. of Computer Science.", time: "Yesterday", tone: "ok" as const, unread: false },
  { id: 4, title: "Weekly digest sent to parent", body: "Summary for 10–16 Aug delivered to Sudhir Deshpande.", time: "2 days ago", tone: "muted" as const, unread: false },
  { id: 5, title: "Holiday notice — Independence Day", body: "College remains closed on 15 August 2026.", time: "4 days ago", tone: "muted" as const, unread: false },
];

export const COURSES = [
  { code: "BTECH-CSE", name: "B.Tech Computer Science", dept: "CSE", intake: 180, sem: 8, coord: "Dr. Kavita Nair" },
  { code: "BTECH-ECE", name: "B.Tech Electronics & Comm.", dept: "ECE", intake: 120, sem: 8, coord: "Dr. Sanjay Deshmukh" },
  { code: "BTECH-MECH", name: "B.Tech Mechanical", dept: "MECH", intake: 120, sem: 8, coord: "Prof. Vikram Patil" },
  { code: "MTECH-AIML", name: "M.Tech AI & Machine Learning", dept: "AIML", intake: 40, sem: 4, coord: "Dr. Neeraj Tandon" },
  { code: "BTECH-IT", name: "B.Tech Information Technology", dept: "IT", intake: 120, sem: 8, coord: "Dr. Aparna Ghosh" },
  { code: "BTECH-CIVIL", name: "B.Tech Civil Engineering", dept: "CIVIL", intake: 90, sem: 8, coord: "Dr. Rekha Sawant" },
];

export const PARENT_WEEK = [
  { day: "Mon 10", classes: 5, attended: 5 },
  { day: "Tue 11", classes: 6, attended: 5 },
  { day: "Wed 12", classes: 4, attended: 4 },
  { day: "Thu 13", classes: 6, attended: 4 },
  { day: "Fri 14", classes: 5, attended: 0 },
  { day: "Sat 15", classes: 0, attended: 0 },
];

/* ---------- Assistant / chat ---------- */
export type ChatMsg = { id: number; from: "me" | "them"; text: string; time: string };

export const BOT_THREAD: ChatMsg[] = [
  { id: 1, from: "them", text: "Good evening, Ananya. Your overall attendance is 82.1% across 7 subjects. Computer Networks is the only subject below the 75% detention line.", time: "18:31" },
  { id: 2, from: "me", text: "How many CN classes must I attend to get back above 75%?", time: "18:32" },
  { id: 3, from: "them", text: "You are at 26/38 (68.4%). Attending the next 9 Computer Networks sessions without a miss puts you at 75.6%. There are 11 sessions left this term.", time: "18:32" },
  { id: 4, from: "me", text: "Can I skip the Professional Ethics lecture tomorrow?", time: "18:33" },
  { id: 5, from: "them", text: "Yes — Professional Ethics is at 75.0% with 24 held sessions. One absence drops you to 72.0%, which is below threshold. I would not recommend it.", time: "18:33" },
];

export const BOT_CHIPS = ["My attendance", "Can I skip tomorrow?", "Generate report", "Subjects at risk", "Leave balance"];

export const TEACHER_THREAD: ChatMsg[] = [
  { id: 1, from: "them", text: "Good evening Mr. Deshpande. Ananya missed both Friday sessions of Computer Networks.", time: "Fri 17:10" },
  { id: 2, from: "me", text: "Thank you for informing, sir. She had a dental appointment — I have submitted the medical note through the portal.", time: "Fri 19:24" },
  { id: 3, from: "them", text: "Received. I have marked it as pending medical leave; the department verifies notes on Monday.", time: "Sat 09:02" },
  { id: 4, from: "me", text: "Understood. Is there any make-up session for the missed lab?", time: "Sat 09:15" },
  { id: 5, from: "them", text: "Yes, a repeat lab slot is scheduled for 22 August, 14:00, Lab C-3. Attendance there will count towards the same subject.", time: "Sat 09:20" },
];

/* ---------- Leave ---------- */
export type LeaveStatus = "pending" | "approved" | "rejected";
export type LeaveRow = {
  id: string;
  student: string;
  roll: string;
  subject: string;
  from: string;
  to: string;
  days: number;
  reason: string;
  status: LeaveStatus;
};

export const MY_LEAVES: LeaveRow[] = [
  { id: "LV-2418", student: "Ananya Deshpande", roll: "SVIT21CS042", subject: "All subjects", from: "14 Aug 2026", to: "14 Aug 2026", days: 1, reason: "Dental surgery — medical certificate attached.", status: "approved" },
  { id: "LV-2461", student: "Ananya Deshpande", roll: "SVIT21CS042", subject: "Computer Networks", from: "19 Aug 2026", to: "20 Aug 2026", days: 2, reason: "Representing college at the inter-collegiate hackathon in Mumbai.", status: "pending" },
  { id: "LV-2377", student: "Ananya Deshpande", roll: "SVIT21CS042", subject: "Professional Ethics", from: "28 Jul 2026", to: "28 Jul 2026", days: 1, reason: "Family function at native place.", status: "rejected" },
  { id: "LV-2302", student: "Ananya Deshpande", roll: "SVIT21CS042", subject: "Machine Learning Lab", from: "11 Jul 2026", to: "12 Jul 2026", days: 2, reason: "Viral fever, advised rest by physician.", status: "approved" },
];

export const INCOMING_LEAVES: LeaveRow[] = [
  { id: "LV-2461", student: "Ananya Deshpande", roll: "SVIT21CS042", subject: "Computer Networks", from: "19 Aug", to: "20 Aug", days: 2, reason: "Inter-collegiate hackathon, Mumbai.", status: "pending" },
  { id: "LV-2465", student: "Rohan Bhatt", roll: "SVIT21CS012", subject: "DAA", from: "18 Aug", to: "18 Aug", days: 1, reason: "Sister's wedding.", status: "pending" },
  { id: "LV-2466", student: "Meera Joshi", roll: "SVIT21CS029", subject: "All subjects", from: "17 Aug", to: "21 Aug", days: 5, reason: "Typhoid — hospital discharge summary attached.", status: "pending" },
  { id: "LV-2452", student: "Kabir Sethi", roll: "SVIT21CS023", subject: "DBMS", from: "12 Aug", to: "12 Aug", days: 1, reason: "NSS camp duty.", status: "approved" },
  { id: "LV-2449", student: "Yash Chandorkar", roll: "SVIT21CS063", subject: "Operating Systems", from: "11 Aug", to: "11 Aug", days: 1, reason: "Overslept after night project work.", status: "rejected" },
  { id: "LV-2444", student: "Sneha Pillai", roll: "SVIT21CS018", subject: "ML Lab", from: "08 Aug", to: "09 Aug", days: 2, reason: "Paper presentation at VJTI.", status: "approved" },
];

/* ---------- Achievements ---------- */
export const BADGES = [
  { name: "First Scan", detail: "Marked attendance via QR", unlocked: true, on: "12 Jun 2026" },
  { name: "Week Clean", detail: "7 consecutive present days", unlocked: true, on: "19 Jun 2026" },
  { name: "Early Bird", detail: "20 classes marked before 09:00", unlocked: true, on: "02 Jul 2026" },
  { name: "Lab Regular", detail: "100% lab attendance for a month", unlocked: true, on: "28 Jul 2026" },
  { name: "Fortnight", detail: "15 consecutive present days", unlocked: false, on: "" },
  { name: "Month Perfect", detail: "30 consecutive present days", unlocked: false, on: "" },
  { name: "Century", detail: "100 present days in a term", unlocked: false, on: "" },
  { name: "Zero Proxy", detail: "Full term without a flagged scan", unlocked: false, on: "" },
];

export const STREAK_MILESTONES = [7, 15, 30, 100];

/* ---------- Eligibility ---------- */
export const ELIGIBILITY = SUBJECTS.map((s) => {
  const held = s.total;
  const projected = held + 8;
  const need = Math.max(0, Math.ceil(0.75 * projected) - s.attended);
  const p = pct(s.attended, s.total);
  return {
    code: s.code,
    name: s.name,
    percent: p,
    need,
    state: p >= 80 ? "Eligible" : p >= 75 ? "Borderline" : "At risk",
  };
});

/* ---------- Timetable ---------- */
export const TT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const TT_SLOTS = ["09:00", "10:00", "11:15", "12:15", "14:00", "15:00"];
export const TIMETABLE: Record<string, { code: string; room: string } | null> = (() => {
  const map: Record<string, { code: string; room: string } | null> = {};
  const pool = [
    { code: "CS501", room: "LH-204" },
    { code: "CS502", room: "LH-201" },
    { code: "CS503", room: "LH-108" },
    { code: "CS504", room: "LH-204" },
    { code: "CS505", room: "LH-110" },
    { code: "CS506", room: "Lab C-3" },
    { code: "HS511", room: "LH-002" },
  ];
  TT_DAYS.forEach((d, di) =>
    TT_SLOTS.forEach((s, si) => {
      const k = `${d}-${s}`;
      const seed = (di * 7 + si * 3) % 9;
      map[k] = seed >= 7 ? null : pool[(di * 5 + si) % pool.length]!;
    }),
  );
  return map;
})();

/* ---------- Holidays ---------- */
export const HOLIDAYS = [
  { date: "15 Aug 2026", name: "Independence Day", type: "National" },
  { date: "26 Aug 2026", name: "Ganesh Chaturthi", type: "Regional" },
  { date: "02 Oct 2026", name: "Gandhi Jayanti", type: "National" },
  { date: "20 Oct 2026", name: "Dussehra", type: "Regional" },
  { date: "08 Nov 2026", name: "Diwali — Lakshmi Pujan", type: "Regional" },
  { date: "25 Dec 2026", name: "Christmas", type: "National" },
  { date: "26 Jan 2027", name: "Republic Day", type: "National" },
];

/* ---------- Semesters ---------- */
export const SEMESTERS = [
  { code: "SEM-V-2627", name: "Semester V", span: "01 Jul 2026 – 15 Nov 2026", working: 96, active: true },
  { code: "SEM-VI-2627", name: "Semester VI", span: "02 Dec 2026 – 30 Apr 2027", working: 102, active: false },
  { code: "SEM-IV-2526", name: "Semester IV", span: "05 Dec 2025 – 28 Apr 2026", working: 99, active: false },
  { code: "SEM-III-2526", name: "Semester III", span: "01 Jul 2025 – 12 Nov 2025", working: 94, active: false },
];

/* ---------- Audit logs ---------- */
export const AUDIT_LOGS = [
  { time: "17 Aug 2026 · 18:22", user: "Dr. Kavita Nair", role: "Teacher", action: "Opened QR session", target: "CS502 · LH-201", severity: "info" },
  { time: "17 Aug 2026 · 17:58", user: "Dr. Meenakshi Rao", role: "Admin", action: "Edited timetable slot", target: "Wed 11:15 · CS506", severity: "notice" },
  { time: "17 Aug 2026 · 16:40", user: "Prof. Rajeev Iyer", role: "Teacher", action: "Manually marked present", target: "SVIT21CS034", severity: "notice" },
  { time: "17 Aug 2026 · 15:12", user: "System", role: "System", action: "Flagged duplicate scan", target: "SVIT21CS051", severity: "alert" },
  { time: "17 Aug 2026 · 14:03", user: "Dr. Meenakshi Rao", role: "Admin", action: "Approved leave request", target: "LV-2452", severity: "info" },
  { time: "17 Aug 2026 · 11:47", user: "Prof. Anil Kulkarni", role: "Teacher", action: "Exported attendance report", target: "CS503 · Aug", severity: "info" },
  { time: "16 Aug 2026 · 20:31", user: "System", role: "System", action: "Geofence mismatch rejected", target: "SVIT21ME014", severity: "alert" },
  { time: "16 Aug 2026 · 09:05", user: "Dr. Aparna Ghosh", role: "Admin", action: "Added holiday", target: "26 Aug · Ganesh Chaturthi", severity: "notice" },
];

/* ---------- Materials ---------- */
export const MATERIALS = [
  { name: "DAA — Unit 4 Greedy Algorithms.pdf", subject: "CS501", size: "2.4 MB", on: "17 Aug 2026", kind: "Notes", downloads: 118 },
  { name: "Assignment 3 — Dynamic Programming.docx", subject: "CS501", size: "84 KB", on: "15 Aug 2026", kind: "Assignment", downloads: 96 },
  { name: "DBMS Normalization worksheet.pdf", subject: "CS502", size: "612 KB", on: "13 Aug 2026", kind: "Worksheet", downloads: 141 },
  { name: "CN — Subnetting practice set.pdf", subject: "CS503", size: "1.1 MB", on: "11 Aug 2026", kind: "Practice", downloads: 87 },
  { name: "ML Lab manual (revised).pdf", subject: "CS506", size: "5.8 MB", on: "08 Aug 2026", kind: "Manual", downloads: 203 },
];

/* ---------- Announcements ---------- */
export const ANNOUNCEMENTS = [
  { id: 1, author: "Prof. Rajeev Iyer", scope: "CSE-A · Semester V", time: "2 hours ago", text: "Unit test 2 for Design & Analysis of Algorithms is on 24 August, 10:00, LH-204. Syllabus covers greedy and dynamic programming only.", pinned: true },
  { id: 2, author: "Prof. Rajeev Iyer", scope: "CS506 · ML Lab batch B", time: "Yesterday", text: "Lab batch B is shifted to 22 August, 14:00 in Lab C-3 to compensate for the Independence Day holiday.", pinned: false },
  { id: 3, author: "Prof. Rajeev Iyer", scope: "CSE-A · Semester V", time: "3 days ago", text: "Assignment 3 submissions close on 20 August at 23:59. Late submissions will be capped at 60% of the marks.", pinned: false },
];

/* ---------- Devices ---------- */
export const LOGIN_HISTORY = [
  { device: "Chrome · Windows 11", location: "Pune, Maharashtra", ip: "103.21.58.14", time: "17 Aug 2026 · 18:29", current: true },
  { device: "SVIT Attendance · Android 15", location: "Pune, Maharashtra", ip: "49.36.180.77", time: "17 Aug 2026 · 09:02", current: false },
  { device: "Safari · iPad OS 18", location: "Pune, Maharashtra", ip: "103.21.58.14", time: "15 Aug 2026 · 21:14", current: false },
  { device: "Chrome · Windows 11", location: "Nashik, Maharashtra", ip: "45.118.62.9", time: "09 Aug 2026 · 12:47", current: false },
  { device: "Firefox · Ubuntu 24.04", location: "Pune, Maharashtra", ip: "103.21.58.31", time: "02 Aug 2026 · 16:05", current: false },
];

/* ---------- Weekly AI summary ---------- */
export const AI_SUMMARY = {
  window: "10 – 16 Aug 2026",
  attended: 23,
  held: 27,
  weak: ["Computer Networks", "Professional Ethics"],
  strong: ["Machine Learning Lab", "Design & Analysis of Algorithms"],
  suggestion: "Attend all four Computer Networks sessions next week to clear the 75% line before the mid-term cutoff.",
  note: "Four straight weeks above 80% — the trend is steady, keep the morning slots protected.",
};
