import { type NextRequest, NextResponse } from "next/server"
import type { UserResponse } from "@/types/api"

export async function GET(req: NextRequest): Promise<NextResponse<UserResponse>> {
  try {
    // Instead of using cookies, we'll just return a success response
    // The actual user authentication is handled client-side with localStorage
    return NextResponse.json({
      success: true,
      user: {
        id: "local-user",
        userId: "local-user-id",
        name: "Local User",
        role: "user",
      },
    })
  } catch (error) {
    console.error("Error in /api/auth/me:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Authentication error: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

