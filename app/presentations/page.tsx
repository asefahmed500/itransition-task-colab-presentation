"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { CreatePresentationDialog } from "@/components/create-presentation-dialog"
import { JoinPresentationForm } from "@/components/join-presentation-form"
import { PresentationsTable } from "@/components/presentations-table"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import { Layers } from "lucide-react"

export default function PresentationsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { userId } = useUser()
  const [presentations, setPresentations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPresentations = async () => {
      try {
        const response = await fetch(`/api/presentations?userId=${userId}`)
        const data = await response.json()

        if (data.success) {
          setPresentations(data.presentations || [])
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

    fetchPresentations()
  }, [userId, toast])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <a href="/" className="flex items-center gap-2 font-semibold">
              <Layers className="h-6 w-6" />
              SlideSync
            </a>
          </div>
          <div className="flex items-center gap-4">
            <CreatePresentationDialog />
            <JoinPresentationForm />
          </div>
        </div>
      </header>
      <main className="container flex w-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between px-2">
          <div className="grid gap-1">
            <h1 className="text-2xl font-bold tracking-tight">Presentations</h1>
            <p className="text-muted-foreground">View and manage all presentations.</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading presentations...</p>
            </div>
          </div>
        ) : (
          <PresentationsTable presentations={presentations} />
        )}
      </main>
    </div>
  )
}

