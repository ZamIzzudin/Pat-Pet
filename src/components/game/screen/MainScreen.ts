/** @format */
// @ts-nocheck: Object is possibly 'null'.

import Phaser from "phaser";
import Map from "../object/Map";

export default class MainScreen extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  map: Map;
  constructor() {
    super("Main_Screen");
  }

  create() {
    const mapKey = "Island";

    this.map = new Map(this, mapKey);
    this.cursors = this.input.keyboard.createCursorKeys();
  }

  update() {
    if (this.cursors) {
      this.map.moveChar(this.cursors);
    }
  }
}
