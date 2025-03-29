import { ScrollArea } from "@/components/ui/scroll-area"

interface PresenterNotesProps {
  notes: string
}

export function PresenterNotes({ notes }: PresenterNotesProps) {
  return (
    <ScrollArea className="h-32">
      <div className="p-2">
        <h3 className="mb-1 text-sm font-medium">Presenter Notes</h3>
        <div className="whitespace-pre-wrap text-sm">{notes}</div>
      </div>
    </ScrollArea>
  )
}

