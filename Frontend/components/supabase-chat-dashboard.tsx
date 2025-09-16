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
import { useSupabaseMessaging } from "@/hooks/useSupabaseMessaging"
import { useSupabaseGroups } from "@/hooks/useSupabaseGroups"
import { useUserRegistry } from "@/hooks/useUserRegistry"
import { toast } from "sonner"
import { Address } from "viem"
import { shortenAddress, formatTimeAgo } from "@/lib/utils"
import { formatEnsName } from "@/lib/userUtils"
import type { Message, User, GroupMessage, Group } from "@/lib/supabase"
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

interface Contact {
  id: string
  address: string
  ensName: string
  avatar?: string
  lastMessage?: string
  timestamp?: string
  unreadCount?: number
  isOnline?: boolean
}

interface ChatMessage {
  id: string
  content: string
  sender: string
  timestamp: string
  isSent: boolean
}

export function SupabaseChatDashboard() {
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()
  
  // Supabase hooks
  const {
    users,
    messages,
    isLoading: messagingLoading,
    error: messagingError,
    registerUser,
    getUsers,
    sendMessage,
    getMessages,
    markMessagesAsRead,
    subscribeToMessages,
    subscribeToUsers
  } = useSupabaseMessaging()

  const {
    groups,
    groupMessages,
    isLoading: groupsLoading,
    error: groupsError,
    createGroup,
    getUserGroups,
    sendGroupMessage,
    getGroupMessages,
    subscribeToGroupMessages
  } = useSupabaseGroups()

  // Contract hooks for registration check
  const { useIsUserRegistered, useUserDetails } = useUserRegistry()
  
  // State
  const [selectedChat, setSelectedChat] = useState<string>("")
  const [selectedChatType, setSelectedChatType] = useState<'user' | 'group'>('user')
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [currentUserData, setCurrentUserData] = useState<{ ensName: string; avatar?: string } | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])

  // Check if user is registered and redirect if not
  const { data: isRegistered } = useIsUserRegistered(address)
  const { data: userDetails } = useUserDetails(address)

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

  // Set current user data and register in Supabase
  useEffect(() => {
    if (userDetails && userDetails[0] && address) {
      const ensName = formatEnsName(userDetails[0])
      const avatarHash = userDetails[1] || ''
      
      setCurrentUserData({
        ensName,
        avatar: avatarHash ? `https://ipfs.io/ipfs/${avatarHash}` : undefined
      })

      // Register user in Supabase
      registerUser(ensName, avatarHash)
    }
  }, [userDetails, address, registerUser])

  // Load users and groups
  useEffect(() => {
    if (isConnected && address) {
      getUsers()
      getUserGroups()
    }
  }, [isConnected, address, getUsers, getUserGroups])

  // Convert Supabase users to contacts format
  useEffect(() => {
    if (users.length > 0) {
      const contactList: Contact[] = users
        .filter(user => user.wallet_address !== address?.toLowerCase())
        .map(user => ({
          id: user.wallet_address,
          address: user.wallet_address,
          ensName: user.ens_name || formatEnsName(shortenAddress(user.wallet_address as Address)),
          avatar: user.avatar_hash ? `https://ipfs.io/ipfs/${user.avatar_hash}` : undefined,
          lastMessage: "Start a conversation",
          timestamp: formatTimeAgo(new Date(user.created_at)),
          unreadCount: 0,
          isOnline: true
        }))
      
      setContacts(contactList)
    }
  }, [users, address])

  // Convert messages to chat format
  useEffect(() => {
    if (selectedChatType === 'user' && messages.length > 0) {
      const chatMsgs: ChatMessage[] = messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender_wallet,
        timestamp: msg.timestamp,
        isSent: msg.sender_wallet === address?.toLowerCase()
      }))
      setChatMessages(chatMsgs)
    } else if (selectedChatType === 'group' && groupMessages.length > 0) {
      const chatMsgs: ChatMessage[] = groupMessages.map(msg => ({
        id: msg.id,
        content: msg.content,
        sender: msg.sender_wallet,
        timestamp: msg.timestamp,
        isSent: msg.sender_wallet === address?.toLowerCase()
      }))
      setChatMessages(chatMsgs)
    } else {
      setChatMessages([])
    }
  }, [messages, groupMessages, selectedChatType, address])

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchQuery) return contacts
    return contacts.filter(contact =>
      contact.ensName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.address.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [contacts, searchQuery])

  // Handle chat selection
  const handleChatSelect = useCallback(async (chatId: string, type: 'user' | 'group') => {
    setSelectedChat(chatId)
    setSelectedChatType(type)
    setIsMobileSidebarOpen(false)

    if (type === 'user') {
      await getMessages(chatId as Address)
      await markMessagesAsRead(chatId as Address)
    } else {
      await getGroupMessages(chatId)
    }
  }, [getMessages, markMessagesAsRead, getGroupMessages])

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    if (!messageInput.trim() || !selectedChat) return

    try {
      if (selectedChatType === 'user') {
        await sendMessage(selectedChat as Address, messageInput.trim())
      } else {
        await sendGroupMessage(selectedChat, messageInput.trim())
      }
      setMessageInput("")
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error("Failed to send message")
    }
  }, [messageInput, selectedChat, selectedChatType, sendMessage, sendGroupMessage])

  // Set up realtime subscriptions
  useEffect(() => {
    if (!address) return

    const messageChannel = subscribeToMessages((newMessage: Message) => {
      if (selectedChatType === 'user' && 
          (newMessage.sender_wallet === selectedChat || newMessage.receiver_wallet === selectedChat)) {
        setChatMessages(prev => [...prev, {
          id: newMessage.id,
          content: newMessage.content,
          sender: newMessage.sender_wallet,
          timestamp: newMessage.timestamp,
          isSent: newMessage.sender_wallet === address.toLowerCase()
        }])
      }
    })

    const userChannel = subscribeToUsers((updatedUser: User) => {
      setContacts(prev => prev.map(contact => 
        contact.address === updatedUser.wallet_address 
          ? { ...contact, ensName: updatedUser.ens_name || contact.ensName }
          : contact
      ))
    })

    return () => {
      messageChannel?.unsubscribe()
      userChannel?.unsubscribe()
    }
  }, [address, selectedChat, selectedChatType, subscribeToMessages, subscribeToUsers])

  // Set up group message subscriptions
  useEffect(() => {
    if (selectedChatType === 'group' && selectedChat) {
      const groupChannel = subscribeToGroupMessages(selectedChat, (newMessage: GroupMessage) => {
        setChatMessages(prev => [...prev, {
          id: newMessage.id,
          content: newMessage.content,
          sender: newMessage.sender_wallet,
          timestamp: newMessage.timestamp,
          isSent: newMessage.sender_wallet === address?.toLowerCase()
        }])
      })

      return () => {
        groupChannel?.unsubscribe()
      }
    }
  }, [selectedChat, selectedChatType, address, subscribeToGroupMessages])

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
                    {messagingLoading && <Loader2 className="w-3 h-3 animate-spin" />}
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
                        {shortenAddress(contact.address as Address)}
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
                  {groupsLoading && <Loader2 className="w-3 h-3 animate-spin" />}
                </h4>
                <CreateGroupModal />
              </div>
              <div className="space-y-1">
                {groups.map((group) => (
                  <div
                    key={group.id}
                    onClick={() => handleChatSelect(group.id, 'group')}
                    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedChat === group.id && selectedChatType === 'group'
                        ? "bg-sidebar-accent text-sidebar-accent-foreground"
                        : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
                    }`}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={group.avatar_hash ? `https://ipfs.io/ipfs/${group.avatar_hash}` : "/placeholder.svg"} />
                      <AvatarFallback className="bg-secondary/10 text-secondary font-semibold">
                        <Hash className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h5 className="font-medium truncate">{group.name}</h5>
                        <span className="text-xs text-muted-foreground">
                          {formatTimeAgo(new Date(group.created_at))}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{group.description || "Group conversation"}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-border bg-background">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMobileSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          <h1 className="font-semibold">SOMChat</h1>
          <div className="w-9" />
        </div>

        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="border-b border-border bg-background">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={
                      selectedChatType === 'user' 
                        ? contacts.find(c => c.id === selectedChat)?.avatar || "/placeholder.svg"
                        : groups.find(g => g.id === selectedChat)?.avatar_hash 
                          ? `https://ipfs.io/ipfs/${groups.find(g => g.id === selectedChat)?.avatar_hash}`
                          : "/placeholder.svg"
                    } />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {selectedChatType === 'user' 
                        ? contacts.find(c => c.id === selectedChat)?.ensName.charAt(0).toUpperCase()
                        : <Hash className="w-4 h-4" />
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">
                      {selectedChatType === 'user' 
                        ? contacts.find(c => c.id === selectedChat)?.ensName
                        : groups.find(g => g.id === selectedChat)?.name
                      }
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedChatType === 'user' ? 'Online' : `${groups.find(g => g.id === selectedChat)?.description || 'Group chat'}`}
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
                {chatMessages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.map((message) => {
                    const senderContact = contacts.find(c => c.address === message.sender)
                    const senderName = senderContact?.ensName || formatEnsName(shortenAddress(message.sender as Address))
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
                          </div>
                          <span className="text-xs text-muted-foreground mt-1 px-1">
                            {formatTimeAgo(new Date(message.timestamp))}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="border-t border-border bg-background p-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage}
                  disabled={!messageInput.trim()}
                  size="sm"
                  className="px-3"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold mb-2">Welcome to SOMChat</h3>
              <p>Select a contact or group to start messaging</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
