'use client'

import { useState, useEffect } from 'react'
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { gameEventBus, useGameEvent } from '@/lib/gameEventBus'
import GameState from '@/components/game/object/GameState'

// Example NFT contract ABI (you'll need to replace with your actual contract ABI)
const NFT_ABI = [
  {
    "inputs": [{"internalType": "address", "name": "to", "type": "address"}],
    "name": "mint",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "address", "name": "owner", "type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
    "name": "tokenURI",
    "outputs": [{"internalType": "string", "name": "", "type": "string"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const

const NFT_CONTRACT_ADDRESS = '0x...' // Replace with your NFT contract address

export function NFTManager() {
  const { address, isConnected } = useAccount()
  const [gameState] = useState(() => GameState.getInstance())
  const [playerStats, setPlayerStats] = useState(gameState.playerStats)
  const [isLoading, setIsLoading] = useState(false)

  const { writeContract } = useWriteContract()

  // Read NFT balance
  const { data: nftBalance } = useReadContract({
    address: NFT_CONTRACT_ADDRESS,
    abi: NFT_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && isConnected,
    },
  })

  // Listen to game state updates
  useGameEvent('STATS_UPDATED', (stats) => {
    setPlayerStats(stats)
  })

  // Mint NFT Pet based on game progress
  const mintNFTPet = async () => {
    if (!address || !isConnected) return

    setIsLoading(true)
    try {
      await writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: NFT_ABI,
        functionName: 'mint',
        args: [address],
      })

      // Emit event to game
      gameEventBus.emit('NFT_MINTED', {
        address,
        stats: playerStats
      })
    } catch (error) {
      console.error('Failed to mint NFT:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Feed pet from React UI (triggers game event)
  const feedPetFromUI = () => {
    gameState.handleExternalFeed()
  }

  // Play with pet from React UI (triggers game event)
  const playWithPetFromUI = () => {
    gameState.handleExternalPlay()
  }

  // Hatch egg from React UI (triggers game event)
  const hatchEggFromUI = () => {
    gameState.handleExternalHatch()
  }

  if (!isConnected) {
    return (
      <div className="p-4 bg-gray-800 rounded-lg text-white">
        <p>Connect your wallet to manage NFT pets</p>
      </div>
    )
  }

  return (
    <div className="p-4 bg-gray-800 rounded-lg text-white space-y-4">
      <h3 className="text-xl font-bold">NFT Pet Manager</h3>
      
      {/* Current Stats Display */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-sm">Happiness</p>
          <p className="text-lg font-bold">{Math.round(playerStats.happiness)}%</p>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-sm">Hunger</p>
          <p className="text-lg font-bold">{Math.round(playerStats.hunger)}%</p>
        </div>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-sm">Thirst</p>
          <p className="text-lg font-bold">{Math.round(playerStats.thirst)}%</p>
        </div>
      </div>

      {/* NFT Info */}
      <div className="bg-gray-700 p-3 rounded">
        <p className="text-sm">NFT Balance: {nftBalance?.toString() || '0'}</p>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={feedPetFromUI}
          className="px-4 py-2 bg-green-600 rounded hover:bg-green-700 transition-colors"
        >
          🍎 Feed Pet
        </button>
        <button
          onClick={playWithPetFromUI}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          🎾 Play
        </button>
        <button
          onClick={hatchEggFromUI}
          className="px-4 py-2 bg-yellow-600 rounded hover:bg-yellow-700 transition-colors"
        >
          🥚 Hatch
        </button>
        <button
          onClick={mintNFTPet}
          disabled={isLoading}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Minting...' : '✨ Mint NFT'}
        </button>
      </div>
    </div>
  )
}