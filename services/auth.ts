import { getSupabase } from "@/lib/supabase";
import { readStore, writeStore } from "@/lib/storage";
import { demoAccounts } from "@/data/demo";
import type { Profile, Role } from "@/types";

export const SESSION_COOKIE = "sp_session";

// Demo-mode fallback user record. We NEVER store the plaintext password — only a
// SHA-256 digest, and only when Supabase Auth is not configured. In production the
// Supabase branch below handles credentials and nothing is persisted client-side.
interface StoredUser extends Profile {
  password_hash: string;
}

async function hashPassword(password: string): Promise<string> {
  const bytes = new TextEncoder().encode(password);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function setSessionCookie(user: Profile) {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=${encodeURIComponent(
    JSON.stringify(user)
  )}; path=/; max-age=${60 * 60 * 24 * 7}; samesite=lax`;
}

function clearSessionCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0`;
}

export function getSessionFromCookie(cookieHeader?: string | null): Profile | null {
  const raw =
    cookieHeader ??
    (typeof document !== "undefined" ? document.cookie : null);
  if (!raw) return null;
  const match = raw
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${SESSION_COOKIE}=`));
  if (!match) return null;
  try {
    const user = JSON.parse(decodeURIComponent(match.slice(SESSION_COOKIE.length + 1)));
    if (user && user.id && user.role) return user as Profile;
    return null;
  } catch {
    return null;
  }
}

function getStoredUsers(): StoredUser[] {
  return readStore<StoredUser[]>("users", []);
}

export async function login(email: string, password: string): Promise<Profile> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(error.message);
    const role = (data.user.user_metadata?.role ?? "student") as Role;
    const profile: Profile = {
      id: data.user.id,
      email: data.user.email ?? email,
      name: data.user.user_metadata?.name ?? email.split("@")[0],
      role,
    };
    setSessionCookie(profile);
    return profile;
  }

  const demo = demoAccounts.find(
    (a) => a.email.toLowerCase() === email.toLowerCase() && a.password === password
  );
  if (demo) {
    const profile: Profile = { id: demo.user_id, email: demo.email, name: demo.name, role: demo.role };
    setSessionCookie(profile);
    return profile;
  }

  const stored = getStoredUsers().find(
    (u) => u.email.toLowerCase() === email.toLowerCase()
  );
  if (!stored || stored.password_hash !== (await hashPassword(password))) {
    throw new Error("Invalid email or password");
  }
  const { password_hash: _pw, ...profile } = stored;
  setSessionCookie(profile);
  return profile;
}

export async function signup(
  name: string,
  email: string,
  password: string,
  role: Role
): Promise<Profile> {
  const supabase = getSupabase();
  if (supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name, role } },
    });
    if (error) throw new Error(error.message);
    const profile: Profile = {
      id: data.user?.id ?? email,
      email,
      name,
      role,
    };
    setSessionCookie(profile);
    return profile;
  }

  const users = getStoredUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw new Error("An account with this email already exists. Try logging in.");
  }
  const profile: Profile = {
    id: `u-${Date.now().toString(36)}`,
    email,
    name,
    role,
  };
  users.push({ ...profile, password_hash: await hashPassword(password) });
  writeStore("users", users);
  setSessionCookie(profile);
  return profile;
}

export async function logout(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) await supabase.auth.signOut();
  clearSessionCookie();
}

export function roleHomePath(role: Role): string {
  switch (role) {
    case "student":
      return "/student";
    case "recruiter":
      return "/recruiter";
    case "college_admin":
      return "/admin";
  }
}
