"use client"

import { AuthGuard } from "@/components/auth-guard"
import { MainNavigation } from "@/components/main-navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Users, ArrowRight, Mic, Calendar, Hash, Globe, Layers } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
import { Badge } from "@/components/ui/badge"

export default function EventsHubPage() {
    const { profile } = useAuth()

    // Simplified Mock data for the dashboard
    const recentSessions = [
        {
            id: "S-1049",
            title: "Introduction to Advanced Physics",
            date: "Today, 14:00 PM",
            role: "Host",
            participants: 45,
            status: "active",
        },
        {
            id: "S-0922",
            title: "Global React Summit 2026",
            date: "Yesterday, 10:00 AM",
            role: "Attendee",
            participants: 120,
            status: "ended",
        },
        {
            id: "S-0811",
            title: "Computer Science 201 - Seminar",
            date: "Feb 18, 09:00 AM",
            role: "Host",
            participants: 32,
            status: "ended",
        }
    ]

    return (
        <AuthGuard>
            <div className="min-h-screen bg-background flex flex-col">
                <MainNavigation />

                <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
                    <div className="max-w-6xl mx-auto space-y-12">

                        {/* Header */}
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-4">
                                <Badge variant="secondary" className="w-fit">Event Hub</Badge>
                                <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Manage Events</h1>
                                <p className="text-muted-foreground text-lg max-w-2xl">
                                    Easily join a classroom or host a live multilingual session to broadcast real-time translated captions directly to devices.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <Button size="lg" variant="outline" asChild className="group h-12 w-full sm:w-auto">
                                    <Link href="/join-session">
                                        <Hash className="mr-2 h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                                        Join with Code
                                    </Link>
                                </Button>
                                {profile?.role === 'lecturer' && (
                                    <Button size="lg" asChild className="h-12 shadow-md w-full sm:w-auto">
                                        <Link href="/create-session">
                                            <Plus className="mr-2 h-5 w-5" />
                                            Host New Event
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid lg:grid-cols-3 gap-8">
                            {/* Quick Actions Panel */}
                            <div className="space-y-6 lg:col-span-1">
                                <Card className="border-border bg-card/50 backdrop-blur shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Quick Actions</CardTitle>
                                        <CardDescription>Shortcut to your most used tools</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <Link href="/personal" className="block">
                                            <div className="group flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                                    <Mic className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">Personal Mode</h4>
                                                    <p className="text-sm text-muted-foreground">Start 1-on-1 translation</p>
                                                </div>
                                            </div>
                                        </Link>

                                        <Link href="/join-session" className="block">
                                            <div className="group flex items-center gap-4 p-4 rounded-xl border border-border hover:border-secondary/50 hover:bg-secondary/5 transition-all cursor-pointer">
                                                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                                                    <Users className="h-6 w-6 text-secondary group-hover:scale-110 transition-transform" />
                                                </div>
                                                <div>
                                                    <h4 className="font-semibold text-foreground group-hover:text-secondary transition-colors">Join Class</h4>
                                                    <p className="text-sm text-muted-foreground">Enter a live lecture code</p>
                                                </div>
                                            </div>
                                        </Link>
                                    </CardContent>
                                </Card>

                                <Card className="border-primary/20 bg-primary/5 overflow-hidden relative border">
                                    <div className="absolute top-0 right-0 p-4 opacity-[0.03]">
                                        <Globe className="h-32 w-32" />
                                    </div>
                                    <CardHeader className="relative z-10 pb-4">
                                        <CardTitle>Global Accessibility</CardTitle>
                                        <CardDescription className="text-foreground/80 pt-2">
                                            Every session you host supports over 50+ languages simultaneously via our advanced AI pipeline. Built entirely around making live audio accessible.
                                        </CardDescription>
                                    </CardHeader>
                                </Card>
                            </div>

                            {/* Recent Sessions List */}
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold flex items-center gap-2">
                                        <Layers className="h-6 w-6 text-primary" />
                                        Your Sessions
                                    </h2>
                                </div>

                                <div className="grid gap-4">
                                    {recentSessions.map((session, i) => (
                                        <Card key={i} className="hover:shadow-md transition-shadow border border-muted/80 flex flex-col sm:flex-row overflow-hidden group bg-card/60 backdrop-blur-sm">
                                            <div className="sm:w-2 bg-gradient-to-b from-primary/80 to-primary/20 h-2 sm:h-auto" />
                                            <div className="flex-1 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant={session.status === 'active' ? 'default' : 'secondary'} className={session.status === 'active' ? 'animate-pulse' : ''}>
                                                            {session.status.toUpperCase()}
                                                        </Badge>
                                                        <Badge variant="outline" className="text-muted-foreground font-mono">
                                                            {session.id}
                                                        </Badge>
                                                    </div>
                                                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">{session.title}</h3>
                                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                                                        <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {session.date}</span>
                                                        <span className="flex items-center gap-1.5"><Users className="h-4 w-4" /> {session.participants} Joined</span>
                                                        <span className="flex items-center gap-1.5 border px-2 border-border/50 py-0.5 rounded-md bg-muted/50 text-xs font-medium uppercase tracking-wider">{session.role}</span>
                                                    </div>
                                                </div>

                                                <div className="w-full sm:w-auto mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-border">
                                                    <Button
                                                        variant={session.status === 'active' ? 'default' : 'secondary'}
                                                        className="w-full sm:w-auto h-11"
                                                        asChild
                                                    >
                                                        <Link href={`/session/${session.id}`}>
                                                            {session.status === 'active' ? 'Rejoin Session' : 'View Logs'}
                                                            <ArrowRight className="ml-2 h-4 w-4" />
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Card>
                                    ))}

                                    {recentSessions.length === 0 && (
                                        <div className="text-center py-16 px-4 border-2 border-dashed border-border rounded-xl bg-card/50">
                                            <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Calendar className="h-8 w-8 text-muted-foreground opacity-50" />
                                            </div>
                                            <h3 className="text-xl font-medium text-foreground mb-2">No Recent Sessions</h3>
                                            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">You haven't hosted or joined any sessions recently.</p>
                                            <Button asChild>
                                                <Link href="/join-session">Find a Session</Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </div>

                        </div>
                    </div>
                </main>
            </div>
        </AuthGuard>
    )
}
