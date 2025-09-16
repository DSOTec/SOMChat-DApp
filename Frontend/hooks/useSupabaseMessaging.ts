"use client"

import { useState, useEffect, useCallback } from 'react'
import { useAccount } from 'wagmi'
import { supabase, setSupabaseUserContext, type Message, type User } from '@/lib/supabase'
import { Address } from 'viem'

export function useSupabaseMessaging() {
  const { address, isConnected } = useAccount()
  const [messages, setMessages] = useState<Message[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Set user context when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      setSupabaseUserContext(address.toLowerCase())
    }
  }, [isConnected, address])

  // Register or update user in database
  const registerUser = useCallback(async (ensName?: string, avatarHash?: string) => {
    if (!address || !supabase) return null

    try {
      const { data, error } = await supabase
        .from('users')
        .upsert({
          wallet_address: address.toLowerCase(),
          ens_name: ensName,
          avatar_hash: avatarHash,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'wallet_address'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error registering user:', err)
      setError(err instanceof Error ? err.message : 'Failed to register user')
      return null
    }
  }, [address])

  // Get all registered users
  const getUsers = useCallback(async () => {
    if (!supabase) return []
    
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
      return data
    } catch (err) {
      console.error('Error fetching users:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Send a message
  const sendMessage = useCallback(async (receiverWallet: Address, content: string) => {
    if (!address || !supabase) return null

    try {
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_wallet: address.toLowerCase(),
          receiver_wallet: receiverWallet.toLowerCase(),
          content,
          message_type: 'text'
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (err) {
      console.error('Error sending message:', err)
      setError(err instanceof Error ? err.message : 'Failed to send message')
      return null
    }
  }, [address])

  // Get messages for a conversation
  const getMessages = useCallback(async (otherWallet: Address) => {
    if (!address || !supabase) return []

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`and(sender_wallet.eq.${address.toLowerCase()},receiver_wallet.eq.${otherWallet.toLowerCase()}),and(sender_wallet.eq.${otherWallet.toLowerCase()},receiver_wallet.eq.${address.toLowerCase()})`)
        .order('timestamp', { ascending: true })

      if (error) throw error
      setMessages(data || [])
      return data
    } catch (err) {
      console.error('Error fetching messages:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch messages')
      return []
    } finally {
      setIsLoading(false)
    }
  }, [address])

  // Mark messages as read
  const markMessagesAsRead = useCallback(async (senderWallet: Address) => {
    if (!address || !supabase) return

    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('sender_wallet', senderWallet.toLowerCase())
        .eq('receiver_wallet', address.toLowerCase())
        .eq('is_read', false)

      if (error) throw error
    } catch (err) {
      console.error('Error marking messages as read:', err)
    }
  }, [address])

  // Subscribe to realtime messages
  const subscribeToMessages = useCallback((callback: (message: Message) => void) => {
    if (!address || !supabase) return null

    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `or(sender_wallet.eq.${address.toLowerCase()},receiver_wallet.eq.${address.toLowerCase()})`
        },
        (payload: any) => {
          callback(payload.new as Message)
        }
      )
      .subscribe()

    return channel
  }, [address])

  // Subscribe to user updates
  const subscribeToUsers = useCallback((callback: (user: User) => void) => {
    if (!supabase) return null
    
    const channel = supabase
      .channel('users')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        (payload: any) => {
          callback(payload.new as User)
        }
      )
      .subscribe()

    return channel
  }, [])

  return {
    messages,
    users,
    isLoading,
    error,
    registerUser,
    getUsers,
    sendMessage,
    getMessages,
    markMessagesAsRead,
    subscribeToMessages,
    subscribeToUsers
  }
}
