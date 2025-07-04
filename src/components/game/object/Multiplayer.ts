/** @format */

// import GridParse from "../utils/GridParse";

export default class MultiplayerChar {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  nameText: Phaser.GameObjects.Text;
  coordinate: { x: number; y: number };
  isMoving: boolean;
  key: string;
  playerId: string;
  username: string;

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

    // Create sprite
    this.sprite = this.scene.add.sprite(x, y, this.key, frame);
    this.sprite.setOrigin(0, 0);
    this.sprite.setTint(this.generatePlayerColor(playerId)); // Different color for each player

    // Create username text above the character
    this.nameText = this.scene.add.text(x + 24, y - 10, username, {
      fontSize: "8px",
      color: "#ffffff",
      fontFamily: "CustomFont, Arial",
      backgroundColor: "#000000",
      padding: { x: 2, y: 1 },
    });
    this.nameText.setOrigin(0.5, 1);
  }

  private generatePlayerColor(playerId: string): number {
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
    if (this.isMoving) return;

    this.isMoving = true;
    this.coordinate = { x, y };

    // Smooth movement to new position
    this.scene.tweens.add({
      targets: [this.sprite, this.nameText],
      x: [this.sprite.x, x, this.nameText.x, x + 24],
      y: [this.sprite.y, y, this.nameText.y, y - 10],
      duration: 250,
      onComplete: () => {
        this.isMoving = false;
        this.sprite.setFrame(frame);
      },
    });
  }

  playAnimation(animationKey: string) {
    if (this.sprite.anims.exists(animationKey)) {
      this.sprite.anims.play(animationKey, true);
    }
  }

  setFrame(frame: number) {
    this.sprite.setFrame(frame);
  }

  updateUsername(newUsername: string) {
    this.username = newUsername;
    this.nameText.setText(newUsername);
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
    if (this.nameText) {
      this.nameText.destroy();
    }
  }
}
