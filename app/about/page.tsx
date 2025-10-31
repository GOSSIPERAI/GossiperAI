import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Globe, Target, ArrowRight, Award, TrendingUp } from "lucide-react"
import Link from "next/link"
import { MainNavigation } from "@/components/main-navigation"

const founder = "Agbaje Melody";
const team = [
  {
    name: `${founder}`,
    role: "Founder & CEO",
    bio: "Former accessibility researcher at University of Lagos with 10+ years in educational technology.",
    image: "/melody.jpg",
  },
  {
    name: "Arixe",
    role: "Backend Developer",
    bio: 
    `Professional backend developer, Arixe is a passionate and resiliant developer that not only writes efficient code,
     but also is soft spoken and communicates greatly`,
    image: "/Arixe.jpg",
  },
  {
    name: "Victory",
    role: "Business Developer",
    bio: "Growth-driven Business Developer specializing in lead generation, client acquisition, and long-term relationship management.",
    image: "/Victory.jpg",
  },
  {
    name:'Hikaru',
    role:"Frontend Developer",
    bio:
    `Passionate Frontend Developer turning ideas into sleek, interactive interfaces with clean code and great design.`,
    image:'/Hikaru.jpg',
  }
]

const stats = [
  { label: "Students Served", value: "50,000+", icon: Users },
  { label: "Languages Supported", value: "50+", icon: Globe },
  { label: "Sessions Completed", value: "100,000+", icon: TrendingUp },
  { label: "Accuracy Rate", value: "99.2%", icon: Award },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              Our Story
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance text-foreground">
              Breaking Down <span className="text-primary">Language Barriers</span> in Education
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Gossiper was born from a simple belief: every student deserves equal access to
              education, regardless of their hearing ability or native language.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/30 text-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-primary" />
                  </div>
                  <h2 className="text-3xl font-bold">Our Mission</h2>
                </div>
                <p className="text-lg text-muted-foreground text-pretty">
                  To make education universally accessible by providing real-time AI-powered captions and translations
                  that break down language and hearing barriers in classrooms worldwide.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Why We Started</h3>
                </div>
                <p className="text-muted-foreground">
                  Our founder, {founder}, witnessed firsthand how language barriers and hearing difficulties
                  prevented brilliant students from reaching their full potential. Traditional solutions were expensive,
                  slow, and often unavailable in developing regions.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Globe className="h-4 w-4 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">Global Impact</h3>
                </div>
                <p className="text-muted-foreground">
                  Today, we serve students across Africa, Asia, and beyond, with special focus on indigenous languages
                  like Yoruba, Hausa, and Swahili that are often overlooked by mainstream technology platforms.
                </p>
              </div>
            </div>

            <div className="relative">
              <div className="bg-card border border-border rounded-2xl p-8 shadow-xl">
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold text-center">Impact by Numbers</h3>
                  <div className="grid grid-cols-2 gap-6">
                    {stats.map((stat) => {
                      const Icon = stat.icon
                      return (
                        <div key={stat.label} className="text-center space-y-2">
                          <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="h-6 w-6 text-primary" />
                          </div>
                          <div className="text-2xl font-bold">{stat.value}</div>
                          <div className="text-sm text-muted-foreground">{stat.label}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance text-foreground">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              A diverse group of educators, technologists, and accessibility advocates working together to democratize
              education.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {team.map((member) => (
              <Card key={member.name} className="border-border text-center">
                <CardHeader className="pb-4">
                  <div className="mx-auto h-32 w-32 rounded-full overflow-hidden mb-4">
                    <img
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardTitle className="text-xl">{member.name}</CardTitle>
                  <CardDescription className="text-primary font-medium">{member.role}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm">{member.bio}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance text-foreground">Our Values</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              The principles that guide everything we do.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-primary" />
                  <span>Accessibility First</span>
                </CardTitle>
                <CardDescription>
                  Every feature we build prioritizes accessibility and inclusion from day one.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Cultural Respect</span>
                </CardTitle>
                <CardDescription>
                  We celebrate linguistic diversity and ensure accurate representation of all cultures.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>Community Driven</span>
                </CardTitle>
                <CardDescription>
                  Our roadmap is shaped by feedback from students, educators, and accessibility advocates.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span>Continuous Innovation</span>
                </CardTitle>
                <CardDescription>
                  We constantly push the boundaries of what's possible with AI and accessibility technology.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-primary" />
                  <span>Quality Excellence</span>
                </CardTitle>
                <CardDescription>
                  We maintain the highest standards for accuracy, reliability, and user experience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <span>Sustainable Growth</span>
                </CardTitle>
                <CardDescription>
                  We build for the long term, ensuring our platform remains accessible and affordable.
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
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground text-balance">Join Our Mission</h2>
              <p className="text-xl text-primary-foreground/90 text-pretty">
                Whether you're a student, educator, or accessibility advocate, there's a place for you in our community
                working toward universal educational access.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" className="text-lg px-8 " asChild>
                  <Link href="/signup">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent hover:text-foreground"
                  asChild
                >
                  <Link href="/careers">Join Our Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Gossiper. All rights reserved. Making education accessible worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
