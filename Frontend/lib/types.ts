import { Address } from 'viem'

// User types
export interface User {
  address: Address
  ensName: string
  avatarHash: string
  registered: boolean
}

// Message types
export interface Message {
  sender: Address
  receiver: Address
  content: string
  timestamp: bigint
}

// Group types
export interface Group {
  id: number
  name: string
  avatarHash: string
  members: Address[]
}

// Chat conversation types
export interface Conversation {
  id: string
  participants: Address[]
  messages: Message[]
  isGroup: boolean
  groupId?: number
}

// UI state types
export interface ChatState {
  activeConversation: string | null
  users: User[]
  groups: Group[]
  conversations: Record<string, Conversation>
  loading: boolean
  error: string | null
}

// Contract interaction types
export interface ContractError {
  message: string
  code?: string
}

export interface TransactionResult {
  hash: string
  success: boolean
  error?: ContractError
}
