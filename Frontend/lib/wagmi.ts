import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { sepolia, mainnet } from 'wagmi/chains'
import { http } from 'viem'

// Enhanced config with proper wallet connection flow
export const config = getDefaultConfig({
  appName: 'SOMChat',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '2f5a2b1c8d3e4f5a6b7c8d9e0f1a2b3c',
  chains: [sepolia, mainnet],
  transports: {
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
  ssr: true,
})

export { sepolia, mainnet } from 'wagmi/chains'
