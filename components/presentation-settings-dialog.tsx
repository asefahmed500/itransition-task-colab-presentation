"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { DeletePresentationDialog } from "@/components/delete-presentation-dialog"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import type { Presentation } from "@/types/presentation"

interface PresentationSettingsDialogProps {
  presentation: Presentation
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdatePresentation: (data: Partial<Presentation>) => void
}

export function PresentationSettingsDialog({
  presentation,
  open,
  onOpenChange,
  onUpdatePresentation,
}: PresentationSettingsDialogProps) {
  const { toast } = useToast()
  const { userId } = useUser()
  const [title, setTitle] = useState(presentation.title)
  const [description, setDescription] = useState(presentation.description)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Check if user is creator
  const isCreator = presentation.collaborators.find((c) => c.userId === userId)?.role === "creator"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      onUpdatePresentation({
        title,
        description,
      })

      toast({
        title: "Settings updated",
        description: "Presentation settings have been updated",
      })

      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update settings",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Presentation settings</DialogTitle>
              <DialogDescription>Update your presentation details and settings.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="flex justify-between">
              {isCreator && (
                <Button type="button" variant="destructive" onClick={() => setDeleteDialogOpen(true)}>
                  Delete Presentation
                </Button>
              )}
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save changes"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <DeletePresentationDialog
        presentationId={presentation.id}
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
      />
    </>
  )
}

