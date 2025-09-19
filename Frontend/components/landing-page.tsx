"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Wallet, MessageCircle, Shield, Users, Globe, Zap, Mail, Github, Twitter } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ThemeToggle } from "@/components/theme-toggle"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useUserRegistry } from "@/hooks/useUserRegistry"
import { useAccount } from "wagmi"

export function LandingPage() {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { address, isConnected } = useAccount()
  const router = useRouter()
  const { useIsUserRegistered } = useUserRegistry()
  
  // Check if user is registered
  const { data: isRegistered, isLoading: isCheckingRegistration } = useIsUserRegistered(address)

  // Handle routing after confirmed wallet connection
  useEffect(() => {
    if (isConnected && address && !isCheckingRegistration) {
      if (isRegistered === false) {
        // User is connected but not registered, redirect to registration
        router.push('/register')
      } else if (isRegistered === true) {
        // User is connected and registered, redirect to dashboard
        router.push('/dashboard')
      }
    }
  }, [isConnected, address, isRegistered, isCheckingRegistration, router])

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border/50 backdrop-blur-sm bg-background/80 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">SOMChat</span>
            </div>

            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
                className="text-muted-foreground hover:text-foreground transition-colors p-2"
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            <div
              className={`${isMobileMenuOpen ? "absolute top-16 left-0 right-0 bg-background border-b border-border/50 p-4 space-y-4" : "hidden"} md:flex md:items-center md:space-x-8 md:static md:bg-transparent md:border-0 md:p-0 md:space-y-0`}
            >
              <Link
                href="#how-it-works"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it Works
              </Link>
              <Link
                href="#features"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Features
              </Link>
              <Link
                href="#about"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link
                href="#contact"
                className="block text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <ThemeToggle />
              {isConnected ? (
                <Link href="/dashboard">
                  <Button className="glow-hover text-sm sm:text-base px-4 sm:px-6">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <WalletConnectButton />
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-5"></div>
        <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-20 sm:w-32 h-20 sm:h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-24 sm:w-40 h-24 sm:h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32 relative">
          <div className="text-center space-y-6 sm:space-y-8">
            <Badge variant="secondary" className="text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 sm:py-2">
              <Zap className="w-3 h-3 mr-1" />
              Chat with ease
            </Badge>

            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-balance leading-tight">
              The Future of <span className="text-primary animate-pulse">Secure Messaging</span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed px-4 sm:px-0">
              Experience truly decentralized communication with your ENS identity. Own your conversations, protect your
              privacy, and connect with the Web3 community.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center pt-6 sm:pt-8 px-4 sm:px-0">
              {isConnected ? (
                <div className="w-full sm:w-auto">
                  {isCheckingRegistration ? (
                    <Button
                      size="lg"
                      disabled
                      className="text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 h-auto font-semibold w-full sm:w-auto"
                    >
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Checking Registration...
                    </Button>
                  ) : (
                    <Button
                      size="lg"
                      onClick={() => {
                        if (isRegistered === false) {
                          router.push('/register')
                        } else if (isRegistered === true) {
                          router.push('/dashboard')
                        }
                      }}
                      className="glow-hover text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 h-auto font-semibold w-full sm:w-auto"
                    >
                      {isRegistered === false ? 'Complete Registration' : 'Go to Chat'}
                    </Button>
                  )}
                </div>
              ) : (
                <div className="w-full sm:w-auto">
                  <WalletConnectButton />
                </div>
              )}
              <Button
                variant="outline"
                size="lg"
                className="text-base sm:text-lg px-8 sm:px-12 py-3 sm:py-4 h-auto bg-transparent border-2 hover:bg-muted/50 w-full sm:w-auto"
              >
                Explore Features
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Get started with decentralized messaging in four simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                title: "Connect Wallet",
                description: "Link your Web3 wallet to get started",
                icon: Wallet,
              },
              {
                step: "02",
                title: "Register ENS",
                description: "Set up your ENS identity for messaging",
                icon: Globe,
              },
              {
                step: "03",
                title: "Upload Profile",
                description: "Add your profile image stored on IPFS",
                icon: Users,
              },
              {
                step: "04",
                title: "Start Chatting",
                description: "Begin secure conversations instantly",
                icon: MessageCircle,
              },
            ].map((item, index) => (
              <Card key={index} className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
                <CardHeader className="text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                    <item.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-sm font-mono text-primary mb-2">{item.step}</div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-center">{item.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Everything you need for secure, decentralized communication
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {[
              {
                title: "1-on-1 Chats",
                description: "Private conversations with end-to-end encryption",
                icon: MessageCircle,
              },
              {
                title: "Group Chats",
                description: "Create and manage group conversations",
                icon: Users,
              },
              {
                title: "ENS Profiles",
                description: "Your identity powered by Ethereum Name Service",
                icon: Globe,
              },
              {
                title: "IPFS Avatars",
                description: "Decentralized profile image storage",
                icon: Shield,
              },
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 glow-hover">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">About SOMChat</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Revolutionizing communication through decentralized technology
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="space-y-6">
              <h3 className="text-xl sm:text-2xl font-bold">Our Mission</h3>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                SOMChat is built on the belief that communication should be truly private, secure, and owned by users.
                We leverage the power of Web3 technology, ENS domains, and IPFS to create a messaging platform where
                your identity and conversations belong to you, not to centralized corporations.
              </p>

              <h3 className="text-xl sm:text-2xl font-bold pt-4">Why Decentralized?</h3>
              <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
                Traditional messaging platforms control your data, can censor your conversations, and may compromise
                your privacy. SOMChat eliminates these concerns by putting you in complete control of your digital
                identity and communications through blockchain technology.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-6">
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">User Owned</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl sm:text-3xl font-bold text-primary">0</div>
                  <div className="text-sm text-muted-foreground">Data Mining</div>
                </div>
              </div>
            </div>

            <Card className="p-6 sm:p-8 glow-hover">
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-xl">Built for Privacy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">End-to-end encryption</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Decentralized storage</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">No central authority</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm">Open source protocol</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">Get in Touch</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto px-4 sm:px-0">
              Have questions or want to contribute? We'd love to hear from you
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="lg:col-span-1 space-y-6 sm:space-y-8">
              <Card className="p-4 sm:p-6 glow-hover">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Email Us</h3>
                    <p className="text-sm text-muted-foreground">Get support or ask questions</p>
                  </div>
                </div>
                <p className="text-sm font-mono break-all">hello@somchat.xyz</p>
              </Card>

              <Card className="p-4 sm:p-6 glow-hover">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Github className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Open Source</h3>
                    <p className="text-sm text-muted-foreground">Contribute to the project</p>
                  </div>
                </div>
                <p className="text-sm font-mono break-all">github.com/somchat</p>
              </Card>

              <Card className="p-4 sm:p-6 glow-hover">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Twitter className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Follow Updates</h3>
                    <p className="text-sm text-muted-foreground">Latest news and features</p>
                  </div>
                </div>
                <p className="text-sm font-mono break-all">@somchat_xyz</p>
              </Card>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="p-6 sm:p-8 glow-hover">
                <CardHeader className="px-0 pt-0">
                  <CardTitle className="text-xl">Send us a Message</CardTitle>
                  <CardDescription>
                    Whether you're a developer, user, or just curious about Web3 messaging, we're here to help.
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0 pb-0">
                  <form className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <input
                          type="email"
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Subject</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50"
                        placeholder="What's this about?"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Message</label>
                      <textarea
                        rows={5}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                        placeholder="Tell us more..."
                      ></textarea>
                    </div>
                    <Button className="w-full glow-hover" size="lg">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8 sm:py-12 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold">SOMChat</span>
            </div>

            <div className="flex items-center space-x-4 sm:space-x-6 text-sm text-muted-foreground">
              <Link href="#" className="hover:text-foreground transition-colors">
                Terms
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Privacy
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                GitHub
              </Link>
              <Link href="#" className="hover:text-foreground transition-colors">
                Twitter
              </Link>
            </div>
          </div>

          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/50 text-center">
            <p className="text-sm text-muted-foreground">© 2024 SOMChat. Developed by DSOtec.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
