'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { Address } from 'viem'
import { 
  collection, 
  doc, 
  setDoc, 
  onSnapshot, 
  query, 
  where, 
  serverTimestamp,
  deleteDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

interface TypingStatus {
  userId: Address
  conversationId: string
  isTyping: boolean
  timestamp: any
}

export function useTypingIndicator(conversationId: string) {
  const { address } = useAccount()
  const [typingUsers, setTypingUsers] = useState<Address[]>([])
  const [isTyping, setIsTyping] = useState(false)

  // Listen to typing indicators for this conversation
  useEffect(() => {
    if (!conversationId) return

    const q = query(
      collection(db, 'typing'),
      where('conversationId', '==', conversationId),
      where('isTyping', '==', true)
    )

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const typingUsersList: Address[] = []
      
      snapshot.docs.forEach(doc => {
        const data = doc.data() as TypingStatus
        if (data.userId !== address) { // Don't include current user
          typingUsersList.push(data.userId)
        }
      })
      
      setTypingUsers(typingUsersList)
    })

    return () => unsubscribe()
  }, [conversationId, address])

  // Set typing status
  const setTypingStatus = useCallback(async (typing: boolean) => {
    if (!address || !conversationId) return

    const typingDocRef = doc(db, 'typing', `${conversationId}_${address}`)

    if (typing) {
      await setDoc(typingDocRef, {
        userId: address,
        conversationId,
        isTyping: true,
        timestamp: serverTimestamp()
      })
      setIsTyping(true)
    } else {
      await deleteDoc(typingDocRef)
      setIsTyping(false)
    }
  }, [address, conversationId])

  // Auto-clear typing status after 3 seconds of inactivity
  useEffect(() => {
    if (!isTyping) return

    const timeout = setTimeout(() => {
      setTypingStatus(false)
    }, 3000)

    return () => clearTimeout(timeout)
  }, [isTyping, setTypingStatus])

  return {
    typingUsers,
    isTyping,
    setTypingStatus
  }
}
