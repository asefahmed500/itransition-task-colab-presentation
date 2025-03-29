"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ShareDialog } from "@/components/share-dialog"
import { ExportDialog } from "@/components/export-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ChevronLeft, Download, MoreVertical, PanelLeft, Play, Save, Share2, Users } from "lucide-react"
import type { Presentation } from "@/types/presentation"

interface EditorHeaderProps {
  presentation: Presentation
  onToggleSidebar: () => void
  onToggleCollaboration: () => void
  onUpdatePresentation: (data: Partial<Presentation>) => void
}

export function EditorHeader({
  presentation,
  onToggleSidebar,
  onToggleCollaboration,
  onUpdatePresentation,
}: EditorHeaderProps) {
  const router = useRouter()
  const [title, setTitle] = useState(presentation.title)
  const [isEditing, setIsEditing] = useState(false)
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [exportDialogOpen, setExportDialogOpen] = useState(false)

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value)
  }

  const handleTitleBlur = () => {
    setIsEditing(false)
    if (title !== presentation.title) {
      onUpdatePresentation({ title })
    }
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur()
    }
  }

  const handleSave = () => {
    // Save is handled automatically in the usePresentation hook
    // This is just a visual confirmation
    const saveButton = document.getElementById("save-button")
    if (saveButton) {
      saveButton.classList.add("animate-pulse")
      setTimeout(() => {
        saveButton.classList.remove("animate-pulse")
      }, 1000)
    }
  }

  const handlePresent = () => {
    router.push(`/present/${presentation.id}`)
  }

  return (
    <div className="flex h-14 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <a href="/presentations">
            <ChevronLeft className="h-4 w-4" />
          </a>
        </Button>
        {isEditing ? (
          <Input
            value={title}
            onChange={handleTitleChange}
            onBlur={handleTitleBlur}
            onKeyDown={handleTitleKeyDown}
            className="h-9 w-[200px]"
            autoFocus
          />
        ) : (
          <Button variant="ghost" className="font-medium" onClick={() => setIsEditing(true)}>
            {title}
          </Button>
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} title="Toggle sidebar">
          <PanelLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={onToggleCollaboration} title="Collaboration panel">
          <Users className="h-4 w-4" />
        </Button>
        <Button id="save-button" variant="ghost" size="icon" onClick={handleSave} title="Save presentation">
          <Save className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setShareDialogOpen(true)} title="Share presentation">
          <Share2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setExportDialogOpen(true)} title="Export presentation">
          <Download className="h-4 w-4" />
        </Button>
        <Button variant="default" onClick={handlePresent} className="gap-1.5">
          <Play className="h-4 w-4" />
          Present
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setShareDialogOpen(true)}>Share</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setExportDialogOpen(true)}>Export as PDF</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Presentation settings</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <ShareDialog presentation={presentation} open={shareDialogOpen} onOpenChange={setShareDialogOpen} />
      <ExportDialog presentationId={presentation.id} open={exportDialogOpen} onOpenChange={setExportDialogOpen} />
    </div>
  )
}

