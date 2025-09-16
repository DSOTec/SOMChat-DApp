"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useAccount, useDisconnect } from "wagmi"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { CreateGroupModal } from "@/components/create-group-modal"
import { ThemeToggle } from "@/components/theme-toggle"
import { TypingIndicator } from "@/components/typing-indicator"
import { useTypingIndicator } from "@/hooks/useTypingIndicator"
import { useUserRegistry } from "@/hooks/useUserRegistry"
import { useChatApp } from "@/hooks/useChatApp"
import { useRealtimeMessaging } from "@/hooks/useRealtimeMessaging"
import { useOptimizedContacts } from "@/hooks/useOptimizedContacts"
import { toast } from "sonner"
import { Address } from "viem"
import { shortenAddress, formatTimeAgo } from "@/lib/utils"
import { formatEnsName } from "@/lib/userUtils"
import {
  MessageCircle,
  Search,
  Plus,
  Send,
  MoreVertical,
  Phone,
  Video,
  Settings,
  Users,
  Hash,
  Menu,
  X,
  Loader2,
  LogOut,
} from "lucide-react"

interface Group {
  id: number
  name: string
  memberCount: number
  members: Address[]
  avatar?: string
  lastMessage?: string
  timestamp?: string
  unreadCount?: number
}

interface Message {
  id: string
  sender: Address
  receiver: Address
  content: string
  timestamp: string
  isSent: boolean
}

