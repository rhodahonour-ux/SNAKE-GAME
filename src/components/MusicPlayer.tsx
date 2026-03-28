import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Music } from 'lucide-react';

const TRACKS = [
  { id: 1, title: "Neon Drift", artist: "AI Synthwave", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
  { id: 2, title: "Digital Horizon", artist: "NeuralNet", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
  { id: 3, title: "Quantum Groove", artist: "AutoBeat", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
];

export default function MusicPlayer() {
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(console.error);
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleNext = () => {
    setCurrentTrack((prev) => (prev + 1) % TRACKS.length);
  };

  const handlePrev = () => {
    setCurrentTrack((prev) => (prev - 1 + TRACKS.length) % TRACKS.length);
  };

  const track = TRACKS[currentTrack];

  return (
    <div className="w-full max-w-md bg-gray-900/80 backdrop-blur-md border border-fuchsia-500 rounded-xl p-6 neon-box-pink flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-md bg-fuchsia-900/50 border border-fuchsia-400 flex items-center justify-center neon-box-pink shrink-0">
          <Music className="text-fuchsia-400 w-8 h-8" />
        </div>
        <div className="flex-1 overflow-hidden">
          <h3 className="text-fuchsia-400 font-bold text-lg truncate neon-text-pink">{track.title}</h3>
          <p className="text-fuchsia-300/70 text-sm truncate font-mono">{track.artist}</p>
        </div>
      </div>

      <div className="flex items-center justify-center gap-6 mt-2">
        <button onClick={handlePrev} className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
          <SkipBack className="w-8 h-8" />
        </button>
        <button onClick={togglePlay} className="w-14 h-14 rounded-full bg-fuchsia-500/20 border border-fuchsia-400 flex items-center justify-center text-fuchsia-400 hover:bg-fuchsia-500/40 transition-all neon-box-pink shrink-0">
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-1" />}
        </button>
        <button onClick={handleNext} className="text-fuchsia-400 hover:text-fuchsia-300 transition-colors">
          <SkipForward className="w-8 h-8" />
        </button>
      </div>

      <div className="flex items-center gap-3 mt-2">
        <Volume2 className="w-5 h-5 text-fuchsia-400/70 shrink-0" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-fuchsia-500"
        />
      </div>

      <audio
        ref={audioRef}
        src={track.url}
        onEnded={handleNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
  );
}
