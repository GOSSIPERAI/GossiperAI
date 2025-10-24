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
  const isCreator = userRole === "creator"

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
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-base sm:text-lg line-clamp-2 sm:line-clamp-1">{session.title}</CardTitle>
            <CardDescription className="text-xs sm:text-sm line-clamp-2">{session.description}</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`h-2 w-2 rounded-full flex-shrink-0 ${getStatusColor()}`}></div>
            <Badge variant={isActive ? "default" : "secondary"} className="text-xs">
              {session.status}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-2 gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <User className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{session.lecturer?.name || "Unknown Lecturer"}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{session.participants?.length || 0} joined</span>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span className="truncate">{formatDate(session.startTime)}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Languages className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
            <span>{session.availableLanguages?.length || 0} languages</span>
          </div>
        </div>

        {session.paymentPool && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2 text-xs sm:text-sm">
            <div className="flex items-center space-x-2 text-muted-foreground">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
              <span>Pool: ₦{(session.paymentPool.currentAmount / 100).toFixed(0)}</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {Math.round((session.paymentPool.currentAmount / session.paymentPool.goalAmount) * 100)}% funded
            </span>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          {isActive && (
            <Button asChild className="flex-1" size="sm">
              <Link href={`/session/${session.id}`} className="flex items-center justify-center">
                <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="text-xs sm:text-sm">{isCreator ? "Start Session" : "Join Live"}</span>
              </Link>
            </Button>
          )}
          {isScheduled && (
            <Button asChild variant="outline" className="flex-1" size="sm">
              <Link href={`/session/${session.id}`} className="flex items-center justify-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                <span className="text-xs sm:text-sm">View Details</span>
              </Link>
            </Button>
          )}
          {isEnded && (
            <Button asChild variant="outline" className="flex-1" size="sm">
              <Link href={`/session/${session.id}/replay`} className="flex items-center justify-center">
                <span className="text-xs sm:text-sm">Replay</span>
              </Link>
            </Button>
          )}
          {isCreator && (
            <Button asChild variant="outline" size="sm" className="sm:w-auto">
              <Link href={`/session/${session.id}/manage`} className="flex items-center justify-center">
                <span className="text-xs sm:text-sm">Manage</span>
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
