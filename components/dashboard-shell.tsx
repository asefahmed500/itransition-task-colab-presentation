import type React from "react"
interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <div className="flex items-center gap-2">
            <a href="/dashboard" className="flex items-center gap-2 font-semibold">
              SlideSync
            </a>
          </div>
          <nav className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm font-medium">
              Dashboard
            </a>
            <a href="/dashboard/templates" className="text-sm font-medium text-muted-foreground">
              Templates
            </a>
            <a href="/dashboard/settings" className="text-sm font-medium text-muted-foreground">
              Settings
            </a>
          </nav>
        </div>
      </header>
      <main className="container flex w-full flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">{children}</main>
    </div>
  )
}

