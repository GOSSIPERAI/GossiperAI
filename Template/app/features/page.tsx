import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import {
  Languages,
  Zap,
  Shield,
  Users,
  Globe,
  Headphones,
  Mic,
  Volume2,
  Search,
  Settings,
  Eye,
  Keyboard,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { MainNavigation } from "@/components/main-navigation"
import { Footer } from "@/components/footer"

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              Comprehensive Feature Set
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Everything You Need for <span className="text-primary">Accessible Education</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Gossiper combines cutting-edge AI technology with thoughtful design to create the most comprehensive
              real-time captioning and translation platform for education.
            </p>
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="/signup">
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Core Features</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Built from the ground up to support diverse learning environments and accessibility needs.
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
                  Instant translation to 50+ languages including Yoruba, French, Spanish, Arabic, and more. Sub-second
                  latency ensures you never miss a word.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Mic className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>AI-Powered Captions</CardTitle>
                <CardDescription>
                  Advanced speech recognition with 99%+ accuracy. Handles multiple speakers, accents, and technical
                  terminology with ease.
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
                  Optimized AI pipeline delivers captions in under 200ms. Real-time processing ensures seamless learning
                  experiences.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Solana-Powered Payments</CardTitle>
                <CardDescription>
                  Sustainable micro-payments via Solana Pay. Students contribute as little as ₦50 with minimal
                  transaction fees.
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
                  Class pooling allows students to collectively fund sessions, making premium features affordable for
                  everyone.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Multi-Platform Support</CardTitle>
                <CardDescription>
                  Works seamlessly across classrooms, conferences, podcasts, and live streaming. Responsive design
                  adapts to any device.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Advanced Features */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Advanced Capabilities</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Professional-grade features designed for serious educational environments.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Smart Search & Export</h3>
                </div>
                <p className="text-muted-foreground">
                  Search through live captions in real-time. Export transcripts in multiple formats for study notes and
                  accessibility compliance.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Volume2 className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Audio Enhancement</h3>
                </div>
                <p className="text-muted-foreground">
                  Advanced noise reduction and audio processing ensures clear captions even in challenging acoustic
                  environments.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Customizable Interface</h3>
                </div>
                <p className="text-muted-foreground">
                  Personalize font sizes, colors, positioning, and display preferences. Save settings across sessions
                  for consistent experience.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-6 shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Live Caption Controls</h3>
                    <Badge variant="secondary">Real-time</Badge>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Font Size</span>
                      <div className="flex space-x-1">
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <div className="h-2 w-2 rounded-full bg-primary"></div>
                        <div className="h-2 w-2 rounded-full bg-muted-foreground"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">High Contrast</span>
                      <div className="h-4 w-8 bg-primary rounded-full"></div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <span className="text-sm">Auto-scroll</span>
                      <div className="h-4 w-8 bg-primary rounded-full"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Accessibility Features */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Accessibility First</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              WCAG 2.1 AA compliant with comprehensive accessibility features for all users.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Visual Accessibility</CardTitle>
                <CardDescription>
                  High contrast modes, customizable font sizes, color-blind friendly palettes, and focus indicators for
                  optimal visibility.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Screen Reader Support</CardTitle>
                <CardDescription>
                  Full compatibility with NVDA, JAWS, and VoiceOver. Live regions announce new captions without
                  interrupting navigation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Keyboard className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Keyboard Navigation</CardTitle>
                <CardDescription>
                  Complete keyboard accessibility with logical tab order, skip links, and customizable keyboard
                  shortcuts for power users.
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
                Ready to Transform Your Classroom?
              </h2>
              <p className="text-xl text-primary-foreground/90 text-pretty">
                Join educators worldwide who are making their content accessible to every student.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                  <Link href="/signup">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  asChild
                >
                  <Link href="/pricing">View Pricing</Link>
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
