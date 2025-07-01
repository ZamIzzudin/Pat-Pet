/** @format */

import Phaser from "phaser";
import MoveAnimation from "../logic/MoveAnimation";

export default class Preloader extends Phaser.Scene {
  constructor() {
    super("Preloader");
  }

  preload() {
    // Load Assets
    this.load.image("House", "/Room.png");
    this.load.image("Island", "/Island.png");
    this.load.spritesheet("player", "/Char.png", {
      frameWidth: 48,
      frameHeight: 48,
    });
  }

  create() {
    MoveAnimation(this, "player");
    this.scene.start("Main_Screen");
  }
}
