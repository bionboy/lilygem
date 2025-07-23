import { auth } from "@/lib/auth";
import { NextAuthRequest } from "next-auth";
import { NextResponse } from "next/server";

const unprotectedRoutes = ["/login", "/"];

export default auth((request: NextAuthRequest) => {
  const { nextUrl } = request;
  const isLoggedIn = !!request.auth;

  // Redirect logged-out users to login page
  if (!isLoggedIn && !unprotectedRoutes.includes(nextUrl.pathname)) {
    const newUrl = new URL("/login", nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // Redirect logged-in users away from login page to dashboard
  if (isLoggedIn && nextUrl.pathname === "/login") {
    const newUrl = new URL("/dashboard", nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  // TODO (@bionboy, 25-07-23): reject all other requests that are not logged-in or authenticated (like to the api endpoints and etc.)
});

export const config = { matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"] };
