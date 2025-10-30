"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Menu, X, ArrowRight, Zap, Globe, Users, LogOut, User, Headphones } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

const navigation = [
  { name: "Features", href: "/features", icon: Zap },
  { name: "Pricing", href: "/pricing", icon: Globe },
  { name: "About", href: "/about", icon: Users },
  { name: "Help", href: "/help", icon: Headphones },
]

export function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()
  const { user, profile, signOut } = useAuth()

  const handleLogout = async () => {
    try {
      await signOut()
      router.push('/')
      setIsOpen(false)
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className="h-10 w-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 p-0.5">
              <div className="w-full h-full rounded-md bg-primary/80 flex items-center justify-center">
                <Image
                  src="/gossiper-logo-white.png"
                  alt="Gossiper Logo"
                  width={128}
                  height={128}
                  className="w-20 h-20 object-contain scale-[2.5]"
                />
              </div>
            </div>
            <span className="text-xl font-bold text-foreground">Gossiper</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "text-muted-foreground hover:text-foreground transition-colors",
                  pathname === item.href && "text-foreground font-medium",
                )}
              >
                {item.name}
              </Link>
            ))}
            
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{profile?.name || user.email}</span>
                  <Badge variant={profile?.role === "lecturer" ? "default" : "outline"} className="text-xs">
                    {profile?.role || "user"}
                  </Badge>
                </div>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            ) : (
              <>
                <Button  className="text-foreground hover:text-foreground" variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden">
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] p-0">
                {/* Header */}
                <div className="flex items-center p-6 border-b border-border">
                  <Link
                    href="/"
                    className="flex items-center space-x-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <div className="h-10 w-10 rounded-lg overflow-hidden bg-gradient-to-br from-primary/20 to-primary/10 p-0.5">
                      <div className="w-full h-full rounded-md bg-primary/80 flex items-center justify-center">
                        <Image
                          src="/gossiper-logo-white.png"
                          alt="Gossiper Logo"
                          width={128}
                          height={128}
                          className="w-20 h-20 object-contain scale-[2.5]"
                        />
                      </div>
                    </div>
                    <span className="text-xl font-bold text-foreground">Gossiper</span>
                  </Link>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col p-6 space-y-1">
                  <div className="mb-4">
                    {navigation.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center space-x-3 px-3 py-3 rounded-lg transition-all duration-200 group",
                            isActive 
                              ? "bg-primary/10 text-primary font-medium" 
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <Icon className={cn(
                            "h-5 w-5 transition-colors",
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          )} />
                          <span className="flex-1">{item.name}</span>
                          {isActive && (
                            <Badge variant="secondary" className="text-xs">
                              Current
                            </Badge>
                          )}
                          <ArrowRight className={cn(
                            "h-4 w-4 transition-transform opacity-0 group-hover:opacity-100 group-hover:translate-x-1",
                            isActive && "opacity-100"
                          )} />
                        </Link>
                      )
                    })}
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-4 border-t border-border">
                    <div className="space-y-3">
                      <Link 
                        href="/join-session" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-3 rounded-lg bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors group"
                      >
                        <div>
                          <p className="font-medium text-accent-foreground">Join Session</p>
                          <p className="text-sm text-muted-foreground">Enter session code</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-accent group-hover:translate-x-1 transition-transform" />
                      </Link>
                      
                      <Link 
                        href="/create-session" 
                        onClick={() => setIsOpen(false)}
                        className="flex items-center justify-between p-3 rounded-lg bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors group"
                      >
                        <div>
                          <p className="font-medium text-primary">Create Session</p>
                          <p className="text-sm text-muted-foreground">Start new session</p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-primary group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>

                {/* Auth Section */}
                <div className="mt-auto p-6 border-t border-border bg-muted/30">
                  {user ? (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 p-3 rounded-lg bg-muted">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="font-medium text-foreground">{profile?.name || user.email}</p>
                          <Badge variant={profile?.role === "lecturer" ? "default" : "outline"} className="text-xs">
                            {profile?.role || "user"}
                          </Badge>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        className="w-full bg-background hover:bg-muted" 
                        onClick={handleLogout}
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full bg-background hover:bg-muted" 
                        asChild
                      >
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          Sign In
                        </Link>
                      </Button>
                      <Button className="w-full" asChild>
                        <Link href="/signup" onClick={() => setIsOpen(false)}>
                          Get Started
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
