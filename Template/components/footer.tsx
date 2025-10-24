import Link from "next/link"
import Image from "next/image"

interface FooterProps {
  variant?: "full" | "simple"
  className?: string
  copyrightText?: string
}

export function Footer({ 
  variant = "full", 
  className = "",
  copyrightText = "All rights reserved. Powered by Solana."
}: FooterProps) {
  const currentYear = new Date().getFullYear()

  if (variant === "simple") {
    return (
      <footer className={`border-t border-border bg-background ${className}`}>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center text-muted-foreground">
            <p>&copy; {currentYear} Gossiper. {copyrightText}</p>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className={`border-t border-border bg-muted/30 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-2 md:col-span-1 space-y-3 sm:space-y-4">
            <div className="flex items-center space-x-2">
              <Image
                src="/gossiper-logo-white.png"
                alt="Gossiper Logo"
                width={40}
                height={40}
                className="h-8 w-8 sm:h-10 sm:w-10"
              />
              <span className="text-lg sm:text-xl font-bold">gossiper</span>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Making education accessible through AI-powered real-time captions and translation.
            </p>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Product</h3>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <li>
                <Link href="/features" className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-foreground transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/demo" className="hover:text-foreground transition-colors">
                  Demo
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Company</h3>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <li>
                <Link href="/about" className="hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-foreground transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-foreground transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>
          <div className="col-span-2 sm:col-span-2 md:col-span-1">
            <h3 className="text-sm sm:text-base font-semibold mb-3 sm:mb-4">Support</h3>
            <ul className="space-y-2 text-sm sm:text-base text-muted-foreground">
              <li>
                <Link href="/help" className="hover:text-foreground transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-xs sm:text-sm text-muted-foreground">
          <p>&copy; {currentYear} Gossiper. {copyrightText}</p>
        </div>
      </div>
    </footer>
  )
}
