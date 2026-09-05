"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AuthGuard } from "@/components/auth-guard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ProtectedMediaPlayer } from "@/components/protected-media-player"
import {
  UploadCloud,
  FileVideo,
  FileText,
  Sparkles,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  Lock,
  Plus,
  Trash2,
} from "lucide-react"

type UploadedResource = {
  title: string
  url: string
  resource_type: "video" | "doc" | "article" | "tool"
  originalName: string
}

type LessonItem = {
  title: string
  content: string
}

export default function CourseUploadPage() {
  return (
    <AuthGuard requireAuth>
      <CourseUploadForm />
    </AuthGuard>
  )
}

function CourseUploadForm() {
  const router = useRouter()
  const [creationMode, setCreationMode] = useState<"upload" | "ai">("upload")

  // Course Metadata
  const [title, setTitle] = useState("")
  const [syllabusTopic, setSyllabusTopic] = useState("")
  const [description, setDescription] = useState("")
  const [passMark, setPassMark] = useState(70)

  // Media & File Upload state
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedResources, setUploadedResources] = useState<UploadedResource[]>([])
  const [resourceTitle, setResourceTitle] = useState("")

  // Lessons list
  const [lessons, setLessons] = useState<LessonItem[]>([])
  const [newLessonTitle, setNewLessonTitle] = useState("")
  const [newLessonContent, setNewLessonContent] = useState("")

  // AI Prompt state
  const [aiCurriculumPrompt, setAiCurriculumPrompt] = useState("")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  // Status & Errors
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  // Handle File Upload to /api/academy/upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const res = await fetch("/api/academy/upload", {
        method: "POST",
        body: formData,
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to upload course file")
      }

      const newResource: UploadedResource = {
        title: resourceTitle.trim() || file.name,
        url: data.file.url,
        resource_type: data.file.fileType === "video" ? "video" : "doc",
        originalName: data.file.originalName,
      }

      setUploadedResources((prev) => [...prev, newResource])
      setResourceTitle("")
      setSuccessMsg(`Successfully uploaded ${file.name}`)
      setTimeout(() => setSuccessMsg(null), 4000)
    } catch (err: any) {
      setError(err.message || "Failed to upload file")
    } finally {
      setIsUploading(false)
    }
  }

  // Remove resource
  const handleRemoveResource = (index: number) => {
    setUploadedResources((prev) => prev.filter((_, i) => i !== index))
  }

  // Add lesson item
  const handleAddLesson = () => {
    if (!newLessonTitle.trim()) return
    setLessons((prev) => [...prev, { title: newLessonTitle.trim(), content: newLessonContent.trim() }])
    setNewLessonTitle("")
    setNewLessonContent("")
  }

  // Remove lesson item
  const handleRemoveLesson = (index: number) => {
    setLessons((prev) => prev.filter((_, i) => i !== index))
  }

  // Generate AI Course
  const handleGenerateAICourse = async () => {
    if (!aiCurriculumPrompt.trim()) {
      setError("Please enter your course curriculum outline")
      return
    }
    setIsGeneratingAI(true)
    setError(null)

    try {
      // Create course populated from AI curriculum prompt
      const res = await fetch("/api/academy/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title || "AI Generated Web3 Course",
          syllabus_topic: syllabusTopic || "Custom AI Curriculum",
          description: description || aiCurriculumPrompt,
          pass_mark_percent: passMark,
          lessons: [
            {
              title: "Module 1 Overview & Foundations",
              content: `### AI Generated Syllabus\n\n${aiCurriculumPrompt}`,
            },
          ],
        }),
      })

      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || "Failed to generate course")

      router.push(`/academy/${data.module.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to generate course")
    } finally {
      setIsGeneratingAI(false)
    }
  }

  // Submit Manual Upload Course
  const handleSubmitCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !syllabusTopic.trim()) {
      setError("Course Title and Syllabus Topic are required.")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const res = await fetch("/api/academy/modules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          syllabus_topic: syllabusTopic.trim(),
          description: description.trim() || null,
          pass_mark_percent: passMark,
          lessons: lessons,
          resources: uploadedResources,
        }),
      })

      const data = await res.json()

      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to create course module")
      }

      router.push(`/academy/${data.module.id}`)
    } catch (err: any) {
      setError(err.message || "Failed to create course")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/academy"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Academy
            </Link>
            <h1 className="text-lg font-semibold border-l border-border pl-3">Course Upload Studio</h1>
          </div>
          <Badge variant="outline" className="flex items-center gap-1 text-xs">
            <Lock className="h-3 w-3 text-amber-500" /> Non-Downloadable Storage
          </Badge>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl">
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {successMsg && (
          <Alert className="mb-6 border-green-500/50 bg-green-500/10 text-green-600 dark:text-green-400">
            <CheckCircle2 className="h-4 w-4" />
            <AlertDescription>{successMsg}</AlertDescription>
          </Alert>
        )}

        <Tabs
          defaultValue="upload"
          onValueChange={(val) => setCreationMode(val as "upload" | "ai")}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <UploadCloud className="h-4 w-4" /> Upload Videos & Files (Non-Downloadable)
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Generate via AI Curriculum
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: UPLOAD VIDEOS & FILES */}
          <TabsContent value="upload">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Upload Course Media & Files</CardTitle>
                <CardDescription>
                  Upload video lectures and course documents. Students can stream and view content, but direct downloading is disabled.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitCourse} className="space-y-6">
                  {/* Basic Course Information */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="courseTitle">Course Title *</Label>
                      <Input
                        id="courseTitle"
                        placeholder="e.g. Masterclass on Smart Contract Security"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="syllabusTopic">Syllabus Topic / Category *</Label>
                      <Input
                        id="syllabusTopic"
                        placeholder="e.g. 1. Security & Auditing"
                        value={syllabusTopic}
                        onChange={(e) => setSyllabusTopic(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="courseDesc">Course Description</Label>
                    <Textarea
                      id="courseDesc"
                      placeholder="Explain what students will learn in this course..."
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <div className="space-y-2 max-w-xs">
                    <Label htmlFor="passMark">Pass Mark Percentage (%)</Label>
                    <Input
                      id="passMark"
                      type="number"
                      min="50"
                      max="100"
                      value={passMark}
                      onChange={(e) => setPassMark(Number(e.target.value))}
                    />
                  </div>

                  <hr className="border-border" />

                  {/* Video & File Uploader Section */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-sm flex items-center gap-2">
                          <FileVideo className="h-4 w-4 text-primary" /> Course Videos & Files
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Supported files: Video (.mp4, .webm, .mov) and Documents (.pdf, .doc, .ppt, .txt)
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                      <div className="sm:col-span-2 space-y-1">
                        <Label htmlFor="resTitle" className="text-xs">Optional Display Title for Media</Label>
                        <Input
                          id="resTitle"
                          placeholder="e.g. Lecture 1 Video / Module PDF Guide"
                          value={resourceTitle}
                          onChange={(e) => setResourceTitle(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="fileUpload"
                          className="flex items-center justify-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                          {isUploading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <UploadCloud className="h-4 w-4" />
                          )}
                          {isUploading ? "Uploading…" : "Select & Upload"}
                        </Label>
                        <input
                          id="fileUpload"
                          type="file"
                          accept="video/*,.pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                          onChange={handleFileUpload}
                          disabled={isUploading}
                          className="hidden"
                        />
                      </div>
                    </div>

                    {/* List of Uploaded Media & Files */}
                    {uploadedResources.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <Label className="text-xs font-semibold">Uploaded Course Materials ({uploadedResources.length})</Label>
                        <div className="space-y-3">
                          {uploadedResources.map((res, idx) => (
                            <div key={idx} className="space-y-2 border border-border rounded-xl p-3 bg-card/60">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm font-medium">
                                  {res.resource_type === "video" ? (
                                    <FileVideo className="h-4 w-4 text-primary" />
                                  ) : (
                                    <FileText className="h-4 w-4 text-primary" />
                                  )}
                                  <span>{res.title}</span>
                                  <Badge variant="secondary" className="text-[10px] capitalize">
                                    {res.resource_type}
                                  </Badge>
                                </div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 text-destructive"
                                  onClick={() => handleRemoveResource(idx)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>

                              {/* Live Protected Media Preview */}
                              <ProtectedMediaPlayer
                                url={res.url}
                                title={res.title}
                                resourceType={res.resource_type}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <hr className="border-border" />

                  {/* Lessons List Section */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-sm">Course Lessons & Written Content</h3>
                      <p className="text-xs text-muted-foreground">Add text lessons or instructions for students</p>
                    </div>

                    <div className="space-y-3 bg-muted/40 p-4 rounded-xl border border-border">
                      <div className="space-y-2">
                        <Label className="text-xs">Lesson Title</Label>
                        <Input
                          placeholder="e.g. Introduction to Liquidity Pools"
                          value={newLessonTitle}
                          onChange={(e) => setNewLessonTitle(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs">Lesson Content (Markdown / Text)</Label>
                        <Textarea
                          placeholder="Lesson notes, explanation, or instructions..."
                          value={newLessonContent}
                          onChange={(e) => setNewLessonContent(e.target.value)}
                          rows={3}
                        />
                      </div>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={handleAddLesson}
                        disabled={!newLessonTitle.trim()}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add Lesson
                      </Button>
                    </div>

                    {lessons.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-xs font-semibold">Added Lessons ({lessons.length})</Label>
                        {lessons.map((l, i) => (
                          <div key={i} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card text-sm">
                            <div>
                              <span className="font-medium">Lesson {i + 1}: {l.title}</span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive"
                              onClick={() => handleRemoveLesson(i)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting || !title.trim() || !syllabusTopic.trim()}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Publishing Course…
                      </>
                    ) : (
                      "Publish Course"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 2: AI CURRICULUM GENERATION */}
          <TabsContent value="ai">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" /> AI Course Generator
                </CardTitle>
                <CardDescription>
                  Paste your course curriculum outline below and AI will structure your lessons and module outline automatically.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="aiTitle">Course Title</Label>
                    <Input
                      id="aiTitle"
                      placeholder="e.g. Advanced DeFi Protocol Design"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="aiTopic">Syllabus Category</Label>
                    <Input
                      id="aiTopic"
                      placeholder="e.g. 2. Decentralized Finance"
                      value={syllabusTopic}
                      onChange={(e) => setSyllabusTopic(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiPrompt">Curriculum Syllabus / Outline *</Label>
                  <Textarea
                    id="aiPrompt"
                    placeholder="Paste your curriculum outline here, e.g.:&#10;1. Introduction to Automated Market Makers&#10;2. Constant Product Formula (x * y = k)&#10;3. Impermanent Loss Calculations&#10;4. Yield Farming Strategies"
                    value={aiCurriculumPrompt}
                    onChange={(e) => setAiCurriculumPrompt(e.target.value)}
                    rows={8}
                  />
                </div>

                <Button
                  onClick={handleGenerateAICourse}
                  className="w-full"
                  disabled={isGeneratingAI || !aiCurriculumPrompt.trim()}
                >
                  {isGeneratingAI ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Generating Course Structure…
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" /> Generate & Publish Course
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
