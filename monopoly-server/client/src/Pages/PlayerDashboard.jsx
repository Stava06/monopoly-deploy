import React from "react";

const PlayerDashboard = ({
  player,
  players,
  toId,
  setToId,
  amount,
  setAmount,
  transferMsg,
  handleTransfer,
  payBankAmount,
  setPayBankAmount,
  handlePayBank,
  errorMsg,
  handleDisconnect
}) => {
  return (
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

      {errorMsg && (
        <div className="mb-2 p-2 bg-red-100 text-red-700 rounded">
          {errorMsg}
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
          onChange={(e) => setPayBankAmount(e.target.value)}
          className="w-full border rounded p-2 mb-2"
        />
        <button
          onClick={handlePayBank}
          disabled={
            !payBankAmount ||
            Number(payBankAmount) <= 0 ||
            Number(payBankAmount) > player.money
          }
          className="w-full bg-red-600 hover:bg-red-700 text-black font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Pay
        </button>
      </div>

      <button
        onClick={handleDisconnect}
        className="mt-2 w-full bg-gray-300 hover:bg-gray-400 text-black font-bold py-2 px-4 rounded transition-all"
      >
        Disconnect
      </button>
    </>
  );
};

export default PlayerDashboard;
