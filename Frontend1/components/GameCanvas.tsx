'use client';

import { useState, useEffect, useRef, MouseEvent } from 'react';
import { useRouter } from 'next/navigation';
import { startGame, checkCoordinate } from '@/lib/api';
import TargetBox from './TargetBox';
import LeaderboardModal from './LeaderboardModal';

interface Character {
  id: number;
  name: string;
}

interface Marker {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  correct: boolean;
}

export default function GameCanvas({ image }: { image: any }) {
  const router = useRouter();
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Game State
  const [gameId, setGameId] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime, setStartTime] = useState<number>(0);
  const [elapsed, setElapsed] = useState(0);
  
  // Interaction State
  const [menuPos, setMenuPos] = useState<{ x: number; y: number; normX: number; normY: number } | null>(null);
  const [markers, setMarkers] = useState<Marker[]>([]);
  const [foundChars, setFoundChars] = useState<Set<number>>(new Set());
  const [gameOver, setGameOver] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Initialize Game on Mount
  useEffect(() => {
    const init = async () => {
      try {
        const g = await startGame(image.id);
        setGameId(g.id);
        setStartTime(Date.now());
        setIsPlaying(true);
      } catch (e) {
        console.error("Failed to start game", e);
      }
    };
    init();
  }, [image.id]);

  // Timer Effect
  useEffect(() => {
    if (!isPlaying || gameOver) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, gameOver, startTime]);

  // Handle Image Click
  const handleImageClick = (e: MouseEvent<HTMLDivElement>) => {
    if (gameOver || !imgRef.current) return;

    // If menu is open, close it (click away)
    if (menuPos) {
      setMenuPos(null);
      return;
    }

    const rect = imgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Normalize coordinates (0 to 1) so screen size doesn't matter
    const normX = x / rect.width;
    const normY = y / rect.height;

    setMenuPos({ x, y, normX, normY });
  };

  // Handle Character Selection from Dropdown
  const handleSelect = async (charId: number) => {
    if (!gameId || !menuPos) return;

    const currentMenuPos = menuPos; 
    setMenuPos(null); // hide menu immediately

    try {
      const res = await checkCoordinate(gameId, currentMenuPos.normX, currentMenuPos.normY, charId);

      if (res.correct) {
        setFeedback({ msg: `Found It!`, type: 'success' });
        
        // Add marker using the NORMALIZED coordinates from the server or our click
        // Using the click coordinates ensures the marker stays exactly where user clicked
        setMarkers(prev => [...prev, { x: currentMenuPos.normX, y: currentMenuPos.normY, correct: true }]);
        setFoundChars(prev => new Set(prev).add(charId));

        if (res.remaining === 0) {
            handleGameOver();
        }
      } else {
        if(res.alreadyFound) {
             setFeedback({ msg: "Already found that one!", type: 'error' });
        } else {
            setFeedback({ msg: "Nope, try again.", type: 'error' });
        }
      }

      // Clear feedback after 2s
      setTimeout(() => setFeedback(null), 2000);

    } catch (e) {
      console.error(e);
    }
  };

  const handleGameOver = () => {
    setGameOver(true);
    setIsPlaying(false);
    setShowModal(true);
  };

  const handleTimeFormat = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  return (
    <>
      {/* Header / HUD */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-zinc-950/80 backdrop-blur-md border-b border-zinc-800 p-4 flex justify-between items-center h-16">
        <button onClick={() => router.push('/')} className="text-zinc-400 hover:text-white transition font-medium">
          &larr; Back
        </button>
        
        {/* Character List */}
        <div className="flex gap-4 items-center">
          {image.characters.map((char: Character) => (
            <div 
              key={char.id} 
              className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-500
                ${foundChars.has(char.id) 
                  ? 'bg-emerald-500/20 text-emerald-400 line-through opacity-50' 
                  : 'bg-zinc-800 text-zinc-200 shadow-sm'
                }`}
            >
              {char.name}
            </div>
          ))}
        </div>

        {/* Timer */}
        <div className="font-mono text-xl font-bold text-blue-400 w-20 text-right">
          {handleTimeFormat(elapsed)}
        </div>
      </nav>

      {/* Main Game Area */}
      <div className="flex-1 overflow-auto bg-zinc-900 pt-16 flex justify-center items-start min-h-screen cursor-crosshair">
        <div className="relative inline-block" onClick={handleImageClick}>
          
          {/* --- UPDATED IMAGE TAG --- */}
          <img 
            ref={imgRef}
            src={`/${image.filename}`}
            alt="Find the characters" 
            className="max-w-full h-auto block select-none shadow-2xl"
            draggable={false}
          />

          {/* Feedback Toast (Floating) */}
          {feedback && (
            <div className={`fixed top-24 left-1/2 -translate-x-1/2 px-6 py-2 rounded-full shadow-2xl backdrop-blur-md text-white font-bold animate-pop z-50 pointer-events-none 
              ${feedback.type === 'success' ? 'bg-emerald-500/90' : 'bg-red-500/90'}`}>
              {feedback.msg}
            </div>
          )}

          {/* Correct Markers */}
          {markers.map((m, i) => (
            <div
              key={i}
              className="absolute w-12 h-12 border-4 border-emerald-400 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_15px_rgba(52,211,153,0.8)] animate-pop"
              style={{ left: `${m.x * 100}%`, top: `${m.y * 100}%`, pointerEvents: 'none' }}
            />
          ))}

          {/* Targeting Box & Dropdown */}
          {menuPos && (
            <TargetBox 
              x={menuPos.x} 
              y={menuPos.y} 
              characters={image.characters} 
              foundChars={foundChars}
              onSelect={handleSelect} 
            />
          )}
        </div>
      </div>

      {/* Game Over Modal */}
      {showModal && gameId && (
        <LeaderboardModal 
          gameId={gameId} 
          imageId={image.id}
          finalTime={elapsed} 
          onClose={() => router.push('/')}
        />
      )}
    </>
  );
}