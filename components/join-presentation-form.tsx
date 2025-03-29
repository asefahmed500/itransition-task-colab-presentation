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
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"

interface JoinPresentationFormProps {
  buttonText?: string
  buttonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  buttonSize?: "default" | "sm" | "lg" | "icon"
}

export function JoinPresentationForm({
  buttonText = "Join Presentation",
  buttonVariant = "outline",
  buttonSize = "default",
}: JoinPresentationFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { userId, userName } = useUser()
  const [open, setOpen] = useState(false)
  const [accessCode, setAccessCode] = useState("")
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

    if (!accessCode || !nickname) {
      toast({
        title: "Missing information",
        description: "Please provide both an access code and your nickname",
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

      console.log("Joining presentation with:", {
        accessCode,
        userId: currentUserId,
        nickname,
      })

      const response = await fetch("/api/presentations/join", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          accessCode,
          userId: currentUserId,
          nickname,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOpen(false)

        toast({
          title: "Joined presentation",
          description: `You joined as a ${data.role}`,
        })

        if (data.role === "creator" || data.role === "editor") {
          router.push(`/editor/${data.presentationId}`)
        } else {
          router.push(`/present/${data.presentationId}/view`)
        }
      } else {
        console.error("Failed to join presentation:", data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to join presentation",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error joining presentation:", error)
      toast({
        title: "Error",
        description: "Failed to join presentation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={buttonVariant} size={buttonSize}>
          {buttonText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Join a presentation</DialogTitle>
            <DialogDescription>Enter the access code to join a presentation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="accessCode">Access Code</Label>
              <Input
                id="accessCode"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                placeholder="Enter 6-digit code"
                required
                className="uppercase"
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
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Joining..." : "Join"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

