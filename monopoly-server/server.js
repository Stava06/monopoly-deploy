const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const DATA_FILE = path.join(__dirname, 'savedData.json');

// Load saved players
let players = [];
try {
  if (fs.existsSync(DATA_FILE)) {
    players = JSON.parse(fs.readFileSync(DATA_FILE));
    console.log("📁 Loaded saved players:", players.length);
  }
} catch (err) {
  console.error("❌ Failed to load savedData.json:", err.message);
}

// Save function
function savePlayers() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
}

// Serve frontend if built
app.use(express.static(path.join(__dirname, '../client/dist')));

io.on("connection", (socket) => {
  console.log(`🟢 ${socket.id} connected`);

  socket.on("join", (nickname) => {
    const existing = players.find(p => p.name === nickname);

    if (existing) {
      existing.id = socket.id; // Reconnect with updated socket ID
      socket.emit("playerData", existing);
    } else {
      const newPlayer = { id: socket.id, name: nickname, money: 1500 };
      players.push(newPlayer);
      socket.emit("playerData", newPlayer);
    }

    io.emit("players", players);
    savePlayers();
  });
  app.get(/^\/(?!api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
  socket.on("transferMoney", ({ fromId, toId, amount }) => {
    const sender = players.find(p => p.id === fromId);
    const recipient = players.find(p => p.id === toId);

    // Pay to bank
    if (toId === "bank") {
      if (!sender || sender.money < amount || amount <= 0) return;
      sender.money -= amount;
    }

    // Receive from bank
    else if (fromId === "bank") {
      if (!recipient || amount <= 0) return;
      recipient.money += amount;
    }

    // Player to player
    else {
      if (!sender || !recipient || sender.money < amount || amount <= 0) return;
      sender.money -= amount;
      recipient.money += amount;
    }

    io.emit("players", players);
    io.emit("transferMessage", {
      from: fromId === "bank" ? "Bank" : sender?.name,
      to: toId === "bank" ? "Bank" : recipient?.name,
      amount
    });

    savePlayers();
  });

  socket.on("disconnect", () => {
    console.log(`🔴 ${socket.id} disconnected`);

    const disconnected = players.find(p => p.id === socket.id);
    if (disconnected) {
      disconnected.id = null; // Keep in list but mark as offline
    }

    io.emit("players", players);
    savePlayers();
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
