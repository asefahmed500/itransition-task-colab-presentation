import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import type { JoinPresentationRequest, JoinPresentationResponse } from "@/types/api"

export async function POST(req: NextRequest): Promise<NextResponse<JoinPresentationResponse>> {
  try {
    await connectToDatabase()

    const data = (await req.json()) as JoinPresentationRequest
    const { accessCode, userId, nickname } = data

    if (!accessCode || !userId || !nickname) {
      return NextResponse.json(
        {
          success: false,
          error: "Access code, user ID, and nickname are required",
        },
        { status: 400 },
      )
    }

    console.log("Joining presentation with access code:", accessCode)

    // Find presentation by access code in either field
    const presentation = await Presentation.findOne({
      $or: [{ accessCode: accessCode }, { code: accessCode }],
    })

    if (!presentation) {
      console.log("No presentation found with access code:", accessCode)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid access code. Please check and try again.",
        },
        { status: 404 },
      )
    }

    console.log("Found presentation:", presentation._id.toString())

    // Check if user is already a collaborator
    const existingCollaborator = presentation.collaborators.find((c: { userId: string; nickname: string; role: string; lastEdited: Date }) => c.userId === userId)

    if (!existingCollaborator) {
      // Add user as a viewer by default
      // Check if this is the first user (creator)
      const isFirstUser = presentation.collaborators.length === 0

      presentation.collaborators.push({
        userId,
        nickname,
        role: isFirstUser ? "creator" : "viewer", // Make first user a creator
        lastEdited: new Date(),
      })

      await presentation.save()
      console.log(`Added new collaborator ${userId} with role: ${isFirstUser ? "creator" : "viewer"}`)
    } else {
      // Update the nickname if it's different
      if (existingCollaborator.nickname !== nickname) {
        existingCollaborator.nickname = nickname
        await presentation.save()
        console.log("Updated existing collaborator nickname:", userId)
      }
    }

    const role = existingCollaborator
      ? existingCollaborator.role
      : presentation.collaborators.length === 1
        ? "creator"
        : "viewer"
    console.log("User role:", role)

    return NextResponse.json({
      success: true,
      presentationId: presentation._id.toString(),
      role: role,
    })
  } catch (error) {
    console.error("Error joining presentation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to join presentation: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

