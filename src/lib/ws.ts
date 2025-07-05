/** @format */

import { io, Socket } from "socket.io-client";

export interface Player {
  id: string;
  socketId: string;
  username: string;
  position: { x: number; y: number };
  frame: number;
  joinedAt?: string;
}

export interface SocketMessage {
  type: string;
  [key: string]: any;
}

export class SocketIOClient {
  private socket: Socket | null = null;
  private clientId: string | null = null;
  private currentRoom: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private messageHandlers: Map<string, Function[]> = new Map();
  private isInitialized = false;
  private username: string | null = null; // Store username
  private movementDebounceTimer: NodeJS.Timeout | null = null;
  private pendingMovement: {
    position: { x: number; y: number };
    frame: number;
  } | null = null;

  constructor(private url: string = "http://localhost:3001") {
    if (!this.isInitialized) {
      this.connect();
      this.isInitialized = true;
    }
  }

  // Set username from wallet connection
  public setUsername(username: string) {
    this.username = username;
    console.log("SocketIOClient: Username set to", username);
  }

  private connect() {
    if (this.socket && this.socket.connected) {
      console.log("Socket already connected");
      return;
    }

    try {
      this.socket = io(this.url, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ["websocket", "polling"],
        forceNew: false, // Prevent creating multiple connections
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error("Failed to create Socket.IO connection:", error);
      this.emit("error", error);
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    // Remove existing listeners to prevent duplicates
    this.socket.removeAllListeners();

    this.socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      this.reconnectAttempts = 0;
      this.clientId = this.socket!.id || "";
      this.emit("connected");
    });

    this.socket.on("connected", (data: any) => {
      console.log("Server welcome message:", data);
      this.clientId = data.clientId || this.socket!.id;
      this.emit("connected", data);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO connection disconnected:", reason);
      this.emit("disconnected", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket.IO connection error:", error);
      this.reconnectAttempts++;
      this.emit("error", error);

      if (this.reconnectAttempts >= this.maxReconnectAttempts) {
        console.error("Max reconnection attempts reached");
        this.emit("max_reconnect_attempts_reached");
      }
    });

    this.socket.on("reconnect", (attemptNumber) => {
      console.log(`Reconnected after ${attemptNumber} attempts`);
      this.reconnectAttempts = 0;
      this.emit("reconnected");
    });

    this.socket.on("reconnect_attempt", (attemptNumber) => {
      console.log(
        `Attempting to reconnect... (${attemptNumber}/${this.maxReconnectAttempts})`
      );
    });

    this.socket.on("reconnect_failed", () => {
      console.error("Failed to reconnect after maximum attempts");
      this.emit("max_reconnect_attempts_reached");
    });

    // Game-specific events
    this.socket.on("room_state", (data: any) => {
      console.log("Room state received:", data);
      this.emit("room_state", data);
    });

    this.socket.on("player_joined", (data: any) => {
      console.log("Player joined:", data);
      this.emit("player_joined", data);
    });

    this.socket.on("player_left", (data: any) => {
      console.log("Player left:", data);
      this.emit("player_left", data);
    });

    this.socket.on("player_moved", (data: any) => {
      this.emit("player_moved", data);
    });

    this.socket.on("player_animation", (data: any) => {
      this.emit("player_animation", data);
    });

    this.socket.on("room_update", (data: any) => {
      console.log("Room update:", data);
      this.emit("room_update", data);
    });

    this.socket.on("error", (error: any) => {
      console.error("Server error:", error);
      this.emit("error", error);
    });

    this.socket.on("server_shutdown", (data: any) => {
      console.log("Server shutting down:", data);
      this.emit("server_shutdown", data);
    });
  }

  public on(event: string, handler: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler?: Function) {
    if (!handler) {
      // Remove all handlers for this event
      this.messageHandlers.delete(event);
      return;
    }

    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private emit(event: string, data?: any) {
    const handlers = this.messageHandlers.get(event);
    if (handlers) {
      handlers.forEach((handler) => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in event handler for ${event}:`, error);
        }
      });
    }
  }

  public send(event: string, data?: any) {
    if (this.socket && this.socket.connected) {
      this.socket.emit(event, data);
    } else {
      console.warn("Socket.IO is not connected. Message not sent:", {
        event,
        data,
      });
    }
  }

  public joinRoom(roomId: string, position?: { x: number; y: number }) {
    if (this.currentRoom === roomId) {
      console.log(`Already in room: ${roomId}`);
      return;
    }

    this.currentRoom = roomId;

    // Send join room with username if available
    const joinData: any = {
      roomId,
      position: position || { x: 192, y: 160 },
    };

    if (this.username) {
      joinData.username = this.username;
    }

    this.send("join_room", joinData);
    console.log(`Joining room: ${roomId} with username: ${this.username}`);
  }

  public leaveRoom() {
    if (this.currentRoom) {
      this.send("leave_room");
      console.log(`Leaving room: ${this.currentRoom}`);
      this.currentRoom = null;
    }
  }

  // Debounced movement sending
  public sendPlayerMove(position: { x: number; y: number }, frame: number) {
    // Store the latest movement data
    this.pendingMovement = { position, frame };

    // Clear existing timer
    if (this.movementDebounceTimer) {
      clearTimeout(this.movementDebounceTimer);
    }

    // Set new timer for debounced sending
    this.movementDebounceTimer = setTimeout(() => {
      if (this.pendingMovement && this.socket && this.socket.connected) {
        this.send("player_move", {
          position: this.pendingMovement.position,
          frame: this.pendingMovement.frame,
        });
        this.pendingMovement = null;
      }
    }, 100); // 100ms debounce delay
  }

  public sendPlayerAnimation(animation: string, frame: number) {
    this.send("player_animation", {
      animation,
      frame,
    });
  }

  public getClientId(): string | null {
    return this.clientId;
  }

  public getCurrentRoom(): string | null {
    return this.currentRoom;
  }

  public isConnected(): boolean {
    return this.socket !== null && this.socket.connected;
  }

  public disconnect() {
    // Clear any pending movement timers
    if (this.movementDebounceTimer) {
      clearTimeout(this.movementDebounceTimer);
      this.movementDebounceTimer = null;
    }

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
    }
  }

  public forceReconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket.connect();
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

// Singleton instance
let socketClient: SocketIOClient | null = null;

export function getSocketIOClient(): SocketIOClient {
  if (!socketClient) {
    socketClient = new SocketIOClient();
  }
  return socketClient;
}

// Clean up function for when component unmounts
export function cleanupSocketIOClient() {
  if (socketClient) {
    socketClient.disconnect();
    socketClient = null;
  }
}
