/** @format */
"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAccount, useDisconnect } from "wagmi";
import {
  EventBus,
  GAME_EVENTS,
  WalletData,
  PetData,
  Web3GameData,
} from "@/lib/eventBus";
import { getSocketIOClient } from "@/lib/ws";
import toast from "react-hot-toast";

interface Web3ContextType {
  wallet: WalletData | null;
  pets: PetData[];
  isGameReady: boolean;
  isConnecting: boolean;
  updatePetStats: (petId: number, stats: any) => void;
  // selectPet: (petId: number) => void;
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined);

export const useWeb3 = () => {
  const context = useContext(Web3Context);
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
};

interface Web3ProviderProps {
  children: ReactNode;
}

export default function Web3Provider({ children }: Web3ProviderProps) {
  const { address, isConnected, isConnecting } = useAccount();
  const { disconnect } = useDisconnect();

  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [pets, setPets] = useState<PetData[]>([]);
  const [isGameReady, setIsGameReady] = useState(false);
  const [eventBus] = useState(() => EventBus.getInstance());

  // Mock pets data - will be replaced with actual NFT data
  const getMockPetsData = (walletAddress: string): PetData[] => [
    {
      id: 1,
      name: "Cat",
      sprite: "Egg",
      stage: "egg",
      stats: { happiness: 80, hunger: 60, thirst: 70 },
      unlocked: true,
      owner: walletAddress,
      tokenId: "1",
      egg_url: "/categg.png",
      adult_url: "/catbat.png",
    },
    {
      id: 2,
      name: "Dragon",
      sprite: "Egg2",
      stage: "egg",
      stats: { happiness: 75, hunger: 55, thirst: 65 },
      unlocked: true,
      owner: walletAddress,
      tokenId: "2",
      egg_url: "/dragoegg.png",
      adult_url: "/dragobat.png",
    },
    {
      id: 3,
      name: "Leaf",
      sprite: "Egg3",
      stage: "egg",
      stats: { happiness: 75, hunger: 55, thirst: 65 },
      unlocked: true,
      owner: walletAddress,
      tokenId: "3",
      egg_url: "/leafegg.png",
      adult_url: "/leafbat.png",
    },
  ];

  // const getMockPetsData = (walletAddress: string): PetData[] => [];

  // Handle wallet connection changes
  useEffect(() => {
    if (isConnected && address) {
      const walletData: WalletData = {
        address,
        username: `Player_${address.slice(2, 8)}`,
        isConnected: true,
      };
      setWallet(walletData);

      // Load pets data (mock for now)
      const petsData = getMockPetsData(address);
      setPets(petsData);

      // Set username in WebSocket client
      const wsClient = getSocketIOClient();
      wsClient.setUsername(walletData.username);

      // Emit wallet connected event
      eventBus.emit(GAME_EVENTS.WALLET_CONNECTED, walletData);

      // Send game data if game is ready
      if (isGameReady) {
        setTimeout(() => {
          sendGameData(walletData, petsData);
        }, 100);
      }

      toast.success(
        `Wallet connected: ${address.slice(0, 6)}...${address.slice(-4)}`
      );
      console.log("Wallet connected:", walletData);
    } else {
      // Handle disconnection
      if (wallet) {
        setWallet(null);
        setPets([]);
        eventBus.emit(GAME_EVENTS.WALLET_DISCONNECTED);
        toast.error("Wallet disconnected");
        console.log("Wallet disconnected");
      }
    }
  }, [isConnected, address, isGameReady, eventBus]);

  // Setup game event listeners
  useEffect(() => {
    const handleGameReady = () => {
      console.log("Game is ready!");
      setIsGameReady(true);

      // Send initial data to game if wallet is connected
      if (wallet && pets.length > 0) {
        sendGameData(wallet, pets);
      }
    };

    // const handlePetStatsUpdated = (data: any) => {
    //   console.log("Pet stats updated from game:", data);
    //   // Update local state
    //   setPets((prevPets) =>
    //     prevPets.map((pet) =>
    //       pet.id === data.petId
    //         ? { ...pet, stats: { ...pet.stats, ...data.stats } }
    //         : pet
    //     )
    //   );

    //   // TODO: Sync with blockchain/backend
    //   toast.success(`Pet stats updated for pet #${data.petId}`);
    // };

    const handlePetActionPerformed = (data: any) => {
      console.log("Pet action performed:", data);

      // Show toast notification
      const actionMessages = {
        hatch: "🥚 Pet hatched!",
        feed: "🍎 Pet fed!",
        drink: "💧 Pet hydrated!",
        play: "🎾 Pet played!",
        rest: "😴 Pet rested!",
        stage_change: "🌟 Pet evolved!",
      };

      const message =
        actionMessages[data.action as keyof typeof actionMessages] ||
        `Pet action: ${data.action}`;
      toast.success(message);

      // TODO: Handle blockchain transactions for pet actions
    };

    // const handleSelectedPetChanged = (data: any) => {
    //   console.log("Selected pet changed from game:", data);
    //   toast.success(`Pet #${data.petId} selected`);
    // };

    eventBus.on(GAME_EVENTS.GAME_READY, handleGameReady);
    // eventBus.on(GAME_EVENTS.PET_STATS_UPDATED, handlePetStatsUpdated);
    eventBus.on(GAME_EVENTS.PET_ACTION_PERFORMED, handlePetActionPerformed);
    // eventBus.on(GAME_EVENTS.SELECTED_PET_CHANGED, handleSelectedPetChanged);

    return () => {
      eventBus.off(GAME_EVENTS.GAME_READY, handleGameReady);
      // eventBus.off(GAME_EVENTS.PET_STATS_UPDATED, handlePetStatsUpdated);
      eventBus.off(GAME_EVENTS.PET_ACTION_PERFORMED, handlePetActionPerformed);
      // eventBus.off(GAME_EVENTS.SELECTED_PET_CHANGED, handleSelectedPetChanged);
    };
  }, [eventBus, isConnected, wallet]);

  const sendGameData = (walletData: WalletData, petsData: PetData[]) => {
    const gameData: Web3GameData = {
      wallet: walletData,
      pets: petsData,
      selectedPetId: petsData.find((pet) => pet.unlocked)?.id || 1,
    };

    eventBus.emit(GAME_EVENTS.PETS_DATA_UPDATED, gameData);
    console.log("Game data sent:", gameData);
  };

  const updatePetStats = (petId: number, stats: any) => {
    setPets((prevPets) =>
      prevPets.map((pet) =>
        pet.id === petId ? { ...pet, stats: { ...pet.stats, ...stats } } : pet
      )
    );

    // Emit to game
    eventBus.emit(GAME_EVENTS.PET_STATS_UPDATED, { petId, stats });
  };

  // const selectPet = (petId: number) => {
  //   eventBus.emit(GAME_EVENTS.SELECTED_PET_CHANGED, { petId });
  //   toast.success(`Pet #${petId} selected`);
  // };

  const value: Web3ContextType = {
    wallet,
    pets,
    isGameReady,
    isConnecting,
    updatePetStats,
    // selectPet,
  };

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>;
}
