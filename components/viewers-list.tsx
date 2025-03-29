import { Avatar, AvatarFallback } from "@/components/ui/avatar"

interface ViewersListProps {
  viewers: any[]
}

export function ViewersList({ viewers }: ViewersListProps) {
  return (
    <div>
      <h3 className="mb-2 text-sm font-medium">Current Viewers ({viewers.length})</h3>
      <div className="grid gap-2">
        {viewers.map((viewer) => (
          <div key={viewer.userId} className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback>{viewer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-sm">{viewer.name}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

