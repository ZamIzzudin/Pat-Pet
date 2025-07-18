/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Pet from "../object/Pet";
// import StatusBars from "../ui/StatusBars";
import FeedingUI from "../ui/FeedingUI";
import Button from "../ui/Button";
import ButtonEvent from "../ui/ButtonEvent";
import Web3GameState from "../object/Web3GameState";
import { EventBus, GAME_EVENTS } from "@/lib/eventBus";

export default class PetScreen extends Phaser.Scene {
  previousScene: string;
  pet: Pet;
  petSelectionButton: Button;
  goalsButton: Button;
  feedingUI: FeedingUI;
  gameState: Web3GameState;
  eventBus: EventBus;
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
    this.goalsButton = new ButtonEvent(
      this,
      [320, 85],
      [45, 45],
      "GOALS",
      "Backpack"
    );
  }

  init(data: { previousScene: string }) {
    this.previousScene = data.previousScene || "Main_Screen";
  }

  create() {
    this.gameState = Web3GameState.getInstance();
    this.eventBus = EventBus.getInstance();

    // Create background
    const bg = this.add.image(176, 96, "bg");
    bg.setOrigin(0.5);
    bg.setDisplaySize(352, 192);

    // Create pet in the center
    this.pet = new Pet(this, 176, 90);

    // Create status bars at the top
    // this.statusBars = new StatusBars(this);

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

    // Listen for scene wake events (when returning from other scenes)
    this.events.on("wake", this.onWake, this);

    // Setup event listeners for game state changes
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.eventBus.on(
      GAME_EVENTS.GAME_STATE_CHANGED,
      this.handleGameStateChange.bind(this)
    );

    this.eventBus.on(GAME_EVENTS.MODAL_HIDE, () => {
      this.scene.resume();
    });
  }

  handleGameStateChange(data: any) {
    if (data.type === "pet_selection_changed") {
      console.log("PetScreen: Pet selection changed", data);
      // Force update all components
      this.updateAllComponents();
    }
  }

  onWake() {
    console.log("PetScreen: Scene woke up, updating components");
    this.updateAllComponents();
  }

  updateAllComponents() {
    // Update pet sprite
    if (this.pet) {
      this.pet.updatePetSprite();
    }

    // Update status bars
    // if (this.statusBars) {
    //   this.statusBars.updateBars();
    // }

    // Update feeding UI
    if (this.feedingUI) {
      this.feedingUI.update();
    }
  }

  update() {
    // Update Pet Sprite
    if (this.pet) {
      this.pet.updatePetSprite(this.feedingUI);
    }

    // Update status bars
    // if (this.statusBars) {
    //   this.statusBars.updateBars();
    // }

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

  shutdown() {
    // Clean up event listeners
    this.eventBus.off(GAME_EVENTS.GAME_STATE_CHANGED);
    this.events.off("wake", this.onWake, this);
  }
}
