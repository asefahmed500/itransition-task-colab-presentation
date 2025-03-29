import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import { isValidObjectId } from "mongoose"
import type { UpdateSlideRequest, UpdateSlideResponse, ApiResponse } from "@/types/api"

// Fix the PUT handler to properly handle params
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string; slideIndex: string } },
): Promise<NextResponse<UpdateSlideResponse>> {
  try {
    await connectToDatabase()

    const id = params.id
    const slideIndex = Number.parseInt(params.slideIndex, 10)
    const data = (await req.json()) as UpdateSlideRequest
    const { content, notes, drawings, userId } = data

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      )
    }

    if (!isValidObjectId(id) || isNaN(slideIndex)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
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

    // Check if slide exists
    if (slideIndex < 0 || slideIndex >= presentation.slides.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Slide not found",
        },
        { status: 404 },
      )
    }

    // Check if user has permission to update slides
    const collaborator = presentation.collaborators.find((c: { userId: string; role: string }) => c.userId === userId)

    if (!collaborator || (collaborator.role !== "creator" && collaborator.role !== "editor")) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to update slides",
        },
        { status: 403 },
      )
    }

    // Prepare update object
    const updateData: any = {}

    if (content !== undefined) updateData[`slides.${slideIndex}.content`] = content
    if (notes !== undefined) updateData[`slides.${slideIndex}.notes`] = notes
    if (drawings !== undefined) updateData[`slides.${slideIndex}.drawings`] = drawings

    // Use findOneAndUpdate to avoid version conflicts
    const result = await Presentation.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          ...updateData,
          lastEditedBy: userId,
        },
      },
      { new: true },
    )

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update slide",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      slide: result.slides[slideIndex],
    })
  } catch (error) {
    console.error("Error updating slide:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update slide: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

// Fix the DELETE handler to properly handle params and use findOneAndUpdate to avoid version conflicts
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string; slideIndex: string } },
): Promise<NextResponse<ApiResponse>> {
  try {
    await connectToDatabase()

    const id = params.id
    const slideIndex = Number.parseInt(params.slideIndex, 10)
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

    if (!isValidObjectId(id) || isNaN(slideIndex)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid parameters",
        },
        { status: 400 },
      )
    }

    // First, find the presentation to check permissions and slide count
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

    // Check if slide exists
    if (slideIndex < 0 || slideIndex >= presentation.slides.length) {
      return NextResponse.json(
        {
          success: false,
          error: "Slide not found",
        },
        { status: 404 },
      )
    }

    // Check if user has permission to delete slides
    const collaborator = presentation.collaborators.find((c: { userId: string; role: string }) => c.userId === userId)

    if (!collaborator || (collaborator.role !== "creator" && collaborator.role !== "editor")) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to delete slides",
        },
        { status: 403 },
      )
    }

    // Prevent deleting the last slide
    if (presentation.slides.length <= 1) {
      return NextResponse.json(
        {
          success: false,
          error: "Cannot delete the last slide",
        },
        { status: 400 },
      )
    }

    // Use findOneAndUpdate to avoid version conflicts
    // This atomically updates the document by removing the slide at the specified index
    const result = await Presentation.findOneAndUpdate(
      { _id: id },
      {
        $pull: { slides: { $position: slideIndex } },
        $set: { lastEditedBy: userId },
      },
      { new: true },
    )

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to delete slide",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      slideCount: result.slides.length,
    })
  } catch (error) {
    console.error("Error deleting slide:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete slide: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

