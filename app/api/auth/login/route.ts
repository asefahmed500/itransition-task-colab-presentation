import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import type { LoginRequest, AuthResponse } from "@/types/api"

export async function POST(req: NextRequest): Promise<NextResponse<AuthResponse>> {
  try {
    await connectToDatabase()

    const data = (await req.json()) as LoginRequest
    const { userId, nickname } = data

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      )
    }

    console.log("Login attempt for user:", userId, nickname)

    // Check if user exists
    let user = await User.findOne({ userId })

    if (!user) {
      // Create new user if not exists
      user = new User({
        userId,
        name: nickname || "Anonymous User",
      })
      await user.save()
      console.log("Created new user:", userId)
    } else if (nickname && nickname !== user.name) {
      // Update name if provided and different
      user.name = nickname
      await user.save()
      console.log("Updated user name:", userId, nickname)
    }

    console.log("User logged in successfully:", userId)

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        userId: user.userId,
        name: user.name,
      },
    })
  } catch (error) {
    console.error("Error during login:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Authentication failed: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

