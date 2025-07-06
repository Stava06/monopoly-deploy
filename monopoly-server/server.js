const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const fs = require('fs');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ['https://monopoly-bank-p2x6.onrender.com', 'http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST']
  }
});

// Use absolute path for saved data
const DATA_FILE = path.resolve('savedData.json');

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

// ✅ Serve frontend if built (regardless of NODE_ENV)
const clientPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(clientPath)) {
  app.use(express.static(clientPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
} else {
  console.warn("⚠️ client/dist not found. Did you run build?");
}

// 🔌 Socket.IO logic
io.on("connection", (socket) => {
  console.log(`🟢 ${socket.id} connected`);

  socket.on("join", (nickname) => {
    let existing = players.find(p => p.name === nickname);

    if (existing) {
      existing.id = socket.id;
      socket.emit("playerData", existing);
    } else {
      const newPlayer = { id: socket.id, name: nickname, money: 1500 };
      players.push(newPlayer);
      socket.emit("playerData", newPlayer);
    }

    io.emit("players", players);
    savePlayers();
  });

  socket.on("transferMoney", ({ fromId, toId, amount }) => {
    const sender = players.find(p => p.id === fromId);
    const recipient = players.find(p => p.id === toId);

    if (toId === "bank") {
      if (!sender || sender.money < amount || amount <= 0) return;
      sender.money -= amount;
    } else if (fromId === "bank") {
      if (!recipient || amount <= 0) return;
      recipient.money += amount;
    } else {
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
      disconnected.id = null; // ניתוק זמני – לא מוחקים מהמערך
    }

    io.emit("players", players);
    savePlayers();
  });
});

// Start the server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
