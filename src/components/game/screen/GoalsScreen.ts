/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import GameState from "../object/GameState";

export default class GoalsScreen extends Phaser.Scene {
  previousScene: string;
  gameState: GameState;
  scrollY: number;
  maxScroll: number;
  goalElements: any[];
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  escapeKey: Phaser.Input.Keyboard.Key;
  scrollContainer: Phaser.GameObjects.Container;

  constructor() {
    super("Goals_Screen");
  }

  init(data: { previousScene: string }) {
    this.previousScene = data.previousScene || "Main_Screen";
  }

  create() {
    this.gameState = GameState.getInstance();
    this.scrollY = 0;
    this.goalElements = [];

    // Create dark background
    this.add.rectangle(176, 96, 352, 192, 0x000000, 0.9);

    // Create goals panel background
    const bg = this.add.rectangle(176, 96, 320, 170, 0x2a2a2a);
    bg.setStrokeStyle(2, 0xffffff);

    // Title
    const titleText = this.add.text(176, 25, "GOALS & OBJECTIVES", {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold"
    });
    titleText.setOrigin(0.5);

    // Create scrollable container
    this.scrollContainer = this.add.container(0, 0);

    // Create goal items
    this.createGoalItems();

    // Instructions
    const instructionText = this.add.text(
      176,
      175,
      "Arrow Keys: Scroll | ESC: Close",
      {
        fontSize: "10px",
        color: "#cccccc",
        fontFamily: "Arial",
      }
    );
    instructionText.setOrigin(0.5);

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();
    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // Calculate max scroll
    this.maxScroll = Math.max(0, (this.gameState.goals.length * 25) - 120);
  }

  createGoalItems() {
    const startY = 50;
    const itemHeight = 25;

    this.gameState.goals.forEach((goal, index) => {
      const y = startY + (index * itemHeight);
      
      // Goal container
      const goalContainer = this.add.container(176, y);

      // Background for goal item
      const itemBg = this.add.graphics();
      const bgColor = goal.completed ? 0x2d5a2d : 0x3a3a3a;
      itemBg.fillStyle(bgColor, 0.8);
      itemBg.fillRoundedRect(-150, -10, 300, 20, 4);
      itemBg.lineStyle(1, goal.completed ? 0x4caf50 : 0x666666);
      itemBg.strokeRoundedRect(-150, -10, 300, 20, 4);

      // Goal title
      const titleColor = goal.completed ? "#4caf50" : "#ffffff";
      const titleText = this.add.text(-145, -6, goal.title, {
        fontSize: "10px",
        color: titleColor,
        fontFamily: "Arial",
        fontStyle: goal.completed ? "bold" : "normal"
      });
      titleText.setOrigin(0, 0);

      // Progress bar background
      const progressBg = this.add.graphics();
      progressBg.fillStyle(0x555555, 1);
      progressBg.fillRoundedRect(-145, 2, 100, 4, 2);

      // Progress bar fill
      const progressFill = this.add.graphics();
      const progressWidth = (goal.progress / goal.maxProgress) * 100;
      const progressColor = goal.completed ? 0x4caf50 : 0x2196f3;
      progressFill.fillStyle(progressColor, 1);
      progressFill.fillRoundedRect(-145, 2, progressWidth, 4, 2);

      // Progress text
      const progressText = this.add.text(-40, -2, `${goal.progress}/${goal.maxProgress}`, {
        fontSize: "8px",
        color: "#cccccc",
        fontFamily: "Arial"
      });
      progressText.setOrigin(0, 0);

      // Status icon
      const statusText = this.add.text(140, -2, goal.completed ? "✓" : "○", {
        fontSize: "12px",
        color: goal.completed ? "#4caf50" : "#666666",
        fontFamily: "Arial"
      });
      statusText.setOrigin(0.5, 0);

      // Add elements to container
      goalContainer.add([itemBg, titleText, progressBg, progressFill, progressText, statusText]);
      
      // Add to scroll container
      this.scrollContainer.add(goalContainer);
      
      this.goalElements.push(goalContainer);
    });
  }

  update() {
    // Handle scrolling
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.scrollY = Math.max(0, this.scrollY - 25);
      this.updateScroll();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.scrollY = Math.min(this.maxScroll, this.scrollY + 25);
      this.updateScroll();
    }

    // Handle closing goals screen
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.closeGoals();
    }
  }

  updateScroll() {
    this.scrollContainer.setY(-this.scrollY);
  }

  closeGoals() {
    this.scene.stop();
    this.scene.resume(this.previousScene);
  }
}