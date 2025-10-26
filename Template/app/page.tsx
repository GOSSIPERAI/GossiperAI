import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Globe, Zap, Shield, Headphones, Languages, Volume2, Mic, Play, Pause } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { MainNavigation } from "@/components/main-navigation"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero Section */}
      <section className="relative py-12 sm:py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <div className="space-y-6 sm:space-y-8">
              <div className="space-y-3 sm:space-y-4">
                <Badge variant="secondary" className="w-fit text-xs sm:text-sm">
                  AI-Powered Accessibility
                </Badge>
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-balance leading-tight tracking-normal">
                  Real-Time Captions & Translation for <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Everyone</span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground text-pretty max-w-2xl leading-relaxed font-light">
                  Break down language barriers in education. Gossiper provides AI-powered real-time captioning and
                  translation, making classrooms accessible for deaf, hard-of-hearing, and international students.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Button size="lg" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8" asChild>
                  <Link href="/join-session">
                    Join a Session
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 bg-transparent" asChild>
                  <Link href="/create-session">Create Session</Link>
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 text-xs sm:text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Live in 50+ languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <span>Powered by Solana</span>
                </div>
              </div>
            </div>
            
            <div className="relative mt-8 lg:mt-0">
              <div className="relative bg-card border border-border rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-2xl">
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-card-foreground">Live Lecture - Physics 101</h3>
                    <Badge variant="secondary" className="text-xs w-fit">English → Yoruba</Badge>
                  </div>
                  <div className="space-y-2 sm:space-y-3">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Original:</p>
                      <p className="text-sm sm:text-base font-medium">&ldquo;Today we&apos;ll explore Newton&apos;s laws of motion...&rdquo;</p>
                    </div>
                    <div className="bg-accent/20 rounded-lg p-3 border border-accent">
                      <p className="text-xs sm:text-sm text-accent-foreground/70 mb-1">Translation:</p>
                      <p className="text-sm sm:text-base font-medium text-accent-foreground">
                        &ldquo;Loni a o yoo ṣawari awọn ofin Newton ti iṣipopada...&rdquo;
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs text-muted-foreground">
                    <span>12 students connected</span>
                    <span>₦50 pool goal: 80% funded</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 lg:py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-3 sm:space-y-4 mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-balance">Accessibility Meets Innovation</h2>
            <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty px-4">
              Gossiper combines cutting-edge AI with blockchain technology to create an inclusive educational experience
              for all students.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Languages className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Real-Time Translation</CardTitle>
                <CardDescription>
                  Instant translation to 50+ languages including Yoruba, French, Spanish, and more.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Sub-second latency ensures you never miss a word with our optimized AI pipeline.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Solana-Powered</CardTitle>
                <CardDescription>
                  Sustainable micro-payments via Solana Pay. Students contribute as little as ₦50 ($0.10).
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Collaborative Funding</CardTitle>
                <CardDescription>
                  Class pooling allows students to collectively fund sessions, making it affordable for everyone.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Beyond Classrooms</CardTitle>
                <CardDescription>
                  Perfect for conferences, corporate training, podcasts, and live streaming events.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Accessibility First</CardTitle>
                <CardDescription>
                  WCAG 2.1 AA compliant with high contrast modes, font scaling, and screen reader support.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-2xl sm:rounded-3xl p-6 sm:p-10 lg:p-16 text-center">
            <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary-foreground text-balance">
                Ready to Make Education Accessible?
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-primary-foreground/90 text-pretty px-2">
                Join thousands of students and educators already using Gossiper to break down barriers in learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-2">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8" asChild>
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  asChild
                >
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
