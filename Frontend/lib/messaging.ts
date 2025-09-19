import { Address } from 'viem'

export interface OnChainMessage {
  id: string
  sender: Address
  receiver?: Address
  groupId?: number
  content: string
  timestamp: Date
  type: 'direct' | 'group'
  conversationId: string
  isSent: boolean
  senderName?: string
}

// Generate conversation ID for direct messages
export function generateConversationId(user1: Address, user2: Address): string {
  const addresses = [user1.toLowerCase(), user2.toLowerCase()].sort()
  return `direct_${addresses[0]}_${addresses[1]}`
}

// Generate conversation ID for group messages
export function generateGroupConversationId(groupId: number): string {
  return `group_${groupId}`
}

// Convert blockchain message to OnChainMessage format
export function convertBlockchainMessage(
  message: any,
  currentUserAddress: Address,
  messageId: string
): OnChainMessage {
  return {
    id: messageId,
    sender: message.sender,
    receiver: message.receiver !== '0x0000000000000000000000000000000000000000' ? message.receiver : undefined,
    groupId: message.receiver === '0x0000000000000000000000000000000000000000' ? undefined : undefined,
    content: message.content,
    timestamp: new Date(Number(message.timestamp) * 1000),
    type: message.receiver === '0x0000000000000000000000000000000000000000' ? 'group' : 'direct',
    conversationId: message.receiver === '0x0000000000000000000000000000000000000000' 
      ? 'group_conversation' 
      : generateConversationId(message.sender, message.receiver),
    isSent: message.sender.toLowerCase() === currentUserAddress.toLowerCase()
  }
}
