import { useEffect, useState } from "react";
import socket, { connectSocket } from "../socket";

const Player = () => {
  const [nickname, setNickname] = useState("");
  const [hasJoined, setHasJoined] = useState(false);
  const [player, setPlayer] = useState(null);
  const [players, setPlayers] = useState([]);
  const [toId, setToId] = useState("");
  const [amount, setAmount] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [transferMsg, setTransferMsg] = useState("");
  const [payBankAmount, setPayBankAmount] = useState("");

  useEffect(() => {
    connectSocket();

    socket.on("playerData", (data) => {
      setPlayer(data);
      setHasJoined(true);
    });

    socket.on("players", (updatedPlayers) => {
      setPlayers(updatedPlayers);
      if (player) {
        const updated = updatedPlayers.find(p => p.name === player.name);
        if (updated) setPlayer(updated);
      }
    });

    socket.on("transferMessage", (msg) => {
      setTransferMsg(msg);
    });

    socket.on("joinError", (msg) => {
      alert(msg);
    });

    return () => {
      socket.off("playerData");
      socket.off("players");
      socket.off("transferMessage");
      socket.off("joinError");
    };
  }, [player]);

  const handleJoin = () => {
    if (nickname.trim()) {
      socket.emit("join", nickname.trim());
    }
  };

  const handleTransfer = () => {
    if (!toId || !amount || Number(amount) <= 0) return;
    if (Number(amount) > player.money) {
      setErrorMsg("You don't have enough money to transfer that amount!");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    socket.emit("transferMoney", {
      fromId: player.id,
      toId,
      amount: Number(amount),
    });
    setToId("");
    setAmount("");
  };

  const handlePayBank = () => {
    if (!payBankAmount || Number(payBankAmount) <= 0) return;
    if (Number(payBankAmount) > player.money) {
      setErrorMsg("You don't have enough money to pay that amount!");
      setTimeout(() => setErrorMsg(""), 3000);
      return;
    }
    socket.emit("transferMoney", {
      fromId: player.id,
      toId: "bank",
      amount: Number(payBankAmount),
    });
    setPayBankAmount("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 max-w-md w-full text-center">
        {errorMsg && (
          <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">
            {errorMsg}
          </div>
        )}
        {!hasJoined ? (
          <>
            <h2 className="text-2xl font-bold mb-4">Join the Game</h2>
            <input
              type="text"
              placeholder="Enter your nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="w-full border border-gray-300 rounded p-3 mb-4"
            />
            <button
              onClick={handleJoin}
              className="bg-green-600 text-black font-bold py-3 px-6 rounded-lg shadow hover:bg-green-700 w-full transition-all"
            >
              Join Game
            </button>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Hello, {player.name}
            </h2>
            <p className="text-lg text-green-700 mb-6">
              Your Balance: ₪{player.money}
            </p>

            {transferMsg && (
              <div className="mb-4 p-2 bg-green-100 text-green-800 rounded">
                {transferMsg.from} paid ₪{transferMsg.amount} to {transferMsg.to}
              </div>
            )}

            <div className="p-4 bg-gray-100 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Transfer Money</h3>
              <select
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              >
                <option value="">Select player</option>
                {players
                  .filter((p) => p.id !== player.id)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
              <button
                onClick={handleTransfer}
                disabled={
                  !toId || !amount || Number(amount) <= 0 || Number(amount) > player.money
                }
                className="w-full bg-blue-600 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Send Money
              </button>
            </div>

            <div className="p-4 bg-gray-100 rounded-lg mb-4">
              <h3 className="font-semibold mb-2">Pay to Bank</h3>
              <input
                type="number"
                placeholder="Amount"
                value={payBankAmount}
                min={1}
                max={player.money}
                onChange={e => setPayBankAmount(e.target.value)}
                className="w-full border rounded p-2 mb-2"
              />
              <button
                onClick={handlePayBank}
                disabled={
                  !payBankAmount || Number(payBankAmount) <= 0 || Number(payBankAmount) > player.money
                }
                className="w-full bg-red-600 hover:bg-red-700 text-black font-bold py-2 px-4 rounded disabled:opacity-50"
              >
                Pay
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Player;
