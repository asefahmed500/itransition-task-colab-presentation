import { MarkdownRenderer } from "@/components/markdown-renderer"
import type { Slide } from "@/types/presentation"

interface SlidePreviewProps {
  slide: Slide
}

export function SlidePreview({ slide }: SlidePreviewProps) {
  return (
    <div className="aspect-video w-full overflow-hidden rounded bg-white p-1 shadow-sm">
      <div className="flex h-full w-full items-center justify-center overflow-hidden">
        <div className="transform scale-[0.25] origin-center w-[400%] h-[400%]">
          <MarkdownRenderer content={slide.content || ""} />
        </div>
      </div>
    </div>
  )
}

