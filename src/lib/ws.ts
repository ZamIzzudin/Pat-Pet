/** @format */

import { io, Socket } from "socket.io-client";

export interface Player {
  id: string;
  username: string;
  position: { x: number; y: number };
  frame: number;
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

  constructor(private url: string = "http://localhost:3001") {
    this.connect();
  }

  private connect() {
    try {
      this.socket = io(this.url, {
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        transports: ["websocket", "polling"],
      });

      this.setupEventHandlers();
    } catch (error) {
      console.error("Failed to create Socket.IO connection:", error);
      this.emit("error", error);
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to Socket.IO server");
      this.reconnectAttempts = 0;
      this.clientId = this.socket!.id || "";
      this.emit("connected");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Socket.IO connection disconnected:", reason);
      this.emit("disconnected");
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
    this.socket.on("room_state", (players) => {
      this.emit("room_state", players);
    });

    this.socket.on("player_joined", (player) => {
      this.emit("player_joined", player);
    });

    this.socket.on("player_left", (playerId) => {
      this.emit("player_left", playerId);
    });

    this.socket.on("player_moved", (data) => {
      this.emit("player_moved", {
        playerId: data.playerId,
        position: data.position,
        frame: data.frame,
      });
    });

    this.socket.on("player_animation", (data) => {
      this.emit("player_animation", {
        playerId: data.playerId,
        animation: data.animation,
        frame: data.frame,
      });
    });

    this.socket.on("player_username_changed", (data) => {
      this.emit("player_username_changed", {
        playerId: data.playerId,
        username: data.username,
      });
    });

    // Generic message handler for any other events
    this.socket.onAny((event, ...args) => {
      this.emit("message", { type: event, data: args });
    });
  }

  public on(event: string, handler: Function) {
    if (!this.messageHandlers.has(event)) {
      this.messageHandlers.set(event, []);
    }
    this.messageHandlers.get(event)!.push(handler);
  }

  public off(event: string, handler: Function) {
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
      handlers.forEach((handler) => handler(data));
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
    this.currentRoom = roomId;
    this.send("join_room", {
      roomId,
      position,
    });
  }

  public leaveRoom() {
    if (this.currentRoom) {
      this.send("leave_room");
      this.currentRoom = null;
    }
  }

  public sendPlayerMove(position: { x: number; y: number }, frame: number) {
    this.send("player_move", {
      position,
      frame,
    });
  }

  public sendPlayerAnimation(animation: string, frame: number) {
    this.send("player_animation", {
      animation,
      frame,
    });
  }

  public setUsername(username: string) {
    this.send("set_username", {
      username,
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
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Additional Socket.IO specific methods
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
