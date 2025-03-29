import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import { isValidObjectId } from "mongoose"
import type { AddSlideRequest, AddSlideResponse } from "@/types/api"

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<AddSlideResponse>> {
  try {
    await connectToDatabase()

    const id = params.id
    const data = (await req.json()) as AddSlideRequest
    const { content, notes, template, userId } = data

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "User ID is required",
        },
        { status: 400 },
      )
    }

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

    // Check if user has permission to add slides
    const collaborator = presentation.collaborators.find((c: { userId: string; role: string }) => c.userId === userId)

    if (!collaborator || (collaborator.role !== "creator" && collaborator.role !== "editor")) {
      return NextResponse.json(
        {
          success: false,
          error: "You don't have permission to add slides",
        },
        { status: 403 },
      )
    }

    // Add new slide
    const newSlide = {
      content: content || template || "# New Slide\n\nClick to edit",
      notes: notes || "",
      drawings: [],
    }

    // Use findOneAndUpdate to avoid version conflicts
    const result = await Presentation.findOneAndUpdate(
      { _id: id },
      {
        $push: { slides: newSlide },
        $set: { lastEditedBy: userId },
      },
      { new: true },
    )

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to add slide",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      slideIndex: result.slides.length - 1,
      slide: result.slides[result.slides.length - 1],
    })
  } catch (error) {
    console.error("Error adding slide:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add slide: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

