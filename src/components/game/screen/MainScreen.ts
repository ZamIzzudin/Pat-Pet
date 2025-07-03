/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import Map from "../object/Map";

import Button from "../ui/Button";

export default class MainScreen extends Phaser.Scene {
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  map: Map;
  petButton: Button;
  petKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super("Main_Screen");

    this.petButton = new Button(
      this,
      [320, 160],
      [45, 45],
      "PET",
      "Pet_Screen",
      "Main_Screen",
      "Backpack"
    );
  }

  create() {
    const mapKey = "Island";
    this.map = new Map(this, mapKey);
    this.cursors = this.input.keyboard.createCursorKeys();

    this.petButton.create();

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
}
