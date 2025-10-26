"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Users, Globe, Target, ArrowRight, Award, TrendingUp, Twitter } from "lucide-react"
import Link from "next/link"
import { MainNavigation } from "@/components/main-navigation"
import { Footer } from "@/components/footer"
import Image from "next/image"

const team = [
  {
    name: "Agbaje Omobobola Melody",
    role: "Founder & CEO",
    bio: "Visionary leader passionate about making education accessible through innovative technology solutions.",
    image: "/melody.jpeg",
    xHandle: "@iammelody",
  },
  {
    name: "Goodness Mbakara",
    role: "Co-founder & Head of Engineering",
    bio: "Full-stack developer with expertise in real-time systems and scalable architecture design.",
    image: "/goodness.jpeg",
    xHandle: "@goodnesmbakara",
  },
  {
    name: "Arixe Williams",
    role: "Full Stack Engineer",
    bio: "Full stack developer with expertise in frontend and backend technologies, specializing in scalable web applications.",
    image: "/arixe.jpeg",
    xHandle: "@arixe0",
  },
  {
    name: "Victory Okonkwo",
    role: "Business Developer",
    bio: "Strategic business development specialist focused on partnerships, growth, and market expansion across Africa.",
    image: "/victory.JPG",
    xHandle: "@cm_victoryy",
  },
  {
    name: "Oghenetega Mudiaga",
    role: "Head of Design",
    bio: "Creative designer with expertise in brand identity, user experience, and accessible design solutions.",
    image: "/oghenetega.jpg",
    xHandle: "@OghenetegaMudia",
  },
  {
    name: "Gwen",
    role: "Social Media Designer & Manager",
    bio: "Creative designer specializing in social media content and digital marketing with expertise in brand storytelling.",
    image: "/gwen.png",
    xHandle: "@jane_defi",
  },
  {
    name: "Syre",
    role: "Social Media Manager",
    bio: "Social media strategist focused on community engagement, content planning, and digital brand presence.",
    image: "/placeholder-user.jpg",
    xHandle: "@MeetSyre",
  },
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
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Breaking Down <span className="text-primary">Language Barriers</span> in Education
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Founded in Lagos, Nigeria, Gossiper was born from a simple belief: every student deserves equal access to
              education, regardless of their hearing ability or native language.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-muted/30">
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
                  Our founder, Agbaje Omobobola Melody, witnessed firsthand how language barriers and hearing difficulties
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
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Meet Our Team</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              A diverse group of innovators, technologists, and accessibility advocates working together to democratize
              education.
            </p>
          </div>

          {/* Desktop Creative Layout - Floating Masonry */}
          <div className="hidden lg:block">
            <div className="max-w-7xl mx-auto">
              {/* Creative Masonry Layout with Floating Cards */}
              <div className="relative">
                {/* Background decorative elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-r from-primary/5 to-blue-500/5 rounded-full blur-3xl"></div>
                  <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-500/5 to-primary/5 rounded-full blur-3xl"></div>
                </div>
                
                {/* Masonry-style grid */}
                <div className="grid grid-cols-12 gap-6 relative z-10">
                  {team.map((member, index) => {
                    // Define unique positioning for each card with better heights - Victory and Gwen get extra tall cards
                    const positions = [
                      { col: "col-span-4", row: "row-span-2", offset: "transform translate-y-4", height: "h-[520px]" },
                      { col: "col-span-3", row: "row-span-1", offset: "transform -translate-y-2", height: "h-[450px]" },
                      { col: "col-span-3", row: "row-span-1", offset: "transform translate-y-6", height: "h-[450px]" },
                      { col: "col-span-2", row: "row-span-2", offset: "transform translate-y-2", height: "h-[580px]" }, // Victory - extra tall
                      { col: "col-span-3", row: "row-span-2", offset: "transform -translate-y-4", height: "h-[520px]" },
                      { col: "col-span-2", row: "row-span-2", offset: "transform translate-y-8", height: "h-[580px]" }, // Gwen - extra tall
                      { col: "col-span-3", row: "row-span-1", offset: "transform -translate-y-2", height: "h-[450px]" },
                    ]
                    
                    const pos = positions[index] || { col: "col-span-3", row: "row-span-1", offset: "", height: "h-80" }
                    
                    return (
                      <div
                        key={member.name}
                        className={`group relative ${pos.col} ${pos.row} ${pos.offset} transition-all duration-700 hover:scale-105 hover:-translate-y-2`}
                      >
                        {/* Card with 3D floating effect - Special styling for Victory and Gwen */}
                        <Card className={`${pos.height} border-border/30 ${member.name === "Victory Okonkwo" || member.name === "Gwen" ? "bg-gradient-to-br from-card/90 via-primary/5 to-muted/10" : "bg-gradient-to-br from-card/80 via-card to-muted/10"} backdrop-blur-sm group-hover:from-card group-hover:to-primary/5 transition-all duration-700 group-hover:border-primary/40 group-hover:shadow-2xl group-hover:shadow-primary/20 overflow-hidden relative`}
                              style={{
                                boxShadow: member.name === "Victory Okonkwo" || member.name === "Gwen" 
                                  ? '0 15px 35px -5px rgba(0, 0, 0, 0.15), 0 15px 15px -5px rgba(0, 0, 0, 0.08)'
                                  : '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                                transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'perspective(1000px) rotateX(-5deg) rotateY(5deg) translateZ(20px)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)'
                              }}>
                          
                          {/* Animated background gradient */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
                          
                          {/* Floating particles effect - Extra particles for Victory and Gwen */}
                          <div className="absolute top-4 right-4 w-2 h-2 bg-primary/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse"></div>
                          <div className="absolute top-8 right-8 w-1 h-1 bg-blue-500/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-700 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                          <div className="absolute top-12 right-6 w-1.5 h-1.5 bg-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-1000 animate-pulse" style={{ animationDelay: '1s' }}></div>
                          {(member.name === "Victory Okonkwo" || member.name === "Gwen") && (
                            <>
                              <div className="absolute top-6 right-12 w-1 h-1 bg-primary/40 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-600 animate-pulse" style={{ animationDelay: '0.8s' }}></div>
                              <div className="absolute top-10 right-14 w-1.5 h-1.5 bg-blue-500/30 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-800 animate-pulse" style={{ animationDelay: '1.2s' }}></div>
                            </>
                          )}
                          
                          <CardHeader className="pb-4 relative z-10">
                            <div className={`mx-auto mb-4 rounded-full overflow-hidden relative group-hover:scale-110 transition-all duration-700 ${
                              index === 0 || index === 4 ? "h-24 w-24" : "h-20 w-20"
                            }`}>
                              <Image
                                src={member.image || "/placeholder.svg"}
                                alt={member.name}
                                width={index === 0 || index === 4 ? 96 : 80}
                                height={index === 0 || index === 4 ? 96 : 80}
                                className={`w-full h-full object-cover ${
                                  member.name === "Agbaje Omobobola Melody" 
                                    ? "object-top scale-110" 
                                    : member.name === "Arixe Williams"
                                    ? "object-top scale-100"
                                    : member.name === "Gwen"
                                    ? "object-top scale-100"
                                    : member.name === "Oghenetega Mudiaga"
                                    ? "object-top scale-100"
                                    : "object-center scale-110"
                                }`}
                                style={{
                                  objectPosition: member.name === "Agbaje Omobobola Melody" 
                                    ? 'center 10%' 
                                    : member.name === "Arixe Williams"
                                    ? 'center 20%'
                                    : member.name === "Gwen"
                                    ? 'center 15%'
                                    : member.name === "Oghenetega Mudiaga"
                                    ? 'center 25%'
                                    : 'center center'
                                }}
                              />
                              {/* Glowing ring effect */}
                              <div className="absolute inset-0 rounded-full border-2 border-primary/20 opacity-0 group-hover:opacity-100 group-hover:border-primary/60 transition-all duration-700 group-hover:scale-110"></div>
                              
                              {/* Floating badge */}
                              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-gradient-to-r from-primary to-blue-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-700 shadow-lg">
                                <div className="h-1.5 w-1.5 rounded-full bg-white"></div>
                              </div>
                            </div>
                            
                            <CardTitle className={`text-center group-hover:text-primary transition-colors duration-700 ${
                              index === 0 || index === 4 ? "text-lg" : "text-base"
                            }`}>
                              {member.name}
                            </CardTitle>
                            <CardDescription className="text-primary/80 font-medium text-center text-sm">
                              {member.role}
                            </CardDescription>
                          </CardHeader>
                          
                          <CardContent className="space-y-4 relative z-10 flex flex-col h-full">
                            <div className="flex-1 min-h-0">
                              <p className="text-muted-foreground text-sm text-center leading-relaxed h-full overflow-y-auto">
                                {member.bio}
                              </p>
                            </div>
                            
                            {/* Enhanced X Handle - Always visible */}
                            <div className="mt-auto">
                              <a 
                                href={`https://x.com/${member.xHandle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-muted/60 to-muted/40 rounded-xl border border-border/50 group-hover:border-primary/40 transition-all duration-700 hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 cursor-pointer group-hover:scale-105 hover:shadow-lg"
                              >
                                <div className="h-6 w-6 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20 flex items-center justify-center group-hover:from-primary/30 group-hover:to-blue-500/30 transition-all duration-700">
                                  <Twitter className="h-3.5 w-3.5 text-primary" />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-700 truncate max-w-[140px]" title={member.xHandle}>
                                  {member.xHandle.length > 20 ? `${member.xHandle.substring(0, 17)}...` : member.xHandle}
                                </span>
                              </a>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Creative Layout */}
          <div className="lg:hidden">
            <div className="relative">
              {/* Scroll Indicator */}
              <div className="absolute top-0 right-0 z-10 bg-gradient-to-l from-background via-background/80 to-transparent w-8 h-full pointer-events-none"></div>
              
              <div className="flex space-x-6 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {team.map((member, index) => (
                  <div key={member.name} className="flex-shrink-0 w-72 snap-center">
                    <Card className={`${member.name === "Victory Okonkwo" || member.name === "Gwen" ? "h-[600px]" : "h-[520px]"} border-border/50 bg-gradient-to-br from-card via-card to-muted/20 hover:from-card hover:to-primary/5 transition-all duration-500 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/10 overflow-hidden flex flex-col`}>
                      <CardHeader className="pb-4 relative">
                        {/* Decorative Elements */}
                        <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-gradient-to-r from-primary/20 to-blue-500/20"></div>
                        <div className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary/10"></div>
                        
                        <div className="mx-auto h-32 w-32 rounded-full overflow-hidden mb-4 relative hover:scale-105 transition-transform duration-500">
                          <Image
                      src={member.image || "/placeholder.svg"}
                      alt={member.name}
                            width={128}
                            height={128}
                            className={`w-full h-full object-cover ${
                              member.name === "Agbaje Omobobola Melody" 
                                ? "object-top scale-110" 
                                : member.name === "Arixe Williams"
                                ? "object-top scale-100"
                                : member.name === "Gwen"
                                ? "object-top scale-100"
                                : "object-center scale-110"
                            }`}
                            style={{
                              objectPosition: member.name === "Agbaje Omobobola Melody" 
                                ? 'center 10%' 
                                : member.name === "Arixe Williams"
                                ? 'center 20%'
                                : member.name === "Gwen"
                                ? 'center 15%'
                                : 'center center'
                            }}
                          />
                          {/* Floating Badge */}
                          <div className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                            <div className="h-2 w-2 rounded-full bg-primary-foreground"></div>
                          </div>
                  </div>
                        
                        <CardTitle className="text-xl text-center hover:text-primary transition-colors duration-300">
                          {member.name}
                        </CardTitle>
                        <CardDescription className="text-primary font-medium text-center">
                          {member.role}
                        </CardDescription>
                </CardHeader>
                      
                      <CardContent className="space-y-4 flex flex-col flex-1">
                        <div className="flex-1">
                          <p className="text-muted-foreground text-sm text-center leading-relaxed">
                            {member.bio}
                          </p>
                        </div>
                        
                        {/* X Handle */}
                        <div className="mt-auto">
                          {member.xHandle && (
                            <a 
                              href={`https://x.com/${member.xHandle.replace('@', '')}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center justify-center space-x-2 p-3 bg-gradient-to-r from-muted/50 to-muted/30 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/10 hover:to-blue-500/10 cursor-pointer"
                            >
                              <div className="h-7 w-7 rounded-full bg-gradient-to-r from-primary/10 to-blue-500/10 flex items-center justify-center hover:from-primary/20 hover:to-blue-500/20 transition-all duration-300">
                                <Twitter className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 truncate max-w-[140px]" title={member.xHandle}>
                                {member.xHandle.length > 20 ? `${member.xHandle.substring(0, 17)}...` : member.xHandle}
                              </span>
                            </a>
                          )}
                        </div>
                </CardContent>
              </Card>
                  </div>
                ))}
              </div>
              
              {/* Scroll Hint */}
              <div className="text-center mt-4">
                <div className="inline-flex items-center space-x-2 text-sm text-muted-foreground">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span>Swipe to explore</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Our Values</h2>
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
                <Button size="lg" variant="secondary" className="text-lg px-8" asChild>
                  <Link href="/signup">
                    Get Started Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/10 bg-transparent"
                  asChild
                >
                  <Link href="/careers">Join Our Team</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer 
        variant="simple" 
        copyrightText="All rights reserved. Making education accessible worldwide."
      />
    </div>
  )
}