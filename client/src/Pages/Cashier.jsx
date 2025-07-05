import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useSound from "use-sound";
import CashSound from "../assets/sounds/cash.mp3";

// Connect to the backend server
const socket = io();


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
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-2 sm:p-4 md:p-8 flex items-center justify-center">
      <div className="w-full max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-8 md:p-12">
          <div className="mb-8 p-4 bg-blue-50 rounded shadow flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-4">
            <div className="flex-1 w-full">
              <select
                className="border rounded p-2 w-full"
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
              <input
                type="number"
                className="border rounded p-2 w-full"
                placeholder="Amount"
                value={cashierAmount}
                min={1}
                onChange={e => setCashierAmount(e.target.value)}
              />
            </div>
            <button
              className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-black font-bold py-2 px-4 rounded shadow disabled:opacity-50"
              disabled={!selectedPlayerId || !cashierAmount || Number(cashierAmount) <= 0}
              onClick={handleTransfer}
            >
              Send Money
            </button>
          </div>

          {cashierMsg && (
            <div className="mb-4 p-2 bg-green-100 text-green-800 rounded text-center font-bold text-base sm:text-lg">
              {cashierMsg}
            </div>
          )}

          {transferMsg && (
            <div className="mb-4 p-4 bg-green-100 text-green-800 rounded shadow text-center font-bold text-base sm:text-lg">
              {transferMsg.from} paid ₪{transferMsg.amount} to {transferMsg.to}
            </div>
          )}

          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800 mb-6">
            {players.length} Connected Player{players.length !== 1 && "s"}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {players.map((player, idx) => (
              <div
                key={player.id || `${player.name}-${idx}`}
                className="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl shadow p-4 sm:p-6 flex flex-col items-center min-w-0"
              >
                <span className="text-lg sm:text-2xl font-bold text-gray-800 mb-2 truncate w-full text-center">
                  {player.name || "Unnamed"}
                </span>
                <span className="text-base sm:text-lg font-semibold text-green-700">
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
