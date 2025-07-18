/** @format */

import * as Phaser from "phaser";
import Web3GameState from "../object/Web3GameState";
import { EventBus, GAME_EVENTS } from "@/lib/eventBus";

export default class StatusBars {
  scene: Phaser.Scene;
  gameState: Web3GameState;
  eventBus: EventBus;

  // UI Elements
  barLayoutSprite: Phaser.GameObjects.Sprite;
  profileSprite: Phaser.GameObjects.Sprite;
  happinessBar: Phaser.GameObjects.Graphics;
  hungerBar: Phaser.GameObjects.Graphics;
  thirstBar: Phaser.GameObjects.Graphics;

  happinessText: Phaser.GameObjects.Text;
  hungerText: Phaser.GameObjects.Text;
  thirstText: Phaser.GameObjects.Text;
  petNameText: Phaser.GameObjects.Text;
  walletText: Phaser.GameObjects.Text;
  petIdText: Phaser.GameObjects.Text; // New: NFT ID display

  // UI Container for fixed positioning
  uiContainer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = Web3GameState.getInstance();
    this.eventBus = EventBus.getInstance();
    this.create();
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.eventBus.on(
      GAME_EVENTS.GAME_STATE_CHANGED,
      this.handleGameStateChange.bind(this)
    );
  }

  private handleGameStateChange(data: any) {
    if (
      data.type === "pet_selection_changed" ||
      data.type === "pet_stage_changed"
    ) {
      console.log("StatusBars: Handling game state change", data);
      // this.updateBars();
    }
  }

  create() {
    // Create UI container that won't move with camera
    this.uiContainer = this.scene.add.container(0, 0);
    this.uiContainer.setScrollFactor(0); // This makes it fixed to camera

    // Use BarLayout asset as background
    this.barLayoutSprite = this.scene.add.sprite(170, 33, "BarLayout");
    this.barLayoutSprite.setScale(0.6);
    this.barLayoutSprite.setOrigin(0.5);
    this.barLayoutSprite.setScrollFactor(0);

    // Profile picture - positioned to fit within the BarLayout
    this.profileSprite = this.scene.add.sprite(35, 31, "Profile");
    this.profileSprite.setOrigin(0.5);
    this.profileSprite.setScale(1.5);
    this.profileSprite.setScrollFactor(0);

    // Pet name display
    this.petNameText = this.scene.add.text(35, 45, "", {
      fontSize: "8px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
      resolution: 2,
      padding: { x: 1, y: 1 },
    });
    this.petNameText.setOrigin(0.5);
    this.petNameText.setScrollFactor(0);

    // Pet ID display (new)
    this.petIdText = this.scene.add.text(35, 53, "", {
      fontSize: "6px",
      color: "#4caf50",
      fontFamily: "CustomFont, Arial",
      resolution: 2,
      padding: { x: 1, y: 1 },
    });
    this.petIdText.setOrigin(0.5);
    this.petIdText.setScrollFactor(0);

    // Wallet info display
    this.walletText = this.scene.add.text(35, 61, "", {
      fontSize: "6px",
      color: "#cccccc",
      fontFamily: "CustomFont, Arial",
      resolution: 2,
      padding: { x: 1, y: 1 },
    });
    this.walletText.setOrigin(0.5);
    this.walletText.setScrollFactor(0);

    // Create status bars positioned to align with BarLayout
    this.createStatusBar("happiness", 75, 20, 0xff6b6b); // Red for happiness
    this.createStatusBar("hunger", 75, 30, 0x4ecdc4); // Teal for hunger
    this.createStatusBar("thirst", 75, 40, 0x45b7d1); // Blue for thirst

    // Update bars initially
    // this.updateBars();
  }

  createStatusBar(type: string, x: number, y: number, color: number) {
    // Bar background
    const barBg = this.scene.add.graphics();
    barBg.fillStyle(0x333333, 0.8);
    barBg.fillRoundedRect(x, y, 70, 5, 2);
    barBg.setScrollFactor(0);

    // Bar fill
    const bar = this.scene.add.graphics();
    bar.setScrollFactor(0);

    // Label with custom font
    const label = this.scene.add.text(x + 75, y + 2.5, type.toUpperCase(), {
      fontSize: "8px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      resolution: 2,
      padding: { x: 1, y: 1 },
    });
    label.setOrigin(0, 0.5);
    label.setScrollFactor(0);

    // Value text with custom font
    const valueText = this.scene.add.text(x + 135, y + 2.5, "100%", {
      fontSize: "8px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      resolution: 2,
      padding: { x: 1, y: 1 },
    });
    valueText.setOrigin(0, 0.5);
    valueText.setScrollFactor(0);

    // Store references
    if (type === "happiness") {
      this.happinessBar = bar;
      this.happinessText = valueText;
    } else if (type === "hunger") {
      this.hungerBar = bar;
      this.hungerText = valueText;
    } else if (type === "thirst") {
      this.thirstBar = bar;
      this.thirstText = valueText;
    }
  }

  updateBars() {
    const selectedPet = this.gameState.getSelectedPet();
    const stats = selectedPet.stats;

    // console.log('StatusBars: Updating with selected pet', selectedPet);

    // Update pet name
    this.petNameText.setText(selectedPet.name);

    // Update pet ID (NFT ID)
    this.petIdText.setText(`NFT #${selectedPet.id}`);

    // Update wallet info
    const username = this.gameState.getUsername();
    const walletAddress = this.gameState.getWalletAddress();
    if (username && walletAddress) {
      this.walletText.setText(`${username} (${walletAddress.slice(0, 6)}...)`);
    } else {
      this.walletText.setText("Demo Mode");
    }

    // Update happiness bar
    this.updateBar(
      this.happinessBar,
      this.happinessText,
      stats.happiness,
      75,
      20,
      0xff6b6b
    );

    // Update hunger bar
    this.updateBar(
      this.hungerBar,
      this.hungerText,
      stats.hunger,
      75,
      30,
      0x4ecdc4
    );

    // Update thirst bar
    this.updateBar(
      this.thirstBar,
      this.thirstText,
      stats.thirst,
      75,
      40,
      0x45b7d1
    );

    // Update goals
    this.gameState.updateGoalProgress();
  }

  updateBar(
    bar: Phaser.GameObjects.Graphics,
    text: Phaser.GameObjects.Text,
    value: number,
    x: number,
    y: number,
    color: number
  ) {
    bar.clear();

    // Calculate bar width based on value
    const barWidth = (value / 100) * 70;

    // Choose color based on value
    let fillColor = color;
    if (value < 30) {
      fillColor = 0xff4757; // Red for low values
    } else if (value < 60) {
      fillColor = 0xffa502; // Orange for medium values
    }

    bar.fillStyle(fillColor, 1);
    bar.fillRoundedRect(x, y, barWidth, 5, 2);

    // Update text
    text.setText(`${Math.round(value)}%`);
  }

  destroy() {
    // Clean up event listeners
    this.eventBus.off(GAME_EVENTS.GAME_STATE_CHANGED);

    if (this.uiContainer) this.uiContainer.destroy();
    if (this.barLayoutSprite) this.barLayoutSprite.destroy();
    if (this.profileSprite) this.profileSprite.destroy();
    if (this.petNameText) this.petNameText.destroy();
    if (this.petIdText) this.petIdText.destroy();
    if (this.walletText) this.walletText.destroy();
    if (this.happinessBar) this.happinessBar.destroy();
    if (this.hungerBar) this.hungerBar.destroy();
    if (this.thirstBar) this.thirstBar.destroy();
    if (this.happinessText) this.happinessText.destroy();
    if (this.hungerText) this.hungerText.destroy();
    if (this.thirstText) this.thirstText.destroy();
  }
}
