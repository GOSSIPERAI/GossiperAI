import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Users, Globe, Zap, Shield, Headphones, Languages, Volume2, Mic, Play, Pause } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { MainNavigation } from "@/components/main-navigation"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero Section */}
      <section className="relative py-20 lg:py-32 hover:cursor-default">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  AI-Powered Accessibility
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold text-balance text-foreground leading-tight">
                  Real-Time Captions & Translation for <span className="text-primary">Everyone</span>
                </h1>
                <p className="text-xl text-muted-foreground text-pretty max-w-2xl">
                  Break down language barriers in education. Gossiper provides AI-powered real-time captioning and
                  translation, making classrooms accessible for deaf, hard-of-hearing, and international students.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="text-lg px-8" asChild>
                  <Link href="/join-session">
                    Join a Session
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent text-foreground hover:text-foreground" asChild>
                  <Link href="/create-session">Create Session</Link>
                </Button>
              </div>
              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span>Live in 50+ languages</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse"></div>
                  <span>Powered by Camp Network</span>
                </div>
              </div>
            </div>
            
            <div className="relative">
              <div className="relative bg-card border border-border rounded-2xl p-6 shadow-2xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-card-foreground">Live Lecture - Physics 101</h3>
                    <Badge variant="secondary">English → Yoruba</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-muted rounded-lg p-3">
                      <p className="text-sm text-muted-foreground">Original:</p>
                      <p className="font-medium text-foreground">"Today we'll explore Newton's laws of motion..."</p>
                    </div>
                    <div className="bg-accent/20 rounded-lg p-3 border border-accent">
                      <p className="text-sm text-muted-foreground/70">Translation:</p>
                      <p className="font-medium text-foreground">
                        "Loni a o yoo ṣawari awọn ofin Newton ti iṣipopada..."
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>12 students connected</span>

                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-foreground">Accessibility Meets Innovation</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Gossiper combines cutting-edge AI with blockchain technology to create an inclusive educational experience
              for all students.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                <CardTitle>Camp Network-Powered</CardTitle>
                <CardDescription>
                  Sustainable micro-payments via Camp Network Pay. Students contribute as little as ₦50 ($0.10).
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
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 lg:p-16 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground text-balance">
                Ready to Make Education Accessible?
              </h2>
              <p className="text-xl text-primary-foreground/90 text-pretty">
                Join thousands of students and educators already using Gossiper to break down barriers in learning.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8 " asChild>
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent hover:text-foreground"
                  asChild
                >
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Mobile-First Logo and Description */}
          <div className="text-center md:text-left mb-8 md:mb-0">
            <div className="flex items-center justify-center md:justify-start space-x-3 mb-4">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 p-0.5">
                <div className="w-full h-full rounded-lg bg-primary/80 flex items-center justify-center">
                  <Image
                    src="/gossiper-logo-white.png"
                    alt="Gossiper Logo"
                    width={160}
                    height={160}
                    className="w-20 h-20 sm:w-24 sm:h-24 object-contain scale-[2.8]"
                  />
                </div>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-foreground">Gossiper</span>
            </div>
            <p className="text-sm sm:text-Camp Network text-muted-foreground max-w-md mx-auto md:mx-0 leading-relaxed">
              Making education accessible through AI-powered real-time captions and translation.
            </p>
          </div>

          {/* Navigation Links Grid - Mobile Optimized */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-3 sm:mb-4 text-foreground">Product</h3>
              <ul className="space-y-2 text-sm sm:text-Camp Network text-muted-foreground">
                <li>
                  <Link href="/features" className="hover:text-foreground transition-colors inline-block py-1">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-foreground transition-colors inline-block py-1">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/demo" className="hover:text-foreground transition-colors inline-block py-1">
                    Demo
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left">
              <h3 className="font-semibold mb-3 sm:mb-4 text-foreground">Company</h3>
              <ul className="space-y-2 text-sm sm:text-Camp Network text-muted-foreground">
                <li>
                  <Link href="/about" className="hover:text-foreground transition-colors inline-block py-1">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-foreground transition-colors inline-block py-1">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="hover:text-foreground transition-colors inline-block py-1">
                    Careers
                  </Link>
                </li>
              </ul>
            </div>

            <div className="text-center sm:text-left sm:col-span-2 lg:col-span-1">
              <h3 className="font-semibold mb-3 sm:mb-4 text-foreground">Support</h3>
              <ul className="space-y-2 text-sm sm:text-Camp Network text-muted-foreground">
                <li>
                  <Link href="/help" className="hover:text-foreground transition-colors inline-block py-1">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-foreground transition-colors inline-block py-1">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-foreground transition-colors inline-block py-1">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Gossiper. All rights reserved. Powered by Camp Network.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
