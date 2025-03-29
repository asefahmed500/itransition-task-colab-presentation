import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import { isValidObjectId } from "mongoose"
import type { GetPresentationResponse, UpdatePresentationRequest, UpdatePresentationResponse } from "@/types/api"

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<GetPresentationResponse>> {
  try {
    await connectToDatabase()

    const id = params.id
    console.log("Fetching presentation with ID:", id)

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid presentation ID",
        },
        { status: 400 },
      )
    }

    const presentation = await Presentation.findById(id)

    if (!presentation) {
      console.log("Presentation not found with ID:", id)
      return NextResponse.json(
        {
          success: false,
          error: "Presentation not found",
        },
        { status: 404 },
      )
    }

    console.log("Successfully fetched presentation:", id)

    return NextResponse.json({
      success: true,
      presentation: {
        id: presentation._id.toString(),
        title: presentation.title,
        description: presentation.description,
        slides: presentation.slides,
        collaborators: presentation.collaborators,
        accessCode: presentation.accessCode,
        lastEditedBy: presentation.lastEditedBy,
        createdAt: presentation.createdAt,
        updatedAt: presentation.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error fetching presentation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch presentation: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<UpdatePresentationResponse>> {
  try {
    await connectToDatabase()

    const id = params.id
    const data = (await req.json()) as UpdatePresentationRequest
    console.log("Updating presentation:", id, data)

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid presentation ID",
        },
        { status: 400 },
      )
    }

    const presentation = await Presentation.findById(id)

    if (!presentation) {
      return NextResponse.json(
        {
          success: false,
          error: "Presentation not found",
        },
        { status: 404 },
      )
    }

    // Check if user has permission to update
    const userId = data.userId
    const collaborator = presentation.collaborators.find((c: { userId: string; role: string }) => c.userId === userId)

    if (!collaborator || (collaborator.role !== "creator" && collaborator.role !== "editor")) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to update this presentation",
        },
        { status: 403 },
      )
    }

    // Prepare update object
    const updateData: any = { lastEditedBy: userId }

    if (data.title !== undefined) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description

    // Use findOneAndUpdate to avoid version conflicts
    const result = await Presentation.findOneAndUpdate({ _id: id }, { $set: updateData }, { new: true })

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update presentation",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      presentation: {
        id: result._id.toString(),
        title: result.title,
        description: result.description,
        updatedAt: result.updatedAt,
      },
    })
  } catch (error) {
    console.error("Error updating presentation:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update presentation: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

