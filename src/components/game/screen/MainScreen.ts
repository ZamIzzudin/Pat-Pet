/** @format */
// @ts-nocheck: Object is possibly 'null'.

import Phaser from "phaser";
import Map from "../object/Map";

export default class MainScreen extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  map: Map;
  actionButton: Phaser.GameObjects.Sprite;
  backpackKey: Phaser.Input.Keyboard.Key;
  
  constructor() {
    super("Main_Screen");
  }

  create() {
    const mapKey = "Island";
    this.map = new Map(this, mapKey);
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // Create action button for backpack
    this.createActionButton();
    
    // Add backpack key (B key)
    this.backpackKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
  }

  createActionButton() {
    // Create a simple action button in the bottom right corner
    this.actionButton = this.add.sprite(320, 160, null);
    
    // Create button graphics
    const graphics = this.add.graphics();
    graphics.fillStyle(0x4a4a4a, 0.8);
    graphics.fillRoundedRect(300, 145, 40, 30, 5);
    graphics.lineStyle(2, 0xffffff, 1);
    graphics.strokeRoundedRect(300, 145, 40, 30, 5);
    
    // Add backpack icon (using text as placeholder)
    const backpackIcon = this.add.text(320, 160, "🎒", {
      fontSize: "16px"
    });
    backpackIcon.setOrigin(0.5);
    
    // Make button interactive
    const buttonArea = this.add.rectangle(320, 160, 40, 30, 0x000000, 0);
    buttonArea.setInteractive();
    buttonArea.on('pointerdown', () => {
      this.openBackpack();
    });
    
    // Add hover effect
    buttonArea.on('pointerover', () => {
      graphics.clear();
      graphics.fillStyle(0x6a6a6a, 0.9);
      graphics.fillRoundedRect(300, 145, 40, 30, 5);
      graphics.lineStyle(2, 0xffff00, 1);
      graphics.strokeRoundedRect(300, 145, 40, 30, 5);
    });
    
    buttonArea.on('pointerout', () => {
      graphics.clear();
      graphics.fillStyle(0x4a4a4a, 0.8);
      graphics.fillRoundedRect(300, 145, 40, 30, 5);
      graphics.lineStyle(2, 0xffffff, 1);
      graphics.strokeRoundedRect(300, 145, 40, 30, 5);
    });
  }

  openBackpack() {
    this.scene.pause();
    this.scene.launch("Backpack_Screen", { previousScene: "Main_Screen" });
  }

  update() {
    if (this.cursors) {
      this.map.moveChar(this.cursors);
    }
    
    // Handle backpack key press
    if (Phaser.Input.Keyboard.JustDown(this.backpackKey)) {
      this.openBackpack();
    }
  }
}