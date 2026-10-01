"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { getStudentBundle, type StudentBundle } from "@/services/student";

interface UseStudentDataResult {
  bundle: StudentBundle | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

export function useStudentData(): UseStudentDataResult {
  const { user, loading: authLoading } = useAuth();
  const [bundle, setBundle] = useState<StudentBundle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  const reload = useCallback(() => setTick((t) => t + 1), []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== "student") {
      setLoading(false);
      if (!user) setError("You must be signed in as a student.");
      return;
    }
    try {
      // Simulate a short fetch so loading states are real
      const timer = setTimeout(() => {
        const data = getStudentBundle(user.id, user);
        setBundle(data);
        setError(data ? null : "Student profile could not be loaded.");
        setLoading(false);
      }, 250);
      return () => clearTimeout(timer);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load student data.");
      setLoading(false);
    }
  }, [user, authLoading, tick]);

  return { bundle, loading: loading || authLoading, error, reload };
}
