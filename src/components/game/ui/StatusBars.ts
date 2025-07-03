/** @format */

import * as Phaser from "phaser";
import GameState from "../object/GameState";

export default class StatusBars {
  scene: Phaser.Scene;
  gameState: GameState;

  // UI Elements
  barLayoutSprite: Phaser.GameObjects.Sprite;
  profileSprite: Phaser.GameObjects.Sprite;
  happinessBar: Phaser.GameObjects.Graphics;
  hungerBar: Phaser.GameObjects.Graphics;
  thirstBar: Phaser.GameObjects.Graphics;

  happinessText: Phaser.GameObjects.Text;
  hungerText: Phaser.GameObjects.Text;
  thirstText: Phaser.GameObjects.Text;

  // UI Container for fixed positioning
  uiContainer: Phaser.GameObjects.Container;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameState.getInstance();
    this.create();
  }

  create() {
    // Create UI container that won't move with camera
    this.uiContainer = this.scene.add.container(0, 0);
    this.uiContainer.setScrollFactor(0); // This makes it fixed to camera

    // Use BarLayout asset as background
    this.barLayoutSprite = this.scene.add.sprite(170, 33, "BarLayout");
    this.barLayoutSprite.setScale(0.6);
    this.barLayoutSprite.setOrigin(0.5);
    this.barLayoutSprite.setScrollFactor(0);

    // Profile picture - positioned to fit within the BarLayout
    this.profileSprite = this.scene.add.sprite(35, 31, "Profile");
    this.profileSprite.setOrigin(0.5);
    this.profileSprite.setScale(1.5);
    this.profileSprite.setScrollFactor(0);

    // Create status bars positioned to align with BarLayout
    this.createStatusBar("happiness", 75, 20, 0xff6b6b); // Red for happiness
    this.createStatusBar("hunger", 75, 30, 0x4ecdc4); // Teal for hunger
    this.createStatusBar("thirst", 75, 40, 0x45b7d1); // Blue for thirst

    // Update bars initially
    this.updateBars();
  }

  createStatusBar(type: string, x: number, y: number, color: number) {
    // Bar background
    const barBg = this.scene.add.graphics();
    barBg.fillStyle(0x333333, 0.8);
    barBg.fillRoundedRect(x, y, 70, 5, 2);
    barBg.setScrollFactor(0);

    // Bar fill
    const bar = this.scene.add.graphics();
    bar.setScrollFactor(0);

    // Label with custom font
    const label = this.scene.add.text(x + 75, y + 2.5, type.toUpperCase(), {
      fontSize: "8px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      // fontStyle: "bold",
      resolution: 2, // Higher resolution for crisp text
      padding: { x: 1, y: 1 },
    });
    label.setOrigin(0, 0.5);
    label.setScrollFactor(0);

    // Value text with custom font
    const valueText = this.scene.add.text(x + 135, y + 2.5, "100%", {
      fontSize: "8px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      // fontStyle: "bold",
      resolution: 2, // Higher resolution for crisp text
      padding: { x: 1, y: 1 },
    });
    valueText.setOrigin(0, 0.5);
    valueText.setScrollFactor(0);

    // Store references
    if (type === "happiness") {
      this.happinessBar = bar;
      this.happinessText = valueText;
    } else if (type === "hunger") {
      this.hungerBar = bar;
      this.hungerText = valueText;
    } else if (type === "thirst") {
      this.thirstBar = bar;
      this.thirstText = valueText;
    }
  }

  updateBars() {
    const stats = this.gameState.playerStats;

    // Update happiness bar
    this.updateBar(
      this.happinessBar,
      this.happinessText,
      stats.happiness,
      75,
      20,
      0xff6b6b
    );

    // Update hunger bar
    this.updateBar(
      this.hungerBar,
      this.hungerText,
      stats.hunger,
      75,
      30,
      0x4ecdc4
    );

    // Update thirst bar
    this.updateBar(
      this.thirstBar,
      this.thirstText,
      stats.thirst,
      75,
      40,
      0x45b7d1
    );

    // Update goals
    this.gameState.updateGoalProgress();
  }

  updateBar(
    bar: Phaser.GameObjects.Graphics,
    text: Phaser.GameObjects.Text,
    value: number,
    x: number,
    y: number,
    color: number
  ) {
    bar.clear();

    // Calculate bar width based on value
    const barWidth = (value / 100) * 70;

    // Choose color based on value
    let fillColor = color;
    if (value < 30) {
      fillColor = 0xff4757; // Red for low values
    } else if (value < 60) {
      fillColor = 0xffa502; // Orange for medium values
    }

    bar.fillStyle(fillColor, 1);
    bar.fillRoundedRect(x, y, barWidth, 5, 2);

    // Update text
    text.setText(`${Math.round(value)}%`);
  }

  destroy() {
    if (this.uiContainer) this.uiContainer.destroy();
    if (this.barLayoutSprite) this.barLayoutSprite.destroy();
    if (this.profileSprite) this.profileSprite.destroy();
    if (this.happinessBar) this.happinessBar.destroy();
    if (this.hungerBar) this.hungerBar.destroy();
    if (this.thirstBar) this.thirstBar.destroy();
    if (this.happinessText) this.happinessText.destroy();
    if (this.hungerText) this.hungerText.destroy();
    if (this.thirstText) this.thirstText.destroy();
  }
}
