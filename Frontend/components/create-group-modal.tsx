"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Upload, Users } from "lucide-react"
import { uploadToIPFS, validateImageFile } from "@/lib/ipfs"
import { toast } from "sonner"

interface Contact {
  id: string
  ensName: string
  avatar?: string
  isOnline?: boolean
}

interface CreateGroupModalProps {
  isOpen: boolean
  onClose: () => void
  contacts: Contact[]
  onCreateGroup: (groupData: {
    name: string
    avatar: string | null
    selectedMembers: string[]
  }) => void
}

export function CreateGroupModal({ isOpen, onClose, contacts, onCreateGroup }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("")
  const [groupAvatar, setGroupAvatar] = useState<string | null>(null)
  const [avatarHash, setAvatarHash] = useState("")
  const [selectedMembers, setSelectedMembers] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

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
        setGroupAvatar(e.target?.result as string)
      }
      reader.readAsDataURL(file)

      // Upload to IPFS
      const result = await uploadToIPFS(file)
      setAvatarHash(result.hash)
      toast.success('Group avatar uploaded successfully!')
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Failed to upload group avatar')
      setGroupAvatar(null)
      setAvatarHash('')
    } finally {
      setIsUploading(false)
    }
  }

  const handleMemberToggle = (contactId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(contactId) ? prev.filter((id) => id !== contactId) : [...prev, contactId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!groupName.trim() || selectedMembers.length === 0) return

    setIsLoading(true)

    try {
      await onCreateGroup({
        name: groupName,
        avatar: avatarHash || null,
        selectedMembers,
      })

      // Reset form
      setGroupName("")
      setGroupAvatar(null)
      setAvatarHash("")
      setSelectedMembers([])
      onClose()
    } catch (error) {
      console.error('Group creation failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setGroupName("")
    setGroupAvatar(null)
    setAvatarHash("")
    setSelectedMembers([])
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg max-h-[90vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Users className="w-5 h-5 text-primary" />
            Create Group
          </DialogTitle>
          <DialogDescription className="text-sm">Create a new group chat with your contacts</DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-120px)] pr-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Group Avatar Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 shrink-0">
                <AvatarImage src={groupAvatar || undefined} />
                <AvatarFallback className="bg-secondary/10 text-secondary text-lg sm:text-xl font-semibold">
                  {groupName ? groupName.charAt(0).toUpperCase() : <Users className="w-6 h-6 sm:w-8 sm:h-8" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 w-full sm:w-auto text-center sm:text-left">
                <Label
                  htmlFor="groupAvatar"
                  className={`inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-background hover:bg-muted/50 cursor-pointer transition-colors text-sm ${
                    isUploading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Upload className="w-4 h-4" />
                  )}
                  {isUploading ? 'Uploading...' : 'Upload Avatar'}
                </Label>
                <Input id="groupAvatar" type="file" accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isUploading} />
                <p className="text-xs text-muted-foreground mt-1">Optional group image</p>
              </div>
            </div>

            {/* Group Name Input */}
            <div className="space-y-2">
              <Label htmlFor="groupName" className="text-sm font-medium">
                Group Name
              </Label>
              <Input
                id="groupName"
                type="text"
                placeholder="Enter group name"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="text-sm sm:text-base"
                required
              />
            </div>

            {/* Member Selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Choose Members ({selectedMembers.length} selected)</Label>

              <ScrollArea className="h-32 sm:h-48 border border-border rounded-lg p-2">
                <div className="space-y-2">
                  {contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        id={contact.id}
                        checked={selectedMembers.includes(contact.id)}
                        onCheckedChange={() => handleMemberToggle(contact.id)}
                      />

                      <div className="relative">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                            {contact.ensName.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        {contact.isOnline && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border border-background"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <Label htmlFor={contact.id} className="text-sm font-medium cursor-pointer truncate block">
                          {contact.ensName}
                        </Label>
                        <p className="text-xs text-muted-foreground">{contact.isOnline ? "Online" : "Offline"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="flex-1 bg-transparent text-sm sm:text-base"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 glow-hover text-sm sm:text-base"
                disabled={!groupName.trim() || selectedMembers.length === 0 || isLoading || isUploading}
              >
                {isLoading || isUploading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    {isUploading ? 'Uploading...' : 'Creating...'}
                  </div>
                ) : (
                  "Create Group"
                )}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
