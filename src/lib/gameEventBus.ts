/**
 * Event Bus for communication between React and Phaser
 * This allows bidirectional data flow between the game engine and React components
 */

export type GameEventType = 
  | 'STATS_UPDATED'
  | 'INVENTORY_UPDATED'
  | 'GOALS_UPDATED'
  | 'NFT_MINTED'
  | 'NFT_EQUIPPED'
  | 'WALLET_CONNECTED'
  | 'WALLET_DISCONNECTED'
  | 'FEED_PET'
  | 'PLAY_WITH_PET'
  | 'HATCH_EGG'
  | 'USE_ITEM'
  | 'PURCHASE_ITEM';

export interface GameEvent {
  type: GameEventType;
  payload?: any;
}

class GameEventBus {
  private listeners: Map<GameEventType, Set<(payload?: any) => void>> = new Map();

  // Subscribe to events
  on(eventType: GameEventType, callback: (payload?: any) => void) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback);
    };
  }

  // Emit events
  emit(eventType: GameEventType, payload?: any) {
    const callbacks = this.listeners.get(eventType);
    if (callbacks) {
      callbacks.forEach(callback => callback(payload));
    }
  }

  // Remove all listeners for an event type
  off(eventType: GameEventType) {
    this.listeners.delete(eventType);
  }

  // Clear all listeners
  clear() {
    this.listeners.clear();
  }
}

// Create singleton instance
export const gameEventBus = new GameEventBus();

// Helper hooks for React components
export const useGameEvent = (
  eventType: GameEventType, 
  callback: (payload?: any) => void,
  deps: any[] = []
) => {
  const { useEffect } = require('react');
  
  useEffect(() => {
    const unsubscribe = gameEventBus.on(eventType, callback);
    return unsubscribe;
  }, deps);
};