import { MainNavigation } from "@/components/main-navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileText, Scale, Shield, AlertTriangle } from "lucide-react"

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              Terms of Service
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Terms of <span className="text-primary">Service</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              These terms govern your use of Gossiper's services. Please read them carefully as they contain important
              information about your rights and obligations.
            </p>
            <p className="text-sm text-muted-foreground">Last updated: January 15, 2025</p>
          </div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Acceptance of Terms */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <span>Acceptance of Terms</span>
                </CardTitle>
                <CardDescription>By using Gossiper, you agree to be bound by these terms.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  By accessing or using Gossiper's services, you agree to be bound by these Terms of Service and all
                  applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
                  using or accessing our services.
                </p>
                <p className="text-muted-foreground">
                  We may update these terms from time to time. When we do, we'll notify you by email or through our
                  service. Your continued use of our services after such modifications constitutes acceptance of the
                  updated terms.
                </p>
              </CardContent>
            </Card>

            {/* Service Description */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Service Description</CardTitle>
                <CardDescription>What Gossiper provides and how it works.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Our Services</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Real-time AI-powered speech-to-text captioning</li>
                    <li>• Multi-language translation services</li>
                    <li>• Session management and collaboration tools</li>
                    <li>• Payment processing through Solana Pay</li>
                    <li>• Accessibility features and customization options</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Availability</h3>
                  <p className="text-muted-foreground">
                    We strive to provide reliable service, but we cannot guarantee 100% uptime. Our services may be
                    temporarily unavailable due to maintenance, updates, or circumstances beyond our control.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Accuracy Disclaimer</h3>
                  <p className="text-muted-foreground">
                    While we use advanced AI technology to provide accurate captions and translations, we cannot
                    guarantee 100% accuracy. Users should not rely solely on our services for critical communications or
                    legal proceedings.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* User Accounts */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>User Accounts and Responsibilities</CardTitle>
                <CardDescription>Your obligations when using our services.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Account Creation</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• You must provide accurate and complete information</li>
                    <li>• You are responsible for maintaining account security</li>
                    <li>• You must be at least 13 years old to create an account</li>
                    <li>• One person may not maintain multiple accounts</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Acceptable Use</h3>
                  <p className="text-muted-foreground mb-3">You agree not to:</p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Use our services for illegal or unauthorized purposes</li>
                    <li>• Interfere with or disrupt our services or servers</li>
                    <li>• Attempt to gain unauthorized access to our systems</li>
                    <li>• Share inappropriate, offensive, or harmful content</li>
                    <li>• Violate any applicable laws or regulations</li>
                    <li>• Infringe on intellectual property rights</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Content Responsibility</h3>
                  <p className="text-muted-foreground">
                    You are solely responsible for any content you share through our services. You retain ownership of
                    your content but grant us a license to process it for service provision.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Terms */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5 text-primary" />
                  <span>Payment Terms</span>
                </CardTitle>
                <CardDescription>Billing, payments, and refund policies.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Solana Pay Integration</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Payments are processed through Solana blockchain</li>
                    <li>• You are responsible for wallet security and transaction fees</li>
                    <li>• Transactions are generally irreversible once confirmed</li>
                    <li>• We do not store your private keys or wallet credentials</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Class Pool Contributions</h3>
                  <p className="text-muted-foreground">
                    When you contribute to a class pool, your payment helps fund premium features for all participants.
                    If the pool goal is not reached, unused funds may be refunded according to our refund policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Subscription Services</h3>
                  <p className="text-muted-foreground">
                    Subscription fees are billed in advance and are non-refundable except as required by law. You may
                    cancel your subscription at any time, but you'll continue to have access until the end of your
                    billing period.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Refund Policy</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• 14-day money-back guarantee for new subscriptions</li>
                    <li>• Refunds for technical issues preventing service use</li>
                    <li>• Class pool refunds when goals are not met</li>
                    <li>• Refunds processed to original payment method when possible</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Intellectual Property */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <span>Intellectual Property</span>
                </CardTitle>
                <CardDescription>Rights and ownership of content and technology.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Our Rights</h3>
                  <p className="text-muted-foreground">
                    Gossiper and its technology, including but not limited to software, algorithms, user interface, and
                    branding, are owned by us and protected by intellectual property laws. You may not copy, modify, or
                    distribute our technology.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Your Content</h3>
                  <p className="text-muted-foreground">
                    You retain ownership of content you create or share through our services. However, you grant us a
                    worldwide, non-exclusive license to use, process, and display your content solely for providing our
                    services.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Generated Content</h3>
                  <p className="text-muted-foreground">
                    Captions and translations generated by our AI are provided as-is. While you may use them for your
                    purposes, we retain rights to the underlying technology and algorithms that generate this content.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Limitation of Liability */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-primary" />
                  <span>Limitation of Liability</span>
                </CardTitle>
                <CardDescription>Important limitations on our liability to you.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Disclaimer</h3>
                  <p className="text-muted-foreground">
                    Our services are provided "as is" without warranties of any kind. We do not guarantee that our
                    services will be error-free, secure, or available at all times.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Limitation of Damages</h3>
                  <p className="text-muted-foreground">
                    To the maximum extent permitted by law, we shall not be liable for any indirect, incidental,
                    special, or consequential damages arising from your use of our services, even if we have been
                    advised of the possibility of such damages.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Maximum Liability</h3>
                  <p className="text-muted-foreground">
                    Our total liability to you for any claims arising from these terms or your use of our services shall
                    not exceed the amount you paid us in the 12 months preceding the claim.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Termination */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Termination</CardTitle>
                <CardDescription>How these terms can end and what happens when they do.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Termination by You</h3>
                  <p className="text-muted-foreground">
                    You may terminate your account at any time by contacting us or using the account deletion feature.
                    Upon termination, your access to our services will cease, and your data will be deleted according to
                    our privacy policy.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Termination by Us</h3>
                  <p className="text-muted-foreground">
                    We may suspend or terminate your account if you violate these terms, engage in fraudulent activity,
                    or for any other reason at our discretion. We'll provide notice when possible, but immediate
                    termination may be necessary in some cases.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Effect of Termination</h3>
                  <p className="text-muted-foreground">
                    Upon termination, your right to use our services ceases immediately. Provisions regarding
                    intellectual property, limitation of liability, and dispute resolution survive termination.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Governing Law */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Governing Law and Disputes</CardTitle>
                <CardDescription>Legal framework and dispute resolution procedures.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Governing Law</h3>
                  <p className="text-muted-foreground">
                    These terms are governed by the laws of Nigeria. Any disputes will be resolved in the courts of
                    Lagos State, Nigeria.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Dispute Resolution</h3>
                  <p className="text-muted-foreground">
                    We encourage resolving disputes through direct communication. If that's not possible, disputes may
                    be resolved through binding arbitration or in the appropriate courts as specified above.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Class Action Waiver</h3>
                  <p className="text-muted-foreground">
                    You agree to resolve disputes individually and waive the right to participate in class actions or
                    collective proceedings, except where prohibited by law.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Contact Information</CardTitle>
                <CardDescription>How to reach us with questions about these terms.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about these Terms of Service, please contact us:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Email: legal@gossiper.ai</li>
                  <li>• Address: 123 Innovation Drive, Victoria Island, Lagos, Nigeria</li>
                  <li>• Phone: +234 (0) 123 456 7890</li>
                </ul>
                <p className="text-sm text-muted-foreground">We'll respond to your inquiry within 30 days.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <Footer 
        variant="simple" 
        copyrightText="All rights reserved. Terms subject to change with notice."
      />
    </div>
  )
}
