/** @format */
import Char from "./Char";

export default class Map {
  scene: Phaser.Scene;
  player: Char;
  mapKey: string;
  boundaries: { minX: number; maxX: number; minY: number; maxY: number };
  doorTiles: Array<{ x: number; y: number; targetScene: string }>;

  constructor(scene: Phaser.Scene, mapKey: string) {
    this.scene = scene;
    this.mapKey = mapKey;

    const map = this.scene.add.image(0, 0, this.mapKey).setOrigin(0);
    this.scene.cameras.main.setBounds(0, 0, map.width, map.height);

    // Set boundaries and door tiles based on map
    this.setupMapBoundaries();
    this.setupDoorTiles();

    this.player = new Char(this.scene, 5, 10, "player", 0);
    this.player.centeredCamera();
  }

  setupMapBoundaries() {
    if (this.mapKey === "Island") {
      // Island boundaries (adjust based on your island image size)
      this.boundaries = {
        minX: 1,
        maxX: 20, // Adjust based on island width
        minY: 1,
        maxY: 10, // Adjust based on island height
      };
    } else if (this.mapKey === "House") {
      // House/Room boundaries
      this.boundaries = {
        minX: 1,
        maxX: 10, // Adjust based on room width
        minY: 1,
        maxY: 8, // Adjust based on room height
      };
    }
  }

  setupDoorTiles() {
    this.doorTiles = [];
    
    if (this.mapKey === "Island") {
      // Door tile to enter house (adjust coordinates based on your house position)
      this.doorTiles.push({ x: 10, y: 6, targetScene: "House_Screen" });
    } else if (this.mapKey === "House") {
      // Door tile to exit house back to island
      this.doorTiles.push({ x: 5, y: 7, targetScene: "Main_Screen" });
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
      // Check if moving to a door tile
      const targetScene = this.checkDoorTile(targetX, targetY);
      if (targetScene) {
        // Transition to new scene
        this.scene.scene.start(targetScene);
        return;
      }

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
  }
}