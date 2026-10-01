"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { GitCompareArrows, Info } from "lucide-react";
import { getComparisonCandidates, searchCandidates } from "@/services/recruiter";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/state-views";
import { cn } from "@/lib/utils";

function bestValue(values: number[]): boolean[] {
  const max = Math.max(...values);
  return values.map((v) => v === max && values.filter((x) => x === max).length === 1);
}

function CompareContent() {
  const searchParams = useSearchParams();
  const ids = useMemo(
    () => (searchParams.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3),
    [searchParams]
  );
  const [pickerIds, setPickerIds] = useState<string[]>([]);

  const allCandidates = useMemo(() => searchCandidates({}), []);
  const effectiveIds = ids.length >= 2 ? ids : pickerIds;
  const comparison = useMemo(() => getComparisonCandidates(effectiveIds), [effectiveIds]);

  if (effectiveIds.length < 2) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Compare Candidates</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Select 2 or 3 candidates to compare their evidence side by side.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Select candidates</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {allCandidates.map((c) => {
              const selected = pickerIds.includes(c.id);
              return (
                <button
                  key={c.id}
                  disabled={!selected && pickerIds.length >= 3}
                  onClick={() =>
                    setPickerIds((prev) =>
                      selected ? prev.filter((x) => x !== c.id) : [...prev, c.id]
                    )
                  }
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-3.5 text-left transition-colors disabled:opacity-40",
                    selected ? "border-primary bg-indigo-50/60 ring-1 ring-primary" : "hover:border-primary/40"
                  )}
                >
                  <Avatar name={c.name} size="sm" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{c.name}</p>
                    <p className="text-xs text-muted-foreground">{c.readiness}% ready</p>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          <Link href="/recruiter">
            <Button variant="outline">Back to search</Button>
          </Link>
          <Link href={`/recruiter/compare?ids=${pickerIds.join(",")}`}>
            <Button disabled={pickerIds.length < 2}>
              <GitCompareArrows className="h-4 w-4" /> Compare {pickerIds.length} candidates
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  if (comparison.length === 0) {
    return (
      <EmptyState
        title="No candidates to compare"
        description="The selected candidates could not be loaded."
        action={{ label: "Back to search", href: "/recruiter" }}
      />
    );
  }

  const allSkillNames = Array.from(
    new Set(comparison.flatMap((c) => c.bundle!.proofChain.map((p) => p.skill_name)))
  );

  const readinessValues = comparison.map((c) => c.summary.readiness);
  const bestReadiness = bestValue(readinessValues);
  const vivaValues = comparison.map((c) =>
    c.bundle!.vivas.length
      ? Math.round(c.bundle!.vivas.reduce((s, v) => s + v.score, 0) / c.bundle!.vivas.length)
      : 0
  );
  const bestViva = bestValue(vivaValues);
  const assessValues = comparison.map((c) =>
    c.bundle!.attempts.length
      ? Math.round(c.bundle!.attempts.reduce((s, a) => s + a.percentage, 0) / c.bundle!.attempts.length)
      : 0
  );
  const bestAssess = bestValue(assessValues);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Candidate Comparison</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Evidence-based comparison — numbers always trace back to a source.
          </p>
        </div>
        <Link href={`/recruiter/compare`}>
          <Button variant="outline" size="sm">Change selection</Button>
        </Link>
      </div>

      <Card className="border-indigo-100 bg-indigo-50/40">
        <CardContent className="flex items-start gap-3 pt-6">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <p className="text-sm leading-relaxed text-slate-600">
            SkillPulse does not produce arbitrary rankings. Differences below reflect verifiable
            evidence — inspect each candidate&apos;s proof chain before deciding.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-44">Metric</TableHead>
                {comparison.map((c) => (
                  <TableHead key={c.summary.id}>
                    <div className="flex items-center gap-2.5">
                      <Avatar name={c.summary.name} size="sm" />
                      <div>
                        <Link
                          href={`/recruiter/candidates/${c.summary.id}`}
                          className="text-sm font-semibold text-foreground hover:text-primary"
                        >
                          {c.summary.name}
                        </Link>
                        <p className="text-xs font-normal text-muted-foreground">
                          {c.summary.target_role_title ?? "No target role"}
                        </p>
                      </div>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Readiness</TableCell>
                {comparison.map((c, i) => (
                  <TableCell key={c.summary.id}>
                    <span className={cn("text-sm font-bold", bestReadiness[i] && "text-emerald-600")}>
                      {c.summary.readiness}%
                    </span>
                    {bestReadiness[i] && <Badge variant="success" className="ml-2">highest</Badge>}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Verified skills</TableCell>
                {comparison.map((c) => (
                  <TableCell key={c.summary.id}>{c.summary.verified_skill_count} of {c.bundle!.proofChain.length}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Avg assessment score</TableCell>
                {comparison.map((c, i) => (
                  <TableCell key={c.summary.id}>
                    {assessValues[i] > 0 ? (
                      <span className={cn(bestAssess[i] && "font-semibold text-emerald-600")}>{assessValues[i]}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Projects (verified)</TableCell>
                {comparison.map((c) => (
                  <TableCell key={c.summary.id}>
                    {c.summary.verified_project_count} / {c.summary.project_count}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Certificates</TableCell>
                {comparison.map((c) => (
                  <TableCell key={c.summary.id}>{c.summary.certificate_count}</TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Avg AI viva score</TableCell>
                {comparison.map((c, i) => (
                  <TableCell key={c.summary.id}>
                    {vivaValues[i] > 0 ? (
                      <span className={cn(bestViva[i] && "font-semibold text-emerald-600")}>{vivaValues[i]}%</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                ))}
              </TableRow>
              {allSkillNames.map((skillName) => {
                const scores = comparison.map(
                  (c) => c.bundle!.proofChain.find((p) => p.skill_name === skillName)?.verification_score ?? null
                );
                const best = bestValue(scores.map((s) => s ?? -1));
                return (
                  <TableRow key={skillName}>
                    <TableCell className="font-medium">
                      <span className="text-xs uppercase tracking-wide text-muted-foreground">Skill:</span>{" "}
                      {skillName}
                    </TableCell>
                    {scores.map((score, i) => (
                      <TableCell key={comparison[i].summary.id}>
                        {score === null ? (
                          <span className="text-muted-foreground">not claimed</span>
                        ) : (
                          <span className={cn("text-sm tabular-nums", best[i] && score >= 0 && "font-bold text-emerald-600")}>
                            {score}/100
                          </span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
              <TableRow>
                <TableCell />
                {comparison.map((c) => (
                  <TableCell key={c.summary.id}>
                    <Link href={`/recruiter/candidates/${c.summary.id}`}>
                      <Button variant="outline" size="sm">View evidence</Button>
                    </Link>
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-center text-sm text-muted-foreground">Loading comparison…</div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
