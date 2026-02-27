import { NextResponse, type NextRequest } from "next/server";

function isPrivilegedRole(role: string | undefined) {
  return (
    role === "admin" ||
    role === "superAdmin" ||
    role === "instructor" ||
    role === "student"
  );
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const role = request.cookies.get("pms_role")?.value;
  const privileged = isPrivilegedRole(role);

  if (pathname.startsWith("/dashboard")) {
    if (!privileged) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }

    if (
      (pathname.startsWith("/dashboard/super-admin") ||
        pathname.startsWith("/dashboard/admin/admins")) &&
      role !== "superAdmin"
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/forbidden";
      return NextResponse.redirect(url);
    }

    if (
      pathname.startsWith("/dashboard/admin") &&
      (role === "instructor" || role === "student")
    ) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/forbidden";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/dashboard/instructor") && role !== "instructor") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/forbidden";
      return NextResponse.redirect(url);
    }

    if (pathname.startsWith("/dashboard/student") && role !== "student") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard/forbidden";
      return NextResponse.redirect(url);
    }
  }

  if (pathname === "/login" && privileged) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/login", "/dashboard/:path*"]
};
