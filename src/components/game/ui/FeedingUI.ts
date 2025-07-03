/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import GameState, { GameItem } from "../object/GameState";
import Pet from "../object/Pet";

export default class FeedingUI {
  scene: Phaser.Scene;
  gameState: GameState;
  pet: Pet;
  container: Phaser.GameObjects.Container;
  selectedAction: number;
  actionButtons: any[];
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  enterKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, pet: Pet) {
    this.scene = scene;
    this.gameState = GameState.getInstance();
    this.pet = pet;
    this.selectedAction = 0;
    this.actionButtons = [];
    this.create();
  }

  create() {
    // Create container for feeding UI
    this.container = this.scene.add.container(176, 160);

    // Create background panel
    const bg = this.scene.add.graphics();
    bg.fillStyle(0x2a2a2a, 0.9);
    bg.fillRoundedRect(-150, -25, 300, 50, 8);
    bg.lineStyle(2, 0xffffff, 0.8);
    bg.strokeRoundedRect(-150, -25, 300, 50, 8);
    this.container.add(bg);

    // Create action buttons
    this.createActionButtons();

    // Input setup
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.enterKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );

    // Update selection visual
    this.updateSelection();
  }

  createActionButtons() {
    const actions = [
      {
        name: "Feed",
        icon: "🍎",
        color: 0x4caf50,
        type: "food",
        effects: { hunger: 20, happiness: 10 },
      },
      {
        name: "Water",
        icon: "💧",
        color: 0x2196f3,
        type: "drink",
        effects: { thirst: 25, happiness: 5 },
      },
      {
        name: "Play",
        icon: "🎾",
        color: 0xff9800,
        type: "toy",
        effects: { happiness: 30, hunger: -5 },
      },
      {
        name: "Rest",
        icon: "😴",
        color: 0x9c27b0,
        type: "rest",
        effects: { happiness: 15, hunger: -3, thirst: -3 },
      },
    ];

    const startX = -120;
    const spacing = 80;

    actions.forEach((action, index) => {
      const x = startX + index * spacing;
      const y = 0;

      // Create button container
      const buttonContainer = this.scene.add.container(x, y);

      // Create button background
      const buttonBg = this.scene.add.graphics();
      buttonBg.fillStyle(0x444444, 1);
      buttonBg.fillRoundedRect(-25, -20, 50, 40, 6);
      buttonBg.lineStyle(1, 0x666666);
      buttonBg.strokeRoundedRect(-25, -20, 50, 40, 6);

      // Create icon
      const icon = this.scene.add.text(0, -5, action.icon, {
        fontSize: "16px",
        fontFamily: "CustomFont, Arial",
      });
      icon.setOrigin(0.5);

      // Create label
      const label = this.scene.add.text(0, 10, action.name, {
        fontSize: "8px",
        color: "#ffffff",
        fontFamily: "CustomFont, Arial",
        resolution: 2,
      });
      label.setOrigin(0.5);

      // Add elements to button container
      buttonContainer.add([buttonBg, icon, label]);

      // Add to main container
      this.container.add(buttonContainer);

      // Store reference
      this.actionButtons.push({
        container: buttonContainer,
        background: buttonBg,
        action: action,
        index: index,
      });

      // Make interactive
      const interactiveArea = this.scene.add.rectangle(
        x,
        y,
        50,
        40,
        0x000000,
        0
      );
      interactiveArea.setInteractive();
      interactiveArea.on("pointerdown", () => {
        this.selectedAction = index;
        this.updateSelection();
        this.performAction(action);
      });
      this.container.add(interactiveArea);
    });
  }

  updateSelection() {
    this.actionButtons.forEach((button, index) => {
      if (index === this.selectedAction) {
        button.background.clear();
        button.background.fillStyle(0x555555, 1);
        button.background.fillRoundedRect(-25, -20, 50, 40, 6);
        button.background.lineStyle(2, button.action.color);
        button.background.strokeRoundedRect(-25, -20, 50, 40, 6);
      } else {
        button.background.clear();
        button.background.fillStyle(0x444444, 1);
        button.background.fillRoundedRect(-25, -20, 50, 40, 6);
        button.background.lineStyle(1, 0x666666);
        button.background.strokeRoundedRect(-25, -20, 50, 40, 6);
      }
    });
  }

  performAction(action: any) {
    // Update game state
    this.gameState.updateStats(action.effects);

    // Play appropriate pet animation
    switch (action.type) {
      case "food":
        this.pet.playFeedAnimation();
        break;
      case "drink":
        this.pet.playDrinkAnimation();
        break;
      case "toy":
      case "rest":
        this.pet.playHappyAnimation();
        break;
    }

    // Show feedback
    this.showActionFeedback(action);
  }

  showActionFeedback(action: any) {
    const feedbackText = this.scene.add.text(
      176,
      120,
      `${action.name} given!`,
      {
        fontSize: "12px",
        color: "#4caf50",
        fontFamily: "CustomFont, Arial",
        fontStyle: "bold",
        resolution: 2,
      }
    );
    feedbackText.setOrigin(0.5);
    feedbackText.setScrollFactor(0);

    // Fade out the feedback text
    this.scene.tweens.add({
      targets: feedbackText,
      alpha: 0,
      y: 100,
      duration: 1500,
      onComplete: () => {
        feedbackText.destroy();
      },
    });
  }

  update() {
    // Handle navigation
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.selectedAction = Math.max(0, this.selectedAction - 1);
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.selectedAction = Math.min(
        this.actionButtons.length - 1,
        this.selectedAction + 1
      );
      this.updateSelection();
    }

    // Handle action execution
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      const selectedActionData = this.actionButtons[this.selectedAction].action;
      this.performAction(selectedActionData);
    }
  }

  destroy() {
    if (this.container) {
      this.container.destroy();
    }
  }
}
