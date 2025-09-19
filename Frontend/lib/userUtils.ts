import { readContract } from '@wagmi/core'
import { config } from '@/lib/wagmi'
import { CONTRACTS, USER_REGISTRY_ABI } from '@/lib/contracts'
import { Address } from 'viem'

export async function fetchUserDetails(userAddress: Address): Promise<[string, string] | null> {
  try {
    const result = await readContract(config, {
      address: CONTRACTS.USER_REGISTRY,
      abi: USER_REGISTRY_ABI,
      functionName: 'getUserDetails',
      args: [userAddress],
    })
    // Extract only the first two values (ensName, avatarHash) and ignore the registered boolean
    const [ensName, avatarHash] = result as [string, string, boolean]
    return [ensName, avatarHash]
  } catch (error) {
    console.error('Error fetching user details:', error)
    return null
  }
}

export function formatEnsName(ensName: string): string {
  return ensName.endsWith('.eth') ? ensName : `${ensName}.eth`
}

export function getIpfsUrl(hash: string): string {
  if (!hash || hash === '') return ''
  return `https://ipfs.io/ipfs/${hash}`
}
