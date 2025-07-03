/** @format */

export default class Pet {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
  isAnimating: boolean;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isAnimating = false;

    // Create pet sprite
    this.sprite = this.scene.add.sprite(x, y, "cat");
    this.sprite.setOrigin(0.5);
    this.sprite.setScale(2); // Scale up the 32x32 sprite

    // Start idle animation
    this.startIdleAnimation();
  }

  startIdleAnimation() {
    // Create idle animation if it doesn't exist
    if (!this.scene.anims.exists("cat-idle")) {
      this.scene.anims.create({
        key: "cat-idle",
        frames: this.scene.anims.generateFrameNumbers("cat", {
          start: 0,
          end: 3,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    this.sprite.anims.play("cat-idle", true);
  }

  playFeedAnimation() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    // Create feed animation if it doesn't exist
    if (!this.scene.anims.exists("cat-feed")) {
      this.scene.anims.create({
        key: "cat-feed",
        frames: this.scene.anims.generateFrameNumbers("cat", {
          start: 4,
          end: 7,
        }),
        frameRate: 8,
        repeat: 2,
      });
    }

    // Play feed animation
    this.sprite.anims.play("cat-feed", true);

    // Add bounce effect
    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 2.2,
      scaleY: 2.2,
      duration: 200,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        // Return to idle animation
        this.sprite.anims.play("cat-idle", true);
        this.isAnimating = false;
      },
    });

    // Add floating heart effect
    this.showHeartEffect();
  }

  playDrinkAnimation() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    // Create drink animation if it doesn't exist
    if (!this.scene.anims.exists("cat-drink")) {
      this.scene.anims.create({
        key: "cat-drink",
        frames: this.scene.anims.generateFrameNumbers("cat", {
          start: 8,
          end: 11,
        }),
        frameRate: 6,
        repeat: 2,
      });
    }

    // Play drink animation
    this.sprite.anims.play("cat-drink", true);

    // Add gentle sway effect
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.x - 5,
      duration: 300,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.sprite.x = this.x;
        this.sprite.anims.play("cat-idle", true);
        this.isAnimating = false;
      },
    });

    // Add water droplet effect
    this.showWaterEffect();
  }

  playHappyAnimation() {
    if (this.isAnimating) return;

    this.isAnimating = true;

    // Create happy animation if it doesn't exist
    if (!this.scene.anims.exists("cat-happy")) {
      this.scene.anims.create({
        key: "cat-happy",
        frames: this.scene.anims.generateFrameNumbers("cat", {
          start: 12,
          end: 15,
        }),
        frameRate: 10,
        repeat: 3,
      });
    }

    // Play happy animation
    this.sprite.anims.play("cat-happy", true);

    // Add jump effect
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.y - 20,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.sprite.y = this.y;
        this.sprite.anims.play("cat-idle", true);
        this.isAnimating = false;
      },
    });

    // Add sparkle effect
    this.showSparkleEffect();
  }

  showHeartEffect() {
    const heart = this.scene.add.text(this.x, this.y - 30, "♥", {
      fontSize: "16px",
      color: "#ff6b6b",
      fontFamily: "CustomFont, Arial",
    });
    heart.setOrigin(0.5);

    this.scene.tweens.add({
      targets: heart,
      y: this.y - 60,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        heart.destroy();
      },
    });
  }

  showWaterEffect() {
    const droplet = this.scene.add.text(this.x + 15, this.y - 20, "💧", {
      fontSize: "12px",
      fontFamily: "CustomFont, Arial",
    });
    droplet.setOrigin(0.5);

    this.scene.tweens.add({
      targets: droplet,
      y: this.y - 50,
      alpha: 0,
      duration: 1200,
      onComplete: () => {
        droplet.destroy();
      },
    });
  }

  showSparkleEffect() {
    const sparkle = this.scene.add.text(this.x - 20, this.y - 25, "✨", {
      fontSize: "14px",
      fontFamily: "CustomFont, Arial",
    });
    sparkle.setOrigin(0.5);

    this.scene.tweens.add({
      targets: sparkle,
      y: this.y - 55,
      x: this.x + 20,
      alpha: 0,
      duration: 1800,
      onComplete: () => {
        sparkle.destroy();
      },
    });
  }

  destroy() {
    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}