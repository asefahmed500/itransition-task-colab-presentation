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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useUser } from "@/hooks/use-user"
import type { Presentation } from "@/types/presentation"

interface ShareDialogProps {
  presentation: Presentation
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ presentation, open, onOpenChange }: ShareDialogProps) {
  const { userId } = useUser()
  const { toast } = useToast()
  const [tab, setTab] = useState("code")
  const [email, setEmail] = useState("")
  const [role, setRole] = useState("viewer")
  const [copied, setCopied] = useState(false)

  const handleCopyCode = () => {
    navigator.clipboard.writeText(presentation.accessCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Access code copied",
      description: "Share this code with others to collaborate",
    })
  }

  const handleInvite = async () => {
    try {
      const response = await fetch(`/api/presentations/${presentation.id}/collaborators`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: Math.random().toString(36).substring(2, 9), // Generate random ID for demo
          nickname: email.split("@")[0],
          role,
          invitedBy: userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Invitation sent",
          description: `Invitation sent to ${email} as ${role}`,
        })
        setEmail("")
        onOpenChange(false)
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send invitation",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send invitation",
        variant: "destructive",
      })
    }
  }

  // Check if user is creator
  const isCreator = presentation.collaborators.find((c) => c.userId === userId)?.role === "creator"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Share presentation</DialogTitle>
          <DialogDescription>Invite others to collaborate on this presentation.</DialogDescription>
        </DialogHeader>
        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="code">Share code</TabsTrigger>
            <TabsTrigger value="email">Invite by email</TabsTrigger>
          </TabsList>
          <TabsContent value="code" className="mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="code">Access code</Label>
                <div className="flex gap-2">
                  <Input
                    id="code"
                    value={presentation.accessCode}
                    readOnly
                    className="text-center font-mono text-lg tracking-wider"
                  />
                  <Button variant="outline" size="icon" onClick={handleCopyCode}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Share this code with others. They can join by entering it on the home page.
                </p>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="email" className="mt-4">
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colleague@example.com"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  {isCreator && <option value="creator">Creator</option>}
                </select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          {tab === "email" ? (
            <Button onClick={handleInvite} disabled={!email || !isCreator}>
              Send invitation
            </Button>
          ) : (
            <Button onClick={() => onOpenChange(false)}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

