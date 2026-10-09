import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, onAuthStateChanged } from "@/lib/firebase";
import { Role } from "@/lib/data";
import { readRole, setRole as saveSessionRole } from "@/lib/utils";
import { AttendanceService } from "@/features/attendance/attendance-service";
import { UserStore, StoredUser, DispatchedOtp } from "./user-store";

export interface UserProfile {
  uid: string;
  email: string;
  username?: string;
  name: string;
  role: Role;
  rollNumber?: string | undefined;
  department?: string | undefined;
  phone?: string | undefined;
  mentor?: string | undefined;
  wardName?: string | undefined;
  createdAt?: any;
}

export interface PendingAuth {
  uid?: string;
  email: string;
  name: string;
  role: Role;
  rollNumber?: string | undefined;
  phone: string;
  otp: string;
  expiresAt: number;
}

export interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  pendingAuth: PendingAuth | null;
  isAuthenticated: boolean;
  loading: boolean;
  role: Role;
  activeOtpData: DispatchedOtp | null;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, role: Role, rollNumber?: string, phone?: string) => Promise<void>;
  initiateLogin: (identifier: string, pass: string, selectedRole: Role) => Promise<{ otp: string; phone: string; name: string }>;
  initiateSignup: (
    email: string,
    pass: string,
    name: string,
    newRole: Role,
    rollNumber?: string,
    phone?: string,
  ) => Promise<{ otp: string; phone: string; name: string }>;
  verifyOtp: (code: string) => Promise<boolean>;
  resendOtp: () => string;
  quickLogin: (role: Role) => void;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfileData: (updates: Partial<UserProfile>) => Promise<void>;
}

