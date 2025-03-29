import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/models/user"
import type { CreateUserRequest, UserResponse } from "@/types/api"

export async function POST(req: NextRequest): Promise<NextResponse<UserResponse>> {
  try {
    await connectToDatabase()

    const data = (await req.json()) as CreateUserRequest
    const { userId, name, email, avatar } = data

    if (!userId || !name) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID and name are required",
        },
        { status: 400 },
      )
    }

    // Check if user exists
    let user = await User.findOne({ userId })

    if (user) {
      // Update existing user
      user.name = name
      if (email) user.email = email
      if (avatar) user.avatar = avatar
      await user.save()
    } else {
      // Create new user
      user = new User({
        userId,
        name,
        email,
        avatar,
      })
      await user.save()
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: "user", // Default role
      },
    })
  } catch (error) {
    console.error("Error creating/updating user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create/update user",
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<UserResponse>> {
  try {
    await connectToDatabase()

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      )
    }

    const user = await User.findOne({ userId })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          error: "User not found",
        },
        { status: 404 },
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id.toString(),
        userId: user.userId,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        role: "user", // Default role
      },
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch user",
      },
      { status: 500 },
    )
  }
}

