"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { AuthGuard } from "@/components/auth-guard"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Circle,
  Trophy,
  BookOpen,
  ExternalLink,
} from "lucide-react"

type Assignment = {
  id: string
  title: string
  prompt: string
  max_score: number
  submission: {
    status: string
    ai_score: number | null
    ai_strengths: string[] | null
    ai_corrections: string[] | null
    ai_suggested_improvement: string | null
  } | null
}

type Quiz = {
  id: string
  title: string
  pass_mark_percent: number
  bestAttempt: { score_percent: number; passed: boolean } | null
  attemptCount: number
}

type Resource = {
  id: string
  title: string
  url: string
  resource_type: string
}

type ModuleDetail = {
  id: string
  title: string
  description: string | null
  pass_mark_percent: number
}

type LeaderboardEntry = {
  rank: number
  name: string
  averagePercent: number
  isCurrentUser: boolean
}

export default function AcademyModuleDetailPage({ params }: { params: { id: string } }) {
  const { id } = params
  return (
    <AuthGuard requireAuth>
      <ModuleDetail moduleId={id} />
    </AuthGuard>
  )
}

function ModuleDetail({ moduleId }: { moduleId: string }) {
  const [module, setModule] = useState<ModuleDetail | null>(null)
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [resources, setResources] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [leaderboardLoaded, setLeaderboardLoaded] = useState(false)

  const [activeAssignment, setActiveAssignment] = useState<Assignment | null>(null)
  const [submissionText, setSubmissionText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [activeQuizId, setActiveQuizId] = useState<string | null>(null)

  async function loadModule() {
    setIsLoading(true)
    try {
      const res = await fetch(`/api/academy/modules/${moduleId}`)
      const data = await res.json()
      if (res.ok) {
        setModule(data.module)
        setAssignments(data.assignments || [])
        setQuizzes(data.quizzes || [])
        setResources(data.resources || [])
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadModule()
  }, [moduleId])

  async function loadLeaderboard() {
    if (leaderboardLoaded) return
    const res = await fetch(`/api/academy/leaderboard?moduleId=${moduleId}`)
    const data = await res.json()
    if (res.ok) setLeaderboard(data.leaderboard || [])
    setLeaderboardLoaded(true)
  }

  async function handleSubmitAssignment() {
    if (!activeAssignment || !submissionText.trim()) return
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/academy/assignments/${activeAssignment.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: submissionText }),
      })
      if (res.ok) {
        await loadModule()
        setActiveAssignment(null)
        setSubmissionText("")
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground gap-2">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading module…
      </div>
    )
  }

  if (!module) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground">
        Module not found.
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link
            href="/academy"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mb-2"
          >
            <ArrowLeft className="h-3 w-3" /> Back to modules
          </Link>
          <h1 className="text-lg font-semibold">{module.title}</h1>
          <p className="text-xs text-muted-foreground">
            Pass mark {module.pass_mark_percent}% · {module.description}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-3xl">
        <Tabs defaultValue="work" onValueChange={(v) => v === "leaderboard" && loadLeaderboard()}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="work">Work</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          </TabsList>

          {/* WORK TAB */}
          <TabsContent value="work" className="space-y-3 mt-4">
            {assignments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No assignments in this module yet.</p>
            ) : (
              assignments.map((a) => {
                const marked = a.submission?.status === "marked"
                return (
                  <Card key={a.id}>
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-start gap-3 min-w-0">
                        {marked ? (
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">{a.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {marked
                              ? `Marked · Scored ${a.submission?.ai_score}/${a.max_score}`
                              : a.submission?.status === "submitted"
                                ? "Submitted, grading…"
                                : a.submission?.status === "error"
                                  ? "Submitted — grading needs a retry"
                                  : "Not submitted yet"}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={marked ? "outline" : "default"}
                        onClick={() => {
                          setActiveAssignment(a)
                          setSubmissionText("")
                        }}
                      >
                        {marked ? "View Feedback" : "Submit"}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </TabsContent>

          {/* QUIZZES TAB */}
          <TabsContent value="quizzes" className="space-y-3 mt-4">
            {quizzes.length === 0 ? (
              <p className="text-sm text-muted-foreground">No quizzes in this module yet.</p>
            ) : (
              quizzes.map((q) => (
                <Card key={q.id}>
                  <CardContent className="p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-medium">{q.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {q.bestAttempt
                          ? `Best score: ${q.bestAttempt.score_percent}% · ${
                              q.bestAttempt.passed ? "Passed" : "Not yet passed"
                            }`
                          : `Pass mark ${q.pass_mark_percent}% · Not attempted`}
                      </p>
                    </div>
                    <Button size="sm" onClick={() => setActiveQuizId(q.id)}>
                      {q.bestAttempt ? "Retake" : "Take Quiz"}
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* RESOURCES TAB */}
          <TabsContent value="resources" className="space-y-3 mt-4">
            {resources.length === 0 ? (
              <p className="text-sm text-muted-foreground">No resources added yet.</p>
            ) : (
              resources.map((r) => (
                <a key={r.id} href={r.url} target="_blank" rel="noopener noreferrer">
                  <Card className="hover:border-primary/50 transition-colors">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{r.title}</span>
                        <Badge variant="secondary" className="text-[10px] capitalize">
                          {r.resource_type}
                        </Badge>
                      </div>
                      <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </a>
              ))
            )}
          </TabsContent>

          {/* LEADERBOARD TAB */}
          <TabsContent value="leaderboard" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy className="h-4 w-4 text-primary" />
                  <span className="text-sm font-semibold">Module Leaderboard</span>
                </div>
                {leaderboard.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No scores yet for this module.</p>
                ) : (
                  <div className="divide-y divide-border">
                    {leaderboard.map((entry) => (
                      <div
                        key={entry.rank}
                        className={`flex items-center gap-3 py-2 text-sm ${
                          entry.isCurrentUser ? "font-semibold text-primary" : ""
                        }`}
                      >
                        <span className="w-6 text-primary font-bold">{entry.rank}</span>
                        <span className="flex-1">{entry.name}</span>
                        <span className="font-semibold">{entry.averagePercent}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Assignment Submit / Feedback Dialog */}
      <Dialog open={!!activeAssignment} onOpenChange={(open) => !open && setActiveAssignment(null)}>
        <DialogContent className="max-w-lg">
          {activeAssignment && (
            <>
              <DialogHeader>
                <DialogTitle>{activeAssignment.title}</DialogTitle>
              </DialogHeader>

              {activeAssignment.submission?.status === "marked" ? (
                <div className="space-y-3 text-sm">
                  <p className="font-semibold">
                    Score: {activeAssignment.submission.ai_score}/{activeAssignment.max_score}
                  </p>
                  {activeAssignment.submission.ai_strengths && (
                    <div>
                      <p className="font-medium mb-1">Strengths</p>
                      <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                        {activeAssignment.submission.ai_strengths.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeAssignment.submission.ai_corrections && (
                    <div>
                      <p className="font-medium mb-1">Corrections</p>
                      <ul className="list-disc pl-5 text-muted-foreground space-y-0.5">
                        {activeAssignment.submission.ai_corrections.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeAssignment.submission.ai_suggested_improvement && (
                    <div>
                      <p className="font-medium mb-1">Suggested Improvement</p>
                      <p className="text-muted-foreground">
                        {activeAssignment.submission.ai_suggested_improvement}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{activeAssignment.prompt}</p>
                  <Textarea
                    value={submissionText}
                    onChange={(e) => setSubmissionText(e.target.value)}
                    placeholder="Write your answer here…"
                    className="min-h-[160px]"
                  />
                  <DialogFooter>
                    <Button
                      onClick={handleSubmitAssignment}
                      disabled={!submissionText.trim() || isSubmitting}
                    >
                      {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                      Submit for Grading
                    </Button>
                  </DialogFooter>
                </>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Quiz Dialog */}
      {activeQuizId && (
        <QuizDialog
          quizId={activeQuizId}
          onClose={() => setActiveQuizId(null)}
          onComplete={loadModule}
        />
      )}
    </div>
  )
}

function QuizDialog({
  quizId,
  onClose,
  onComplete,
}: {
  quizId: string
  onClose: () => void
  onComplete: () => void
}) {
  const [quiz, setQuiz] = useState<{ title: string; pass_mark_percent: number } | null>(null)
  const [questions, setQuestions] = useState<{ id: string; question: string; options: string[] }[]>([])
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<{ scorePercent: number; passed: boolean; results: { questionId: string; isCorrect: boolean; explanation: string | null }[] } | null>(null)

  useEffect(() => {
    fetch(`/api/academy/quizzes/${quizId}`)
      .then((res) => res.json())
      .then((data) => {
        setQuiz(data.quiz)
        setQuestions(data.questions || [])
      })
      .finally(() => setIsLoading(false))
  }, [quizId])

  async function handleSubmitQuiz() {
    setIsSubmitting(true)
    try {
      const res = await fetch(`/api/academy/quizzes/${quizId}/attempt`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      })
      const data = await res.json()
      if (res.ok) {
        setResult(data)
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open onOpenChange={(open) => !open && (onClose(), onComplete())}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-6">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading quiz…
          </div>
        ) : result ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {result.passed ? "🎉 Passed!" : "Keep practicing"} — {result.scorePercent}%
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 text-sm">
              {questions.map((q, i) => {
                const r = result.results.find((res) => res.questionId === q.id)
                return (
                  <div key={q.id} className="border border-border rounded-lg p-3">
                    <p className="font-medium mb-1">
                      {i + 1}. {q.question}
                    </p>
                    <p className={r?.isCorrect ? "text-primary" : "text-destructive"}>
                      {r?.isCorrect ? "Correct" : "Incorrect"}
                    </p>
                    {r?.explanation && (
                      <p className="text-muted-foreground text-xs mt-1">{r.explanation}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>{quiz?.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5">
              {questions.map((q, i) => (
                <div key={q.id}>
                  <p className="text-sm font-medium mb-2">
                    {i + 1}. {q.question}
                  </p>
                  <RadioGroup
                    value={answers[q.id]?.toString()}
                    onValueChange={(v) => setAnswers((prev) => ({ ...prev, [q.id]: Number(v) }))}
                  >
                    {q.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <RadioGroupItem value={idx.toString()} id={`${q.id}-${idx}`} />
                        <Label htmlFor={`${q.id}-${idx}`} className="text-sm font-normal">
                          {opt}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(answers).length < questions.length || isSubmitting}
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                Submit Quiz
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
