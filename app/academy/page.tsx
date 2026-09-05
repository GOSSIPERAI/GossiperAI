"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { GraduationCap, Loader2, ChevronRight, UploadCloud, Plus } from "lucide-react"

type ModuleSummary = {
  id: string
  title: string
  description: string | null
  syllabus_topic: string
  order_index: number
  pass_mark_percent: number
  totalAssignments: number
  markedCount: number
  averagePercent: number
  inProgress: boolean
}

export default function AcademyPage() {
  return (
    <AuthGuard requireAuth>
      <AcademyModulesList />
    </AuthGuard>
  )
}

function AcademyModulesList() {
  const [modules, setModules] = useState<ModuleSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/academy/modules")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error)
        } else {
          setModules(data.modules || [])
        }
      })
      .catch(() => setError("Failed to load modules"))
      .finally(() => setIsLoading(false))
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <GraduationCap className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground leading-tight">Web3 Academy</h1>
              <p className="text-xs text-muted-foreground">Your modules, video lectures, and progress</p>
            </div>
          </div>

          <Button asChild className="flex items-center gap-2">
            <Link href="/academy/upload">
              <UploadCloud className="h-4 w-4" /> Upload / Create Course
            </Link>
          </Button>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isLoading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading modules…
          </div>
        ) : error ? (
          <p className="text-sm text-destructive">{error}</p>
        ) : modules.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <p className="text-muted-foreground">No course modules found yet.</p>
            <Button asChild>
              <Link href="/academy/upload">
                <Plus className="h-4 w-4 mr-2" /> Upload Your First Course
              </Link>
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {modules.map((mod) => (
              <Link key={mod.id} href={`/academy/${mod.id}`}>
                <Card className="h-full hover:border-primary/50 transition-colors cursor-pointer">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                        Module {mod.order_index}
                      </span>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{mod.title}</h3>
                    <p className="text-xs text-muted-foreground mb-4 line-clamp-2 flex-1">
                      {mod.description}
                    </p>

                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-muted-foreground">Average</span>
                      <span className="font-semibold">
                        {mod.markedCount > 0 ? `${mod.averagePercent}%` : "—"}
                      </span>
                    </div>
                    <Progress value={mod.averagePercent} className="h-1.5 mb-3" />

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {mod.markedCount} of {mod.totalAssignments} marked
                      </span>
                      <Badge variant="secondary" className="text-[10px]">
                        {mod.markedCount === 0
                          ? "Not started"
                          : mod.markedCount >= mod.totalAssignments && mod.totalAssignments > 0
                            ? "Completed"
                            : "In progress"}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}