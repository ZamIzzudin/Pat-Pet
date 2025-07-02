/** @format */
// @ts-nocheck: Object is possibly 'null'.

import * as Phaser from "phaser";
import GameState, { GameItem } from "../logic/GameState";

export default class BackpackScreen extends Phaser.Scene {
  previousScene: string;
  gameState: GameState;
  selectedItem: number;
  scrollY: number;
  maxScroll: number;
  itemElements: any[];
  titleText: Phaser.GameObjects.Text;
  instructionText: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  enterKey: Phaser.Input.Keyboard.Key;
  escapeKey: Phaser.Input.Keyboard.Key;
  scrollContainer: Phaser.GameObjects.Container;

  constructor() {
    super("Backpack_Screen");
  }

  init(data: { previousScene: string }) {
    this.previousScene = data.previousScene || "Main_Screen";
  }

  create() {
    this.gameState = GameState.getInstance();
    this.selectedItem = 0;
    this.scrollY = 0;
    this.itemElements = [];

    // Create dark background
    this.add.rectangle(176, 96, 352, 192, 0x000000, 0.8);

    // Create backpack UI background
    const bg = this.add.rectangle(176, 96, 320, 160, 0x2a2a2a);
    bg.setStrokeStyle(2, 0xffffff);

    // Title
    this.titleText = this.add.text(176, 30, "BACKPACK", {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "Arial",
      fontStyle: "bold",
    });
    this.titleText.setOrigin(0.5);

    // Create scrollable container
    this.scrollContainer = this.add.container(0, 0);

    // Create item slots
    this.createItemSlots();

    // Instructions
    this.instructionText = this.add.text(
      176,
      170,
      "Arrow Keys: Navigate | Enter: Use Item | ESC: Close",
      {
        fontSize: "10px",
        color: "#cccccc",
        fontFamily: "Arial",
      }
    );
    this.instructionText.setOrigin(0.5);

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ENTER
    );
    this.escapeKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    // Calculate max scroll
    const itemsPerRow = 6;
    const rows = Math.ceil(this.gameState.inventory.length / itemsPerRow);
    this.maxScroll = Math.max(0, rows * 40 - 100);

