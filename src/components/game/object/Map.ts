/** @format */
// @ts-nocheck: Object is possibly 'null'.

import Char from "./Char";
import MultiplayerChar from "./Multiplayer";
import { getSocketIOClient, Player } from "@/lib/ws";

export default class MapObj {
  scene: Phaser.Scene;
  player: Char;
  mapKey: string;
  boundaries: { minX: number; maxX: number; minY: number; maxY: number };
  interactionPrompt: Phaser.GameObjects.Text | null;
  spaceKey: Phaser.Input.Keyboard.Key;
  mapSelectionKey: Phaser.Input.Keyboard.Key;

  // Multiplayer properties
  wsClient: any;
  otherPlayers: Map<string, MultiplayerChar>;
  lastSentPosition: { x: number; y: number } | null;
  lastSentFrame: number | null;
  currentRoomId: string;

  constructor(scene: Phaser.Scene, mapKey: string) {
    this.scene = scene;
    this.mapKey = mapKey;
    this.interactionPrompt = null;

    // Initialize multiplayer properties FIRST
    this.otherPlayers = new Map<string, MultiplayerChar>();
    this.lastSentPosition = null;
    this.lastSentFrame = null;
    this.currentRoomId = "";

    // Create map display
    const map = this.scene.add.image(0, 0, this.mapKey).setOrigin(0);
    this.scene.cameras.main.setBounds(0, 0, map.width, map.height);

    // Initialize boundaries
    this.boundaries = {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };

    // Set boundaries based on map
    this.setupMapBoundaries();

    // Create player character
    this.player = new Char(this.scene, 12, 10, "player", 0);
    this.player.centeredCamera();

    // Add keyboard controls
    this.spaceKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );

