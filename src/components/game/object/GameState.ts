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
  type: "food" | "drink" | "toy" | "tool";
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

export interface PetData {
  id: number;
  name: string;
  sprite: string;
  stage: "egg" | "baby";
  stats: PlayerStats;
  unlocked: boolean;
}

export default class GameState {
  private static instance: GameState;

  // State untuk pet yang sedang dipilih/ditampilkan
  public selectedPetId: number = 1;

  public pets: PetData[] = [
    {
      id: 1,
      name: "Fluffy",
      sprite: "Egg",
      stage: "egg",
      stats: { happiness: 80, hunger: 60, thirst: 70 },
      unlocked: true,
    },
    {
      id: 2,
      name: "Shadow",
      sprite: "Egg2",
      stage: "egg",
      stats: { happiness: 75, hunger: 55, thirst: 65 },
      unlocked: true,
    },
    {
      id: 3,
      name: "Drago",
      sprite: "Egg3",
      stage: "egg",
      stats: { happiness: 75, hunger: 55, thirst: 65 },
      unlocked: true,
    },
  ];

  public inventory: GameItem[] = [
    {
      id: 1,
      name: "Apple",
      icon: "Backpack",
      type: "food",
      effects: { hunger: 20, happiness: 5 },
    },
    {
      id: 2,
      name: "Water Bottle",
      icon: "Backpack",
      type: "drink",
      effects: { thirst: 30 },
    },
    {
      id: 3,
      name: "Toy Ball",
      icon: "Backpack",
      type: "toy",
      effects: { happiness: 25 },
    },
    {
      id: 4,
      name: "Bread",
      icon: "Backpack",
      type: "food",
      effects: { hunger: 15, happiness: 3 },
    },
    {
      id: 5,
      name: "Juice",
      icon: "Backpack",
      type: "drink",
      effects: { thirst: 20, happiness: 10 },
    },
    {
      id: 6,
      name: "Cookie",
      icon: "Backpack",
      type: "food",
      effects: { hunger: 10, happiness: 15 },
    },
    {
      id: 7,
      name: "Milk",
      icon: "Backpack",
      type: "drink",
      effects: { thirst: 25, hunger: 5 },
    },
    {
      id: 8,
      name: "Candy",
      icon: "Backpack",
      type: "food",
      effects: { happiness: 20, hunger: 5 },
    },
  ];

  public goals: Goal[] = [
    {
      id: 1,
      title: "Feed Your Pet",
      description: "Keep hunger above 80%",
      completed: false,
      progress: 60,
      maxProgress: 80,
    },
    {
      id: 2,
      title: "Happy Pet",
      description: "Maintain happiness above 90%",
      completed: false,
      progress: 80,
      maxProgress: 90,
    },
    {
      id: 3,
      title: "Stay Hydrated",
      description: "Keep thirst above 70%",
      completed: false,
      progress: 70,
      maxProgress: 70,
    },
    {
      id: 4,
      title: "Daily Care",
      description: "Complete 5 care actions",
      completed: false,
      progress: 2,
      maxProgress: 5,
    },
    {
      id: 5,
      title: "Explorer",
      description: "Visit both Island and House",
      completed: true,
      progress: 2,
      maxProgress: 2,
    },
  ];

  public static getInstance(): GameState {
    if (!GameState.instance) {
      GameState.instance = new GameState();
    }
    return GameState.instance;
  }

  // Methods untuk mengelola selected pet
  public getSelectedPet(): PetData {
    return (
      this.pets.find((pet) => pet.id === this.selectedPetId) || this.pets[0]
    );
  }

  public setSelectedPet(petId: number): boolean {
    const pet = this.pets.find((p) => p.id === petId);
    if (pet && pet.unlocked) {
      this.selectedPetId = petId;
      return true;
    }
    return false;
  }

  public getSelectedPetStats(): PlayerStats {
    return this.getSelectedPet().stats;
  }

