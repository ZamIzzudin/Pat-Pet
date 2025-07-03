/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Pet from "../object/Pet";
import StatusBars from "../ui/StatusBars";
import FeedingUI from "../ui/FeedingUI";
import Button from "../ui/Button";

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
}
