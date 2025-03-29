import { Server } from "socket.io"
import type { Server as HttpServer } from "http"

interface SocketUser {
  userId: string
  name: string
}

interface PresentationState {
  viewers: SocketUser[]
  currentSlide: number
}

interface SlideUpdateData {
  presentationId: string
  userId: string
  slideIndex: number
  content: any
}

interface PresentationUpdateData {
  presentationId: string
  userId: string
  title?: string
  description?: string
}

interface SlideAddData {
  presentationId: string
  userId: string
  template?: string
}

interface SlideDeleteData {
  presentationId: string
  userId: string
  slideIndex: number
}

interface SlideChangeData {
  presentationId: string
  currentSlide: number
}

export function initSocketServer(httpServer: HttpServer): Server {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  })

  // Store active presentations and their viewers
  const presentations: Record<string, PresentationState> = {}

  // Log socket connections
  io.engine.on("connection_error", (err) => {
    console.error("Socket.io connection error:", err)
  })

  io.on("connection", (socket) => {
    try {
      const presentationId = socket.handshake.query.presentationId as string
      const userId = socket.handshake.query.userId as string
      const userName = socket.handshake.query.userName as string
      const mode = socket.handshake.query.mode as string

      if (!presentationId || !userId) {
        console.warn("Socket connection missing required parameters, disconnecting")
        socket.disconnect()
        return
      }

      console.log(`Socket connected: ${socket.id} (User: ${userId}, Presentation: ${presentationId}, Mode: ${mode})`)

      // Initialize presentation if it doesn't exist
      if (!presentations[presentationId]) {
        presentations[presentationId] = {
          viewers: [],
          currentSlide: 0,
        }
      }

      // Add viewer to presentation
      if (mode === "viewer") {
        presentations[presentationId].viewers.push({
          userId,
          name: userName || "Anonymous",
        })

        // Emit updated viewers list
        io.to(presentationId).emit("viewers-updated", {
          viewers: presentations[presentationId].viewers,
        })

        // Send current slide to new viewer
        socket.emit("slide-changed", {
          currentSlide: presentations[presentationId].currentSlide,
        })
      }

      // Join presentation room
      socket.join(presentationId)

      // Handle slide change
      socket.on("slide-change", (data: SlideChangeData) => {
        try {
          if (!data || typeof data.currentSlide !== "number") {
            console.warn("Invalid slide-change data received:", data)
            return
          }

          console.log(`Slide change in presentation ${presentationId}: slide ${data.currentSlide}`)
          presentations[presentationId].currentSlide = data.currentSlide
          socket.to(presentationId).emit("slide-changed", {
            currentSlide: data.currentSlide,
          })
        } catch (error) {
          console.error("Error handling slide-change event:", error)
        }
      })

      // Handle slide update
      socket.on("update-slide", (data: SlideUpdateData) => {
        try {
          if (!data || typeof data.slideIndex !== "number") {
            console.warn("Invalid update-slide data received:", data)
            return
          }

          console.log(`Slide update in presentation ${presentationId}: slide ${data.slideIndex} by user ${data.userId}`)
          socket.to(presentationId).emit("slide-updated", data)
        } catch (error) {
          console.error("Error handling update-slide event:", error)
        }
      })

      // Handle presentation update
      socket.on("update-presentation", (data: PresentationUpdateData) => {
        try {
          if (!data) {
            console.warn("Invalid update-presentation data received:", data)
            return
          }

          console.log(`Presentation update for ${presentationId} by user ${data.userId}`)
          socket.to(presentationId).emit("presentation-updated", data)
        } catch (error) {
          console.error("Error handling update-presentation event:", error)
        }
      })

      // Handle slide add
      socket.on("add-slide", (data: SlideAddData) => {
        try {
          if (!data) {
            console.warn("Invalid add-slide data received:", data)
            return
          }

          console.log(`Slide added to presentation ${presentationId} by user ${data.userId}`)
          socket.to(presentationId).emit("slide-added", data)
        } catch (error) {
          console.error("Error handling add-slide event:", error)
        }
      })

      // Handle slide delete
      socket.on("delete-slide", (data: SlideDeleteData) => {
        try {
          if (!data || typeof data.slideIndex !== "number") {
            console.warn("Invalid delete-slide data received:", data)
            return
          }

          console.log(`Slide ${data.slideIndex} deleted from presentation ${presentationId} by user ${data.userId}`)
          socket.to(presentationId).emit("slide-deleted", data)
        } catch (error) {
          console.error("Error handling delete-slide event:", error)
        }
      })

      // Handle disconnect
      socket.on("disconnect", () => {
        try {
          console.log(`Socket disconnected: ${socket.id} (User: ${userId}, Presentation: ${presentationId})`)

          if (mode === "viewer" && presentations[presentationId]) {
            presentations[presentationId].viewers = presentations[presentationId].viewers.filter(
              (viewer) => viewer.userId !== userId,
            )

            // Emit updated viewers list
            io.to(presentationId).emit("viewers-updated", {
              viewers: presentations[presentationId].viewers,
            })

            // Clean up empty presentations
            if (presentations[presentationId].viewers.length === 0) {
              delete presentations[presentationId]
              console.log(`Removed empty presentation: ${presentationId}`)
            }
          }
        } catch (error) {
          console.error("Error handling disconnect event:", error)
        }
      })
    } catch (error) {
      console.error("Error handling socket connection:", error)
      socket.disconnect()
    }
  })

  console.log("Socket.io server initialized")

  return io
}

