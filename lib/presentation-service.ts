import type { Presentation } from "@/types/presentation"

interface CreatePresentationParams {
  title: string
  description?: string
}

interface CreatePresentationResult {
  success: boolean
  presentationId?: string
  error?: string
}

// Update the createPresentation function to handle duplicate errors and return proper types
export async function createPresentation(data: CreatePresentationParams): Promise<CreatePresentationResult> {
  try {
    // Get user ID from localStorage
    const userId = localStorage.getItem("userId")
    const userName = localStorage.getItem("userName")

    if (!userId || !userName) {
      throw new Error("User not authenticated")
    }

    const response = await fetch("/api/presentations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: data.title,
        description: data.description,
        creatorId: userId,
        creatorName: userName,
      }),
    })

    const result = await response.json()

    if (!result.success) {
      throw new Error(result.error || "Failed to create presentation")
    }

    return {
      success: true,
      presentationId: result.presentationId,
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message,
      }
    }
    return {
      success: false,
      error: "An unknown error occurred",
    }
  }
}

interface GetPresentationParams {
  id: string
  userId: string
}

export async function getPresentation(params: GetPresentationParams): Promise<Presentation | null> {
  try {
    const response = await fetch(`/api/presentations/${params.id}`)
    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Failed to fetch presentation")
    }

    return data.presentation
  } catch (error) {
    console.error("Error fetching presentation:", error)
    return null
  }
}

interface UpdatePresentationParams {
  id: string
  userId: string
  title?: string
  description?: string
}

export async function updatePresentation(params: UpdatePresentationParams): Promise<boolean> {
  try {
    const response = await fetch(`/api/presentations/${params.id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: params.title,
        description: params.description,
        userId: params.userId,
      }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error updating presentation:", error)
    return false
  }
}

interface SharePresentationParams {
  id: string
  email: string
  role: string
  invitedBy: string
}

export async function sharePresentation(params: SharePresentationParams): Promise<boolean> {
  try {
    const response = await fetch(`/api/presentations/${params.id}/collaborators`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: Math.random().toString(36).substring(2, 9), // Generate random ID for demo
        name: params.email.split("@")[0],
        role: params.role,
        invitedBy: params.invitedBy,
      }),
    })

    const data = await response.json()
    return data.success
  } catch (error) {
    console.error("Error sharing presentation:", error)
    return false
  }
}

