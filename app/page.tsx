"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowRight, Layers, Users, Pencil, PresentationIcon, FileText, Lock } from "lucide-react"
import { CreatePresentationButton } from "@/components/create-presentation-button"
import { JoinPresentationForm } from "@/components/join-presentation-form"
import { HomePresentationsTable } from "@/components/home-presentations-table"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"

export default function Home() {
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

    if (userId) {
      fetchPresentations()
    } else {
      setLoading(false)
    }
  }, [userId, toast])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <Layers className="h-6 w-6" />
              <span className="font-bold">SlideSync</span>
            </Link>
          </div>
          <div className="ml-auto flex items-center space-x-4">
            <CreatePresentationButton variant="ghost" size="sm" />
            <JoinPresentationForm />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                  Create Stunning Presentations Together
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Collaborate in real-time, use markdown for rich content, and present with confidence.
                </p>
              </div>
              <div className="space-x-4">
                <CreatePresentationButton size="lg" className="gap-1.5">
                  Create Presentation <ArrowRight className="h-4 w-4" />
                </CreatePresentationButton>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Presentations Section */}
        {userId && (
          <section className="w-full py-12 bg-muted/50">
            <div className="container px-4 md:px-6">
              <h2 className="text-2xl font-bold tracking-tight mb-6">Your Presentations</h2>
              {loading ? (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading presentations...</p>
                  </div>
                </div>
              ) : presentations && presentations.length > 0 ? (
                <HomePresentationsTable presentations={presentations} />
              ) : (
                <div className="text-center py-8 bg-background rounded-lg border">
                  <h3 className="text-lg font-medium mb-2">No presentations yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first presentation to get started</p>
                  <CreatePresentationButton>Create Presentation</CreatePresentationButton>
                </div>
              )}
              <div className="mt-4 text-center">
                <Link href="/presentations" className="text-primary hover:underline inline-flex items-center">
                  View all presentations <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="space-y-4">
                <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                  Key Features
                </div>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight">
                  Everything you need for powerful presentations
                </h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform combines the best features for creating, collaborating, and presenting your ideas.
                </p>
              </div>
              <div className="grid gap-6">
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <h3 className="text-xl font-bold">Real-time Collaboration</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Work together with your team in real-time with live updates and changes.
                  </p>
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <Pencil className="h-4 w-4 text-primary" />
                    <h3 className="text-xl font-bold">Drawing Tools</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Annotate your slides with various drawing tools for emphasis and clarity.
                  </p>
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <PresentationIcon className="h-4 w-4 text-primary" />
                    <h3 className="text-xl font-bold">Live Presentation Mode</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Present your slides in real-time with synchronized updates for all viewers.
                  </p>
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    <h3 className="text-xl font-bold">Markdown Support</h3>
                  </div>
                  <p className="text-muted-foreground">Create rich content easily using Markdown formatting.</p>
                </div>
                <div className="grid gap-1">
                  <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    <h3 className="text-xl font-bold">Role-based Permissions</h3>
                  </div>
                  <p className="text-muted-foreground">
                    Control who can view, edit, or present with granular permission settings.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to get started?</h2>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
                  Join thousands of teams already creating amazing presentations with SlideSync.
                </p>
              </div>
              <div className="space-x-4">
                <CreatePresentationButton size="lg">Create Presentation</CreatePresentationButton>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="w-full border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            <p className="text-sm text-muted-foreground">© 2024 SlideSync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

