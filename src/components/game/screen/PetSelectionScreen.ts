/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import GameState, { PetData } from "../object/GameState";

export default class PetSelectionScreen extends Phaser.Scene {
  previousScene: string;
  gameState: GameState;
  selectedPet: number;
  petElements: any[];
  titleText: Phaser.GameObjects.Text;
  instructionText: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  enterKey: Phaser.Input.Keyboard.Key;
  escapeKey: Phaser.Input.Keyboard.Key;
  container: Phaser.GameObjects.Container;

  constructor() {
    super("Pet_Selection_Screen");
  }

  init(data: { previousScene: string }) {
    this.previousScene = data.previousScene || "Main_Screen";
  }

  create() {
    this.gameState = GameState.getInstance();
    this.selectedPet = 0;
    this.petElements = [];

    // Create dark background
    this.add.rectangle(176, 96, 352, 192, 0x000000, 0.8);

    // Create pet selection UI background
    const bg = this.add.rectangle(176, 96, 330, 170, 0x2a2a2a);
    bg.setStrokeStyle(2, 0xffffff);

    // Title with custom font
    this.titleText = this.add.text(176, 25, "SELECT PET", {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
      resolution: 2,
      padding: { x: 2, y: 2 },
    });
    this.titleText.setOrigin(0.5);

    // Create container for pet slots
    this.container = this.add.container(176, 96);

    // Create pet slots
    this.createPetSlots();

    // Instructions
    this.instructionText = this.add.text(
      176,
      175,
      "Arrow Keys: Navigate | Enter: Select Pet | ESC: Close",
      {
        fontSize: "10px",
        color: "#cccccc",
        fontFamily: "CustomFont, Arial",
        resolution: 2,
        padding: { x: 1, y: 1 },
      }
    );
    this.instructionText.setOrigin(0.5);

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // Update selection visual
    this.updateSelection();
  }

  createPetSlots() {
    const startX = -120;
    const startY = -20;
    const slotWidth = 80;
    const slotHeight = 100;
    const spacingX = 120;

    this.gameState.getAllPets().forEach((pet, i) => {
      const x = startX + i * spacingX;
      const y = startY;

      // Create pet container
      const petContainer = this.add.container(x, y);

      // Create slot background
      const slot = this.add.graphics();
      slot.fillStyle(0x444444, 1);
      slot.fillRoundedRect(
        -slotWidth / 2,
        -slotHeight / 2,
        slotWidth,
        slotHeight,
        8
      );
      slot.lineStyle(2, 0x666666);
      slot.strokeRoundedRect(
        -slotWidth / 2,
        -slotHeight / 2,
        slotWidth,
        slotHeight,
        8
      );

      // Pet sprite preview
      const petSprite = this.add.sprite(0, -15, pet.sprite);
      petSprite.setOrigin(0.5);
      petSprite.setScale(1.5);

      // Pet name
      const petName = this.add.text(0, 15, pet.name, {
        fontSize: "12px",
        color: "#ffffff",
        fontFamily: "CustomFont, Arial",
        fontStyle: "bold",
        resolution: 2,
        padding: { x: 1, y: 1 },
      });
      petName.setOrigin(0.5);

      // Pet stage indicator
      const stageText = this.add.text(0, 28, pet.stage.toUpperCase(), {
        fontSize: "8px",
        color: pet.stage === "adult" ? "#4caf50" : "#ffa502",
        fontFamily: "CustomFont, Arial",
        resolution: 2,
        padding: { x: 1, y: 1 },
      });
      stageText.setOrigin(0.5);

      // Selected pet indicator (using selectedPetId instead of currentPetId)
      const selectedIndicator = this.add.text(0, -35, "★", {
        fontSize: "16px",
        color: "#ffff00",
        fontFamily: "CustomFont, Arial",
      });
      selectedIndicator.setOrigin(0.5);
      selectedIndicator.setVisible(pet.id === this.gameState.selectedPetId);

      // Status bars (mini version)
      this.createMiniStatusBars(petContainer, pet, 0, 40);

      // Locked overlay if not unlocked
      if (!pet.unlocked) {
        const lockOverlay = this.add.graphics();
        lockOverlay.fillStyle(0x000000, 0.7);
        lockOverlay.fillRoundedRect(
          -slotWidth / 2,
          -slotHeight / 2,
          slotWidth,
          slotHeight,
          8
        );

        const lockIcon = this.add.text(0, 0, "🔒", {
          fontSize: "24px",
          fontFamily: "CustomFont, Arial",
        });
        lockIcon.setOrigin(0.5);

        petContainer.add([lockOverlay, lockIcon]);
      }

      // Add elements to container
      petContainer.add([
        slot,
        petSprite,
        petName,
        stageText,
        selectedIndicator,
      ]);

      // Add to main container
      this.container.add(petContainer);

      // Store reference for selection highlighting
      this.petElements.push({
        container: petContainer,
        slot: slot,
        pet: pet,
        selectedIndicator: selectedIndicator,
      });
    });
  }

