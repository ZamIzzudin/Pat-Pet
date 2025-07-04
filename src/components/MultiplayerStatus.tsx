/** @format */
"use client";

import React, { useState, useEffect } from "react";
import { getSocketIOClient } from "../lib/ws";

export default function MultiplayerStatus() {
  const [isConnected, setIsConnected] = useState(false);
  const [playerCount, setPlayerCount] = useState(0);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);

  useEffect(() => {
    const socketClient = getSocketIOClient();

    const handleConnected = () => {
      setIsConnected(true);
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setPlayerCount(0);
      setCurrentRoom(null);
    };

    const handleReconnected = () => {
      setIsConnected(true);
      // Re-join room if we were in one before disconnect
      const room = socketClient.getCurrentRoom();
      if (room) {
        setCurrentRoom(room);
      }
    };

    const handleRoomState = (players: any[]) => {
      setPlayerCount(players.length);
    };

    const handlePlayerJoined = () => {
      setPlayerCount((prev) => prev + 1);
    };

    const handlePlayerLeft = () => {
      setPlayerCount((prev) => Math.max(0, prev - 1));
    };

    const handleError = (error: any) => {
      console.error("Socket.IO connection error:", error);
      setIsConnected(false);
    };

    const handleMaxReconnectAttempts = () => {
      console.error("Max reconnection attempts reached");
      setIsConnected(false);
      setPlayerCount(0);
      setCurrentRoom(null);
    };

    // Set up event listeners
    socketClient.on("connected", handleConnected);
    socketClient.on("disconnected", handleDisconnected);
    socketClient.on("reconnected", handleReconnected);
    socketClient.on("room_state", handleRoomState);
    socketClient.on("player_joined", handlePlayerJoined);
    socketClient.on("player_left", handlePlayerLeft);
    socketClient.on("error", handleError);
    socketClient.on(
      "max_reconnect_attempts_reached",
      handleMaxReconnectAttempts
    );

    // Check initial connection state
    setIsConnected(socketClient.isConnected());
    setCurrentRoom(socketClient.getCurrentRoom());

    return () => {
      // Clean up event listeners
      socketClient.off("connected", handleConnected);
      socketClient.off("disconnected", handleDisconnected);
      socketClient.off("reconnected", handleReconnected);
      socketClient.off("room_state", handleRoomState);
      socketClient.off("player_joined", handlePlayerJoined);
      socketClient.off("player_left", handlePlayerLeft);
      socketClient.off("error", handleError);
      socketClient.off(
        "max_reconnect_attempts_reached",
        handleMaxReconnectAttempts
      );
    };
  }, []);

  return (
    <div className="fixed top-20 left-0 bg-opacity-80 text-white p-3 rounded-lg text-sm z-50">
      <div className="flex items-center gap-2 mb-2">
        <div
          className={`w-3 h-3 rounded-full ${
            isConnected ? "bg-green-500" : "bg-red-500"
          }`}
        />
        <span className="font-semibold">
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {isConnected && (
        <>
          <div className="text-xs text-gray-300">
            Players in room: {playerCount}
          </div>
          {currentRoom && (
            <div className="text-xs text-gray-300">
              Room: {currentRoom.replace("_Screen", "")}
            </div>
          )}
        </>
      )}
    </div>
  );
}
