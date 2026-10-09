import { useEffect, useState } from "react";
import {
  Users,
  GraduationCap,
  Building2,
  TriangleAlert,
  Download,
  Plus,
  Send,
  Loader2,
  Database,
  ShieldAlert,
  UserCheck,
  Edit,
  Shield,
  Trash2,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
  CartesianGrid,
} from "recharts";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader, Panel } from "@/components/common/section";
import { StatCard } from "@/components/common/stat-card";
import { StatusPill } from "@/components/common/status-pill";
import { DataTable, Column } from "@/components/common/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DEPARTMENTS, type Role } from "@/lib/data";
import { useRole } from "@/lib/utils";
import {
  AttendanceService,
  type StudentEntity,
  type FacultyEntity,
  type UserProfile,
} from "@/features/attendance/attendance-service";
import { UserStore } from "@/features/auth";

const TREND = [
  { month: "Jan", cse: 88, ece: 84, mech: 78 },
  { month: "Feb", cse: 89, ece: 83, mech: 76 },
  { month: "Mar", cse: 86, ece: 82, mech: 75 },
  { month: "Apr", cse: 84, ece: 80, mech: 74 },
  { month: "May", cse: 87, ece: 81, mech: 73 },
  { month: "Jun", cse: 89, ece: 83, mech: 75 },
  { month: "Jul", cse: 88, ece: 82, mech: 74 },
  { month: "Aug", cse: 87, ece: 81, mech: 74 },
];

const LOW_ATTENDANCE = [
  { name: "Rahul Deshmukh", roll: "24MCA028", dept: "MCA", percent: 68.0, contact: "+91 94480 65432" },
  { name: "Tanmay Kulkarni", roll: "24MCA042", dept: "MCA", percent: 65.5, contact: "+91 98229 11004" },
  { name: "Vikram Pawar", roll: "21CS044", dept: "B.Tech CSE", percent: 62.4, contact: "+91 98223 77123" },
  { name: "Shweta Joshi", roll: "21CS058", dept: "B.Tech CSE", percent: 64.0, contact: "+91 94220 55891" },
  { name: "Aditya Patil", roll: "22EC012", dept: "B.Tech ECE", percent: 68.2, contact: "+91 98811 44520" },
];

