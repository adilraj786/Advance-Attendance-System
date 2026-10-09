# SVIT Smart Attendance Management System

A fullstack enterprise Smart Attendance Management System built with **React 19, TypeScript, Tailwind CSS v4, TanStack Router & Start, and Google Firebase Firestore**.

---

## 📂 Clean & Modular Directory Architecture

```
src/
├── components/                      # Reusable UI & Layout Components
│   ├── common/                      # Common UI widgets (DataTable, PageHeader, Panel, StatCard, StatusPill)
│   ├── layout/                      # Navigation shell (AppShell, NotificationsPanel)
│   └── ui/                          # Core Tailwind primitives (Button, Input, Select, Switch, Tabs, etc.)
│
├── features/                        # Domain-Driven Feature Modules (Clean & Isolated)
│   ├── academics/                   # Leave applications & Campus Announcements
│   ├── admin/                       # Institution Console, Timetables, Semesters, Holidays & Audit Logs
│   ├── analytics/                   # Departmental Reports, Statistics & Charts
│   ├── attendance/                  # Real-time QR Generator, Scanner & Firebase AttendanceService
│   ├── auth/                        # Authentication, OTP verification & Firebase AuthContext
│   ├── engagement/                  # AI Attendance Assistant, Leaderboard, Badges & Chat
│   ├── parent/                      # Parent ward progress digest & Teacher mentor chat
│   ├── security/                    # Bound devices hardware verification & Profile settings
│   ├── student/                     # Scholar Dashboard, 16-Week Heatmap & Exam Hall Tickets
│   └── teacher/                     # Faculty Console, Classroom Dispatch (e.g. MCA Div D in CL-509)
│
├── lib/                             # Shared Core Layer
│   ├── data/                        # Campus master data, courses, rooms, departments & typings
│   ├── firebase/                    # Google Firebase app initialization, Auth & Firestore
│   ├── utils/                       # Utility helpers (cn, session role switcher, error capture)
│   └── index.ts                     # Single barrel export for all lib modules
│
├── routes/                          # TanStack Router Pathless Domain Grouping
│   ├── __root.tsx                   # Master shell, PWA metadata & mobile viewport
│   ├── _auth/                       # / (Login), /otp
│   ├── _student/                    # /student, /scan, /eligibility
│   ├── _teacher/                    # /teacher, /approvals, /materials
│   ├── _admin/                      # /admin, /timetable, /holidays, /semesters, /audit-logs
│   ├── _parent/                     # /parent, /messages
│   └── _portal/                     # /analytics, /leave, /announcements, /assistant, /leaderboard, etc.
│
├── routeTree.gen.ts                 # Auto-generated TanStack Router tree
├── router.tsx                       # Router configuration
└── styles.css                       # Global design system tokens
```

---

## 👥 Supported Roles & Features

1. **Student (`/student`)**:
   - Aggregate attendance gauge with 75% detention threshold alert.
   - 16-week attendance heatmap.
   - Instant camera QR Scanner (`/scan`).
   - Examination Eligibility & Official Hall Ticket PDF (`/eligibility`).
   - Badges & streak milestones (`/achievements`).
   - Leave application with medical certificate upload (`/leave`).

2. **Faculty / Teacher (`/teacher`)**:
   - **Classroom Dispatch Directions**: Tells the teacher exactly which lecture hall or lab to report to at each hour (e.g., `MCA Div D in CL-509`, `B.Tech CSE Div A in LH-301`).
   - **Live Attendance Terminal**: Projects rotating anti-proxy QR codes.
   - **Master Class & Lab Table**: Directory filterable by Lecture vs Lab / Practical.
   - **Live Student Roster**: Real-time scan check-ins with manual override switches.
   - **Leave Approvals (`/approvals`)** and **Course Notes Upload (`/materials`)**.

3. **Dean / Head of Department (HOD) (`/admin`)**:
   - Department-level attendance metrics, faculty-to-student ratios, and detained scholar lists.
   - **Weekly Master Timetable Matrix (`/timetable`)** for classroom and teacher allocations.
   - Institutional announcements and leave escalation queue.

4. **Administrator / Registrar (`/admin`)**:
   - Campus overview, Scholar/Faculty registration, and Firebase Database Seeder.
   - **Semester Management (`/semesters`)** to activate/archive academic terms.
   - **Holiday Exclusions (`/holidays`)** to calibrate attendance denominators.
   - **Security Audit Trail (`/audit-logs`)** for tamper-evident compliance.

5. **Parent / Guardian (`/parent`)**:
   - Child's weekly attendance bar chart.
   - Immediate notification of absences and low-attendance warnings.
   - **Direct Mentor Chat (`/messages`)** with class teacher.

---

## 📱 Mobile App (PWA) Usage

- **Android (Chrome)**: Open URL → Tap `⋮` → Select **"Install app"** or **"Add to Home screen"**.
- **iOS (Safari)**: Open URL → Tap Share `⎙` → Select **"Add to Home Screen"** → Tap **"Add"**.

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build production bundle
npm run build
```
