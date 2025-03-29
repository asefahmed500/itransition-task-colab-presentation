import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import { generateSecureAccessCode } from "@/lib/utils"
import type { ApiResponse, CreatePresentationRequest, CreatePresentationResponse } from "@/types/api"

// POST handler for creating presentations
export async function POST(req: NextRequest): Promise<NextResponse<CreatePresentationResponse>> {
  try {
    // Connect to MongoDB
    await connectToDatabase()

    const data = (await req.json()) as CreatePresentationRequest
    const { title, description, creatorId, creatorNickname } = data

    if (!title || !creatorId || !creatorNickname) {
      return NextResponse.json(
        {
          success: false,
          error: "Title, creator ID, and nickname are required",
        },
        { status: 400 },
      )
    }

    // Generate a unique access code with retry logic
    let accessCode = ""
    let isUnique = false
    let attempts = 0
    const maxAttempts = 10

    while (!isUnique && attempts < maxAttempts) {
      // Generate a new code with each attempt
      accessCode = generateSecureAccessCode(6)

      // Check if this code already exists in either field
      const existingPresentation = await Presentation.findOne({
        $or: [{ accessCode: accessCode }, { code: accessCode }],
      })

      if (!existingPresentation) {
        isUnique = true
      } else {
        attempts++
      }
    }

    if (!isUnique) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to generate a unique access code after multiple attempts. Please try again.",
        },
        { status: 500 },
      )
    }

    // Create a new presentation with the verified unique access code
    const presentation = new Presentation({
      title: title,
      description: description || "",
      slides: [
        {
          content: "# New Presentation\n\n## Click to edit\n\nUse markdown to format your content",
          notes: "",
          drawings: [],
        },
      ],
      collaborators: [
        {
          userId: creatorId,
          nickname: creatorNickname,
          role: "creator",
          lastEdited: new Date(),
        },
      ],
      accessCode: accessCode, // Use the pre-verified unique code
      code: accessCode, // Set both fields to the same value
      lastEditedBy: creatorId,
    })

    // Save the presentation
    await presentation.save()

    console.log("Presentation created successfully:", presentation._id.toString(), "with access code:", accessCode)

    return NextResponse.json({
      success: true,
      presentationId: presentation._id.toString(),
      accessCode: presentation.accessCode,
    })
  } catch (error) {
    console.error("Error creating presentation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create presentation: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  try {
    await connectToDatabase()

    const url = new URL(req.url)
    const userId = url.searchParams.get("userId")

    console.log("Fetching presentations for userId:", userId || "all users")

    // Get all presentations
    const presentations = await Presentation.find().sort({ updatedAt: -1 })

    console.log(`Found ${presentations.length} presentations`)

    // Format the presentations for the response
    const formattedPresentations = presentations.map((p) => {
      // Find the creator
      const creator = p.collaborators.find((c: { role: string }) => c.role === "creator")

      // Find the last editor
      const lastEditor = p.lastEditedBy ? p.collaborators.find((c: { userId: string }) => c.userId === p.lastEditedBy) : creator

      // Determine user's role in this presentation
      const userRole = userId ? p.collaborators.find((c: { userId: string; role: string }) => c.userId === userId)?.role : undefined

      return {
        id: p._id.toString(),
        title: p.title,
        description: p.description,
        updatedAt: p.updatedAt,
        createdAt: p.createdAt,
        slideCount: p.slides.length,
        collaboratorCount: p.collaborators.length,
        accessCode: p.accessCode || p.code, // Use either field
        creator: creator ? creator.nickname : "Unknown",
        lastEditedBy: lastEditor ? lastEditor.nickname : "Unknown",
        lastEditedTime: p.updatedAt,
        role: userRole,
      }
    })

    return NextResponse.json({
      success: true,
      presentations: formattedPresentations,
    })
  } catch (error) {
    console.error("Error fetching presentations:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch presentations: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

