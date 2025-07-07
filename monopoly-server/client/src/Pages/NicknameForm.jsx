import React from "react";

const NicknameForm = ({ nickname, setNickname, handleJoin }) => {
  return (
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
  );
};

export default NicknameForm;
