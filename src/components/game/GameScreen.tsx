/** @format */
"use client";

import { useEffect, useRef } from "react";

import * as Phaser from "phaser";

import MainScreen from "./screen/MainScreen";
import HouseScreen from "./screen/HouseScreen";
import BackpackScreen from "./screen/BackpackScreen";
import GoalsScreen from "./screen/GoalsScreen";
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
      scene: [Preloader, MainScreen, HouseScreen, BackpackScreen, GoalsScreen],
    };

    const game = new Phaser.Game(config);

    return () => {
      game.destroy(true);
    };
  }, []);

  return <div className="game-container" ref={gameContainer}></div>;
}
