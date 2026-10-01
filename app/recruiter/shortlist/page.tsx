"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { getCandidateDetail, getShortlists, toggleShortlist } from "@/services/recruiter";
import { getRole } from "@/data/demo";
import { formatDate } from "@/lib/utils";
import type { Shortlist } from "@/types";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";

interface ShortlistRow {
  shortlist: Shortlist;
  name: string;
  headline: string;
  college: string;
  readiness: number;
  roleTitle: string | null;
}

export default function ShortlistPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<ShortlistRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!user) return;
    const shortlists = getShortlists(user.id);
    const loaded: ShortlistRow[] = shortlists
      .map((s) => {
        const detail = getCandidateDetail(s.student_id);
        if (!detail) return null;
        return {
          shortlist: s,
          name: detail.profile.name,
          headline: detail.profile.headline,
          college: detail.profile.college,
          readiness: detail.summary.readiness,
          roleTitle: getRole(detail.profile.target_role_id)?.title ?? null,
        };
      })
      .filter((r): r is ShortlistRow => r !== null);
    setRows(loaded);
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(load, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleRemove = (studentId: string, name: string) => {
    if (!user) return;
    toggleShortlist(user.id, studentId, null);
    toast.success(`${name} removed from shortlist`);
    load();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shortlist</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Candidates you have shortlisted, with the evidence that got them there.
        </p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Star className="h-5 w-5" />}
          title="Your shortlist is empty"
          description="Search candidates and use the star button to shortlist promising profiles."
          action={{ label: "Find candidates", href: "/recruiter" }}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((row) => (
            <Card key={row.shortlist.id}>
              <CardContent className="flex flex-wrap items-center gap-4 pt-6">
                <Avatar name={row.name} />
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/recruiter/candidates/${row.shortlist.student_id}`}
                    className="text-sm font-semibold hover:text-primary hover:underline"
                  >
                    {row.name}
                  </Link>
                  <p className="truncate text-xs text-muted-foreground">{row.headline}</p>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {row.roleTitle && <Badge variant="secondary">Target: {row.roleTitle}</Badge>}
                    <Badge variant={row.readiness >= 70 ? "success" : row.readiness >= 50 ? "warning" : "destructive"}>
                      {row.readiness}% ready
                    </Badge>
                    <Badge variant="muted">Added {formatDate(row.shortlist.created_at)}</Badge>
                  </div>
                  {row.shortlist.note && (
                    <p className="mt-1.5 text-xs italic text-slate-600">“{row.shortlist.note}”</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link href={`/recruiter/candidates/${row.shortlist.student_id}`}>
                    <Button variant="outline" size="sm">
                      View evidence <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Remove ${row.name} from shortlist`}
                    onClick={() => handleRemove(row.shortlist.student_id, row.name)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
