/** @format */
"use client";

import { useEffect, useRef } from "react";

import * as Phaser from "phaser";

import MainScreen from "./MainScreen";
import HouseScreen from "./HouseScreen";
import PetSelectionScreen from "./PetSelectionScreen";
import GoalsScreen from "./GoalsScreen";
import PetScreen from "./PetScreen";
import Preloader from "./Preloader";
import MapSelectionScreen from "./MapSelectionScreen";

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
        MapSelectionScreen,
        MainScreen,
        HouseScreen,
        PetScreen,
        PetSelectionScreen,
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