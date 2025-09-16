"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { supabase, setSupabaseUserContext, type Group, type GroupMember, type GroupMessage } from '@/lib/supabase'
import { Address } from 'viem'

export function useSupabaseGroups() {
  const { address, isConnected } = useAccount()
  const [groups, setGroups] = useState<Group[]>([])
  const [groupMessages, setGroupMessages] = useState<GroupMessage[]>([])
  const [groupMembers, setGroupMembers] = useState<GroupMember[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set user context when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      setSupabaseUserContext(address.toLowerCase())
    }
  }, [isConnected, address])

  // Create a new group
  const createGroup = useCallback(async (name: string, description?: string, avatarHash?: string) => {
    if (!address) return null

    try {
      setIsLoading(true)
      
      // Create the group
      const { data: group, error: groupError } = await supabase
        .from('groups')
        .insert({
          name,
          description,
          creator_wallet: address.toLowerCase(),
          avatar_hash: avatarHash
        })
        .select()
        .single()

      if (groupError) throw groupError

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('group_members')
        .insert({
          group_id: group.id,
          wallet_address: address.toLowerCase(),
          role: 'admin'
        })

      if (memberError) throw memberError

      return group
    } catch (err) {
      console.error('Error creating group:', err)
      setError(err instanceof Error ? err.message : 'Failed to create group')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Get user's groups
  const getUserGroups = useCallback(async () => {
    if (!address) return []

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('groups')
        .select(`
          *,
          group_members!inner(wallet_address, role)
        `)
        .eq('group_members.wallet_address', address.toLowerCase())
        .order('created_at', { ascending: false })

      if (error) throw error
      setGroups(data || [])
      return data
    } catch (err) {
      console.error('Error fetching groups:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch groups')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Add member to group
  const addGroupMember = useCallback(async (groupId: string, walletAddress: Address, role: 'admin' | 'member' = 'member') => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          wallet_address: walletAddress.toLowerCase(),
          role
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error adding group member:', err)
      setError(err instanceof Error ? err.message : 'Failed to add group member')
      return null
    }
  }, [])

  // Get group members
  const getGroupMembers = useCallback(async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          users(wallet_address, ens_name, avatar_hash)
        `)
        .eq('group_id', groupId)
        .order('joined_at', { ascending: true })

      if (error) throw error
      setGroupMembers(data || [])
      return data
    } catch (err) {
      console.error('Error fetching group members:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch group members')
      return []
    }
  }, [])

  // Send group message
  const sendGroupMessage = useCallback(async (groupId: string, content: string) => {
    if (!address) return null

    try {
      const { data, error } = await supabase
        .from('group_messages')
        .insert({
          group_id: groupId,
          sender_wallet: address.toLowerCase(),
          content,
          message_type: 'text'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error sending group message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send group message')
      return null
    }
  }, [address])

  // Get group messages
  const getGroupMessages = useCallback(async (groupId: string) => {
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('group_messages')
        .select('*')
        .eq('group_id', groupId)
        .order('timestamp', { ascending: true })

      if (error) throw error
      setGroupMessages(data || [])
      return data
    } catch (err) {
      console.error('Error fetching group messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch group messages')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Subscribe to group messages
  const subscribeToGroupMessages = useCallback((groupId: string, callback: (message: GroupMessage) => void) => {
    const channel = supabase
      .channel(`group_messages_${groupId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'group_messages',
          filter: `group_id=eq.${groupId}`
        },
        (payload) => {
          callback(payload.new as GroupMessage)
        }
      )
      .subscribe()

    return channel
  }, [])

  // Subscribe to group updates
  const subscribeToGroups = useCallback((callback: (group: Group) => void) => {
    if (!address) return null

    const channel = supabase
      .channel('groups')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'groups'
        },
        (payload) => {
          callback(payload.new as Group)
        }
      )
      .subscribe()

    return channel
  }, [address])

  return {
    groups,
    groupMessages,
    groupMembers,
    isLoading,
    error,
    createGroup,
    getUserGroups,
    addGroupMember,
    getGroupMembers,
    sendGroupMessage,
    getGroupMessages,
    subscribeToGroupMessages,
    subscribeToGroups
  }
}
