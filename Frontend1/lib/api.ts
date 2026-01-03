const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

export async function fetchImages() {
  const res = await fetch(`${API_URL}/images`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch images');
  return res.json();
}

export async function fetchGameImage(id: number) {
  const res = await fetch(`${API_URL}/images/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch image details');
  return res.json();
}

export async function startGame(imageId: number) {
  const res = await fetch(`${API_URL}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ imageId }),
  });
  return res.json();
}

export async function checkCoordinate(gameId: number, x: number, y: number, charId: number) {
  const res = await fetch(`${API_URL}/games/${gameId}/check`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ x, y, charId }),
  });
  return res.json();
}

export async function finishGame(gameId: number, playerName: string) {
  const res = await fetch(`${API_URL}/games/${gameId}/finish`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ playerName }),
  });
  return res.json();
}

export async function fetchLeaderboard(imageId: number) {
  const res = await fetch(`${API_URL}/leaderboard/${imageId}`, { cache: 'no-store' });
  return res.json();
}