/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Pet from "../object/Pet";
import StatusBars from "../ui/StatusBars";
import FeedingUI from "../ui/FeedingUI";
import Button from "../ui/Button";
import GameState from "../object/GameState";

export default class PetScreen extends Phaser.Scene {
  previousScene: string;
  pet: Pet;
  petSelectionButton: Button;
  goalsButton: Button;
  statusBars: StatusBars;
  feedingUI: FeedingUI;
  gameState: GameState;
  petSelectionKey: Phaser.Input.Keyboard.Key;
  goalsKey: Phaser.Input.Keyboard.Key;
  escapeKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super("Pet_Screen");
    this.petSelectionButton = new Button(
      this,
      [320, 33],
      [45, 45],
      "PETS",
      "Pet_Selection_Screen",
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

    // Create action buttons
    this.petSelectionButton.create();
    this.goalsButton.create();

    // Add keyboard shortcuts
    this.petSelectionKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.B
    );
    this.goalsKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.G
    );
    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // Listen for pet changes
    this.events.on("wake", this.onWake, this);
  }

  onWake() {
    alert("triggered");
    // Update pet sprite when returning from pet selection
    if (this.pet) {
      this.pet.updatePetSprite();
    }

    // Update status bars to show current pet
    if (this.statusBars) {
      this.statusBars.updateBars();
    }
  }

  update() {
    // Update Pet Sprite
    if (this.pet) {
      this.pet.updatePetSprite();
    }

    // Update status bars
    if (this.statusBars) {
      this.statusBars.updateBars();
    }

    // Update feeding UI
    if (this.feedingUI) {
      this.feedingUI.update();
    }

    // Handle keyboard shortcuts
    if (Phaser.Input.Keyboard.JustDown(this.petSelectionKey)) {
      this.petSelectionButton.handler();
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
