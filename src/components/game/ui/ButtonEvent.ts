/** @format */

import { EventBus, GAME_EVENTS } from "@/lib/eventBus";

export default class ButtonEvent {
  screen: Phaser.Scene;
  label: string;
  redirect_to: string;
  redirect_from: string;
  sprite: string;
  pos: number[];
  size: number[];
  private eventBus: EventBus;

  constructor(
    screen: Phaser.Scene,
    pos: number[],
    size: number[],
    label: string,
    sprite: string
  ) {
    this.screen = screen;
    this.pos = pos;
    this.size = size;
    this.label = label;
    this.sprite = sprite;
    this.eventBus = EventBus.getInstance();
  }

  create() {
    // Create button graphics for pet screen
    const graph = this.screen.add.graphics();
    graph.fillStyle(0xf7cc9c, 1);
    graph.fillRoundedRect(
      this.pos[0] - 22,
      this.pos[1] - 23,
      this.size[0],
      this.size[1],
      6
    );
    graph.lineStyle(2, 0x6b4b5b, 1);
    graph.strokeRoundedRect(
      this.pos[0] - 22,
      this.pos[1] - 23,
      this.size[0],
      this.size[1],
      6
    );
    graph.setScrollFactor(0); // Fixed position

    // Add pet icon (using cat sprite)
    const icon = this.screen.add.sprite(this.pos[0], this.pos[1], this.sprite);
    icon.setOrigin(0.5, 0.75);
    icon.setScale(1);
    icon.setScrollFactor(0); // Fixed position

    // Add "P" text overlay with custom font
    const label = this.screen.add.text(
      this.pos[0],
      this.pos[1] + 15,
      this.label,
      {
        fontSize: "8px",
        color: "#ffffff",
        fontFamily: "CustomFont, Arial",
        resolution: 2,
        padding: { x: 2, y: 2 },
      }
    );
    label.setOrigin(0.5);
    label.setScrollFactor(0); // Fixed position

    // Make button interactive
    const area = this.screen.add.rectangle(
      this.pos[0],
      this.pos[1],
      this.size[0] + 3,
      this.size[1] + 3,
      0x000000,
      0
    );
    area.setInteractive();
    area.setScrollFactor(0); // Fixed position
    area.on("pointerdown", () => {
      this.handler();
    });

    // Add hover effect
    area.on("pointerover", () => {
      graph.clear();
      graph.fillStyle(0xf7cc9c, 1);
      graph.fillRoundedRect(
        this.pos[0] - 22,
        this.pos[1] - 23,
        this.size[0],
        this.size[1],
        6
      );
      graph.lineStyle(2, 0x009907, 1); // Pink/red tint for pet
      graph.strokeRoundedRect(
        this.pos[0] - 22,
        this.pos[1] - 23,
        this.size[0],
        this.size[1],
        6
      );
    });

    area.on("pointerout", () => {
      graph.clear();
      graph.fillStyle(0xf7cc9c, 1);
      graph.fillRoundedRect(
        this.pos[0] - 22,
        this.pos[1] - 23,
        this.size[0],
        this.size[1],
        6
      );
      graph.lineStyle(2, 0x6b4b5b, 1);
      graph.strokeRoundedRect(
        this.pos[0] - 22,
        this.pos[1] - 23,
        this.size[0],
        this.size[1],
        6
      );
    });
  }

  handler() {
    this.screen.scene.pause();
    this.eventBus.emit(GAME_EVENTS.MODAL_SHOWN);
  }
}