    // Update selection visual
    this.updateSelection();
  }

  createItemSlots() {
    const startX = 80;
    const startY = 60;
    const slotSize = 32;
    const spacingX = 40;
    const spacingY = 40;
    const itemsPerRow = 6;

    this.gameState.inventory.forEach((item, i) => {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = startX + col * spacingX;
      const y = startY + row * spacingY;

      // Create item container
      const itemContainer = this.add.container(x, y);

      // Create slot background
      const slot = this.add.graphics();
      slot.fillStyle(0x444444, 1);
      slot.fillRoundedRect(-16, -16, slotSize, slotSize, 4);
      slot.lineStyle(1, 0x666666);
      slot.strokeRoundedRect(-16, -16, slotSize, slotSize, 4);

      // Create item icon
      const itemIcon = this.add.sprite(0, 0, item.icon);
      itemIcon.setOrigin(0.5);
      itemIcon.setScale(0.6);

      // Item name text
      const itemName = this.add.text(0, 20, item.name, {
        fontSize: "8px",
        color: "#ffffff",
        fontFamily: "Arial",
      });
      itemName.setOrigin(0.5, 0);

      // Item type indicator
      const typeColor = this.getTypeColor(item.type);
      const typeIndicator = this.add.graphics();
      typeIndicator.fillStyle(typeColor, 0.8);
      typeIndicator.fillCircle(12, -12, 4);

      // Add elements to container
      itemContainer.add([slot, itemIcon, itemName, typeIndicator]);

      // Add to scroll container
      this.scrollContainer.add(itemContainer);

      // Store reference for selection highlighting
      this.itemElements.push({
        container: itemContainer,
        slot: slot,
        item: item,
      });
    });
  }

  getTypeColor(type: string): number {
    switch (type) {
      case "food":
        return 0x4caf50; // Green
      case "drink":
        return 0x2196f3; // Blue
      case "toy":
        return 0xff9800; // Orange
      case "tool":
        return 0x9c27b0; // Purple
      default:
        return 0x666666; // Gray
    }
  }

  updateSelection() {
    // Reset all slots
    this.itemElements.forEach((element, index) => {
      if (index === this.selectedItem) {
        element.slot.clear();
        element.slot.fillStyle(0x555555, 1);
        element.slot.fillRoundedRect(-16, -16, 32, 32, 4);
        element.slot.lineStyle(2, 0xffff00); // Yellow highlight for selected
        element.slot.strokeRoundedRect(-16, -16, 32, 32, 4);
      } else {
        element.slot.clear();
        element.slot.fillStyle(0x444444, 1);
        element.slot.fillRoundedRect(-16, -16, 32, 32, 4);
        element.slot.lineStyle(1, 0x666666);
        element.slot.strokeRoundedRect(-16, -16, 32, 32, 4);
      }
    });

    // Auto-scroll to keep selected item visible
    const itemsPerRow = 6;
    const selectedRow = Math.floor(this.selectedItem / itemsPerRow);
    const targetScrollY = selectedRow * 40;

    if (targetScrollY < this.scrollY) {
      this.scrollY = targetScrollY;
    } else if (targetScrollY > this.scrollY + 60) {
      this.scrollY = Math.min(this.maxScroll, targetScrollY - 60);
    }

    this.updateScroll();
  }

  updateScroll() {
    this.scrollContainer.setY(-this.scrollY);
  }

  update() {
    if (this.gameState.inventory.length === 0) {
      this.closeBackpack();
      return;
    }

    // Handle navigation
    const itemsPerRow = 6;

    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.selectedItem = Math.max(0, this.selectedItem - 1);
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.selectedItem = Math.min(
        this.gameState.inventory.length - 1,
        this.selectedItem + 1
      );
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.selectedItem = Math.max(0, this.selectedItem - itemsPerRow);
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.selectedItem = Math.min(
        this.gameState.inventory.length - 1,
        this.selectedItem + itemsPerRow
      );
      this.updateSelection();
    }

    // Handle item usage
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      if (this.selectedItem < this.gameState.inventory.length) {
        const selectedItemData = this.gameState.inventory[this.selectedItem];

        // Use the item
        const success = this.gameState.useItem(selectedItemData.id);

        if (success) {
          console.log("Used item:", selectedItemData.name);

          // Refresh the backpack display
          this.refreshBackpack();

          // Show feedback
          this.showItemUsedFeedback(selectedItemData);
        }
      }
    }

    // Handle closing backpack
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.closeBackpack();
    }
  }

  showItemUsedFeedback(item: GameItem) {
    const feedbackText = this.add.text(176, 50, `Used ${item.name}!`, {
      fontSize: "12px",
      color: "#4caf50",
      fontFamily: "Arial",
      fontStyle: "bold",
    });
    feedbackText.setOrigin(0.5);

    // Fade out the feedback text
    this.tweens.add({
      targets: feedbackText,
      alpha: 0,
      y: 30,
      duration: 1500,
      onComplete: () => {
        feedbackText.destroy();
      },
    });
  }

  refreshBackpack() {
    // Clear existing items
    this.scrollContainer.removeAll(true);
    this.itemElements = [];

    // Recreate item slots
    this.createItemSlots();

    // Adjust selected item if necessary
    if (this.selectedItem >= this.gameState.inventory.length) {
      this.selectedItem = Math.max(0, this.gameState.inventory.length - 1);
    }

    // Recalculate max scroll
    const itemsPerRow = 6;
    const rows = Math.ceil(this.gameState.inventory.length / itemsPerRow);
    this.maxScroll = Math.max(0, rows * 40 - 100);

    // Update selection
    this.updateSelection();
  }

  closeBackpack() {
    this.scene.stop();
    this.scene.resume(this.previousScene);
  }
}
