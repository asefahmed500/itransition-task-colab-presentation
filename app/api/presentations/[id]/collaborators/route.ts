import { type NextRequest, NextResponse } from "next/server"
import { connectToDatabase } from "@/lib/mongodb"
import { Presentation } from "@/models/presentation"
import { isValidObjectId } from "mongoose"
import type { AddCollaboratorRequest, AddCollaboratorResponse } from "@/types/api"

// Fix the POST handler to properly handle params
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<AddCollaboratorResponse>> {
  try {
    await connectToDatabase()

    const id = params.id
    const data = (await req.json()) as AddCollaboratorRequest
    const { userId, nickname, role, invitedBy } = data

    if (!userId || !nickname || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId, nickname, and role are required",
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

    // Check if inviter has permission to add collaborators
    // If invitedBy is provided, check permissions
    if (invitedBy) {
      const inviter = presentation.collaborators.find((c: { userId: string; role: string }) => c.userId === invitedBy)
      if (!inviter || (inviter.role !== "creator" && inviter.role !== "editor")) {
        return NextResponse.json(
          {
            success: false,
            error: "You don't have permission to add collaborators",
          },
          { status: 403 },
        )
      }
    }

    // Check if user is already a collaborator
    const existingCollaborator: { userId: string; role: string; nickname: string } | undefined = presentation.collaborators.find(
      (c: { userId: string; role: string; nickname: string }) => c.userId === userId
    )

    // Use findOneAndUpdate to avoid version conflicts
    let updateOperation

    if (existingCollaborator) {
      // Update existing collaborator
      updateOperation = {
        $set: {
          [`collaborators.$[elem].role`]: role,
          [`collaborators.$[elem].nickname`]: nickname,
          [`collaborators.$[elem].lastEdited`]: new Date(),
        },
      }
    } else {
      // Add new collaborator
      updateOperation = {
        $push: {
          collaborators: {
            userId,
            nickname,
            role,
            lastEdited: new Date(),
          },
        },
      }
    }

    const result = await Presentation.findOneAndUpdate({ _id: id }, updateOperation, {
      new: true,
      arrayFilters: existingCollaborator ? [{ "elem.userId": userId }] : undefined,
    })

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update collaborators",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      collaborators: result.collaborators,
    })
  } catch (error) {
    console.error("Error adding collaborator:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add collaborator: " + (error instanceof Error ? error.message : String(error)),
      },
      { status: 500 },
    )
  }
}

// Fix the PUT handler to properly handle params
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse<AddCollaboratorResponse>> {
  try {
    await connectToDatabase()

    const id = params.id
    const data = await req.json()
    const { userId, role, updatedBy } = data

    if (!userId || !role) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: userId and role are required",
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

    // Check if updater has permission to change roles
    // If updatedBy is provided, check permissions
    if (updatedBy) {
      const updater = presentation.collaborators.find((c: { userId: string; role: string }) => c.userId === updatedBy)
      if (!updater || updater.role !== "creator") {
        return NextResponse.json(
          {
            success: false,
            error: "You don't have permission to change roles",
          },
          { status: 403 },
        )
      }
    }

    // Find collaborator to update
    const collaborator = presentation.collaborators.find((c: { userId: string; role: string; nickname: string }) => c.userId === userId)

    if (!collaborator) {
      return NextResponse.json(
        {
          success: false,
          error: "Collaborator not found",
        },
        { status: 404 },
      )
    }

    // Use findOneAndUpdate to avoid version conflicts
    const result = await Presentation.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          [`collaborators.$[elem].role`]: role,
        },
      },
      {
        new: true,
        arrayFilters: [{ "elem.userId": userId }],
      },
    )

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to update collaborator",
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      collaborators: result.collaborators,
    })
  } catch (error) {
    console.error("Error updating collaborator:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update collaborator",
      },
      { status: 500 },
    )
  }
}

