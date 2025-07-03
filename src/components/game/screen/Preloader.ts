/** @format */

import * as Phaser from "phaser";
import MoveAnimation from "../logic/MoveAnimation";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    // Load Assets
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

    // Pet sprite sheet (32x32 frames)
    this.load.spritesheet("cat", "/cat.png", {
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

    const loadingText = this.add.text(176, 96, "Loading...", {
      fontSize: "12px",
      color: "#ffffff",
    });
    loadingText.setOrigin(0.5, 0.5);

    this.load.on("progress", (value: number) => {
      loadingBar.clear();
      loadingBar.fillStyle(0xffffff, 1);
      loadingBar.fillRect(128, 88, 96 * value, 16);
    });

    this.load.on("complete", () => {
      loadingBar.destroy();
      loadingBox.destroy();
      loadingText.destroy();
    });
  }

  create() {
    MoveAnimation(this, "player");
    this.scene.start("Main_Screen");
  }
}
