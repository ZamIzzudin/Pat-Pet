/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Pet from "../object/Pet";
import StatusBars from "../ui/StatusBars";
import FeedingUI from "../ui/FeedingUI";

export default class PetScreen extends Phaser.Scene {
  previousScene: string;
  pet: Pet;
  statusBars: StatusBars;
  feedingUI: FeedingUI;
  backpackKey: Phaser.Input.Keyboard.Key;
  goalsKey: Phaser.Input.Keyboard.Key;
  escapeKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super("Pet_Screen");
  }

  init(data: { previousScene: string }) {
    this.previousScene = data.previousScene || "Main_Screen";
  }

  create() {
    // Create background
    const bg = this.add.image(176, 96, "bg");
    bg.setOrigin(0.5);
    bg.setDisplaySize(352, 192);

    // Create pet in the center
    this.pet = new Pet(this, 176, 110);

    // Create status bars at the top
    this.statusBars = new StatusBars(this);

    // Create feeding UI at the bottom
    this.feedingUI = new FeedingUI(this, this.pet);

    // Create action buttons (moved from other screens)
    this.createActionButtons();

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
  }

  createActionButtons() {
    // Goals button
    this.createGoalsButton();

    // Backpack button
    this.createBackpackButton();
  }

  createGoalsButton() {
    // Create button graphics for goals
    const goalsGraphics = this.add.graphics();
    goalsGraphics.fillStyle(0x000000, 0.7);
    goalsGraphics.fillRoundedRect(298, 85, 45, 45, 6);
    goalsGraphics.lineStyle(2, 0xffffff, 1);
    goalsGraphics.strokeRoundedRect(298, 85, 45, 45, 6);
    goalsGraphics.setScrollFactor(0); // Fixed position

    // Add goals icon
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
      goalsGraphics.fillStyle(0x6a6a6a, 0.7);
      goalsGraphics.fillRoundedRect(298, 85, 45, 45, 6);
      goalsGraphics.lineStyle(2, 0x4caf50, 1);
      goalsGraphics.strokeRoundedRect(298, 85, 45, 45, 6);
    });

    goalsButtonArea.on("pointerout", () => {
      goalsGraphics.clear();
      goalsGraphics.fillStyle(0x000000, 0.7);
      goalsGraphics.fillRoundedRect(298, 85, 45, 45, 6);
      goalsGraphics.lineStyle(2, 0xffffff, 1);
      goalsGraphics.strokeRoundedRect(298, 85, 45, 45, 6);
    });
  }

  createBackpackButton() {
    // Create button graphics for backpack
    const backpackGraphics = this.add.graphics();
    backpackGraphics.fillStyle(0x000000, 0.7);
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
      backpackGraphics.fillStyle(0x6a6a6a, 0.7);
      backpackGraphics.fillRoundedRect(298, 137, 45, 45, 6);
      backpackGraphics.lineStyle(2, 0xffff00, 1);
      backpackGraphics.strokeRoundedRect(298, 137, 45, 45, 6);
    });

    backpackButtonArea.on("pointerout", () => {
      backpackGraphics.clear();
      backpackGraphics.fillStyle(0x000000, 0.7);
      backpackGraphics.fillRoundedRect(298, 137, 45, 45, 6);
      backpackGraphics.lineStyle(2, 0xffffff, 1);
      backpackGraphics.strokeRoundedRect(298, 137, 45, 45, 6);
    });
  }

  openBackpack() {
    this.scene.pause();
    this.scene.launch("Backpack_Screen", { previousScene: "Pet_Screen" });
  }

  openGoals() {
    this.scene.pause();
    this.scene.launch("Goals_Screen", { previousScene: "Pet_Screen" });
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
      this.openBackpack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.goalsKey)) {
      this.openGoals();
    }

    // Handle escape to return to previous scene
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.scene.stop();
      this.scene.start(this.previousScene);
    }
  }
}