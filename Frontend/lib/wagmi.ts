import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, mainnet } from 'wagmi/chains'
import { http } from 'viem'

// Enhanced config with EIP-6963 support and proper RPC setup
export const config = getDefaultConfig({
  appName: 'ChatDApp',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'default-project-id',
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
  // Enable EIP-6963 wallet discovery
  enableEIP6963: true,
  // Enable wallet connect v2
  enableWalletConnect: true,
  // Enable injected wallet detection
  enableInjected: true,
})

export { sepolia, mainnet } from 'wagmi/chains'
