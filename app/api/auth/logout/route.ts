import { NextResponse } from "next/server"
import type { ApiResponse } from "@/types/api"

export async function POST(): Promise<NextResponse<ApiResponse>> {
  try {
    // No need to clear cookies anymore
    return NextResponse.json({
      success: true,
      message: "Logged out successfully",
    })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Logout failed",
      },
      { status: 500 },
    )
  }
}

