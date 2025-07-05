/** @format */

import * as Phaser from "phaser";
import MoveAnimation from "../logic/MoveAnimation";
import Web3GameState from "../object/Web3GameState";

export default class Web3Preloader extends Phaser.Scene {
  private web3GameState: Web3GameState;
  private loadingText: Phaser.GameObjects.Text;
  private walletPrompt: Phaser.GameObjects.Text;
  private statusText: Phaser.GameObjects.Text;
  private checkInterval: Phaser.Time.TimerEvent;
  private assetsLoaded: boolean = false;

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
      this.assetsLoaded = true;
      this.loadingText.setText("Assets loaded!");
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
    const title = this.add.text(176, 40, "Pat-Pet", {
      fontSize: "18px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
    });
    title.setOrigin(0.5);

    // Subtitle
    const subtitle = this.add.text(176, 58, "Powered by Monad Testnet", {
      fontSize: "10px",
      color: "#4caf50",
      fontFamily: "CustomFont, Arial",
    });
    subtitle.setOrigin(0.5);

    // Wallet prompt
    this.walletPrompt = this.add.text(
      176,
      85,
      "Please connect your wallet to continue",
      {
        fontSize: "12px",
        color: "#cccccc",
        fontFamily: "CustomFont, Arial",
      }
    );
    this.walletPrompt.setOrigin(0.5);

    // Status text
    this.statusText = this.add.text(
      176,
      105,
      "Waiting for wallet connection...",
      {
        fontSize: "10px",
        color: "#ffa502",
        fontFamily: "CustomFont, Arial",
      }
    );
    this.statusText.setOrigin(0.5);
  }

  private startWalletCheck() {
    this.checkInterval = this.time.addEvent({
      delay: 500,
      callback: this.checkWalletConnection,
      callbackScope: this,
      loop: true,
    });
  }

  private checkWalletConnection() {
    if (!this.assetsLoaded) {
      this.statusText.setText("Loading game assets...");
      this.statusText.setColor("#ffa502");
      return;
    }

    if (this.web3GameState.isWalletConnected()) {
      // Wallet is connected, proceed to game
      const walletAddress = this.web3GameState.getWalletAddress();
      const username = this.web3GameState.getUsername();

      this.walletPrompt.setText("Wallet connected successfully!");
      this.walletPrompt.setColor("#4caf50");

      this.statusText.setText(
        `Welcome ${username}! (${walletAddress?.slice(0, 6)}...)`
      );
      this.statusText.setColor("#4caf50");

      // Wait a moment then start the game
      this.time.delayedCall(1500, () => {
        this.checkInterval.destroy();
        this.scene.start("Map_Selection_Screen");
      });
    } else {
      this.statusText.setText("Please connect your wallet");
      this.statusText.setColor("#ff6b6b");
    }
  }

  shutdown() {
    if (this.checkInterval) {
      this.checkInterval.destroy();
    }
  }
}
