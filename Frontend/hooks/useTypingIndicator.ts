'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { Address } from 'viem'

interface TypingStatus {
  userId: Address
  conversationId: string
  isTyping: boolean
  timestamp: number
}

export function useTypingIndicator(conversationId: string) {
  const { address } = useAccount()
  const [typingUsers, setTypingUsers] = useState<Address[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // Set typing status (local only for now)
  const setTypingStatus = useCallback((typing: boolean) => {
    if (!address || !conversationId) return
    setIsTyping(typing)
  }, [address, conversationId])

  // Auto-clear typing status after 3 seconds of inactivity
  useEffect(() => {
    if (!isTyping) return

    const timeout = setTimeout(() => {
      setIsTyping(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [isTyping])

  return {
    typingUsers,
    isTyping,
    setTypingStatus
  }
}
