/** @format */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { Chain } from 'wagmi/chains';

// Monad Testnet configuration
export const monadTestnet: Chain = {
  id: 10143,
  name: "Monad Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "MON",
    symbol: "MON",
  },
  rpcUrls: {
    default: {
      http: ["https://testnet-rpc.monad.xyz/"],
    },
    public: {
      http: ["https://testnet-rpc.monad.xyz/"],
    },
  },
  blockExplorers: {
    default: {
      name: "MonadScan",
      url: "https://testnet.monadexplorer.com",
    },
  },
  testnet: true,
};

// Wagmi configuration
export const config = getDefaultConfig({
  appName: 'Pat-Pet Web3 Game',
  projectId: 'YOUR_PROJECT_ID', // Get this from WalletConnect Cloud
  chains: [monadTestnet],
  ssr: true, // If your dApp uses server side rendering (SSR)
});