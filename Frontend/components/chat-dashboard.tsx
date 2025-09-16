"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CreateGroupModal } from "@/components/create-group-modal"
import { MessageCircle, Search, Plus, Send, MoreVertical, Phone, Video, Settings, Users, Hash } from "lucide-react"

interface Contact {
  id: string
  ensName: string
  avatar?: string
  lastMessage?: string
  timestamp?: string
  unreadCount?: number
  isOnline?: boolean
}

interface Group {
  id: string
  name: string
  avatar?: string
  lastMessage?: string
  timestamp?: string
  unreadCount?: number
  memberCount: number
}

interface Message {
  id: string
  content: string
  timestamp: string
  isSent: boolean
  senderName?: string
}

export function ChatDashboard() {
  const [selectedChat, setSelectedChat] = useState<string | null>("alice.eth")
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [groups, setGroups] = useState<Group[]>([
    {
      id: "web3-devs",
      name: "Web3 Developers",
      avatar: "/web3-group.jpg",
      lastMessage: "New DeFi protocol launched!",
      timestamp: "30m",
      unreadCount: 5,
      memberCount: 12,
    },
    {
      id: "nft-collectors",
      name: "NFT Collectors",
      avatar: "/nft-group.jpg",
      lastMessage: "Check out this new collection",
      timestamp: "2h",
      memberCount: 8,
    },
  ])

  // Mock data
  const currentUser = {
    ensName: "john.eth",
    avatar: "/diverse-user-avatars.png",
  }

  const contacts: Contact[] = [
    {
      id: "alice.eth",
      ensName: "alice.eth",
      avatar: "/alice-avatar.png",
      lastMessage: "Hey! How's the new DApp coming along?",
      timestamp: "2m",
      unreadCount: 2,
      isOnline: true,
    },
    {
      id: "bob.eth",
      ensName: "bob.eth",
      avatar: "/bob-avatar.jpg",
      lastMessage: "Thanks for the help with the smart contract",
      timestamp: "1h",
      isOnline: false,
    },
    {
      id: "charlie.eth",
      ensName: "charlie.eth",
      avatar: "/charlie-avatar.jpg",
      lastMessage: "Let's discuss the tokenomics tomorrow",
      timestamp: "3h",
      unreadCount: 1,
      isOnline: true,
    },
  ]

  const messages: Message[] = [
    {
      id: "1",
      content: "Hey John! How's the new DApp coming along?",
      timestamp: "10:30 AM",
      isSent: false,
      senderName: "alice.eth",
    },
    {
      id: "2",
      content: "It's going great! Just finished the ENS integration",
      timestamp: "10:32 AM",
      isSent: true,
    },
    {
      id: "3",
      content: "That's awesome! Can't wait to try it out",
      timestamp: "10:33 AM",
      isSent: false,
      senderName: "alice.eth",
    },
    {
      id: "4",
      content: "I'll send you the beta link once it's ready",
      timestamp: "10:35 AM",
      isSent: true,
    },
  ]

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      console.log("Sending message:", messageInput)
      setMessageInput("")
    }
  }

  const handleCreateGroup = (groupData: {
    name: string
    avatar: string | null
    selectedMembers: string[]
  }) => {
    const newGroup: Group = {
      id: `group-${Date.now()}`,
      name: groupData.name,
      avatar: groupData.avatar || undefined,
      lastMessage: "Group created",
      timestamp: "now",
      memberCount: groupData.selectedMembers.length + 1, // +1 for current user
    }

    setGroups((prev) => [newGroup, ...prev])
    setSelectedChat(newGroup.id)
    console.log("Created group:", newGroup)
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.ensName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  return (
    <div className="h-screen flex bg-background">
      {/* Left Sidebar */}
      <div className="w-80 border-r border-border flex flex-col bg-sidebar">
        {/* User Profile Header */}
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUser.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentUser.ensName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sidebar-foreground">{currentUser.ensName}</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="text-sidebar-foreground">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-sidebar-accent/50 border-sidebar-border"
            />
          </div>
        </div>

        {/* Contacts and Groups List */}
        <ScrollArea className="flex-1">
          <div className="px-4 pb-4">
            {/* Contacts Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Contacts
                </h4>
              </div>
              <div className="space-y-1">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedChat(contact.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === contact.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={contact.avatar || "/placeholder.svg"} />
                        <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                          {contact.ensName.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      {contact.isOnline && (
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-sidebar"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium truncate">{contact.ensName}</h5>
                        <span className="text-xs text-muted-foreground">{contact.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{contact.lastMessage}</p>
                    </div>
                    {contact.unreadCount && (
                      <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center">
                        {contact.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Separator className="my-4" />

            {/* Groups Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Groups
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-sidebar-foreground h-6 w-6 p-0 glow-hover"
                  onClick={() => setIsCreateGroupOpen(true)}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {filteredGroups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => setSelectedChat(group.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === group.id
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={group.avatar || "/placeholder.svg"} />
                      <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                        <Hash className="w-5 h-5" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium truncate">{group.name}</h5>
                        <span className="text-xs text-muted-foreground">{group.timestamp}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{group.lastMessage}</p>
                    </div>
                    {group.unreadCount && (
                      <Badge className="bg-primary text-primary-foreground text-xs min-w-[20px] h-5 flex items-center justify-center">
                        {group.unreadCount}
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Right Panel - Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src="/alice-avatar.png" />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">A</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">alice.eth</h3>
                    <p className="text-sm text-muted-foreground">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages Area */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                        message.isSent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                      <p
                        className={`text-xs mt-1 ${
                          message.isSent ? "text-primary-foreground/70" : "text-muted-foreground/70"
                        }`}
                      >
                        {message.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!messageInput.trim()} className="glow-hover">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          /* No Chat Selected */
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Welcome to ChatDApp</h3>
                <p className="text-muted-foreground">Select a contact or group to start chatting</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <CreateGroupModal
        isOpen={isCreateGroupOpen}
        onClose={() => setIsCreateGroupOpen(false)}
        contacts={contacts}
        onCreateGroup={handleCreateGroup}
      />
    </div>
  )
}
