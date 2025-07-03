/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Pet from "../object/Pet";
import StatusBars from "../ui/StatusBars";
import FeedingUI from "../ui/FeedingUI";
import Button from "../ui/Button";
import GameState from "../object/GameState";
import { gameEventBus } from "@/lib/gameEventBus";

export default class PetScreen extends Phaser.Scene {
  previousScene: string;
  pet: Pet;
  backpackButton: Button;
  goalsButton: Button;
  statusBars: StatusBars;
  feedingUI: FeedingUI;
  backpackKey: Phaser.Input.Keyboard.Key;
  goalsKey: Phaser.Input.Keyboard.Key;
  escapeKey: Phaser.Input.Keyboard.Key;
  gameState: GameState;

  constructor() {
    super("Pet_Screen");
    this.backpackButton = new Button(
      this,
      [320, 33],
      [45, 45],
      "BACKPACK",
      "Backpack_Screen",
      "Pet_Screen",
      "Backpack"
    );
    this.goalsButton = new Button(
      this,
      [320, 85],
      [45, 45],
      "GOALS",
      "Goals_Screen",
      "Pet_Screen",
      "Backpack"
    );
  }

  init(data: { previousScene: string }) {
    this.previousScene = data.previousScene || "Main_Screen";
  }

  create() {
    this.gameState = GameState.getInstance();

    // Create background
    const bg = this.add.image(176, 96, "bg");
    bg.setOrigin(0.5);
    bg.setDisplaySize(352, 192);

    // Create pet in the center
    this.pet = new Pet(this, 176, 90);

    // Create status bars at the top
    this.statusBars = new StatusBars(this);

    // Create feeding UI at the bottom
    this.feedingUI = new FeedingUI(this, this.pet);

    // Create action buttons (moved from other screens)
    this.backpackButton.create();
    this.goalsButton.create();

    // Add keyboard shortcuts
    this.backpackKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.B
    );
    this.goalsKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.G
    );
    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // Set up event listeners for external events from React
    this.setupExternalEventListeners();
  }

  setupExternalEventListeners() {
    // Listen for external feed events from React
    gameEventBus.on('FEED_PET', () => {
      if (this.pet) {
        this.pet.playFeedAnimation();
      }
    });

    // Listen for external play events from React
    gameEventBus.on('PLAY_WITH_PET', () => {
      if (this.pet) {
        this.pet.playHappyAnimation();
      }
    });

    // Listen for external hatch events from React
    gameEventBus.on('HATCH_EGG', () => {
      if (this.pet) {
        this.pet.playHatchAnimation();
      }
    });

    // Listen for NFT equipped events
    gameEventBus.on('NFT_EQUIPPED', (nftData) => {
      console.log('NFT equipped in game:', nftData);
      // You can add visual effects or pet appearance changes here
      this.showNFTEquippedEffect();
    });

    // Listen for wallet connection events
    gameEventBus.on('WALLET_CONNECTED', (walletData) => {
      console.log('Wallet connected in game:', walletData);
      this.showWalletConnectedEffect();
    });
  }

  showNFTEquippedEffect() {
    // Create sparkle effect when NFT is equipped
    const sparkleText = this.add.text(176, 50, "✨ NFT Equipped! ✨", {
      fontSize: "14px",
      color: "#ffd700",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
    });
    sparkleText.setOrigin(0.5);

    // Animate the text
    this.tweens.add({
      targets: sparkleText,
      y: 30,
      alpha: 0,
      duration: 2000,
      onComplete: () => {
        sparkleText.destroy();
      },
    });
  }

  showWalletConnectedEffect() {
    // Create wallet connected effect
    const walletText = this.add.text(176, 60, "🔗 Wallet Connected!", {
      fontSize: "12px",
      color: "#4caf50",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
    });
    walletText.setOrigin(0.5);

    // Animate the text
    this.tweens.add({
      targets: walletText,
      y: 40,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        walletText.destroy();
      },
    });
  }

  update() {
    // Update status bars
    if (this.statusBars) {
      this.statusBars.updateBars();
    }

    // Update feeding UI
    if (this.feedingUI) {
      this.feedingUI.update();
    }

    // Handle keyboard shortcuts
    if (Phaser.Input.Keyboard.JustDown(this.backpackKey)) {
      this.backpackButton.handler();
    }

    if (Phaser.Input.Keyboard.JustDown(this.goalsKey)) {
      this.goalsButton.handler();
    }

    // Handle escape to return to previous scene
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.scene.stop();
      this.scene.start(this.previousScene);
    }
  }

  destroy() {
    // Clean up event listeners when scene is destroyed
    gameEventBus.off('FEED_PET');
    gameEventBus.off('PLAY_WITH_PET');
    gameEventBus.off('HATCH_EGG');
    gameEventBus.off('NFT_EQUIPPED');
    gameEventBus.off('WALLET_CONNECTED');
  }
}