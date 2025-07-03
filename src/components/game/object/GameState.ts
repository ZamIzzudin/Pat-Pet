/** @format */

import { gameEventBus } from '@/lib/gameEventBus';

export interface PlayerStats {
  happiness: number;
  hunger: number;
  thirst: number;
}

export interface GameItem {
  id: number;
  name: string;
  icon: string;
  type: 'food' | 'drink' | 'toy' | 'tool';
  effects: {
    happiness?: number;
    hunger?: number;
    thirst?: number;
  };
  isNFT?: boolean;
  tokenId?: string;
  contractAddress?: string;
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
}

export interface NFTPet {
  tokenId: string;
  contractAddress: string;
  name: string;
  image: string;
  attributes: {
    happiness: number;
    hunger: number;
    thirst: number;
    level: number;
    experience: number;
  };
}

export default class GameState {
  private static instance: GameState;
  
  public playerStats: PlayerStats = {
    happiness: 80,
    hunger: 60,
    thirst: 70
  };

  public inventory: GameItem[] = [
    { id: 1, name: "Apple", icon: "Backpack", type: "food", effects: { hunger: 20, happiness: 5 } },
    { id: 2, name: "Water Bottle", icon: "Backpack", type: "drink", effects: { thirst: 30 } },
    { id: 3, name: "Toy Ball", icon: "Backpack", type: "toy", effects: { happiness: 25 } },
    { id: 4, name: "Bread", icon: "Backpack", type: "food", effects: { hunger: 15, happiness: 3 } },
    { id: 5, name: "Juice", icon: "Backpack", type: "drink", effects: { thirst: 20, happiness: 10 } },
    { id: 6, name: "Cookie", icon: "Backpack", type: "food", effects: { hunger: 10, happiness: 15 } },
    { id: 7, name: "Milk", icon: "Backpack", type: "drink", effects: { thirst: 25, hunger: 5 } },
    { id: 8, name: "Candy", icon: "Backpack", type: "food", effects: { happiness: 20, hunger: 5 } },
  ];

  public goals: Goal[] = [
    { id: 1, title: "Feed Your Pet", description: "Keep hunger above 80%", completed: false, progress: 60, maxProgress: 80 },
    { id: 2, title: "Happy Pet", description: "Maintain happiness above 90%", completed: false, progress: 80, maxProgress: 90 },
    { id: 3, title: "Stay Hydrated", description: "Keep thirst above 70%", completed: false, progress: 70, maxProgress: 70 },
    { id: 4, title: "Daily Care", description: "Complete 5 care actions", completed: false, progress: 2, maxProgress: 5 },
    { id: 5, title: "Explorer", description: "Visit both Island and House", completed: true, progress: 2, maxProgress: 2 },
  ];

  public currentNFTPet: NFTPet | null = null;
  public ownedNFTs: NFTPet[] = [];

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  public updateStats(effects: { happiness?: number; hunger?: number; thirst?: number }) {
    if (effects.happiness) {
      this.playerStats.happiness = Math.min(100, Math.max(0, this.playerStats.happiness + effects.happiness));
    }
    if (effects.hunger) {
      this.playerStats.hunger = Math.min(100, Math.max(0, this.playerStats.hunger + effects.hunger));
    }
    if (effects.thirst) {
      this.playerStats.thirst = Math.min(100, Math.max(0, this.playerStats.thirst + effects.thirst));
    }

    // Emit event to React components
    gameEventBus.emit('STATS_UPDATED', this.playerStats);

    // Update NFT pet attributes if one is equipped
    if (this.currentNFTPet) {
      this.currentNFTPet.attributes.happiness = this.playerStats.happiness;
      this.currentNFTPet.attributes.hunger = this.playerStats.hunger;
      this.currentNFTPet.attributes.thirst = this.playerStats.thirst;
    }
  }

  public useItem(itemId: number): boolean {
    const itemIndex = this.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    const item = this.inventory[itemIndex];
    this.updateStats(item.effects);
    
    // Remove item from inventory after use (unless it's an NFT)
    if (!item.isNFT) {
      this.inventory.splice(itemIndex, 1);
    }
    
    // Emit inventory update event
    gameEventBus.emit('INVENTORY_UPDATED', this.inventory);
    
    return true;
  }

  public addItem(item: GameItem) {
    this.inventory.push(item);
    gameEventBus.emit('INVENTORY_UPDATED', this.inventory);
  }

  public addNFTItem(nftData: any) {
    const nftItem: GameItem = {
      id: Date.now(), // Temporary ID
      name: nftData.name || 'NFT Item',
      icon: "Backpack",
      type: nftData.type || 'toy',
      effects: nftData.effects || { happiness: 30 },
      isNFT: true,
      tokenId: nftData.tokenId,
      contractAddress: nftData.contractAddress
    };
    
    this.addItem(nftItem);
    gameEventBus.emit('NFT_EQUIPPED', nftItem);
  }

  public setCurrentNFTPet(nftPet: NFTPet) {
    this.currentNFTPet = nftPet;
    
    // Update player stats based on NFT pet attributes
    this.playerStats = {
      happiness: nftPet.attributes.happiness,
      hunger: nftPet.attributes.hunger,
      thirst: nftPet.attributes.thirst
    };
    
    gameEventBus.emit('STATS_UPDATED', this.playerStats);
    gameEventBus.emit('NFT_EQUIPPED', nftPet);
  }

  public updateGoalProgress() {
    // Update goals based on current stats
    this.goals.forEach(goal => {
      switch (goal.id) {
        case 1: // Feed Your Pet
          goal.progress = this.playerStats.hunger;
          goal.completed = this.playerStats.hunger >= goal.maxProgress;
          break;
        case 2: // Happy Pet
          goal.progress = this.playerStats.happiness;
          goal.completed = this.playerStats.happiness >= goal.maxProgress;
          break;
        case 3: // Stay Hydrated
          goal.progress = this.playerStats.thirst;
          goal.completed = this.playerStats.thirst >= goal.maxProgress;
          break;
      }
    });

    gameEventBus.emit('GOALS_UPDATED', this.goals);
  }

  // Methods to handle external events from React
  public handleExternalFeed() {
    this.updateStats({ hunger: 20, happiness: 10 });
    gameEventBus.emit('FEED_PET');
  }

  public handleExternalPlay() {
    this.updateStats({ happiness: 25, hunger: -5 });
    gameEventBus.emit('PLAY_WITH_PET');
  }

  public handleExternalHatch() {
    this.updateStats({ happiness: 30 });
    gameEventBus.emit('HATCH_EGG');
  }
}