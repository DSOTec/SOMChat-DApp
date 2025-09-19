'use client'

import { useAccount, useDisconnect } from 'wagmi'
import { useEffect, useState } from 'react'

export function useWalletConnection() {
  const { address, isConnected, isConnecting } = useAccount()
  const { disconnect } = useDisconnect()
  const [hasUserConfirmed, setHasUserConfirmed] = useState(false)
  const [connectionAttempted, setConnectionAttempted] = useState(false)

  // Reset confirmation state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setHasUserConfirmed(false)
      setConnectionAttempted(false)
    }
  }, [isConnected])

  // Only consider connection valid if user has explicitly confirmed
  useEffect(() => {
    if (isConnected && address && connectionAttempted) {
      // Add a delay to ensure the connection was intentional
      const timer = setTimeout(() => {
        setHasUserConfirmed(true)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [isConnected, address, connectionAttempted])

  const initiateConnection = () => {
    setConnectionAttempted(true)
    // Clear any existing connections first
    if (isConnected) {
      disconnect()
    }
  }

  const forceDisconnect = () => {
    setHasUserConfirmed(false)
    setConnectionAttempted(false)
    disconnect()
  }

  return {
    address,
    isConnected: isConnected && hasUserConfirmed,
    isConnecting,
    hasUserConfirmed,
    connectionAttempted,
    initiateConnection,
    forceDisconnect,
  }
}
