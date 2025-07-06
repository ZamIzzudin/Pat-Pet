/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import { getSocketIOClient } from "@/lib/ws";

export default class MapSelectionScreen extends Phaser.Scene {
  selectedMap: number;
  mapElements: any[];
  titleText: Phaser.GameObjects.Text;
  instructionText: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  enterKey: Phaser.Input.Keyboard.Key;
  escapeKey: Phaser.Input.Keyboard.Key;
  container: Phaser.GameObjects.Container;
  wsClient: any;
  connectionStatus: Phaser.GameObjects.Text;
  refreshTimer: Phaser.Time.TimerEvent;

  constructor() {
    super("Map_Selection_Screen");
  }

  create() {
    this.selectedMap = 0;
    this.mapElements = [];

    // Initialize WebSocket client
    this.wsClient = getSocketIOClient();

    // Create dark background
    this.add.rectangle(176, 96, 352, 192, 0x000000, 0.9);

    // Create map selection UI background
    const bg = this.add.rectangle(176, 96, 330, 170, 0xc49a6c);
    bg.setStrokeStyle(2, 0x6b4b5b);

    // Title with custom font
    this.titleText = this.add.text(176, 25, "SELECT MAP", {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
      resolution: 2,
      padding: { x: 2, y: 2 },
    });
    this.titleText.setOrigin(0.5);

    // Connection status
    this.connectionStatus = this.add.text(176, 45, "", {
      fontSize: "10px",
      color: "#4caf50",
      fontFamily: "CustomFont, Arial",
      resolution: 2,
      padding: { x: 1, y: 1 },
    });
    this.connectionStatus.setOrigin(0.5);

    // Create container for map slots
    this.container = this.add.container(176, 96);

    // Create map slots
    this.createMapSlots();

    // Instructions
    this.instructionText = this.add.text(
      176,
      165,
      "Arrow Keys: Navigate | Enter: Join Map | ESC: Exit",
      {
        fontSize: "10px",
        color: "#cccccc",
        fontFamily: "CustomFont, Arial",
        resolution: 2,
        padding: { x: 1, y: 1 },
      }
    );
    this.instructionText.setOrigin(0.5);

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // Set up multiplayer event listeners
    this.setupMultiplayerEvents();

    // Update selection visual
    this.updateSelection();

    // Refresh room data periodically
    this.refreshRoomData();
    this.refreshTimer = this.time.addEvent({
      delay: 5000, // Refresh every 5 seconds
      callback: this.refreshRoomData,
      callbackScope: this,
      loop: true,
    });
  }

  setupMultiplayerEvents() {
    this.wsClient.on("connected", () => {
      this.connectionStatus.setText("Connected to server");
      this.connectionStatus.setColor("#ffffff");
      this.refreshRoomData();
    });

    this.wsClient.on("disconnected", () => {
      this.connectionStatus.setText("Disconnected from server");
      this.connectionStatus.setColor("#ff4757");
    });

    this.wsClient.on("error", () => {
      this.connectionStatus.setText("Connection error");
      this.connectionStatus.setColor("#ff4757");
    });
  }

  async refreshRoomData() {
    try {
      // Fetch room data from server
      const response = await fetch(
        "https://pat-pet-ws-production.up.railway.app/api/rooms"
      );
      if (response.ok) {
        const roomsData = await response.json();
        this.updateRoomPlayerCounts(roomsData);
      }
    } catch (error) {
      console.error("Failed to fetch room data:", error);
    }
  }

  updateRoomPlayerCounts(roomsData: any[]) {
    roomsData.forEach((room) => {
      this.updatePlayerCount(room.roomId, room.playerCount);
    });
  }

