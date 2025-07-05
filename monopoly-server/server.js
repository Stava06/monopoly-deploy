const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

let players = []; // Each player: { id, name, money }

io.on("connection", (socket) => {
  console.log(`🟢 ${socket.id} connected`);

  // Player joining the game
  socket.on("join", (nickname) => {
    // Find player by name
    const existing = players.find(p => p.name === nickname);

    if (existing) {
      // Check if the player is already connected
      const isConnected = io.sockets.sockets.has(existing.id);
      if (isConnected) {
        socket.emit("joinError", "Name already taken and online!");
        return;
      } else {
        // Reclaim the player slot: update id to new socket id
        existing.id = socket.id;
        socket.emit("playerData", existing);
        io.emit("players", players);
        return;
      }
    }

    // If not found, create new player
    const player = {
      id: socket.id,
      name: nickname,
      money: 1500
    };
    players.push(player);
    socket.emit("playerData", player);
    io.emit("players", players);
  });

  // Handle player disconnect (but keep their data)
  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} disconnected`);
    // Do NOT remove player; they may reconnect with same name
    // Just keep their data as-is
    players = players.filter(p => p.id !== socket.id);
    io.emit("players", players);
  });

  // Handle money transfers
  socket.on("transferMoney", ({ fromId, toId, amount }) => {
    const sender = players.find(p => p.id === fromId);

    // Player pays bank
    if (toId === "bank") {
      if (!sender || sender.money < amount || amount <= 0) return;
      sender.money -= amount;
      io.emit("players", players);
      io.emit("transferMessage", {
        from: sender.name,
        to: "Bank",
        amount
      });
      return;
    }

    const recipient = players.find(p => p.id === toId);
    if (!recipient || amount <= 0) return;

    // Bank gives money
    if (fromId === "bank") {
      recipient.money += amount;
      io.emit("players", players);
      return;
    }

    // Player-to-player
    if (!sender || sender.money < amount) return;

    sender.money -= amount;
    recipient.money += amount;

    io.emit("players", players);
    io.emit("transferMessage", {
      from: sender.name,
      to: recipient.name,
      amount
    });
  });
});

server.listen(3001, () => {
  console.log('🚀 Server running on http://localhost:3001');
});
