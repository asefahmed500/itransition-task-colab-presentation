import { NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"

// This endpoint returns all presentations in the database
export async function GET(): Promise<NextResponse> {
  try {
    await connectToDatabase()

    // Get all presentations
    const presentations = await Presentation.find().sort({ updatedAt: -1 })

    // Format the presentations for the response
    const formattedPresentations = presentations.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      description: p.description,
      accessCode: p.accessCode,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      slideCount: p.slides.length,
      collaboratorCount: p.collaborators.length,
      collaborators: p.collaborators.map((c) => ({
        userId: c.userId,
        nickname: c.nickname,
        role: c.role,
        lastEdited: c.lastEdited,
      })),
    }))

    return NextResponse.json({
      success: true,
      count: presentations.length,
      presentations: formattedPresentations,
    })
  } catch (error) {
    console.error("Error fetching all presentations:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch presentations: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

