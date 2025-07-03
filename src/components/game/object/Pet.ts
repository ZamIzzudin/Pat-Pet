/** @format */

export default class Pet {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
  isAnimating: boolean;
  petStage: 'egg' | 'adult'; // Track pet stage

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isAnimating = false;
    this.petStage = 'egg'; // Start as egg

    // Create pet sprite
    this.sprite = this.scene.add.sprite(x, y, "Egg");
    this.sprite.setOrigin(0.5);
    this.sprite.setScale(2); // Scale up the 32x32 sprite

    // Start idle animation based on stage
    this.startIdleAnimation();
  }

  playHatchAnimation() {
    if (this.isAnimating || this.petStage === 'adult') return;

    this.isAnimating = true;

    // Create hatch animation if it doesn't exist
    if (!this.scene.anims.exists("egg-hatch")) {
      this.scene.anims.create({
        key: "egg-hatch",
        frames: this.scene.anims.generateFrameNumbers("Egg", {
          start: 12,
          end: 23,
        }),
        frameRate: 4,
        repeat: 2, // Play a few times for hatching effect
      });
    }

    this.sprite.anims.play("egg-hatch", true);

    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 2.2,
      scaleY: 2.2,
      duration: 200,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // Change to adult stage after hatching
        this.petStage = 'adult';
        
        // Create adult idle animation if it doesn't exist
        this.createAdultAnimations();
        
        // Start adult idle animation
        this.sprite.anims.play("cat-idle", true);
        this.isAnimating = false;
      },
    });
  }

  createAdultAnimations() {
    // Create adult idle animation if it doesn't exist
    if (!this.scene.anims.exists("cat-idle")) {
      this.scene.anims.create({
        key: "cat-idle",
        frames: this.scene.anims.generateFrameNumbers("Egg", {
          start: 24,
          end: 35,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    // Create feed animation if it doesn't exist
    if (!this.scene.anims.exists("cat-feed")) {
      this.scene.anims.create({
        key: "cat-feed",
        frames: this.scene.anims.generateFrameNumbers("Egg", {
          start: 36,
          end: 39, // Adjust based on your sprite sheet
        }),
        frameRate: 8,
        repeat: 2,
      });
    }

    // Create drink animation if it doesn't exist
    if (!this.scene.anims.exists("cat-drink")) {
      this.scene.anims.create({
        key: "cat-drink",
        frames: this.scene.anims.generateFrameNumbers("Egg", {
          start: 40,
          end: 43, // Adjust based on your sprite sheet
        }),
        frameRate: 6,
        repeat: 2,
      });
    }

    // Create happy animation if it doesn't exist
    if (!this.scene.anims.exists("cat-happy")) {
      this.scene.anims.create({
        key: "cat-happy",
        frames: this.scene.anims.generateFrameNumbers("Egg", {
          start: 44,
          end: 47, // Adjust based on your sprite sheet
        }),
        frameRate: 10,
        repeat: 3,
      });
    }
  }

  startIdleAnimation() {
    if (this.petStage === 'egg') {
      // Create egg idle animation if it doesn't exist
      if (!this.scene.anims.exists("egg-idle")) {
        this.scene.anims.create({
          key: "egg-idle",
          frames: this.scene.anims.generateFrameNumbers("Egg", {
            start: 0,
            end: 11,
          }),
          frameRate: 4,
          repeat: -1,
        });
      }
      this.sprite.anims.play("egg-idle", true);
    } else {
      // Create adult animations if they don't exist
      this.createAdultAnimations();
      this.sprite.anims.play("cat-idle", true);
    }
  }

  playFeedAnimation() {
    if (this.isAnimating) return;

    // If still an egg, trigger hatch instead
    if (this.petStage === 'egg') {
      this.playHatchAnimation();
      return;
    }

    this.isAnimating = true;

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

    // If still an egg, trigger hatch instead
    if (this.petStage === 'egg') {
      this.playHatchAnimation();
      return;
    }

    this.isAnimating = true;

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

    // If still an egg, trigger hatch instead
    if (this.petStage === 'egg') {
      this.playHatchAnimation();
      return;
    }

    this.isAnimating = true;

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