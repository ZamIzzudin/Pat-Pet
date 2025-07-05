/** @format */
"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EventBus, GAME_EVENTS, WalletData, PetData, Web3GameData } from '@/lib/eventBus';

interface Web3ContextType {
  wallet: WalletData | null;
  pets: PetData[];
  isGameReady: boolean;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  updatePetStats: (petId: number, stats: any) => void;
  selectPet: (petId: number) => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error('useWeb3 must be used within a Web3Provider');
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export default function Web3Provider({ children }: Web3ProviderProps) {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [pets, setPets] = useState<PetData[]>([]);
  const [isGameReady, setIsGameReady] = useState(false);
  const [eventBus] = useState(() => EventBus.getInstance());

  // Mock Web3 data - replace with actual Web3 integration
  const mockPetsData: PetData[] = [
    {
      id: 1,
      name: "Crypto Fluffy",
      sprite: "Egg",
      stage: "egg",
      stats: { happiness: 80, hunger: 60, thirst: 70 },
      unlocked: true,
      owner: "0x1234...5678",
      tokenId: "1"
    },
    {
      id: 2,
      name: "NFT Shadow",
      sprite: "Egg2", 
      stage: "egg",
      stats: { happiness: 75, hunger: 55, thirst: 65 },
      unlocked: true,
      owner: "0x1234...5678",
      tokenId: "2"
    },
    {
      id: 3,
      name: "DeFi Drago",
      sprite: "Egg3",
      stage: "egg", 
      stats: { happiness: 75, hunger: 55, thirst: 65 },
      unlocked: true,
      owner: "0x1234...5678",
      tokenId: "3"
    },
    {
      id: 4,
      name: "Locked Pet",
      sprite: "Egg",
      stage: "egg",
      stats: { happiness: 100, hunger: 100, thirst: 100 },
      unlocked: false,
      tokenId: "4"
    }
  ];

  useEffect(() => {
    // Listen for game events
    const handleGameReady = () => {
      console.log('Game is ready!');
      setIsGameReady(true);
      
      // Send initial data to game if wallet is connected
      if (wallet) {
        sendGameData();
      }
    };

    const handlePetStatsUpdated = (data: any) => {
      console.log('Pet stats updated from game:', data);
      // Update local state or sync with blockchain
      setPets(prevPets => 
        prevPets.map(pet => 
          pet.id === data.petId 
            ? { ...pet, stats: { ...pet.stats, ...data.stats } }
            : pet
        )
      );
    };

    const handlePetActionPerformed = (data: any) => {
      console.log('Pet action performed:', data);
      // Handle pet actions (could trigger blockchain transactions)
    };

    eventBus.on(GAME_EVENTS.GAME_READY, handleGameReady);
    eventBus.on(GAME_EVENTS.PET_STATS_UPDATED, handlePetStatsUpdated);
    eventBus.on(GAME_EVENTS.PET_ACTION_PERFORMED, handlePetActionPerformed);

    return () => {
      eventBus.off(GAME_EVENTS.GAME_READY, handleGameReady);
      eventBus.off(GAME_EVENTS.PET_STATS_UPDATED, handlePetStatsUpdated);
      eventBus.off(GAME_EVENTS.PET_ACTION_PERFORMED, handlePetActionPerformed);
    };
  }, [eventBus, wallet]);

  const sendGameData = () => {
    if (!wallet) return;

    const gameData: Web3GameData = {
      wallet,
      pets,
      selectedPetId: pets.find(pet => pet.unlocked)?.id || 1
    };

    eventBus.emit(GAME_EVENTS.PETS_DATA_UPDATED, gameData);
  };

  const connectWallet = async () => {
    try {
      // Mock wallet connection - replace with actual Web3 logic
      console.log('Connecting wallet...');
      
      // Simulate wallet connection delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockWallet: WalletData = {
        address: "0x1234567890123456789012345678901234567890",
        username: `Player_${Math.random().toString(36).substr(2, 6)}`,
        isConnected: true
      };

      setWallet(mockWallet);
      setPets(mockPetsData);

      // Emit wallet connected event
      eventBus.emit(GAME_EVENTS.WALLET_CONNECTED, mockWallet);

      // Send game data if game is ready
      if (isGameReady) {
        setTimeout(() => {
          sendGameData();
        }, 100);
      }

      console.log('Wallet connected successfully');
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      eventBus.emit(GAME_EVENTS.ERROR, { message: 'Failed to connect wallet' });
    }
  };

  const disconnectWallet = () => {
    setWallet(null);
    setPets([]);
    eventBus.emit(GAME_EVENTS.WALLET_DISCONNECTED);
    console.log('Wallet disconnected');
  };

  const updatePetStats = (petId: number, stats: any) => {
    setPets(prevPets => 
      prevPets.map(pet => 
        pet.id === petId 
          ? { ...pet, stats: { ...pet.stats, ...stats } }
          : pet
      )
    );

    // Emit to game
    eventBus.emit(GAME_EVENTS.PET_STATS_UPDATED, { petId, stats });
  };

  const selectPet = (petId: number) => {
    eventBus.emit(GAME_EVENTS.SELECTED_PET_CHANGED, { petId });
  };

  const value: Web3ContextType = {
    wallet,
    pets,
    isGameReady,
    connectWallet,
    disconnectWallet,
    updatePetStats,
    selectPet
  };

  return (
    <Web3Context.Provider value={value}>
      {children}
    </Web3Context.Provider>
  );
}