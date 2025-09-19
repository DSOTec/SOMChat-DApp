"use client"

import { useState, useEffect } from "react"
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
import { useOnChainMessaging, useDirectMessages, useGroupMessages } from "@/hooks/useOnChainMessaging"
import { useAllGroupDetails } from "@/hooks/useGroupDetails"
import { toast } from "sonner"
import { Address } from "viem"
import { shortenAddress, formatTimeAgo } from "@/lib/utils"
import { fetchUserDetails, formatEnsName, getIpfsUrl } from "@/lib/userUtils"
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
} from "lucide-react"

interface Contact {
  id: string
  address: Address
  ensName: string
  avatar?: string
  lastMessage?: string
  timestamp?: string
  unreadCount?: number
  isOnline?: boolean
}

interface Group {
  id: number
  name: string
  avatar?: string
  lastMessage?: string
  timestamp?: string
  unreadCount?: number
  memberCount: number
  members: Address[]
}

interface Message {
  id: string
  sender: Address
  receiver: Address
  content: string
  timestamp: bigint
  isSent: boolean
  senderName?: string
  isOracle?: boolean
}

export function ChatDashboard() {
  const [selectedChat, setSelectedChat] = useState<string | null>(null)
  const [selectedChatType, setSelectedChatType] = useState<'user' | 'group'>('user')
  const [messageInput, setMessageInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [groups, setGroups] = useState<Group[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [currentUserData, setCurrentUserData] = useState<{ensName: string, avatar?: string} | null>(null)

  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const router = useRouter()

  const { 
    useAllUsers, 
    useUserDetails, 
    useIsUserRegistered 
  } = useUserRegistry()

  const { 
    createGroup,
    useTotalGroups,
    isPending: isContractPending,
    isConfirming: isContractConfirming,
    error: contractError
  } = useChatApp()

  // On-chain messaging hooks
  const { 
    sendDirectMessage, 
    sendGroupMessage: sendOnChainGroupMessage,
    isPending: isMessagePending,
    error: messagingError
  } = useOnChainMessaging()

  // Check if user is registered and redirect if not
  const { data: isRegistered } = useIsUserRegistered(address)
  const { data: userDetails } = useUserDetails(address)
  const { data: allUsers } = useAllUsers()
  const { data: totalGroups } = useTotalGroups()

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
        avatar: avatarHash ? getIpfsUrl(avatarHash) : undefined
      })
    }
  }, [userDetails])

  // Load all users as contacts with their ENS details
  useEffect(() => {
    const loadContactsWithDetails = async () => {
      if (allUsers && address) {
        const contactPromises = allUsers
          .filter(userAddr => userAddr !== address)
          .map(async (userAddr) => {
            try {
              // Fetch user details for each contact
              const userDetailsResult = await fetchUserDetails(userAddr)
              const ensName = userDetailsResult?.[0] || shortenAddress(userAddr)
              const avatarHash = userDetailsResult?.[1] || ''
              const avatar = avatarHash ? getIpfsUrl(avatarHash) : undefined
              
              return {
                id: userAddr,
                address: userAddr,
                ensName: formatEnsName(ensName),
                avatar,
                lastMessage: "Click to chat",
                timestamp: "",
                isOnline: Math.random() > 0.5 // Random online status for demo
              }
            } catch (error) {
              // Fallback to address if user details fetch fails
              return {
                id: userAddr,
                address: userAddr,
                ensName: formatEnsName(shortenAddress(userAddr)),
                lastMessage: "Click to chat",
                timestamp: "",
                isOnline: Math.random() > 0.5
              }
            }
          })
        
        const contactList = await Promise.all(contactPromises)
        setContacts(contactList)
      }
    }
    
    loadContactsWithDetails()
  }, [allUsers, address])

  // Use the group details hook
  const { allGroups, isLoading: groupsLoading } = useAllGroupDetails(totalGroups)

  // Load groups with actual details
  useEffect(() => {
    if (allGroups.length > 0) {
      const groupList: Group[] = allGroups.map(group => ({
        id: group.id,
        name: group.name,
        memberCount: group.memberCount,
        members: group.members,
        lastMessage: "Group conversation",
        timestamp: "1h",
        avatar: group.avatarHash ? `https://gateway.pinata.cloud/ipfs/${group.avatarHash}` : undefined
      }))
      setGroups(groupList)
    } else if (totalGroups && Number(totalGroups) === 0) {
      setGroups([])
    }
  }, [allGroups, totalGroups])

  // Get on-chain messages for selected chat
  const selectedChatAddress = selectedChat && selectedChatType === 'user' ? selectedChat as Address : undefined
  const selectedGroupId = selectedChat && selectedChatType === 'group' ? parseInt(selectedChat) : undefined
  
  // Use on-chain messaging hooks
  const { messages: directMessages, isLoading: directLoading, refetch: refetchDirect } = useDirectMessages(address!, selectedChatAddress!)
  const { messages: groupMessages, isLoading: groupLoading, refetch: refetchGroup } = useGroupMessages(selectedGroupId!)

  // Generate conversation ID for typing indicator
  const currentConversationId = selectedChatType === 'user' && selectedChatAddress && address
    ? `direct_${[address.toLowerCase(), selectedChatAddress.toLowerCase()].sort().join('_')}`
    : selectedChatType === 'group' && selectedGroupId
    ? `group_${selectedGroupId}`
    : ''

  // Use typing indicator
  const { typingUsers, setTypingStatus } = useTypingIndicator(currentConversationId)

  // Load messages for selected conversation
  useEffect(() => {
    if (selectedChatType === 'user' && directMessages) {
      const messageList: Message[] = directMessages.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender,
        receiver: msg.receiver!,
        content: msg.content,
        timestamp: BigInt(Math.floor(msg.timestamp.getTime() / 1000)),
        isSent: msg.isSent,
        senderName: msg.senderName,
        isOracle: msg.isOracle || false
      }))
      // Sort messages by timestamp ascending
      messageList.sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
      setMessages(messageList)
    } else if (selectedChatType === 'group' && groupMessages) {
      const messageList: Message[] = groupMessages.map((msg: any) => ({
        id: msg.id,
        sender: msg.sender,
        receiver: '0x0000000000000000000000000000000000000000' as Address, // No specific receiver for group messages
        content: msg.content,
        timestamp: BigInt(Math.floor(msg.timestamp.getTime() / 1000)),
        isSent: msg.isSent,
        senderName: msg.senderName,
        isOracle: msg.isOracle || false
      }))
      // Sort messages by timestamp ascending
      messageList.sort((a, b) => Number(a.timestamp) - Number(b.timestamp))
      setMessages(messageList)
    } else {
      setMessages([])
    }
  }, [directMessages, groupMessages, selectedChatType, address, currentUserData])

  // Handle messaging errors
  useEffect(() => {
    if (contractError) {
      toast.error("Contract error: " + (contractError as any)?.shortMessage || contractError.message)
    }
    if (messagingError) {
      toast.error("Messaging error: " + messagingError)
    }
  }, [contractError, messagingError])

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !selectedChat || !address) return

    try {
      if (selectedChatType === 'user') {
        await sendDirectMessage(selectedChat as Address, messageInput.trim())
        // Wait for transaction confirmation before refetching
        setTimeout(() => {
          refetchDirect()
        }, 2000)
      } else if (selectedChatType === 'group') {
        await sendOnChainGroupMessage(parseInt(selectedChat), messageInput.trim())
        // Wait for transaction confirmation before refetching
        setTimeout(() => {
          refetchGroup()
        }, 2000)
      }
      setMessageInput("")
      toast.success("Message sent!")
    } catch (err) {
      console.error("Send message error:", err)
      toast.error("Failed to send message")
    }
  }

  const handleCreateGroup = async (groupData: {
    name: string
    avatar: string | null
    selectedMembers: string[]
  }) => {
    if (!address) {
      toast.error("Wallet not connected")
      return
    }

    if (!groupData.name.trim()) {
      toast.error("Group name is required")
      return
    }

    if (groupData.selectedMembers.length === 0) {
      toast.error("Please select at least one member")
      return
    }

    console.log('Creating group with data:', {
      name: groupData.name,
      avatar: groupData.avatar,
      members: groupData.selectedMembers,
      creator: address
    })

    try {
      // Convert contact IDs to actual wallet addresses
      const memberAddresses = groupData.selectedMembers.map(contactId => {
        const contact = contacts.find(c => c.id === contactId)
        if (!contact) {
          throw new Error(`Contact not found for ID: ${contactId}`)
        }
        console.log('Converting contact:', contact.ensName, 'address:', contact.address)
        return contact.address
      })
      
      console.log('Calling createGroup with correct order:', {
        name: groupData.name,
        avatarHash: groupData.avatar || "",
        members: memberAddresses
      })
      
      console.log('Parameters being passed:', {
        param1_name: groupData.name,
        param2_avatarHash: groupData.avatar || "",
        param3_members: memberAddresses
      })
      
      const result = await createGroup(groupData.name, groupData.avatar || "", memberAddresses)
      
      // Wait for the transaction to be submitted
      if (result) {
        console.log('Transaction hash:', result)
      } else {
        throw new Error('Transaction failed - no result returned')
      }
      console.log('Group creation result:', result)
      
      toast.success("Group creation transaction submitted!")
      setIsMobileSidebarOpen(false)
      
      // Wait for transaction confirmation
      setTimeout(() => {
        toast.success("Group created successfully!")
        window.location.reload()
      }, 3000)
    } catch (err: any) {
      console.error("Create group error:", err)
      
      // More detailed error handling
      if (err?.message?.includes('user rejected')) {
        toast.error("Transaction was rejected")
      } else if (err?.message?.includes('insufficient funds')) {
        toast.error("Insufficient funds for transaction")
      } else if (err?.shortMessage) {
        toast.error(`Transaction failed: ${err.shortMessage}`)
      } else if (err?.message) {
        toast.error(`Error: ${err.message}`)
      } else {
        toast.error("Failed to create group")
      }
    }
  }

  const filteredContacts = contacts.filter((contact) =>
    contact.ensName.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredGroups = groups.filter((group) => group.name.toLowerCase().includes(searchQuery.toLowerCase()))

  const handleChatSelect = (chatId: string, type: 'user' | 'group') => {
    setSelectedChat(chatId)
    setSelectedChatType(type)
    setIsMobileSidebarOpen(false)
  }

  // Show loading if not ready
  if (!isConnected || isRegistered === undefined || !currentUserData) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex bg-background relative">
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsMobileSidebarOpen(false)} />
      )}

      <div
        className={`
        ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0 fixed lg:relative z-50 lg:z-auto
        w-80 sm:w-96 lg:w-80 xl:w-96 h-full
        border-r border-border flex flex-col bg-sidebar
        transition-transform duration-300 ease-in-out
      `}
      >
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={currentUserData.avatar || "/placeholder.svg"} />
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                  {currentUserData.ensName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-sidebar-foreground">{currentUserData.ensName}</h3>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-muted-foreground">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-sidebar-foreground"
                onClick={() => disconnect()}
              >
                <Settings className="w-4 h-4" />
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
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
                    <MessageCircle className="w-4 h-4" />
                    Registered Users
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

      <div className="flex-1 flex flex-col min-w-0">
        {selectedChat ? (
          <>
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

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  messages.map((message) => {
                    // Handle oracle messages differently
                    if (message.isOracle) {
                      return (
                        <div key={message.id} className="flex justify-center my-4">
                          <div className="flex flex-col max-w-[90%] sm:max-w-[80%]">
                            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl px-4 py-3">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">🤖</span>
                                </div>
                                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                                  Oracle Bot
                                </span>
                                <span className="text-xs text-blue-600 dark:text-blue-400">
                                  {new Date(Number(message.timestamp) * 1000).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="text-sm text-blue-800 dark:text-blue-200 italic font-mono whitespace-pre-wrap">
                                {message.content}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }

                    // Handle regular user messages
                    const senderContact = contacts.find(c => c.address === message.sender)
                    const senderName = message.senderName || senderContact?.ensName || formatEnsName(shortenAddress(message.sender))
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

            <div className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Type a message..."
                  value={messageInput}
                  onChange={(e) => {
                    setMessageInput(e.target.value)
                    // Set typing status when user starts typing
                    if (e.target.value.trim() && !messageInput.trim()) {
                      setTypingStatus(true)
                    } else if (!e.target.value.trim() && messageInput.trim()) {
                      setTypingStatus(false)
                    }
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  onBlur={() => setTypingStatus(false)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendMessage} 
                  disabled={!messageInput.trim() || isMessagePending || isContractPending || isContractConfirming} 
                  className="glow-hover shrink-0"
                >
                  {isMessagePending || isContractPending || isContractConfirming ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
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
                variant="outline"
                className="lg:hidden mb-4 bg-transparent"
                onClick={() => setIsMobileSidebarOpen(true)}
              >
                <Menu className="w-4 h-4 mr-2" />
                Open Chats
              </Button>
              <div className="w-16 h-16 rounded-full gradient-bg flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-2">Welcome to SOMChat</h3>
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