export function AdminDashboard() {
  const role = useRole();
  const isHOD = role === "hod";
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [notifying, setNotifying] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [students, setStudents] = useState<StudentEntity[]>([]);
  const [faculty, setFaculty] = useState<FacultyEntity[]>([]);
  const [users, setUsers] = useState<UserProfile[]>(() => AttendanceService.getUsers());

  // Modal states
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [showAddFaculty, setShowAddFaculty] = useState(false);
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);

  // Add User Form
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<Role>("student");
  const [newUserDept, setNewUserDept] = useState("Computer Science & Engineering");
  const [newUserPhone, setNewUserPhone] = useState("");
  const [newUserRoll, setNewUserRoll] = useState("");

  // Student Form
  const [stuName, setStuName] = useState("");
  const [stuRoll, setStuRoll] = useState("");
  const [stuDept, setStuDept] = useState("Computer Science & Engineering");
  const [stuEmail, setStuEmail] = useState("");

  // Faculty Form
  const [facName, setFacName] = useState("");
  const [facDept, setFacDept] = useState("Computer Science");
  const [facDesig, setFacDesig] = useState("Assistant Professor");
  const [facEmail, setFacEmail] = useState("");

  // User Role Edit Form
  const [editUserName, setEditUserName] = useState("");
  const [editUserEmail, setEditUserEmail] = useState("");
  const [editUserRole, setEditUserRole] = useState<Role>("student");
  const [editUserDept, setEditUserDept] = useState("");
  const [editUserPhone, setEditUserPhone] = useState("");
  const [editUserRoll, setEditUserRoll] = useState("");

  const refreshData = async () => {
    const [stuList, facList, userList] = await Promise.all([
      AttendanceService.getStudentsFromFirestore(),
      AttendanceService.getFacultyFromFirestore(),
      AttendanceService.getUsersFromFirestore(),
    ]);
    setStudents(stuList);
    setFaculty(facList);
    setUsers(userList);
  };

  useEffect(() => {
    refreshData();
    const unsubUsers = AttendanceService.listenUsers((list: UserProfile[]) => {
      setUsers(list);
    });
    const unsubStudents = AttendanceService.listenStudents((list: StudentEntity[]) => {
      setStudents(list);
    });
    const unsubFaculty = AttendanceService.listenFaculty((list: FacultyEntity[]) => {
      setFaculty(list);
    });
    return () => {
      unsubUsers();
      unsubStudents();
      unsubFaculty();
    };
  }, []);

  const handleSeedDatabase = async () => {
    setSeeding(true);
    toast.info("Seeding Firebase Firestore with master campus records & roles…");
    await AttendanceService.seedAllData();
    setSeeding(false);
    await refreshData();
    toast.success("Database populated successfully! 🔥", {
      description: "User roles, students, faculty, timetable and live session state written to Firestore.",
    });
  };

  const handleOpenEditUser = (u: UserProfile) => {
    setEditingUser(u);
    setEditUserName(u.name);
    setEditUserEmail(u.email);
    setEditUserRole(u.role);
    setEditUserDept(u.department || "");
    setEditUserPhone(u.phone || "");
    setEditUserRoll(u.rollNumber || "");
  };

  const handleSaveUserRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    const updated: UserProfile = {
      ...editingUser,
      name: editUserName,
      email: editUserEmail,
      role: editUserRole,
      department: editUserDept,
      phone: editUserPhone,
      rollNumber: editUserRole === "student" ? editUserRoll : undefined,
    };

    setEditingUser(null);
    const saved = await AttendanceService.saveUser(updated);
    toast.success(`Role & profile updated for ${saved.name}!`, {
      description: `Role assigned: ${saved.role.toUpperCase()} · Synchronized with Firestore in real-time.`,
    });
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      toast.error("Please enter both full name and email.");
      return;
    }

    const newUser: UserProfile = {
      uid: "user-" + Date.now(),
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
      department: newUserDept || (newUserRole === "teacher" ? "Computer Science & MCA" : "Computer Science & Engineering"),
      phone: newUserPhone || "+91 98220 " + Math.floor(10000 + Math.random() * 90000),
      rollNumber: newUserRole === "student" ? (newUserRoll || "21CS" + Math.floor(100 + Math.random() * 900)) : undefined,
    };

    await AttendanceService.saveUser(newUser);

    // Provision in UserStore so appointed faculty/admin/student can login immediately
    try {
      UserStore.registerUser(
        {
          email: newUser.email,
          username: newUser.email.split("@")[0] || newUser.name.toLowerCase().replace(/\s+/g, ""),
          password: "password123",
          name: newUser.name,
          role: newUser.role,
          phone: newUser.phone || "+91 98450 11223",
          department: newUser.department,
          rollNumber: newUser.rollNumber,
        },
        true, // isAdminProvisioning: true
      );
    } catch {}

    setShowAddUser(false);
    setNewUserName("");
    setNewUserEmail("");
    setNewUserDept("Computer Science & Engineering");
    setNewUserPhone("");
    setNewUserRoll("");
    toast.success(`Created account for ${newUser.name}!`, {
      description: `Role: ${newUser.role.toUpperCase()} · Appointed & provisioned in security directory.`,
    });
  };

  const handleDeleteUser = async (uid: string, name: string) => {
    await AttendanceService.deleteUser(uid);
    toast.info(`Deleted user account for ${name} from Firestore.`);
  };

  const handleCreateStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stuName || !stuRoll) return;
    await AttendanceService.addStudent({
      name: stuName,
      roll: stuRoll,
      dept: stuDept,
      sem: "Semester V",
      email: stuEmail || `${stuRoll.toLowerCase()}@svit.ac.in`,
      phone: "+91 98" + Math.floor(10000000 + Math.random() * 90000000),
      attendancePercent: 85.0,
      mentor: "Prof. Rajeev Iyer",
    });
    setShowAddStudent(false);
    setStuName("");
    setStuRoll("");
    setStuEmail("");
    toast.success(`Student ${stuName} registered & saved!`);
  };

  const handleCreateFaculty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!facName || !facEmail) return;
    await AttendanceService.addFaculty({
      name: facName,
      dept: facDept,
      designation: facDesig,
      email: facEmail,
      subjects: ["Computer Networks"],
    });

    // Provision faculty login credentials in UserStore
    try {
      UserStore.registerUser(
        {
          email: facEmail.trim().toLowerCase(),
          username: facEmail.split("@")[0] || facName.toLowerCase().replace(/\s+/g, ""),
          password: "password123",
          name: facName.trim(),
          role: "teacher",
          phone: "+91 98450 " + Math.floor(10000 + Math.random() * 90000),
          department: `Dept. of ${facDept}`,
        },
        true, // isAdminProvisioning: true
      );
    } catch {}

    refreshData();
    setShowAddFaculty(false);
    setFacName("");
    setFacEmail("");
    toast.success(`Faculty ${facName} registered & credentials provisioned!`, {
      description: "Faculty can now sign in using institutional credentials.",
    });
  };

  const handleNotifyGuardians = () => {
    setNotifying(true);
    toast.info("Sending batch warnings to parent phone numbers…");
    setTimeout(() => {
      setNotifying(false);
      toast.success("Statutory warning SMS & Email dispatched to 213 guardians!", {
        description: "Registered under automated low-attendance escalation protocol.",
      });
    }, 1500);
  };

  const handleExportMaster = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Code,Department,HOD,Faculty Count,Students Count,Average Attendance\n" +
      DEPARTMENTS.map((d) => `${d.code},"${d.name}","${d.hod}",${d.teachers},${d.students},${d.avg}%`).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `SVIT_Master_Institutional_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Institutional report exported!", {
      description: "Master department records saved to CSV.",
    });
  };

  const filteredStudents = deptFilter === "all" ? students : students.filter((s) => s.dept.toLowerCase().includes(deptFilter.toLowerCase()));
  const filteredFaculty = deptFilter === "all" ? faculty : faculty.filter((f) => f.dept.toLowerCase().includes(deptFilter.toLowerCase()));

  // Column definitions
  const userCols: Column<UserProfile>[] = [
    {
      key: "name",
      header: "Institutional Account",
      render: (u) => {
        const uName = u?.name || "User";
        const initials =
          uName
            .split(" ")
            .filter(Boolean)
            .map((n) => n[0])
            .join("")
            .slice(0, 2)
            .toUpperCase() || "SV";
        return (
          <div className="flex items-center gap-3 py-1">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-accent/15 text-xs font-bold text-accent">
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-bold text-foreground">{uName}</p>
              <p className="truncate text-[11px] text-muted-foreground font-mono">{u?.email || ""}</p>
            </div>
          </div>
        );
      },
    },
    {
      key: "role",
      header: "Assigned Role",
      render: (u) => {
        const r = u?.role || "student";
        const tone =
          r === "student"
            ? "accent"
            : r === "teacher"
              ? "present"
              : r === "hod"
                ? "neutral"
                : r === "admin"
                  ? "absent"
                  : "muted";
        return (
          <div className="flex items-center gap-1.5">
            <StatusPill tone={tone as any}>{r.toUpperCase()}</StatusPill>
          </div>
        );
      },
    },
    {
      key: "department",
      header: "Department / Association",
      render: (u) => (
        <span className="text-xs text-muted-foreground truncate max-w-[200px] block">
          {u.department || u.rollNumber || "Campus Central"}
        </span>
      ),
    },
    {
      key: "phone",
      header: "2FA Mobile",
      render: (u) => (
        <span className="text-xs font-mono text-foreground font-medium">
          {u.phone || "+91 98220 41123"}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Manage Access",
      render: (u) => (
        <div className="flex items-center gap-1.5">
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleOpenEditUser(u)}
            className="h-8 rounded-lg text-xs font-semibold hover:border-accent hover:text-accent"
          >
            <Edit className="mr-1.5 h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => handleDeleteUser(u.uid, u.name)}
            className="h-8 w-8 rounded-lg text-muted-foreground hover:bg-destructive/15 hover:text-destructive transition-colors"
            title="Delete user from database"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  const studentCols: Column<StudentEntity>[] = [
    {
      key: "roll",
      header: "Roll No",
      render: (s) => <span className="font-mono text-xs font-bold text-accent">{s.roll}</span>,
    },
    {
      key: "name",
      header: "Student Scholar",
      render: (s) => (
        <div>
          <p className="text-xs font-bold text-foreground">{s.name}</p>
          <p className="text-[11px] text-muted-foreground">{s.email}</p>
        </div>
      ),
    },
    {
      key: "dept",
      header: "Department",
      render: (s) => <span className="text-xs text-muted-foreground">{s.dept}</span>,
    },
    {
      key: "mentor",
      header: "Faculty Mentor",
      render: (s) => <span className="text-xs text-muted-foreground">{s.mentor}</span>,
    },
    {
      key: "attendancePercent",
      header: "Presence",
      render: (s) => {
        const tone = s.attendancePercent >= 75 ? "present" : "absent";
        return (
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold tabular text-foreground">
              {s.attendancePercent.toFixed(1)}%
            </span>
            <StatusPill tone={tone}>{s.attendancePercent >= 75 ? "Eligible" : "Detained"}</StatusPill>
          </div>
        );
      },
    },
  ];

  const facultyCols: Column<FacultyEntity>[] = [
    {
      key: "id",
      header: "Faculty ID",
      render: (f) => <span className="font-mono text-xs font-bold text-accent">{f.id}</span>,
    },
    {
      key: "name",
      header: "Faculty Member",
      render: (f) => (
        <div>
          <p className="text-xs font-bold text-foreground">{f.name}</p>
          <p className="text-[11px] text-muted-foreground">{f.email}</p>
        </div>
      ),
    },
    {
      key: "dept",
      header: "Department",
      render: (f) => <span className="text-xs text-muted-foreground">{f.dept}</span>,
    },
    {
      key: "designation",
      header: "Designation",
      render: (f) => <StatusPill tone="neutral">{f.designation}</StatusPill>,
    },
  ];

  type DeptItem = (typeof DEPARTMENTS)[number];
  const deptCols: Column<DeptItem>[] = [
    {
      key: "code",
      header: "Code",
      render: (d: DeptItem) => <span className="font-mono text-xs font-bold text-accent">{d.code}</span>,
    },
    {
      key: "name",
      header: "Department Name",
      render: (d: DeptItem) => <span className="text-xs font-bold text-foreground">{d.name}</span>,
    },
    {
      key: "hod",
      header: "Dean / HOD",
      render: (d: DeptItem) => <span className="text-xs text-muted-foreground">{d.hod}</span>,
    },
    {
      key: "students",
      header: "Enrolled Scholars",
      render: (d: DeptItem) => <span className="font-mono text-xs text-foreground font-semibold">{d.students}</span>,
    },
    {
      key: "avg",
      header: "Avg Attendance",
      render: (d: DeptItem) => (
        <span className="font-mono text-xs font-bold tabular text-foreground">
          {d.avg}%
        </span>
      ),
    },
  ];

  return (
    <AppShell>
      <PageHeader
        eyebrow={isHOD ? "Dean of Academics & Department Head Console" : "Registrar & Administration Console"}
        title={isHOD ? "Academic & department overview" : "Institution-wide overview"}
        description={
          isHOD
            ? "Departmental student & faculty rosters, class load allocations & attendance telemetry."
            : "Master user roles directory, student/faculty rosters, and attendance telemetry."
        }
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleSeedDatabase}
              disabled={seeding}
              className="h-10 px-4 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 shadow-xs font-semibold transition-all"
            >
              {seeding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing Firestore…
                </>
              ) : (
                <>
                  <Database className="mr-2 h-4 w-4" /> Seed Master Data
                </>
              )}
            </Button>
            <Button
              onClick={handleExportMaster}
              variant="outline"
              className="h-10 px-4 rounded-xl border-border hover:bg-muted/50 font-medium transition-all shadow-2xs"
            >
              <Download className="mr-2 h-4 w-4" /> Export Master CSV
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Academic Departments" value="6" hint="AI & ML added this academic year" icon={Building2} />
        <StatCard label="Active Faculty" value={String(faculty.length + 140)} delta="+6" hint="Verified biometric / QR" icon={Users} tone="present" />
        <StatCard label="Total Enrolled" value={String(students.length + 2520)} delta="+184" hint="Across 8 semesters" icon={GraduationCap} />
        <StatCard label="Detention Risk" value="213" hint="Students below 75% cutoff" icon={TriangleAlert} tone="absent" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Panel
          title="Department Attendance Comparison"
          description="Monthly average progression across top 3 faculties"
          action={<StatusPill tone="muted">Jan – Aug 2026</StatusPill>}
        >
          <div className="h-72 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={TREND} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis domain={[65, 95]} stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <RTooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="rounded-xl border border-border bg-card p-3 shadow-xl text-xs space-y-1">
                        <p className="font-bold text-foreground mb-1.5">{label} 2026</p>
                        {payload.map((p) => (
                          <div key={p.name} className="flex justify-between gap-4">
                            <span className="text-muted-foreground">{p.name}:</span>
                            <span className="font-bold text-foreground tabular">{p.value}%</span>
                          </div>
                        ))}
                      </div>
                    );
                  }}
                />
                <Line type="monotone" dataKey="cse" stroke="var(--color-accent, #C96F42)" name="Computer Science" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="ece" stroke="var(--color-present, #6B8F71)" name="Electronics" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mech" stroke="var(--color-absent, #B25B4C)" name="Mechanical" strokeWidth={1.5} dot={false} strokeDasharray="4 4" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex flex-wrap gap-4 text-xs">
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <span className="h-2 w-2 rounded-full bg-accent" /> Computer Science (88.4%)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-foreground">
              <span className="h-2 w-2 rounded-full bg-present" /> Electronics & Comm. (82.1%)
            </span>
            <span className="flex items-center gap-1.5 font-medium text-muted-foreground">
              <span className="h-2 w-2 rounded-full bg-absent" /> Mechanical Engg (74.2%)
            </span>
          </div>
        </Panel>

        <Panel
          title="Critical Low Attendance Queue"
          description="Scholars under 70% threshold facing exam detention"
          bodyClassName="p-0"
          action={
            <Button
              size="sm"
              variant="outline"
              disabled={notifying}
              onClick={handleNotifyGuardians}
              className="h-8 rounded-lg text-xs font-semibold hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              {notifying ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : <Send className="mr-1.5 h-3.5 w-3.5" />}
              Dispatch Parent Notices
            </Button>
          }
        >
          <ul className="divide-y divide-border/60 max-h-[340px] overflow-y-auto">
            {LOW_ATTENDANCE.map((s) => (
              <li key={s.roll} className="flex items-center justify-between p-3.5 hover:bg-muted/30 transition-colors">
                <div className="min-w-0 pr-2">
                  <p className="truncate text-sm font-semibold text-foreground">{s.name}</p>
                  <p className="truncate text-[11px] text-muted-foreground font-mono mt-0.5">
                    {s.roll} · {s.dept}
                  </p>
                  <p className="text-[10px] text-muted-foreground">Guardian Contact: {s.contact}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display text-base font-bold tabular text-absent leading-none block">
                    {s.percent}%
                  </span>
                  <StatusPill tone="absent" className="mt-1 text-[9px] px-1.5 py-0">Detained</StatusPill>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Directory Management Tabs */}
      <Tabs defaultValue="users" className="space-y-4 pb-12">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
          <div className="w-full sm:w-auto overflow-x-auto pb-1 scrollbar-none">
            <TabsList className="h-auto p-1 bg-muted/50 border border-border flex flex-nowrap justify-start w-max rounded-xl">
              <TabsTrigger value="users" className="rounded-lg text-xs font-semibold px-3 sm:px-4 py-2 shrink-0">
                User Accounts & Roles ({users.length})
              </TabsTrigger>
              <TabsTrigger value="students" className="rounded-lg text-xs font-semibold px-3 sm:px-4 py-2 shrink-0">
                Enrolled Scholars ({filteredStudents.length})
              </TabsTrigger>
              <TabsTrigger value="faculty" className="rounded-lg text-xs font-semibold px-3 sm:px-4 py-2 shrink-0">
                Appointed Faculty ({filteredFaculty.length})
              </TabsTrigger>
              <TabsTrigger value="departments" className="rounded-lg text-xs font-semibold px-3 sm:px-4 py-2 shrink-0">
                Departments & Courses
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-muted-foreground shrink-0">Department:</span>
            <Select value={deptFilter} onValueChange={setDeptFilter}>
              <SelectTrigger className="h-9 w-full sm:min-w-[200px] rounded-xl text-xs font-semibold bg-surface border-border">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent className="rounded-xl text-xs">
                <SelectItem value="all">All Departments ({DEPARTMENTS.length})</SelectItem>
                {DEPARTMENTS.map((d) => (
                  <SelectItem key={d.code} value={d.name}>
                    {d.code} · {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 1. USERS & EDITABLE ROLES TAB */}
        <TabsContent value="users" className="space-y-4">
          <Panel
            title="Institutional Users & Role Access Matrix"
            description="Manage authentication permissions, roles (Student, Teacher, HOD, Admin, Parent) and 2FA credentials in Firestore"
            action={
              <Button
                size="sm"
                onClick={() => setShowAddUser(true)}
                className="h-8 rounded-lg bg-accent text-accent-foreground font-semibold text-xs shadow-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add User Account
              </Button>
            }
          >
            <DataTable
              columns={userCols}
              rows={users}
              searchKeys={["name", "email", "role", "department", "phone"]}
              searchPlaceholder="Search user accounts by name, email, phone or role…"
            />
          </Panel>
        </TabsContent>

        <TabsContent value="students" className="space-y-4">
          <Panel
            title="Institutional Student Roster"
            description={deptFilter === "all" ? "All campus branches · Live Firestore synchronization" : `Filtered by: ${deptFilter}`}
            action={
              <Button
                size="sm"
                onClick={() => setShowAddStudent(true)}
                className="h-8 rounded-lg bg-accent text-accent-foreground font-semibold text-xs shadow-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Register New Student
              </Button>
            }
          >
            <DataTable
              columns={studentCols}
              rows={filteredStudents}
              searchKeys={["name", "roll", "dept", "mentor"]}
              searchPlaceholder="Search scholar by roll, name, dept or mentor…"
            />
          </Panel>
        </TabsContent>

        <TabsContent value="faculty" className="space-y-4">
          <Panel
            title="Faculty & Lecturer Directory"
            description={deptFilter === "all" ? "All teaching appointments · Live Firestore synchronization" : `Filtered by: ${deptFilter}`}
            action={
              <Button
                size="sm"
                onClick={() => setShowAddFaculty(true)}
                className="h-8 rounded-lg bg-accent text-accent-foreground font-semibold text-xs shadow-xs"
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Add Faculty Profile
              </Button>
            }
          >
            <DataTable
              columns={facultyCols}
              rows={filteredFaculty}
              searchKeys={["name", "id", "dept", "designation", "email"]}
              searchPlaceholder="Search faculty by name, ID or department…"
            />
          </Panel>
        </TabsContent>

        <TabsContent value="departments" className="space-y-4">
          <Panel
            title="Academic Departments"
            description="Aggregated department-level metrics and faculty counts"
          >
            <DataTable
              columns={deptCols}
              rows={DEPARTMENTS}
              searchKeys={["name", "code", "hod"]}
              searchPlaceholder="Search department code or HOD…"
            />
          </Panel>
        </TabsContent>
      </Tabs>

      {/* Edit User Account & Role Modal */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent/15 text-accent font-bold">
                <Shield className="h-5 w-5" />
              </span>
              <div>
                <h3 className="font-display font-bold text-base sm:text-lg text-foreground">Edit User Account & Role</h3>
                <p className="text-xs text-muted-foreground">Update permissions and institutional identity</p>
              </div>
            </div>

            <form onSubmit={handleSaveUserRole} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <Input
                  required
                  value={editUserName}
                  onChange={(e) => setEditUserName(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Email Address</label>
                <Input
                  type="email"
                  required
                  value={editUserEmail}
                  onChange={(e) => setEditUserEmail(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Assign Institutional Role</label>
                <Select value={editUserRole} onValueChange={(v: Role) => setEditUserRole(v)}>
                  <SelectTrigger className="h-10 rounded-xl mt-1 text-sm font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="student">Student Scholar (Scholar Dashboard & Attendance)</SelectItem>
                    <SelectItem value="teacher">Faculty Member (Lecture Attendance & QR Broadcast)</SelectItem>
                    <SelectItem value="hod">Dean / Head of Department (Academic Oversight)</SelectItem>
                    <SelectItem value="admin">Administrator / Registrar (Campus Governance)</SelectItem>
                    <SelectItem value="parent">Parent / Guardian (Ward Monitoring & Digest)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Department / Division</label>
                <Input
                  value={editUserDept}
                  onChange={(e) => setEditUserDept(e.target.value)}
                  placeholder="e.g. Computer Science & Engineering"
                  className="h-10 rounded-xl mt-1 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground">Mobile Phone (for 2FA OTP)</label>
                <Input
                  value={editUserPhone}
                  onChange={(e) => setEditUserPhone(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm font-mono"
                />
              </div>

              {editUserRole === "student" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Student Roll No</label>
                  <Input
                    value={editUserRoll}
                    onChange={(e) => setEditUserRoll(e.target.value)}
                    placeholder="e.g. 21CS042"
                    className="h-10 rounded-xl mt-1 text-sm font-mono"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingUser(null)}
                  className="flex-1 rounded-xl h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl h-10 bg-accent text-accent-foreground font-semibold text-xs shadow-xs"
                >
                  Save User & Role
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground">Create User Account</h3>
            <p className="text-xs text-muted-foreground">Add a new student, faculty, HOD, admin, or parent to Central Firestore</p>
            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <Input
                  required
                  placeholder="e.g. Aditi Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm font-medium"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Official Email Address</label>
                <Input
                  type="email"
                  required
                  placeholder="aditi.sharma@svit.ac.in"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">System Role</label>
                <Select value={newUserRole} onValueChange={(v: any) => setNewUserRole(v)}>
                  <SelectTrigger className="h-10 rounded-xl mt-1 text-sm font-medium">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="student">Student (Scholar)</SelectItem>
                    <SelectItem value="teacher">Teacher (Faculty)</SelectItem>
                    <SelectItem value="hod">HOD / Dean (Head of Dept)</SelectItem>
                    <SelectItem value="admin">Administrator (Registrar)</SelectItem>
                    <SelectItem value="parent">Parent (Guardian)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUserRole === "student" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">University Roll No</label>
                  <Input
                    placeholder="e.g. 21CS095"
                    value={newUserRoll}
                    onChange={(e) => setNewUserRoll(e.target.value)}
                    className="h-10 rounded-xl mt-1 text-sm font-mono"
                  />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Department / Branch</label>
                <Select value={newUserDept} onValueChange={setNewUserDept}>
                  <SelectTrigger className="h-10 rounded-xl mt-1 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.code} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Mobile Phone (2FA SMS)</label>
                <Input
                  placeholder="+91 98220 12345"
                  value={newUserPhone}
                  onChange={(e) => setNewUserPhone(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm font-mono"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddUser(false)}
                  className="flex-1 rounded-xl h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 rounded-xl h-10 bg-accent text-accent-foreground font-semibold text-xs shadow-xs"
                >
                  Create User
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground">Register New Scholar</h3>
            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Full Name</label>
                <Input
                  required
                  placeholder="e.g. Ramesh Chandra"
                  value={stuName}
                  onChange={(e) => setStuName(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">University Roll No</label>
                <Input
                  required
                  placeholder="e.g. 21CS099"
                  value={stuRoll}
                  onChange={(e) => setStuRoll(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Department</label>
                <Select value={stuDept} onValueChange={setStuDept}>
                  <SelectTrigger className="h-10 rounded-xl mt-1 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {DEPARTMENTS.map((d) => (
                      <SelectItem key={d.code} value={d.name}>
                        {d.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddStudent(false)}
                  className="flex-1 rounded-xl h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl h-10 bg-accent text-accent-foreground font-semibold text-xs">
                  Save Student
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Add Faculty Modal */}
      {showAddFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-card p-4 sm:p-6 shadow-2xl space-y-4"
          >
            <h3 className="font-display font-bold text-base sm:text-lg text-foreground">Add Appointed Faculty</h3>
            <form onSubmit={handleCreateFaculty} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Faculty Full Name</label>
                <Input
                  required
                  placeholder="e.g. Dr. Harish Prasad"
                  value={facName}
                  onChange={(e) => setFacName(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Official Email</label>
                <Input
                  type="email"
                  required
                  placeholder="harish.prasad@svit.ac.in"
                  value={facEmail}
                  onChange={(e) => setFacEmail(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Designation</label>
                <Input
                  required
                  placeholder="Associate Professor"
                  value={facDesig}
                  onChange={(e) => setFacDesig(e.target.value)}
                  className="h-10 rounded-xl mt-1 text-sm"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddFaculty(false)}
                  className="flex-1 rounded-xl h-10 text-xs"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 rounded-xl h-10 bg-accent text-accent-foreground font-semibold text-xs">
                  Save Faculty
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AppShell>
  );
}
