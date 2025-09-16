import { useState, useEffect, useMemo } from 'react'
import { Address } from 'viem'
import { useUserRegistry } from '@/hooks/useUserRegistry'
import { fetchUserDetails, formatEnsName, getIpfsUrl } from '@/lib/userUtils'
import { shortenAddress } from '@/lib/utils'

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

interface ContactCache {
  [address: string]: {
    ensName: string
    avatar?: string
    timestamp: number
  }
}

const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
const contactCache: ContactCache = {}

export function useOptimizedContacts(currentAddress?: Address) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const { useAllUsers } = useUserRegistry()
  const { data: allUsers } = useAllUsers()

  // Memoize filtered users to avoid recalculation
  const filteredUsers = useMemo(() => {
    if (!allUsers || !currentAddress) return []
    return allUsers.filter(userAddr => userAddr !== currentAddress)
  }, [allUsers, currentAddress])

  useEffect(() => {
    const loadContactsOptimized = async () => {
      if (!filteredUsers.length) return

      setIsLoading(true)
      const now = Date.now()
      const contactList: Contact[] = []

      // Process contacts in batches to avoid overwhelming the network
      const batchSize = 5
      for (let i = 0; i < filteredUsers.length; i += batchSize) {
        const batch = filteredUsers.slice(i, i + batchSize)
        
        const batchPromises = batch.map(async (userAddr) => {
          // Check cache first
          const cached = contactCache[userAddr]
          if (cached && (now - cached.timestamp) < CACHE_DURATION) {
            return {
              id: userAddr,
              address: userAddr,
              ensName: cached.ensName,
              avatar: cached.avatar,
              lastMessage: "Click to chat",
              timestamp: "",
              isOnline: Math.random() > 0.5
            }
          }

          try {
            // Fetch user details with timeout
            const userDetailsResult = await Promise.race([
              fetchUserDetails(userAddr),
              new Promise<null>((_, reject) => 
                setTimeout(() => reject(new Error('Timeout')), 3000)
              )
            ])

            const ensName = userDetailsResult?.[0] || shortenAddress(userAddr)
            const avatarHash = userDetailsResult?.[1] || ''
            const avatar = avatarHash ? getIpfsUrl(avatarHash) : undefined

            // Cache the result
            contactCache[userAddr] = {
              ensName: formatEnsName(ensName),
              avatar,
              timestamp: now
            }

            return {
              id: userAddr,
              address: userAddr,
              ensName: formatEnsName(ensName),
              avatar,
              lastMessage: "Click to chat",
              timestamp: "",
              isOnline: Math.random() > 0.5
            }
          } catch (error) {
            // Fallback for failed requests
            const fallbackName = formatEnsName(shortenAddress(userAddr))
            
            // Cache fallback to avoid repeated failures
            contactCache[userAddr] = {
              ensName: fallbackName,
              timestamp: now
            }

            return {
              id: userAddr,
              address: userAddr,
              ensName: fallbackName,
              lastMessage: "Click to chat",
              timestamp: "",
              isOnline: Math.random() > 0.5
            }
          }
        })

        // Process batch and add to contacts
        const batchResults = await Promise.all(batchPromises)
        contactList.push(...batchResults)
        
        // Update UI progressively for better UX
        setContacts([...contactList])
      }

      setIsLoading(false)
    }

    loadContactsOptimized()
  }, [filteredUsers])

  return { contacts, isLoading }
}