    this.mapSelectionKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.M
    );

    // Initialize multiplayer AFTER everything else is set up
    this.initializeMultiplayer();

    // Show map selection prompt
    this.showMapSelectionPrompt();
  }

  initializeMultiplayer() {
    try {
      // Get existing WebSocket client (don't create new one)
      this.wsClient = getSocketIOClient();

      // Clear any existing event listeners to prevent duplicates
      this.clearMultiplayerEvents();

      // Set up event listeners
      this.setupMultiplayerEvents();

      // Join the current room
      this.currentRoomId = this.getSceneKey();
      this.wsClient.joinRoom(this.currentRoomId, {
        x: this.player.coordinate.x,
        y: this.player.coordinate.y,
      });

      console.log(`Joined room: ${this.currentRoomId}`);
    } catch (error) {
      console.error("Failed to initialize multiplayer:", error);
    }
  }

  clearMultiplayerEvents() {
    // Remove existing event listeners to prevent memory leaks
    if (this.wsClient) {
      this.wsClient.off("room_state");
      this.wsClient.off("player_joined");
      this.wsClient.off("player_left");
      this.wsClient.off("player_moved");
      this.wsClient.off("player_animation");
    }
  }

  setupMultiplayerEvents() {
    if (!this.wsClient) return;

    this.wsClient.on("room_state", (data: any) => {
      this.handleRoomState(data.players);
    });

    this.wsClient.on("player_joined", (data: any) => {
      this.addOtherPlayer(data.player);
    });

    this.wsClient.on("player_left", (data: any) => {
      this.removeOtherPlayer(data.playerId);
    });

    this.wsClient.on(
      "player_moved",
      (data: {
        playerId: string;
        position: { x: number; y: number };
        frame: number;
      }) => {
        this.updateOtherPlayerPosition(
          data.playerId,
          data.position,
          data.frame
        );
      }
    );

    this.wsClient.on(
      "player_animation",
      (data: { playerId: string; animation: string; frame: number }) => {
        this.playOtherPlayerAnimation(data.playerId, data.animation);
      }
    );
  }

  getSceneKey(): string {
    if (this.mapKey === "Island") return "Main_Screen";
    if (this.mapKey === "House") return "House_Screen";
    return this.scene.scene.key;
  }

  handleRoomState(players: Player[]) {
    // Clear existing other players
    this.clearOtherPlayers();

    // Add all players except self
    players.forEach((player) => {
      if (player.id !== this.wsClient.getClientId()) {
        this.addOtherPlayer(player);
      }
    });
  }

  clearOtherPlayers() {
    this.otherPlayers.forEach((player) => {
      if (player && typeof player.destroy === "function") {
        player.destroy();
      }
    });
    this.otherPlayers.clear();
  }

  addOtherPlayer(player: Player) {
    if (!player || !player.id) return;

    // Don't add if already exists
    if (this.otherPlayers.has(player.id)) return;

    try {
      const otherPlayer = new MultiplayerChar(
        this.scene,
        player.position.x,
        player.position.y,
        "player",
        player.frame,
        player.id,
        player.username
      );

      this.otherPlayers.set(player.id, otherPlayer);
      console.log(`Added player: ${player.username} (${player.id})`);
    } catch (error) {
      console.error("Failed to add other player:", error);
    }
  }

  removeOtherPlayer(playerId: string) {
    if (!playerId) return;

    const player = this.otherPlayers.get(playerId);
    if (player) {
      try {
        if (typeof player.destroy === "function") {
          player.destroy();
        }
        this.otherPlayers.delete(playerId);
        console.log(`Removed player: ${playerId}`);
      } catch (error) {
        console.error("Failed to remove player:", error);
      }
    }
  }

  updateOtherPlayerPosition(
    playerId: string,
    position: { x: number; y: number },
    frame: number
  ) {
    if (!playerId || !position) return;

    const player = this.otherPlayers.get(playerId);
    if (player && typeof player.updatePosition === "function") {
      try {
        player.updatePosition(position.x, position.y, frame);
      } catch (error) {
        console.error("Failed to update player position:", error);
      }
    }
  }

  playOtherPlayerAnimation(playerId: string, animation: string) {
    if (!playerId || !animation) return;

    const player = this.otherPlayers.get(playerId);
    if (player && typeof player.playAnimation === "function") {
      try {
        player.playAnimation(animation);
      } catch (error) {
        console.error("Failed to play player animation:", error);
      }
    }
  }

  sendPlayerUpdate() {
    if (!this.wsClient || !this.wsClient.isConnected()) return;

    try {
      const currentPosition = {
        x: this.player.coordinate.x,
        y: this.player.coordinate.y,
      };
      const currentFrame = this.player.sprite.frame.name;

      // Only send update if position or frame changed
      if (
        !this.lastSentPosition ||
        this.lastSentPosition.x !== currentPosition.x ||
        this.lastSentPosition.y !== currentPosition.y ||
        this.lastSentFrame !== currentFrame
      ) {
        this.wsClient.sendPlayerMove(currentPosition, currentFrame);
        this.lastSentPosition = { ...currentPosition };
        this.lastSentFrame = currentFrame;
      }
    } catch (error) {
      console.error("Failed to send player update:", error);
    }
  }

  setupMapBoundaries() {
    if (this.mapKey === "Island") {
      this.boundaries = {
        minX: 8,
        maxX: 15,
        minY: 10,
        maxY: 14,
      };
    } else if (this.mapKey === "House") {
      this.boundaries = {
        minX: 1,
        maxX: 7,
        minY: 2,
        maxY: 9,
      };
    }
  }

  checkBoundaries(newX: number, newY: number): boolean {
    const gridX = Math.floor((newX + 8) / 16);
    const gridY = Math.floor((newY + 18) / 16);

    return (
      gridX >= this.boundaries.minX &&
      gridX <= this.boundaries.maxX &&
      gridY >= this.boundaries.minY &&
      gridY <= this.boundaries.maxY
    );
  }

  showMapSelectionPrompt() {
    const prompt = this.scene.add.text(175, 20, "Press M to select map", {
      fontSize: "10px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      backgroundColor: "#000000",
      padding: { x: 4, y: 2 },
    });
    prompt.setOrigin(0.5);
    prompt.setScrollFactor(0);

    // Auto-hide after 3 seconds
    this.scene.time.delayedCall(3000, () => {
      if (prompt) {
        prompt.destroy();
      }
    });
  }

  moveChar(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (!this.player || this.player.isMoving) return;

    let targetX = this.player.coordinate.x;
    let targetY = this.player.coordinate.y;
    let direction = "";

    if (cursors.left.isDown) {
      targetX -= 16;
      direction = "left";
    } else if (cursors.right.isDown) {
      targetX += 16;
      direction = "right";
    } else if (cursors.up.isDown) {
      targetY -= 16;
      direction = "up";
    } else if (cursors.down.isDown) {
      targetY += 16;
      direction = "down";
    }

    if (direction && this.checkBoundaries(targetX, targetY)) {
      // Normal movement
      if (direction === "left") {
        this.player.moveToTile("x", -1, "left");
      } else if (direction === "right") {
        this.player.moveToTile("x", 1, "right");
      } else if (direction === "up") {
        this.player.moveToTile("y", -1, "up");
      } else if (direction === "down") {
        this.player.moveToTile("y", 1, "down");
      }

      // Send movement update to server
      this.sendPlayerUpdate();
    }

    // Handle map selection key
    if (Phaser.Input.Keyboard.JustDown(this.mapSelectionKey)) {
      this.returnToMapSelection();
    }
  }

  returnToMapSelection() {
    try {
      // Leave current room
      if (this.wsClient) {
        this.wsClient.leaveRoom();
      }

      // Show transition message
      const transitionText = this.scene.add.text(
        175,
        96,
        "Returning to map selection...",
        {
          fontSize: "12px",
          color: "#4caf50",
          fontFamily: "CustomFont, Arial",
          fontStyle: "bold",
          backgroundColor: "#000000",
          padding: { x: 8, y: 4 },
        }
      );
      transitionText.setOrigin(0.5);
      transitionText.setScrollFactor(0);

      // Transition to map selection after a short delay
      this.scene.time.delayedCall(1000, () => {
        this.scene.scene.start("Map_Selection_Screen");
      });
    } catch (error) {
      console.error("Failed to return to map selection:", error);
      // Fallback: direct scene transition
      this.scene.scene.start("Map_Selection_Screen");
    }
  }

  destroy() {
    try {
      // Clean up multiplayer
      this.clearMultiplayerEvents();

      if (this.wsClient) {
        this.wsClient.leaveRoom();
      }

      // Clean up other players
      this.clearOtherPlayers();

      // Clean up UI elements
      if (this.interactionPrompt) {
        this.interactionPrompt.destroy();
        this.interactionPrompt = null;
      }

      console.log("Map destroyed successfully");
    } catch (error) {
      console.error("Error during map destruction:", error);
    }
  }
}
