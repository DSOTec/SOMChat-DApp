import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a function to get the Supabase client safely
const createSupabaseClient = () => {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase URL or Anon Key not provided. Some features may not work.')
    // Return a mock client for build time
    return null as any
  }

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false, // We handle auth via wallet connection
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  })
}

export const supabase = createSupabaseClient()

// Set the current user context for RLS policies
export const setSupabaseUserContext = async (walletAddress: string) => {
  if (!supabase) {
    console.warn('Supabase client not available')
    return
  }

  try {
    const { error } = await supabase.rpc('set_config', {
      setting_name: 'app.current_user_wallet',
      setting_value: walletAddress,
      is_local: true
    })
    
    if (error) {
      console.error('Error setting user context:', error)
    }
  } catch (err) {
    console.error('Error setting user context:', err)
  }
}

// Database types
export interface User {
  id: string
  wallet_address: string
  ens_name?: string
  avatar_hash?: string
  created_at: string
  updated_at: string
}

export interface Message {
  id: string
  sender_wallet: string
  receiver_wallet: string
  content: string
  message_type: 'text' | 'image' | 'file'
  timestamp: string
  is_read: boolean
}

export interface Group {
  id: string
  name: string
  description?: string
  creator_wallet: string
  avatar_hash?: string
  created_at: string
  updated_at: string
}

export interface GroupMember {
  id: string
  group_id: string
  wallet_address: string
  role: 'admin' | 'member'
  joined_at: string
}

export interface GroupMessage {
  id: string
  group_id: string
  sender_wallet: string
  content: string
  message_type: 'text' | 'image' | 'file'
  timestamp: string
}
