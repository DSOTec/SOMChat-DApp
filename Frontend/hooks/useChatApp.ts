import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi'
import { Address } from 'viem'
import { CONTRACTS, CHAT_APP_ABI } from '@/lib/contracts'
import { Message, Group } from '@/lib/types'

export function useChatApp() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  const { address } = useAccount()

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
  const createGroup = async (name: string, avatarHash: string, members: Address[]) => {
    console.log('useChatApp createGroup called with:', {
      name,
      avatarHash,
      members,
      contractAddress: CONTRACTS.CHAT_APP
    })
    
    // Check wallet connection
    if (!address) {
      throw new Error('Wallet not connected')
    }
    
    // Validate parameters
    if (!name || name.trim().length === 0) {
      throw new Error('Group name is required')
    }
    
    if (!members || members.length === 0) {
      throw new Error('At least one member is required')
    }
    
    console.log('Wallet connected:', address)
    console.log('Contract address:', CONTRACTS.CHAT_APP)
    console.log('Function args:', [name, avatarHash, members])
    
    try {
      const result = await writeContract({
        address: CONTRACTS.CHAT_APP,
        abi: CHAT_APP_ABI,
        functionName: 'createGroup',
        args: [name, avatarHash, members],
      })
      console.log('writeContract result:', result)
      
      // writeContract returns void, so we check if the transaction was submitted
      // The actual transaction hash will be available in the 'hash' variable from useWriteContract
      
      return result
    } catch (error: any) {
      console.error('writeContract error in useChatApp:', error)
      
      if (error?.message?.includes('User rejected')) {
        throw new Error('Transaction was rejected by user')
      } else if (error?.message?.includes('insufficient funds')) {
        throw new Error('Insufficient funds for gas fees')
      } else if (error?.shortMessage) {
        throw new Error(`Contract error: ${error.shortMessage}`)
      }
      
      throw error
    }
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

  // Post price data to a group (manual trigger)
  const postPriceToGroup = async (groupId: number) => {
    return writeContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'postPriceToGroup',
      args: [BigInt(groupId)],
    })
  }

  // Get latest price from a Chainlink feed
  const useLatestPrice = (feedAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'getLatestPrice',
      args: feedAddress ? [feedAddress] : undefined,
      query: {
        enabled: !!feedAddress,
      },
    })
  }

  // Check if a message is from the oracle
  const useIsOracleMessage = (sender?: Address) => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'isOracleMessage',
      args: sender ? [sender] : undefined,
      query: {
        enabled: !!sender,
      },
    })
  }

  // Get automation interval
  const useAutomationInterval = () => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'interval',
    })
  }

  // Get last automation timestamp
  const useLastTimeStamp = () => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'lastTimeStamp',
    })
  }

  // Get default group ID for automation
  const useDefaultGroupId = () => {
    return useReadContract({
      address: CONTRACTS.CHAT_APP,
      abi: CHAT_APP_ABI,
      functionName: 'defaultGroupId',
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
    postPriceToGroup,
    useConversation,
    useGroupConversation,
    useGroupDetails,
    useIsGroupMember,
    useTotalGroups,
    useLatestPrice,
    useIsOracleMessage,
    useAutomationInterval,
    useLastTimeStamp,
    useDefaultGroupId,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  }
}
