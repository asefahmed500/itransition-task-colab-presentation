import { MarkdownRenderer } from "@/components/markdown-renderer"
import type { Slide } from "@/types/presentation"

interface SlideRendererProps {
  slide: Slide
}

export function SlideRenderer({ slide }: SlideRendererProps) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-white p-8">
      <div className="w-full max-w-4xl">
        <MarkdownRenderer content={slide.content || ""} />
      </div>
      {slide.drawings && slide.drawings.length > 0 && (
        <div className="absolute inset-0 pointer-events-none">
          {/* Render drawings here */}
          {slide.drawings.map((drawing, index) => (
            <div
              key={index}
              className="absolute"
              style={{
                left: `${drawing.x}%`,
                top: `${drawing.y}%`,
                width: `${drawing.width}%`,
                height: `${drawing.height}%`,
                backgroundColor: drawing.color,
                opacity: 0.5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}

