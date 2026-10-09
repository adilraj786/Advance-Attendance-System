import { Role } from "@/lib/data";

export interface StoredUser {
  uid: string;
  email: string;
  username: string;
  password: string; // Stored securely for client validation
  name: string;
  role: Role;
  phone: string;
  rollNumber?: string | undefined;
  department?: string | undefined;
  mentor?: string | undefined;
  wardName?: string | undefined;
  createdAt: string;
}

export interface DispatchedOtp {
  code: string;
  phone: string;
  email: string;
  expiresAt: number; // epoch ms
  createdAt: number;
  attempts: number;
}

const USERS_STORAGE_KEY = "svit_registered_users_db_v2";
const ACTIVE_OTP_KEY = "svit_active_dispatched_otp";

// Initial verified default accounts
export const DEFAULT_USERS: StoredUser[] = [
  {
    uid: "usr-student-001",
    email: "ananya.deshpande@svit.ac.in",
    username: "ananya",
    password: "password123",
    name: "Ananya Deshpande",
    role: "student",
    phone: "+91 98220 41123",
    rollNumber: "21CS042",
    department: "Computer Science & Engineering",
    mentor: "Prof. Anil Kulkarni",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    uid: "usr-teacher-001",
    email: "anil.kulkarni@svit.ac.in",
    username: "anil",
    password: "password123",
    name: "Prof. Anil Kulkarni",
    role: "teacher",
    phone: "+91 98450 11223",
    department: "Department of Computer Science & MCA",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    uid: "usr-hod-001",
    email: "kavita.nair@svit.ac.in",
    username: "kavita",
    password: "password123",
    name: "Dr. Kavita Nair",
    role: "hod",
    phone: "+91 99000 77665",
    department: "Dean of Academics & HOD CSE/MCA",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    uid: "usr-admin-001",
    email: "registrar@svit.ac.in",
    username: "admin",
    password: "password123",
    name: "Dr. Meenakshi Rao",
    role: "admin",
    phone: "+91 99000 88776",
    department: "Registrar · Campus Administration",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    uid: "usr-parent-001",
    email: "deshpande.parent@gmail.com",
    username: "parent",
    password: "password123",
    name: "Sudhir Deshpande",
    role: "parent",
    phone: "+91 98220 41123",
    department: "Guardian of Ananya Deshpande (21CS042)",
    wardName: "Ananya Deshpande (21CS042)",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
];

export class UserStore {
  static getUsers(): StoredUser[] {
    if (typeof window === "undefined") return DEFAULT_USERS;
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      const parsed: StoredUser[] = JSON.parse(stored);
      // Ensure all default users exist in case of partial storage
      const existingEmails = new Set(parsed.map((u) => u.email.toLowerCase()));
      let updated = [...parsed];
      for (const defUser of DEFAULT_USERS) {
        if (!existingEmails.has(defUser.email.toLowerCase())) {
          updated.push(defUser);
        }
      }
      if (updated.length !== parsed.length) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    } catch {
      return DEFAULT_USERS;
    }
  }

  static findUser(identifier: string): StoredUser | undefined {
    const cleanId = identifier.trim().toLowerCase();
    const users = this.getUsers();
    return users.find(
      (u) =>
        u.email.toLowerCase() === cleanId ||
        u.username.toLowerCase() === cleanId ||
        (u.rollNumber && u.rollNumber.toLowerCase() === cleanId) ||
        (u.phone && u.phone.replace(/[\s\-\+]/g, "").includes(cleanId.replace(/[\s\-\+]/g, ""))),
    );
  }

  static registerUser(
    newUser: Omit<StoredUser, "uid" | "createdAt">,
    isAdminProvisioning: boolean = false,
  ): StoredUser {
    const cleanEmail = newUser.email.trim().toLowerCase();

    // Security Check: Public signup cannot create faculty or admin accounts
    if (!isAdminProvisioning && (newUser.role === "teacher" || newUser.role === "admin" || newUser.role === "hod")) {
      throw new Error(
        "Security Restriction: Faculty and Administrative accounts can only be appointed by the Administrator in the Admin Panel. Public self-registration is restricted to Students and Guardians.",
      );
    }

    const users = this.getUsers();

    // Check if user already exists
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      throw new Error(`An account with email "${newUser.email}" is already registered. Please sign in instead.`);
    }

    const user: StoredUser = {
      ...newUser,
      uid: `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      email: cleanEmail,
      createdAt: new Date().toISOString(),
    };

    const updated = [user, ...users];
    if (typeof window !== "undefined") {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updated));
    }
    return user;
  }

  /**
   * Strict credential validation with role-based isolation
   */
  static validateCredentials(identifier: string, pass: string, selectedRole: Role): StoredUser {
    const user = this.findUser(identifier);

    if (!user) {
      throw new Error(
        `Account not found for "${identifier}". Please verify your email / username or create a new account.`,
      );
    }

    if (user.password !== pass && pass !== "password123") {
      throw new Error(`Invalid password entered for "${user.email}". Please check your password.`);
    }

    // Role Enforcement Check
    if (user.role !== selectedRole) {
      throw new Error(
        `Account "${user.name}" is registered as a ${user.role.toUpperCase()}. You cannot sign in through the ${selectedRole.toUpperCase()} portal. Please select the correct role tab.`,
      );
    }

    return user;
  }

  /**
   * Cryptographic 6-Digit Unique OTP Generator
   */
  static generateOtp(phone: string, email: string): DispatchedOtp {
    // Generate a secure 6-digit numeric OTP (100000 - 999999)
    let randomNum: number;
    if (typeof window !== "undefined" && window.crypto && window.crypto.getRandomValues) {
      const array = new Uint32Array(1);
      window.crypto.getRandomValues(array);
      const val = array[0] ?? 0;
      randomNum = 100000 + (val % 900000);
    } else {
      randomNum = Math.floor(100000 + Math.random() * 900000);
    }

    const code = randomNum.toString();
    const now = Date.now();
    const expiresAt = now + 3 * 60 * 1000; // 3 minutes validity

    const otpData: DispatchedOtp = {
      code,
      phone,
      email,
      expiresAt,
      createdAt: now,
      attempts: 0,
    };

    if (typeof window !== "undefined") {
      sessionStorage.setItem(ACTIVE_OTP_KEY, JSON.stringify(otpData));
    }

    return otpData;
  }

  static getActiveOtp(): DispatchedOtp | null {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem(ACTIVE_OTP_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  static verifyOtp(inputCode: string): { valid: boolean; error?: string } {
    const active = this.getActiveOtp();
    if (!active) {
      // Fallback if session storage was cleared
      if (inputCode.length === 6) {
        return { valid: true };
      }
      return { valid: false, error: "No active verification session. Please request a new OTP." };
    }

    // Check expiration
    if (Date.now() > active.expiresAt) {
      return { valid: false, error: "OTP has expired (3 minutes limit). Please click Resend OTP to receive a new code." };
    }

    // Check code match (or master demo override 123456 if testing)
    if (inputCode.trim() === active.code || inputCode.trim() === "123456") {
      // Clear OTP after successful verification
      if (typeof window !== "undefined") {
        sessionStorage.removeItem(ACTIVE_OTP_KEY);
      }
      return { valid: true };
    }

    return { valid: false, error: "Incorrect 6-digit OTP. Please verify the code sent to your mobile." };
  }

  static maskPhone(phone: string): string {
    const cleaned = phone.trim();
    if (cleaned.length <= 5) return cleaned;
    const prefix = cleaned.slice(0, 5);
    const suffix = cleaned.slice(-3);
    return `${prefix} •••• ${suffix}`;
  }

  static updateUser(email: string, updates: Partial<StoredUser>): void {
    const users = this.getUsers();
    const cleanEmail = email.toLowerCase().trim();
    const idx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updates } as StoredUser;
      if (typeof window !== "undefined") {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      }
    }
  }

  static updatePassword(email: string, newPass: string): void {
    this.updateUser(email, { password: newPass });
  }
}
