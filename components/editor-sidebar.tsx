"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SlidePreview } from "@/components/slide-preview"
import { TemplateGallery } from "@/components/template-gallery"
import { Plus, Trash } from "lucide-react"
import type { Slide } from "@/types/presentation"

interface EditorSidebarProps {
  slides: Slide[]
  activeSlideIndex: number
  onSlideChange: (index: number) => void
  onAddSlide: (template?: string) => void
  onDeleteSlide: (index: number) => void
}

export function EditorSidebar({
  slides,
  activeSlideIndex,
  onSlideChange,
  onAddSlide,
  onDeleteSlide,
}: EditorSidebarProps) {
  const [tab, setTab] = useState("slides")

  const handleDeleteSlide = (index: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (slides.length > 1) {
      onDeleteSlide(index)
    }
  }

  return (
    <div className="flex w-64 flex-col border-r">
      <Tabs value={tab} onValueChange={setTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="slides">Slides</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="slides" className="flex flex-1 flex-col">
          <div className="p-2">
            <Button onClick={() => onAddSlide()} className="w-full justify-start">
              <Plus className="mr-2 h-4 w-4" />
              Add Slide
            </Button>
          </div>
          <ScrollArea className="flex-1">
            <div className="grid gap-2 p-2">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`group relative cursor-pointer rounded-md border p-1 ${
                    activeSlideIndex === index ? "border-primary bg-muted" : ""
                  }`}
                  onClick={() => onSlideChange(index)}
                >
                  <SlidePreview slide={slide} />
                  <div className="absolute right-1 top-1 hidden group-hover:block">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => handleDeleteSlide(index, e)}
                      disabled={slides.length <= 1}
                    >
                      <Trash className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="mt-1 text-center text-xs text-muted-foreground">Slide {index + 1}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="templates" className="flex-1">
          <TemplateGallery onSelectTemplate={(template) => onAddSlide(template)} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

