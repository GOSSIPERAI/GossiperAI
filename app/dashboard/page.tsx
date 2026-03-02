import Link from "next/link"
import { ArrowRight, User, Users, Mic, HandMetal, Plus, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MainNavigation } from "@/components/main-navigation"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <MainNavigation />

      <div className="flex-1 container mx-auto px-4 py-16 flex flex-col justify-center items-center">
        <div className="text-center space-y-6 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Welcome Back
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose your mode to get started.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Personal Mode Card */}
          <Link href="/personal" className="group">
            <Card className="h-full border-2 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/50 backdrop-blur-sm cursor-pointer relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-bold">Personal Mode</CardTitle>
                <CardDescription className="text-base text-muted-foreground/80">
                  Direct communication assistant for daily life.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  <li className="flex items-center text-sm text-foreground/80">
                    <Mic className="w-4 h-4 mr-3 text-primary/70" />
                    Real-time Voice to Text
                  </li>
                  <li className="flex items-center text-sm text-foreground/80">
                    <HandMetal className="w-4 h-4 mr-3 text-primary/70" />
                    Sign Language Interpretation
                  </li>
                  <li className="flex items-center text-sm text-foreground/80">
                    <ArrowRight className="w-4 h-4 mr-3 text-primary/70" />
                    2-Way AI Translation
                  </li>
                </ul>
                <div className="pt-4">
                  <Button className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                    Start Personal Session
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* Events Mode Card */}
          <Link href="/events" className="group h-full block">
            <Card className="h-full border-2 hover:border-secondary transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card/50 backdrop-blur-sm relative overflow-hidden flex flex-col">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-secondary-foreground" />
                </div>
                <CardTitle className="text-2xl font-bold">Event Mode</CardTitle>
                <CardDescription className="text-base text-muted-foreground/80">
                  Broadcast captions for classrooms & events.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  <li className="flex items-center text-sm text-foreground/80">
                    <Mic className="w-4 h-4 mr-3 text-secondary-foreground/70" />
                    Lecturer / Host Broadcasting
                  </li>
                  <li className="flex items-center text-sm text-foreground/80">
                    <Users className="w-4 h-4 mr-3 text-secondary-foreground/70" />
                    Multi-user Sessions
                  </li>
                </ul>

                <div className="pt-4 grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                  <Button variant="outline" asChild className="group/host">
                    <Link href="/create-session">
                      <Plus className="mr-2 h-4 w-4 text-primary group-hover/host:scale-110 transition-transform" />
                      Host
                    </Link>
                  </Button>
                  <Button variant="default" asChild className="group/join">
                    <Link href="/join-session">
                      <LogIn className="mr-2 h-4 w-4 group-hover/join:translate-x-1 transition-transform" />
                      Join
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
