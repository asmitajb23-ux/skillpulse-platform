// Privacy & data-governance service.
//
// Demo mode persists to localStorage (namespaced via lib/storage). When Supabase
// is configured, the same shape is mirrored by the `privacy_settings` and
// `data_deletion_requests` tables (see supabase/schema.sql), protected by RLS so
// a user can only ever read/write their own row.

import { getSupabase } from "@/lib/supabase";
import { readStore, uid, writeStore } from "@/lib/storage";
import type { DataDeletionRequest, PrivacySettings, Role } from "@/types";

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  profile_visibility: "public",
  passport_sharing: true,
  allow_recruiter_access: true,
  allow_college_analytics: true,
  show_contact_email: false,
};

const settingsKey = (userId: string) => `privacy:${userId}`;
const deletionKey = (userId: string) => `deletion:${userId}`;

export function getPrivacySettings(userId: string): PrivacySettings {
  const stored = readStore<Partial<PrivacySettings> | null>(settingsKey(userId), null);
  return { ...DEFAULT_PRIVACY_SETTINGS, ...(stored ?? {}) };
}

export function savePrivacySettings(userId: string, settings: PrivacySettings): void {
  const supabase = getSupabase();
  if (supabase) {
    // Fire-and-forget upsert; RLS guarantees the user can only touch their own row.
    void supabase.from("privacy_settings").upsert({ user_id: userId, ...settings });
  }
  writeStore(settingsKey(userId), settings);
}

/**
 * A recruiter may view a candidate only when the student's profile is public
 * AND they have explicitly allowed recruiter access.
 */
export function canRecruiterAccess(userId: string): boolean {
  const s = getPrivacySettings(userId);
  return s.profile_visibility === "public" && s.allow_recruiter_access;
}

/**
 * College analytics access is granted per the student's consent flag. Admins are
 * additionally scoped to their own institution by RLS in Supabase.
 */
export function canCollegeAccess(userId: string, viewerRole: Role): boolean {
  if (viewerRole !== "college_admin") return false;
  return getPrivacySettings(userId).allow_college_analytics;
}

/** Whether the public Skill Passport is shareable at all. */
export function isPassportShared(userId: string): boolean {
  const s = getPrivacySettings(userId);
  return s.passport_sharing && s.profile_visibility === "public";
}

// ---------------- Account / data deletion ----------------

export function getDeletionRequest(userId: string): DataDeletionRequest | null {
  return readStore<DataDeletionRequest | null>(deletionKey(userId), null);
}

export function requestDataDeletion(
  userId: string,
  email: string,
  reason?: string
): DataDeletionRequest {
  const request: DataDeletionRequest = {
    id: uid("del"),
    user_id: userId,
    email,
    status: "pending",
    reason: reason?.trim() ? reason.trim() : null,
    requested_at: new Date().toISOString(),
  };
  const supabase = getSupabase();
  if (supabase) {
    void supabase.from("data_deletion_requests").insert(request);
  }
  writeStore(deletionKey(userId), request);
  return request;
}

export function cancelDeletionRequest(userId: string): void {
  const existing = getDeletionRequest(userId);
  if (!existing) return;
  const cancelled: DataDeletionRequest = { ...existing, status: "cancelled" };
  const supabase = getSupabase();
  if (supabase) {
    void supabase.from("data_deletion_requests").update({ status: "cancelled" }).eq("id", existing.id);
  }
  writeStore(deletionKey(userId), cancelled);
}
