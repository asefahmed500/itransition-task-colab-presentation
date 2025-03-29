"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { X, Send, Plus, Copy, Check } from "lucide-react"
import type { Presentation } from "@/types/presentation"
import { useUser } from "@/hooks/use-user"
import { useToast } from "@/hooks/use-toast"

interface CollaborationPanelProps {
  presentation: Presentation
  onClose: () => void
}

export function CollaborationPanel({ presentation, onClose }: CollaborationPanelProps) {
  const { userId, userName } = useUser()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("collaborators")
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<any[]>([])
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteRole, setInviteRole] = useState("viewer")
  const [copied, setCopied] = useState(false)

  // Simulate chat messages
  useEffect(() => {
    if (presentation.collaborators && presentation.collaborators.length > 0) {
      setMessages([
        {
          id: 1,
          user: presentation.collaborators[0],
          text: "I've updated the introduction slide with the new data.",
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
        },
        {
          id: 2,
          user: presentation.collaborators.length > 1 ? presentation.collaborators[1] : presentation.collaborators[0],
          text: "Looks good! Can we add a graph to slide 3?",
          timestamp: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
        },
      ])
    }
  }, [presentation.collaborators])

  const handleSendMessage = () => {
    if (!message.trim()) return

    const newMessage = {
      id: messages.length + 1,
      user: presentation.collaborators.find((c) => c.userId === userId) || {
        userId,
        nickname: userName,
        role: "viewer",
      },
      text: message,
      timestamp: new Date().toISOString(),
    }

    setMessages([...messages, newMessage])
    setMessage("")
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
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
          nickname: inviteEmail.split("@")[0], // Use nickname instead of name
          role: inviteRole,
          invitedBy: userId,
        }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Invitation sent",
          description: `Invitation sent to ${inviteEmail} as ${inviteRole}`,
        })
        setInviteEmail("")
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

  const handleCopyLink = () => {
    navigator.clipboard.writeText(presentation.accessCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)

    toast({
      title: "Access code copied",
      description: "Share this code with others to collaborate",
    })
  }

  // Check if user is creator
  const isCreator = presentation.collaborators.find((c) => c.userId === userId)?.role === "creator"

  // Get safe initials for avatar
  const getInitials = (name: string | undefined): string => {
    if (!name) return "?"
    return name.charAt(0).toUpperCase()
  }

  return (
    <div className="flex w-80 flex-col border-l">
      <div className="flex items-center justify-between border-b p-4">
        <h2 className="text-lg font-medium">Collaboration</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="collaborators">Collaborators</TabsTrigger>
          <TabsTrigger value="chat">Chat</TabsTrigger>
        </TabsList>
        <TabsContent value="collaborators" className="flex flex-1 flex-col">
          <div className="p-4">
            <h3 className="mb-2 text-sm font-medium">Invite people</h3>
            <div className="grid gap-2">
              <Input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="Email address" />
              <div className="flex gap-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!isCreator}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  {isCreator && <option value="creator">Creator</option>}
                </select>
                <Button onClick={handleInvite} disabled={!inviteEmail || !isCreator}>
                  <Plus className="mr-1 h-4 w-4" />
                  Invite
                </Button>
              </div>
            </div>
            <div className="mt-4">
              <h3 className="mb-2 text-sm font-medium">Or share access code</h3>
              <div className="flex gap-2">
                <Input
                  value={presentation.accessCode}
                  readOnly
                  className="text-center font-mono text-lg tracking-wider"
                />
                <Button variant="outline" size="icon" onClick={handleCopyLink}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4">
            <h3 className="mb-2 text-sm font-medium">Current collaborators</h3>
            <div className="grid gap-2">
              {presentation.collaborators.map((collaborator) => (
                <div key={collaborator.userId} className="flex items-center justify-between rounded-md border p-2">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(collaborator.nickname)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium">{collaborator.nickname}</div>
                      <div className="text-xs text-muted-foreground">{collaborator.userId === userId ? "You" : ""}</div>
                    </div>
                  </div>
                  <Badge
                    variant={
                      collaborator.role === "creator"
                        ? "default"
                        : collaborator.role === "editor"
                          ? "secondary"
                          : "outline"
                    }
                  >
                    {collaborator.role}
                  </Badge>
                </div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="chat" className="flex flex-1 flex-col">
          <ScrollArea className="flex-1 p-4">
            <div className="grid gap-4">
              {messages.map((message) => (
                <div key={message.id} className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback>{getInitials(message.user.nickname)}</AvatarFallback>
                    </Avatar>
                    <div className="text-sm font-medium">{message.user.nickname}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </div>
                  <div className="ml-8 text-sm">{message.text}</div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
              />
              <Button variant="ghost" size="icon" onClick={handleSendMessage} disabled={!message.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

