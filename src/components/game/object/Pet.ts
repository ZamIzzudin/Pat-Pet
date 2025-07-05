/** @format */

import Web3GameState from "./Web3GameState";
import { EventBus, GAME_EVENTS } from "@/lib/eventBus";
import FeedingUI from "../ui/FeedingUI";

export default class Pet {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  x: number;
  y: number;
  isAnimating: boolean;
  gameState: Web3GameState;
  currentSpriteKey: string;
  eventBus: EventBus;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.isAnimating = false;
    this.gameState = Web3GameState.getInstance();
    this.currentSpriteKey = "";
    this.eventBus = EventBus.getInstance();

    // Create pet sprite based on selected pet
    this.createPetSprite();

    // Start idle animation based on stage
    this.startIdleAnimation();

    // Listen for game state changes
    this.setupEventListeners();
  }

  private setupEventListeners() {
    this.eventBus.on(
      GAME_EVENTS.GAME_STATE_CHANGED,
      this.handleGameStateChange.bind(this)
    );
  }

  private handleGameStateChange(data: any) {
    if (
      data.type === "pet_selection_changed" ||
      data.type === "pet_stage_changed"
    ) {
      console.log("Pet: Handling game state change", data);
      this.updatePetSprite();
    }
  }

  createPetSprite() {
    const selectedPet = this.gameState.getSelectedPet();

    // Destroy existing sprite if it exists
    if (this.sprite) {
      this.sprite.destroy();
    }

    // Create new sprite with selected pet's sprite
    this.sprite = this.scene.add.sprite(this.x, this.y, selectedPet.sprite);
    this.sprite.setOrigin(0.5);
    this.sprite.setScale(2);

    // Update current sprite key
    this.currentSpriteKey = selectedPet.sprite;
  }

  updatePetSprite() {
    const newSpriteKey = this.gameState.getSelectedPet().sprite;
    // Only update if sprite actually changed
    if (this.currentSpriteKey !== newSpriteKey) {
      console.log(
        "Pet: Updating sprite from",
        this.currentSpriteKey,
        "to",
        newSpriteKey
      );

      // Stop current animation
      if (this.sprite && this.sprite.anims) {
        this.sprite.anims.stop();
      }

      // Create new sprite
      this.createPetSprite();

      // Create animations for new sprite
      this.createAllAnimations();

      // Start appropriate idle animation
      this.startIdleAnimation();
    }
  }

  getSelectedPetStage(): "egg" | "adult" {
    return this.gameState.getSelectedPet().stage;
  }

  getSelectedPetSprite(): string {
    return this.gameState.getSelectedPet().sprite;
  }

  createAllAnimations() {
    const spriteKey = this.getSelectedPetSprite();

    // Create egg idle animation
    if (!this.scene.anims.exists(`${spriteKey}-egg-idle`)) {
      this.scene.anims.create({
        key: `${spriteKey}-egg-idle`,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, {
          start: 0,
          end: 11,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    // Create hatch animation
    if (!this.scene.anims.exists(`${spriteKey}-hatch`)) {
      this.scene.anims.create({
        key: `${spriteKey}-hatch`,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, {
          start: 12,
          end: 23,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    // Create adult animations
    if (!this.scene.anims.exists(`${spriteKey}-idle`)) {
      this.scene.anims.create({
        key: `${spriteKey}-idle`,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, {
          start: 24,
          end: 35,
        }),
        frameRate: 4,
        repeat: -1,
      });
    }

    // Create feed animation if it doesn't exist
    if (!this.scene.anims.exists(`${spriteKey}-feed`)) {
      this.scene.anims.create({
        key: `${spriteKey}-feed`,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, {
          start: 24,
          end: 35,
        }),
        frameRate: 8,
        repeat: -1,
      });
    }

    // Create drink animation if it doesn't exist
    if (!this.scene.anims.exists(`${spriteKey}-drink`)) {
      this.scene.anims.create({
        key: `${spriteKey}-drink`,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, {
          start: 24,
          end: 35,
        }),
        frameRate: 6,
        repeat: -1,
      });
    }

    // Create happy animation if it doesn't exist
    if (!this.scene.anims.exists(`${spriteKey}-happy`)) {
      this.scene.anims.create({
        key: `${spriteKey}-happy`,
        frames: this.scene.anims.generateFrameNumbers(spriteKey, {
          start: 24,
          end: 35,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  }

  playHatchAnimation(scene: FeedingUI) {
    if (this.isAnimating || this.getSelectedPetStage() === "adult") return;

    this.isAnimating = true;
    const spriteKey = this.getSelectedPetSprite();

    // Ensure hatch animation exists
    this.createAllAnimations();

    this.sprite.anims.play(`${spriteKey}-hatch`, true);

    this.scene.tweens.add({
      targets: this.sprite,
      scaleX: 2.2,
      scaleY: 2.2,
      duration: 500,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        // Change to adult stage after hatching
        this.gameState.updateSelectedPetStage("adult");

        // Start adult idle animation
        this.sprite.anims.play(`${spriteKey}-idle`, true);
        this.isAnimating = false;

        // Emit Web3 event for hatching
        this.gameState.performPetAction("hatch", {
          spriteKey,
          newStage: "adult",
        });

        scene.selectedAction = "food";
        scene.createActionButtons();
      },
    });
  }

  startIdleAnimation() {
    const spriteKey = this.getSelectedPetSprite();
    const stage = this.getSelectedPetStage();

    // Ensure all animations are created
    this.createAllAnimations();

    if (stage === "egg") {
      this.sprite.anims.play(`${spriteKey}-egg-idle`, true);
    } else {
      this.sprite.anims.play(`${spriteKey}-idle`, true);
    }
  }

  playFeedAnimation() {
    if (this.isAnimating) return;

    const spriteKey = this.getSelectedPetSprite();

    this.isAnimating = true;

    // Play feed animation
    this.sprite.anims.play(`${spriteKey}-feed`, true);

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
        this.sprite.anims.play(`${spriteKey}-idle`, true);
        this.isAnimating = false;

        // Emit Web3 event for feeding
        this.gameState.performPetAction("feed", {
          spriteKey,
          animationType: "feed",
        });
      },
    });

    // Add floating heart effect
    this.showHeartEffect();
  }

  playDrinkAnimation() {
    if (this.isAnimating) return;

    const spriteKey = this.getSelectedPetSprite();

    this.isAnimating = true;

    // Play drink animation
    this.sprite.anims.play(`${spriteKey}-drink`, true);

    // Add gentle sway effect
    this.scene.tweens.add({
      targets: this.sprite,
      x: this.x - 5,
      duration: 300,
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.sprite.x = this.x;
        this.sprite.anims.play(`${spriteKey}-idle`, true);
        this.isAnimating = false;

        // Emit Web3 event for drinking
        this.gameState.performPetAction("drink", {
          spriteKey,
          animationType: "drink",
        });
      },
    });

    // Add water droplet effect
    this.showWaterEffect();
  }

  playHappyAnimation() {
    if (this.isAnimating) return;

    const spriteKey = this.getSelectedPetSprite();

    this.isAnimating = true;

    // Play happy animation
    this.sprite.anims.play(`${spriteKey}-happy`, true);

    // Add jump effect
    this.scene.tweens.add({
      targets: this.sprite,
      y: this.y - 20,
      duration: 300,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.sprite.y = this.y;
        this.sprite.anims.play(`${spriteKey}-idle`, true);
        this.isAnimating = false;

        // Emit Web3 event for playing
        this.gameState.performPetAction("play", {
          spriteKey,
          animationType: "happy",
        });
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
    // Clean up event listeners
    this.eventBus.off(GAME_EVENTS.GAME_STATE_CHANGED);

    if (this.sprite) {
      this.sprite.destroy();
    }
  }
}
