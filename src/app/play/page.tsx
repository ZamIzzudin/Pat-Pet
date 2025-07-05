/** @format */
"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";

import { EventBus, GAME_EVENTS } from "@/lib/eventBus";
import ModalEvent from "@/components/ActionModal";

import Web3Provider from "@/components/Web3Provider";

const GameScreen = dynamic(
  () => import("../../components/game/screen/GameScreen"),
  {
    ssr: false,
  }
);

export default function Play() {
  const [mounted, setMounted] = useState(false);
  const [eventBus] = useState(() => EventBus.getInstance());
  const [isShown, setShown] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    eventBus.on(GAME_EVENTS.MODAL_SHOWN, () => setShown(!isShown));

    return () => {
      eventBus.off(GAME_EVENTS.MODAL_SHOWN, () => setShown(!isShown));
    };
  }, [eventBus]);

  return (
    <Web3Provider>
      <main className="flex min-h-screen flex-col items-center justify-center max-w-[100vw] overflow-hidden">
        <ModalEvent show={isShown} setShow={() => setShown(false)} />
        {mounted && <GameScreen />}
      </main>
    </Web3Provider>
  );
}
