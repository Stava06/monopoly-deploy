// src/socket.js
import { io } from "socket.io-client";

// Create a single socket instance to be shared across the app
const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false, // Optional: manually connect when needed
});

export default socket;

// Optional helpers
export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