export function OptimizedChatDashboard() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  // Optimized contacts loading
  const { contacts, isLoading: contactsLoading } = useOptimizedContacts(address)
  
  const [groups, setGroups] = useState<Group[]>([])
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [selectedChatType, setSelectedChatType] = useState<'user' | 'group'>('user')
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [currentUserData, setCurrentUserData] = useState<{ensName: string, avatar?: string} | null>(null)

  // Memoized filtered contacts for better performance
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts
    return contacts.filter(contact => 
      contact.ensName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [contacts, searchQuery])

  // Memoized filtered groups
  const filteredGroups = useMemo(() => {
    if (!searchQuery.trim()) return groups
    return groups.filter(group => 
      group.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [groups, searchQuery])

  // User registry hooks
  const { useIsUserRegistered, useUserDetails } = useUserRegistry()
  const { useTotalGroups } = useChatApp()
  
  // Real-time messaging
  const { 
    sendRealtimeMessage, 
    sendRealtimeGroupMessage, 
    useDirectMessages, 
    useGroupMessages,
    isLoading: isMessageLoading,
    error: messagingError
  } = useRealtimeMessaging()

  // Check if user is registered and redirect if not
  const { data: isRegistered } = useIsUserRegistered(address)
  const { data: userDetails } = useUserDetails(address)
  const { data: totalGroups } = useTotalGroups()

  // Handle wallet disconnect
  const handleDisconnect = useCallback(() => {
    disconnect()
    router.push('/')
  }, [disconnect, router])

  // Redirect if not connected or not registered
  useEffect(() => {
    if (!isConnected) {
      router.push('/')
      return
    }
    
    if (isRegistered === false) {
      router.push('/register')
      return
    }
  }, [isConnected, isRegistered, router])

  // Set current user data
  useEffect(() => {
    if (userDetails && userDetails[0]) {
      const avatarHash = userDetails[1] || ''
      setCurrentUserData({
        ensName: formatEnsName(userDetails[0]),
        avatar: avatarHash ? `https://ipfs.io/ipfs/${avatarHash}` : undefined
      })
    }
  }, [userDetails])

  // Load groups with optimization
  useEffect(() => {
    if (totalGroups) {
      const groupList: Group[] = []
      for (let i = 1; i <= Number(totalGroups); i++) {
        groupList.push({
          id: i,
          name: `Group ${i}`,
          memberCount: 0,
          members: [],
          lastMessage: "Group conversation",
          timestamp: "1h"
        })
      }
      setGroups(groupList)
    }
  }, [totalGroups])

  // Get real-time messages for selected chat
  const selectedChatAddress = selectedChat && selectedChatType === 'user' ? selectedChat as Address : undefined
  const selectedGroupId = selectedChat && selectedChatType === 'group' ? parseInt(selectedChat) : undefined
  
  // Use real-time messaging hooks with conditional loading
  const directMessages = useDirectMessages(address!, selectedChatAddress!)
  const groupMessages = useGroupMessages(selectedGroupId!)

  // Generate conversation ID for typing indicator
  const currentConversationId = useMemo(() => {
    if (selectedChatType === 'user' && selectedChatAddress && address) {
      return `direct_${[address.toLowerCase(), selectedChatAddress.toLowerCase()].sort().join('_')}`
    }
    if (selectedChatType === 'group' && selectedGroupId) {
      return `group_${selectedGroupId}`
    }
    return ''
  }, [selectedChatType, selectedChatAddress, selectedGroupId, address])

  // Use typing indicator
  const { typingUsers, setTypingStatus } = useTypingIndicator(currentConversationId)

  // Load messages for selected conversation with optimization
  useEffect(() => {
    if (selectedChatType === 'user' && directMessages) {
      const messageList: Message[] = directMessages.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        receiver: msg.receiver!,
        content: msg.content,
        timestamp: (msg.timestamp as any)?.seconds?.toString() || Date.now().toString(),
        isSent: msg.sender === address
      }))
      setMessages(messageList)
    } else if (selectedChatType === 'group' && groupMessages) {
      const messageList: Message[] = groupMessages.map((msg) => ({
        id: msg.id,
        sender: msg.sender,
        receiver: msg.receiver || ('0x0' as Address),
        content: msg.content,
        timestamp: (msg.timestamp as any)?.seconds?.toString() || Date.now().toString(),
        isSent: msg.sender === address
      }))
      setMessages(messageList)
    } else {
      setMessages([])
    }
  }, [directMessages, groupMessages, selectedChatType, address])

  // Optimized chat selection handler
  const handleChatSelect = useCallback((chatId: string, type: 'user' | 'group') => {
    setSelectedChat(chatId)
    setSelectedChatType(type)
    setIsMobileSidebarOpen(false)
  }, [])

  // Optimized message sending
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedChat) return

    try {
      if (selectedChatType === 'user') {
        await sendRealtimeMessage(selectedChat as Address, messageInput.trim())
      } else {
        await sendRealtimeGroupMessage(parseInt(selectedChat), messageInput.trim())
      }
      setMessageInput("")
      setTypingStatus(false)
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error("Failed to send message")
    }
  }, [messageInput, selectedChat, selectedChatType, sendRealtimeMessage, sendRealtimeGroupMessage, setTypingStatus])

  // Optimized typing handler with debouncing
  const handleTypingChange = useCallback((value: string) => {
    setMessageInput(value)
    
    if (value.trim() && !messageInput.trim()) {
      setTypingStatus(true)
    } else if (!value.trim() && messageInput.trim()) {
      setTypingStatus(false)
    }
  }, [messageInput, setTypingStatus])

  if (!isConnected || isRegistered === false) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-80 bg-sidebar border-r border-sidebar-border transition-transform duration-200 ease-in-out lg:transition-none flex flex-col`}>
        
        {/* Header */}
        <div className="p-4 border-b border-sidebar-border bg-sidebar">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-sidebar-foreground">SOMChat</h2>
                {currentUserData && (
                  <p className="text-xs text-muted-foreground">{currentUserData.ensName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sidebar-foreground hover:text-destructive"
                onClick={handleDisconnect}
                title="Disconnect Wallet"
              >
                <LogOut className="w-4 h-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                className="lg:hidden text-sidebar-foreground"
                onClick={() => setIsMobileSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Search */}
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

        <ScrollArea className="flex-1">
          <div className="px-4 pb-4">
            {/* Contacts Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Registered Users
                    {contactsLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                  </h4>
                  <p className="text-xs text-muted-foreground">Click any user to start chatting</p>
                </div>
              </div>
              <div className="space-y-1">
                {filteredContacts.map((contact) => (
                  <div
                    key={contact.id}
                    onClick={() => handleChatSelect(contact.id, 'user')}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === contact.id && selectedChatType === 'user'
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
                      <p className="text-xs text-muted-foreground truncate font-mono">
                        {shortenAddress(contact.address)}
                      </p>
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
                    onClick={() => handleChatSelect(group.id.toString(), 'group')}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === group.id.toString() && selectedChatType === 'group'
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

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-border bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setIsMobileSidebarOpen(true)}>
                    <Menu className="w-4 h-4" />
                  </Button>
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={
                      selectedChatType === 'user' 
                        ? contacts.find(c => c.id === selectedChat)?.avatar || "/placeholder.svg"
                        : groups.find(g => g.id.toString() === selectedChat)?.avatar || "/placeholder.svg"
                    } />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {selectedChatType === 'user' 
                        ? contacts.find(c => c.id === selectedChat)?.ensName.charAt(0).toUpperCase() || '?'
                        : '#'
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedChatType === 'user' 
                        ? contacts.find(c => c.id === selectedChat)?.ensName || 'Unknown'
                        : groups.find(g => g.id.toString() === selectedChat)?.name || 'Unknown Group'
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChatType === 'user' ? 'Online' : `${groups.find(g => g.id.toString() === selectedChat)?.memberCount || 0} members`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Phone className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <Video className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    const senderContact = contacts.find(c => c.address === message.sender)
                    const senderName = senderContact?.ensName || formatEnsName(shortenAddress(message.sender))
                    const senderAvatar = senderContact?.avatar
                    
                    return (
                      <div key={message.id} className={`flex ${message.isSent ? "justify-end" : "justify-start"}`}>
                        {!message.isSent && (
                          <Avatar className="w-8 h-8 mr-2 mt-1 shrink-0">
                            <AvatarImage src={senderAvatar || "/placeholder.svg"} />
                            <AvatarFallback className="bg-secondary/10 text-secondary font-semibold text-xs">
                              {senderName.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
                          {!message.isSent && (
                            <span className="text-xs text-muted-foreground mb-1 ml-1">
                              {senderName}
                            </span>
                          )}
                          <div
                            className={`rounded-2xl px-4 py-2 ${
                              message.isSent ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                            <p
                              className={`text-xs mt-1 ${
                                message.isSent ? "text-primary-foreground/70" : "text-muted-foreground/70"
                              }`}
                            >
                              {new Date(Number(message.timestamp) * 1000).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
                
                {/* Typing Indicator */}
                <TypingIndicator typingUsers={typingUsers} contacts={contacts} />
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => handleTypingChange(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  onBlur={() => setTypingStatus(false)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!messageInput.trim() || isMessageLoading} 
                  className="glow-hover shrink-0"
                >
                  {isMessageLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-muted/20">
            <div className="text-center space-y-4 p-4">
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden mb-4"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="w-4 h-4 mr-2" />
                Open Contacts
              </Button>
              <MessageCircle className="w-16 h-16 mx-auto text-muted-foreground/50" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">Welcome to SOMChat</h3>
                <p className="text-muted-foreground">Select a contact or group to start messaging</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal 
        isOpen={isCreateGroupOpen} 
        onClose={() => setIsCreateGroupOpen(false)}
        contacts={contacts}
        onCreateGroup={() => {}}
      />
    </div>
  )
}
