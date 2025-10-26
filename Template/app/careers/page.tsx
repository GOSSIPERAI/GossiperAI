"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  Heart, 
  Users, 
  Globe, 
  Target, 
  ArrowRight, 
  Award, 
  TrendingUp, 
  Briefcase,
  MapPin,
  Clock,
  Star,
  Zap,
  Shield,
  Coffee,
  BookOpen,
  Code,
  Palette,
  MessageCircle,
  BarChart3,
  Lightbulb,
  CheckCircle
} from "lucide-react"
import Link from "next/link"
import { MainNavigation } from "@/components/main-navigation"
import { Footer } from "@/components/footer"
import Image from "next/image"

const openPositions = [
  {
    id: "frontend-engineer",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    type: "Full-time",
    experience: "3-5 years",
    description: "Build beautiful, accessible user interfaces that make education more inclusive for students worldwide.",
    requirements: [
      "3+ years experience with React/Next.js",
      "Strong TypeScript skills",
      "Experience with accessibility standards (WCAG)",
      "Passion for inclusive design",
      "Experience with real-time applications"
    ],
    benefits: ["Competitive salary", "Flexible hours", "Learning budget", "Health insurance"],
    posted: "2 days ago",
    urgent: false
  },
  {
    id: "ui-ux-designer",
    title: "UI/UX Designer",
    department: "Design",
    location: "Remote",
    type: "Full-time", 
    experience: "2-4 years",
    description: "Design intuitive experiences that break down language barriers in education.",
    requirements: [
      "Portfolio showcasing accessible design",
      "Proficiency in Figma/Adobe Creative Suite",
      "Understanding of user research methods",
      "Experience with design systems",
      "Knowledge of accessibility principles"
    ],
    benefits: ["Design tools budget", "Conference attendance", "Mentorship program", "Creative freedom"],
    posted: "1 week ago",
    urgent: false
  },
  {
    id: "product-manager",
    title: "Product Manager",
    department: "Product",
    location: "Remote",
    type: "Full-time",
    experience: "4-6 years",
    description: "Lead product strategy for our AI-powered education platform.",
    requirements: [
      "4+ years product management experience",
      "Experience with B2B SaaS products",
      "Strong analytical and communication skills",
      "Background in education technology preferred",
      "Experience with agile development"
    ],
    benefits: ["Equity participation", "Leadership development", "Global team", "Impact-driven work"],
    posted: "3 days ago",
    urgent: true
  },
  {
    id: "marketing-manager",
    title: "Marketing Manager",
    department: "Marketing",
    location: "Remote",
    type: "Full-time",
    experience: "3-5 years",
    description: "Drive growth and awareness for our mission to democratize education.",
    requirements: [
      "3+ years digital marketing experience",
      "Experience with content marketing",
      "Social media strategy expertise",
      "Analytics and data-driven approach",
      "Experience in EdTech or SaaS preferred"
    ],
    benefits: ["Marketing budget", "Conference speaking opportunities", "Growth potential", "Remote-first culture"],
    posted: "5 days ago",
    urgent: false
  }
]

const values = [
  {
    icon: Heart,
    title: "Accessibility First",
    description: "We believe education should be accessible to everyone, regardless of language, ability, or location."
  },
  {
    icon: Users,
    title: "Inclusive Community",
    description: "We foster a diverse, inclusive environment where every voice is heard and valued."
  },
  {
    icon: Lightbulb,
    title: "Innovation",
    description: "We continuously push boundaries to create cutting-edge solutions for educational challenges."
  },
  {
    icon: Globe,
    title: "Global Impact",
    description: "Our work reaches students and educators across continents, making a real difference."
  }
]

const benefits = [
  {
    icon: Zap,
    title: "Flexible Work",
    description: "Remote-first culture with flexible hours and unlimited PTO"
  },
  {
    icon: Coffee,
    title: "Learning Budget",
    description: "$2,000 annual budget for courses, conferences, and professional development"
  },
  {
    icon: Shield,
    title: "Health & Wellness",
    description: "Comprehensive health insurance and mental health support"
  },
  {
    icon: BookOpen,
    title: "Growth Opportunities",
    description: "Clear career progression paths and mentorship programs"
  },
  {
    icon: Star,
    title: "Equity Participation",
    description: "Share in our success with competitive equity packages"
  },
  {
    icon: Users,
    title: "Team Events",
    description: "Annual team retreats and regular virtual team building activities"
  }
]

