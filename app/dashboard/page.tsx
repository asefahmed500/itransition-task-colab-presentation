import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { PresentationCard } from "@/components/presentation-card"
import { CreatePresentationDialog } from "@/components/create-presentation-dialog"
import { Plus, Search } from "lucide-react"

export default function DashboardPage() {
  return (
    <>
      <DashboardShell>
        <DashboardHeader heading="Presentations" text="Create and manage your presentations.">
          <CreatePresentationDialog />
        </DashboardHeader>
        <div className="flex items-center justify-between">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search presentations..." className="w-full bg-background pl-8" />
          </div>
          <Link href="/dashboard/new">
            <Button className="hidden md:flex">
              <Plus className="mr-2 h-4 w-4" />
              New Presentation
            </Button>
          </Link>
        </div>
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All Presentations</TabsTrigger>
            <TabsTrigger value="my">My Presentations</TabsTrigger>
            <TabsTrigger value="shared">Shared with me</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <PresentationCard
                title="Q1 Business Review"
                description="Overview of Q1 performance and goals for Q2"
                date="Updated 2 days ago"
                users={3}
                slides={12}
                href="/editor/1"
              />
              <PresentationCard
                title="Product Roadmap"
                description="Upcoming features and development timeline"
                date="Updated 1 week ago"
                users={5}
                slides={24}
                href="/editor/2"
              />
              <PresentationCard
                title="Team Introduction"
                description="Meet the team presentation for new hires"
                date="Updated 3 weeks ago"
                users={2}
                slides={8}
                href="/editor/3"
              />
              <PresentationCard
                title="Investor Pitch"
                description="Funding round pitch deck for investors"
                date="Updated 1 month ago"
                users={4}
                slides={18}
                href="/editor/4"
              />
              <PresentationCard
                title="Marketing Strategy"
                description="Q3 marketing initiatives and campaign plans"
                date="Updated 2 months ago"
                users={6}
                slides={15}
                href="/editor/5"
              />
              <Card className="flex h-[190px] flex-col items-center justify-center">
                <Link
                  href="/dashboard/new"
                  className="flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center hover:border-primary"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Create new presentation</h3>
                </Link>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="my" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <PresentationCard
                title="Q1 Business Review"
                description="Overview of Q1 performance and goals for Q2"
                date="Updated 2 days ago"
                users={3}
                slides={12}
                href="/editor/1"
              />
              <PresentationCard
                title="Investor Pitch"
                description="Funding round pitch deck for investors"
                date="Updated 1 month ago"
                users={4}
                slides={18}
                href="/editor/4"
              />
              <Card className="flex h-[190px] flex-col items-center justify-center">
                <Link
                  href="/dashboard/new"
                  className="flex h-full w-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center hover:border-primary"
                >
                  <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Plus className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium">Create new presentation</h3>
                </Link>
              </Card>
            </div>
          </TabsContent>
          <TabsContent value="shared" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              <PresentationCard
                title="Product Roadmap"
                description="Upcoming features and development timeline"
                date="Updated 1 week ago"
                users={5}
                slides={24}
                href="/editor/2"
              />
              <PresentationCard
                title="Team Introduction"
                description="Meet the team presentation for new hires"
                date="Updated 3 weeks ago"
                users={2}
                slides={8}
                href="/editor/3"
              />
              <PresentationCard
                title="Marketing Strategy"
                description="Q3 marketing initiatives and campaign plans"
                date="Updated 2 months ago"
                users={6}
                slides={15}
                href="/editor/5"
              />
            </div>
          </TabsContent>
        </Tabs>
      </DashboardShell>
    </>
  )
}

