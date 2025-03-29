"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"

interface ExportDialogProps {
  presentationId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ presentationId, open, onOpenChange }: ExportDialogProps) {
  const [includeNotes, setIncludeNotes] = useState(false)
  const [includeDrawings, setIncludeDrawings] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const { toast } = useToast()

  const handleExport = async () => {
    setIsExporting(true)
    try {
      // Open the export URL in a new tab
      window.open(
        `/api/presentations/${presentationId}/export?includeNotes=${includeNotes}&includeDrawings=${includeDrawings}`,
        "_blank",
      )

      toast({
        title: "Export successful",
        description: "Your presentation has been exported to PDF",
      })
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error exporting your presentation",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Export to PDF</DialogTitle>
          <DialogDescription>Export your presentation as a PDF document.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-notes"
              checked={includeNotes}
              onCheckedChange={(checked) => setIncludeNotes(!!checked)}
            />
            <Label htmlFor="include-notes">Include presenter notes</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="include-drawings"
              checked={includeDrawings}
              onCheckedChange={(checked) => setIncludeDrawings(!!checked)}
            />
            <Label htmlFor="include-drawings">Include drawings and annotations</Label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleExport} disabled={isExporting}>
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

