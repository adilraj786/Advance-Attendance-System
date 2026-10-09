import { useEffect, useState } from "react";
import type { Role } from "@/lib/data/mock-data";

const ROLE_KEY = "svit_active_role";
const THEME_KEY = "svit_theme";

export const ROLE_HOME: Record<Role, string> = {
  student: "/student",
  teacher: "/teacher",
  hod: "/admin",
  admin: "/admin",
  parent: "/parent",
};

export const readRole = (): Role => {
  if (typeof window === "undefined") return "student";
  const r = localStorage.getItem(ROLE_KEY) || localStorage.getItem("svit_role");
  if (r === "student" || r === "teacher" || r === "hod" || r === "admin" || r === "parent") return r;
  return "student";
};

export const setRole = (r: Role) => {
  if (typeof window !== "undefined") {
    localStorage.setItem(ROLE_KEY, r);
    localStorage.setItem("svit_role", r);
    window.dispatchEvent(new Event("storage"));
  }
};

export const useRole = (): Role => {
  const [role, setR] = useState<Role>("student");
  useEffect(() => {
    setR(readRole());
    const onStorage = () => setR(readRole());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return role;
};

export const useTheme = () => {
  const [mounted, setMounted] = useState(false);
  const [dark, setDark] = useState<boolean>(true);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem(THEME_KEY);
    const isDark = stored === "dark" || stored === null;
    setDark(isDark);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (dark) root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem(THEME_KEY, dark ? "dark" : "light");
  }, [dark, mounted]);

  return { dark, toggle: () => setDark((d) => !d), mounted };
};
