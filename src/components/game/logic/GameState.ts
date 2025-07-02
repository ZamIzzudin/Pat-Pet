/** @format */

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
}

export interface Goal {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  progress: number;
  maxProgress: number;
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
  }

  public useItem(itemId: number): boolean {
    const itemIndex = this.inventory.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return false;

    const item = this.inventory[itemIndex];
    this.updateStats(item.effects);
    
    // Remove item from inventory after use
    this.inventory.splice(itemIndex, 1);
    
    return true;
  }

  public addItem(item: GameItem) {
    this.inventory.push(item);
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
  }
}