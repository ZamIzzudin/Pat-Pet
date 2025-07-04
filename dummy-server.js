/** @format */

const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { v4: uuidv4 } = require("uuid");

// Nodemon configuration for hot reload
if (process.env.NODE_ENV !== "production") {
  console.log("🔥 Development mode - Hot reload enabled");
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static("public")); // Serve static files if needed

// Store connected clients and their data
const clients = new Map();
const rooms = new Map();

// Initialize rooms
const ROOMS = ["Main_Screen", "House_Screen"];
ROOMS.forEach((roomId) => {
  rooms.set(roomId, new Map());
});

// Create HTTP server
const server = createServer(app);

// Create Socket.IO server
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  transports: ["websocket", "polling"],
});

console.log(`Express server with Socket.IO running on port ${PORT}`);

// Basic Express routes
app.get("/", (req, res) => {
  res.json({
    message: "Multiplayer Socket.IO Server",
    port: PORT,
    status: "running",
    transport: "Socket.IO",
  });
});

app.get("/api/status", (req, res) => {
  res.json({
    connectedClients: clients.size,
    rooms: Array.from(rooms.entries()).map(([roomId, room]) => ({
      roomId,
      playerCount: room.size,
      players: Array.from(room.values()),
    })),
  });
});

app.get("/api/rooms", (req, res) => {
  const roomsData = Array.from(rooms.entries()).map(([roomId, room]) => ({
    roomId,
    playerCount: room.size,
    players: Array.from(room.values()),
  }));
  res.json(roomsData);
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  const clientId = uuidv4();
  console.log(
    `Client connected: Player_${clientId.substring(0, 8)} (Socket ID: ${
      socket.id
    })`
  );

  // Initialize client data
  clients.set(clientId, {
    socket,
    id: clientId,
    socketId: socket.id,
    currentRoom: null,
    position: { x: 0, y: 0 },
    frame: 0,
    username: `Player_${clientId.substring(0, 8)}`,
  });

  // Send welcome message with client ID
  socket.emit("connected", {
    clientId,
    message: "Connected to multiplayer server",
  });

  // Handle join room
  socket.on("join_room", (data) => {
    handleJoinRoom(clientId, data.roomId, data.position);
  });

  // Handle leave room
  socket.on("leave_room", () => {
    handleLeaveRoom(clientId);
  });

  // Handle player movement
  socket.on("player_move", (data) => {
    handlePlayerMove(clientId, data.position, data.frame);
  });

  // Handle player animation
  socket.on("player_animation", (data) => {
    handlePlayerAnimation(clientId, data.animation, data.frame);
  });

  // Handle disconnect
  socket.on("disconnect", (reason) => {
    console.log(`Client disconnected: ${clientId} (${reason})`);
    handleDisconnect(clientId);
  });

  // Handle connection error
  socket.on("connect_error", (error) => {
    console.error(`Socket.IO error for client ${clientId}:`, error);
  });
});

function handleJoinRoom(clientId, roomId, position) {
  const client = clients.get(clientId);
  if (!client) return;

  // Leave current room if in one
  if (client.currentRoom) {
    handleLeaveRoom(clientId);
  }

  // Join new room
  client.currentRoom = roomId;
  client.position = position || { x: 192, y: 160 };

  // Join Socket.IO room
  client.socket.join(roomId);

  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Map());
  }

  const room = rooms.get(roomId);
  room.set(clientId, {
    id: clientId,
    socketId: client.socketId,
    username: client.username,
    position: client.position,
    frame: client.frame,
  });

  console.log(`Client ${clientId} joined room ${roomId}`);

  // Send current room state to joining client
  const roomPlayers = Array.from(room.values());
  client.socket.emit("room_state", {
    roomId,
    players: roomPlayers,
  });

  // Notify other players in room about new player
  client.socket.to(roomId).emit("player_joined", {
    player: {
      id: clientId,
      socketId: client.socketId,
      username: client.username,
      position: client.position,
      frame: client.frame,
    },
  });
}

function handleLeaveRoom(clientId) {
  const client = clients.get(clientId);
  if (!client || !client.currentRoom) return;

  const roomId = client.currentRoom;
  const room = rooms.get(roomId);

  if (room) {
    room.delete(clientId);

    // Leave Socket.IO room
    client.socket.leave(roomId);

    // Notify other players about player leaving
    client.socket.to(roomId).emit("player_left", {
      playerId: clientId,
    });
  }

  console.log(`Client ${clientId} left room ${roomId}`);
  client.currentRoom = null;
}

function handlePlayerMove(clientId, position, frame) {
  const client = clients.get(clientId);
  if (!client || !client.currentRoom) return;

  // Update client position
  client.position = position;
  client.frame = frame;

  // Update room data
  const room = rooms.get(client.currentRoom);
  if (room && room.has(clientId)) {
    const playerData = room.get(clientId);
    playerData.position = position;
    playerData.frame = frame;

    console.log(`${clientId} Move`);

    // Broadcast movement to other players in room
    client.socket.to(client.currentRoom).emit("player_moved", {
      playerId: clientId,
      position,
      frame,
    });
  }
}

function handlePlayerAnimation(clientId, animation, frame) {
  const client = clients.get(clientId);
  if (!client || !client.currentRoom) return;

  // Broadcast animation to other players in room
  client.socket.to(client.currentRoom).emit("player_animation", {
    playerId: clientId,
    animation,
    frame,
  });
}

function handleDisconnect(clientId) {
  const client = clients.get(clientId);
  if (client) {
    // Leave current room
    if (client.currentRoom) {
      handleLeaveRoom(clientId);
    }

    // Remove client
    clients.delete(clientId);
  }
}

// Additional Socket.IO specific routes
app.get("/api/sockets", (req, res) => {
  const socketsInfo = Array.from(clients.values()).map((client) => ({
    clientId: client.id,
    socketId: client.socketId,
    username: client.username,
    currentRoom: client.currentRoom,
    position: client.position,
    connected: client.socket.connected,
  }));

  res.json({
    totalSockets: socketsInfo.length,
    sockets: socketsInfo,
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Express server with Socket.IO listening on port ${PORT}`);
  console.log(`📡 Socket.IO endpoint: http://localhost:${PORT}`);
});

// Cleanup function for graceful shutdown
process.on("SIGINT", () => {
  console.log("Shutting down server...");
  io.close(() => {
    console.log("Socket.IO server closed");
    server.close(() => {
      console.log("Express server closed");
      process.exit(0);
    });
  });
});
