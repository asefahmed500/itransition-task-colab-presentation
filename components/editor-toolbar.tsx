"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Image,
  Link,
  ChevronDown,
  Pencil,
  Square,
  Circle,
  Type,
} from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Slide } from "@/types/presentation"
import { ColorPicker } from "@/components/color-picker"

interface EditorToolbarProps {
  onUpdateSlide: (content: Partial<Slide>) => void
}

export function EditorToolbar({ onUpdateSlide }: EditorToolbarProps) {
  const [activeTab, setActiveTab] = useState("edit")

  const handleTextFormat = (format: string) => {
    // This would be implemented with a rich text editor library
    console.log("Format text:", format)
  }

  const handleDrawingTool = (tool: string) => {
    // This would be implemented with a canvas drawing library
    console.log("Drawing tool:", tool)
  }

  return (
    <div className="border-b p-2">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-[200px] grid-cols-2">
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="draw">Draw</TabsTrigger>
        </TabsList>
      </Tabs>

      {activeTab === "edit" && (
        <div className="mt-2 flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                <Type className="h-4 w-4" />
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleTextFormat("h1")}>Heading 1</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTextFormat("h2")}>Heading 2</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTextFormat("h3")}>Heading 3</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTextFormat("p")}>Paragraph</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTextFormat("quote")}>Quote</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTextFormat("code")}>Code</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("bold")}>
            <Bold className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("italic")}>
            <Italic className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("underline")}>
            <Underline className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("bullet")}>
            <List className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("number")}>
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("left")}>
            <AlignLeft className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("center")}>
            <AlignCenter className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("right")}>
            <AlignRight className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("link")}>
            <Link className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleTextFormat("image")}>
            <Image className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ColorPicker onSelectColor={(color) => handleTextFormat(`color:${color}`)} />
        </div>
      )}

      {activeTab === "draw" && (
        <div className="mt-2 flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => handleDrawingTool("pencil")}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDrawingTool("rectangle")}>
            <Square className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDrawingTool("circle")}>
            <Circle className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="mx-1 h-6" />
          <ColorPicker onSelectColor={(color) => handleDrawingTool(`color:${color}`)} />
          <Separator orientation="vertical" className="mx-1 h-6" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-1">
                Line Width
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleDrawingTool("width:1")}>Thin</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDrawingTool("width:3")}>Medium</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDrawingTool("width:5")}>Thick</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  )
}