export const DEFAULT_PROFILES: Record<Role, UserProfile> = {
  student: {
    uid: "usr-student-001",
    email: "ananya.deshpande@svit.ac.in",
    username: "ananya",
    name: "Ananya Deshpande",
    role: "student",
    rollNumber: "21CS042",
    department: "Computer Science & Engineering",
    phone: "+91 98220 41123",
    mentor: "Prof. Anil Kulkarni",
  },
  teacher: {
    uid: "usr-teacher-001",
    email: "anil.kulkarni@svit.ac.in",
    username: "anil",
    name: "Prof. Anil Kulkarni",
    role: "teacher",
    department: "Department of Computer Science & MCA",
    phone: "+91 98450 11223",
  },
  hod: {
    uid: "usr-hod-001",
    email: "kavita.nair@svit.ac.in",
    username: "kavita",
    name: "Dr. Kavita Nair",
    role: "hod",
    department: "Dean of Academics & HOD CSE/MCA",
    phone: "+91 99000 77665",
  },
  admin: {
    uid: "usr-admin-001",
    email: "registrar@svit.ac.in",
    username: "admin",
    name: "Dr. Meenakshi Rao",
    role: "admin",
    department: "Registrar · Campus Administration",
    phone: "+91 99000 88776",
  },
  parent: {
    uid: "usr-parent-001",
    email: "deshpande.parent@gmail.com",
    username: "parent",
    name: "Sudhir Deshpande",
    role: "parent",
    department: "Guardian of Ananya Deshpande (21CS042)",
    wardName: "Ananya Deshpande (21CS042)",
    phone: "+91 98220 41123",
  },
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  pendingAuth: null,
  isAuthenticated: false,
  loading: true,
  role: "student",
  activeOtpData: null,
  signIn: async () => {},
  signUp: async () => {},
  initiateLogin: async () => ({ otp: "123456", phone: "+91 98220 41123", name: "User" }),
  initiateSignup: async () => ({ otp: "123456", phone: "+91 98220 41123", name: "User" }),
  verifyOtp: async () => false,
  resendOtp: () => "123456",
  quickLogin: () => {},
  signOut: async () => {},
  resetPassword: async () => {},
  updateProfileData: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [pendingAuth, setPendingAuth] = useState<PendingAuth | null>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = sessionStorage.getItem("svit_pending_auth");
        return stored ? JSON.parse(stored) : null;
      } catch {}
    }
    return null;
  });
  const [activeOtpData, setActiveOtpData] = useState<DispatchedOtp | null>(() => UserStore.getActiveOtp());
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [role, setRoleState] = useState<Role>("student");

  // Load initial session on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const savedAuth = localStorage.getItem("svit_auth_active");
        const savedRole = (localStorage.getItem("svit_role") as Role) || "student";
        const savedProfileJson = localStorage.getItem("svit_profile");

        if (savedAuth === "true") {
          setIsAuthenticated(true);
          setRoleState(savedRole);
          if (savedProfileJson) {
            try {
              setProfile(JSON.parse(savedProfileJson));
            } catch {
              setProfile(DEFAULT_PROFILES[savedRole]);
            }
          } else {
            setProfile(DEFAULT_PROFILES[savedRole]);
          }
        } else {
          setIsAuthenticated(false);
          setProfile(null);
        }
      }
    } catch (e) {
      console.warn("Session restore exception:", e);
    }

    // Subscribe to Firebase Auth changes if configured
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        setIsAuthenticated(true);
        if (typeof window !== "undefined") {
          localStorage.setItem("svit_auth_active", "true");
        }
        await fetchProfileFromDb(firebaseUser);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchProfileFromDb = async (firebaseUser: User) => {
    try {
      if (db) {
        const snap = await getDoc(doc(db, "users", firebaseUser.uid));
        if (snap.exists()) {
          const data = snap.data() as UserProfile;
          setProfile(data);
          const r = data.role || "student";
          setRoleState(r);
          saveSessionRole(r);
          if (typeof window !== "undefined") {
            localStorage.setItem("svit_profile", JSON.stringify(data));
            localStorage.setItem("svit_auth_active", "true");
          }
          return;
        }
      }
    } catch (e) {
      console.warn("Could not fetch user profile from Firestore:", e);
    }

    const currentR = readRole();
    const fallback = DEFAULT_PROFILES[currentR];
    setProfile(fallback);
    if (typeof window !== "undefined") {
      localStorage.setItem("svit_profile", JSON.stringify(fallback));
      localStorage.setItem("svit_auth_active", "true");
    }
  };

  /**
   * Initiate Login with Strict Password & Role Verification + 6-digit OTP dispatch
   */
  const initiateLogin = async (
    identifier: string,
    pass: string,
    selectedRole: Role,
  ): Promise<{ otp: string; phone: string; name: string }> => {
    if (!identifier.trim()) {
      throw new Error("Please enter your Username, Email, or Roll Number.");
    }
    if (!pass.trim()) {
      throw new Error("Please enter your account password.");
    }

    // Strict validation against UserStore
    const user = UserStore.validateCredentials(identifier, pass, selectedRole);

    // Generate unique 6-digit OTP
    const otpData = UserStore.generateOtp(user.phone, user.email);
    setActiveOtpData(otpData);

    const pending: PendingAuth = {
      uid: user.uid,
      email: user.email,
      name: user.name,
      role: user.role,
      rollNumber: user.rollNumber,
      phone: user.phone,
      otp: otpData.code,
      expiresAt: otpData.expiresAt,
    };

    setPendingAuth(pending);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("svit_pending_auth", JSON.stringify(pending));
    }

    return {
      otp: otpData.code,
      phone: user.phone,
      name: user.name,
    };
  };

  /**
   * Initiate Signup with New Account Registration + 6-digit OTP dispatch
   */
  const initiateSignup = async (
    email: string,
    pass: string,
    name: string,
    newRole: Role,
    rollNumber?: string,
    phone?: string,
  ): Promise<{ otp: string; phone: string; name: string }> => {
    if (!name.trim()) {
      throw new Error("Please enter your full name.");
    }
    if (!email.trim()) {
      throw new Error("Please enter your institutional email.");
    }
    if (!pass.trim() || pass.length < 6) {
      throw new Error("Password must be at least 6 characters long.");
    }

    const cleanedPhone = phone?.trim() || "+91 98765 43210";
    if (cleanedPhone.replace(/[^0-9]/g, "").length < 10) {
      throw new Error("Please enter a valid 10-digit mobile number for 2FA SMS verification.");
    }

    // Register user in store
    const registered = UserStore.registerUser({
      email,
      username: email.split("@")[0] || name.toLowerCase().replace(/\s+/g, ""),
      password: pass,
      name,
      role: newRole,
      phone: cleanedPhone,
      rollNumber: rollNumber || (newRole === "student" ? `21CS${Math.floor(100 + Math.random() * 899)}` : undefined),
      department: newRole === "teacher" ? "Computer Science & MCA" : newRole === "student" ? "Computer Science & Engineering" : "Administration",
    });

    // Sync newly registered profile directly into live database & student rosters
    try {
      await AttendanceService.saveUser({
        uid: registered.uid,
        name: registered.name,
        email: registered.email,
        role: registered.role,
        phone: registered.phone,
        rollNumber: registered.rollNumber,
        department: registered.department,
        createdAt: serverTimestamp(),
      });

      if (registered.role === "student") {
        await AttendanceService.addStudent({
          name: registered.name,
          roll: registered.rollNumber || `21CS${Math.floor(100 + Math.random() * 899)}`,
          dept: registered.department || "Computer Science & Engineering",
          sem: "Semester V",
          email: registered.email,
          phone: registered.phone || "+91 98220 41123",
          attendancePercent: 85.0,
          mentor: "Prof. Rajeev Iyer",
        });
      }
    } catch (err) {
      console.warn("Live database registration broadcast note:", err);
    }

    // Generate unique 6-digit OTP
    const otpData = UserStore.generateOtp(registered.phone, registered.email);
    setActiveOtpData(otpData);

    const pending: PendingAuth = {
      uid: registered.uid,
      email: registered.email,
      name: registered.name,
      role: registered.role,
      rollNumber: registered.rollNumber,
      phone: registered.phone,
      otp: otpData.code,
      expiresAt: otpData.expiresAt,
    };

    setPendingAuth(pending);
    if (typeof window !== "undefined") {
      sessionStorage.setItem("svit_pending_auth", JSON.stringify(pending));
    }

    return {
      otp: otpData.code,
      phone: registered.phone,
      name: registered.name,
    };
  };

  /**
   * Verify the 6-digit OTP
   */
  const verifyOtp = async (code: string): Promise<boolean> => {
    const activePending =
      pendingAuth ||
      (typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem("svit_pending_auth") || "null")
        : null);

    if (!activePending) {
      throw new Error("No active verification session found. Please sign in again.");
    }

    const verificationResult = UserStore.verifyOtp(code);
    if (!verificationResult.valid) {
      throw new Error(verificationResult.error || "Invalid 6-digit OTP. Please try again.");
    }

    const activeProf: UserProfile = {
      uid: activePending.uid || `user-${Date.now()}`,
      email: activePending.email,
      name: activePending.name,
      role: activePending.role,
      rollNumber: activePending.rollNumber,
      department: activePending.role === "teacher" ? "Computer Science & MCA" : "Computer Science & Engineering",
      phone: activePending.phone,
      createdAt: serverTimestamp(),
    };

    if (db) {
      try {
        await setDoc(doc(db, "users", activeProf.uid), activeProf, { merge: true });
      } catch {}
    }

    setProfile(activeProf);
    setRoleState(activePending.role);
    saveSessionRole(activePending.role);
    setIsAuthenticated(true);
    setPendingAuth(null);
    setActiveOtpData(null);

    if (typeof window !== "undefined") {
      localStorage.setItem("svit_profile", JSON.stringify(activeProf));
      localStorage.setItem("svit_auth_active", "true");
      sessionStorage.removeItem("svit_pending_auth");
    }

    return true;
  };

  const resendOtp = (): string => {
    const activePending =
      pendingAuth ||
      (typeof window !== "undefined"
        ? JSON.parse(sessionStorage.getItem("svit_pending_auth") || "null")
        : null);

    const targetPhone = activePending?.phone || "+91 98220 41123";
    const targetEmail = activePending?.email || "user@svit.ac.in";

    const otpData = UserStore.generateOtp(targetPhone, targetEmail);
    setActiveOtpData(otpData);

    if (activePending) {
      const updated: PendingAuth = {
        ...activePending,
        otp: otpData.code,
        expiresAt: otpData.expiresAt,
      };
      setPendingAuth(updated);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("svit_pending_auth", JSON.stringify(updated));
      }
    }
    return otpData.code;
  };

  const signIn = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      setUser(cred.user);
      await fetchProfileFromDb(cred.user);
      setIsAuthenticated(true);
    } catch {
      await initiateLogin(email, pass, role);
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (
    email: string,
    pass: string,
    name: string,
    newRole: Role,
    rollNumber?: string,
    phone?: string,
  ) => {
    await initiateSignup(email, pass, name, newRole, rollNumber, phone);
  };

  const quickLogin = (r: Role) => {
    setRoleState(r);
    saveSessionRole(r);
    const prof = DEFAULT_PROFILES[r];
    setProfile(prof);
    setIsAuthenticated(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("svit_profile", JSON.stringify(prof));
      localStorage.setItem("svit_auth_active", "true");
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch {}
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
    setPendingAuth(null);
    setActiveOtpData(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("svit_auth_active");
      localStorage.removeItem("svit_role");
      localStorage.removeItem("svit_profile");
      sessionStorage.removeItem("svit_pending_auth");
      sessionStorage.removeItem("svit_active_dispatched_otp");
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (e) {
      console.warn("Reset password fallback:", e);
    }
  };

  const updateProfileData = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    if (typeof window !== "undefined") {
      localStorage.setItem("svit_profile", JSON.stringify(updated));
    }
    await AttendanceService.saveUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        pendingAuth,
        isAuthenticated,
        loading,
        role,
        activeOtpData,
        signIn,
        signUp,
        initiateLogin,
        initiateSignup,
        verifyOtp,
        resendOtp,
        quickLogin,
        signOut,
        resetPassword,
        updateProfileData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
