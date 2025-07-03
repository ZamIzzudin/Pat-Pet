/** @format */
// @ts-nocheck: Object is possibly 'null'.

import Char from "./Char";

export default class Map {
  scene: Phaser.Scene;
  player: Char;
  mapKey: string;
  boundaries: { minX: number; maxX: number; minY: number; maxY: number };
  doorTiles: Array<{ x: number; y: number; targetScene: string }>;
  interactionPrompt: Phaser.GameObjects.Text | null;
  spaceKey: Phaser.Input.Keyboard.Key;

  constructor(scene: Phaser.Scene, mapKey: string) {
    this.scene = scene;
    this.mapKey = mapKey;
    this.interactionPrompt = null;

    const map = this.scene.add.image(0, 0, this.mapKey).setOrigin(0);
    this.scene.cameras.main.setBounds(0, 0, map.width, map.height);

    this.doorTiles = [];
    this.boundaries = {
      minX: 0,
      maxX: 0,
      minY: 0,
      maxY: 0,
    };

    // Set boundaries and door tiles based on map
    this.setupMapBoundaries();
    this.setupDoorTiles();

    this.player = new Char(this.scene, 12, 10, "player", 0);
    this.player.centeredCamera();

    // Add space key for interactions
    this.spaceKey = this.scene.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.SPACE
    );
  }

  setupMapBoundaries() {
    if (this.mapKey === "Island") {
      // Island boundaries (adjust based on your island image size)
      this.boundaries = {
        minX: 8,
        maxX: 15, // Adjust based on island width
        minY: 10,
        maxY: 14, // Adjust based on island height
      };
    } else if (this.mapKey === "House") {
      // House/Room boundaries
      this.boundaries = {
        minX: 1,
        maxX: 7, // Adjust based on room width
        minY: 2,
        maxY: 9, // Adjust based on room height
      };
    }
  }

  setupDoorTiles() {
    this.doorTiles = [];

    if (this.mapKey === "Island") {
      // Door tile to enter house (adjust coordinates based on your house position)
      this.doorTiles.push({ x: 12, y: 10, targetScene: "House_Screen" });
    } else if (this.mapKey === "House") {
      // Door tile to exit house back to island
      this.doorTiles.push({ x: 4, y: 9, targetScene: "Main_Screen" });
    }
  }

  checkBoundaries(newX: number, newY: number): boolean {
    const gridX = Math.floor((newX + 8) / 16);
    const gridY = Math.floor((newY + 18) / 16);

    return (
      gridX >= this.boundaries.minX &&
      gridX <= this.boundaries.maxX &&
      gridY >= this.boundaries.minY &&
      gridY <= this.boundaries.maxY
    );
  }

  checkDoorTile(x: number, y: number): string | null {
    const gridX = Math.floor((x + 8) / 16);
    const gridY = Math.floor((y + 18) / 16);

    for (const door of this.doorTiles) {
      if (door.x === gridX && door.y === gridY) {
        return door.targetScene;
      }
    }
    return null;
  }

  checkNearDoorTile(x: number, y: number): boolean {
    const gridX = Math.floor((x + 8) / 16);
    const gridY = Math.floor((y + 18) / 16);

    for (const door of this.doorTiles) {
      const distance = Math.abs(door.x - gridX) + Math.abs(door.y - gridY);
      if (distance <= 0.5) {
        return true;
      }
    }
    return false;
  }

  showInteractionPrompt() {
    if (!this.interactionPrompt) {
      this.interactionPrompt = this.scene.add.text(
        175,
        180,
        "Press SPACE to enter",
        {
          fontSize: "10px",
          color: "#ffffff",
          fontFamily: "Arial",
          backgroundColor: "#000000",
          padding: { x: 4, y: 2 },
        }
      );
      this.interactionPrompt.setOrigin(0.5);
      this.interactionPrompt.setScrollFactor(0);
    }
  }

  hideInteractionPrompt() {
    if (this.interactionPrompt) {
      this.interactionPrompt.destroy();
      this.interactionPrompt = null;
    }
  }

  moveChar(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (this.player.isMoving) return;

    let targetX = this.player.coordinate.x;
    let targetY = this.player.coordinate.y;
    let direction = "";

    if (cursors.left.isDown) {
      targetX -= 16;
      direction = "left";
    } else if (cursors.right.isDown) {
      targetX += 16;
      direction = "right";
    } else if (cursors.up.isDown) {
      targetY -= 16;
      direction = "up";
    } else if (cursors.down.isDown) {
      targetY += 16;
      direction = "down";
    }

    if (direction && this.checkBoundaries(targetX, targetY)) {
      // Normal movement
      if (direction === "left") {
        this.player.moveToTile("x", -1, "left");
      } else if (direction === "right") {
        this.player.moveToTile("x", 1, "right");
      } else if (direction === "up") {
        this.player.moveToTile("y", -1, "up");
      } else if (direction === "down") {
        this.player.moveToTile("y", 1, "down");
      }
    }

    // Check if near door tile and show/hide prompt
    if (
      this.checkNearDoorTile(this.player.coordinate.x, this.player.coordinate.y)
    ) {
      this.showInteractionPrompt();
    } else {
      this.hideInteractionPrompt();
    }

    // Handle space key for door interaction
    if (Phaser.Input.Keyboard.JustDown(this.spaceKey)) {
      const targetScene = this.checkDoorTile(
        this.player.coordinate.x,
        this.player.coordinate.y
      );
      if (targetScene) {
        this.hideInteractionPrompt();
        this.scene.scene.start(targetScene);
      }
    }
  }
}
