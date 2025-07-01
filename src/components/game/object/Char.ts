/** @format */
// @ts-nocheck: Object is possibly 'null'.

import GridParse from "../utils/GridParse";

export default class Char {
  scene: Phaser.Scene;
  sprite: Phaser.GameObjects.Sprite;
  coordinate: { x: number; y: number };
  isMoving: boolean;
  key: string;
  isCentered: boolean;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    key: string,
    frame: number
  ) {
    this.scene = scene;
    this.coordinate = GridParse.CharCoordinate(x, y);
    this.isMoving = false;
    this.isCentered = false;
    this.key = key;

    this.sprite = this.scene.add.sprite(
      this.coordinate.x,
      this.coordinate.y,
      this.key,
      frame
    );
    this.sprite.setOrigin(0, 0);
  }

  moveToTile(cor: string, val: number, idle: string) {
    if (this.isMoving) return;

    this.isMoving = true;

    switch (idle) {
      case "left":
        this.sprite.anims.play("walk-left-" + this.key, true);
        break;
      case "right":
        this.sprite.anims.play("walk-right-" + this.key, true);
        break;
      case "up":
        this.sprite.anims.play("walk-up-" + this.key, true);
        break;
      case "down":
        this.sprite.anims.play("walk-down-" + this.key, true);
        break;
    }

    let x =
      cor === "x"
        ? (this.coordinate.x += GridParse.GridParse(val))
        : this.coordinate.x;
    let y =
      cor === "y"
        ? (this.coordinate.y += GridParse.GridParse(val))
        : this.coordinate.y;

    // Move Character
    this.scene.tweens.add({
      targets: [this.sprite],
      x: x,
      y: y,
      duration: 250,
      onComplete: () => {
        this.isMoving = false;
        this.sprite.anims.stop();

        if (idle === "up") {
          this.sprite.setFrame(4);
        } else if (idle === "down") {
          this.sprite.setFrame(0);
        } else if (idle === "left") {
          this.sprite.setFrame(11);
        } else if (idle === "right") {
          this.sprite.setFrame(11);
        }
      },
    });
  }

  centeredCamera() {
    if (this.isCentered) {
      this.scene.cameras.main.stopFollow(this.sprite);
    } else {
      this.scene.cameras.main.startFollow(this.sprite);
    }
  }
}
