import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trophy, Play, RotateCcw } from 'lucide-react';

const GRID_SIZE = 20;
const CANVAS_SIZE = 400;
const CELL_SIZE = CANVAS_SIZE / GRID_SIZE;
const INITIAL_SPEED = 90; // Faster base speed

type Point = { x: number; y: number };
type GameState = 'menu' | 'playing' | 'gameover';

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameState, setGameState] = useState<GameState>('menu');
  
  // Use a ref for game state to avoid React re-renders during the high-frequency game loop
  const game = useRef({
    snake: [{ x: 10, y: 10 }],
    dir: { x: 0, y: -1 },
    nextDir: { x: 0, y: -1 },
    food: { x: 5, y: 5 },
    lastMove: 0,
    speed: INITIAL_SPEED
  });

  const requestRef = useRef<number>();
  const touchStart = useRef<Point | null>(null);

  const generateFood = useCallback((currentSnake: Point[]) => {
    let newFood: Point;
    while (true) {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
      // eslint-disable-next-line no-loop-func
      if (!currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)) {
        break;
      }
    }
    return newFood;
  }, []);

  const startGame = () => {
    game.current = {
      snake: [{ x: 10, y: 10 }],
      dir: { x: 0, y: -1 },
      nextDir: { x: 0, y: -1 },
      food: generateFood([{ x: 10, y: 10 }]),
      lastMove: performance.now(),
      speed: INITIAL_SPEED
    };
    setScore(0);
    setGameState('playing');
  };

  const handleGameOver = useCallback(() => {
    setGameState('gameover');
    setHighScore(prev => Math.max(prev, score));
  }, [score]);

  // Main Game Loop
  const gameLoop = useCallback((time: number) => {
    if (gameState !== 'playing') return;

    const g = game.current;
    
    // Time to move?
    if (time - g.lastMove > g.speed) {
      g.lastMove = time;
      g.dir = g.nextDir;

      const head = g.snake[0];
      const newHead = { x: head.x + g.dir.x, y: head.y + g.dir.y };

      // Wall collision
      if (newHead.x < 0 || newHead.x >= GRID_SIZE || newHead.y < 0 || newHead.y >= GRID_SIZE) {
        handleGameOver();
        return;
      }

      // Self collision
      if (g.snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
        handleGameOver();
        return;
      }

      g.snake.unshift(newHead);

      // Food collision
      if (newHead.x === g.food.x && newHead.y === g.food.y) {
        setScore(s => s + 10);
        g.food = generateFood(g.snake);
        // Slightly increase speed as snake grows
        g.speed = Math.max(50, g.speed - 1); 
      } else {
        g.snake.pop();
      }
    }

    // Drawing
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Clear canvas
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        // Draw Grid Lines
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let i = 0; i <= CANVAS_SIZE; i += CELL_SIZE) {
          ctx.moveTo(i, 0); ctx.lineTo(i, CANVAS_SIZE);
          ctx.moveTo(0, i); ctx.lineTo(CANVAS_SIZE, i);
        }
        ctx.stroke();

        // Draw Food (Green Neon)
        ctx.fillStyle = '#4ade80';
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(
          g.food.x * CELL_SIZE + CELL_SIZE / 2, 
          g.food.y * CELL_SIZE + CELL_SIZE / 2, 
          CELL_SIZE / 2.5, 
          0, Math.PI * 2
        );
        ctx.fill();

        // Draw Snake (Cyan Neon)
        ctx.fillStyle = '#22d3ee';
        ctx.shadowColor = '#22d3ee';
        g.snake.forEach((segment, index) => {
          ctx.shadowBlur = index === 0 ? 15 : 5; // Head glows more
          // Slightly smaller than cell to show grid gaps
          ctx.fillRect(
            segment.x * CELL_SIZE + 1, 
            segment.y * CELL_SIZE + 1, 
            CELL_SIZE - 2, 
            CELL_SIZE - 2
          );
        });
        
        // Reset shadow for next frame
        ctx.shadowBlur = 0;
      }
    }

    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, generateFood, handleGameOver]);

  // Start/Stop Loop
  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop]);

  // Input Handling
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "a", "s", "d"].includes(e.key)) {
        e.preventDefault();
      }
      if (gameState !== 'playing') return;

      const { dir } = game.current;
      switch (e.key.toLowerCase()) {
        case 'arrowup': case 'w':
          if (dir.y === 0) game.current.nextDir = { x: 0, y: -1 };
          break;
        case 'arrowdown': case 's':
          if (dir.y === 0) game.current.nextDir = { x: 0, y: 1 };
          break;
        case 'arrowleft': case 'a':
          if (dir.x === 0) game.current.nextDir = { x: -1, y: 0 };
          break;
        case 'arrowright': case 'd':
          if (dir.x === 0) game.current.nextDir = { x: 1, y: 0 };
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Touch/Swipe Controls for Mobile Responsiveness
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current || gameState !== 'playing') return;
    
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    const { dir } = game.current;

    // Require a minimum swipe distance
    if (Math.abs(dx) > 30 || Math.abs(dy) > 30) {
      if (Math.abs(dx) > Math.abs(dy)) {
        // Horizontal swipe
        if (dx > 0 && dir.x === 0) game.current.nextDir = { x: 1, y: 0 };
        else if (dx < 0 && dir.x === 0) game.current.nextDir = { x: -1, y: 0 };
      } else {
        // Vertical swipe
        if (dy > 0 && dir.y === 0) game.current.nextDir = { x: 0, y: 1 };
        else if (dy < 0 && dir.y === 0) game.current.nextDir = { x: 0, y: -1 };
      }
    }
    touchStart.current = null;
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      <div className="w-full max-w-md p-2 border-2 border-indigo-400/50 rounded-sm">
        <div className="flex items-center justify-between w-full px-6 py-4 bg-gray-950 border-4 border-cyan-400 rounded-xl shadow-[0_0_20px_#22d3ee,inset_0_0_20px_#22d3ee]">
          <div className="flex flex-col">
            <span className="text-cyan-500 text-sm font-mono uppercase tracking-wider mb-1">Score</span>
            <span className="text-2xl font-bold text-white font-mono">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-cyan-500 text-sm font-mono uppercase tracking-wider flex items-center gap-1 mb-1">
              <Trophy className="w-4 h-4" /> High Score
            </span>
            <span className="text-2xl font-bold text-white font-mono">{highScore}</span>
          </div>
        </div>
      </div>

      <div 
        className="relative bg-gray-950 border-4 border-cyan-400 rounded-xl p-1 shadow-[0_0_20px_#22d3ee,inset_0_0_20px_#22d3ee] touch-none"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="bg-gray-900/50 rounded block"
          style={{ 
            width: '100%', 
            maxWidth: '400px',
            aspectRatio: '1/1',
            objectFit: 'contain'
          }}
        />

        {gameState !== 'playing' && (
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-lg z-20">
            {gameState === 'gameover' && (
              <h2 className="text-5xl font-black text-red-500 mb-8 drop-shadow-[0_0_15px_rgba(239,68,68,1)] tracking-widest">GAME OVER</h2>
            )}
            <button 
              onClick={startGame}
              className="flex items-center gap-2 px-8 py-3 bg-cyan-500/20 border-4 border-cyan-400 text-cyan-400 rounded-full hover:bg-cyan-500/40 transition-all shadow-[0_0_30px_#22d3ee,inset_0_0_30px_#22d3ee] font-bold tracking-widest uppercase"
            >
              {gameState === 'gameover' ? <RotateCcw className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              {gameState === 'gameover' ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        )}
      </div>
      
      <div className="text-cyan-400/50 font-mono text-sm flex flex-wrap justify-center gap-4 px-4 text-center">
        <span className="hidden sm:inline">[W/↑] UP</span>
        <span className="hidden sm:inline">[S/↓] DOWN</span>
        <span className="hidden sm:inline">[A/←] LEFT</span>
        <span className="hidden sm:inline">[D/→] RIGHT</span>
        <span className="sm:hidden">SWIPE TO MOVE</span>
      </div>
    </div>
  );
}