const hiringProcess = [
  {
    step: "1",
    title: "Application",
    description: "Submit your application with resume and portfolio/code samples",
    duration: "5 minutes"
  },
  {
    step: "2", 
    title: "Initial Review",
    description: "Our team reviews your application and gets back within 48 hours",
    duration: "2-3 days"
  },
  {
    step: "3",
    title: "Interview",
    description: "30-45 minute video call to discuss your experience and our culture",
    duration: "45 minutes"
  },
  {
    step: "4",
    title: "Technical Assessment",
    description: "Practical assessment relevant to the role (paid for your time)",
    duration: "2-4 hours"
  },
  {
    step: "5",
    title: "Final Interview",
    description: "Meet the team and discuss how you&apos;ll contribute to our mission",
    duration: "1 hour"
  },
  {
    step: "6",
    title: "Offer",
    description: "We make an offer within 24 hours of the final interview",
    duration: "1-2 days"
  }
]

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />
      
      {/* Hero Section */}
      <section className="relative py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 max-w-4xl">
          <Badge variant="secondary" className="w-fit mx-auto">
            Join Our Team
          </Badge>
          <h1 className="text-4xl lg:text-6xl font-bold text-balance">
            Shape the Future of <span className="text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">Accessible Education</span>
          </h1>
          <p className="text-xl text-muted-foreground text-pretty">
            At Gossiper, we&apos;re building a world where every student has equal access to knowledge. Join our diverse team of innovators and make a real impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link href="#open-positions">
                View Open Positions
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
              <Link href="/about">Learn About Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="text-3xl lg:text-4xl font-bold text-primary">50K+</div>
              <div className="text-muted-foreground">Students Reached</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl lg:text-4xl font-bold text-primary">25+</div>
              <div className="text-muted-foreground">Team Members</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl lg:text-4xl font-bold text-primary">15</div>
              <div className="text-muted-foreground">Countries</div>
            </div>
            <div className="space-y-2">
              <div className="text-3xl lg:text-4xl font-bold text-primary">100%</div>
              <div className="text-muted-foreground">Remote Team</div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Our Values</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">What Drives Us</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              These core values guide everything we do and shape our company culture.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <Card key={index} className="text-center border-border/50 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <value.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-lg">{value.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Benefits & Perks</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">Why You&apos;ll Love Working Here</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We invest in our team&apos;s growth, wellbeing, and success.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="border-border/50 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{benefit.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Open Positions */}
      <section id="open-positions" className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Open Positions</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">Join Our Mission</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Ready to make education more accessible? Explore our current openings.
            </p>
          </div>
          
          <div className="space-y-6 max-w-4xl mx-auto">
            {openPositions.map((position) => (
              <Card key={position.id} className="border-border/50 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-xl">{position.title}</CardTitle>
                        {position.urgent && (
                          <Badge variant="destructive" className="text-xs">Urgent</Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {position.department}
                        </div>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {position.location}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {position.type}
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          {position.experience}
                        </div>
                      </div>
                    </div>
                    <Button asChild>
                      <Link href={`mailto:careers@gossiper.com?subject=Application for ${position.title}`}>
                        Apply Now
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-muted-foreground">{position.description}</p>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Requirements</h4>
                      <ul className="space-y-2">
                        {position.requirements.map((req, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <CheckCircle className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-3">Benefits</h4>
                      <ul className="space-y-2">
                        {position.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            {benefit}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <span className="text-sm text-muted-foreground">Posted {position.posted}</span>
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`mailto:careers@gossiper.com?subject=Application for ${position.title}`}>
                        Apply Now
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Hiring Process */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <Badge variant="secondary">Our Process</Badge>
            <h2 className="text-3xl lg:text-4xl font-bold">Simple & Transparent</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our hiring process is designed to be fair, efficient, and respectful of your time.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {hiringProcess.map((step, index) => (
              <Card key={index} className="text-center border-border/50 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-lg">
                    {step.step}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <Badge variant="outline" className="w-fit mx-auto">
                    {step.duration}
                  </Badge>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{step.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-blue-500/5">
            <CardContent className="py-16 text-center space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold">Don&apos;t See Your Role?</h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                We&apos;re always looking for exceptional talent. Send us your resume and tell us how you&apos;d like to contribute to our mission.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="text-lg px-8" asChild>
                  <Link href="mailto:careers@gossiper.com?subject=General Application">
                    Send Your Resume
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 bg-transparent" asChild>
                  <Link href="mailto:careers@gossiper.com?subject=Questions about Gossiper">
                    Ask Questions
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer 
        variant="simple" 
        copyrightText="All rights reserved. Building the future of accessible education."
      />
    </div>
  )
}