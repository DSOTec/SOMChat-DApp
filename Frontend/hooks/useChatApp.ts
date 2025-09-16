import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address } from 'viem'
import { CONTRACTS, CHAT_APP_ABI } from '@/lib/contracts'
import { Message, Group } from '@/lib/types'

export function useChatApp() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Send a direct message
  const sendMessage = async (to: Address, content: string) => {
    return writeContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'sendMessage',
      args: [to, content],
    })
  }

  // Send a group message
  const sendGroupMessage = async (groupId: number, content: string) => {
    return writeContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'sendGroupMessage',
      args: [BigInt(groupId), content],
    })
  }

  // Create a new group
  const createGroup = async (name: string, members: Address[], avatarHash: string = '') => {
    return writeContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'createGroup',
      args: [name, avatarHash, members],
    })
  }

  // Get conversation between two users
  const useConversation = (user1?: Address, user2?: Address) => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'getConversation',
      args: user1 && user2 ? [user1, user2] : undefined,
      query: {
        enabled: !!(user1 && user2),
      },
    })
  }

  // Get group conversation
  const useGroupConversation = (groupId?: number) => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'getGroupConversation',
      args: groupId ? [BigInt(groupId)] : undefined,
      query: {
        enabled: !!groupId,
      },
    })
  }

  // Get group details
  const useGroupDetails = (groupId?: number) => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'getGroupDetails',
      args: groupId ? [BigInt(groupId)] : undefined,
      query: {
        enabled: !!groupId,
      },
    })
  }

  // Check if user is group member
  const useIsGroupMember = (groupId?: number, userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'isGroupMember',
      args: groupId && userAddress ? [BigInt(groupId), userAddress] : undefined,
      query: {
        enabled: !!(groupId && userAddress),
      },
    })
  }

  // Get total number of groups
  const useTotalGroups = () => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'getTotalGroups',
    })
  }

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  return {
    sendMessage,
    sendGroupMessage,
    createGroup,
    useConversation,
    useGroupConversation,
    useGroupDetails,
    useIsGroupMember,
    useTotalGroups,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  }
}
