"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"

export function CreatePresentationDialog() {
  const router = useRouter()
  const { toast } = useToast()
  const { userId, userName } = useUser()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [nickname, setNickname] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Initialize nickname from userName when available
  useEffect(() => {
    if (userName) {
      setNickname(userName)
    }
  }, [userName])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (!title || !nickname) {
      toast({
        title: "Missing information",
        description: "Please provide both a title and your nickname",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      // Store nickname in localStorage for future use
      if (typeof window !== "undefined") {
        localStorage.setItem("userName", nickname)
      }

      const currentUserId = userId || Math.random().toString(36).substring(2, 15)

      // If no userId exists, store the generated one
      if (!userId && typeof window !== "undefined") {
        localStorage.setItem("userId", currentUserId)
      }

      console.log("Creating presentation with:", {
        title,
        description,
        creatorId: currentUserId,
        creatorNickname: nickname,
      })

      // Use the create endpoint directly
      const response = await fetch("/api/presentations/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          description,
          creatorId: currentUserId,
          creatorNickname: nickname,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Server response:", errorText)

        // Show a more user-friendly error message
        toast({
          title: "Error creating presentation",
          description: "Please try again with a different title or refresh the page",
          variant: "destructive",
        })

        setIsLoading(false)
        return
      }

      let data
      try {
        data = await response.json()
      } catch (jsonError) {
        console.error("JSON parsing error:", jsonError)
        toast({
          title: "Error",
          description: "Invalid response from server",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      if (data.success) {
        setOpen(false)

        toast({
          title: "Presentation created",
          description: `Access code: ${data.accessCode}`,
        })

        // Navigate to the editor page
        router.push(`/editor/${data.presentationId}`)
      } else {
        console.error("Failed to create presentation:", data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to create presentation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error creating presentation:", error)
      toast({
        title: "Error",
        description: "Failed to create presentation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Presentation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create new presentation</DialogTitle>
            <DialogDescription>Create a new presentation to share with others.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="My Awesome Presentation"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="nickname">Your Nickname</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="Enter your nickname"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A brief description of your presentation"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

