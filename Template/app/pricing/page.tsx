import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowRight, Zap, Users, Crown } from "lucide-react"
import Link from "next/link"
import { MainNavigation } from "@/components/main-navigation"
import { Footer } from "@/components/footer"

const plans = [
  {
    name: "Student",
    description: "Perfect for individual students",
    price: "₦50",
    period: "per session",
    usdPrice: "$0.10",
    icon: Users,
    features: [
      "Real-time captions",
      "Translation to 50+ languages",
      "Basic customization",
      "Session recordings",
      "Mobile app access",
    ],
    cta: "Join Session",
    popular: false,
  },
  {
    name: "Educator",
    description: "For teachers and lecturers",
    price: "₦2,500",
    period: "per month",
    usdPrice: "$5.00",
    icon: Zap,
    features: [
      "Unlimited sessions",
      "Advanced analytics",
      "Custom branding",
      "Priority support",
      "Bulk student management",
      "Export transcripts",
      "API access",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Institution",
    description: "For schools and universities",
    price: "Custom",
    period: "contact us",
    usdPrice: "Volume pricing",
    icon: Crown,
    features: [
      "Everything in Educator",
      "SSO integration",
      "Advanced security",
      "Dedicated support",
      "Custom integrations",
      "Training & onboarding",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              Transparent Pricing
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Accessible Education for <span className="text-primary">Everyone</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              Fair, transparent pricing powered by Solana Pay. Students contribute as little as ₦50 per session, while
              educators get powerful tools to make their content accessible.
            </p>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan) => {
              const Icon = plan.icon
              return (
                <Card
                  key={plan.name}
                  className={`relative border-border hover:shadow-lg transition-shadow ${
                    plan.popular ? "border-primary shadow-lg scale-105" : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">Most Popular</Badge>
                    </div>
                  )}
                  <CardHeader className="text-center pb-8">
                    <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <CardDescription className="text-base">{plan.description}</CardDescription>
                    <div className="pt-4">
                      <div className="text-4xl font-bold">{plan.price}</div>
                      <div className="text-muted-foreground">{plan.period}</div>
                      <div className="text-sm text-muted-foreground mt-1">{plan.usdPrice}</div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <ul className="space-y-3">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center space-x-3">
                          <Check className="h-4 w-4 text-primary flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"} asChild>
                      <Link href={plan.name === "Institution" ? "/contact" : "/signup"}>
                        {plan.cta}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">How Solana Pay Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              Fast, secure, and affordable payments powered by blockchain technology.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="text-xl font-semibold">Connect Wallet</h3>
              <p className="text-muted-foreground">
                Connect your Solana wallet (Phantom, Solflare, etc.) to get started. No credit card required.
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="text-xl font-semibold">Join Class Pool</h3>
              <p className="text-muted-foreground">
                Contribute to the class pool with other students. Typical contribution is ₦50 (about $0.10 USD).
              </p>
            </div>

            <div className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="text-xl font-semibold">Access Features</h3>
              <p className="text-muted-foreground">
                Once the pool goal is reached, everyone gets access to premium captions and translations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Frequently Asked Questions</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-8">
            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Why use Solana Pay instead of traditional payments?</h3>
              <p className="text-muted-foreground">
                Solana Pay offers near-zero transaction fees (less than $0.001), instant settlement, and global
                accessibility. This makes micro-payments viable for students worldwide.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">What if the class pool goal isn't reached?</h3>
              <p className="text-muted-foreground">
                Basic captions are always available. The pool funding unlocks premium features like advanced
                translations, exports, and enhanced accuracy. Unused funds are refunded.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Do I need cryptocurrency experience?</h3>
              <p className="text-muted-foreground">
                Not at all! We provide simple wallet setup guides and support. You can also fund your wallet with
                traditional payment methods through our partners.
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-semibold">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes! Educators get a 14-day free trial with full access to all features. Students can join sessions for
                free to test basic functionality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-3xl p-8 lg:p-16 text-center">
            <div className="max-w-3xl mx-auto space-y-6">
              <h2 className="text-3xl lg:text-4xl font-bold text-primary-foreground text-balance">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-primary-foreground/90 text-pretty">
                Join thousands of students and educators making education accessible for everyone.
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
                  <Link href="/contact">Contact Sales</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer 
        variant="simple" 
        copyrightText="All rights reserved. Powered by Solana."
      />
    </div>
  )
}
