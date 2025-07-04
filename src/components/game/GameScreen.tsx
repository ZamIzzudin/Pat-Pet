/** @format */
"use client";

import { useEffect, useRef } from "react";

import * as Phaser from "phaser";

import MainScreen from "./screen/MainScreen";
import HouseScreen from "./screen/HouseScreen";
import BackpackScreen from "./screen/BackpackScreen.ts";
import GoalsScreen from "./screen/GoalsScreen";
import PetScreen from "./screen/PetScreen";
import Preloader from "./screen/Preloader";

export default function GameScreen() {
  const gameContainer = useRef(null);

  useEffect((): any => {
    const config = {
      type: Phaser.AUTO,
      parent: gameContainer.current,
      pixelArt: true,
      width: 352,
      height: 192,
      disableContextMenu: true,
      roundPixels: true,
      resolution: window.devicePixelRatio,
      antialias: false,
      powerPreference: "high-performance",
      render: {
        antialias: false,
        pixelArt: true,
        roundPixels: true,
        transparent: false,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        failIfMajorPerformanceCaveat: false,
        powerPreference: "high-performance",
      },
      scale: {
        mode: Phaser.Scale.NONE,
      },
      scene: [
        Preloader,
        MainScreen,
        HouseScreen,
        PetScreen,
        BackpackScreen,
        GoalsScreen,
      ],
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div className="game-container" ref={gameContainer}></div>;
}