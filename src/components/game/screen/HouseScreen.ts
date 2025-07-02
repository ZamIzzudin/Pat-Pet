/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Map from "../object/Map";
import StatusBars from "../ui/StatusBars";

export default class HouseScreen extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  map: Map;
  statusBars: StatusBars;
  backpackKey: Phaser.Input.Keyboard.Key;
  goalsKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super("House_Screen");
  }

  create() {
    const mapKey = "House";
    this.map = new Map(this, mapKey);
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create status bars
    this.statusBars = new StatusBars(this);

    // Create action buttons
    this.createActionButtons();

    // Set player starting position when entering house
    this.map.player.coordinate = { x: 64, y: 96 }; // Adjust starting position
    this.map.player.sprite.setPosition(
      this.map.player.coordinate.x,
      this.map.player.coordinate.y
    );

    // Add keyboard shortcuts
    this.backpackKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.B
    );
    this.goalsKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.G
    );
  }

  createActionButtons() {
    // Goals button (above backpack button)
    this.createGoalsButton();

    // Backpack button
    this.createBackpackButton();
  }

  createGoalsButton() {
    // Create button graphics for goals
    const goalsGraphics = this.add.graphics();
    goalsGraphics.fillStyle(0x000000, 0);
    goalsGraphics.fillRoundedRect(298, 85, 45, 45, 6);
    goalsGraphics.lineStyle(2, 0xffffff, 1);
    goalsGraphics.strokeRoundedRect(298, 85, 45, 45, 6);
    goalsGraphics.setScrollFactor(0); // Fixed position

    // Add goals icon (using backpack sprite temporarily)
    const goalsIcon = this.add.sprite(320, 108, "Backpack");
    goalsIcon.setOrigin(0.5);
    goalsIcon.setTint(0x4caf50); // Green tint to differentiate
    goalsIcon.setScrollFactor(0); // Fixed position

    // Add "G" text overlay with custom font
    const goalsText = this.add.text(320, 108, "G", {
      fontSize: "12px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
      resolution: 2,
      padding: { x: 1, y: 1 },
    });
    goalsText.setOrigin(0.5);
    goalsText.setScrollFactor(0); // Fixed position

    // Make button interactive
    const goalsButtonArea = this.add.rectangle(320, 108, 48, 48, 0x000000, 0);
    goalsButtonArea.setInteractive();
    goalsButtonArea.setScrollFactor(0); // Fixed position
    goalsButtonArea.on("pointerdown", () => {
      this.openGoals();
    });

    // Add hover effect
    goalsButtonArea.on("pointerover", () => {
      goalsGraphics.clear();
      goalsGraphics.fillStyle(0x6a6a6a, 0);
      goalsGraphics.fillRoundedRect(298, 85, 45, 45, 6);
      goalsGraphics.lineStyle(2, 0x4caf50, 1);
      goalsGraphics.strokeRoundedRect(298, 85, 45, 45, 6);
    });

    goalsButtonArea.on("pointerout", () => {
      goalsGraphics.clear();
      goalsGraphics.fillStyle(0x4a4a4a, 0);
      goalsGraphics.fillRoundedRect(298, 85, 45, 45, 6);
      goalsGraphics.lineStyle(2, 0xffffff, 1);
      goalsGraphics.strokeRoundedRect(298, 85, 45, 45, 6);
    });
  }

  createBackpackButton() {
    // Create button graphics for backpack
    const backpackGraphics = this.add.graphics();
    backpackGraphics.fillStyle(0x000000, 0);
    backpackGraphics.fillRoundedRect(298, 137, 45, 45, 6);
    backpackGraphics.lineStyle(2, 0xffffff, 1);
    backpackGraphics.strokeRoundedRect(298, 137, 45, 45, 6);
    backpackGraphics.setScrollFactor(0); // Fixed position

    // Add backpack icon
    const backpackIcon = this.add.sprite(320, 160, "Backpack");
    backpackIcon.setOrigin(0.5);
    backpackIcon.setScrollFactor(0); // Fixed position

    // Make button interactive
    const backpackButtonArea = this.add.rectangle(
      320,
      160,
      48,
      48,
      0x000000,
      0
    );
    backpackButtonArea.setInteractive();
    backpackButtonArea.setScrollFactor(0); // Fixed position
    backpackButtonArea.on("pointerdown", () => {
      this.openBackpack();
    });

    // Add hover effect
    backpackButtonArea.on("pointerover", () => {
      backpackGraphics.clear();
      backpackGraphics.fillStyle(0x6a6a6a, 0);
      backpackGraphics.fillRoundedRect(298, 137, 45, 45, 6);
      backpackGraphics.lineStyle(2, 0xffff00, 1);
      backpackGraphics.strokeRoundedRect(298, 137, 45, 45, 6);
    });

    backpackButtonArea.on("pointerout", () => {
      backpackGraphics.clear();
      backpackGraphics.fillStyle(0x4a4a4a, 0);
      backpackGraphics.fillRoundedRect(298, 137, 45, 45, 6);
      backpackGraphics.lineStyle(2, 0xffffff, 1);
      backpackGraphics.strokeRoundedRect(298, 137, 45, 45, 6);
    });
  }

  openBackpack() {
    this.scene.pause();
    this.scene.launch("Backpack_Screen", { previousScene: "House_Screen" });
  }

  openGoals() {
    this.scene.pause();
    this.scene.launch("Goals_Screen", { previousScene: "House_Screen" });
  }

  update() {
    if (this.cursors) {
      this.map.moveChar(this.cursors);
    }

    // Update status bars
    if (this.statusBars) {
      this.statusBars.updateBars();
    }

    // Handle keyboard shortcuts
    if (Phaser.Input.Keyboard.JustDown(this.backpackKey)) {
      this.openBackpack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.goalsKey)) {
      this.openGoals();
    }
  }
}
