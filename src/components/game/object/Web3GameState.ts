/** @format */

import {
  EventBus,
  GAME_EVENTS,
  Web3GameData,
  PetData as Web3PetData,
} from "@/lib/eventBus";
import GameState, { PetData } from "./GameState";

export default class Web3GameState extends GameState {
  private static web3Instance: Web3GameState;
  private eventBus: EventBus;
  private isWeb3Connected: boolean = false;
  private walletAddress: string | null = null;
  private username: string | null = null;

  constructor() {
    super();
    this.eventBus = EventBus.getInstance();
    this.setupEventListeners();
  }

  public static getInstance(): Web3GameState {
    if (!Web3GameState.web3Instance) {
      Web3GameState.web3Instance = new Web3GameState();
    }
    return Web3GameState.web3Instance;
  }

  private setupEventListeners() {
    // Listen for Web3 events
    this.eventBus.on(
      GAME_EVENTS.WALLET_CONNECTED,
      this.handleWalletConnected.bind(this)
    );
    this.eventBus.on(
      GAME_EVENTS.WALLET_DISCONNECTED,
      this.handleWalletDisconnected.bind(this)
    );
    this.eventBus.on(
      GAME_EVENTS.PETS_DATA_UPDATED,
      this.handlePetsDataUpdated.bind(this)
    );
    this.eventBus.on(
      GAME_EVENTS.SELECTED_PET_CHANGED,
      this.handleSelectedPetChanged.bind(this)
    );
  }

  private handleWalletConnected(walletData: any) {
    console.log("Web3GameState: Wallet connected", walletData);
    this.isWeb3Connected = true;
    this.walletAddress = walletData.address;
    this.username = walletData.username;
  }

  private handleWalletDisconnected() {
    console.log("Web3GameState: Wallet disconnected");
    this.isWeb3Connected = false;
    this.walletAddress = null;
    this.username = null;
    // Reset to default pets
    this.pets = this.getDefaultPets();
    this.selectedPetId = 1;
  }

  private handlePetsDataUpdated(gameData: Web3GameData) {
    console.log("Web3GameState: Pets data updated", gameData);

    // Convert Web3 pet data to game pet data
    this.pets = gameData.pets.map(this.convertWeb3PetToGamePet);

    // Set selected pet
    if (gameData.selectedPetId) {
      this.selectedPetId = gameData.selectedPetId;
    }

    console.log("Updated pets in game:", this.pets);
  }

  private handleSelectedPetChanged(data: { petId: number }) {
    // console.log("Web3GameState: Selected pet changed", data);
    this.setSelectedPet(data.petId);
  }

  private convertWeb3PetToGamePet(web3Pet: Web3PetData): PetData {
    return {
      id: web3Pet.id,
      name: web3Pet.name,
      sprite: web3Pet.sprite,
      stage: web3Pet.stage,
      stats: web3Pet.stats,
      unlocked: web3Pet.unlocked,
    };
  }

  private getDefaultPets(): PetData[] {
    return [
      {
        id: 1,
        name: "Demo Pet",
        sprite: "Egg",
        stage: "egg",
        stats: { happiness: 50, hunger: 50, thirst: 50 },
        unlocked: true,
      },
    ];
  }

  // Override methods to emit events to Web3
  public updateSelectedPetStats(effects: {
    happiness?: number;
    hunger?: number;
    thirst?: number;
  }) {
    super.updateSelectedPetStats(effects);

    // Emit to Web3 layer
    this.eventBus.emit(GAME_EVENTS.PET_STATS_UPDATED, {
      petId: this.selectedPetId,
      stats: effects,
      newStats: this.getSelectedPetStats(),
    });
  }

  public useItem(itemId: number): boolean {
    const success = super.useItem(itemId);

    if (success) {
      this.eventBus.emit(GAME_EVENTS.PET_ACTION_PERFORMED, {
        action: "use_item",
        itemId,
        petId: this.selectedPetId,
        timestamp: Date.now(),
      });
    }

    return success;
  }

  // Enhanced setSelectedPet with proper event emission
  public setSelectedPet(petId: number): boolean {
    const success = super.setSelectedPet(petId);
    console.log(success);

    if (success) {
      // Emit to Web3 layer for external state sync
      // this.eventBus.emit(GAME_EVENTS.SELECTED_PET_CHANGED, {
      //   petId,
      //   timestamp: Date.now(),
      // });
      // Force update for all game components
      // this.eventBus.emit(GAME_EVENTS.GAME_STATE_CHANGED, {
      //   type: 'pet_selection_changed',
      //   selectedPetId: petId,
      //   selectedPet: this.getSelectedPet()
      // });
    }

    return success;
  }

  // New Web3-specific methods
  public isWalletConnected(): boolean {
    return this.isWeb3Connected;
  }

  public getWalletAddress(): string | null {
    return this.walletAddress;
  }

  public getUsername(): string | null {
    return this.username;
  }

  public emitGameReady() {
    console.log("Web3GameState: Emitting game ready event");
    this.eventBus.emit(GAME_EVENTS.GAME_READY);
  }

  public performPetAction(action: string, data?: any) {
    this.eventBus.emit(GAME_EVENTS.PET_ACTION_PERFORMED, {
      action,
      petId: this.selectedPetId,
      data,
      timestamp: Date.now(),
    });
  }

  // Enhanced methods with Web3 integration
  public(stage: "egg" | "adult") {
    super.updateSelectedPetStage(stage);

    // Emit stage change to Web3
    this.eventBus.emit(GAME_EVENTS.PET_ACTION_PERFORMED, {
      action: "stage_change",
      petId: this.selectedPetId,
      newStage: stage,
      timestamp: Date.now(),
    });

    // Force update for all game components
    // this.eventBus.emit(GAME_EVENTS.GAME_STATE_CHANGED, {
    //   type: "pet_stage_changed",
    //   selectedPetId: this.selectedPetId,
    //   selectedPet: this.getSelectedPet(),
    // });
  }
}
