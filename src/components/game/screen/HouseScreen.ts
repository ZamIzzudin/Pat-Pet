/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import MapObj from "../object/Map";
import Button from "../ui/Button";

export default class HouseScreen extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  map: MapObj;
  petButton: Button;
  petKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super("House_Screen");

    this.petButton = new Button(
      this,
      [320, 160],
      [45, 45],
      "PET",
      "Pet_Screen",
      "House_Screen",
      "Backpack"
    );
  }

  create() {
    const mapKey = "House";
    this.map = new MapObj(this, mapKey);
    this.cursors = this.input.keyboard.createCursorKeys();

    // Create status bars
    this.petButton.create();

    // Set player starting position when entering house
    this.map.player.coordinate = { x: 64, y: 140 }; // Adjust starting position
    this.map.player.sprite.setPosition(
      this.map.player.coordinate.x,
      this.map.player.coordinate.y
    );

    this.map.player.changeFrame(4);

    // Add keyboard shortcut
    this.petKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.P);
  }

  update() {
    if (this.cursors) {
      this.map.moveChar(this.cursors);
    }

    // Handle keyboard shortcut
    if (Phaser.Input.Keyboard.JustDown(this.petKey)) {
      this.petButton.handler();
    }
  }

  shutdown() {
    // Clean up map when scene shuts down
    if (this.map) {
      this.map.destroy();
    }
  }
}
