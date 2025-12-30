import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;

    if (!token) {
      return NextResponse.redirect(new URL("/auth/login", req.url));
    }

    // Check specific route permissions
    const pathname = req.nextUrl.pathname;

    // Only admin users can access compose functionality
    if (pathname.startsWith("/compose") && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // All authenticated users can access dashboard and inbox
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        // If token exists, user is authenticated
        return !!token;
      },
    },
    pages: {
      signIn: "/auth/login",
    },
  }
);

// Define which routes need authentication
export const config = {
  matcher: ["/dashboard/:path*", "/inbox/:path*", "/compose/:path*"],
};