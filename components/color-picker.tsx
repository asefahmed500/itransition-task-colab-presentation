"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Paintbrush } from "lucide-react"

interface ColorPickerProps {
  onSelectColor: (color: string) => void
}

export function ColorPicker({ onSelectColor }: ColorPickerProps) {
  const [color, setColor] = useState("#000000")

  const colors = [
    "#000000", // Black
    "#FFFFFF", // White
    "#FF0000", // Red
    "#00FF00", // Green
    "#0000FF", // Blue
    "#FFFF00", // Yellow
    "#FF00FF", // Magenta
    "#00FFFF", // Cyan
    "#FFA500", // Orange
    "#800080", // Purple
    "#008000", // Dark Green
    "#800000", // Maroon
    "#008080", // Teal
    "#C0C0C0", // Silver
    "#808080", // Gray
  ]

  const handleColorChange = (newColor: string) => {
    setColor(newColor)
    onSelectColor(newColor)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Paintbrush className="h-4 w-4" />
          <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-5 gap-2">
          {colors.map((c) => (
            <button
              key={c}
              className={`h-8 w-8 rounded-md ${color === c ? "ring-2 ring-primary ring-offset-2" : ""}`}
              style={{ backgroundColor: c }}
              onClick={() => handleColorChange(c)}
            />
          ))}
        </div>
        <div className="mt-4 flex items-center gap-2">
          <input type="color" value={color} onChange={(e) => handleColorChange(e.target.value)} className="h-8 w-8" />
          <input
            type="text"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>
      </PopoverContent>
    </Popover>
  )
}

