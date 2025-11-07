"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Calendar, Clock, DollarSign, Languages, BarChart3, Users } from "lucide-react"
import { USER_ROLES } from "@/lib/constants"

interface StatsCardProps {
  icon: React.ReactNode
  title: string
  value: string | number
}

function StatsCard({ icon, title, value }: StatsCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

interface DashboardStatsProps {
  userRole: string
  stats: {
    totalSessions: number
    totalHours?: number
    totalStudents?: number
    totalEarnings?: number
    totalContributions?: number
    favoriteLanguage?: string
    avgEngagement?: number
  }
}

export function DashboardStats({ userRole, stats }: DashboardStatsProps) {
  if (userRole === USER_ROLES.LECTURER) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Sessions"
          value={stats.totalSessions}
          icon={<Calendar className="h-8 w-8 text-primary" />}
        />
        <StatsCard
          title="Total Students"
          value={stats.totalStudents || 0}
          icon={<Users className="h-8 w-8 text-primary" />}
        />
        <StatsCard
          title="Total Earnings"
          value={`${stats.totalEarnings || 0} SOL`}
          icon={<DollarSign className="h-8 w-8 text-primary" />}
        />
        <StatsCard
          title="Avg Engagement"
          value={`${stats.avgEngagement || 0}%`}
          icon={<BarChart3 className="h-8 w-8 text-primary" />}
        />
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Sessions Attended"
        value={stats.totalSessions}
        icon={<Calendar className="h-8 w-8 text-primary" />}
      />
      <StatsCard
        title="Learning Hours"
        value={`${stats.totalHours || 0}h`}
        icon={<Clock className="h-8 w-8 text-primary" />}
      />
      <StatsCard
        title="Contributions"
        value={`${stats.totalContributions || 0} SOL`}
        icon={<DollarSign className="h-8 w-8 text-primary" />}
      />
      <StatsCard
        title="Preferred Language"
        value={stats.favoriteLanguage || "English"}
        icon={<Languages className="h-8 w-8 text-primary" />}
      />
    </div>
  )
}