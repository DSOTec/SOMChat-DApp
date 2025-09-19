import { useState, useEffect, useCallback } from 'react'
import { useAccount, useWatchContractEvent } from 'wagmi'
import { Address } from 'viem'
import { useChatApp } from './useChatApp'
import { OnChainMessage, convertBlockchainMessage } from '@/lib/messaging'
import { fetchUserDetails, formatEnsName } from '@/lib/userUtils'
import { shortenAddress } from '@/lib/utils'
import { CONTRACTS, CHAT_APP_ABI } from '@/lib/contracts'

export function useOnChainMessaging() {
  const { address } = useAccount()
  const { 
    sendMessage, 
    sendGroupMessage, 
    useConversation, 
    useGroupConversation,
    isPending,
    isConfirming,
    error 
  } = useChatApp()

  // Send a direct message on-chain
  const sendDirectMessage = useCallback(async (to: Address, content: string) => {
    if (!address) throw new Error('Wallet not connected')
    return await sendMessage(to, content)
  }, [address, sendMessage])

  // Send a group message on-chain
  const sendOnChainGroupMessage = useCallback(async (groupId: number, content: string) => {
    if (!address) throw new Error('Wallet not connected')
    return await sendGroupMessage(groupId, content)
  }, [address, sendGroupMessage])

  return {
    sendDirectMessage,
    sendGroupMessage: sendOnChainGroupMessage,
    isPending,
    isConfirming,
    error
  }
}

// Hook to get direct messages between two users
export function useDirectMessages(user1?: Address, user2?: Address) {
  const [messages, setMessages] = useState<OnChainMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAccount()
  
  const { 
    useConversation
  } = useChatApp()
  const { data: conversationData, refetch } = useConversation(user1, user2)

  // Watch for new direct messages in real-time
  useWatchContractEvent({
    address: CONTRACTS.CHAT_APP,
    abi: CHAT_APP_ABI,
    eventName: 'MessageSent',
    args: user1 && user2 ? {
      from: user1,
      to: user2
    } : undefined,
    onLogs: (logs) => {
      console.log('New direct message detected:', logs)
      // Refetch messages when new ones are detected
      refetch()
    },
    enabled: !!(user1 && user2),
  })

  // Also watch for messages in the reverse direction
  useWatchContractEvent({
    address: CONTRACTS.CHAT_APP,
    abi: CHAT_APP_ABI,
    eventName: 'MessageSent',
    args: user1 && user2 ? {
      from: user2,
      to: user1
    } : undefined,
    onLogs: (logs) => {
      console.log('New direct message detected (reverse):', logs)
      // Refetch messages when new ones are detected
      refetch()
    },
    enabled: !!(user1 && user2),
  })

  useEffect(() => {
    const loadMessages = async () => {
      if (!conversationData || !address) {
        setMessages([])
        return
      }

      setIsLoading(true)
      try {
        const messagePromises = conversationData.map(async (msg: any, index: number) => {
          const messageId = `${msg.sender}_${msg.timestamp}_${index}`
          const onChainMessage = convertBlockchainMessage(msg, address, messageId)
          
          // Fetch sender details for display name
          try {
            const senderDetails = await fetchUserDetails(msg.sender)
            onChainMessage.senderName = senderDetails?.[0] 
              ? formatEnsName(senderDetails[0]) 
              : formatEnsName(shortenAddress(msg.sender))
          } catch {
            onChainMessage.senderName = formatEnsName(shortenAddress(msg.sender))
          }
          
          return onChainMessage
        })

        const processedMessages = await Promise.all(messagePromises)
        setMessages(processedMessages)
      } catch (error) {
        console.error('Error loading messages:', error)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [conversationData, address])

  return { messages, isLoading, refetch }
}

// Hook to get group messages with oracle detection and real-time updates
export function useGroupMessages(groupId?: number) {
  const [messages, setMessages] = useState<OnChainMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { address } = useAccount()
  
  const { 
    useGroupConversation
  } = useChatApp()
  const { data: groupConversationData, refetch } = useGroupConversation(groupId)

  // Watch for new group messages in real-time
  useWatchContractEvent({
    address: CONTRACTS.CHAT_APP,
    abi: CHAT_APP_ABI,
    eventName: 'GroupMessageSent',
    args: groupId ? { groupId: BigInt(groupId) } : undefined,
    onLogs: (logs) => {
      console.log('New group message detected:', logs)
      // Refetch messages when new ones are detected
      refetch()
    },
    enabled: !!groupId,
  })

  // Watch for oracle price updates
  useWatchContractEvent({
    address: CONTRACTS.CHAT_APP,
    abi: CHAT_APP_ABI,
    eventName: 'OraclePricesPosted',
    args: groupId ? { groupId: BigInt(groupId) } : undefined,
    onLogs: (logs) => {
      console.log('Oracle prices posted:', logs)
      // Refetch messages when oracle updates are detected
      refetch()
    },
    enabled: !!groupId,
  })

  useEffect(() => {
    const loadMessages = async () => {
      if (!groupConversationData || !address) {
        setMessages([])
        return
      }

      setIsLoading(true)
      try {
        const messagePromises = groupConversationData.map(async (msg: any, index: number) => {
          const messageId = `group_${groupId}_${msg.sender}_${msg.timestamp}_${index}`
          const onChainMessage = convertBlockchainMessage(msg, address, messageId)
          onChainMessage.groupId = groupId
          onChainMessage.type = 'group'
          
          // Check if this is an oracle message (sender is zero address)
          const isOracle = msg.sender === '0x0000000000000000000000000000000000000000'
          onChainMessage.isOracle = isOracle
          
          // Set sender name based on whether it's oracle or user
          if (isOracle) {
            onChainMessage.senderName = 'Oracle Bot'
          } else {
            try {
              const senderDetails = await fetchUserDetails(msg.sender)
              onChainMessage.senderName = senderDetails?.[0] 
                ? formatEnsName(senderDetails[0]) 
                : formatEnsName(shortenAddress(msg.sender))
            } catch {
              onChainMessage.senderName = formatEnsName(shortenAddress(msg.sender))
            }
          }
          
          return onChainMessage
        })

        const processedMessages = await Promise.all(messagePromises)
        // Sort messages by timestamp ascending
        const sortedMessages = processedMessages.sort((a, b) => 
          Number(a.timestamp) - Number(b.timestamp)
        )
        setMessages(sortedMessages)
      } catch (error) {
        console.error('Error loading group messages:', error)
        setMessages([])
      } finally {
        setIsLoading(false)
      }
    }

    loadMessages()
  }, [groupConversationData, address, groupId])

  return { messages, isLoading, refetch }
}