  public updateSelectedPetStats(effects: {
    happiness?: number;
    hunger?: number;
    thirst?: number;
  }) {
    const selectedPet = this.getSelectedPet();
    if (effects.happiness) {
      selectedPet.stats.happiness = Math.min(
        100,
        Math.max(0, selectedPet.stats.happiness + effects.happiness)
      );
    }
    if (effects.hunger) {
      selectedPet.stats.hunger = Math.min(
        100,
        Math.max(0, selectedPet.stats.hunger + effects.hunger)
      );
    }
    if (effects.thirst) {
      selectedPet.stats.thirst = Math.min(
        100,
        Math.max(0, selectedPet.stats.thirst + effects.thirst)
      );
    }
  }

  public updateSelectedPetStage(stage: "egg" | "baby") {
    const selectedPet = this.getSelectedPet();
    selectedPet.stage = stage;
  }

  // Methods untuk mengelola pets secara umum
  public getAllPets(): PetData[] {
    return this.pets;
  }

  public getPetById(petId: number): PetData | undefined {
    return this.pets.find((pet) => pet.id === petId);
  }

  public unlockPet(petId: number): boolean {
    const pet = this.getPetById(petId);
    if (pet) {
      pet.unlocked = true;
      return true;
    }
    return false;
  }

  // Inventory methods
  public useItem(itemId: number): boolean {
    const itemIndex = this.inventory.findIndex((item) => item.id === itemId);
    if (itemIndex === -1) return false;

    const item = this.inventory[itemIndex];
    this.updateSelectedPetStats(item.effects);

    // Remove item from inventory after use
    this.inventory.splice(itemIndex, 1);

    return true;
  }

  public addItem(item: GameItem) {
    this.inventory.push(item);
  }

  // Goals methods
  public updateGoalProgress() {
    const selectedStats = this.getSelectedPetStats();
    // Update goals based on selected pet stats
    this.goals.forEach((goal) => {
      switch (goal.id) {
        case 1: // Feed Your Pet
          goal.progress = selectedStats.hunger;
          goal.completed = selectedStats.hunger >= goal.maxProgress;
          break;
        case 2: // Happy Pet
          goal.progress = selectedStats.happiness;
          goal.completed = selectedStats.happiness >= goal.maxProgress;
          break;
        case 3: // Stay Hydrated
          goal.progress = selectedStats.thirst;
          goal.completed = selectedStats.thirst >= goal.maxProgress;
          break;
      }
    });
  }

  // Legacy methods untuk backward compatibility (deprecated)
  public getCurrentPet(): PetData {
    console.warn("getCurrentPet() is deprecated, use getSelectedPet() instead");
    return this.getSelectedPet();
  }

  public switchPet(petId: number) {
    console.warn("switchPet() is deprecated, use setSelectedPet() instead");
    this.setSelectedPet(petId);
  }

  public getCurrentStats(): PlayerStats {
    console.warn(
      "getCurrentStats() is deprecated, use getSelectedPetStats() instead"
    );
    return this.getSelectedPetStats();
  }

  public updateCurrentPetStats(effects: {
    happiness?: number;
    hunger?: number;
    thirst?: number;
  }) {
    console.warn(
      "updateCurrentPetStats() is deprecated, use updateSelectedPetStats() instead"
    );
    this.updateSelectedPetStats(effects);
  }

  public updateCurrentPetStage(stage: "egg" | "baby") {
    console.warn(
      "updateCurrentPetStage() is deprecated, use updateSelectedPetStage() instead"
    );
    this.updateSelectedPetStage(stage);
  }

  public get playerStats(): PlayerStats {
    console.warn(
      "playerStats getter is deprecated, use getSelectedPetStats() instead"
    );
    return this.getSelectedPetStats();
  }

  public updateStats(effects: {
    happiness?: number;
    hunger?: number;
    thirst?: number;
  }) {
    console.warn(
      "updateStats() is deprecated, use updateSelectedPetStats() instead"
    );
    this.updateSelectedPetStats(effects);
  }
}
