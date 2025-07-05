/** @format */

import * as Phaser from "phaser";
import MoveAnimation from "../logic/MoveAnimation";
import Web3GameState from "../object/Web3GameState";

export default class Web3Preloader extends Phaser.Scene {
  private web3GameState: Web3GameState;
  private loadingText: Phaser.GameObjects.Text;
  private walletPrompt: Phaser.GameObjects.Text;
  private connectButton: Phaser.GameObjects.Graphics;
  private connectButtonText: Phaser.GameObjects.Text;
  private checkInterval: Phaser.Time.TimerEvent;

  constructor() {
    super("Web3_Preloader");
  }

  preload() {
    // Load all game assets
    this.load.image("House", "/Room.png");
    this.load.image("Island", "/Island3.png");
    this.load.image("bg", "/bg.png");

    // UI
    this.load.image("Button", "/Button.png");
    this.load.image("Inventory", "/Inventory.png");
    this.load.image("Backpack", "/Backpack.png");
    this.load.image("Task", "/Task.png");
    this.load.image("Profile", "/Profile.png");
    this.load.image("BarLayout", "/BarLayout.png");

    // Pet sprite sheets
    this.load.spritesheet("cat", "/cat.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("Egg", "/egg.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Egg2", "/egg3.png", {
      frameWidth: 32,
      frameHeight: 32,
    });
    this.load.spritesheet("Egg3", "/egg4.png", {
      frameWidth: 32,
      frameHeight: 32,
    });

    this.load.spritesheet("player", "/Char.png", {
      frameWidth: 48,
      frameHeight: 48,
    });

    // Create loading bar
    const loadingBar = this.add.graphics();
    const loadingBox = this.add.graphics();

    loadingBox.fillStyle(0x222222, 0.8);
    loadingBox.fillRect(126, 86, 100, 20);

    this.loadingText = this.add.text(176, 96, "Loading assets...", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
    });
    this.loadingText.setOrigin(0.5, 0.5);

    this.load.on("progress", (value: number) => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffffff, 1);
      loadingBar.fillRect(128, 88, 96 * value, 16);
    });

    this.load.on("complete", () => {
      loadingBar.destroy();
      loadingBox.destroy();
    });
  }

  create() {
    // Initialize Web3 game state
    this.web3GameState = Web3GameState.getInstance();
    
    // Create animations
    MoveAnimation(this, "player");

    // Create wallet connection UI
    this.createWalletUI();

    // Start checking for wallet connection
    this.startWalletCheck();

    // Emit game ready event
    this.web3GameState.emitGameReady();
  }

  private createWalletUI() {
    // Background
    this.add.rectangle(176, 96, 352, 192, 0x000000, 0.9);

    // Title
    const title = this.add.text(176, 50, "Web3 Pet Game", {
      fontSize: "20px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);

    // Wallet prompt
    this.walletPrompt = this.add.text(176, 80, "Please connect your wallet to continue", {
      fontSize: "12px",
      color: "#cccccc",
      fontFamily: "CustomFont, Arial",
    });
    this.walletPrompt.setOrigin(0.5);

    // Connect button (visual only - actual connection handled by React component)
    this.connectButton = this.add.graphics();
    this.connectButton.fillStyle(0x4caf50, 1);
    this.connectButton.fillRoundedRect(126, 100, 100, 30, 8);
    this.connectButton.lineStyle(2, 0x66bb6a);
    this.connectButton.strokeRoundedRect(126, 100, 100, 30, 8);

    this.connectButtonText = this.add.text(176, 115, "Connect Wallet", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
    });
    this.connectButtonText.setOrigin(0.5);

    // Instructions
    const instructions = this.add.text(176, 150, "Use the wallet connector in the top-right corner", {
      fontSize: "10px",
      color: "#888888",
      fontFamily: "CustomFont, Arial",
    });
    instructions.setOrigin(0.5);
  }

  private startWalletCheck() {
    this.checkInterval = this.time.addEvent({
      delay: 500,
      callback: this.checkWalletConnection,
      callbackScope: this,
      loop: true
    });
  }

  private checkWalletConnection() {
    if (this.web3GameState.isWalletConnected()) {
      // Wallet is connected, proceed to game
      this.walletPrompt.setText("Wallet connected! Loading game...");
      this.connectButton.setVisible(false);
      this.connectButtonText.setVisible(false);

      // Wait a moment then start the game
      this.time.delayedCall(1000, () => {
        this.checkInterval.destroy();
        this.scene.start("Map_Selection_Screen");
      });
    }
  }

  shutdown() {
    if (this.checkInterval) {
      this.checkInterval.destroy();
    }
  }
}