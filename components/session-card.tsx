import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Clock, Languages, Play, Calendar, User, DollarSign } from "lucide-react"
import Link from "next/link"
import type { Session } from "@/lib/types"

interface SessionCardProps {
  session: Session
  userRole?: string
}

export function SessionCard({ session, userRole }: SessionCardProps) {
  const isActive = session.status === "active"
  const isScheduled = session.status === "scheduled"
  const isEnded = session.status === "ended"

  const getStatusColor = () => {
    switch (session.status) {
      case "active":
        return "bg-green-500"
      case "scheduled":
        return "bg-blue-500"
      case "ended":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(date))
  }

  return (
    <Card className="border-border hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg line-clamp-1">{session.title}</CardTitle>
            <CardDescription className="line-clamp-2">{session.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full ${getStatusColor()}`}></div>
            <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
              {session.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4" />
            <span className="truncate">{session.lecturer?.name || "Unknown Lecturer"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>{session.participants?.length || 0} joined</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(session.startTime)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Languages className="h-4 w-4" />
            <span>{session.availableLanguages?.length || 0} languages</span>
          </div>
        </div>

        {session.paymentPool && (
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <DollarSign className="h-4 w-4" />
              <span>Pool: ₦{(session.paymentPool.currentAmount / 100).toFixed(0)}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((session.paymentPool.currentAmount / session.paymentPool.goalAmount) * 100)}% funded
            </span>
          </div>
        )}

        <div className="flex items-center space-x-2">
          {isActive && (
            <Button asChild className="flex-1">
              <Link href={`/session/${session.id}`}>
                <Play className="h-4 w-4 mr-2" />
                Join Live
              </Link>
            </Button>
          )}
          {isScheduled && (
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href={`/session/${session.id}`}>
                <Clock className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
          )}
          {isEnded && (
            <Button asChild variant="outline" className="flex-1 bg-transparent">
              <Link href={`/session/${session.id}/replay`}>Replay</Link>
            </Button>
          )}
          {userRole === "lecturer" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/session/${session.id}/manage`}>Manage</Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
