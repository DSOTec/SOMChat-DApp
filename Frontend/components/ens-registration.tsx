"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAccount, useDisconnect } from "wagmi"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Upload, Wallet, ArrowRight, CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"
import { WalletConnectButton } from "@/components/wallet-connect-button"
import { useUserRegistry } from "@/hooks/useUserRegistry"
import { uploadToIPFS, validateImageFile } from "@/lib/ipfs"
import { toast } from "sonner"

export function ENSRegistration() {
  const [ensName, setEnsName] = useState("")
  const [profileImage, setProfileImage] = useState<string | null>(null)
  const [avatarHash, setAvatarHash] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  const { 
    registerUser, 
    useIsUserRegistered, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error 
  } = useUserRegistry()
  
  const { data: isRegistered, refetch: refetchRegistration } = useIsUserRegistered(address)

  // Redirect if not connected
  useEffect(() => {
    if (!isConnected) {
      router.push('/')
    }
  }, [isConnected, router])

  // Redirect to dashboard if already registered
  useEffect(() => {
    if (isRegistered && address) {
      router.push('/chat')
    }
  }, [isRegistered, address, router])

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed) {
      toast.success("Registration successful! Welcome to SOMChat!")
      refetchRegistration()
      router.push('/chat')
    }
  }, [isConfirmed, refetchRegistration, router])

  // Handle transaction errors
  useEffect(() => {
    if (error) {
      toast.error("Registration failed: " + (error as any)?.shortMessage || error.message)
    }
  }, [error])

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file
    const validation = await validateImageFile(file)
    if (!validation.valid) {
      toast.error(validation.error || 'Invalid file')
      return
    }

    setIsUploading(true)
    try {
      // Show preview immediately
      const reader = new FileReader()
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to IPFS
      const result = await uploadToIPFS(file)
      setAvatarHash(result.hash)
      toast.success('Image uploaded to IPFS successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload image to IPFS')
      setProfileImage(null)
      setAvatarHash('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!ensName.trim()) {
      toast.error("Please enter an ENS name")
      return
    }

    try {
      await registerUser(ensName.trim(), avatarHash)
      toast.success("Registration transaction submitted!")
    } catch (err) {
      console.error("Registration error:", err)
      toast.error("Failed to submit registration transaction")
    }
  }

  // Show wallet connection if not connected
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Connect Your Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet to register for SOMChat
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <WalletConnectButton />
          </CardContent>
        </Card>
      </div>
    )
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
              <span className="text-xl font-semibold text-foreground">SOMChat</span>
            </Link>

            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Badge variant="secondary" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm px-2 sm:px-3">
                <CheckCircle className="w-3 h-3" />
                <span className="hidden sm:inline">Wallet Connected</span>
                <span className="sm:hidden">Connected</span>
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => disconnect()}
                className="text-xs"
              >
                Disconnect
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg">
          <Card className="glow-hover">
            <CardHeader className="text-center space-y-4 p-4 sm:p-6">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto">
                <Wallet className="w-8 h-8 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl sm:text-2xl font-bold">Setup Your Profile</CardTitle>
                <CardDescription className="text-sm sm:text-base mt-2">
                  Complete your ENS registration to start chatting
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="space-y-6 p-4 sm:p-6">
              {/* Wallet Address Display */}
              <div className="p-3 sm:p-4 rounded-lg bg-muted/50 border border-border/50">
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Connected Wallet</Label>
                    <p className="font-mono text-xs sm:text-sm mt-1 break-all">
                      {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : ''}
                    </p>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500 ml-2 shrink-0"></div>
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
                      className="pr-12 text-sm sm:text-base"
                      required
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">.eth</div>
                  </div>
                  <p className="text-xs text-muted-foreground">This will serve as your username in the chat</p>
                </div>

                {/* Profile Image Upload */}
                <div className="space-y-4">
                  <Label className="text-sm font-medium">Profile Image</Label>

                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <Avatar className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                      <AvatarImage src={profileImage || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-lg sm:text-xl font-semibold">
                        {ensName ? ensName.charAt(0).toUpperCase() : "?"}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                      <Label
                        htmlFor="profileImage"
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 cursor-pointer transition-colors text-sm ${
                          isUploading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        {isUploading ? (
                          <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <Upload className="w-4 h-4" />
                        )}
                        {isUploading ? 'Uploading...' : 'Upload Image'}
                      </Label>
                      <Input
                        id="profileImage"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                      <p className="text-xs text-muted-foreground mt-1">Stored securely on IPFS</p>
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full glow-hover text-sm sm:text-base py-2 sm:py-3"
                  size="lg"
                  disabled={!ensName.trim() || isPending || isConfirming || isUploading}
                >
                  {isPending || isConfirming || isUploading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span className="text-sm sm:text-base">
                        {isUploading ? "Uploading..." : isPending ? "Confirming..." : "Processing..."}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-sm sm:text-base">Register & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center">
                <p className="text-xs text-muted-foreground px-2">
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
