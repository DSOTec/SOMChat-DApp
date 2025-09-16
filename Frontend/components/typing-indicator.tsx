'use client'

import { Address } from 'viem'
import { shortenAddress } from '@/lib/utils'
import { formatEnsName } from '@/lib/userUtils'

interface TypingIndicatorProps {
  typingUsers: Address[]
  className?: string
  contacts?: Array<{ address: Address; ensName: string }>
}

export function TypingIndicator({ typingUsers, className = '', contacts = [] }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null

  const getUserDisplayName = (address: Address) => {
    const contact = contacts.find(c => c.address === address)
    return contact?.ensName || formatEnsName(shortenAddress(address))
  }

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${getUserDisplayName(typingUsers[0])} is typing...`
    } else if (typingUsers.length === 2) {
      return `${getUserDisplayName(typingUsers[0])} and ${getUserDisplayName(typingUsers[1])} are typing...`
    } else {
      return `${typingUsers.length} people are typing...`
    }
  }

  return (
    <div className={`flex items-center gap-2 text-sm text-muted-foreground p-3 ${className}`}>
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  )
}
