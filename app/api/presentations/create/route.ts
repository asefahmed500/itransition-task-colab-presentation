import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import { generateSecureAccessCode } from "@/lib/utils"
import type { CreatePresentationRequest, CreatePresentationResponse } from "@/types/api"

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

