'use client'

import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { gameEventBus } from '@/lib/gameEventBus'
import { useEffect } from 'react'

export function WalletConnect() {
  const { address, isConnected } = useAccount()
  const { connect, connectors } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    if (isConnected) {
      gameEventBus.emit('WALLET_CONNECTED', { address })
    } else {
      gameEventBus.emit('WALLET_DISCONNECTED')
    }
  }, [isConnected, address])

  if (isConnected) {
    return (
      <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
        <div className="text-white">
          <p className="text-sm">Connected:</p>
          <p className="font-mono text-xs">{address?.slice(0, 6)}...{address?.slice(-4)}</p>
        </div>
        <button
          onClick={() => disconnect()}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
        >
          Disconnect
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-gray-800 rounded-lg">
      <h3 className="text-white font-semibold mb-2">Connect Wallet</h3>
      {connectors.map((connector) => (
        <button
          key={connector.uid}
          onClick={() => connect({ connector })}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          {connector.name}
        </button>
      ))}
    </div>
  )
}