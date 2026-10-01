"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Search, Users } from "lucide-react";
import { listStudentRows, type StudentRow } from "@/services/admin";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/state-views";

export default function AdminStudentsPage() {
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<StudentRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setRows(listStudentRows(query));
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Student Management</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Search students and inspect their profiles, skill gaps, assessments and portfolios.
          </p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, email or role…"
            value={query}
            onChange={(e) => {
              setLoading(true);
              setQuery(e.target.value);
            }}
          />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Users className="h-5 w-5" />}
          title="No students found"
          description={query ? `No students match "${query}".` : "No students are enrolled yet."}
        />
      ) : (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead className="hidden md:table-cell">Target role</TableHead>
                  <TableHead>Readiness</TableHead>
                  <TableHead className="hidden lg:table-cell">Verified skills</TableHead>
                  <TableHead className="hidden lg:table-cell">Profile</TableHead>
                  <TableHead className="hidden sm:table-cell">Activity</TableHead>
                  <TableHead className="text-right">View</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={row.name} size="sm" />
                        <div>
                          <p className="text-sm font-medium">{row.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {row.course} · {row.graduation_year}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {row.target_role_title ? (
                        <Badge variant="secondary">{row.target_role_title}</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">Not set</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold tabular-nums">{row.readiness}%</span>
                        <Progress
                          value={row.readiness}
                          className="hidden h-1.5 w-20 sm:block"
                          indicatorClassName={
                            row.readiness >= 70 ? "bg-emerald-500" : row.readiness >= 50 ? "bg-amber-500" : "bg-rose-500"
                          }
                        />
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm">
                      {row.verified_skills}/{row.total_skills}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className="text-sm tabular-nums">{row.profile_completion}%</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <Badge variant={row.active ? "success" : "muted"}>
                        {row.active ? `${row.assessments} tests · ${row.projects} projects` : "inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/students/${row.id}`}>
                        <Button variant="ghost" size="sm">
                          Open <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
