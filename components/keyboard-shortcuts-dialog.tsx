"use client"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Keyboard } from "lucide-react"

export function KeyboardShortcutsDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="Keyboard shortcuts">
          <Keyboard className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Keyboard Shortcuts</DialogTitle>
          <DialogDescription>Keyboard shortcuts to help you work faster.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <h3 className="text-sm font-medium">Editor</h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span>Save</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs">Ctrl + S</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Undo</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs">Ctrl + Z</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Redo</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs">Ctrl + Y</kbd>
            </div>
          </div>

          <h3 className="text-sm font-medium">Presentation Mode</h3>
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <span>Next Slide</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs">→ or Space</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Previous Slide</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs">←</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span>Exit Presentation</span>
              <kbd className="rounded border bg-muted px-2 py-0.5 text-xs">Esc</kbd>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

