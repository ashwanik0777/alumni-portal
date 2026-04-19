import { NextRequest, NextResponse } from "next/server";

function getRoleRedirect(role: string | undefined) {
  return role === "admin" ? "/admin" : "/user";
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authUser = request.cookies.get("auth_user")?.value;
  const authRole = request.cookies.get("auth_role")?.value;

  const isAuthenticated = authUser === "active" && (authRole === "admin" || authRole === "user");

  const isAdminRoute = pathname.startsWith("/admin");
  const isUserRoute = pathname.startsWith("/user");
  const isLoginRoute = pathname.startsWith("/login");

  if (!isAuthenticated && (isAdminRoute || isUserRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthenticated && isLoginRoute) {
    return NextResponse.redirect(new URL(getRoleRedirect(authRole), request.url));
  }

  if (isAuthenticated && isAdminRoute && authRole !== "admin") {
    return NextResponse.redirect(new URL("/user", request.url));
  }

  if (isAuthenticated && isUserRoute && authRole !== "user") {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/user/:path*", "/login"],
};
