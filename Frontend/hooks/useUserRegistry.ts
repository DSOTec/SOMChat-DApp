import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Address } from 'viem'
import { CONTRACTS, USER_REGISTRY_ABI } from '@/lib/contracts'
import { User } from '@/lib/types'

export function useUserRegistry() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()

  // Register a new user
  const registerUser = async (ensName: string, avatarHash: string = '') => {
    return writeContract({
      address: CONTRACTS.USER_REGISTRY,
      abi: USER_REGISTRY_ABI,
      functionName: 'registerUser',
      args: [ensName, avatarHash],
    })
  }

  // Check if user is registered
  const useIsUserRegistered = (userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.USER_REGISTRY,
      abi: USER_REGISTRY_ABI,
      functionName: 'isUserRegistered',
      args: userAddress ? [userAddress] : undefined,
      query: {
        enabled: !!userAddress,
      },
    })
  }

  // Get user details
  const useUserDetails = (userAddress?: Address) => {
    return useReadContract({
      address: CONTRACTS.USER_REGISTRY,
      abi: USER_REGISTRY_ABI,
      functionName: 'getUserDetails',
      args: userAddress ? [userAddress] : undefined,
      query: {
        enabled: !!userAddress,
      },
    })
  }

  // Get all registered users
  const useAllUsers = () => {
    return useReadContract({
      address: CONTRACTS.USER_REGISTRY,
      abi: USER_REGISTRY_ABI,
      functionName: 'getAllUsers',
    })
  }

  // Get user count
  const useUserCount = () => {
    return useReadContract({
      address: CONTRACTS.USER_REGISTRY,
      abi: USER_REGISTRY_ABI,
      functionName: 'getUserCount',
    })
  }

  // Wait for transaction confirmation
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
    hash,
  })

  // Delete current user
  const deleteUser = async () => {
    return writeContract({
      address: CONTRACTS.USER_REGISTRY,
      abi: USER_REGISTRY_ABI,
      functionName: 'deleteUser',
      args: [],
    })
  }

  // Delete another user
  const deleteOtherUser = async (userAddress: Address) => {
    return writeContract({
      address: CONTRACTS.USER_REGISTRY,
      abi: USER_REGISTRY_ABI,
      functionName: 'deleteOtherUser',
      args: [userAddress],
    })
  }

  return {
    registerUser,
    deleteUser,
    deleteOtherUser,
    useIsUserRegistered,
    useUserDetails,
    useAllUsers,
    useUserCount,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    hash,
  }
}
