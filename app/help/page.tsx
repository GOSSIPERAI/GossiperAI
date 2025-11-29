import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, BookOpen, MessageCircle, Video, ArrowRight, HelpCircle, Settings, Users, Zap } from "lucide-react"
import Link from "next/link"
import { MainNavigation } from "@/components/main-navigation"

const categories = [
  {
    title: "Getting Started",
    description: "Learn the basics of using Gossiper",
    icon: BookOpen,
    articles: [
      "How to join your first session",
      "Setting up your Camp Network wallet",
      "Choosing your preferred language",
      "Understanding class pools",
    ],
  },
  {
    title: "For Students",
    description: "Student-specific guides and tips",
    icon: Users,
    articles: [
      "Joining sessions with access codes",
      "Customizing caption appearance",
      "Contributing to class pools",
      "Exporting session transcripts",
    ],
  },
  {
    title: "For Educators",
    description: "Teaching tools and session management",
    icon: Settings,
    articles: [
      "Creating your first session",
      "Managing student participants",
      "Setting up payment pools",
      "Analyzing session analytics",
    ],
  },
  {
    title: "Technical Support",
    description: "Troubleshooting and technical issues",
    icon: Zap,
    articles: [
      "Audio quality troubleshooting",
      "Connection and latency issues",
      "Browser compatibility guide",
      "Mobile app setup",
    ],
  },
]

const popularArticles = [
  {
    title: "How to join a session with an access code",
    category: "Getting Started",
    readTime: "2 min read",
  },
  {
    title: "Setting up your Camp Network wallet for payments",
    category: "Payments",
    readTime: "5 min read",
  },
  {
    title: "Customizing caption fonts and colors",
    category: "Accessibility",
    readTime: "3 min read",
  },
  {
    title: "Creating your first captioned session",
    category: "For Educators",
    readTime: "4 min read",
  },
  {
    title: "Troubleshooting audio quality issues",
    category: "Technical",
    readTime: "6 min read",
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              Help Center
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance text-foreground">
              How can we <span className="text-primary">help you</span> today?
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Find answers to common questions, learn how to use Gossiper effectively, and get the support you need.
            </p>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search for help..."
                  className="pl-12 h-14 text-lg"
                />
                <Button className="absolute right-2 top-2 h-10 hover:bg-black">Search</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Video className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Watch Tutorials</CardTitle>
                <CardDescription>Step-by-step video guides for common tasks</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Live Chat Support</CardTitle>
                <CardDescription>Get instant help from our support team</CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <HelpCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-lg">Contact Support</CardTitle>
                <CardDescription>Submit a ticket for detailed assistance</CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Help Categories */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance text-foreground">Browse by Category</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Find the information you need organized by topic.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {categories.map((category) => {
              const Icon = category.icon
              return (
                <Card key={category.title} className="border-border hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">{category.title}</CardTitle>
                        <CardDescription>{category.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.articles.map((article) => (
                        <li key={article}>
                          <Link
                            href="#"
                            className="flex items-center justify-between text-muted-foreground hover:text-foreground transition-colors group"
                          >
                            <span>{article}</span>
                            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Popular Articles */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance text-foreground">Popular Articles</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              The most helpful articles Camp Networkd on community feedback.
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-4">
            {popularArticles.map((article, index) => (
              <Card key={article.title} className="border-border hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer">
                          {article.title}
                        </h3>
                        <div className="flex items-center space-x-3 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {article.category}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Support */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 lg:p-16 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground text-balance">Still Need Help?</h2>
              <p className="text-xl text-primary-foreground/90 text-pretty">
                Our support team is here to help you succeed. Get personalized assistance from accessibility and
                education experts.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8 " asChild>
                  <Link href="/contact">
                    Contact Support
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent hover:text-foreground"
                  asChild
                >
                  <Link href="/signup">Start Free Trial</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-muted-foreground">
            <p>&copy; 2024 Gossiper. All rights reserved. Here to help you succeed.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
