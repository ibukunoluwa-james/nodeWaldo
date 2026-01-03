'use client';
import { useState, useEffect } from 'react';
import { finishGame, fetchLeaderboard } from '@/lib/api';

export default function LeaderboardModal({ gameId, imageId, finalTime, onClose }: any) {
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [scores, setScores] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await finishGame(gameId, name);
    setSubmitted(true);
    refreshLeaderboard();
  };

  const refreshLeaderboard = async () => {
    const data = await fetchLeaderboard(imageId);
    setScores(data);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-900 border border-zinc-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-pop">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-emerald-600 p-6 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Level Complete!</h2>
          <p className="text-blue-100 font-mono text-xl">Time: {finalTime}s</p>
        </div>

        <div className="p-6">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <label className="block text-sm font-medium text-zinc-400">Enter your name for the records:</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Anonymous Hunter"
                autoFocus
              />
              <button 
                type="submit" 
                className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-zinc-200 transition"
              >
                Submit Score
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <h3 className="font-bold text-lg text-white border-b border-zinc-800 pb-2">High Scores</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {scores.map((s, i) => (
                  <div key={s.id} className={`flex justify-between items-center text-sm p-2 rounded ${s.id === gameId ? 'bg-blue-500/20 border border-blue-500/50' : 'bg-zinc-800/50'}`}>
                    <div className="flex gap-3">
                        <span className="text-zinc-500 w-4 font-mono">{i + 1}.</span>
                        <span className="text-zinc-200">{s.playerName || 'Anonymous'}</span>
                    </div>
                    <span className="font-mono text-emerald-400">{(s.timeMs / 1000).toFixed(1)}s</span>
                  </div>
                ))}
              </div>
              <button onClick={onClose} className="w-full mt-4 bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg transition">
                Back to Menu
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}