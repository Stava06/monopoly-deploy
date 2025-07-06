import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useSound from "use-sound";
import CashSound from "../assets/sounds/cash.mp3";

// Connect to the backend server
const socket = io(import.meta.env.VITE_SOCKET_URL);

const Cashier = () => {
  const [players, setPlayers] = useState([]);
  const [transferMsg, setTransferMsg] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [cashierAmount, setCashierAmount] = useState("");
  const [cashierMsg, setCashierMsg] = useState("");

  const [playCashSound] = useSound(CashSound, { interrupt: true });

  useEffect(() => {
    socket.on("players", setPlayers);

    socket.on("transferMessage", (msg) => {
      setTransferMsg(msg);
      playCashSound(); // Play sound on every transfer
    });

    return () => {
      socket.off("players");
      socket.off("transferMessage");
    };
  }, [playCashSound]);

  useEffect(() => {
    if (cashierMsg) {
      playCashSound();
    }
  }, [cashierMsg, playCashSound]);

  const handleTransfer = () => {
    const recipient = players.find(p => p.id === selectedPlayerId);
    if (!recipient) return;

    socket.emit("transferMoney", {
      fromId: "bank",
      toId: recipient.id,
      amount: Number(cashierAmount)
    });

    setCashierMsg(`${recipient.name} gets ₪${cashierAmount}`);
    setTimeout(() => setCashierMsg(""), 3000);
    setCashierAmount("");
    setSelectedPlayerId("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center py-8 px-2 sm:px-4 md:px-8">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-6 sm:p-10 md:p-14 border border-blue-100">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-blue-700 mb-8 text-center drop-shadow-lg tracking-tight">Cashier Panel</h1>
          <div className="mb-10 p-6 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl shadow flex flex-col gap-6 sm:flex-row sm:items-end sm:gap-6 border border-blue-100">
            <div className="flex-1 w-full">
              <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="player-select">Select Player</label>
              <select
                id="player-select"
                className="border-2 border-blue-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white text-gray-800"
                value={selectedPlayerId}
                onChange={e => setSelectedPlayerId(e.target.value)}
              >
                <option value="">Select player</option>
                {players.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1 w-full">
              <label className="block text-lg font-semibold text-gray-700 mb-2" htmlFor="amount-input">Amount</label>
              <input
                id="amount-input"
                type="number"
                className="border-2 border-blue-200 rounded-lg p-3 w-full focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white text-gray-800"
                placeholder="Amount"
                value={cashierAmount}
                min={1}
                onChange={e => setCashierAmount(e.target.value)}
              />
            </div>
            <button
              className="w-full sm:w-auto bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-lg mt-4 sm:mt-0"
              disabled={!selectedPlayerId || !cashierAmount || Number(cashierAmount) <= 0}
              onClick={handleTransfer}
            >
              💸 Send Money
            </button>
          </div>

          {cashierMsg && (
            <div className="mb-4 p-3 bg-green-100 text-green-800 rounded-xl text-center font-bold text-lg shadow border border-green-200 animate-pulse">
              {cashierMsg}
            </div>
          )}

          {transferMsg && (
            <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded-xl shadow text-center font-bold text-lg border border-blue-200">
              {transferMsg.from} paid ₪{transferMsg.amount} to {transferMsg.to}
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-8 mt-10 text-center">{players.length} Connected Player{players.length !== 1 && "s"}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
            {players.map((player, idx) => (
              <div
                key={player.id || `${player.name}-${idx}`}
                className="bg-gradient-to-br from-green-100 via-blue-50 to-pink-100 rounded-2xl shadow-lg p-6 flex flex-col items-center min-w-0 border border-blue-100 hover:shadow-2xl transition-shadow duration-200"
              >
                <span className="text-2xl font-bold text-gray-800 mb-2 truncate w-full text-center drop-shadow">
                  {player.name || "Unnamed"}
                </span>
                <span className="text-lg font-semibold text-green-700 bg-white/70 px-4 py-2 rounded-xl shadow-inner">
                  ₪{player.money ?? 0}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cashier;
