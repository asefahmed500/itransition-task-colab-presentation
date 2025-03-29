"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Eye, Pencil, Search, Check, ArrowUpDown, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"

interface Presentation {
  id: string
  title: string
  creator: string
  lastEditedBy: string
  lastEditedTime: string
  accessCode: string
  role?: string
}

interface HomePresentationsTableProps {
  presentations: Presentation[]
}

export function HomePresentationsTable({ presentations = [] }: HomePresentationsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [sortField, setSortField] = useState<keyof Presentation>("lastEditedTime")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc")
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  // Filter presentations based on search query with null checks
  const filteredPresentations = presentations.filter(
    (presentation) =>
      (presentation.title?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (presentation.creator?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (presentation.accessCode?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
  )

  // Sort presentations
  const sortedPresentations = [...filteredPresentations].sort((a, b) => {
    let valueA = a[sortField] || ""
    let valueB = b[sortField] || ""

    // Handle date comparison for lastEditedTime
    if (sortField === "lastEditedTime") {
      valueA = valueA ? new Date(valueA).getTime() : 0
      valueB = valueB ? new Date(valueB).getTime() : 0
    }

    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1
    return 0
  })

  // Limit to 5 most recent presentations for the home page
  const recentPresentations = sortedPresentations.slice(0, 5)

  // Handle sort toggle
  const toggleSort = (field: keyof Presentation) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  // Handle copy access code
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)

    toast({
      title: "Access code copied",
      description: "You can share this code with others to collaborate",
    })

    // Reset the copied state after 2 seconds
    setTimeout(() => {
      setCopiedCode(null)
    }, 2000)
  }

  // Format date to relative time
  const formatDate = (dateString: string) => {
    try {
      return dateString ? formatDistanceToNow(new Date(dateString), { addSuffix: true }) : "Unknown date"
    } catch (error) {
      return "Unknown date"
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search presentations..."
            className="w-full bg-background pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("title")}
                  className="flex items-center gap-1 font-medium"
                >
                  Title
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("creator")}
                  className="flex items-center gap-1 font-medium"
                >
                  Creator
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("lastEditedBy")}
                  className="flex items-center gap-1 font-medium"
                >
                  Last Edited By
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => toggleSort("lastEditedTime")}
                  className="flex items-center gap-1 font-medium"
                >
                  <Clock className="mr-1 h-3.5 w-3.5" />
                  Last Edited
                  <ArrowUpDown className="h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>Access Code</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentPresentations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No presentations found. Create a new presentation to get started.
                </TableCell>
              </TableRow>
            ) : (
              recentPresentations.map((presentation) => (
                <TableRow key={presentation.id}>
                  <TableCell className="font-medium">
                    {presentation.title}
                    {presentation.role && (
                      <Badge
                        variant={
                          presentation.role === "creator"
                            ? "default"
                            : presentation.role === "editor"
                              ? "secondary"
                              : "outline"
                        }
                        className="ml-2"
                      >
                        {presentation.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>{presentation.creator || "Unknown"}</TableCell>
                  <TableCell>{presentation.lastEditedBy || "Unknown"}</TableCell>
                  <TableCell>{formatDate(presentation.lastEditedTime)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm">
                        {presentation.accessCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleCopyCode(presentation.accessCode)}
                      >
                        {copiedCode === presentation.accessCode ? (
                          <Check className="h-3.5 w-3.5 text-green-500" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/present/${presentation.id}`)}>
                        <Eye className="mr-1 h-3.5 w-3.5" />
                        View
                      </Button>
                      {(presentation.role === "creator" || presentation.role === "editor") && (
                        <Button variant="outline" size="sm" onClick={() => router.push(`/editor/${presentation.id}`)}>
                          <Pencil className="mr-1 h-3.5 w-3.5" />
                          Edit
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

