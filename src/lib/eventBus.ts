/** @format */

export interface GameEvent {
  type: string;
  data?: any;
}

export interface WalletData {
  address: string;
  username: string;
  isConnected: boolean;
}

export interface PetData {
  id: number;
  name: string;
  sprite: string;
  stage: "egg" | "baby";
  stats: {
    happiness: number;
    hunger: number;
    thirst: number;
  };
  unlocked: boolean;
  owner?: string;
  tokenId?: string;
  egg_url: string;
  adult_url: string;
}

export interface Web3GameData {
  wallet: WalletData;
  pets: PetData[];
  selectedPetId?: number;
}

export class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Function[]> = new Map();

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  public on(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  public off(event: string, callback?: Function): void {
    if (!callback) {
      this.listeners.delete(event);
      return;
    }

    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  public emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event callback for ${event}:`, error);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

// Event types constants
export const GAME_EVENTS = {
  // Web3 to Game events
  WALLET_CONNECTED: "wallet_connected",
  WALLET_DISCONNECTED: "wallet_disconnected",
  PETS_DATA_UPDATED: "pets_data_updated",
  SELECTED_PET_CHANGED: "selected_pet_changed",

  // Game to Web3 events
  GAME_READY: "game_ready",
  PET_STATS_UPDATED: "pet_stats_updated",
  PET_ACTION_PERFORMED: "pet_action_performed",
  GAME_STATE_CHANGED: "game_state_changed",

  // Modal Shown
  MODAL_SHOWN: "modal_shown",
  MODAL_HIDE: "modal_hide",

  // General events
  ERROR: "error",
  LOADING: "loading",
} as const;

export type GameEventType = (typeof GAME_EVENTS)[keyof typeof GAME_EVENTS];
