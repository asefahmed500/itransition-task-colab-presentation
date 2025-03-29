"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ChevronLeft, ChevronRight, MoreHorizontal, Users, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { usePresentation } from "@/hooks/use-presentation"
import { useUser } from "@/hooks/use-user"
import { SlideRenderer } from "@/components/slide-renderer"
import { PresenterNotes } from "@/components/presenter-notes"
import { ViewersList } from "@/components/viewers-list"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { io } from "socket.io-client"

export default function PresentPage() {
  const params = useParams()
  const router = useRouter()
  const { userId, userName } = useUser()
  const presentationId = params.id as string
  const [currentSlide, setCurrentSlide] = useState(0)
  const [showNotes, setShowNotes] = useState(false)
  const [showViewers, setShowViewers] = useState(false)
  const { presentation, loading, error } = usePresentation(presentationId, userId)
  const [socket, setSocket] = useState<any>(null)
  const [viewers, setViewers] = useState<any[]>([])

  // Initialize socket connection
  useEffect(() => {
    if (!userId || !presentationId) return

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      query: {
        presentationId,
        userId,
        userName,
        mode: "presenter",
      },
    })

    socketInstance.on("connect", () => {
      console.log("Connected to socket server")
    })

    socketInstance.on("viewers-updated", (data) => {
      setViewers(data.viewers)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [userId, userName, presentationId])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " ") {
        goToNextSlide()
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        goToPrevSlide()
      } else if (e.key === "Escape") {
        router.push(`/editor/${presentationId}`)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentSlide, presentation, presentationId, router])

  // Emit slide change to viewers
  useEffect(() => {
    if (socket) {
      socket.emit("slide-change", {
        presentationId,
        currentSlide,
      })
    }
  }, [currentSlide, presentationId, socket])

  const goToNextSlide = () => {
    if (presentation && currentSlide < presentation.slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const goToPrevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const toggleNotes = () => {
    setShowNotes(!showNotes)
  }

  const toggleViewers = () => {
    setShowViewers(!showViewers)
  }

  const exitPresentation = () => {
    router.push(`/editor/${presentationId}`)
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Skeleton className="h-[80vh] w-[80vw] bg-gray-800" />
      </div>
    )
  }

  if (error || !presentation) {
    return (
      <div className="flex h-screen items-center justify-center bg-black text-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Error loading presentation</h2>
          <p>{error}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/presentations")}>
            Return to Presentations
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex h-screen flex-col bg-black">
      {/* Presentation controls */}
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between bg-black/50 p-2 text-white">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={exitPresentation}>
            <X className="h-4 w-4" />
          </Button>
          <span className="text-sm">
            {currentSlide + 1} / {presentation.slides.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleViewers}>
            <Users className="h-4 w-4" />
            {viewers.length > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px]">
                {viewers.length}
              </span>
            )}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={toggleNotes}>{showNotes ? "Hide" : "Show"} presenter notes</DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/present/${presentationId}/view`, "_blank")}>
                Open viewer window
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.open(`/api/presentations/${presentationId}/export`, "_blank")}>
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Main slide area */}
      <div className="flex flex-1 items-center justify-center">
        <div className="relative aspect-video h-auto max-h-[80vh] w-auto max-w-[80vw]">
          <SlideRenderer slide={presentation.slides[currentSlide]} />
        </div>
      </div>

      {/* Navigation controls */}
      <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevSlide}
          disabled={currentSlide === 0}
          className="text-white"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextSlide}
          disabled={currentSlide === presentation.slides.length - 1}
          className="text-white"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Presenter notes panel */}
      {showNotes && (
        <div className="absolute bottom-0 left-0 right-0 bg-black/80 p-4 text-white">
          <PresenterNotes notes={presentation.slides[currentSlide].notes || "No notes for this slide."} />
        </div>
      )}

      {/* Viewers list */}
      {showViewers && (
        <div className="absolute right-0 top-12 w-64 bg-black/80 p-4 text-white">
          <ViewersList viewers={viewers} />
        </div>
      )}
    </div>
  )
}