  createMiniStatusBars(
    container: Phaser.GameObjects.Container,
    pet: PetData,
    x: number,
    y: number
  ) {
    const barWidth = 60;
    const barHeight = 3;
    const spacing = 6;

    // Happiness bar
    const happinessBg = this.add.graphics();
    happinessBg.fillStyle(0x333333, 1);
    happinessBg.fillRect(x - barWidth / 2, y, barWidth, barHeight);

    const happinessBar = this.add.graphics();
    const happinessWidth = (pet.stats.happiness / 100) * barWidth;
    happinessBar.fillStyle(0xff6b6b, 1);
    happinessBar.fillRect(x - barWidth / 2, y, happinessWidth, barHeight);

    // Hunger bar
    const hungerBg = this.add.graphics();
    hungerBg.fillStyle(0x333333, 1);
    hungerBg.fillRect(x - barWidth / 2, y + spacing, barWidth, barHeight);

    const hungerBar = this.add.graphics();
    const hungerWidth = (pet.stats.hunger / 100) * barWidth;
    hungerBar.fillStyle(0x4ecdc4, 1);
    hungerBar.fillRect(x - barWidth / 2, y + spacing, hungerWidth, barHeight);

    // Thirst bar
    const thirstBg = this.add.graphics();
    thirstBg.fillStyle(0x333333, 1);
    thirstBg.fillRect(x - barWidth / 2, y + spacing * 2, barWidth, barHeight);

    const thirstBar = this.add.graphics();
    const thirstWidth = (pet.stats.thirst / 100) * barWidth;
    thirstBar.fillStyle(0x45b7d1, 1);
    thirstBar.fillRect(
      x - barWidth / 2,
      y + spacing * 2,
      thirstWidth,
      barHeight
    );

    container.add([
      happinessBg,
      happinessBar,
      hungerBg,
      hungerBar,
      thirstBg,
      thirstBar,
    ]);
  }

  updateSelection() {
    // Reset all slots
    this.petElements.forEach((element, index) => {
      const pet = element.pet;

      if (index === this.selectedPet && pet.unlocked) {
        element.slot.clear();
        element.slot.fillStyle(0x555555, 1);
        element.slot.fillRoundedRect(-40, -50, 80, 100, 8);
        element.slot.lineStyle(3, 0xffff00); // Yellow highlight for selected
        element.slot.strokeRoundedRect(-40, -50, 80, 100, 8);
      } else {
        element.slot.clear();
        element.slot.fillStyle(0x444444, 1);
        element.slot.fillRoundedRect(-40, -50, 80, 100, 8);
        element.slot.lineStyle(2, pet.unlocked ? 0x666666 : 0x333333);
        element.slot.strokeRoundedRect(-40, -50, 80, 100, 8);
      }

      // Update selected pet indicator (using selectedPetId)
      element.selectedIndicator.setVisible(
        pet.id === this.gameState.selectedPetId
      );
    });
  }

  update() {
    // Handle navigation
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.selectedPet = Math.max(0, this.selectedPet - 1);
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.selectedPet = Math.min(
        this.gameState.getAllPets().length - 1,
        this.selectedPet + 1
      );
      this.updateSelection();
    }

    // Handle pet selection
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      const selectedPetData = this.gameState.getAllPets()[this.selectedPet];

      if (selectedPetData && selectedPetData.unlocked) {
        // Use the new setSelectedPet method
        const success = this.gameState.setSelectedPet(selectedPetData.id);

        if (success) {
          // Show feedback
          this.showPetSelectedFeedback(selectedPetData);

          // Update selection to show new selected pet
          this.updateSelection();
        }
      }
    }

    // Handle closing pet selection
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.closePetSelection();
    }
  }

  showPetSelectedFeedback(pet: PetData) {
    const feedbackText = this.add.text(176, 45, `${pet.name} selected!`, {
      fontSize: "12px",
      color: "#4caf50",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
      resolution: 2,
      padding: { x: 2, y: 2 },
    });
    feedbackText.setOrigin(0.5);

    // Fade out the feedback text
    this.tweens.add({
      targets: feedbackText,
      alpha: 0,
      y: 25,
      duration: 500,
      onComplete: () => {
        feedbackText.destroy();
        this.closePetSelection();
      },
    });
  }

  closePetSelection() {
    this.scene.stop();
    this.scene.resume(this.previousScene);
  }
}
