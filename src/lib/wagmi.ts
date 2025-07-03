import { http, createConfig } from 'wagmi'
import { mainnet, sepolia, polygon, polygonMumbai } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'your-project-id'

export const config = createConfig({
  chains: [mainnet, sepolia, polygon, polygonMumbai],
  connectors: [
    injected(),
    metaMask(),
    safe(),
    walletConnect({ projectId }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [polygon.id]: http(),
    [polygonMumbai.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}