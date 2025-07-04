/** @format */
// @ts-nocheck: Object is possibly 'null'.

import GridParse from "../utils/GridParse";

export default class MultiplayerChar {
  scene: Phaser.Scene | null;
  sprite: Phaser.GameObjects.Sprite | null;
  nameText: Phaser.GameObjects.Text;
  coordinate: { x: number; y: number };
  isMoving: boolean;
  key: string;
  playerId: string;
  username: string;
  isDestroyed: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    key: string,
    frame: number,
    playerId: string,
    username: string
  ) {
    this.scene = scene;
    this.coordinate = { x, y };
    this.isMoving = false;
    this.key = key;
    this.playerId = playerId;
    this.username = username;
    this.isDestroyed = false;

    try {
      // Create sprite
      this.sprite = this.scene.add.sprite(x, y, this.key, frame);
      this.sprite.setOrigin(0, 0);
      this.sprite.setTint(this.generatePlayerColor(playerId));

      // Create username text above the character
      this.nameText = this.scene.add.text(x + 24, y - 10, username, {
        fontSize: "8px",
        color: "#ffffff",
        fontFamily: "CustomFont, Arial",
        backgroundColor: "#000000",
        padding: { x: 2, y: 1 },
      });
      this.nameText.setOrigin(0.5, 1);
    } catch (error) {
      console.error("Failed to create multiplayer character:", error);
      this.isDestroyed = true;
    }
  }

  private generatePlayerColor(playerId: string): number {
    if (!playerId) return 0xffffff;

    // Generate a consistent color based on player ID
    let hash = 0;
    for (let i = 0; i < playerId.length; i++) {
      hash = playerId.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Convert to a pleasant color (avoid too dark or too light colors)
    const hue = Math.abs(hash) % 360;
    const saturation = 70 + (Math.abs(hash) % 30); // 70-100%
    const lightness = 50 + (Math.abs(hash) % 20); // 50-70%

    return Phaser.Display.Color.HSLToColor(
      hue / 360,
      saturation / 100,
      lightness / 100
    ).color;
  }

  updatePosition(x: number, y: number, frame: number) {
    if (this.isDestroyed || this.isMoving) return;

    try {
      this.isMoving = true;
      this.coordinate = GridParse.CharCoordinate(x, y);

      // Smooth movement to new position
      this.scene.tweens.add({
        targets: [this.sprite],
        x: x,
        y: y,
        duration: 250,
        onComplete: () => {
          if (!this.isDestroyed) {
            this.isMoving = false;
            if (this.sprite && typeof frame !== "undefined") {
              this.sprite.setFrame(frame);
            }
          }
        },
      });

      this.scene.tweens.add({
        targets: this.nameText,
        x: x + 24,
        y: y - 10,
        duration: 250,
        onComplete: () => {
          if (!this.isDestroyed) {
            this.isMoving = false;
            if (this.sprite && typeof frame !== "undefined") {
              this.sprite.setFrame(frame);
            }
          }
        },
      });
    } catch (error) {
      console.error("Failed to update player position:", error);
      this.isMoving = false;
    }
  }

  playAnimation(animationKey: string) {
    if (this.isDestroyed || !this.sprite) return;

    try {
      if (this.sprite.anims && this.sprite.anims.exists(animationKey)) {
        this.sprite.anims.play(animationKey, true);
      }
    } catch (error) {
      console.error("Failed to play animation:", error);
    }
  }

  setFrame(frame: number) {
    if (this.isDestroyed || !this.sprite) return;

    try {
      this.sprite.setFrame(frame);
    } catch (error) {
      console.error("Failed to set frame:", error);
    }
  }

  destroy() {
    if (this.isDestroyed) return;

    try {
      this.isDestroyed = true;

      if (this.sprite) {
        this.sprite.destroy();
        this.sprite = null;
      }

      if (this.nameText) {
        this.nameText.destroy();
        this.nameText = null;
      }
    } catch (error) {
      console.error("Failed to destroy multiplayer character:", error);
    }
  }
}
