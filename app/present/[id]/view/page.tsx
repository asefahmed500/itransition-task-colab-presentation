"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { usePresentation } from "@/hooks/use-presentation"
import { useUser } from "@/hooks/use-user"
import { SlideRenderer } from "@/components/slide-renderer"
import { Skeleton } from "@/components/ui/skeleton"
import { io } from "socket.io-client"

export default function ViewerPage() {
  const params = useParams()
  const { userId, userName } = useUser()
  const presentationId = params.id as string
  const [currentSlide, setCurrentSlide] = useState(0)
  const { presentation, loading, error } = usePresentation(presentationId, userId)
  const [socket, setSocket] = useState<any>(null)

  // Initialize socket connection
  useEffect(() => {
    if (!userId || !presentationId) return

    const socketInstance = io(process.env.NEXT_PUBLIC_SOCKET_URL || "", {
      query: {
        presentationId,
        userId,
        userName,
        mode: "viewer",
      },
    })

    socketInstance.on("connect", () => {
      console.log("Connected to socket server")
    })

    socketInstance.on("slide-changed", (data) => {
      setCurrentSlide(data.currentSlide)
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [userId, userName, presentationId])

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
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen items-center justify-center bg-black">
      <div className="relative aspect-video h-auto max-h-[90vh] w-auto max-w-[90vw]">
        <SlideRenderer slide={presentation.slides[currentSlide]} />
      </div>
    </div>
  )
}

