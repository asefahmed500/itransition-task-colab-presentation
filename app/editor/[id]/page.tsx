"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { EditorHeader } from "@/components/editor-header"
import { EditorSidebar } from "@/components/editor-sidebar"
import { EditorCanvas } from "@/components/editor-canvas"
import { EditorToolbar } from "@/components/editor-toolbar"
import { CollaborationPanel } from "@/components/collaboration-panel"
import { usePresentation } from "@/hooks/use-presentation"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"
import { io } from "socket.io-client"

export default function EditorPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { userId, userName } = useUser()
  const presentationId = params.id as string
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [collaborationOpen, setCollaborationOpen] = useState(false)
  const { presentation, loading, error, updatePresentation, addSlide, updateSlide, deleteSlide } = usePresentation(
    presentationId,
    userId,
  )
  const [activeSlideIndex, setActiveSlideIndex] = useState(0)
  const [socket, setSocket] = useState<any>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!userId || !presentationId) return

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      query: {
        presentationId,
        userId,
        userName,
      },
    })

    socketInstance.on("connect", () => {
      console.log("Connected to socket server")
    })

    socketInstance.on("slide-updated", (data) => {
      if (data.userId !== userId) {
        // Update slide if someone else made changes
        updateSlide(data.slideIndex, data.content, false)
      }
    })

    socketInstance.on("presentation-updated", (data) => {
      if (data.userId !== userId) {
        // Update presentation if someone else made changes
        updatePresentation({ title: data.title, description: data.description }, false)
      }
    })

    socketInstance.on("slide-added", (data) => {
      if (data.userId !== userId) {
        // Add slide if someone else added one
        addSlide(data.template, false)
      }
    })

    socketInstance.on("slide-deleted", (data) => {
      if (data.userId !== userId) {
        // Delete slide if someone else deleted one
        deleteSlide(data.slideIndex, false)

        // Adjust active slide index if needed
        if (activeSlideIndex >= data.slideIndex) {
          setActiveSlideIndex(Math.max(0, activeSlideIndex - 1))
        }
      }
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [userId, userName, presentationId, updateSlide, updatePresentation, addSlide, deleteSlide, activeSlideIndex])

  // Handle active slide change
  const handleSlideChange = (index: number) => {
    setActiveSlideIndex(index)
  }

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  // Toggle collaboration panel
  const toggleCollaboration = () => {
    setCollaborationOpen(!collaborationOpen)
  }

  // Handle slide update with socket emission
  const handleUpdateSlide = (content: any) => {
    updateSlide(activeSlideIndex, content)

    if (socket) {
      socket.emit("update-slide", {
        presentationId,
        userId,
        slideIndex: activeSlideIndex,
        content,
      })
    }
  }

  // Handle presentation update with socket emission
  const handleUpdatePresentation = (data: any) => {
    updatePresentation(data)

    if (socket) {
      socket.emit("update-presentation", {
        presentationId,
        userId,
        ...data,
      })
    }
  }

  // Handle add slide with socket emission
  const handleAddSlide = (template?: string) => {
    addSlide(template)

    if (socket) {
      socket.emit("add-slide", {
        presentationId,
        userId,
        template,
      })
    }
  }

  // Handle delete slide with socket emission
  const handleDeleteSlide = (index: number) => {
    deleteSlide(index)

    if (socket) {
      socket.emit("delete-slide", {
        presentationId,
        userId,
        slideIndex: index,
      })
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen flex-col">
        <div className="border-b">
          <Skeleton className="h-14 w-full" />
        </div>
        <div className="flex flex-1">
          <Skeleton className="h-full w-64" />
          <div className="flex flex-1 flex-col">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="m-8 h-[calc(100vh-8rem)] w-[calc(100%-4rem)]" />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error loading presentation</h2>
          <p className="text-muted-foreground">{error}</p>
          <button
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => router.push("/presentations")}
          >
            Go to Presentations
          </button>
        </div>
      </div>
    )
  }

  if (!presentation) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Presentation not found</h2>
          <button
            className="mt-4 rounded-md bg-primary px-4 py-2 text-primary-foreground"
            onClick={() => router.push("/presentations")}
          >
            Go to Presentations
          </button>
        </div>
      </div>
    )
  }

  // Check if user has permission to edit
  const userRole = presentation.collaborators.find((c) => c.userId === userId)?.role
  const canEdit = userRole === "creator" || userRole === "editor"

  if (!canEdit) {
    router.push(`/present/${presentationId}`)
    return null
  }

  return (
    <div className="flex h-screen flex-col">
      <EditorHeader
        presentation={presentation}
        onToggleSidebar={toggleSidebar}
        onToggleCollaboration={toggleCollaboration}
        onUpdatePresentation={handleUpdatePresentation}
      />
      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <EditorSidebar
            slides={presentation.slides}
            activeSlideIndex={activeSlideIndex}
            onSlideChange={handleSlideChange}
            onAddSlide={handleAddSlide}
            onDeleteSlide={handleDeleteSlide}
          />
        )}
        <div className="flex flex-1 flex-col">
          <EditorToolbar onUpdateSlide={handleUpdateSlide} />
          <EditorCanvas slide={presentation.slides[activeSlideIndex]} onUpdateSlide={handleUpdateSlide} />
        </div>
        {collaborationOpen && (
          <CollaborationPanel presentation={presentation} onClose={() => setCollaborationOpen(false)} />
        )}
      </div>
    </div>
  )
}

