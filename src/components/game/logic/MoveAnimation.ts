/** @format */

export default function MoveAnimation(scene: Phaser.Scene, texture: string) {
  scene.anims.create({
    key: "walk-down-" + texture,
    frames: scene.anims.generateFrameNumbers(texture, {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "walk-left-" + texture,
    frames: scene.anims.generateFrameNumbers(texture, {
      start: 8,
      end: 11,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "walk-right-" + texture,
    frames: scene.anims.generateFrameNumbers(texture, {
      start: 12,
      end: 15,
    }),
    frameRate: 10,
    repeat: -1,
  });

  scene.anims.create({
    key: "walk-up-" + texture,
    frames: scene.anims.generateFrameNumbers(texture, {
      start: 4,
      end: 7,
    }),
    frameRate: 10,
    repeat: -1,
  });
}
