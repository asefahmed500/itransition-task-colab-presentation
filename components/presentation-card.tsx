"use client"

import Link from "next/link"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Layers, Copy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface PresentationCardProps {
  id: string
  title: string
  description: string
  date: string
  users: number
  slides: number
  role: string
  accessCode: string
}

export function PresentationCard({
  id,
  title,
  description,
  date,
  users,
  slides,
  role,
  accessCode,
}: PresentationCardProps) {
  const { toast } = useToast()

  const handleCopyAccessCode = () => {
    navigator.clipboard.writeText(accessCode)
    toast({
      title: "Access code copied",
      description: "Share this code with others to collaborate",
    })
  }

  const getHref = () => {
    if (role === "creator" || role === "editor") {
      return `/editor/${id}`
    } else {
      return `/present/${id}/view`
    }
  }

  const getRoleBadgeVariant = () => {
    switch (role) {
      case "creator":
        return "default"
      case "editor":
        return "secondary"
      default:
        return "outline"
    }
  }

  return (
    <Card className="overflow-hidden">
      <Link href={getHref()}>
        <CardHeader className="p-4">
          <div className="flex items-center justify-between">
            <CardTitle className="line-clamp-1">{title}</CardTitle>
            <Badge variant={getRoleBadgeVariant()}>{role}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Link>
      <CardFooter className="flex items-center justify-between border-t p-4">
        <div className="text-xs text-muted-foreground">{date}</div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            <span className="text-xs">{users}</span>
          </div>
          <div className="flex items-center gap-1">
            <Layers className="h-3.5 w-3.5" />
            <span className="text-xs">{slides}</span>
          </div>
          {role === "creator" && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleCopyAccessCode()
              }}
              title="Copy access code"
            >
              <Copy className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}

