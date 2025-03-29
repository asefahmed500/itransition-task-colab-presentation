import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This middleware is simplified to allow access without authentication
export function middleware(req: NextRequest) {
  // Allow all paths - authentication is handled client-side
  return NextResponse.next()
}

export const config = {
  // Specify paths that should trigger this middleware
  matcher: [
    // Add paths that require authentication
    "/dashboard/:path*",
    "/editor/:path*",
    "/present/:path*",
    "/presentations",
    // Exclude public paths
    "/((?!api/health|api/auth|_next/static|_next/image|favicon.ico).*)",
  ],
}

