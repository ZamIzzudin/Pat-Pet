/** @format */
"use client";

import { useEffect, useRef } from "react";

import * as Phaser from "phaser";

import MainScreen from "./MainScreen";
import HouseScreen from "./HouseScreen";
import BackpackScreen from "./BackpackScreen";
import GoalsScreen from "./GoalsScreen";
import Preloader from "./Preloader";

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