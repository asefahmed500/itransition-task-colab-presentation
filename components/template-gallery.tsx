"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"

interface TemplateGalleryProps {
  onSelectTemplate: (template: string) => void
}

export function TemplateGallery({ onSelectTemplate }: TemplateGalleryProps) {
  const templates = [
    {
      id: "title",
      name: "Title Slide",
      preview: "/placeholder.svg?height=100&width=150",
      content: "# Presentation Title\n\n## Subtitle\n\nPresenter Name",
    },
    {
      id: "section",
      name: "Section Header",
      preview: "/placeholder.svg?height=100&width=150",
      content: "# Section Title\n\n> Brief description of this section",
    },
    {
      id: "bullets",
      name: "Bullet Points",
      preview: "/placeholder.svg?height=100&width=150",
      content: "# Topic\n\n- First point\n- Second point\n- Third point\n- Fourth point",
    },
    {
      id: "image-text",
      name: "Image with Text",
      preview: "/placeholder.svg?height=100&width=150",
      content:
        "# Topic\n\n![Image description](/placeholder.svg?height=300&width=400)\n\nDescription or explanation of the image",
    },
    {
      id: "quote",
      name: "Quote",
      preview: "/placeholder.svg?height=100&width=150",
      content: '# Quote\n\n> "The best way to predict the future is to invent it."\n\n— Alan Kay',
    },
    {
      id: "comparison",
      name: "Comparison",
      preview: "/placeholder.svg?height=100&width=150",
      content:
        "# Comparison\n\n| Feature | Option A | Option B |\n| ------- | ------- | ------- |\n| Speed   | Fast    | Slow    |\n| Cost    | High    | Low     |\n| Quality | High    | Medium  |",
    },
    {
      id: "code",
      name: "Code Example",
      preview: "/placeholder.svg?height=100&width=150",
      content:
        '# Code Example\n\n```javascript\nfunction hello() {\n  console.log("Hello, world!");\n}\n\nhello();\n```',
    },
    {
      id: "timeline",
      name: "Timeline",
      preview: "/placeholder.svg?height=100&width=150",
      content:
        "# Timeline\n\n1. **Phase 1**: Planning and Research\n2. **Phase 2**: Design and Development\n3. **Phase 3**: Testing and Refinement\n4. **Phase 4**: Launch and Marketing",
    },
  ]

  return (
    <ScrollArea className="h-full">
      <div className="grid grid-cols-2 gap-2 p-2">
        {templates.map((template) => (
          <Button
            key={template.id}
            variant="outline"
            className="flex h-auto flex-col items-center justify-start p-2"
            onClick={() => onSelectTemplate(template.content)}
          >
            <img
              src={template.preview || "/placeholder.svg"}
              alt={template.name}
              className="mb-2 aspect-video w-full rounded-md border object-cover"
            />
            <span className="text-xs">{template.name}</span>
          </Button>
        ))}
      </div>
    </ScrollArea>
  )
}

