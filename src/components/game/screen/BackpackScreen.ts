/** @format */
// @ts-nocheck: Object is possibly 'null'.

import Phaser from "phaser";

export default class BackpackScreen extends Phaser.Scene {
  previousScene: string;
  items: Array<{ id: number; name: string; icon: string }>;
  selectedItem: number;
  itemSprites: Phaser.GameObjects.Sprite[];
  titleText: Phaser.GameObjects.Text;
  instructionText: Phaser.GameObjects.Text;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  enterKey: Phaser.Input.Keyboard.Key;
  escapeKey: Phaser.Input.Keyboard.Key;

  constructor() {
    super("Backpack_Screen");
  }

  init(data: { previousScene: string }) {
    this.previousScene = data.previousScene || "Main_Screen";
  }

  create() {
    // Create dark background
    this.add.rectangle(176, 96, 352, 192, 0x000000, 0.8);
    
    // Create backpack UI background
    const bg = this.add.rectangle(176, 96, 280, 150, 0x2a2a2a);
    bg.setStrokeStyle(2, 0xffffff);

    // Title
    this.titleText = this.add.text(176, 40, "BACKPACK", {
      fontSize: "16px",
      color: "#ffffff",
      fontFamily: "Arial"
    });
    this.titleText.setOrigin(0.5);

    // Sample items (you can expand this)
    this.items = [
      { id: 1, name: "Health Potion", icon: "🧪" },
      { id: 2, name: "Magic Scroll", icon: "📜" },
      { id: 3, name: "Iron Sword", icon: "⚔️" },
      { id: 4, name: "Shield", icon: "🛡️" },
      { id: 5, name: "Key", icon: "🗝️" }
    ];

    this.selectedItem = 0;
    this.itemSprites = [];

    // Create item slots
    this.createItemSlots();

    // Instructions
    this.instructionText = this.add.text(176, 160, "Arrow Keys: Navigate | Enter: Select | ESC: Close", {
      fontSize: "10px",
      color: "#cccccc",
      fontFamily: "Arial"
    });
    this.instructionText.setOrigin(0.5);

    // Input setup
    this.cursors = this.input.keyboard.createCursorKeys();
    this.enterKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER);
    this.escapeKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);

    // Update selection visual
    this.updateSelection();
  }

  createItemSlots() {
    const startX = 80;
    const startY = 80;
    const slotSize = 32;
    const spacing = 40;
    const itemsPerRow = 5;

    for (let i = 0; i < this.items.length; i++) {
      const row = Math.floor(i / itemsPerRow);
      const col = i % itemsPerRow;
      const x = startX + (col * spacing);
      const y = startY + (row * spacing);

      // Create slot background
      const slot = this.add.rectangle(x, y, slotSize, slotSize, 0x444444);
      slot.setStrokeStyle(1, 0x666666);

      // Create item icon (using text as placeholder)
      const itemIcon = this.add.text(x, y, this.items[i].icon, {
        fontSize: "20px"
      });
      itemIcon.setOrigin(0.5);

      // Store reference for selection highlighting
      this.itemSprites.push(slot);
    }
  }

  updateSelection() {
    // Reset all slots
    this.itemSprites.forEach((slot, index) => {
      if (index === this.selectedItem) {
        slot.setStrokeStyle(2, 0xffff00); // Yellow highlight for selected
        slot.setFillStyle(0x555555);
      } else {
        slot.setStrokeStyle(1, 0x666666);
        slot.setFillStyle(0x444444);
      }
    });
  }

  update() {
    // Handle navigation
    if (Phaser.Input.Keyboard.JustDown(this.cursors.left)) {
      this.selectedItem = Math.max(0, this.selectedItem - 1);
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.right)) {
      this.selectedItem = Math.min(this.items.length - 1, this.selectedItem + 1);
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.up)) {
      this.selectedItem = Math.max(0, this.selectedItem - 5);
      this.updateSelection();
    } else if (Phaser.Input.Keyboard.JustDown(this.cursors.down)) {
      this.selectedItem = Math.min(this.items.length - 1, this.selectedItem + 5);
      this.updateSelection();
    }

    // Handle item selection
    if (Phaser.Input.Keyboard.JustDown(this.enterKey)) {
      const selectedItemData = this.items[this.selectedItem];
      console.log("Selected item:", selectedItemData.name);
      // Here you can add logic to use the item
      this.closeBackpack();
    }

    // Handle closing backpack
    if (Phaser.Input.Keyboard.JustDown(this.escapeKey)) {
      this.closeBackpack();
    }
  }

  closeBackpack() {
    this.scene.stop();
    this.scene.resume(this.previousScene);
  }
}