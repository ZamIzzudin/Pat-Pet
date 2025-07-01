/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Map from "../object/Map";

export default class HouseScreen extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  map: Map;

  constructor() {
    super("House_Screen");
  }

  create() {
    const mapKey = "House";
    this.map = new Map(this, mapKey);
    this.cursors = this.input.keyboard.createCursorKeys();

    // Set player starting position when entering house
    this.map.player.coordinate = { x: 64, y: 96 }; // Adjust starting position
    this.map.player.sprite.setPosition(
      this.map.player.coordinate.x,
      this.map.player.coordinate.y
    );
  }

  update() {
    if (this.cursors) {
      this.map.moveChar(this.cursors);
    }
  }
}
