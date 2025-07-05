import { Link, Routes, Route } from 'react-router-dom'
import Cashier from './Pages/Cashier.jsx'
import Player from './Pages/Player.jsx'
import './index.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={
        <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-0">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 lg:p-10 px-4 flex flex-col items-center w-full max-w-screen-2xl mx-0">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl xl:text-6xl font-extrabold text-gray-800 mb-6 sm:mb-8 lg:mb-12 text-center drop-shadow">
              Welcome to Monopoly Bank <span role='img' aria-label='money'>💰</span>
            </h1>
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 lg:gap-8 w-full justify-center">
              <Link to="/cashier" className="w-full sm:w-auto">
                <button className="w-full sm:w-48 lg:w-64 bg-blue-600 hover:bg-blue-700 text-black font-bold py-3 sm:py-4 lg:py-6 px-6 lg:px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-base sm:text-lg lg:text-xl">
                  Cashier
                </button>
              </Link>
              <Link to="/player" className="w-full sm:w-auto">
                <button className="w-full sm:w-48 lg:w-64 bg-green-600 hover:bg-green-700 text-black font-bold py-3 sm:py-4 lg:py-6 px-6 lg:px-8 rounded-lg shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 text-base sm:text-lg lg:text-xl">
                  Player
                </button>
              </Link>
            </div>
          </div>
        </div>
      } />
      <Route path="/cashier" element={<Cashier />} />
      <Route path="/player" element={<Player />} />
    </Routes>
  )
}

export default App
