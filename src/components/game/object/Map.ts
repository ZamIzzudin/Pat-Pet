/** @format */
import Char from "./Char";

export default class Map {
  scene: Phaser.Scene;
  player: Char;
  mapKey: string;

  constructor(scene: Phaser.Scene, mapKey: string) {
    this.scene = scene;
    this.mapKey = mapKey;

    const map = this.scene.add.image(0, 0, this.mapKey).setOrigin(0);

    this.scene.cameras.main.setBounds(0, 0, map.width, map.height);

    this.player = new Char(this.scene, 5, 10, "player", 0);

    this.player.centeredCamera();
  }

  moveChar(cursors: Phaser.Types.Input.Keyboard.CursorKeys) {
    if (cursors.left.isDown) {
      this.player.moveToTile("x", -1, "left");
    } else if (cursors.right.isDown) {
      this.player.moveToTile("x", 1, "right");
    } else if (cursors.up.isDown) {
      this.player.moveToTile("y", -1, "up");
    } else if (cursors.down.isDown) {
      this.player.moveToTile("y", 1, "down");
    }
  }
}
