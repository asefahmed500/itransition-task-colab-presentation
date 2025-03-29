"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { MarkdownRenderer } from "@/components/markdown-renderer"
import { DrawingCanvas } from "@/components/drawing-canvas"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Slide } from "@/types/presentation"

interface EditorCanvasProps {
  slide: Slide
  onUpdateSlide: (content: Partial<Slide>) => void
}

export function EditorCanvas({ slide, onUpdateSlide }: EditorCanvasProps) {
  const [content, setContent] = useState(slide.content || "")
  const [notes, setNotes] = useState(slide.notes || "")
  const [activeTab, setActiveTab] = useState("preview")
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const notesRef = useRef<HTMLTextAreaElement>(null)

  // Update local state when slide changes
  useEffect(() => {
    setContent(slide.content || "")
    setNotes(slide.notes || "")
  }, [slide])

  // Save content when it changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (content !== slide.content) {
        onUpdateSlide({ content })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [content, slide.content, onUpdateSlide])

  // Save notes when they change
  useEffect(() => {
    const timer = setTimeout(() => {
      if (notes !== slide.notes) {
        onUpdateSlide({ notes })
      }
    }, 500)

    return () => clearTimeout(timer)
  }, [notes, slide.notes, onUpdateSlide])

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value)
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      <div className="flex flex-1 flex-col overflow-hidden p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-[300px] grid-cols-3">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="edit">Edit Markdown</TabsTrigger>
            <TabsTrigger value="draw">Draw</TabsTrigger>
          </TabsList>
          <div className="mt-4 flex flex-1 flex-col overflow-hidden">
            <TabsContent value="preview" className="flex-1 overflow-auto rounded-md border p-4">
              <div className="flex h-full items-center justify-center">
                <div className="w-full max-w-3xl">
                  <MarkdownRenderer content={content} />
                </div>
              </div>
            </TabsContent>
            <TabsContent value="edit" className="flex-1 overflow-hidden">
              <Textarea
                ref={contentRef}
                value={content}
                onChange={handleContentChange}
                placeholder="# Slide Title
                
## Subtitle

- Bullet point 1
- Bullet point 2
- Bullet point 3

> Quote or important information

![Image description](/placeholder.svg)"
                className="h-full resize-none font-mono"
              />
            </TabsContent>
            <TabsContent value="draw" className="flex-1 overflow-hidden">
              <DrawingCanvas
                drawings={slide.drawings || []}
                onUpdateDrawings={(drawings) => onUpdateSlide({ drawings })}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      <div className="border-t p-4">
        <h3 className="mb-2 text-sm font-medium">Presenter Notes</h3>
        <Textarea
          ref={notesRef}
          value={notes}
          onChange={handleNotesChange}
          placeholder="Add notes for the presenter (only visible in presentation mode)"
          className="h-24 resize-none"
        />
      </div>
    </div>
  )
}

