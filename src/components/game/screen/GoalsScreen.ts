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
    this.add.rectangle(176, 96, 352, 192, 0x000000, 0.8);

    // Create goals panel background with better spacing
    const bg = this.add.rectangle(176, 96, 330, 175, 0x2a2a2a);
    bg.setStrokeStyle(2, 0xffffff);

    // Title with custom font
    const titleText = this.add.text(176, 22, "GOALS & OBJECTIVES", {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      fontStyle: "bold",
      resolution: 2,
      padding: { x: 2, y: 2 },
    });
    titleText.setOrigin(0.5);

    // Create scrollable container
    this.scrollContainer = this.add.container(0, 0);

    // Create goal items with improved spacing
    this.createGoalItems();

    // Instructions with custom font
    const instructionText = this.add.text(
      176,
      178,
      "Arrow Keys: Scroll | ESC: Close",
      {
        fontSize: "10px",
        color: "#cccccc",
        fontFamily: "CustomFont, Arial",
        resolution: 2,
        padding: { x: 1, y: 1 },
      }
    );
    instructionText.setOrigin(0.5);

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();
    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // Calculate max scroll with improved spacing
    this.maxScroll = Math.max(0, this.gameState.goals.length * 32 - 125);
  }

  createGoalItems() {
    const startY = 45;
    const itemHeight = 32; // Increased height for better spacing

    this.gameState.goals.forEach((goal, index) => {
      const y = startY + index * itemHeight;

      // Goal container
      const goalContainer = this.add.container(176, y);

      // Background for goal item with better spacing
      const itemBg = this.add.graphics();
      const bgColor = goal.completed ? 0x2d5a2d : 0x3a3a3a;
      itemBg.fillStyle(bgColor, 0.8);
      itemBg.fillRoundedRect(-155, -12, 310, 24, 4); // Increased height
      itemBg.lineStyle(1, goal.completed ? 0x4caf50 : 0x666666);
      itemBg.strokeRoundedRect(-155, -12, 310, 24, 4);

      // Goal title with custom font and better positioning
      const titleColor = goal.completed ? "#4caf50" : "#ffffff";
      const titleText = this.add.text(-150, -8, goal.title, {
        fontSize: "10px",
        color: titleColor,
        fontFamily: "CustomFont, Arial",
        fontStyle: goal.completed ? "bold" : "normal",
        resolution: 2,
        padding: { x: 1, y: 1 },
      });
      titleText.setOrigin(0, 0);

      // Goal description with custom font
      const descText = this.add.text(-150, 2, goal.description, {
        fontSize: "8px",
        color: "#cccccc",
        fontFamily: "CustomFont, Arial",
        resolution: 2,
        padding: { x: 1, y: 1 },
      });
      descText.setOrigin(0, 0);

      // Progress bar background with better positioning
      const progressBg = this.add.graphics();
      progressBg.fillStyle(0x555555, 1);
      progressBg.fillRoundedRect(50, -2, 80, 4, 2); // Moved right for better spacing

      // Progress bar fill
      const progressFill = this.add.graphics();
      const progressWidth = (goal.progress / goal.maxProgress) * 80;
      const progressColor = goal.completed ? 0x4caf50 : 0x2196f3;
      progressFill.fillStyle(progressColor, 1);
      progressFill.fillRoundedRect(50, -2, progressWidth, 4, 2);

      // Progress text with custom font and better positioning
      const progressText = this.add.text(
        135,
        0,
        `${goal.progress}/${goal.maxProgress}`,
        {
          fontSize: "8px",
          color: "#cccccc",
          fontFamily: "CustomFont, Arial",
          resolution: 2,
          padding: { x: 1, y: 1 },
        }
      );
      progressText.setOrigin(0, 0.5);

      // Status icon with better positioning
      const statusText = this.add.text(145, 0, goal.completed ? "✓" : "○", {
        fontSize: "12px",
        color: goal.completed ? "#4caf50" : "#666666",
        fontFamily: "CustomFont, Arial",
        resolution: 2,
        padding: { x: 1, y: 1 },
      });
      statusText.setOrigin(0.5, 0.5);

      // Add elements to container
      goalContainer.add([
        itemBg,
        titleText,
        descText,
        progressBg,
        progressFill,
        progressText,
        statusText,
      ]);

      // Add to scroll container
      this.scrollContainer.add(goalContainer);

      this.goalElements.push(goalContainer);
    });
  }

  update() {
    // Handle scrolling with improved step size
    if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.scrollY = Math.max(0, this.scrollY - 32);
      this.updateScroll();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.scrollY = Math.min(this.maxScroll, this.scrollY + 32);
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
