/** @format */

import * as Phaser from "phaser";
import GameState from "../logic/GameState";

export default class StatusBars {
  scene: Phaser.Scene;
  gameState: GameState;

  // UI Elements
  profileSprite: Phaser.GameObjects.Sprite;
  happinessBar: Phaser.GameObjects.Graphics;
  hungerBar: Phaser.GameObjects.Graphics;
  thirstBar: Phaser.GameObjects.Graphics;

  happinessText: Phaser.GameObjects.Text;
  hungerText: Phaser.GameObjects.Text;
  thirstText: Phaser.GameObjects.Text;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.gameState = GameState.getInstance();
    this.create();
  }

  create() {
    // Profile picture
    this.profileSprite = this.scene.add.sprite(30, 30, "Backpack");
    this.profileSprite.setOrigin(0.5);
    this.profileSprite.setScale(0.8);

    // Background for status bars
    const bgGraphics = this.scene.add.graphics();
    bgGraphics.fillStyle(0x000000, 0.7);
    bgGraphics.fillRoundedRect(60, 10, 280, 40, 8);
    bgGraphics.lineStyle(2, 0xffffff, 0.8);
    bgGraphics.strokeRoundedRect(60, 10, 280, 40, 8);

    // Create status bars
    this.createStatusBar("happiness", 70, 18, 0xff6b6b); // Red for happiness
    this.createStatusBar("hunger", 70, 28, 0x4ecdc4); // Teal for hunger
    this.createStatusBar("thirst", 70, 38, 0x45b7d1); // Blue for thirst

    // Update bars initially
    this.updateBars();
  }

  createStatusBar(type: string, x: number, y: number, color: number) {
    // Bar background
    const barBg = this.scene.add.graphics();
    barBg.fillStyle(0x333333, 1);
    barBg.fillRoundedRect(x, y, 80, 6, 3);

    // Bar fill
    const bar = this.scene.add.graphics();

    // Label
    const label = this.scene.add.text(x + 85, y + 3, type.toUpperCase(), {
      fontSize: "8px",
      color: "#ffffff",
      fontFamily: "Arial",
    });
    label.setOrigin(0, 0.5);

    // Value text
    const valueText = this.scene.add.text(x + 130, y + 3, "100%", {
      fontSize: "8px",
      color: "#ffffff",
      fontFamily: "Arial",
    });
    valueText.setOrigin(0, 0.5);

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
      70,
      18,
      0xff6b6b
    );

    // Update hunger bar
    this.updateBar(
      this.hungerBar,
      this.hungerText,
      stats.hunger,
      70,
      28,
      0x4ecdc4
    );

    // Update thirst bar
    this.updateBar(
      this.thirstBar,
      this.thirstText,
      stats.thirst,
      70,
      38,
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
    const barWidth = (value / 100) * 80;

    // Choose color based on value
    let fillColor = color;
    if (value < 30) {
      fillColor = 0xff4757; // Red for low values
    } else if (value < 60) {
      fillColor = 0xffa502; // Orange for medium values
    }

    bar.fillStyle(fillColor, 1);
    bar.fillRoundedRect(x, y, barWidth, 6, 3);

    // Update text
    text.setText(`${Math.round(value)}%`);
  }

  destroy() {
    if (this.profileSprite) this.profileSprite.destroy();
    if (this.happinessBar) this.happinessBar.destroy();
    if (this.hungerBar) this.hungerBar.destroy();
    if (this.thirstBar) this.thirstBar.destroy();
    if (this.happinessText) this.happinessText.destroy();
    if (this.hungerText) this.hungerText.destroy();
    if (this.thirstText) this.thirstText.destroy();
  }
}
