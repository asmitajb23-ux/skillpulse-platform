import { NextResponse, type NextRequest } from "next/server";
import { getSessionFromCookie, SESSION_COOKIE } from "@/services/auth";
import type { Role } from "@/types";

const ROLE_PREFIXES: { prefix: string; role: Role }[] = [
  { prefix: "/student", role: "student" },
  { prefix: "/recruiter", role: "recruiter" },
  { prefix: "/admin", role: "college_admin" },
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const guard = ROLE_PREFIXES.find((g) => pathname === g.prefix || pathname.startsWith(g.prefix + "/"));
  if (!guard) return NextResponse.next();

  const cookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = cookie ? getSessionFromCookie(`${SESSION_COOKIE}=${cookie}`) : null;

  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (session.role !== guard.role) {
    const home = session.role === "student" ? "/student" : session.role === "recruiter" ? "/recruiter" : "/admin";
    const url = request.nextUrl.clone();
    url.pathname = home;
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/student/:path*", "/recruiter/:path*", "/admin/:path*"],
};
