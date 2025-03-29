"use client"

import { useState, useEffect, useCallback } from "react"
import type { Presentation, Slide } from "@/types/presentation"
import { useToast } from "@/hooks/use-toast"

export function usePresentation(id: string, userId: string) {
  const { toast } = useToast()
  const [presentation, setPresentation] = useState<Presentation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch presentation data
  useEffect(() => {
    const fetchPresentation = async () => {
      if (!id || !userId) return

      try {
        setLoading(true)
        const response = await fetch(`/api/presentations/${id}`)
        const data = await response.json()

        if (data.success) {
          setPresentation(data.presentation)
        } else {
          setError(data.error || "Failed to load presentation")
          toast({
            title: "Error",
            description: data.error || "Failed to load presentation",
            variant: "destructive",
          })
        }
      } catch (err) {
        setError("Failed to load presentation")
        toast({
          title: "Error",
          description: "Failed to load presentation",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchPresentation()
  }, [id, userId, toast])

  // Update presentation
  const updatePresentation = useCallback(
    async (data: Partial<Presentation>, shouldSave = true) => {
      if (!presentation || !userId) return

      try {
        // Update local state immediately
        setPresentation({
          ...presentation,
          ...data,
        })

        // Save to database if needed
        if (shouldSave) {
          const response = await fetch(`/api/presentations/${id}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...data,
              userId,
            }),
          })

          const responseData = await response.json()

          if (!responseData.success) {
            toast({
              title: "Error",
              description: responseData.error || "Failed to update presentation",
              variant: "destructive",
            })
          }
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update presentation",
          variant: "destructive",
        })
      }
    },
    [presentation, id, userId, toast],
  )

  // Add a new slide
  const addSlide = useCallback(
    async (template?: string, shouldSave = true) => {
      if (!presentation || !userId) return

      const newSlide: Slide = {
        content: template || "# New Slide\n\n## Click to edit\n\nUse markdown to format your content",
        notes: "",
        drawings: [],
      }

      try {
        // Update local state immediately
        setPresentation({
          ...presentation,
          slides: [...presentation.slides, newSlide],
        })

        // Save to database if needed
        if (shouldSave) {
          const response = await fetch(`/api/presentations/${id}/slides`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              content: newSlide.content,
              notes: newSlide.notes,
              template,
              userId,
            }),
          })

          const data = await response.json()

          if (!data.success) {
            toast({
              title: "Error",
              description: data.error || "Failed to add slide",
              variant: "destructive",
            })
          }
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to add slide",
          variant: "destructive",
        })
      }
    },
    [presentation, id, userId, toast],
  )

  // Update a slide
  const updateSlide = useCallback(
    async (index: number, data: Partial<Slide>, shouldSave = true) => {
      if (!presentation || !userId) return

      try {
        // Update local state immediately
        const updatedSlides = [...presentation.slides]
        updatedSlides[index] = {
          ...updatedSlides[index],
          ...data,
        }

        setPresentation({
          ...presentation,
          slides: updatedSlides,
        })

        // Save to database if needed
        if (shouldSave) {
          const response = await fetch(`/api/presentations/${id}/slides/${index}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...data,
              userId,
            }),
          })

          const responseData = await response.json()

          if (!responseData.success) {
            toast({
              title: "Error",
              description: responseData.error || "Failed to update slide",
              variant: "destructive",
            })
          }
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to update slide",
          variant: "destructive",
        })
      }
    },
    [presentation, id, userId, toast],
  )

  // Delete a slide
  const deleteSlide = useCallback(
    async (index: number, shouldSave = true) => {
      if (!presentation || !userId) return

      try {
        // Update local state immediately
        const updatedSlides = [...presentation.slides]
        updatedSlides.splice(index, 1)

        setPresentation({
          ...presentation,
          slides: updatedSlides,
        })

        // Save to database if needed
        if (shouldSave) {
          const response = await fetch(`/api/presentations/${id}/slides/${index}?userId=${userId}`, {
            method: "DELETE",
          })

          const data = await response.json()

          if (!data.success) {
            toast({
              title: "Error",
              description: data.error || "Failed to delete slide",
              variant: "destructive",
            })
          }
        }
      } catch (err) {
        toast({
          title: "Error",
          description: "Failed to delete slide",
          variant: "destructive",
        })
      }
    },
    [presentation, id, userId, toast],
  )

  return {
    presentation,
    loading,
    error,
    updatePresentation,
    addSlide,
    updateSlide,
    deleteSlide,
  }
}

