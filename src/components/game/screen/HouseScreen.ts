/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Map from "../object/Map";
import StatusBars from "../ui/StatusBars";

export default class HouseScreen extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  map: Map;
  statusBars: StatusBars;
  backpackKey: Phaser.Input.Keyboard.Key;
  goalsKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super("House_Screen");
  }

  create() {
    const mapKey = "House";
    this.map = new Map(this, mapKey);
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create status bars
    this.statusBars = new StatusBars(this);

    // Set player starting position when entering house
    this.map.player.coordinate = { x: 64, y: 96 }; // Adjust starting position
    this.map.player.sprite.setPosition(
      this.map.player.coordinate.x,
      this.map.player.coordinate.y
    );

    // Add keyboard shortcuts
    this.backpackKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.B
    );
    this.goalsKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.G
    );
  }

  openBackpack() {
    this.scene.pause();
    this.scene.launch("Backpack_Screen", { previousScene: "House_Screen" });
  }

  openGoals() {
    this.scene.pause();
    this.scene.launch("Goals_Screen", { previousScene: "House_Screen" });
  }

  update() {
    if (this.cursors) {
      this.map.moveChar(this.cursors);
    }

    // Update status bars
    if (this.statusBars) {
      this.statusBars.updateBars();
    }

    // Handle keyboard shortcuts
    if (Phaser.Input.Keyboard.JustDown(this.backpackKey)) {
      this.openBackpack();
    }

    if (Phaser.Input.Keyboard.JustDown(this.goalsKey)) {
      this.openGoals();
    }
  }
}