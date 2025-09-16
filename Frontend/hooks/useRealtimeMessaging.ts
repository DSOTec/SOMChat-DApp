'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import { 
  sendDirectMessage, 
  sendGroupMessage, 
  listenToDirectMessages, 
  listenToGroupMessages,
  FirebaseMessage,
  MessageListener
} from '@/lib/messaging'
import { toast } from 'sonner'

export interface RealtimeMessage {
  id: string
  sender: Address
  receiver?: Address
  groupId?: number
  content: string
  timestamp: Date
  isSent: boolean
  senderName?: string
}

export function useRealtimeMessaging() {
  const { address } = useAccount()
  const [messages, setMessages] = useState<RealtimeMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Send direct message
  const sendRealtimeMessage = useCallback(async (
    receiver: Address, 
    content: string
  ) => {
    if (!address) {
      toast.error('Wallet not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await sendDirectMessage(address, receiver, content)
      toast.success('Message sent!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send message'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Send group message
  const sendRealtimeGroupMessage = useCallback(async (
    groupId: number, 
    content: string
  ) => {
    if (!address) {
      toast.error('Wallet not connected')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      await sendGroupMessage(address, groupId, content)
      toast.success('Group message sent!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to send group message'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Listen to direct messages
  const useDirectMessages = useCallback((
    user1: Address, 
    user2: Address
  ) => {
    const [directMessages, setDirectMessages] = useState<RealtimeMessage[]>([])
    const [listener, setListener] = useState<MessageListener | null>(null)

    useEffect(() => {
      if (!user1 || !user2) {
        setDirectMessages([])
        return
      }

      const messageListener = listenToDirectMessages(user1, user2, (firebaseMessages) => {
        const realtimeMessages: RealtimeMessage[] = firebaseMessages.map(msg => ({
          id: msg.id || '',
          sender: msg.sender,
          receiver: msg.receiver,
          content: msg.content,
          timestamp: msg.timestamp?.toDate() || new Date(),
          isSent: msg.sender === address,
          senderName: msg.sender === address ? 'You' : msg.sender.slice(0, 6) + '...'
        }))
        
        setDirectMessages(realtimeMessages)
      })

      setListener(messageListener)

      return () => {
        messageListener.unsubscribe()
      }
    }, [user1, user2, address])

    return directMessages
  }, [address])

  // Listen to group messages
  const useGroupMessages = useCallback((groupId: number) => {
    const [groupMessages, setGroupMessages] = useState<RealtimeMessage[]>([])

    useEffect(() => {
      if (!groupId) {
        setGroupMessages([])
        return
      }

      const messageListener = listenToGroupMessages(groupId, (firebaseMessages) => {
        const realtimeMessages: RealtimeMessage[] = firebaseMessages.map(msg => ({
          id: msg.id || '',
          sender: msg.sender,
          groupId: msg.groupId,
          content: msg.content,
          timestamp: msg.timestamp?.toDate() || new Date(),
          isSent: msg.sender === address,
          senderName: msg.sender === address ? 'You' : msg.sender.slice(0, 6) + '...'
        }))
        
        setGroupMessages(realtimeMessages)
      })

      return () => {
        messageListener.unsubscribe()
      }
    }, [groupId, address])

    return groupMessages
  }, [address])

  return {
    messages,
    isLoading,
    error,
    sendRealtimeMessage,
    sendRealtimeGroupMessage,
    useDirectMessages,
    useGroupMessages
  }
}
