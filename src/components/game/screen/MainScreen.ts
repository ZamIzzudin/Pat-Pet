/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Map from "../object/Map";
import StatusBars from "../ui/StatusBars";

export default class MainScreen extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  map: Map;
  statusBars: StatusBars;
  petKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super("Main_Screen");
  }

  create() {
    const mapKey = "Island";
    this.map = new Map(this, mapKey);
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create status bars
    this.statusBars = new StatusBars(this);

    // Create pet button (replaces backpack and goals buttons)
    this.createPetButton();

    // Add keyboard shortcut
    this.petKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.P
    );
  }

  createPetButton() {
    // Create button graphics for pet screen
    const petGraphics = this.add.graphics();
    petGraphics.fillStyle(0x000000, 0);
    petGraphics.fillRoundedRect(298, 137, 45, 45, 6);
    petGraphics.lineStyle(2, 0xffffff, 1);
    petGraphics.strokeRoundedRect(298, 137, 45, 45, 6);
    petGraphics.setScrollFactor(0); // Fixed position

    // Add pet icon (using cat sprite)
    const petIcon = this.add.sprite(320, 160, "cat");
    petIcon.setOrigin(0.5);
    petIcon.setScale(1.5);
    petIcon.setScrollFactor(0); // Fixed position

    // Add "P" text overlay with custom font
    const petText = this.add.text(320, 175, "PET", {
      fontSize: "8px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
      resolution: 2,
      padding: { x: 1, y: 1 },
    });
    petText.setOrigin(0.5);
    petText.setScrollFactor(0); // Fixed position

    // Make button interactive
    const petButtonArea = this.add.rectangle(320, 160, 48, 48, 0x000000, 0);
    petButtonArea.setInteractive();
    petButtonArea.setScrollFactor(0); // Fixed position
    petButtonArea.on("pointerdown", () => {
      this.openPetScreen();
    });

    // Add hover effect
    petButtonArea.on("pointerover", () => {
      petGraphics.clear();
      petGraphics.fillStyle(0x6a6a6a, 0);
      petGraphics.fillRoundedRect(298, 137, 45, 45, 6);
      petGraphics.lineStyle(2, 0xff6b6b, 1); // Pink/red tint for pet
      petGraphics.strokeRoundedRect(298, 137, 45, 45, 6);
    });

    petButtonArea.on("pointerout", () => {
      petGraphics.clear();
      petGraphics.fillStyle(0x4a4a4a, 0);
      petGraphics.fillRoundedRect(298, 137, 45, 45, 6);
      petGraphics.lineStyle(2, 0xffffff, 1);
      petGraphics.strokeRoundedRect(298, 137, 45, 45, 6);
    });
  }

  openPetScreen() {
    this.scene.pause();
    this.scene.launch("Pet_Screen", { previousScene: "Main_Screen" });
  }

  update() {
    if (this.cursors) {
      this.map.moveChar(this.cursors);
    }

    // Update status bars
    if (this.statusBars) {
      this.statusBars.updateBars();
    }

    // Handle keyboard shortcut
    if (Phaser.Input.Keyboard.JustDown(this.petKey)) {
      this.openPetScreen();
    }
  }
}