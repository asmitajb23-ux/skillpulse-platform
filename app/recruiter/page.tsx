"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Award,
  Bot,
  FolderKanban,
  GitCompareArrows,
  GraduationCap,
  Search,
  Star,
  UserRoundSearch,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth-context";
import { searchCandidates, toggleShortlist, type CandidateSummary } from "@/services/recruiter";
import { jobRoles, skills as allSkills } from "@/data/demo";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";

export default function RecruiterSearchPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [roleId, setRoleId] = useState("");
  const [minReadiness, setMinReadiness] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(t);
  }, []);

  const candidates = useMemo(
    () => searchCandidates({ query, skillIds: selectedSkills, roleId: roleId || undefined, minReadiness }),
    [query, selectedSkills, roleId, minReadiness]
  );

  const handleShortlist = (candidate: CandidateSummary) => {
    if (!user) return;
    const result = toggleShortlist(user.id, candidate.id, candidate.target_role_title ? jobRoles.find((r) => r.title === candidate.target_role_title)?.id ?? null : null);
    setShortlistedIds(new Set(result.shortlists.map((s) => s.student_id)));
    toast.success(result.shortlisted ? `${candidate.name} added to shortlist` : `${candidate.name} removed from shortlist`);
  };

  const toggleCompare = (id: string) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length >= 3 ? (toast.error("You can compare up to 3 candidates"), prev) : [...prev, id]
    );
  };

  const hasFilters = query || selectedSkills.length > 0 || roleId || minReadiness > 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Find Candidates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Search verified student talent by skill, target role and evidence-backed readiness.
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-9"
                placeholder="Search by name, skill, college or role…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <Select value={roleId} onChange={(e) => setRoleId(e.target.value)} aria-label="Filter by target role">
              <option value="">All target roles</option>
              {jobRoles.map((r) => (
                <option key={r.id} value={r.id}>{r.title}</option>
              ))}
            </Select>
            <Select
              value={String(minReadiness)}
              onChange={(e) => setMinReadiness(Number(e.target.value))}
              aria-label="Minimum readiness"
            >
              <option value="0">Any readiness</option>
              <option value="40">40%+ ready</option>
              <option value="60">60%+ ready</option>
              <option value="70">70%+ ready (placement ready)</option>
              <option value="85">85%+ ready</option>
            </Select>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">Skills:</span>
            {selectedSkills.map((id) => (
              <button key={id} onClick={() => setSelectedSkills((prev) => prev.filter((s) => s !== id))}>
                <Badge variant="default" className="cursor-pointer">
                  {allSkills.find((s) => s.id === id)?.name} <X className="h-3 w-3" />
                </Badge>
              </button>
            ))}
            <Select
              className="h-8 w-auto py-0 text-xs"
              value=""
              onChange={(e) => {
                if (e.target.value && !selectedSkills.includes(e.target.value)) {
                  setSelectedSkills((prev) => [...prev, e.target.value]);
                }
              }}
              aria-label="Add skill filter"
            >
              <option value="">+ Add skill filter</option>
              {allSkills.map((s) => (
                <option key={s.id} value={s.id} disabled={selectedSkills.includes(s.id)}>
                  {s.name}
                </option>
              ))}
            </Select>
            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setQuery("");
                  setSelectedSkills([]);
                  setRoleId("");
                  setMinReadiness(0);
                }}
              >
                <X className="h-3.5 w-3.5" /> Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Compare bar */}
      {compareIds.length > 0 && (
        <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-xl border border-primary/30 bg-white px-5 py-3 shadow-lg">
          <p className="text-sm font-medium">
            {compareIds.length} candidate{compareIds.length > 1 ? "s" : ""} selected for comparison
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setCompareIds([])}>Clear</Button>
            <Button
              size="sm"
              disabled={compareIds.length < 2}
              onClick={() => router.push(`/recruiter/compare?ids=${compareIds.join(",")}`)}
            >
              <GitCompareArrows className="h-3.5 w-3.5" /> Compare now
            </Button>
          </div>
        </div>
      )}

      {/* Results */}
      <div>
        <p className="mb-3 text-sm text-muted-foreground">
          {loading ? "Searching…" : `${candidates.length} candidate${candidates.length === 1 ? "" : "s"} found`}
        </p>
        {loading ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        ) : candidates.length === 0 ? (
          <EmptyState
            icon={<UserRoundSearch className="h-5 w-5" />}
            title="No candidates match your filters"
            description="Try broadening the skill filters or lowering the minimum readiness."
            action={hasFilters ? { label: "Clear filters", onClick: () => { setQuery(""); setSelectedSkills([]); setRoleId(""); setMinReadiness(0); } } : undefined}
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {candidates.map((c) => (
              <Card key={c.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col pt-6">
                  <div className="flex items-start gap-3">
                    <Avatar name={c.name} />
                    <div className="min-w-0 flex-1">
                      <Link href={`/recruiter/candidates/${c.id}`} className="text-sm font-semibold hover:text-primary hover:underline">
                        {c.name}
                      </Link>
                      <p className="truncate text-xs text-muted-foreground">{c.headline}</p>
                      <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                        <GraduationCap className="h-3 w-3" /> {c.course} · {c.graduation_year}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          "text-xl font-bold",
                          c.readiness >= 70 ? "text-emerald-600" : c.readiness >= 50 ? "text-amber-600" : "text-rose-600"
                        )}
                      >
                        {c.readiness}%
                      </p>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">ready</p>
                    </div>
                  </div>

                  {c.target_role_title && (
                    <div className="mt-3">
                      <Badge variant="secondary">Target: {c.target_role_title}</Badge>
                    </div>
                  )}

                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {c.top_skills.map((s) => (
                      <Badge key={s.name} variant={s.status === "verified" ? "success" : s.status === "pending" ? "warning" : "muted"}>
                        {s.name} · {s.verification_score}
                      </Badge>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-4 gap-2 border-t pt-3 text-center">
                    <div>
                      <FolderKanban className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                      <p className="mt-0.5 text-xs font-semibold">{c.verified_project_count}/{c.project_count}</p>
                      <p className="text-[10px] text-muted-foreground">projects</p>
                    </div>
                    <div>
                      <Award className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                      <p className="mt-0.5 text-xs font-semibold">{c.certificate_count}</p>
                      <p className="text-[10px] text-muted-foreground">certs</p>
                    </div>
                    <div>
                      <Bot className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                      <p className="mt-0.5 text-xs font-semibold">{c.avg_viva_score !== null ? `${c.avg_viva_score}%` : "—"}</p>
                      <p className="text-[10px] text-muted-foreground">viva</p>
                    </div>
                    <div>
                      <Star className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                      <p className="mt-0.5 text-xs font-semibold">{c.verified_skill_count}</p>
                      <p className="text-[10px] text-muted-foreground">verified</p>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link href={`/recruiter/candidates/${c.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">View profile</Button>
                    </Link>
                    <Button
                      variant={shortlistedIds.has(c.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => handleShortlist(c)}
                      aria-label={`Shortlist ${c.name}`}
                    >
                      <Star className={cn("h-3.5 w-3.5", shortlistedIds.has(c.id) && "fill-current")} />
                    </Button>
                    <Button
                      variant={compareIds.includes(c.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleCompare(c.id)}
                      aria-label={`Compare ${c.name}`}
                    >
                      <GitCompareArrows className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
