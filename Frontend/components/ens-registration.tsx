"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Upload, Wallet, ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"

export function ENSRegistration() {
  const [ensName, setEnsName] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(true) // Simulated wallet connection
  const [isLoading, setIsLoading] = useState(false)

  const walletAddress = "0x1234...5678" // Simulated wallet address

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate registration process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    // Redirect to dashboard
    window.location.href = "/dashboard"
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border/50 backdrop-blur-sm bg-background/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-semibold text-foreground">ChatDApp</span>
            </Link>

            <Badge variant="secondary" className="flex items-center gap-2">
              <CheckCircle className="w-3 h-3" />
              Wallet Connected
            </Badge>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glow-hover">
            <CardHeader className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">Setup Your Profile</CardTitle>
                <CardDescription className="text-base mt-2">
                  Complete your ENS registration to start chatting
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Wallet Address Display */}
              <div className="p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Connected Wallet</Label>
                    <p className="font-mono text-sm mt-1">{walletAddress}</p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* ENS Name Input */}
                <div className="space-y-2">
                  <Label htmlFor="ensName" className="text-sm font-medium">
                    ENS Name
                  </Label>
                  <div className="relative">
                    <Input
                      id="ensName"
                      type="text"
                      placeholder="yourname"
                      value={ensName}
                      onChange={(e) => setEnsName(e.target.value)}
                      className="pr-12"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">.eth</div>
                  </div>
                  <p className="text-xs text-muted-foreground">This will serve as your username in the chat</p>
                </div>

                {/* Profile Image Upload */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Profile Image</Label>

                  <div className="flex items-center gap-4">
                    <Avatar className="w-16 h-16">
                      <AvatarImage src={profileImage || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg font-semibold">
                        {ensName ? ensName.charAt(0).toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <Label
                        htmlFor="profileImage"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <Upload className="w-4 h-4" />
                        Upload Image
                      </Label>
                      <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-1">Stored securely on IPFS</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button type="submit" className="w-full glow-hover" size="lg" disabled={!ensName.trim() || isLoading}>
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Registering...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Save & Continue
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Your ENS name will serve as your username. Profile image is stored on IPFS.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
