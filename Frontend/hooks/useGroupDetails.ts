import { useState, useEffect } from 'react'
import { Address } from 'viem'
import { useChatApp } from './useChatApp'

export interface GroupDetails {
  id: number
  name: string
  avatarHash: string
  members: Address[]
  memberCount: number
}

export function useGroupDetails(groupId?: number) {
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const { useGroupDetails: useContractGroupDetails } = useChatApp()
  const { data: contractData, isLoading: contractLoading, error: contractError } = useContractGroupDetails(groupId)

  useEffect(() => {
    if (!groupId) {
      setGroupDetails(null)
      return
    }

    setIsLoading(contractLoading)
    setError(contractError?.message || null)

    if (contractData && Array.isArray(contractData) && contractData.length >= 3) {
      const [name, avatarHash, members] = contractData
      setGroupDetails({
        id: groupId,
        name: name || `Group ${groupId}`,
        avatarHash: avatarHash || '',
        members: members || [],
        memberCount: members?.length || 0
      })
    }
  }, [groupId, contractData, contractLoading, contractError])

  return { groupDetails, isLoading, error }
}

export function useAllGroupDetails(totalGroups?: bigint) {
  const [allGroups, setAllGroups] = useState<GroupDetails[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const fetchAllGroups = async () => {
      if (!totalGroups || Number(totalGroups) === 0) {
        setAllGroups([])
        return
      }

      setIsLoading(true)
      const groups: GroupDetails[] = []
      
      // For now, we'll create placeholder groups since the contract calls might be complex
      // TODO: Implement proper batch fetching of group details
      for (let i = 1; i <= Number(totalGroups); i++) {
        groups.push({
          id: i,
          name: `Group ${i}`,
          avatarHash: '',
          members: [],
          memberCount: 0
        })
      }
      
      setAllGroups(groups)
      setIsLoading(false)
    }

    fetchAllGroups()
  }, [totalGroups])

  return { allGroups, isLoading }
}
