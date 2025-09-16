import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  where, 
  serverTimestamp,
  Timestamp,
  DocumentData,
  QuerySnapshot
} from 'firebase/firestore'
import { db } from './firebase'
import { Address } from 'viem'

export interface FirebaseMessage {
  id?: string
  sender: Address
  receiver?: Address
  groupId?: number
  content: string
  timestamp: Timestamp
  type: 'direct' | 'group'
  conversationId: string
}

export interface MessageListener {
  unsubscribe: () => void
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

// Send a direct message
export async function sendDirectMessage(
  sender: Address,
  receiver: Address,
  content: string
): Promise<void> {
  const conversationId = generateConversationId(sender, receiver)
  
  await addDoc(collection(db, 'messages'), {
    sender,
    receiver,
    content,
    timestamp: serverTimestamp(),
    type: 'direct',
    conversationId
  })
}

// Send a group message
export async function sendGroupMessage(
  sender: Address,
  groupId: number,
  content: string
): Promise<void> {
  const conversationId = generateGroupConversationId(groupId)
  
  await addDoc(collection(db, 'messages'), {
    sender,
    groupId,
    content,
    timestamp: serverTimestamp(),
    type: 'group',
    conversationId
  })
}

// Listen to direct messages between two users
export function listenToDirectMessages(
  user1: Address,
  user2: Address,
  callback: (messages: FirebaseMessage[]) => void
): MessageListener {
  const conversationId = generateConversationId(user1, user2)
  
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    where('type', '==', 'direct'),
    orderBy('timestamp', 'asc')
  )

  const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages: FirebaseMessage[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseMessage))
    
    callback(messages)
  })

  return { unsubscribe }
}

// Listen to group messages
export function listenToGroupMessages(
  groupId: number,
  callback: (messages: FirebaseMessage[]) => void
): MessageListener {
  const conversationId = generateGroupConversationId(groupId)
  
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    where('type', '==', 'group'),
    orderBy('timestamp', 'asc')
  )

  const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages: FirebaseMessage[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as FirebaseMessage))
    
    callback(messages)
  })

  return { unsubscribe }
}

// Get recent conversations for a user
export function listenToUserConversations(
  userAddress: Address,
  callback: (conversations: any[]) => void
): MessageListener {
  const q = query(
    collection(db, 'messages'),
    where('sender', '==', userAddress),
    orderBy('timestamp', 'desc')
  )

  const unsubscribe = onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    // Process and group messages by conversation
    const conversationMap = new Map()
    
    snapshot.docs.forEach(doc => {
      const message = { id: doc.id, ...doc.data() } as FirebaseMessage
      const convId = message.conversationId
      
      if (!conversationMap.has(convId) || 
          conversationMap.get(convId).timestamp < message.timestamp) {
        conversationMap.set(convId, message)
      }
    })
    
    callback(Array.from(conversationMap.values()))
  })

  return { unsubscribe }
}
