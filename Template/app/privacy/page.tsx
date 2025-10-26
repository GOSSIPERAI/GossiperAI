import { MainNavigation } from "@/components/main-navigation"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Shield, Eye, Lock, Users, Globe, Database } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background">
      <MainNavigation />

      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="w-fit mx-auto">
              Privacy Policy
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-balance">
              Your <span className="text-primary">Privacy</span> Matters
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">
              We're committed to protecting your personal information and being transparent about how we collect, use,
              and safeguard your data.
            </p>
            <p className="text-sm text-muted-foreground">Last updated: January 15, 2025</p>
          </div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance">Our Privacy Principles</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto text-pretty">
              These principles guide how we handle your data across all our services.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-border text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Data Minimization</CardTitle>
                <CardDescription>
                  We only collect data that's necessary to provide our services and enhance your experience.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Transparency</CardTitle>
                <CardDescription>
                  We're clear about what data we collect, how we use it, and who we share it with.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border text-center">
              <CardHeader>
                <div className="mx-auto h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Security First</CardTitle>
                <CardDescription>
                  Your data is protected with industry-standard encryption and security measures.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Privacy Policy Content */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto space-y-12">
            {/* Information We Collect */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-primary" />
                  <span>Information We Collect</span>
                </CardTitle>
                <CardDescription>We collect information to provide better services to all our users.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Account Information</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Email address and name when you create an account</li>
                    <li>• Profile information you choose to provide</li>
                    <li>• Educational institution or organization details</li>
                    <li>• Language preferences and accessibility settings</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Usage Information</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Session participation and duration</li>
                    <li>• Caption and translation preferences</li>
                    <li>• Device and browser information</li>
                    <li>• IP address and general location data</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Audio Data</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Audio streams processed for real-time captioning</li>
                    <li>• Temporary audio data for translation services</li>
                    <li>• Audio quality metrics for service improvement</li>
                    <li>• Note: Audio is processed in real-time and not permanently stored</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Payment Information</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Solana wallet addresses for payments</li>
                    <li>• Transaction records and payment history</li>
                    <li>• Contribution amounts and session funding data</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* How We Use Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-primary" />
                  <span>How We Use Your Information</span>
                </CardTitle>
                <CardDescription>
                  We use the information we collect to provide, maintain, and improve our services.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Provision</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Provide real-time captions and translations</li>
                    <li>• Process payments and manage class pools</li>
                    <li>• Customize your experience based on preferences</li>
                    <li>• Enable session creation and participation</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Communication</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Send service-related notifications</li>
                    <li>• Provide customer support</li>
                    <li>• Share important updates about our services</li>
                    <li>• Respond to your inquiries and feedback</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Improvement and Analytics</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Analyze usage patterns to improve our services</li>
                    <li>• Develop new features and capabilities</li>
                    <li>• Monitor and improve caption accuracy</li>
                    <li>• Ensure platform security and prevent abuse</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Information Sharing */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-primary" />
                  <span>Information Sharing</span>
                </CardTitle>
                <CardDescription>
                  We don't sell your personal information. Here's when we might share it.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">With Your Consent</h3>
                  <p className="text-muted-foreground">
                    We'll share personal information outside of this policy when we have your explicit consent.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Service Providers</h3>
                  <p className="text-muted-foreground">
                    We work with trusted third-party service providers who help us operate our platform, including cloud
                    hosting, payment processing, and AI services. These providers are contractually bound to protect
                    your information.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Legal Requirements</h3>
                  <p className="text-muted-foreground">
                    We may share information if required by law, regulation, legal process, or governmental request, or
                    to protect the rights, property, or safety of Gossiper, our users, or the public.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Business Transfers</h3>
                  <p className="text-muted-foreground">
                    If we're involved in a merger, acquisition, or sale of assets, your information may be transferred
                    as part of that transaction, but we'll notify you beforehand.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Data Security */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-primary" />
                  <span>Data Security</span>
                </CardTitle>
                <CardDescription>We implement strong security measures to protect your information.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-2 text-muted-foreground">
                  <li>• End-to-end encryption for sensitive data transmission</li>
                  <li>• Regular security audits and vulnerability assessments</li>
                  <li>• Secure data centers with physical and digital access controls</li>
                  <li>• Employee training on data protection and privacy practices</li>
                  <li>• Incident response procedures for potential security breaches</li>
                  <li>• Regular backups and disaster recovery procedures</li>
                </ul>
              </CardContent>
            </Card>

            {/* Your Rights */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Your Rights and Choices</CardTitle>
                <CardDescription>You have control over your personal information and how it's used.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">Access and Portability</h3>
                  <p className="text-muted-foreground">
                    You can access, update, or download your personal information through your account settings.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Deletion</h3>
                  <p className="text-muted-foreground">
                    You can delete your account and associated data at any time. Some information may be retained for
                    legal or legitimate business purposes.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Communication Preferences</h3>
                  <p className="text-muted-foreground">
                    You can opt out of non-essential communications while still receiving important service-related
                    messages.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-3">Cookie Controls</h3>
                  <p className="text-muted-foreground">
                    You can control cookie preferences through your browser settings or our cookie preference center.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
                <CardDescription>Questions about this privacy policy or our data practices?</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Email: privacy@gossiper.ai</li>
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
        copyrightText="All rights reserved. Your privacy is our priority."
      />
    </div>
  )
}
