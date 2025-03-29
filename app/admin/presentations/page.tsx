"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { Layers, RefreshCw, Trash } from "lucide-react"

export default function AdminPresentationsPage() {
  const { toast } = useToast()
  const [presentations, setPresentations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [cleanupLoading, setCleanupLoading] = useState(false)

  // Fetch all presentations
  const fetchPresentations = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/admin/presentations")
      const data = await response.json()

      if (data.success) {
        setPresentations(data.presentations || [])
        toast({
          title: "Presentations loaded",
          description: `Found ${data.count} presentations`,
        })
      } else {
        console.error("Failed to fetch presentations:", data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to fetch presentations",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching presentations:", error)
      toast({
        title: "Error",
        description: "Failed to fetch presentations",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  // Clean up database
  const cleanupDatabase = async () => {
    try {
      setCleanupLoading(true)
      const response = await fetch("/api/admin/cleanup-database", {
        method: "POST",
      })
      const data = await response.json()

      if (data.success) {
        toast({
          title: "Database cleaned up",
          description: `Fixed ${data.stats.fixedInvalidCodes} invalid codes and ${data.stats.fixedDuplicates} duplicates`,
        })
        // Refresh presentations list
        fetchPresentations()
      } else {
        console.error("Failed to clean up database:", data.error)
        toast({
          title: "Error",
          description: data.error || "Failed to clean up database",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error cleaning up database:", error)
      toast({
        title: "Error",
        description: "Failed to clean up database",
        variant: "destructive",
      })
    } finally {
      setCleanupLoading(false)
    }
  }

  // Load presentations on mount
  useEffect(() => {
    fetchPresentations()
  }, [])

  return (
    <div className="container mx-auto py-10">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6" />
          <h1 className="text-2xl font-bold">Presentation Admin</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPresentations} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="destructive" onClick={cleanupDatabase} disabled={cleanupLoading}>
            <Trash className="mr-2 h-4 w-4" />
            {cleanupLoading ? "Cleaning..." : "Clean Database"}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Presentations</CardTitle>
          <CardDescription>View and manage all presentations in the database</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading presentations...</p>
              </div>
            </div>
          ) : presentations.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No presentations found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Access Code</TableHead>
                  <TableHead>Slides</TableHead>
                  <TableHead>Collaborators</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presentations.map((presentation) => (
                  <TableRow key={presentation.id}>
                    <TableCell className="font-medium">{presentation.title}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{presentation.accessCode || "MISSING"}</Badge>
                    </TableCell>
                    <TableCell>{presentation.slideCount}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        {presentation.collaborators.map((collaborator: any, index: number) => (
                          <div key={index} className="text-xs">
                            {collaborator.nickname}
                            <Badge
                              variant={
                                collaborator.role === "creator"
                                  ? "default"
                                  : collaborator.role === "editor"
                                    ? "secondary"
                                    : "outline"
                              }
                              className="ml-2"
                            >
                              {collaborator.role}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{new Date(presentation.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{new Date(presentation.updatedAt).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

