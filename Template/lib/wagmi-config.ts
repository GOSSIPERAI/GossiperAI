import { http, createConfig } from 'wagmi'
import { base, baseSepolia } from 'wagmi/chains'
import { coinbaseWallet, walletConnect, injected } from 'wagmi/connectors'

// Get WalletConnect project ID from environment
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID'

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
    coinbaseWallet({
      appName: 'Gossiper',
      appLogoUrl: '/gossiper-logo.jpeg',
    }),
    walletConnect({
      projectId,
      metadata: {
        name: 'Gossiper',
        description: 'AI-Powered Real-Time Captions & Translation',
        url: 'https://gossiper.app',
        icons: ['https://gossiper.app/gossiper-logo.jpeg'],
      },
    }),
  ],
  transports: {
    [base.id]: http(),
    [baseSepolia.id]: http(),
  },
  ssr: true,
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}

