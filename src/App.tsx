import React from 'react';
import SnakeGame from './components/SnakeGame';
import MusicPlayer from './components/MusicPlayer';

export default function App() {
  return (
    <div className="min-h-screen w-full bg-gray-950 flex flex-col items-center py-8 px-4 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-fuchsia-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <header className="mb-8 flex flex-col items-center z-10 mt-8">
        <div className="relative w-[320px] h-12 bg-gradient-to-r from-cyan-400 to-fuchsia-500 flex items-center justify-end pr-2">
          <h1 className="text-6xl md:text-7xl font-black text-white neon-text-cyan tracking-tighter leading-none translate-y-1">
            SNAKE
          </h1>
        </div>
        <p className="text-cyan-600 font-mono mt-6 tracking-widest uppercase text-sm">
          BEATS & BYTES EDITION
        </p>
      </header>

      <main className="flex flex-col xl:flex-row items-center justify-center gap-12 w-full max-w-6xl z-10">
        <div className="flex-1 flex justify-center w-full">
          <SnakeGame />
        </div>
        
        <div className="w-full xl:w-96 flex flex-col gap-6">
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-fuchsia-500 animate-pulse shadow-[0_0_5px_#d946ef]" />
              NOW PLAYING
            </h2>
            <MusicPlayer />
          </div>
          
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 backdrop-blur-sm hidden xl:block">
            <h3 className="text-lg font-bold text-cyan-400 mb-2">SYSTEM STATUS</h3>
            <ul className="font-mono text-sm text-gray-400 space-y-2">
              <li className="flex justify-between"><span>CPU:</span> <span className="text-green-400">OPTIMAL</span></li>
              <li className="flex justify-between"><span>AUDIO:</span> <span className="text-fuchsia-400">ONLINE</span></li>
              <li className="flex justify-between"><span>GRID:</span> <span className="text-cyan-400">STABLE</span></li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
