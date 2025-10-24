"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Headphones, Menu, ArrowRight, Zap, Globe, Users, LogIn, UserPlus } from "lucide-react"
import { cn } from "@/lib/utils"

const navigation = [
  { name: "Features", href: "/features", icon: Zap },
  { name: "Pricing", href: "/pricing", icon: Globe },
  { name: "About", href: "/about", icon: Users },
  { name: "Help", href: "/help", icon: Headphones },
]

export function MainNavigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <Image
              src="/gossiper-logo-white.png"
              alt="Gossiper Logo"
              width={40}
              height={40}
              className="h-10 w-10"
            />
            <span className="text-xl font-bold text-foreground">gossiper</span>
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
            
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogIn className="h-4 w-4 mr-2" />
                Sign In
              </Link>
            </Button>
            <Button asChild>
              <Link href="/signup">
                <UserPlus className="h-4 w-4 mr-2" />
                Sign Up
              </Link>
            </Button>
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
                    <Image
                      src="/gossiper-logo-white.png"
                      alt="Gossiper Logo"
                      width={40}
                      height={40}
                      className="h-10 w-10"
                    />
                    <span className="text-xl font-bold text-foreground">gossiper</span>
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

                </div>

                {/* Auth Section */}
                <div className="mt-auto p-6 border-t border-border bg-muted/30">
                  <div className="space-y-3">
                    <Button 
                      variant="outline" 
                      className="w-full bg-background hover:bg-muted" 
                      asChild
                    >
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <LogIn className="h-4 w-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                    <Button className="w-full" asChild>
                      <Link href="/signup" onClick={() => setIsOpen(false)}>
                        <UserPlus className="h-4 w-4 mr-2" />
                        Sign Up
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
