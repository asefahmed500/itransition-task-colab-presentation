"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Eraser, Undo, Redo, Save } from "lucide-react"
import type { Drawing } from "@/types/presentation"

interface DrawingCanvasProps {
  drawings: Drawing[]
  onUpdateDrawings: (drawings: Drawing[]) => void
}

export function DrawingCanvas({ drawings, onUpdateDrawings }: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [currentTool, setCurrentTool] = useState<"pen" | "eraser">("pen")
  const [currentColor, setCurrentColor] = useState("#FF0000")
  const [currentWidth, setCurrentWidth] = useState(3)
  const [history, setHistory] = useState<Drawing[][]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [localDrawings, setLocalDrawings] = useState<Drawing[]>(drawings)

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw existing drawings
    localDrawings.forEach((drawing) => {
      drawOnCanvas(ctx, drawing)
    })
  }, [localDrawings])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      // Save current drawings
      const tempDrawings = [...localDrawings]

      // Resize canvas
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight

      // Redraw
      tempDrawings.forEach((drawing) => {
        drawOnCanvas(ctx, drawing)
      })
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [localDrawings])

  const drawOnCanvas = (ctx: CanvasRenderingContext2D, drawing: Drawing) => {
    ctx.beginPath()
    ctx.moveTo(drawing.points[0].x, drawing.points[0].y)

    for (let i = 1; i < drawing.points.length; i++) {
      ctx.lineTo(drawing.points[i].x, drawing.points[i].y)
    }

    ctx.strokeStyle = drawing.color
    ctx.lineWidth = drawing.width
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setIsDrawing(true)
    setLocalDrawings([
      ...localDrawings,
      {
        tool: currentTool,
        color: currentColor,
        width: currentWidth,
        points: [{ x, y }],
      },
    ])
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const newDrawings = [...localDrawings]
    const currentDrawing = newDrawings[newDrawings.length - 1]
    currentDrawing.points.push({ x, y })

    setLocalDrawings(newDrawings)

    // Draw the latest segment
    ctx.beginPath()
    const lastPoint = currentDrawing.points[currentDrawing.points.length - 2]
    ctx.moveTo(lastPoint.x, lastPoint.y)
    ctx.lineTo(x, y)
    ctx.strokeStyle = currentDrawing.color
    ctx.lineWidth = currentDrawing.width
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    ctx.stroke()
  }

  const endDrawing = () => {
    if (!isDrawing) return

    setIsDrawing(false)

    // Add to history
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push([...localDrawings])
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }

  const handleUndo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setLocalDrawings(history[historyIndex - 1])
    } else if (historyIndex === 0) {
      setHistoryIndex(-1)
      setLocalDrawings([])
    }
  }

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setLocalDrawings(history[historyIndex + 1])
    }
  }

  const handleSave = () => {
    onUpdateDrawings(localDrawings)
  }

  const handleClear = () => {
    const newHistory = [...history, [...localDrawings]]
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setLocalDrawings([])
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b p-2">
        <div className="flex gap-1">
          {["#FF0000", "#00FF00", "#0000FF", "#FFFF00", "#FF00FF", "#00FFFF", "#000000"].map((color) => (
            <button
              key={color}
              className={`h-6 w-6 rounded-full ${currentColor === color ? "ring-2 ring-primary ring-offset-2" : ""}`}
              style={{ backgroundColor: color }}
              onClick={() => setCurrentColor(color)}
            />
          ))}
        </div>
        <select
          value={currentWidth}
          onChange={(e) => setCurrentWidth(Number(e.target.value))}
          className="h-8 rounded-md border border-input bg-background px-2 text-xs"
        >
          <option value="1">Thin</option>
          <option value="3">Medium</option>
          <option value="5">Thick</option>
        </select>
        <Button
          variant={currentTool === "eraser" ? "default" : "outline"}
          size="icon"
          onClick={() => setCurrentTool(currentTool === "pen" ? "eraser" : "pen")}
        >
          <Eraser className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleUndo} disabled={historyIndex < 0}>
          <Undo className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleRedo} disabled={historyIndex >= history.length - 1}>
          <Redo className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={handleClear}>
          Clear
        </Button>
        <Button variant="default" size="sm" onClick={handleSave} className="ml-auto">
          <Save className="mr-1 h-4 w-4" />
          Save
        </Button>
      </div>
      <div className="relative flex-1">
        <canvas
          ref={canvasRef}
          className="absolute h-full w-full cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
        />
      </div>
    </div>
  )
}