  createMapSlots() {
    const maps = [
      {
        id: "Main_Screen",
        name: "Island",
        preview: "Island",
        playerCount: 0,
      },
      {
        id: "House_Screen",
        name: "House",
        preview: "House",
        playerCount: 0,
      },
    ];

    const startX = -70;
    const startY = 0;
    const slotWidth = 20;
    const slotHeight = 20;
    const spacingX = 140;

    maps.forEach((map, i) => {
      const x = startX + i * spacingX;
      const y = startY;

      // Create map container
      const mapContainer = this.add.container(x, y);

      // Create slot background
      const slot = this.add.graphics();
      slot.fillStyle(0xc49a6c, 1);
      slot.fillRoundedRect(
        -slotWidth / 2,
        -slotHeight / 2,
        slotWidth,
        slotHeight,
        8
      );
      slot.lineStyle(2, 0x666666);
      slot.strokeRoundedRect(
        -slotWidth / 2,
        -slotHeight / 2,
        slotWidth,
        slotHeight,
        8
      );

      // Map name
      const mapName = this.add.text(0, -10, map.name, {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "CustomFont, Arial",
        fontStyle: "bold",
        resolution: 2,
        padding: { x: 1, y: 1 },
      });
      mapName.setOrigin(0.5);

      // Player count
      const playerCountText = this.add.text(
        0,
        10,
        `Players: ${map.playerCount}`,
        {
          fontSize: "8px",
          color: "#ffffff",
          fontFamily: "CustomFont, Arial",
          resolution: 2,
          padding: { x: 1, y: 1 },
        }
      );
      playerCountText.setOrigin(0.5);

      // Add elements to container
      mapContainer.add([slot, mapName, playerCountText]);

      // Add to main container
      this.container.add(mapContainer);

      // Store reference for selection highlighting
      this.mapElements.push({
        container: mapContainer,
        slot: slot,
        map: map,
        playerCountText: playerCountText,
      });
    });
  }

  updateSelection() {
    // Reset all slots
    this.mapElements.forEach((element, index) => {
      const slotWidth = 100;
      const slotHeight = 50;

      if (index === this.selectedMap) {
        element.slot.clear();
        element.slot.fillStyle(0xf7cc9c, 1);
        element.slot.fillRoundedRect(
          -slotWidth / 2,
          -slotHeight / 2,
          slotWidth,
          slotHeight,
          8
        );
        element.slot.lineStyle(3, 0x009907); // Green highlight for selected
        element.slot.strokeRoundedRect(
          -slotWidth / 2,
          -slotHeight / 2,
          slotWidth,
          slotHeight,
          8
        );
      } else {
        element.slot.clear();
        element.slot.fillStyle(0xf7cc9c, 1);
        element.slot.fillRoundedRect(
          -slotWidth / 2,
          -slotHeight / 2,
          slotWidth,
          slotHeight,
          8
        );
        element.slot.lineStyle(2, 0x6b4b5b);
        element.slot.strokeRoundedRect(
          -slotWidth / 2,
          -slotHeight / 2,
          slotWidth,
          slotHeight,
          8
        );
      }
    });
  }

  update() {
    // Update connection status
    if (this.wsClient.isConnected()) {
      if (this.connectionStatus.text !== "Connected to server") {
        this.connectionStatus.setText("Connected to server");
        this.connectionStatus.setColor("#009907");
      }
    } else {
      if (this.connectionStatus.text !== "Connecting...") {
        this.connectionStatus.setText("Connecting...");
        this.connectionStatus.setColor("#ffa502");
      }
    }

    // Handle navigation
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.selectedMap = Math.max(0, this.selectedMap - 1);
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.selectedMap = Math.min(
        this.mapElements.length - 1,
        this.selectedMap + 1
      );
      this.updateSelection();
    }

    // Handle map selection
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (this.wsClient.isConnected()) {
        const selectedMapData = this.mapElements[this.selectedMap].map;
        this.joinMap(selectedMapData.id);
      } else {
        this.showMessage("Please wait for connection...", "#ffa502");
      }
    }

    // Handle exit
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.game.destroy(true);
    }
  }

  joinMap(mapSceneKey: string) {
    // Show joining feedback
    this.showMessage("Joining map...", "#009907");

    // Small delay to show the message
    this.time.delayedCall(500, () => {
      this.scene.start(mapSceneKey);
    });
  }

  showMessage(text: string, color: string) {
    const messageText = this.add.text(176, 60, text, {
      fontSize: "10px",
      color: color,
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
      resolution: 2,
      padding: { x: 2, y: 2 },
    });
    messageText.setOrigin(0.5);

    // Fade out the message
    this.tweens.add({
      targets: messageText,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        messageText.destroy();
      },
    });
  }

  // Method to update player counts (can be called from multiplayer events)
  updatePlayerCount(mapId: string, count: number) {
    const mapElement = this.mapElements.find(
      (element) => element.map.id === mapId
    );
    if (mapElement) {
      mapElement.map.playerCount = count;
      mapElement.playerCountText.setText(`Players: ${count}`);
    }
  }

  shutdown() {
    // Clean up timer
    if (this.refreshTimer) {
      this.refreshTimer.destroy();
    }

    // Clean up event listeners
    this.wsClient.off("connected");
    this.wsClient.off("disconnected");
    this.wsClient.off("error");
  }
}
